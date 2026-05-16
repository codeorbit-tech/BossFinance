const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

router.get('/dashboard', authenticate, authorize('ADMIN'), async (req, res) => {
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
        where: { 
          paidAt: { gte: startDate, lte: now },
          paymentType: { not: 'UPFRONT_INTEREST' }
        },
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
      // NPA Count (Filtered by frequency if specified)
      prisma.loan.count({ 
        where: { 
          status: 'NPA',
          ...(period && { frequency: period.toUpperCase() })
        } 
      })
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

router.get('/expense-tracker', authenticate, authorize('ADMIN'), async (req, res) => {
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

router.get('/employee/activity', authenticate, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const loans = await prisma.loan.findMany({
      where: { createdById: employeeId },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { customer: { select: { name: true, customerId: true } } }
    });

    const activities = loans.map(l => ({
      id: `loan-${l.id}`,
      action: l.status === 'ACTIVE' ? 'Loan approved' : l.status === 'QUERIED' ? 'Query received' : 'Application updated',
      customer: `${l.customer.name} (${l.customer.customerId})`,
      time: l.updatedAt,
      icon: l.status === 'ACTIVE' ? 'check_circle' : l.status === 'QUERIED' ? 'help' : 'description',
      color: l.status === 'ACTIVE' ? 'text-accent' : l.status === 'QUERIED' ? 'text-blue-600' : 'text-tertiary',
      status: l.status
    }));

    res.json(activities);
  } catch (err) {
    console.error('Employee activity error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/employee/today-collection', authenticate, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    // For Weekly: current week (Sunday to Saturday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23,59,59,999);

    // For Monthly: current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [installments, repayments] = await Promise.all([
      prisma.installment.findMany({
        where: { 
          dueDate: { gte: monthStart, lte: monthEnd },
          loan: { createdById: employeeId }
        },
        include: {
          loan: {
            include: { customer: { select: { name: true, customerId: true } } }
          }
        },
        orderBy: { dueDate: 'asc' }
      }),
      prisma.repayment.findMany({
        where: { 
          paidAt: { gte: monthStart, lte: monthEnd }, 
          status: 'SUCCESS',
          loan: { createdById: employeeId },
          paymentType: { not: 'UPFRONT_INTEREST' }
        },
        include: { loan: { select: { frequency: true } } }
      })
    ]);

    const summary = {
      DAILY: { expected: 0, received: 0, remaining: 0, customers: [] },
      WEEKLY: { expected: 0, received: 0, remaining: 0, customers: [] },
      MONTHLY: { expected: 0, received: 0, remaining: 0, customers: [] }
    };

    // 1. DAILY TAB: Installments due TODAY for DAILY customers
    installments.filter(i => i.loan.frequency === 'DAILY' && i.dueDate >= todayStart && i.dueDate <= todayEnd).forEach(inst => {
      summary.DAILY.expected += inst.expectedAmount;
      summary.DAILY.remaining += Math.max(0, inst.expectedAmount - inst.amountPaid);
      summary.DAILY.customers.push({
        id: inst.id, loanId: inst.loan.id, customerId: inst.loan.customer.customerId,
        customerName: inst.loan.customer.name, amountDue: inst.expectedAmount,
        amountPaid: inst.amountPaid, remaining: Math.max(0, inst.expectedAmount - inst.amountPaid),
        status: inst.status
      });
    });
    repayments.filter(r => r.loan?.frequency === 'DAILY' && r.paidAt >= todayStart && r.paidAt <= todayEnd).forEach(rep => {
      summary.DAILY.received += rep.amount;
    });

    // 2. WEEKLY TAB: Installments due THIS WEEK for WEEKLY customers
    installments.filter(i => i.loan.frequency === 'WEEKLY' && i.dueDate >= weekStart && i.dueDate <= weekEnd).forEach(inst => {
      summary.WEEKLY.expected += inst.expectedAmount;
      summary.WEEKLY.remaining += Math.max(0, inst.expectedAmount - inst.amountPaid);
      if (inst.dueDate >= todayStart && inst.dueDate <= todayEnd) {
        summary.WEEKLY.customers.push({
          id: inst.id, loanId: inst.loan.id, customerId: inst.loan.customer.customerId,
          customerName: inst.loan.customer.name, amountDue: inst.expectedAmount,
          amountPaid: inst.amountPaid, remaining: Math.max(0, inst.expectedAmount - inst.amountPaid),
          status: inst.status
        });
      }
    });
    repayments.filter(r => r.loan?.frequency === 'WEEKLY' && r.paidAt >= weekStart && r.paidAt <= weekEnd).forEach(rep => {
      summary.WEEKLY.received += rep.amount;
    });

    // 3. MONTHLY TAB: Installments due THIS MONTH for MONTHLY customers
    installments.filter(i => i.loan.frequency === 'MONTHLY' && i.dueDate >= monthStart && i.dueDate <= monthEnd).forEach(inst => {
      summary.MONTHLY.expected += inst.expectedAmount;
      summary.MONTHLY.remaining += Math.max(0, inst.expectedAmount - inst.amountPaid);
      if (inst.dueDate >= todayStart && inst.dueDate <= todayEnd) {
        summary.MONTHLY.customers.push({
          id: inst.id, loanId: inst.loan.id, customerId: inst.loan.customer.customerId,
          customerName: inst.loan.customer.name, amountDue: inst.expectedAmount,
          amountPaid: inst.amountPaid, remaining: Math.max(0, inst.expectedAmount - inst.amountPaid),
          status: inst.status
        });
      }
    });
    repayments.filter(r => r.loan?.frequency === 'MONTHLY' && r.paidAt >= monthStart && r.paidAt <= monthEnd).forEach(rep => {
      summary.MONTHLY.received += rep.amount;
    });

    res.json(summary);
  } catch (err) {
    console.error('Today collection error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/activity', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { customer: { select: { name: true, customerId: true } } }
    });

    const repayments = await prisma.repayment.findMany({
      where: { paymentType: { not: 'UPFRONT_INTEREST' } },
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

router.get('/profit-breakdown', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { frequency } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const whereRepayment = {
      status: 'SUCCESS',
      paidAt: { gte: startOfMonth },
      ...(frequency && { loan: { frequency } })
    };

    const whereExpense = {
      date: { gte: startOfMonth },
      ...(frequency && (frequency === 'MONTHLY' ? {} : { period: frequency })) 
    };

    const [repayments, expensesSum, investmentsRes, razorpayIncomeRes] = await Promise.all([
      prisma.repayment.findMany({
        where: { 
          ...whereRepayment,
          paymentType: { not: 'UPFRONT_INTEREST' } 
        },
        select: {
          interestComponent: true,
          penaltyComponent: true,
          principalComponent: true,
          amount: true
        }
      }),
      prisma.expense.aggregate({
        where: whereExpense,
        _sum: { amount: true }
      }),
      prisma.investment.aggregate({
        where: { date: { gte: startOfMonth }, type: 'PROFIT' },
        _sum: { amount: true }
      }),
      prisma.repayment.aggregate({
        where: { ...whereRepayment, method: { in: ['ONLINE', 'UPI'] } },
        _sum: { amount: true }
      })
    ]);

    const stats = repayments.reduce((acc, r) => {
      acc.interest += r.interestComponent || 0;
      acc.penalty += r.penaltyComponent || 0;
      acc.principal += r.principalComponent || 0;
      acc.totalCollected += r.amount;
      return acc;
    }, { interest: 0, penalty: 0, principal: 0, totalCollected: 0 });

    const manualExpenses = expensesSum._sum.amount || 0;
    const razorpayFees = (razorpayIncomeRes._sum.amount || 0) * 0.01;
    const totalExpenses = manualExpenses + razorpayFees;
    const investmentProfit = investmentsRes._sum.amount || 0;
    
    // Profit = (Interest + Penalty + InvestmentProfit) - TotalExpenses
    const netProfit = (stats.interest + stats.penalty + investmentProfit) - totalExpenses;

    res.json({
      interest: stats.interest,
      penalty: stats.penalty,
      principal: stats.principal,
      investmentProfit,
      totalCollected: stats.totalCollected,
      expenses: totalExpenses,
      manualExpenses,
      razorpayFees,
      netProfit,
      breakdown: [
        { label: 'Interest Income', value: stats.interest, color: 'text-accent', icon: 'trending_up' },
        { label: 'Penalty Income', value: stats.penalty, color: 'text-amber-600', icon: 'warning' },
        { label: 'Investment Profit', value: investmentProfit, color: 'text-blue-500', icon: 'currency_rupee' },
        { label: 'Collection (Principal)', value: stats.principal, color: 'text-on-surface-variant', icon: 'account_balance_wallet' },
        { label: 'Manual Expenses', value: manualExpenses, color: 'text-error', icon: 'payments' },
        { label: 'Razorpay Charges (1%)', value: razorpayFees, color: 'text-error', icon: 'payments' },
      ]
    });
  } catch (err) {
    console.error('Profit breakdown error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/today-collection', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    // For Weekly: current week (Sunday to Saturday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23,59,59,999);

    // For Monthly: current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [installments, repayments] = await Promise.all([
      prisma.installment.findMany({
        where: { dueDate: { gte: monthStart, lte: monthEnd } },
        include: {
          loan: {
            include: { customer: { select: { name: true, customerId: true } } }
          }
        },
        orderBy: { dueDate: 'asc' }
      }),
      prisma.repayment.findMany({
        where: { 
          paidAt: { gte: monthStart, lte: monthEnd }, 
          status: 'SUCCESS',
          paymentType: { not: 'UPFRONT_INTEREST' }
        },
        include: { loan: { select: { frequency: true } } }
      })
    ]);

    const summary = {
      DAILY: { expected: 0, received: 0, remaining: 0, customers: [] },
      WEEKLY: { expected: 0, received: 0, remaining: 0, customers: [] },
      MONTHLY: { expected: 0, received: 0, remaining: 0, customers: [] }
    };

    // 1. DAILY TAB: Installments due TODAY for DAILY customers
    installments.filter(i => i.loan.frequency === 'DAILY' && i.dueDate >= todayStart && i.dueDate <= todayEnd).forEach(inst => {
      summary.DAILY.expected += inst.expectedAmount;
      summary.DAILY.remaining += Math.max(0, inst.expectedAmount - inst.amountPaid);
      summary.DAILY.customers.push({
        id: inst.id, loanId: inst.loan.id, customerId: inst.loan.customer.customerId,
        customerName: inst.loan.customer.name, amountDue: inst.expectedAmount,
        amountPaid: inst.amountPaid, remaining: Math.max(0, inst.expectedAmount - inst.amountPaid),
        status: inst.status
      });
    });
    repayments.filter(r => r.loan?.frequency === 'DAILY' && r.paidAt >= todayStart && r.paidAt <= todayEnd).forEach(rep => {
      summary.DAILY.received += rep.amount;
    });

    // 2. WEEKLY TAB: Installments due THIS WEEK for WEEKLY customers
    installments.filter(i => i.loan.frequency === 'WEEKLY' && i.dueDate >= weekStart && i.dueDate <= weekEnd).forEach(inst => {
      summary.WEEKLY.expected += inst.expectedAmount;
      summary.WEEKLY.remaining += Math.max(0, inst.expectedAmount - inst.amountPaid);
      // Only show today's ones in the list to keep it manageable
      if (inst.dueDate >= todayStart && inst.dueDate <= todayEnd) {
        summary.WEEKLY.customers.push({
          id: inst.id, loanId: inst.loan.id, customerId: inst.loan.customer.customerId,
          customerName: inst.loan.customer.name, amountDue: inst.expectedAmount,
          amountPaid: inst.amountPaid, remaining: Math.max(0, inst.expectedAmount - inst.amountPaid),
          status: inst.status
        });
      }
    });
    repayments.filter(r => r.loan?.frequency === 'WEEKLY' && r.paidAt >= weekStart && r.paidAt <= weekEnd).forEach(rep => {
      summary.WEEKLY.received += rep.amount;
    });

    // 3. MONTHLY TAB: Installments due THIS MONTH for MONTHLY customers
    installments.filter(i => i.loan.frequency === 'MONTHLY' && i.dueDate >= monthStart && i.dueDate <= monthEnd).forEach(inst => {
      summary.MONTHLY.expected += inst.expectedAmount;
      summary.MONTHLY.remaining += Math.max(0, inst.expectedAmount - inst.amountPaid);
      // Only show today's ones in the list to keep it manageable
      if (inst.dueDate >= todayStart && inst.dueDate <= todayEnd) {
        summary.MONTHLY.customers.push({
          id: inst.id, loanId: inst.loan.id, customerId: inst.loan.customer.customerId,
          customerName: inst.loan.customer.name, amountDue: inst.expectedAmount,
          amountPaid: inst.amountPaid, remaining: Math.max(0, inst.expectedAmount - inst.amountPaid),
          status: inst.status
        });
      }
    });
    repayments.filter(r => r.loan?.frequency === 'MONTHLY' && r.paidAt >= monthStart && r.paidAt <= monthEnd).forEach(rep => {
      summary.MONTHLY.received += rep.amount;
    });

    res.json(summary);
  } catch (err) {
    console.error('Admin today collection error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
