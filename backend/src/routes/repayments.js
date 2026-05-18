const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { allocateRepayment } = require('../utils/repaymentAllocation');
const { processDailyPaymentLinks } = require('../jobs/paymentLinkJob');

const router = express.Router();
const prisma = new PrismaClient();

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function getDailyPenaltyRate() {
  // 3% per day compound on the outstanding overdue amount
  return 0.03;
}

function getOverdueDays(fromDate, toDate = new Date()) {
  const start = startOfDay(new Date(fromDate));
  const end = startOfDay(new Date(toDate));
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}

async function accruePenaltyUntilToday(installments) {
  const today = startOfDay(new Date());
  const penaltyRate = await getDailyPenaltyRate();

  for (const inst of installments) {
    const dueDate = startOfDay(new Date(inst.dueDate));
    if (dueDate >= today) continue;

    const referenceDate = inst.lastPenaltyUpdate
      ? startOfDay(new Date(inst.lastPenaltyUpdate))
      : dueDate;
    const diffDays = Math.floor((today.getTime() - referenceDate.getTime()) / 86400000);
    if (diffDays <= 0) continue;

    // Daily Compound Penalty
    // Principal for penalty is Unpaid EMI + Unpaid Penalty
    const currentPrincipal = inst.totalRemaining + (inst.penalInterest || 0) - (inst.penaltyPaid || 0);
    
    // Calculate new principal after daily compounding for diffDays
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

function getOutstandingPenalty(installments) {
  return installments.reduce((sum, inst) => {
    return sum + Math.max(0, (inst.penalInterest || 0) - (inst.penaltyPaid || 0));
  }, 0);
}

// GET /api/repayments/stats — live summary stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 86400000);

    const [
      activeLoans,
      collectedTodayRes,
      overdueLoans,
      overdueAmountRes,
    ] = await Promise.all([
      prisma.loan.count({ where: { status: 'ACTIVE', ...(req.user.role === 'EMPLOYEE' && { createdById: req.user.id }) } }),
      prisma.repayment.aggregate({
        where: { 
          paidAt: { gte: today, lt: tomorrow }, 
          status: 'SUCCESS',
          paymentType: { not: 'UPFRONT_INTEREST' }
        },
        _sum: { amount: true },
      }),
      prisma.loan.count({ where: { status: 'ACTIVE', nextDueDate: { lt: today }, ...(req.user.role === 'EMPLOYEE' && { createdById: req.user.id }) } }),
      prisma.loan.aggregate({
        where: { status: 'ACTIVE', nextDueDate: { lt: today }, ...(req.user.role === 'EMPLOYEE' && { createdById: req.user.id }) },
        _sum: { currentBalance: true },
      }),
    ]);

    // Total outstanding across all active loans
    const outstandingRes = await prisma.loan.aggregate({
      where: { status: 'ACTIVE', ...(req.user.role === 'EMPLOYEE' && { createdById: req.user.id }) },
      _sum: { currentBalance: true },
    });

    res.json({
      totalActive: activeLoans,
      outstanding: outstandingRes._sum.currentBalance || 0,
      collectedToday: collectedTodayRes._sum.amount || 0,
      overdueCount: overdueLoans,
      overdueAmount: overdueAmountRes._sum.currentBalance || 0,
    });
  } catch (err) {
    console.error('Repayment stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/repayments/recent — fetch newly created repayments for notifications
router.get('/recent', authenticate, async (req, res) => {
  try {
    const after = req.query.after ? new Date(req.query.after) : new Date(Date.now() - 15000);
    const recent = await prisma.repayment.findMany({
      where: {
        createdAt: { gt: after },
        paymentType: { not: 'UPFRONT_INTEREST' }
      },
      include: { loan: { include: { customer: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(recent);
  } catch (err) {
    console.error('Recent repayments error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/repayments — list repayment data

router.get('/', authenticate, async (req, res) => {
  try {
    const { filter, loanType, frequency, search, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const where = { status: { in: ['ACTIVE', 'CLOSURE_PENDING'] } };
    if (req.user.role === 'EMPLOYEE') where.createdById = req.user.id;
    if (loanType) where.loanType = loanType;
    if (frequency) where.frequency = frequency;

    if (search) {
      where.OR = [
        { customer: { name: { contains: search } } },
        { customer: { customerId: { contains: search } } },
      ];
    }

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
          repayments: { 
            where: { paymentType: { not: 'UPFRONT_INTEREST' } },
            orderBy: { paidAt: 'desc' }, 
            take: 1 
          },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    // Compute repayment summary for each loan
    const repaymentData = await Promise.all(
      loans.map(async (loan) => {
        const totalPaidRes = await prisma.repayment.aggregate({
          where: { 
            loanId: loan.id, 
            paymentType: { notIn: ['PENALTY_SETTLEMENT', 'UPFRONT_INTEREST'] } 
          },
          _sum: { amount: true },
        });

        const installments = await prisma.installment.findMany({
          where: { loanId: loan.id },
          select: { id: true, dueDate: true, penalInterest: true, penaltyPaid: true, status: true, lastPenaltyUpdate: true, totalRemaining: true },
        });

        // Accrue penalties on-demand so tracker always shows current values
        await accruePenaltyUntilToday(installments);

        const paid = totalPaidRes._sum.amount || 0;
        const outstanding = Math.max(0, loan.amount - paid);
        const penaltyDue = getOutstandingPenalty(installments);
        const hasInstallments = installments.length > 0;
        const remainingEmis = installments.filter(inst => inst.status !== 'PAID').length;
        const isOverdue = loan.nextDueDate && loan.nextDueDate < today;
        const isDueToday = loan.nextDueDate && loan.nextDueDate >= today && loan.nextDueDate < new Date(today.getTime() + 86400000);

        let paymentStatus = 'UPCOMING';
        if (hasInstallments && remainingEmis === 0) paymentStatus = penaltyDue > 0 ? 'PENALTY_PENDING' : 'CLEARED';
        else if (loan.status === 'CLOSURE_PENDING') paymentStatus = 'PENALTY_PENDING';
        else if (outstanding <= 0) paymentStatus = 'CLEARED';
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
          loanStatus: loan.status,
          penaltyDue,
          subscriptionStatus: loan.subscriptionStatus || null,
          razorpaySubscriptionId: loan.razorpaySubscriptionId || null,
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
    const { loanId, amount, method, reference, paymentType } = req.body;

    const loan = await prisma.loan.findUnique({ 
      where: { id: loanId },
      include: { customer: true } 
    });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });
    if (req.user.role === 'EMPLOYEE' && loan.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (loan.status === 'CLOSURE_PENDING') {
      return res.status(400).json({ error: 'All EMIs are paid. Settle the final penalty to complete this loan.' });
    }

    // Fetch all non-PAID installments ordered by due date
    const installments = await prisma.installment.findMany({
      where: { 
        loanId, 
        status: { not: 'PAID' } 
      },
      orderBy: { installmentNumber: 'asc' }
    });
    if (installments.length === 0) {
      if (loan.status === 'ACTIVE' && loan.currentBalance > 0) {
        return res.status(400).json({ error: 'Repayment schedule is missing for this active loan. Please disburse/regenerate the schedule before recording payment.' });
      }

      const penaltyInstallments = await prisma.installment.findMany({
        where: { loanId },
        select: { penalInterest: true, penaltyPaid: true },
      });
      const totalPenaltyDue = getOutstandingPenalty(penaltyInstallments);

      await prisma.loan.update({
        where: { id: loanId },
        data: {
          nextDueDate: null,
          status: totalPenaltyDue > 0 ? 'CLOSURE_PENDING' : 'CLOSED',
        },
      });

      return res.json({
        message: totalPenaltyDue > 0
          ? 'All EMIs are paid. Settle the final penalty to complete this loan.'
          : 'All EMIs are already paid and this loan is closed.',
        closure: {
          required: totalPenaltyDue > 0,
          completed: totalPenaltyDue <= 0,
          totalPenaltyDue,
        },
      });
    }

    await accruePenaltyUntilToday(installments);
    const allocation = allocateRepayment({ amount, loan, installments });

    for (const item of allocation.allocations) {
      await prisma.installment.update({
        where: { id: item.installmentId },
        data: {
          amountPaid: { increment: item.total },
          penaltyPaid: { increment: item.penalty },
          interestPaid: { increment: item.interest },
          totalRemaining: item.totalRemaining,
          status: item.status,
          paidAt: item.status === 'PAID' ? new Date() : undefined
        }
      });
    }

    const repayment = await prisma.repayment.create({
      data: {
        loanId,
        customerId: loan.customerId,
        amount: parseFloat(amount),
        interestComponent: allocation.totals.interest,
        penaltyComponent: allocation.totals.penalty,
        principalComponent: allocation.totals.principal,
        method: method || 'CASH',
        transactionId: reference || `txn_` + Date.now(),
        paymentType: paymentType || 'EMI',
        paidAt: new Date(),
        status: 'SUCCESS'
      },
    });

    await prisma.auditLog.create({
      data: {
        customerId: loan.customerId,
        field: 'repayment',
        oldValue: 'None',
        newValue: `Recorded ${paymentType || 'EMI'} of ₹${amount} via ${method || 'CASH'}`,
        changedById: req.user.id
      }
    });

    // Determine the next due date from the first non-paid installment
    const nextInst = await prisma.installment.findFirst({
      where: { loanId, status: { not: 'PAID' } },
      orderBy: { installmentNumber: 'asc' }
    });

    const penaltyInstallments = await prisma.installment.findMany({
      where: { loanId },
      select: { penalInterest: true, penaltyPaid: true },
    });
    const totalPenaltyDue = getOutstandingPenalty(penaltyInstallments);

    const loanStatusUpdate = {};
    if (!nextInst) {
      loanStatusUpdate.status = totalPenaltyDue > 0 ? 'CLOSURE_PENDING' : 'CLOSED';
    }

    // Only increment customer-paid capital and decrement balance if it's NOT upfront interest
    const isUpfront = (paymentType || 'EMI') === 'UPFRONT_INTEREST';
    
    await prisma.loan.update({
      where: { id: loanId },
      data: { 
        nextDueDate: nextInst ? nextInst.dueDate : null,
        totalPaid: isUpfront ? undefined : { increment: parseFloat(amount) },
        currentBalance: isUpfront ? undefined : { decrement: parseFloat(amount) },
        ...loanStatusUpdate
      },
    });

    res.status(201).json({
      repayment,
      closure: !nextInst ? {
        required: totalPenaltyDue > 0,
        completed: totalPenaltyDue <= 0,
        totalPenaltyDue,
      } : null,
    });
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/repayments/settle-penalties — Settle accumulated penalties
router.post('/settle-penalties', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { loanId, amount, discount = 0, method, description } = req.body;
    const settlementAmount = parseFloat(amount);
    const discountAmount = parseFloat(discount || 0);

    if (!Number.isFinite(settlementAmount) || settlementAmount < 0) {
      return res.status(400).json({ error: 'Enter a valid settlement amount.' });
    }
    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      return res.status(400).json({ error: 'Enter a valid discount amount.' });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { installments: true }
    });

    if (!loan) return res.status(404).json({ error: 'Loan not found.' });

    // 1. Calculate total outstanding penalties
    const totalPenaltyDue = getOutstandingPenalty(loan.installments);
    const expectedSettlement = Math.max(0, totalPenaltyDue - discountAmount);

    if (discountAmount > totalPenaltyDue) {
      return res.status(400).json({ error: 'Discount cannot be more than total penalty.' });
    }
    if (Math.abs(settlementAmount - expectedSettlement) > 0.01) {
      return res.status(400).json({ error: 'Settlement amount must equal total penalty minus discount.' });
    }

    // 2. Mark all penalties as "paid" in installments
    for (const inst of loan.installments) {
      if (inst.penalInterest > inst.penaltyPaid) {
        await prisma.installment.update({
          where: { id: inst.id },
          data: {
            penaltyPaid: inst.penalInterest,
            // totalRemaining doesn't change because it already excludes penalties in new logic
          }
        });
      }
    }

    // 3. Create a repayment record for audit
    const repayment = await prisma.repayment.create({
      data: {
        loanId,
        customerId: loan.customerId,
        amount: settlementAmount,
        penaltyComponent: settlementAmount,
        interestComponent: 0,
        principalComponent: 0,
        method: method || 'CASH',
        paymentType: 'PENALTY_SETTLEMENT',
        status: 'SUCCESS',
        paidAt: new Date(),
      }
    });

    // 4. Add to Investment/Profit tracking
    await prisma.investment.create({
      data: {
        type: 'PROFIT',
        amount: settlementAmount,
        description: description || `Penalty settlement for Loan ${loanId}. Original Due: Rs ${totalPenaltyDue}, Discount: Rs ${discountAmount}`,
        date: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        customerId: loan.customerId,
        field: 'penalty_settlement',
        oldValue: `Due: Rs ${totalPenaltyDue}`,
        newValue: `Discount: Rs ${discountAmount}, paid: Rs ${settlementAmount}`,
        changedById: req.user.id
      }
    });

    // 5. If all EMIs are also paid, we might want to close the loan
    const remainingEmis = await prisma.installment.count({
      where: { loanId, status: { not: 'PAID' } }
    });

    if (remainingEmis === 0) {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'CLOSED' }
      });
    }

    res.json({
      message: 'Penalties settled successfully.',
      amount: settlementAmount,
      discount: discountAmount,
      totalPenaltyDue,
    });
  } catch (err) {
    console.error('Settle penalties error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/repayments/npa-summary — Stats for NPA dashboard
router.get('/npa-summary', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { frequency } = req.query;
    const loanWhere = { 
      status: { in: ['ACTIVE', 'OVERDUE', 'NPA'] },
      ...(frequency && { frequency })
    };

    const loans = await prisma.loan.findMany({
      where: loanWhere,
      include: {
        repayments: { where: { status: 'SUCCESS' } },
        installments: { where: { status: { in: ['OVERDUE', 'PARTIAL'] } } }
      }
    });

    let totalPaid = 0;
    let pendingCount = 0;
    let npaCount = 0;

    loans.forEach(loan => {
      const paid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      totalPaid += paid;

      if (loan.status === 'NPA') {
        npaCount++;
      } else if (loan.installments.length > 0) {
        pendingCount++;
      }
    });

    res.json({
      totalPaid,
      pendingCount,
      npaCount,
    });
  } catch (err) {
    console.error('NPA summary error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/repayments/npa-details — List of non-paying customers
router.get('/npa-details', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { frequency } = req.query;
    const loanWhere = { 
      status: { in: ['ACTIVE', 'OVERDUE', 'NPA'] },
      ...(frequency && { frequency })
    };

    const [loans, npaCustomers] = await Promise.all([
      prisma.loan.findMany({
        where: loanWhere,
        include: {
          customer: true,
          installments: { 
            where: { status: { in: ['OVERDUE', 'PARTIAL'] } },
            orderBy: { installmentNumber: 'asc' }
          },
          _count: { select: { installments: true } }
        }
      }),
      prisma.customer.findMany({
        where: { status: 'NPA' },
        include: { 
          loans: {
            where: {
              ...(frequency && { frequency })
            },
            include: {
              installments: { orderBy: { installmentNumber: 'asc' } }
            }
          } 
        }
      })
    ]);

    // Map loans with overdue installments
    const overdueDetails = loans
      .filter(loan => loan.installments.length > 0)
      .map(loan => {
        const firstOverdue = loan.installments[0];
        const unpaidAmount = loan.installments.reduce((sum, i) => sum + i.totalRemaining, 0);
        const penaltyAmount = loan.installments.reduce((sum, i) => sum + i.penalInterest, 0);
        
        const paidCount = loan._count.installments - loan.installments.length;

        return {
          id: loan.id,
          dbId: loan.id,
          customerId: loan.customer.customerId,
          customerDbId: loan.customer.id,
          customerName: loan.customer.name,
          customerPhone: loan.customer.phone,
          loanAmount: loan.amount,
          emiAmount: loan.emi,
          dueDate: firstOverdue.dueDate,
          loanType: loan.loanType,
          status: loan.status,
          unpaidAmount,
          penaltyAmount,
          totalEmis: loan.tenure, // or count
          emisPaid: paidCount,
          emisRemaining: loan.tenure - paidCount,
          isManualNpa: loan.customer.status === 'NPA'
        };
      });

    // Merge manually flagged NPA customers who might not have matched the above
    const manualNpaDetails = [];
    npaCustomers.forEach(cust => {
      cust.loans.forEach(loan => {
        // Skip if already in overdueDetails
        if (overdueDetails.find(d => d.id === loan.id)) return;
        
        const unpaidAmount = loan.installments.reduce((sum, i) => sum + (i.status !== 'PAID' ? i.totalRemaining : 0), 0);
        const penaltyAmount = loan.installments.reduce((sum, i) => sum + (i.status !== 'PAID' ? i.penalInterest : 0), 0);
        const paidCount = loan.installments.filter(i => i.status === 'PAID').length;
        const firstUnpaid = loan.installments.find(i => i.status !== 'PAID');

        manualNpaDetails.push({
          id: loan.id,
          dbId: loan.id,
          customerId: cust.customerId,
          customerDbId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          loanAmount: loan.amount,
          emiAmount: loan.emi,
          dueDate: firstUnpaid ? firstUnpaid.dueDate : null,
          loanType: loan.loanType,
          status: 'NPA',
          unpaidAmount,
          penaltyAmount,
          totalEmis: loan.tenure,
          emisPaid: paidCount,
          emisRemaining: loan.tenure - paidCount,
          isManualNpa: true
        });
      });
    });

    res.json({ details: [...overdueDetails, ...manualNpaDetails] });
  } catch (err) {
    console.error('NPA details error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/repayments/overdue-details â€” Detailed overdue customers list
router.get('/overdue-details', authenticate, async (req, res) => {
  try {
    const { frequency } = req.query;
    const loanWhere = {
      status: { in: ['ACTIVE', 'OVERDUE', 'CLOSURE_PENDING'] },
      ...(frequency && { frequency }),
      ...(req.user.role === 'EMPLOYEE' && { createdById: req.user.id }),
    };

    const loans = await prisma.loan.findMany({
      where: loanWhere,
      include: {
        customer: { select: { customerId: true, name: true, phone: true } },
        repayments: { 
          where: { 
            status: 'SUCCESS',
            paymentType: { not: 'UPFRONT_INTEREST' }
          }, 
          orderBy: { paidAt: 'desc' } 
        },
        installments: { orderBy: { installmentNumber: 'asc' } },
      }
    });

    const penaltyRate = await getDailyPenaltyRate();
    const today = startOfDay(new Date());

    const overdueDetails = loans
      .map((loan) => {
        const overdueInstallments = loan.installments.filter(inst => inst.status !== 'PAID' && startOfDay(new Date(inst.dueDate)) < today);
        if (overdueInstallments.length === 0) return null;

        const firstOverdue = overdueInstallments[0];
        const overdueDays = getOverdueDays(firstOverdue.dueDate, today);
        const totalPenalty = overdueInstallments.reduce((sum, inst) => sum + Math.max(0, (inst.penalInterest || 0) - (inst.penaltyPaid || 0)), 0);
        const unpaidAmount = overdueInstallments.reduce((sum, inst) => sum + Math.max(0, inst.totalRemaining || 0), 0);
        const remainingEmis = loan.installments.filter(inst => inst.status !== 'PAID').length;
        const lastPayment = loan.repayments[0]?.paidAt || null;
        const lastPaymentAmount = loan.repayments[0]?.amount || 0;

        return {
          id: loan.id,
          customerId: loan.customer.customerId,
          customerName: loan.customer.name,
          customerPhone: loan.customer.phone,
          loanType: loan.loanType,
          loanStatus: loan.status,
          loanAmount: loan.amount,
          emiAmount: loan.emi,
          dueDate: firstOverdue.dueDate,
          overdueDays,
          penaltyPerDay: penaltyRate,
          penaltyAmount: totalPenalty,
          outstandingAmount: unpaidAmount,
          totalPaid: loan.repayments
            .filter(r => r.paymentType !== 'UPFRONT_INTEREST')
            .reduce((sum, r) => sum + (r.amount || 0), 0),
          remainingEmis,
          lastPayment,
          lastPaymentAmount,
          installmentCount: loan.installments.length,
        };
      })
      .filter(Boolean);

    res.json({ details: overdueDetails });
  } catch (err) {
    console.error('Overdue details error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/repayments/trigger-payment-links — Manually trigger payment links
router.post('/trigger-payment-links', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    // Run asynchronously without blocking the response
    processDailyPaymentLinks();
    res.json({ message: 'Payment link generation process started for today.' });
  } catch (err) {
    console.error('Trigger payment links error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

