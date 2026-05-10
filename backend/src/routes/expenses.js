const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Helper: parse month/year from query ─────────────────────────────────────
function parseDateRange(month, year) {
  const now = new Date();
  const m = parseInt(month || now.getMonth() + 1);
  const y = parseInt(year || now.getFullYear());
  const start = new Date(y, m - 1, 1);
  const end   = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

// GET /api/expenses/summary — MAIN dashboard stats for expense tracker
router.get('/summary', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { month, year, frequency } = req.query; // frequency: DAILY, WEEKLY, MONTHLY
    const { start, end } = parseDateRange(month, year);
    const now = new Date();

    const repaymentWhere = { paidAt: { gte: start, lte: end }, status: 'SUCCESS' };
    const expenseWhere   = { date: { gte: start, lte: end } };
    const loanWhere      = { status: 'ACTIVE' };

    if (frequency) {
      repaymentWhere.loan = { frequency };
      expenseWhere.period = frequency === 'MONTHLY' ? { in: ['MONTHLY', 'ONE_TIME'] } : frequency;
      loanWhere.frequency = frequency;
    }

    const [incomeRes, expenseRes, activeLoans, capitalRes, investmentProfitRes, razorpayIncomeRes, totalInvestedRes, totalWithdrawnRes, grossProfitRes] = await Promise.all([
      prisma.repayment.aggregate({
        where: repaymentWhere,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.loan.count({ where: loanWhere }),
      prisma.loan.aggregate({
        where: { 
          status: { in: ['ACTIVE', 'CLOSED'] },
          ...(frequency && { frequency })
        },
        _sum: { amount: true, totalPaid: true },
      }),
      prisma.investment.aggregate({
        where: { date: { gte: start, lte: end }, type: 'PROFIT' },
        _sum: { amount: true }
      }),
      prisma.repayment.aggregate({
        where: { ...repaymentWhere, method: { in: ['ONLINE', 'UPI'] } },
        _sum: { amount: true }
      }),
      prisma.investment.aggregate({
        where: { type: 'INVESTMENT' },
        _sum: { amount: true }
      }),
      prisma.investment.aggregate({
        where: { type: 'WITHDRAWAL' },
        _sum: { amount: true }
      }),
      prisma.repayment.aggregate({
        where: repaymentWhere,
        _sum: { interestComponent: true, penaltyComponent: true }
      })
    ]);

    const investmentProfit = investmentProfitRes._sum.amount || 0;
    const income    = (incomeRes._sum.amount || 0) + investmentProfit;
    const manualExpenses = expenseRes._sum.amount || 0;
    const razorpayFees = (razorpayIncomeRes._sum.amount || 0) * 0.01;
    const expenses  = manualExpenses + razorpayFees;
    const capital   = capitalRes._sum.amount   || 0;
    const recovered = capitalRes._sum.totalPaid || 0;
    const totalInvested = totalInvestedRes._sum.amount || 0;
    const totalWithdrawn = totalWithdrawnRes._sum.amount || 0;
    const netBalance = totalInvested - totalWithdrawn;
    const interestEarned = grossProfitRes._sum.interestComponent || 0;
    const penaltyEarned  = grossProfitRes._sum.penaltyComponent  || 0;
    const grossProfit = interestEarned + penaltyEarned + investmentProfit;

    // 6-month rolling chart (filtered by frequency if provided)
    const m = parseInt(month || now.getMonth() + 1);
    const y = parseInt(year  || now.getFullYear());
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d  = new Date(y, m - 1 - i, 1);
      const s  = new Date(d.getFullYear(), d.getMonth(), 1);
      const e  = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const chartRepaymentWhere = { paidAt: { gte: s, lte: e }, status: 'SUCCESS' };
      const chartExpenseWhere   = { date: { gte: s, lte: e } };
      if (frequency) {
        chartRepaymentWhere.loan = { frequency };
        chartExpenseWhere.period = frequency === 'MONTHLY' ? { in: ['MONTHLY', 'ONE_TIME'] } : frequency;
      }

      const incRes = await prisma.repayment.aggregate({ where: chartRepaymentWhere, _sum: { amount: true } });
      const expRes = await prisma.expense.aggregate({ where: chartExpenseWhere, _sum: { amount: true } });
      const rzRes  = await prisma.repayment.aggregate({ 
        where: { ...chartRepaymentWhere, method: { in: ['ONLINE', 'UPI'] } }, 
        _sum: { amount: true } 
      });

      const inc = incRes._sum.amount || 0;
      const rzFees = (rzRes._sum.amount || 0) * 0.01;
      const exp = (expRes._sum.amount || 0) + rzFees;

      chartData.push({
        month: d.toLocaleString('en-IN', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2),
        income:  inc,
        expense: exp,
        profit:  inc - exp,
      });
    }

    // Income by loan type (this month)
    const loanTypes = ['HOME', 'VEHICLE', 'PERSONAL', 'BUSINESS', 'DAILY'];
    const loanTypeProfit = await Promise.all(loanTypes.map(async (type) => {
      const r = await prisma.repayment.aggregate({
        where: { 
          paidAt: { gte: start, lte: end }, 
          status: 'SUCCESS', 
          loan: { 
            loanType: type,
            ...(frequency && { frequency })
          } 
        },
        _sum: { amount: true },
      });
      return { name: type, value: r._sum.amount || 0 };
    }));

    // Expense by category (this month)
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: expenseWhere,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    res.json({
      summary: {
        income,
        expenses,
        razorpayFees,
        manualExpenses,
        grossProfit,
        interestEarned,
        penaltyEarned,
        netProfit:          income - expenses,
        incomeCount:        incomeRes._count,
        expenseCount:       expenseRes._count,
        capitalDeployed:    capital,
        capitalRecovered:   recovered,
        totalInvested,
        netBalance,
        recoveryPercentage: capital > 0 ? parseFloat((recovered / capital * 100).toFixed(1)) : 0,
        activeLoans,
        efficiency:         income > 0 ? Math.min(100, Math.round(income / Math.max(income, 1) * 100)) : 0,
      },
      chartData,
      loanTypeProfit:    loanTypeProfit.filter(l => l.value > 0),
      categoryBreakdown: categoryBreakdown.map(c => ({ name: c.category, value: c._sum.amount || 0 })),
    });
  } catch (err) {
    console.error('Expense summary error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/expenses/income — real repayment transactions (paginated)
router.get('/income', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { month, year, frequency, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { status: 'SUCCESS' };

    if (frequency) {
      where.loan = { frequency };
    }

    if (month && year) {
      const { start, end } = parseDateRange(month, year);
      where.paidAt = { gte: start, lte: end };
    }

    const [records, total] = await Promise.all([
      prisma.repayment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { paidAt: 'desc' },
        include: {
          loan: {
            include: {
              customer: { select: { customerId: true, name: true } }
            }
          }
        }
      }),
      prisma.repayment.count({ where }),
    ]);

    const income = records.map(r => ({
      id:            r.id,
      paidAt:        r.paidAt,
      customerName:  r.loan.customer.name,
      customerId:    r.loan.customer.customerId,
      loanType:      r.loan.loanType,
      amount:        r.amount,
      method:        r.method,
      paymentType:   r.paymentType,
      transactionId: r.transactionId,
    }));

    res.json({ income, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get income error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/expenses — list expenses (with optional month/year filter)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { month, year, frequency, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (frequency) {
      where.period = frequency === 'MONTHLY' ? { in: ['MONTHLY', 'ONE_TIME'] } : frequency;
    }

    if (month && year) {
      const { start, end } = parseDateRange(month, year);
      where.date = { gte: start, lte: end };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({ where, skip, take: parseInt(limit), orderBy: { date: 'desc' } }),
      prisma.expense.count({ where }),
    ]);
    res.json({ expenses, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/expenses — add expense
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { date, category, description, amount, period } = req.body;
    const expense = await prisma.expense.create({
      data: {
        date:        new Date(date),
        category,
        description,
        amount:      parseFloat(amount),
        period:      period || 'ONE_TIME',
        addedBy:     req.user.name || 'Admin',
      },
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/expenses/:id — update expense
router.patch('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { date, category, description, amount, period } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        ...(date        && { date: new Date(date) }),
        ...(category    && { category }),
        ...(description && { description }),
        ...(amount      && { amount: parseFloat(amount) }),
        ...(period      && { period }),
      },
    });
    res.json(expense);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/expenses/:id — delete expense
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
