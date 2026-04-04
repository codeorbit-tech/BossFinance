const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Boss Finance database with Edge Cases...\n');
  
  // Clean up
  await prisma.auditLog.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───
  const adminPassword = await bcrypt.hash('admin123', 12);
  const employeePassword = await bcrypt.hash('employee123', 12);

  const admin = await prisma.user.create({
    data: { username: 'admin', password: adminPassword, name: 'Aditya Varma', role: 'ADMIN', email: 'aditya@bossfinance.in', phone: '+918888877777' },
  });

  const employee = await prisma.user.create({
    data: { username: 'ramesh', password: employeePassword, name: 'Ramesh Kumar', role: 'EMPLOYEE', email: 'ramesh@bossfinance.in', phone: '+919876543210' },
  });

  // ─── Edge Case Customers ───
  // 1. Rajesh Kumar: Standard test customer (Payment History layout)
  const rajesh = await prisma.customer.create({
    data: { 
      customerId: 'BFC-001', name: 'Rajesh Kumar', phone: '+919876500001', address: '12 MG Road', aadhaar: '123456789012', pan: 'ABCDE1234F',
      bankName: 'HDFC', bankAccount: '501002345', bankIfsc: 'HDFC0001', status: 'ACTIVE', createdById: employee.id 
    }
  });

  // Loan for Rajesh: 50,000, 5167/mo (Matches client prompt exactly)
  const rajeshLoan = await prisma.loan.create({
    data: {
      customerId: rajesh.id, loanType: 'PERSONAL', amount: 50000, tenure: 10, emi: 5167, frequency: 'MONTHLY',
      status: 'ACTIVE', approvedAt: new Date('2025-12-01'), disbursedAt: new Date('2025-12-05'),
      collateralDetails: 'Gold chain 10g', createdById: employee.id
    }
  });

  await prisma.installment.createMany({
    data: [
      { loanId: rajeshLoan.id, installmentNumber: 1, dueDate: new Date('2026-01-01'), expectedAmount: 5167, amountPaid: 5167, penalInterest: 0, totalRemaining: 0, balanceAfterPayment: 44833, status: 'PAID', paidAt: new Date('2026-01-01'), method: 'UPI' },
      { loanId: rajeshLoan.id, installmentNumber: 2, dueDate: new Date('2026-02-01'), expectedAmount: 5167, amountPaid: 5167, penalInterest: 0, totalRemaining: 0, balanceAfterPayment: 39666, status: 'PAID', paidAt: new Date('2026-02-01'), method: 'CASH' },
      { loanId: rajeshLoan.id, installmentNumber: 3, dueDate: new Date('2026-03-01'), expectedAmount: 5167, amountPaid: 0, penalInterest: 200, totalRemaining: 5367, balanceAfterPayment: 39666, status: 'OVERDUE' }, // Client explicit test case
      { loanId: rajeshLoan.id, installmentNumber: 4, dueDate: new Date('2026-04-01'), expectedAmount: 5167, amountPaid: 0, penalInterest: 0, totalRemaining: 5167, balanceAfterPayment: 39666, status: 'UPCOMING' },
    ]
  });

  // 2. Foreclosure Customer (Paid early)
  const sunita = await prisma.customer.create({
    data: { customerId: 'BFC-002', name: 'Sunita Iyer', status: 'CLOSED', createdById: employee.id }
  });
  const sunitaLoan = await prisma.loan.create({
    data: { customerId: sunita.id, loanType: 'HOME', amount: 300000, tenure: 36, emi: 10000, status: 'CLOSED', createdById: employee.id }
  });
  await prisma.installment.create({
    data: { loanId: sunitaLoan.id, installmentNumber: 1, dueDate: new Date('2025-05-01'), expectedAmount: 10000, amountPaid: 10000, penalInterest: 0, totalRemaining: 0, balanceAfterPayment: 290000, status: 'PAID', paidAt: new Date('2025-05-01') }
  });
  // Foreclosure logic — massive single payment clears the rest
  await prisma.installment.create({
    data: { loanId: sunitaLoan.id, installmentNumber: 2, dueDate: new Date('2025-06-01'), expectedAmount: 290000, amountPaid: 290000, penalInterest: 0, totalRemaining: 0, balanceAfterPayment: 0, status: 'PAID', paidAt: new Date('2025-05-15'), method: 'BANK_TRANSFER' }
  });

  // 3. Missed 2 Payments Customer
  const arjun = await prisma.customer.create({
    data: { customerId: 'BFC-003', name: 'Arjun Missed', status: 'OVERDUE', createdById: employee.id }
  });
  const arjunLoan = await prisma.loan.create({
    data: { customerId: arjun.id, loanType: 'VEHICLE', amount: 100000, tenure: 12, emi: 9500, status: 'OVERDUE', createdById: employee.id }
  });
  await prisma.installment.createMany({
    data: [
      { loanId: arjunLoan.id, installmentNumber: 1, dueDate: new Date('2026-01-05'), expectedAmount: 9500, amountPaid: 9500, penalInterest: 0, totalRemaining: 0, balanceAfterPayment: 90500, status: 'PAID', paidAt: new Date('2026-01-05') },
      { loanId: arjunLoan.id, installmentNumber: 2, dueDate: new Date('2026-02-05'), expectedAmount: 9500, amountPaid: 0, penalInterest: 500, totalRemaining: 10000, balanceAfterPayment: 90500, status: 'OVERDUE' },
      { loanId: arjunLoan.id, installmentNumber: 3, dueDate: new Date('2026-03-05'), expectedAmount: 9500, amountPaid: 0, penalInterest: 150, totalRemaining: 9650, balanceAfterPayment: 90500, status: 'OVERDUE' },
    ]
  });

  // 4. Daily Loan Customer (25 entries)
  const karan = await prisma.customer.create({
    data: { customerId: 'BFC-004', name: 'Karan Daily', status: 'ACTIVE', createdById: employee.id }
  });
  const karanLoan = await prisma.loan.create({
    data: { customerId: karan.id, loanType: 'DAILY', amount: 12500, tenure: 25, emi: 500, frequency: 'DAILY', status: 'ACTIVE', createdById: employee.id }
  });
  const dailyInstallments = [];
  let dailyBal = 12500;
  for (let i = 1; i <= 25; i++) {
    const isPaid = i <= 20; // 20 days paid, 5 upcoming
    dailyBal -= isPaid ? 500 : 0;
    dailyInstallments.push({
      loanId: karanLoan.id, installmentNumber: i, dueDate: new Date(2026, 2, i), expectedAmount: 500,
      amountPaid: isPaid ? 500 : 0, penalInterest: 0, totalRemaining: isPaid ? 0 : 500, balanceAfterPayment: dailyBal,
      status: isPaid ? 'PAID' : 'UPCOMING', paidAt: isPaid ? new Date(2026, 2, i) : null
    });
  }
  await prisma.installment.createMany({ data: dailyInstallments });

  // 5. Partial Payment Customer
  const meera = await prisma.customer.create({
    data: { customerId: 'BFC-005', name: 'Meera Partial', status: 'ACTIVE', createdById: employee.id }
  });
  const meeraLoan = await prisma.loan.create({
    data: { customerId: meera.id, loanType: 'BUSINESS', amount: 500000, tenure: 24, emi: 25000, status: 'ACTIVE', createdById: employee.id }
  });
  await prisma.installment.create({
    data: { loanId: meeraLoan.id, installmentNumber: 1, dueDate: new Date('2026-02-10'), expectedAmount: 25000, amountPaid: 15000, penalInterest: 0, totalRemaining: 10000, balanceAfterPayment: 485000, status: 'PARTIAL', paidAt: new Date('2026-02-12') }
  });

  // 6. NPA Flagged Customer
  const rohan = await prisma.customer.create({
    data: { customerId: 'BFC-006', name: 'Rohan NPA Defaulter', status: 'NPA', createdById: employee.id }
  });
  const rohanLoan = await prisma.loan.create({
    data: { customerId: rohan.id, loanType: 'PERSONAL', amount: 200000, tenure: 12, emi: 18000, status: 'NPA', createdById: employee.id }
  });
  await prisma.installment.createMany({
    data: [
      { loanId: rohanLoan.id, installmentNumber: 1, dueDate: new Date('2025-10-01'), expectedAmount: 18000, amountPaid: 0, penalInterest: 2500, totalRemaining: 20500, balanceAfterPayment: 200000, status: 'OVERDUE' },
      { loanId: rohanLoan.id, installmentNumber: 2, dueDate: new Date('2025-11-01'), expectedAmount: 18000, amountPaid: 0, penalInterest: 2000, totalRemaining: 20000, balanceAfterPayment: 200000, status: 'OVERDUE' },
      { loanId: rohanLoan.id, installmentNumber: 3, dueDate: new Date('2025-12-01'), expectedAmount: 18000, amountPaid: 0, penalInterest: 1500, totalRemaining: 19500, balanceAfterPayment: 200000, status: 'OVERDUE' },
      { loanId: rohanLoan.id, installmentNumber: 4, dueDate: new Date('2026-01-01'), expectedAmount: 18000, amountPaid: 0, penalInterest: 1000, totalRemaining: 19000, balanceAfterPayment: 200000, status: 'OVERDUE' },
    ]
  });
  
  // Track this exact change in the Audit Log
  await prisma.auditLog.create({
    data: { customerId: rohan.id, field: 'status', oldValue: 'OVERDUE', newValue: 'NPA', changedById: admin.id }
  });

  console.log('✅ Edge Case seeding complete.');
  console.log('Tested scenarios: Foreclosure, Missed 2 Payments, Daily Loan 25 entries, Partial Payment, NPA Tracking.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
