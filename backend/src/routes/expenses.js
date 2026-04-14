const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/expenses — list all expenses
router.get('/', authenticate, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/expenses — add a new expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, category, description, amount, period } = req.body;
    
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        category,
        description,
        amount: parseFloat(amount),
        period: period || 'ONE_TIME',
        addedBy: req.user.name || 'Admin',
      },
    });
    
    res.status(201).json(expense);
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/expenses/:id — delete an expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
