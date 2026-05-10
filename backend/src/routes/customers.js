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
    if (req.user.role === 'EMPLOYEE') {
      where.createdById = req.user.id;
    }

    if (search) {
      where.OR = [
        { customerId: { contains: search } },
        { name: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { loans: { select: { id: true, loanType: true, amount: true, emi: true, status: true, nextDueDate: true, frequency: true } } },
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
        loans: { 
          include: { 
            repayments: { orderBy: { paidAt: 'desc' } },
            installments: { orderBy: { installmentNumber: 'asc' } }
          } 
        },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    if (req.user.role === 'EMPLOYEE' && customer.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Accrue penalties on-demand so the profile always shows current data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const loan of customer.loans) {
      for (const inst of loan.installments) {
        const dueDate = new Date(inst.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate >= today || inst.status === 'PAID') continue;

        const referenceDate = inst.lastPenaltyUpdate
          ? new Date(inst.lastPenaltyUpdate)
          : new Date(inst.dueDate);
        referenceDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - referenceDate.getTime()) / 86400000);
        if (diffDays <= 0) continue;

        // Compound 3% daily on (totalRemaining + penalInterest - penaltyPaid)
        const penaltyRate = 0.03;
        const currentPrincipal = (inst.totalRemaining || 0) + (inst.penalInterest || 0) - (inst.penaltyPaid || 0);
        const newPrincipal = currentPrincipal * Math.pow(1 + penaltyRate, diffDays);
        const addedPenalty = newPrincipal - currentPrincipal;
        inst.penalInterest = (inst.penalInterest || 0) + addedPenalty;
        inst.lastPenaltyUpdate = today;

        await prisma.installment.update({
          where: { id: inst.id },
          data: {
            penalInterest: inst.penalInterest,
            lastPenaltyUpdate: today,
            status: inst.status === 'UPCOMING' ? 'OVERDUE' : inst.status,
          },
        });
      }
    }

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

    // Safely parse dateOfBirth — empty string or invalid string must not crash Prisma
    let parsedDob = null;
    if (dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.trim() !== '') {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) parsedDob = d;
    }

    const customer = await prisma.customer.create({
      data: {
        customerId,
        name: name || 'Unknown',
        phone:      phone      || null,
        email:      email      || null,
        address:    address    || null,
        aadhaar:    aadhaar    || null,
        pan:        pan        || null,
        dateOfBirth: parsedDob,
        occupation: occupation || null,
        createdById: req.user.id,
      },
    });

    res.status(201).json({ customer });
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error.' });
  }
});


// PUT /api/customers/:id — update customer (accessible to both admin and employee to fix queries)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Customer not found.' });
    if (req.user.role === 'EMPLOYEE' && existing.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updates = { ...req.body };

    // Sanitize optional string fields: empty string → null
    const nullableFields = ['phone', 'email', 'aadhaar', 'pan', 'occupation', 'address', 'bankName', 'bankAccount', 'bankIfsc'];
    for (const f of nullableFields) {
      if (updates[f] !== undefined && (updates[f] === '' || updates[f] === null)) {
        updates[f] = null;
      }
    }

    // Convert dateOfBirth if provided as string; treat empty string as null
    if (updates.dateOfBirth !== undefined) {
      if (!updates.dateOfBirth || updates.dateOfBirth.toString().trim() === '') {
        delete updates.dateOfBirth;
      } else {
        const d = new Date(updates.dateOfBirth);
        if (!isNaN(d.getTime())) {
          updates.dateOfBirth = d;
        } else {
          delete updates.dateOfBirth; // Remove invalid date
        }
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
