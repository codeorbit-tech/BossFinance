const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration for UPFRONT_INTEREST...');

  // 1. Find all UPFRONT_INTEREST repayments
  const upfrontRepayments = await prisma.repayment.findMany({
    where: { paymentType: 'UPFRONT_INTEREST' },
    include: { loan: true }
  });

  console.log(`Found ${upfrontRepayments.length} upfront interest records.`);

  for (const rep of upfrontRepayments) {
    console.log(`Processing repayment for Loan: ${rep.loanId}, Amount: ${rep.amount}`);

    // Check if an investment record already exists for this repayment
    const existingInv = await prisma.investment.findFirst({
      where: {
        type: 'PROFIT',
        amount: rep.amount,
        description: { contains: rep.loanId }
      }
    });

    if (!existingInv) {
      console.log(`  Creating Investment record for ₹${rep.amount}...`);
      await prisma.investment.create({
        data: {
          type: 'PROFIT',
          amount: rep.amount,
          description: `Upfront Interest for Loan ${rep.loanId} (Customer: ${rep.customerId})`,
          date: rep.paidAt
        }
      });
    } else {
      console.log(`  Investment record already exists.`);
    }

    // Ensure loan.totalPaid doesn't include this (if it was somehow added)
    // Actually, in the current system, totalPaid is incremented in repayments.js POST route.
    // Let's check if the current totalPaid on the loan matches repayments EXCLUDING upfront.
    const allRepayments = await prisma.repayment.findMany({
      where: { loanId: rep.loanId, status: 'SUCCESS' }
    });
    
    const customerCapitalPaid = allRepayments
      .filter(r => r.paymentType !== 'UPFRONT_INTEREST' && r.paymentType !== 'PENALTY_SETTLEMENT')
      .reduce((sum, r) => sum + r.amount, 0);

    if (rep.loan.totalPaid !== customerCapitalPaid) {
      console.log(`  Updating loan.totalPaid from ${rep.loan.totalPaid} to ${customerCapitalPaid}`);
      await prisma.loan.update({
        where: { id: rep.loanId },
        data: { totalPaid: customerCapitalPaid }
      });
    }
  }

  console.log('Migration completed.');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
