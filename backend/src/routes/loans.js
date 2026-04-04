const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/loans — list loan applications
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, loanType, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (loanType) where.loanType = loanType;

    // Employees see only their own submissions
    if (req.user.role === 'EMPLOYEE') {
      where.createdById = req.user.id;
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerId: true, name: true, phone: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    res.json({ loans, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get loans error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/loans — submit loan application
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      customerId, loanType, amount, tenure, interestRate,
      emi, frequency, purpose, guarantorName, guarantorPhone,
    } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    const loan = await prisma.loan.create({
      data: {
        customerId,
        loanType,
        amount: parseFloat(amount),
        tenure: parseInt(tenure),
        interestRate: parseFloat(interestRate || 0),
        emi: parseFloat(emi || 0),
        frequency: frequency || 'MONTHLY',
        purpose,
        guarantorName,
        guarantorPhone,
        status: 'PENDING',
        createdById: req.user.id,
      },
      include: {
        customer: { select: { customerId: true, name: true } },
      },
    });

    res.status(201).json({ loan });
  } catch (err) {
    console.error('Create loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/loans/:id/approve — admin approve
router.patch('/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const loan = await prisma.loan.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: { customer: true },
    });

    // Update customer status
    await prisma.customer.update({
      where: { id: loan.customerId },
      data: { status: 'ACTIVE' },
    });

    // TODO: Phase 6 — Activate Razorpay autopay, send SMS/WhatsApp

    res.json({ loan, message: 'Loan approved successfully.' });
  } catch (err) {
    console.error('Approve loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/loans/:id/reject — admin reject
router.patch('/:id/reject', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const loan = await prisma.loan.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });
    res.json({ loan, message: 'Loan rejected.' });
  } catch (err) {
    console.error('Reject loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
