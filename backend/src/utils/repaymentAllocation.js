function allocateRepayment({ amount, loan, installments }) {
  let remainingAmount = parseFloat(amount);
  const isUpfront = loan.frequency === 'DAILY' || loan.frequency === 'WEEKLY';
  const interestPerInstallment = isUpfront ? 0 : (loan.amount * loan.interestRate) / 100;

  const totals = {
    penalty: 0,
    interest: 0,
    principal: 0,
  };

  const allocations = [];

  for (const inst of installments) {
    if (remainingAmount <= 0) break;

    // Penalty skipped as per new requirement: penalties are settled at the end.
    const penalty = 0;

    const interestDue = Math.max(0, interestPerInstallment - inst.interestPaid);
    const interest = Math.min(remainingAmount, interestDue);
    remainingAmount -= interest;

    const principalPaid = Math.max(0, inst.amountPaid - inst.interestPaid - inst.penaltyPaid);
    const principalDue = Math.max(0, (inst.expectedAmount - interestPerInstallment) - principalPaid);
    const principal = Math.min(remainingAmount, principalDue);
    remainingAmount -= principal;

    const total = penalty + interest + principal;
    if (total <= 0) continue;

    totals.penalty += penalty;
    totals.interest += interest;
    totals.principal += principal;

    // totalRemaining for status tracking now ignores penalInterest until settlement
    const totalRemaining = Math.max(0, inst.expectedAmount - (inst.amountPaid + total - inst.penaltyPaid));
    
    allocations.push({
      installmentId: inst.id,
      penalty,
      interest,
      principal,
      total,
      totalRemaining,
      status: totalRemaining <= 0 ? 'PAID' : 'PARTIAL',
    });
  }

  return {
    allocations,
    totals,
    unappliedAmount: remainingAmount,
  };
}

module.exports = { allocateRepayment };
