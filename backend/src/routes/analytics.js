const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') startDate.setHours(0, 0, 0, 0);
    else if (period === 'weekly') startDate.setDate(now.getDate() - 7);
    else startDate.setMonth(now.getMonth() - 1);

    const [
      expectedRes,
      actualRes,
      customersCount,
      sanctionedRes,
      totalOutstandingRes,
      overdueCount,
      npaCount
    ] = await Promise.all([
      // Expected (Installments due in period)
      prisma.installment.aggregate({
        where: { dueDate: { gte: startDate, lte: now } },
        _sum: { expectedAmount: true }
      }),
      // Actual (Payments made in period)
      prisma.repayment.aggregate({
        where: { paidAt: { gte: startDate, lte: now } },
        _sum: { amount: true }
      }),
      // New Customers
      prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
      // Amount Sanctioned
      prisma.loan.aggregate({
        where: { approvedAt: { gte: startDate } },
        _sum: { amount: true }
      }),
      // Outstanding Balance (Total Principal - Total Paid for active loans)
      prisma.loan.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amount: true, totalPaid: true }
      }),
      // Overdue Count
      prisma.loan.count({ where: { status: 'ACTIVE', nextDueDate: { lt: new Date() } } }),
      // NPA Count (Placeholder logic: loans overdue by 90+ days)
      prisma.loan.count({ where: { status: 'NPA' } })
    ]);

    const expected = expectedRes._sum.expectedAmount || 0;
    const actual = actualRes._sum.amount || 0;
    const outstanding = (totalOutstandingRes._sum.amount || 0) - (totalOutstandingRes._sum.totalPaid || 0);

    res.json({
      expected: `₹${expected.toLocaleString()}`,
      actual: `₹${actual.toLocaleString()}`,
      pending: `₹${(expected - actual > 0 ? expected - actual : 0).toLocaleString()}`,
      customers: customersCount,
      sanctioned: `₹${(sanctionedRes._sum.amount || 0).toLocaleString()}`,
      outstanding: `₹${outstanding.toLocaleString()}`,
      overdue: overdueCount,
      npa: npaCount
    });
  } catch (err) {
    console.error('Dashboard analytics error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/expense-tracker', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 1. Summary Stats
    const totalLoans = await prisma.loan.findMany({ where: { status: 'ACTIVE' } });
    const capitalDeployed = totalLoans.reduce((acc, l) => acc + l.amount, 0);
    const capitalRecovered = totalLoans.reduce((acc, l) => acc + l.totalPaid, 0);
    
    const monthlyExpenses = await prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true }
    });
    
    const monthlyIncome = await prisma.repayment.aggregate({
      where: { paidAt: { gte: startOfMonth } },
      _sum: { amount: true }
    });
    
    const expensesTotal = monthlyExpenses._sum.amount || 0;
    const incomeTotal = monthlyIncome._sum.amount || 0;
    const netProfit = incomeTotal - expensesTotal;
    
    // 2. Collection Efficiency (Simplified)
    // Expected = EMIs due this month. Actual = EMIs paid this month.
    const installmentsDue = await prisma.installment.aggregate({
      where: { dueDate: { gte: startOfMonth, lte: now } },
      _sum: { expectedAmount: true }
    });
    const installmentsPaid = await prisma.installment.aggregate({
      where: { dueDate: { gte: startOfMonth, lte: now } },
      _sum: { amountPaid: true }
    });
    
    const expected = installmentsDue._sum.expectedAmount || 1; // avoid div by zero
    const actual = installmentsPaid._sum.amountPaid || 0;
    const efficiency = Math.round((actual / expected) * 100);

    // 3. Chart Data (Last 6 Months)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const inc = await prisma.repayment.aggregate({
        where: { paidAt: { gte: start, lte: end } },
        _sum: { amount: true }
      });
      const exp = await prisma.expense.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { amount: true }
      });
      
      const income = inc._sum.amount || 0;
      const expense = exp._sum.amount || 0;
      
      chartData.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income,
        expense,
        profit: income - expense
      });
    }

    // 4. Loan Type Profit Breakdown
    const loanTypes = ['HOME', 'VEHICLE', 'PERSONAL', 'BUSINESS', 'DAILY'];
    const loanTypeProfit = await Promise.all(loanTypes.map(async (type) => {
      const inc = await prisma.repayment.aggregate({
        where: { loan: { loanType: type } },
        _sum: { amount: true }
      });
      return { name: type, value: inc._sum.amount || 0 };
    }));

    res.json({
      summary: {
        capitalDeployed,
        capitalRecovered,
        recoveryPercentage: capitalDeployed > 0 ? (capitalRecovered / capitalDeployed * 100).toFixed(1) : 0,
        monthlyExpenses: expensesTotal,
        netProfit,
        efficiency,
        activeLoans: totalLoans.length
      },
      chartData,
      loanTypeProfit
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/employee', authenticate, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [customersCount, applications, approvedLoans] = await Promise.all([
      prisma.customer.count({ where: { createdById: employeeId, createdAt: { gte: startOfMonth } } }),
      prisma.loan.findMany({ where: { createdById: employeeId } }),
      prisma.loan.findMany({ where: { createdById: employeeId, status: 'ACTIVE' } }),
    ]);

    const pendingCount = applications.filter(a => a.status === 'PENDING').length;
    const totalApprovedValue = approvedLoans.reduce((acc, l) => acc + l.amount, 0);

    res.json({
      customersCreated: customersCount,
      applicationsSubmitted: applications.length,
      pendingReview: pendingCount,
      approvedCount: approvedLoans.length,
      approvedValue: `₹${totalApprovedValue.toLocaleString()}`
    });
  } catch (err) {
    console.error('Employee analytics error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/activity', authenticate, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { customer: { select: { name: true, customerId: true } } }
    });

    const repayments = await prisma.repayment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { loan: { include: { customer: { select: { name: true, customerId: true } } } } }
    });

    const activities = [
      ...loans.map(l => ({
        id: `loan-${l.id}`,
        action: l.status === 'ACTIVE' ? 'Loan approved' : l.status === 'QUERIED' ? 'Loan queried' : 'Loan application updated',
        customer: `${l.customer.name} (${l.customer.customerId})`,
        time: l.updatedAt,
        icon: l.status === 'ACTIVE' ? 'check_circle' : l.status === 'QUERIED' ? 'help' : 'description',
        color: l.status === 'ACTIVE' ? 'text-accent' : l.status === 'QUERIED' ? 'text-blue-600' : 'text-tertiary'
      })),
      ...repayments.map(r => ({
        id: `pay-${r.id}`,
        action: 'Payment received',
        customer: `${r.loan.customer.name} (${r.loan.customer.customerId})`,
        time: r.createdAt,
        icon: 'payments',
        color: 'text-accent'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    res.json(activities);
  } catch (err) {
    console.error('Activity analytics error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
