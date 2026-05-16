const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const customer = await prisma.customer.findFirst({
    where: { name: { contains: 'musthafa', mode: 'insensitive' } },
    include: { loans: { include: { repayments: true } } }
  });

  if (customer) {
    console.log('Customer:', customer.name);
    for (const l of customer.loans) {
      const totalPaidRes = await prisma.repayment.aggregate({
        where: { 
          loanId: l.id, 
          paymentType: { notIn: ['PENALTY_SETTLEMENT', 'UPFRONT_INTEREST'] } 
        },
        _sum: { amount: true }
      });
      console.log(`Loan ID: ${l.id}`);
      console.log(`  Amount: ${l.amount}`);
      console.log(`  Total Paid (Database Field): ₹${l.totalPaid}`);
      console.log(`  Total Paid (Calculated for Customer): ₹${totalPaidRes._sum.amount || 0}`);
      
      const inv = await prisma.investment.findFirst({
        where: { 
          type: 'PROFIT',
          description: { contains: l.id } 
        }
      });
      console.log(`  System Profit Record found: ${inv ? 'YES (₹' + inv.amount + ')' : 'NO'}`);
    }
  } else {
    console.log('Customer not found');
  }
}

verify().finally(() => prisma.$disconnect());
