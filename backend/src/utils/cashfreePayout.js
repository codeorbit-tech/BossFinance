const axios = require('axios');

async function getPayoutToken() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const envUrl = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
    ? 'https://payout-api.cashfree.com/payout/v1/authorize'
    : 'https://payout-gamma.cashfree.com/payout/v1/authorize';

  try {
    const response = await axios.post(envUrl, {}, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
      }
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Cashfree Payout Authorization Error:', error.response?.data || error.message);
    throw new Error('Failed to authorize with Cashfree Payouts');
  }
}

async function requestTransfer(payoutData) {
  const token = await getPayoutToken();
  const envUrl = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
    ? 'https://payout-api.cashfree.com/payout/v1'
    : 'https://payout-gamma.cashfree.com/payout/v1';

  try {
    // 1. Try to add beneficiary (it might already exist, but this is safer)
    try {
      await axios.post(`${envUrl}/addBeneficiary`, payoutData.beneDetails, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('[CashfreePayout] Beneficiary added/already exists');
    } catch (beneErr) {
      // Ignore "Beneficiary already exists" error (usually 409 or specific code)
      const msg = beneErr.response?.data?.message || "";
      if (!msg.toLowerCase().includes('already exists')) {
        console.warn('[CashfreePayout] Add Beneficiary Warning:', msg);
      }
    }

    // 2. Initiate Transfer
    const transferPayload = {
      beneId: payoutData.beneDetails.beneId,
      amount: payoutData.amount,
      transferId: payoutData.transferId,
      transferMode: payoutData.transferMode || 'banktransfer',
    };

    const response = await axios.post(`${envUrl}/requestTransfer`, transferPayload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Cashfree Payout Transfer Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initiate Cashfree Payout');
  }
}

module.exports = { requestTransfer };
