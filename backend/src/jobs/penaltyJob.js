const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Penalty Calculation Logic
 * Runs daily to add penalties to overdue installments.
 * Formula: penalInterest += (Days Overdue) * PenaltyRate
 * Standard rate is ₹2 per day as requested.
 */
async function processPenalties() {
  console.log('[PenaltyJob] Starting daily penalty check...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Find all installments that are past due and not fully paid
    const overdueInstallments = await prisma.installment.findMany({
      where: {
        dueDate: { lt: today },
        status: { in: ['UPCOMING', 'PARTIAL', 'OVERDUE'] }
      }
    });

    console.log(`[PenaltyJob] Found ${overdueInstallments.length} potential overdue installments.`);

    for (const inst of overdueInstallments) {
      // Reference date for calculation
      const referenceDate = inst.lastPenaltyUpdate ? new Date(inst.lastPenaltyUpdate) : new Date(inst.dueDate);
      referenceDate.setHours(0, 0, 0, 0);

      // Diff in days
      const diffMs = today.getTime() - referenceDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        // Compound 3% daily on the outstanding amount (EMI remaining + unpaid penalty)
        const penaltyRate = 0.03;
        const currentPrincipal = (inst.totalRemaining || 0) + (inst.penalInterest || 0) - (inst.penaltyPaid || 0);
        const newPrincipal = currentPrincipal * Math.pow(1 + penaltyRate, diffDays);
        const addedPenalty = newPrincipal - currentPrincipal;
        const newPenalInterest = (inst.penalInterest || 0) + addedPenalty;

        await prisma.installment.update({
          where: { id: inst.id },
          data: {
            penalInterest: newPenalInterest,
            status: inst.totalRemaining <= 0 ? 'PAID' : 'OVERDUE',
            lastPenaltyUpdate: today
          }
        });
        
        console.log(`[PenaltyJob] Updated Inst #${inst.id}: +₹${addedPenalty.toFixed(2)} penalty (3% compound). Total penalty: ₹${newPenalInterest.toFixed(2)}`);
      }
    }

    console.log('[PenaltyJob] Penalty check completed.');
  } catch (err) {
    console.error('[PenaltyJob] ERROR:', err);
  }
}

/**
 * Initialize Scheduler
 * Runs every day at 00:01
 */
function initPenaltyJob() {
  // '1 0 * * *' = 12:01 AM every day
  cron.schedule('1 0 * * *', () => {
    processPenalties();
  });
  
  // Run once on startup to catch up any missed penalties
  processPenalties();
}

module.exports = { initPenaltyJob, processPenalties };
