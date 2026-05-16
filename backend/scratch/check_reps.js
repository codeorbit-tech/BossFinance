const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const reps = await prisma.repayment.findMany({ 
    where: { loanId: 'cmp5oysj90003p7fztgtpk8go' } 
  });
  console.log(JSON.stringify(reps, null, 2));
}

check().finally(() => prisma.$disconnect());
