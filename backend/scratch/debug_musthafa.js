const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { name: { contains: 'musthafa', mode: 'insensitive' } },
    include: {
      loans: {
        include: {
          repayments: true
        }
      }
    }
  });

  if (customer) {
    console.log('Found Customer:', customer.name);
    customer.loans.forEach(loan => {
      console.log(`Loan ID: ${loan.id}`);
      console.log(`  Amount: ${loan.amount}`);
      console.log(`  Total Paid (DB field): ${loan.totalPaid}`);
      console.log(`  Current Balance: ${loan.currentBalance}`);
      loan.repayments.forEach(r => {
        console.log(`  Repayment: ₹${r.amount} - Type: ${r.paymentType} - Date: ${r.paidAt}`);
      });
    });
  } else {
    console.log('Customer Musthafa not found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
