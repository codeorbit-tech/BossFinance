const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing Investment Profit integration...');

  try {
    // 1. Clear existing test investments (optional)
    await prisma.investment.deleteMany({ where: { description: 'TEST_PROFIT' } });

    // 2. Add a profit entry of ₹1000
    console.log('Adding ₹1000 Investment Profit...');
    await prisma.investment.create({
      data: {
        type: 'PROFIT',
        amount: 1000,
        description: 'TEST_PROFIT',
        date: new Date()
      }
    });

    // 3. Check Analytics (Manual check of what the API would do)
    const investmentProfit = await prisma.investment.aggregate({
      where: { type: 'PROFIT' },
      _sum: { amount: true }
    });

    console.log(`Current Total Investment Profit in DB: ${investmentProfit._sum.amount}`);

    if (investmentProfit._sum.amount >= 1000) {
      console.log('✅ Investment profit is correctly stored and aggregateable.');
    } else {
      console.log('❌ Investment profit not found.');
    }

  } catch (err) {
    console.error('TEST ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
