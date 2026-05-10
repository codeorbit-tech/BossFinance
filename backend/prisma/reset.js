const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all business data from Boss Finance database...\n');

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

  // Delete all users then recreate admin + employee
  await prisma.user.deleteMany();
  console.log('  ✓ Users cleared');

  // Re-create the two system accounts so you can log in
  const adminHash    = await bcrypt.hash('admin123', 12);
  const employeeHash = await bcrypt.hash('employee123', 12);

  await prisma.user.create({
    data: {
      username: 'admin',
      password: adminHash,
      name: 'Admin',
      role: 'ADMIN',
      email: 'admin@bossfinance.in',
      phone: null,
    },
  });

  await prisma.user.create({
    data: {
      username: 'employee',
      password: employeeHash,
      name: 'Employee',
      role: 'EMPLOYEE',
      email: 'employee@bossfinance.in',
      phone: null,
    },
  });

  console.log('\n✅ Database is now clean and ready for fresh data.\n');
  console.log('🔑 Login credentials:');
  console.log('   Admin    → username: admin     | password: admin123');
  console.log('   Employee → username: employee  | password: employee123');
}

main()
  .catch((err) => {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
