const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/cashfree/loans/:loanId/create-subscription
router.post('/loans/:loanId/create-subscription', authenticate, async (req, res) => {
  try {
    const { loanId } = req.params;

    // Fetch the loan including its customer
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { customer: true },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const envUrl = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    if (!appId || !secretKey) {
      return res.status(500).json({ error: 'Cashfree credentials not configured.' });
    }

    const frequencyMap = {
      DAILY:   'DAY',
      WEEKLY:  'WEEK',
      MONTHLY: 'MONTH',
    };
    const cfIntervalType = frequencyMap[loan.frequency] || 'MONTH';

    const amount = Math.round(loan.emi);
    if (amount < 1) {
      return res.status(400).json({ error: `EMI amount ₹${loan.emi} is too low for Autopay (minimum ₹1)` });
    }

    const cfHeaders = {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': '2023-08-01'
    };

    // 1. Create unique IDs for this attempt
    const planId = `plan_${loan.id.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
    const subId = `sub_${loan.id.slice(0, 8)}_${Date.now().toString().slice(-6)}`;
    
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years instead of 10

    // Step A: Create the Plan first
    await axios.post(`${envUrl}/plans`, {
      plan_id: planId,
      plan_name: `Loan EMI - ${loan.id.slice(0, 5)}`,
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
        customer_name: loan.customer.name || 'Test Customer',
        customer_email: loan.customer.email || 'test@cashfree.com',
        customer_phone: loan.customer.phone || '9999999999'
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

    console.log('[CASHFREE] Creating UPI-first subscription:', {
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
      where: { id: loanId },
      data: {
        razorpayPlanId: planId,
        razorpaySubscriptionId: subId,
        subscriptionShortUrl: authLink,
        subscriptionStatus: 'pending_authorization',
      },
    });

    return res.json({
      success: true,
      subscriptionId: subId,
      shortUrl: authLink,
      frequency: cfIntervalType,
    });
  } catch (err) {
    console.error('Create subscription error DETAILS:', err.response?.data || err.message);
    if (err.response?.data?.message) {
      console.error('Cashfree Error Message:', err.response.data.message);
    }
    const errorMessage = err.response?.data?.message || err.message || 'Failed to create subscription.';
    return res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;
