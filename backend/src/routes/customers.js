const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/customers — list all customers
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, loanType, frequency, status, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { customerId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { loans: { select: { loanType: true, amount: true, emi: true, status: true, nextDueDate: true, frequency: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ customers, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/customers/:id — single customer detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        loans: { include: { repayments: { orderBy: { paidAt: 'desc' } } } },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    res.json({ customer });
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/customers — create customer
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, phone, email, address, aadhaar, pan, dateOfBirth, occupation } = req.body;

    // Auto-generate customer ID
    const count = await prisma.customer.count();
    const year = new Date().getFullYear();
    const customerId = `BF-${year}-${String(count + 1).padStart(3, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        customerId,
        name,
        phone,
        email,
        address,
        aadhaar,
        pan,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        occupation,
        createdById: req.user.id,
      },
    });

    res.status(201).json({ customer });
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/customers/:id — update customer (accessible to both admin and employee to fix queries)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Customer not found.' });

    const updates = { ...req.body };
    
    // Convert dateOfBirth if provided as string
    if (updates.dateOfBirth) {
      const d = new Date(updates.dateOfBirth);
      if (!isNaN(d.getTime())) {
        updates.dateOfBirth = d;
      } else {
        delete updates.dateOfBirth; // Remove invalid date
      }
    }

    const auditEntries = [];

    // Create audit trail for each changed field
    for (const [field, newValue] of Object.entries(updates)) {
      // Only audit fields that exist in the customer model
      if (existing.hasOwnProperty(field)) {
        let oldVal = existing[field];
        let newVal = newValue;

        // Normalize for comparison
        if (oldVal instanceof Date) oldVal = oldVal.toISOString().split('T')[0];
        if (newVal instanceof Date) newVal = newVal.toISOString().split('T')[0];

        if (String(oldVal || '') !== String(newVal || '')) {
          auditEntries.push({
            customerId: req.params.id,
            field,
            oldValue: String(oldVal || ''),
            newValue: String(newVal || ''),
            changedById: req.user.id,
          });
        }
      }
    }

    const [customer] = await Promise.all([
      prisma.customer.update({ where: { id: req.params.id }, data: updates }),
      auditEntries.length > 0
        ? prisma.auditLog.createMany({ data: auditEntries })
        : Promise.resolve(),
    ]);

    res.json({ customer, auditEntries: auditEntries.length });
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/customers/:id/npa — mark customer as NPA
router.patch('/:id/npa', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { status: 'NPA' },
    });

    // Mark all active/overdue loans as NPA
    await prisma.loan.updateMany({
      where: { 
        customerId: req.params.id,
        status: { in: ['ACTIVE', 'OVERDUE'] }
      },
      data: { status: 'NPA' },
    });

    res.json({ message: 'Customer and associated loans marked as NPA.', customer });
  } catch (err) {
    console.error('Mark NPA error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
