const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { allocateRepayment } = require('../utils/repaymentAllocation');

const router = express.Router();
const prisma = new PrismaClient();

function toValidAmount(...candidates) {
  for (const value of candidates) {
    if (value === null || value === undefined) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function getSubscriptionId(data) {
  return (
    data?.data?.subscription?.subscription_id ||
    data?.data?.subscription_id ||
    data?.subscription?.subscription_id ||
    data?.subscription_id ||
    null
  );
}

// Route is mounted at /webhook/cashfree and uses express.raw() in index.js
router.post('/', async (req, res) => {
  try {
    const secret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    const rawBody = req.body;

    if (signature && timestamp) {
      const dataToSign = timestamp + rawBody.toString('utf8');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(dataToSign)
        .digest('base64');

      if (expectedSignature !== signature) {
        console.error('[WEBHOOK ERROR] Invalid Signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const data = JSON.parse(rawBody.toString('utf8'));
    const event = data.event_type || data.type;

    console.log(`\n[WEBHOOK RECEIVED] Cashfree Event: ${event}`);

    const isSuccess = [
      'SUBSCRIPTION_CHARGE_SUCCESS', 
      'SUBSCRIPTION_PAYMENT_SUCCESS', 
      'PAYMENT_SUCCESS', 
      'ORDER_PAID'
    ].includes(event);

    if (isSuccess) {
      let subscriptionId = getSubscriptionId(data) || data.data?.order?.order_id || data.order_id;
      let isPaymentLink = false;
      let paymentLinkLoanId = null;

      // Extract link_id if available (for one-off payment links)
      const linkId = data.data?.payment?.link_id || data.data?.link_id;
      if (linkId && linkId.startsWith('link_loan_')) {
        isPaymentLink = true;
        // link_loan_LOANID_1234
        const parts = linkId.split('_');
        if (parts.length >= 3) {
          paymentLinkLoanId = parts[2];
        }
      }

      const paymentId = data.data?.payment?.cf_payment_id || `cf_${Date.now()}`;
      const amount = toValidAmount(
        data.data?.payment?.payment_amount,
        data.data?.payment?.amount,
        data.data?.payment?.cf_payment_amount,
        data.data?.payment?.order_amount,
        data.data?.payment?.paymentValue,
        data.data?.amount,
        data.data?.payment_amount,
        data.amount_paid,
        data.amount
      );

      console.log('[WEBHOOK INFO] Subscription charge success');
      console.log('Subscription ID:', subscriptionId);
      console.log('Payment ID:', paymentId);
      console.log('Amount:', amount);
      console.log('Payload keys:', Object.keys(data || {}));
      console.log('Data keys:', Object.keys(data?.data || {}));

      if (!amount) {
        console.error('[WEBHOOK ERROR] Missing or invalid payment amount in success payload');
        return res.status(200).send('OK');
      }

      let loan = null;
      if (isPaymentLink && paymentLinkLoanId) {
        loan = await prisma.loan.findUnique({ where: { id: paymentLinkLoanId } });
        console.log('Payment Link Loan found:', loan ? loan.id : 'NOT FOUND');
      } else {
        loan = await prisma.loan.findUnique({ where: { razorpaySubscriptionId: subscriptionId } });
        console.log('Subscription Loan found:', loan ? loan.id : 'NOT FOUND');
      }

      if (loan) {
        const installments = await prisma.installment.findMany({
          where: { loanId: loan.id, status: { not: 'PAID' } },
          orderBy: { installmentNumber: 'asc' },
        });

        if (!installments.length) {
          console.error('[WEBHOOK ERROR] No unpaid installments found for loan', loan.id);
          return res.status(200).send('OK');
        }

        const allocation = allocateRepayment({ amount, loan, installments });
        if (!allocation.allocations.length) {
          console.error('[WEBHOOK ERROR] No allocatable amount for loan', loan.id);
          return res.status(200).send('OK');
        }

        const paidIds = new Set(
          allocation.allocations.filter((a) => a.status === 'PAID').map((a) => a.installmentId)
        );
        const nextInstAfterAllocation = installments.find((inst) => !paidIds.has(inst.id));

        const txOps = allocation.allocations.map((item) =>
          prisma.installment.update({
            where: { id: item.installmentId },
            data: {
              status: item.status,
              amountPaid: { increment: item.total },
              penaltyPaid: { increment: item.penalty },
              interestPaid: { increment: item.interest },
              totalRemaining: item.totalRemaining,
              razorpayPaymentId: paymentId.toString(),
              paidAt: item.status === 'PAID' ? new Date() : undefined,
            },
          })
        );

        txOps.push(
          prisma.repayment.create({
            data: {
              loanId: loan.id,
              customerId: loan.customerId,
              amount,
              interestComponent: allocation.totals.interest,
              penaltyComponent: allocation.totals.penalty,
              principalComponent: allocation.totals.principal,
              method: 'ONLINE',
              transactionId: paymentId.toString(),
              paymentType: 'EMI',
              paidAt: new Date(),
              status: 'SUCCESS',
            },
          })
        );

        const loanUpdates = {
          totalPaid: { increment: amount },
          currentBalance: { decrement: amount },
          nextDueDate: nextInstAfterAllocation ? nextInstAfterAllocation.dueDate : null,
        };

        // Only update subscription status if this was an actual subscription charge
        if (!isPaymentLink) {
          loanUpdates.subscriptionStatus = 'active';
        }

        txOps.push(
          prisma.loan.update({
            where: { id: loan.id },
            data: loanUpdates,
          })
        );

        await prisma.$transaction(txOps);
        console.log('[WEBHOOK INFO] DB updated successfully');
      }
    } else if (event === 'SUBSCRIPTION_CHARGE_FAILED' || event === 'SUBSCRIPTION_PAYMENT_FAILED') {
      const subscriptionId = getSubscriptionId(data);
      const failureReason = data.data?.payment?.payment_message || 'Unknown failure';
      console.log(`[WEBHOOK INFO] Payment failed for subscription ${subscriptionId}: ${failureReason}`);

      const loan = await prisma.loan.findUnique({ where: { razorpaySubscriptionId: subscriptionId } });
      if (loan) {
        const installment = await prisma.installment.findFirst({
          where: { loanId: loan.id, status: { in: ['UPCOMING', 'OVERDUE', 'PARTIAL'] } },
          orderBy: { dueDate: 'asc' },
        });

        if (installment) {
          await prisma.installment.update({
            where: { id: installment.id },
            data: { status: 'OVERDUE', failureReason },
          });
        }
      }
    } else if (
      event === 'SUBSCRIPTION_ACTIVATED' ||
      event === 'SUBSCRIPTION_ACTIVE' ||
      event === 'SUBSCRIPTION_AUTH_STATUS'
    ) {
      const subscriptionId = getSubscriptionId(data);
      const authStatus = (
        data?.data?.subscription?.status || data?.data?.status || data?.status || ''
      ).toString().toUpperCase();

      const loan = await prisma.loan.findUnique({ where: { razorpaySubscriptionId: subscriptionId } });
      if (loan) {
        const nextStatus = authStatus.includes('FAIL') || authStatus.includes('INACTIVE')
          ? 'pending_authorization'
          : 'active';
        await prisma.loan.update({
          where: { id: loan.id },
          data: { subscriptionStatus: nextStatus },
        });
      }
    } else if (event === 'SUBSCRIPTION_CANCELLED' || event === 'SUBSCRIPTION_DEACTIVATED') {
      const subscriptionId = getSubscriptionId(data);
      const loan = await prisma.loan.findUnique({ where: { razorpaySubscriptionId: subscriptionId } });
      if (loan) {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { subscriptionStatus: 'cancelled' },
        });
      }
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message);
    return res.status(200).send('OK');
  }
});

module.exports = router;
