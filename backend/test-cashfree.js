const axios = require('axios');
require('dotenv').config();

const appId = process.env.CASHFREE_APP_ID;
const secretKey = process.env.CASHFREE_SECRET_KEY;
const envUrl = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

async function testCashfree() {
  try {
    const planId = "plan_" + Date.now();
    
    console.log("Creating plan...");
    const planRes = await axios.post(`${envUrl}/plans`, {
      plan_id: planId,
      plan_name: "Test Plan",
      plan_type: "PERIODIC",
      plan_currency: "INR",
      plan_recurring_amount: 100,
      plan_max_amount: 500,
      plan_intervals: 1,
      plan_interval_type: "MONTH"
    }, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });
    console.log("Plan created:", planRes.data);

    console.log("Creating subscription...");
    const subRes = await axios.post(`${envUrl}/subscriptions`, {
      subscription_id: "sub_" + Date.now(),
      plan_id: planId,
      customer_details: {
        customer_name: "Test User",
        customer_email: "test@example.com",
        customer_phone: "9999999999"
      }
    }, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });

    console.log("Subscription created:", subRes.data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

testCashfree();
