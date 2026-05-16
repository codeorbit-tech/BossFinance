const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- Database Integrity Check: Total Paid vs Repayments ---');
  
  const loans = await prisma.loan.findMany({
    include: {
      repayments: {
        where: {
          status: 'SUCCESS',
          paymentType: { notIn: ['PENALTY_SETTLEMENT', 'UPFRONT_INTEREST'] }
        }
      }
    }
  });

  let discrepancies = 0;
  let fixedCount = 0;

  for (const loan of loans) {
    const actualSum = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
    const fieldVal = loan.totalPaid;

    if (Math.abs(actualSum - fieldVal) > 0.01) {
      discrepancies++;
      console.log(`Loan ID: ${loan.id} (${loan.customerId})`);
      console.log(`  - Field says: ${fieldVal}`);
      console.log(`  - Actual sum of EMIs: ${actualSum}`);
      
      // Auto-fix
      await prisma.loan.update({
        where: { id: loan.id },
        data: { totalPaid: actualSum }
      });
      fixedCount++;
    }
  }

  console.log(`\nCheck Complete.`);
  console.log(`Total Loans Checked: ${loans.length}`);
  console.log(`Discrepancies Found: ${discrepancies}`);
  console.log(`Discrepancies Fixed: ${fixedCount}`);
  
  await prisma.$disconnect();
}

verify();
