'use client';

import { HomeLoanFormData } from './types';
import { useEffect } from 'react';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

export default function Section2LoanDetails({ formData, updateFormData }: Props) {
  // Simple flat interest EMI calculator (same as vehicle for consistency)
  useEffect(() => {
    const p = parseFloat(formData.loanDetails.loanAmount) || 0;
    const r = parseFloat(formData.loanDetails.interestRate) || 0;
    const t = parseFloat(formData.loanDetails.tenure) || 0;

    if (p > 0 && r > 0 && t > 0) {
      const totalInterest = (p * r * t) / 100;
      const totalPayable = p + totalInterest;
      const emi = totalPayable / t;
      
      if (formData.loanDetails.emi !== emi.toFixed(2)) {
        updateFormData({
          loanDetails: { ...formData.loanDetails, emi: emi.toFixed(2) }
        });
      }
    }
  }, [formData.loanDetails.loanAmount, formData.loanDetails.interestRate, formData.loanDetails.tenure]);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">payments</span>
          Home Loan Sizing & Terms
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* principal */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Requested Loan Amount <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input
                type="number"
                value={formData.loanDetails.loanAmount}
                onChange={e => updateFormData({ loanDetails: { ...formData.loanDetails, loanAmount: e.target.value } })}
                placeholder="0.00"
                className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-4 text-xl font-black text-on-surface outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>

          {/* tenure */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Tenure (In Months) <span className="text-error">*</span>
            </label>
            <div className="relative">
               <input
                type="number"
                value={formData.loanDetails.tenure}
                onChange={e => updateFormData({ loanDetails: { ...formData.loanDetails, tenure: e.target.value } })}
                placeholder="e.g. 120"
                className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-xl font-black text-on-surface outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">Months</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Interest Rate (% Flat/Annum) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.loanDetails.interestRate}
                onChange={e => updateFormData({ loanDetails: { ...formData.loanDetails, interestRate: e.target.value } })}
                placeholder="e.g. 9.5"
                className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-xl font-black text-on-surface outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-on-surface-variant">%</span>
            </div>
          </div>

          {/* EMI Display */}
          <div className="bg-tertiary rounded-2xl p-6 shadow-lg shadow-tertiary/20 flex flex-col justify-center">
            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
              Calculated Monthly EMI
            </label>
            <div className="text-3xl font-black text-accent">
              ₹ {parseFloat(formData.loanDetails.emi).toLocaleString() || '0'}
            </div>
            <p className="text-[10px] text-white/40 mt-1 font-medium italic">
              *Based on flat interest calculation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
