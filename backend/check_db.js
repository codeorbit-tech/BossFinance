const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.customer.count();
  const l = await prisma.loan.count();
  const lastLoan = await prisma.loan.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log(`Customers: ${c}, Loans: ${l}`);
  if (lastLoan) {
    console.log('Last loan createdAt:', lastLoan.createdAt);
  }
}

check().finally(() => prisma.$disconnect());
