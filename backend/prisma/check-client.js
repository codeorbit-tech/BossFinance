const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('Testing prisma.investment access...');
    if (!prisma.investment) {
      console.error('❌ CRITICAL: prisma.investment is UNDEFINED. The Prisma client must be regenerated.');
    } else {
      console.log('✅ prisma.investment is defined.');
    }
  } catch (err) {
    console.error('ERROR during check:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
