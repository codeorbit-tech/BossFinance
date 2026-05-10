const { processPenalties } = require('./src/jobs/penaltyJob');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing Penalty Calculation...');

  try {
    // 1. Create a customer
    const customer = await prisma.customer.create({
      data: { customerId: 'TEST-PENALTY', name: 'Penalty Test User', phone: '0000000000', createdById: null }
    });

    // 2. Create a loan (Active)
    const loan = await prisma.loan.create({
      data: {
        customerId: customer.id,
        loanType: 'PERSONAL',
        amount: 1000,
        tenure: 1,
        interestRate: 0,
        emi: 1000,
        frequency: 'MONTHLY',
        status: 'ACTIVE',
        disbursedAt: new Date(Date.now() - 10 * 86400000), // 10 days ago
        createdById: null
      }
    });

    // 3. Create an overdue installment (Due 5 days ago)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);

    const inst = await prisma.installment.create({
      data: {
        loanId: loan.id,
        installmentNumber: 1,
        dueDate: fiveDaysAgo,
        expectedAmount: 1000,
        amountPaid: 0,
        penalInterest: 0,
        totalRemaining: 1000,
        balanceAfterPayment: 1000,
        status: 'UPCOMING'
      }
    });

    console.log(`Original Inst: Due=${fiveDaysAgo.toISOString()}, Penalty=0, Total=1000`);

    // 4. Trigger penalty processing
    await processPenalties();

    // 5. Verify results
    const updatedInst = await prisma.installment.findUnique({ where: { id: inst.id } });
    
    // Day logic: Today (00:00) - 5 days ago (00:00) = 5 days diff.
    // Penalty = 5 days * ₹2 = ₹10.
    console.log('--- Results ---');
    console.log(`Penalty Applied: ₹${updatedInst.penalInterest}`);
    console.log(`Total Remaining: ₹${updatedInst.totalRemaining}`);
    console.log(`Status: ${updatedInst.status}`);

    if (updatedInst.penalInterest === 10 && updatedInst.totalRemaining === 1000) {
      console.log('✅ TEST PASSED: Penalty correctly calculated and kept separate from EMI remaining');
    } else {
      console.log('❌ TEST FAILED: Math mismatch');
    }

    // Cleanup
    await prisma.installment.deleteMany({ where: { loanId: loan.id } });
    await prisma.loan.delete({ where: { id: loan.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    console.log('Cleanup done.');

  } catch (err) {
    console.error('TEST ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
