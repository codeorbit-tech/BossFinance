const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Razorpay = require('razorpay');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateNextDueDate } = require('../utils/holiday');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

async function createRepaymentSchedule(loan, firstDueDate) {
  const existing = await prisma.installment.count({ where: { loanId: loan.id } });
  if (existing > 0) return;

  let dueDate = new Date(firstDueDate);
  const installments = [];
  for (let i = 1; i <= loan.tenure; i++) {
    installments.push({
      loanId: loan.id,
      installmentNumber: i,
      dueDate,
      expectedAmount: loan.emi,
      totalRemaining: loan.emi,
      balanceAfterPayment: Math.max(0, loan.amount - (loan.emi * i)),
      status: i === 1 ? 'UPCOMING' : 'UPCOMING',
    });

    if (i < loan.tenure) {
      dueDate = await calculateNextDueDate(dueDate, loan.frequency);
    }
  }

  if (installments.length > 0) {
    await prisma.$transaction(
      installments.map((data) => prisma.installment.create({ data }))
    );
  }
}

const upload = multer({ 
  storage: multer.memoryStorage(),
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

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeLoanId = String(loan.id).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `loan_${safeLoanId}_${Date.now()}.pdf`;
    const absolutePath = path.join(uploadsDir, filename);
    fs.writeFileSync(absolutePath, req.file.buffer);

    const pdfUrl = `/uploads/${filename}`;

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
          customer: { select: { customerId: true, name: true, phone: true, aadhaar: true, pan: true } },
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
    if (req.user.role === 'EMPLOYEE' && customer.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

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
    res.status(500).json({ error: err?.message || 'Internal server error.' });
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

    await prisma.auditLog.create({
      data: {
        customerId: loan.customerId,
        field: 'status',
        oldValue: 'PENDING',
        newValue: 'APPROVED',
        changedById: req.user.id
      }
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
    const { disbursementMethod } = req.body;
    const loan = await prisma.loan.findUnique({ 
      where: { id: req.params.id },
      include: { customer: true } 
    });
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
      include: {
        customer: { select: { name: true, customerId: true } }
      }
    });

    await createRepaymentSchedule(updatedLoan, nextDueDate);

    // ─── Upfront Interest for Daily & Weekly Loans ───
    if (updatedLoan.frequency === 'DAILY' || updatedLoan.frequency === 'WEEKLY') {
      const upfrontInterest = (updatedLoan.amount * updatedLoan.interestRate) / 100;
      if (upfrontInterest > 0) {
        await prisma.repayment.create({
          data: {
            loanId: updatedLoan.id,
            customerId: updatedLoan.customerId,
            amount: upfrontInterest,
            interestComponent: upfrontInterest,
            principalComponent: 0,
            penaltyComponent: 0,
            paymentType: 'UPFRONT_INTEREST',
            method: 'SYSTEM',
            status: 'SUCCESS',
            paidAt: new Date()
          }
        });
      }
    }

    // ─── Razorpay Autopay Integration ───
    // ─── Cashfree Autopay Integration ───
    let subscriptionShortUrl = null;
    if (disbursementMethod === 'CASHFREE_AUTOPAY') {
      try {
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const envUrl = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
          ? 'https://api.cashfree.com/pg' 
          : 'https://sandbox.cashfree.com/pg';

        if (appId && secretKey) {
          console.log('DEBUG: Initializing Cashfree with App ID:', appId.substring(0, 10));
          
          const axios = require('axios');

          const frequencyMap = {
            DAILY:   'DAY',
            WEEKLY:  'WEEK',
            MONTHLY: 'MONTH',
          };
          const cfIntervalType = frequencyMap[loan.frequency] || 'MONTH';

          // Validate amount
          const amount = Math.round(loan.emi);
          if (amount < 1) {
            throw new Error(`EMI amount ₹${loan.emi} is too low for Autopay (minimum ₹1)`);
          }

          const cfHeaders = {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01'
          };

          // 1. Create unique IDs for this attempt
          const planId = `plan_${updatedLoan.id.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
          const subId = `sub_${updatedLoan.id.slice(0, 8)}_${Date.now().toString().slice(-6)}`;
          
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years instead of 10

          // Step A: Create the Plan first
          await axios.post(`${envUrl}/plans`, {
            plan_id: planId,
            plan_name: `Loan EMI - ${updatedLoan.id.slice(0, 5)}`,
            plan_type: 'PERIODIC',
            plan_currency: 'INR',
            plan_recurring_amount: amount,
            plan_max_amount: amount + 1000,
            plan_intervals: 1,
            plan_interval_type: cfIntervalType
          }, { headers: cfHeaders });

          // Step B: Create the Subscription
          const subscriptionPayload = {
            subscription_id: subId,
            customer_details: {
              customer_name: updatedLoan.customer.name || 'Test Customer',
              customer_email: updatedLoan.customer.email || 'test@cashfree.com',
              customer_phone: updatedLoan.customer.phone || '9999999999'
            },
            plan_details: {
              plan_id: planId
            },
            subscription_expiry_time: expiryDate.toISOString().split('.')[0] + 'Z',
            subscription_meta: {
              return_url: 'https://www.cashfree.com',
              payment_methods: 'upi'
            },
            subscription_payment_methods: ['upi']
          };

          console.log('[CASHFREE] Creating UPI-first subscription during disbursement:', {
            subscription_id: subId,
            plan_id: planId,
            payment_methods: subscriptionPayload.subscription_payment_methods
          });

          const subscriptionRes = await axios.post(`${envUrl}/subscriptions`, subscriptionPayload, { headers: cfHeaders });

          const sessionId = subscriptionRes.data.subscription_session_id;
          const appBaseUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || 'http://localhost:3000';
          const authLink = `${appBaseUrl}/autopay/${subId}?session_id=${encodeURIComponent(sessionId)}`;

          // 3. Save to DB
          await prisma.loan.update({
            where: { id: loan.id },
            data: {
              razorpayPlanId: planId, // re-using db fields to avoid schema changes
              razorpaySubscriptionId: subId,
              subscriptionShortUrl: authLink,
              subscriptionStatus: 'pending_authorization',
            },
          });

          subscriptionShortUrl = authLink;
        }
      } catch (cfErr) {
        console.error('Cashfree auto-setup error:', cfErr.response?.data || cfErr.message);
        const errorMessage = cfErr.response?.data?.message || cfErr.message || 'Cashfree setup failed';
        return res.status(400).json({ 
          error: `Cashfree Error: ${errorMessage}`,
          details: cfErr.response?.data || {}
        });
      }
    }

    // ─── Cashfree Payout Integration ───
    if (disbursementMethod === 'CASHFREE_PAYOUT') {
      try {
        const { requestTransfer } = require('../utils/cashfreePayout');
        
        let rawData = {};
        try {
          rawData = typeof loan.fullData === 'string' ? JSON.parse(loan.fullData) : (loan.fullData || {});
          if (typeof rawData === 'string') rawData = JSON.parse(rawData);
        } catch (e) {
          console.error('Failed to parse fullData for payout:', e);
        }

        const bank = rawData.applicantBank || rawData || {};
        const beneficiaryName = loan.customer.name || 'Customer';
        const beneficiaryPhone = loan.customer.phone || '9999999999';
        const beneficiaryEmail = loan.customer.email || 'test@cashfree.com';
        const bankAccount = bank.accountNo || rawData.accountNo;
        const ifscCode = bank.ifscCode || rawData.ifscCode;

        if (!bankAccount || !ifscCode) {
          throw new Error('Bank details (account number or IFSC) missing in application.');
        }

        const payoutPayload = {
          beneDetails: {
            beneId: `bene_${loan.customerId.slice(0, 8)}`,
            name: beneficiaryName,
            email: beneficiaryEmail,
            phone: beneficiaryPhone,
            bankAccount: bankAccount,
            ifsc: ifscCode,
            address1: 'Address',
          },
          amount: updatedLoan.amount,
          transferId: `payout_${loan.id.slice(0, 8)}_${Date.now()}`,
          transferMode: 'banktransfer',
        };

        console.log('[CASHFREE PAYOUT] Initiating transfer:', payoutPayload.transferId);
        const payoutRes = await requestTransfer(payoutPayload);
        console.log('[CASHFREE PAYOUT] Response:', payoutRes);
        
        // Record the payout in audit or as a message
        await prisma.auditLog.create({
          data: {
            customerId: loan.customerId,
            field: 'disbursement',
            oldValue: 'PENDING',
            newValue: `CASHFREE_PAYOUT_SUCCESS: ${payoutPayload.transferId}`,
            changedById: req.user.id
          }
        });

      } catch (payoutErr) {
        console.error('Cashfree payout error:', payoutErr.message);
        return res.status(400).json({ 
          error: `Cashfree Payout Error: ${payoutErr.message}`,
        });
      }
    }

    // Update customer status to active
    await prisma.customer.update({
      where: { id: loan.customerId },
      data: { status: 'ACTIVE' },
    });

    await prisma.auditLog.create({
      data: {
        customerId: loan.customerId,
        field: 'status',
        oldValue: 'APPROVED',
        newValue: 'ACTIVE',
        changedById: req.user.id
      }
    });

    res.json({ 
      loan: updatedLoan, 
      message: 'Loan disbursed successfully.',
      subscriptionShortUrl 
    });
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

    await prisma.auditLog.create({
      data: {
        customerId: loan.customerId,
        field: 'status',
        oldValue: 'PENDING',
        newValue: 'QUERIED',
        changedById: req.user.id
      }
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
    const existing = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Loan not found.' });
    if (existing.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied.' });
    }

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

// GET /api/loans/:id/preclosure-quote — calculate amount to close loan
router.get('/:id/preclosure-quote', authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id }
    });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    if (loan.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).error({ error: 'Access denied.' });
    }

    // The current system tracks principal in currentBalance
    const quote = {
      outstandingPrincipal: loan.currentBalance,
      penalties: 0,
      totalPayable: loan.currentBalance,
      loanAmount: loan.amount,
      totalPaid: loan.totalPaid
    };

    res.json({ quote });
  } catch (err) {
    console.error('Preclosure quote error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/loans/:id/preclose — execute loan preclosure
router.post('/:id/preclose', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE loans can be pre-closed.' });
    }

    // 1. Record the Foreclosure Payment
    await prisma.repayment.create({
      data: {
        loanId: loan.id,
        customerId: loan.customerId,
        amount: parseFloat(amount),
        method: method || 'CASH',
        transactionId: reference,
        paymentType: 'FORECLOSURE',
        status: 'SUCCESS'
      }
    });

    // 2. Close the Loan
    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        status: 'CLOSED',
        currentBalance: 0,
        totalPaid: { increment: parseFloat(amount) }
      }
    });

    // 3. Mark remaining installments as PAID
    await prisma.installment.updateMany({
      where: { 
        loanId: loan.id,
        status: { in: ['UPCOMING', 'OVERDUE', 'PARTIAL'] }
      },
      data: { status: 'PAID', paidAt: new Date() }
    });

    res.json({ message: 'Loan pre-closed successfully and status set to CLOSED.' });
  } catch (err) {
    console.error('Preclosure execution error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
