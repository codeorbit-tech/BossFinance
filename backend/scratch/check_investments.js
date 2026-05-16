const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const investments = await prisma.investment.findMany({
    where: { type: 'PROFIT', amount: 3000 },
    orderBy: { createdAt: 'desc' }
  });

  console.log('Investments found:', JSON.stringify(investments, null, 2));
  process.exit(0);
}

check();
