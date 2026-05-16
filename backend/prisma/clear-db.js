const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all data from Boss Finance database (preserving login credentials)...\n');

  try {
    // Delete in dependency order (children first)
    await prisma.auditLog.deleteMany();
    console.log('  ✓ Audit logs cleared');

    await prisma.installment.deleteMany();
    console.log('  ✓ Installments cleared');

    await prisma.repayment.deleteMany();
    console.log('  ✓ Repayments cleared');

    await prisma.notification.deleteMany();
    console.log('  ✓ Notifications cleared');

    await prisma.loan.deleteMany();
    console.log('  ✓ Loans cleared');

    await prisma.customer.deleteMany();
    console.log('  ✓ Customers cleared');

    await prisma.expense.deleteMany();
    console.log('  ✓ Expenses cleared');

    await prisma.holiday.deleteMany();
    console.log('  ✓ Holidays cleared');

    await prisma.setting.deleteMany();
    console.log('  ✓ Settings cleared');

    await prisma.investment.deleteMany();
    console.log('  ✓ Investments cleared');

    console.log('\n✅ Database is now clean. Login credentials (Users) have been preserved.\n');
  } catch (error) {
    console.error('❌ Deletion failed:', error);
  }
}

main()
  .catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
