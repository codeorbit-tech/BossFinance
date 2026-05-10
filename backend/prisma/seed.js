const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Boss Finance database with Edge Cases...\n');
  
  // Clean up
  await prisma.auditLog.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.repayment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───
  const adminPassword = await bcrypt.hash('admin123', 12);
  const employeePassword = await bcrypt.hash('employee123', 12);

  const admin = await prisma.user.create({
    data: { username: 'admin', password: adminPassword, name: 'Aditya Varma', role: 'ADMIN', email: 'aditya@bossfinance.in', phone: '+918888877777' },
  });

  const employee = await prisma.user.create({
    data: { username: 'employee', password: employeePassword, name: 'Ramesh Kumar', role: 'EMPLOYEE', email: 'employee@bossfinance.in', phone: '+919876543210' },
  });

  console.log('✅ Base User seeding complete.');
  console.log('NO DUMMY DATA HAS BEEN CREATED. THE SYSTEM IS COMPLETELY EMPTY.');
  console.log('\n📋 Login credentials:');
  console.log('   Admin  → username: admin    | password: admin123');
  console.log('   Staff  → username: employee | password: employee123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
