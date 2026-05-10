const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Cleanup ---');
  
  try {
    // 1. Delete dependent tables first
    console.log('Clearing Audit Logs...');
    await prisma.auditLog.deleteMany({});
    
    console.log('Clearing Notifications...');
    await prisma.notification.deleteMany({});
    
    console.log('Clearing Repayments...');
    await prisma.repayment.deleteMany({});
    
    console.log('Clearing Installments...');
    await prisma.installment.deleteMany({});
    
    // 2. Delete main entity tables
    console.log('Clearing Loans...');
    await prisma.loan.deleteMany({});
    
    console.log('Clearing Customers...');
    await prisma.customer.deleteMany({});
    
    // 3. Delete independent tables
    console.log('Clearing Expenses...');
    await prisma.expense.deleteMany({});
    
    console.log('Clearing Investments...');
    await prisma.investment.deleteMany({});
    
    console.log('Clearing Holidays...');
    await prisma.holiday.deleteMany({});
    
    console.log('Clearing Settings...');
    await prisma.setting.deleteMany({});

    console.log('\n✅ DATABASE CLEARED SUCCESSFULLY (Users preserved)');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
