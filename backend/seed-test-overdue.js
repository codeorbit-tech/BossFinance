const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating manual test data for overdue loan...');
  try {
    const c = await prisma.customer.create({
      data: {
        customerId: 'TEST-OVERDUE-UI',
        name: 'Late Payer Test',
        phone: '000000',
        createdById: null
      }
    });

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0,0,0,0);

    const loan = await prisma.loan.create({
      data: {
        customerId: c.id,
        loanType: 'PERSONAL',
        amount: 5000,
        tenure: 1,
        interestRate: 0,
        emi: 5000,
        frequency: 'MONTHLY',
        status: 'ACTIVE',
        disbursedAt: new Date(Date.now() - 15 * 86400000)
      }
    });

    await prisma.installment.create({
      data: {
        loanId: loan.id,
        installmentNumber: 1,
        dueDate: fiveDaysAgo,
        expectedAmount: 5000,
        status: 'UPCOMING',
        totalRemaining: 5000,
        balanceAfterPayment: 5000
      }
    });

    console.log('✅ Manual test data created successfully!');
  } catch (err) {
    console.error('FAILED to create test data:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
