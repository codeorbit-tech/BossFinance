const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:5000/api/customers/cmp5oyisr0001p7fzt3ae4uqi', {
      headers: { 'Authorization': 'Bearer ' + process.env.TEST_TOKEN }
    });
    const repayments = res.data.customer.loans[0].repayments;
    console.log('Repayments count:', repayments.length);
    console.log('Repayments types:', repayments.map(r => r.paymentType));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// I don't have a token easily, so I'll use a direct prisma check in a script
