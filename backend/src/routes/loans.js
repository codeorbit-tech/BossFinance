const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateNextDueDate } = require('../utils/holiday');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer for PDF storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/loans';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'loan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /api/loans/:id/upload-pdf — upload PDF for a loan
router.post('/:id/upload-pdf', authenticate, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    // Only creator or admin can upload
    if (loan.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const pdfUrl = `/uploads/loans/${req.file.filename}`;
    
    await prisma.loan.update({
      where: { id: req.params.id },
      data: { pdfUrl }
    });

    res.json({ pdfUrl, message: 'PDF uploaded successfully.' });
  } catch (err) {
    console.error('Upload PDF error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

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

// GET /api/loans/:id — get loan application details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: { customer: true }
    });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    if (loan.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json({ loan });
  } catch (err) {
    console.error('Get loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/loans — submit loan application
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      customerId, loanType, amount, tenure, interestRate,
      emi, frequency, purpose, guarantorName, guarantorPhone,
      fullData
    } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    const loan = await prisma.loan.create({
      data: {
        customerId,
        loanType,
        amount: parseFloat(amount || 0),
        tenure: parseInt(tenure || 12),
        interestRate: parseFloat(interestRate || 0),
        emi: parseFloat(emi || 0),
        frequency: frequency || 'MONTHLY',
        purpose,
        guarantorName,
        guarantorPhone,
        status: 'PENDING',
        fullData: fullData ? JSON.stringify(fullData) : null,
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
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    res.json({ loan, message: 'Loan application approved.' });
  } catch (err) {
    console.error('Approve loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/loans/:id/disburse — admin disburse funds
router.patch('/:id/disburse', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });

    // Calculate initial due date (usually 1 cycle from now)
    const nextDueDate = await calculateNextDueDate(new Date(), loan.frequency);

    const updatedLoan = await prisma.loan.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        disbursedAt: new Date(),
        nextDueDate,
        currentBalance: loan.amount // Start balance at full principal
      },
    });

    // Update customer status to active
    await prisma.customer.update({
      where: { id: loan.customerId },
      data: { status: 'ACTIVE' },
    });

    res.json({ loan: updatedLoan, message: 'Loan disbursed successfully. Repayment schedule started.' });
  } catch (err) {
    console.error('Disburse loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/loans/:id/query — admin query application
router.patch('/:id/query', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { description } = req.body;
    const loan = await prisma.loan.update({
      where: { id: req.params.id },
      data: { 
        status: 'QUERIED',
        queryDescription: description
      },
    });
    res.json({ loan, message: 'Query sent to employee.' });
  } catch (err) {
    console.error('Query loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/loans/:id/pdf — update pdf url
router.patch('/:id/pdf', authenticate, async (req, res) => {
  try {
    const { pdfUrl } = req.body;
    const loan = await prisma.loan.update({
      where: { id: req.params.id },
      data: { pdfUrl },
    });
    res.json({ loan, message: 'PDF recorded successfully.' });
  } catch (err) {
    console.error('Update PDF error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/loans/:id/resubmit — employee resubmit
router.patch('/:id/resubmit', authenticate, async (req, res) => {
  console.log('Resubmit Request Body:', JSON.stringify(req.body, null, 2));
  try {
    const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    
    // Only creator employee or admin can resubmit
    if (loan.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { amount, purpose, fullData } = req.body;
    const data = { status: 'PENDING', queryDescription: null };
    
    if (amount !== undefined) data.amount = parseFloat(amount || 0);
    if (purpose) data.purpose = purpose;
    if (fullData) data.fullData = JSON.stringify(fullData);

    // If fullData has guarantor info, update those fields too
    if (fullData && fullData.guarantorPersonal) {
      const gName = [
        fullData.guarantorPersonal.firstName,
        fullData.guarantorPersonal.middleName,
        fullData.guarantorPersonal.lastName
      ].filter(Boolean).join(' ');
      if (gName) data.guarantorName = gName;
    }
    if (fullData && fullData.guarantorContact) {
      if (fullData.guarantorContact.mobile) data.guarantorPhone = fullData.guarantorContact.mobile;
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: req.params.id },
      data
    });
    res.json({ loan: updatedLoan, message: 'Loan application resubmitted successfully.' });
  } catch (err) {
    console.error('Resubmit loan error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
