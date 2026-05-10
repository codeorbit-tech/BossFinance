const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data for Expense Tracker...');

  const user = await prisma.user.findFirst() || { id: null };
  const userId = user.id;

  // 1. Create Customers
  const c1 = await prisma.customer.upsert({
    where: { customerId: 'CUST-DAILY-001' },
    update: {},
    create: { customerId: 'CUST-DAILY-001', name: 'John Doe (Daily)', phone: '9876543210', status: 'NPA' }
  });

  const c2 = await prisma.customer.upsert({
    where: { customerId: 'CUST-WEEKLY-001' },
    update: {},
    create: { customerId: 'CUST-WEEKLY-001', name: 'Jane Smith (Weekly)', phone: '9876543211', status: 'ACTIVE' }
  });

  const c3 = await prisma.customer.upsert({
    where: { customerId: 'CUST-MONTHLY-001' },
    update: {},
    create: { customerId: 'CUST-MONTHLY-001', name: 'Bob Wilson (Monthly)', phone: '9876543212', status: 'ACTIVE' }
  });

  console.log('Customers created.');

  // 2. Create Loans
  const today = new Date();
  const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Daily Loan (NPA)
  const l1 = await prisma.loan.create({
    data: {
      customerId: c1.id,
      loanType: 'PERSONAL',
      amount: 10000,
      tenure: 30,
      interestRate: 0,
      emi: 400,
      frequency: 'DAILY',
      status: 'NPA',
      disbursedAt: lastMonth,
      currentBalance: 8000,
      totalPaid: 2000,
      createdById: userId
    }
  });

  // Weekly Loan (ACTIVE/OVERDUE)
  const l2 = await prisma.loan.create({
    data: {
      customerId: c2.id,
      loanType: 'VEHICLE',
      amount: 50000,
      tenure: 12,
      interestRate: 10,
      emi: 1500,
      frequency: 'WEEKLY',
      status: 'ACTIVE',
      disbursedAt: lastMonth,
      nextDueDate: new Date(today.getTime() - 2 * 86400000), // Overdue by 2 days
      currentBalance: 45000,
      totalPaid: 5000,
      createdById: userId
    }
  });

  // Monthly Loan (ACTIVE)
  const l3 = await prisma.loan.create({
    data: {
      customerId: c3.id,
      loanType: 'BUSINESS',
      amount: 200000,
      tenure: 24,
      interestRate: 12,
      emi: 10000,
      frequency: 'MONTHLY',
      status: 'ACTIVE',
      disbursedAt: lastMonth,
      nextDueDate: new Date(today.getTime() + 15 * 86400000), // Due in 15 days
      currentBalance: 190000,
      totalPaid: 10000,
      createdById: userId
    }
  });

  console.log('Loans created.');

  // 3. Create Installments (to show NPA/Pending)
  // For Daily Loan (NPA)
  const installmentsDaily = [
    {
      loanId: l1.id,
      installmentNumber: 1,
      dueDate: new Date(lastMonth.getTime() + 86400000),
      expectedAmount: 400,
      amountPaid: 400,
      status: 'PAID',
      totalRemaining: 0,
      balanceAfterPayment: 9600
    },
    {
      loanId: l1.id,
      installmentNumber: 2,
      dueDate: new Date(lastMonth.getTime() + 2 * 86400000),
      expectedAmount: 400,
      amountPaid: 0,
      penalInterest: 50,
      status: 'OVERDUE',
      totalRemaining: 450,
      balanceAfterPayment: 9600
    }
  ];

  for (const inst of installmentsDaily) {
    await prisma.installment.create({ data: inst });
  }

  // For Weekly Loan (Pending)
  await prisma.installment.create({
    data: {
      loanId: l2.id,
      installmentNumber: 1,
      dueDate: new Date(today.getTime() - 2 * 86400000),
      expectedAmount: 1500,
      amountPaid: 0,
      penalInterest: 100,
      status: 'OVERDUE',
      totalRemaining: 1600,
      balanceAfterPayment: 45000
    }
  });

  console.log('Installments created.');

  // 4. Create Repayments
  await prisma.repayment.create({
    data: {
      loanId: l1.id, customerId: c1.id, amount: 400, method: 'CASH', paymentType: 'EMI', status: 'SUCCESS', paidAt: lastMonth
    }
  });
  await prisma.repayment.create({
    data: {
      loanId: l2.id, customerId: c2.id, amount: 1500, method: 'CASH', paymentType: 'EMI', status: 'SUCCESS', paidAt: lastMonth
    }
  });

  console.log('Repayments created.');

  // 5. Create Expenses
  const expenses = [
    { date: today, category: 'Stationary / Printing', description: 'Daily Paper', amount: 50, period: 'DAILY' },
    { date: today, category: 'Travel / Collection Expense', description: 'Weekly Fuel', amount: 1000, period: 'WEEKLY' },
    { date: today, category: 'Office Rent', description: 'Monthly Office Rent', amount: 15000, period: 'MONTHLY' },
    { date: today, category: 'Miscellaneous', description: 'One-time Legal fee', amount: 2000, period: 'ONE_TIME' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }

  console.log('Expenses created.');
  console.log('Dummy data seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
