'use client';

import { useMemo } from 'react';
import { VehicleLoanFormData } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

export default function Section2LoanDetails({ formData, updateFormData }: Props) {
  const { loanDetails } = formData;

  const summary = useMemo(() => {
    const p = parseFloat(loanDetails.loanAmount) || 0;
    const t = parseFloat(loanDetails.tenure) || 0;
    const r = parseFloat(loanDetails.interestRate) || 0;

    if (p > 0 && t > 0) {
      const interest = (p * r * t) / 100;
      const total = p + interest;
      return { totalInterest: interest, totalRepayment: total, emiAmount: total / t };
    }
    return { totalInterest: 0, totalRepayment: 0, emiAmount: 0 };
  }, [loanDetails.loanAmount, loanDetails.tenure, loanDetails.interestRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextLoanDetails = { ...loanDetails, [e.target.name]: e.target.value };
    const p = parseFloat(nextLoanDetails.loanAmount) || 0;
    const t = parseFloat(nextLoanDetails.tenure) || 0;
    const r = parseFloat(nextLoanDetails.interestRate) || 0;
    const emi = p > 0 && t > 0 ? ((p + (p * r * t) / 100) / t).toFixed(2) : '';

    updateFormData({
      loanDetails: { ...nextLoanDetails, emi }
    });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-base">payments</span>
            Loan Request Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Requested Loan Amount (₹) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                <input
                  type="number"
                  name="loanAmount"
                  value={loanDetails.loanAmount}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high border-none rounded-xl pl-8 pr-4 py-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Tenure (Months) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="tenure"
                  value={loanDetails.tenure}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. 12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">
                  Months
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Interest Rate (% Flat p.a.) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="interestRate"
                  value={loanDetails.interestRate}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. 12.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">%</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Calculated EMI (Fixed)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                <input
                  type="text"
                  value={loanDetails.emi}
                  readOnly
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl pl-8 pr-4 py-3.5 text-on-surface outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
          <span className="material-symbols-outlined text-accent text-base mt-0.5">info</span>
          <p className="text-[11px] text-accent/80 leading-relaxed">
            The EMI is calculated based on a <strong>Flat Interest Rate</strong>. This is an indicative calculation. Final EMI may vary based on processing fees, insurance, and other charges.
          </p>
        </div>
      </div>

      <div className="bg-tertiary rounded-2xl overflow-hidden shadow-lg h-fit">
        <div className="bg-white/10 px-6 py-4 border-b border-white/10">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">calculate</span>
            Loan Calculator
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Requested Amount</p>
            <p className="text-white text-2xl font-black">{formatCurrency(parseFloat(loanDetails.loanAmount) || 0)}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <span className="text-white/60 text-xs">Total Interest</span>
              <span className="text-accent font-bold">{formatCurrency(summary.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <span className="text-white/60 text-xs">Total Repayment</span>
              <span className="text-white font-bold text-lg">{formatCurrency(summary.totalRepayment)}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-1">Estimated EMI</span>
              <div className="flex items-baseline gap-2">
                <span className="text-accent text-2xl font-black">{formatCurrency(summary.emiAmount)}</span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">/ Month</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Tenure: {loanDetails.tenure || '0'} Months
            </div>
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Interest: {loanDetails.interestRate || '0'}% p.a.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
