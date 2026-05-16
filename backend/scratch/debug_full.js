const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.customer.findFirst({ 
    where: { name: { contains: 'musthafa', mode: 'insensitive' } }, 
    include: { loans: { include: { repayments: true } } } 
  });
  console.log(JSON.stringify(c, null, 2));
}

check().finally(() => prisma.$disconnect());
