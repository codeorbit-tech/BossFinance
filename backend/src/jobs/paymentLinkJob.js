const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

/**
 * Payment Link Generation Job
 * Runs daily to send payment links for EMIs due today
 * if the subscription is not active.
 */
async function processDailyPaymentLinks() {
  console.log('[PaymentLinkJob] Checking for EMIs due today...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all installments due today that are not paid
    const dueToday = await prisma.installment.findMany({
      where: {
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ['UPCOMING', 'PARTIAL', 'OVERDUE'] },
      },
      include: {
        loan: {
          include: {
            customer: true,
          },
        },
      },
    });

    console.log(`[PaymentLinkJob] Found ${dueToday.length} installments due today.`);

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const envUrl = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const cfHeaders = {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': '2023-08-01',
    };

    for (const inst of dueToday) {
      // Skip if subscription is active
      if (inst.loan.subscriptionStatus === 'active') {
        console.log(`[PaymentLinkJob] Skipping Inst #${inst.id} - Subscription is active.`);
        continue;
      }

      // Check if we already sent a payment link to this customer today
      const alreadySent = await prisma.notification.findFirst({
        where: {
          customerId: inst.loan.customerId,
          template: 'PAYMENT_LINK',
          sentAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      if (alreadySent) {
        console.log(`[PaymentLinkJob] Skipping Inst #${inst.id} - Link already sent to customer today.`);
        continue;
      }

      try {
        const linkId = `link_loan_${inst.loan.id}_${Date.now().toString().slice(-4)}`;
        const amount = (inst.totalRemaining || 0) + (inst.penalInterest || 0) - (inst.penaltyPaid || 0);

        if (amount < 1) continue;

        const payload = {
          customer_details: {
            customer_phone: inst.loan.customer.phone || '9999999999',
            customer_name: inst.loan.customer.name || 'Customer',
            customer_email: inst.loan.customer.email || 'test@cashfree.com',
          },
          link_id: linkId,
          link_amount: Math.round(amount),
          link_currency: 'INR',
          link_purpose: `Loan EMI Payment - Installment #${inst.installmentNumber}`,
          link_notify: {
            send_sms: true,
            send_email: true,
          },
          link_meta: {
            return_url: `${process.env.FRONTEND_URL}/repayments?link_id={link_id}`,
          },
        };

        const response = await axios.post(`${envUrl}/links`, payload, { headers: cfHeaders });
        
        console.log(`[PaymentLinkJob] Created link for Inst #${inst.id}: ${response.data.link_url}`);

        // Record notification
        await prisma.notification.create({
          data: {
            customerId: inst.loan.customerId,
            channel: 'SMS',
            template: 'PAYMENT_LINK',
            message: `Your EMI of ₹${amount} is due today. Pay here: ${response.data.link_url}`,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

      } catch (err) {
        console.error(`[PaymentLinkJob] Failed to create link for Inst #${inst.id}:`, err.response?.data || err.message);
      }
    }

    console.log('[PaymentLinkJob] Job completed.');
  } catch (err) {
    console.error('[PaymentLinkJob] ERROR:', err);
  }
}

function initPaymentLinkJob() {
  // '5 0 * * *' = 12:05 AM every day
  cron.schedule('5 0 * * *', () => {
    processDailyPaymentLinks();
  });

  // Optional: Run once on startup
  // processDailyPaymentLinks();
}

module.exports = { initPaymentLinkJob, processDailyPaymentLinks };
