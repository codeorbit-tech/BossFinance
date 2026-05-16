const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMusthafa() {
  const customer = await prisma.customer.findFirst({
    where: { name: { contains: 'Musthafa' } },
    include: {
      loans: {
        include: {
          repayments: true
        }
      }
    }
  });

  if (!customer) {
    console.log('Musthafa not found');
    return;
  }

  console.log('Customer:', customer.name, customer.id);
  for (const loan of customer.loans) {
    console.log('--- Loan ---');
    console.log('ID:', loan.id);
    console.log('Amount:', loan.amount);
    console.log('Total Paid (Field):', loan.totalPaid);
    
    const repayments = loan.repayments;
    console.log('Repayments count:', repayments.length);
    repayments.forEach(r => {
      console.log(`  - Type: ${r.paymentType}, Amount: ${r.amount}, Status: ${r.status}`);
    });

    const calculatedPaid = repayments
      .filter(r => r.paymentType !== 'UPFRONT_INTEREST' && r.paymentType !== 'PENALTY_SETTLEMENT')
      .reduce((sum, r) => sum + r.amount, 0);
    
    console.log('Calculated Paid (Excl. Upfront & Penalty):', calculatedPaid);
  }
}

checkMusthafa()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
