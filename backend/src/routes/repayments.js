const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/repayments — list repayment data
router.get('/', authenticate, async (req, res) => {
  try {
    const { filter, loanType, frequency, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const where = { status: 'ACTIVE' };
    if (loanType) where.loanType = loanType;
    if (frequency) where.frequency = frequency;

    // Date-based filters
    if (filter === 'due-today') {
      where.nextDueDate = { gte: today, lt: new Date(today.getTime() + 86400000) };
    } else if (filter === 'this-week') {
      const endOfWeek = new Date(today.getTime() + 7 * 86400000);
      where.nextDueDate = { gte: today, lt: endOfWeek };
    } else if (filter === 'this-month') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      where.nextDueDate = { gte: today, lte: endOfMonth };
    } else if (filter === 'overdue') {
      where.nextDueDate = { lt: today };
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { nextDueDate: 'asc' },
        include: {
          customer: { select: { customerId: true, name: true } },
          repayments: { orderBy: { paidAt: 'desc' }, take: 1 },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    // Compute repayment summary for each loan
    const repaymentData = await Promise.all(
      loans.map(async (loan) => {
        const totalPaid = await prisma.repayment.aggregate({
          where: { loanId: loan.id },
          _sum: { amount: true },
        });

        const paid = totalPaid._sum.amount || 0;
        const outstanding = loan.amount - paid;
        const isOverdue = loan.nextDueDate && loan.nextDueDate < today;
        const isDueToday = loan.nextDueDate && loan.nextDueDate >= today && loan.nextDueDate < new Date(today.getTime() + 86400000);

        let paymentStatus = 'UPCOMING';
        if (outstanding <= 0) paymentStatus = 'CLEARED';
        else if (isOverdue) paymentStatus = 'OVERDUE';
        else if (isDueToday) paymentStatus = 'DUE_TODAY';
        else if (loan.repayments.length > 0) paymentStatus = 'PAID';

        return {
          id: loan.id,
          customerId: loan.customer.customerId,
          customerName: loan.customer.name,
          loanAmount: loan.amount,
          totalPaid: paid,
          outstanding,
          emi: loan.emi,
          lastPayment: loan.repayments[0]?.paidAt || null,
          nextDueDate: loan.nextDueDate,
          status: paymentStatus,
        };
      })
    );

    res.json({ repayments: repaymentData, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get repayments error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/repayments — record a payment
router.post('/', authenticate, async (req, res) => {
  try {
    const { loanId, amount, method, reference } = req.body;

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });

    const repayment = await prisma.repayment.create({
      data: {
        loanId,
        amount: parseFloat(amount),
        method: method || 'CASH',
        reference,
        paidAt: new Date(),
      },
    });

    // Update next due date based on frequency
    const frequencyDays = { DAILY: 1, WEEKLY: 7, MONTHLY: 30 };
    const days = frequencyDays[loan.frequency] || 30;
    await prisma.loan.update({
      where: { id: loanId },
      data: { nextDueDate: new Date(Date.now() + days * 86400000) },
    });

    res.status(201).json({ repayment });
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
