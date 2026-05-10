const assert = require('assert');
const { allocateRepayment } = require('./src/utils/repaymentAllocation');

const loan = { amount: 10000, interestRate: 2 };

const result = allocateRepayment({
  amount: 750,
  loan,
  installments: [
    {
      id: 'inst-1',
      expectedAmount: 1000,
      amountPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
      penalInterest: 50,
      totalRemaining: 1050,
    },
    {
      id: 'inst-2',
      expectedAmount: 1000,
      amountPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
      penalInterest: 0,
      totalRemaining: 1000,
    },
  ],
});

assert.deepStrictEqual(result.totals, {
  penalty: 0,
  interest: 200,
  principal: 550,
});
assert.strictEqual(result.unappliedAmount, 0);
assert.deepStrictEqual(result.allocations, [
  {
    installmentId: 'inst-1',
    penalty: 0,
    interest: 200,
    principal: 550,
    total: 750,
    totalRemaining: 250,
    status: 'PARTIAL',
  },
]);

const fullPayment = allocateRepayment({
  amount: 2200,
  loan,
  installments: [
    {
      id: 'inst-1',
      expectedAmount: 1000,
      amountPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
      penalInterest: 50,
      totalRemaining: 1050,
    },
    {
      id: 'inst-2',
      expectedAmount: 1000,
      amountPaid: 0,
      interestPaid: 0,
      penaltyPaid: 0,
      penalInterest: 0,
      totalRemaining: 1000,
    },
  ],
});

assert.deepStrictEqual(fullPayment.totals, {
  penalty: 0,
  interest: 400,
  principal: 1600,
});
assert.strictEqual(fullPayment.unappliedAmount, 200);
assert.strictEqual(fullPayment.allocations[0].status, 'PAID');
assert.strictEqual(fullPayment.allocations[1].status, 'PAID');

console.log('Repayment allocation tests passed.');
