const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/investments — List transactions for a month
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month || now.getMonth() + 1);
    const y = parseInt(year || now.getFullYear());
    
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const investments = await prisma.investment.findMany({
      where: {
        date: { gte: start, lte: end }
      },
      orderBy: { date: 'desc' }
    });

    // Summary calculation
    const summary = investments.reduce((acc, inv) => {
      if (inv.type === 'INVESTMENT') acc.totalInvested += inv.amount;
      if (inv.type === 'WITHDRAWAL') acc.totalWithdrawn += inv.amount;
      if (inv.type === 'PROFIT') acc.totalProfit += inv.amount;
      return acc;
    }, { totalInvested: 0, totalWithdrawn: 0, totalProfit: 0 });

    res.json({ investments, summary });
  } catch (err) {
    console.error('Get investments error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/investments — Add transaction
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { date, type, description, amount } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Type and amount are required.' });
    }

    const investment = await prisma.investment.create({
      data: {
        date: date ? new Date(date) : new Date(),
        type,
        description,
        amount: parseFloat(amount)
      }
    });

    res.status(201).json(investment);
  } catch (err) {
    console.error('Create investment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/investments/:id — Delete transaction
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.investment.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    console.error('Delete investment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
