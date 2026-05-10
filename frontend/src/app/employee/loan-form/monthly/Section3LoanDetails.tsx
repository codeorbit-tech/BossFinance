'use client';

import { useMemo } from 'react';
import { MonthlyLoanFormData } from './types';

interface Props {
  formData: MonthlyLoanFormData;
  updateFormData: (u: Partial<MonthlyLoanFormData>) => void;
  errors: string[];
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">{label}</label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)} rows={2} placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium resize-none"
      />
    </div>
  );
}

export default function Section3LoanDetails({ formData, updateFormData }: Props) {
  const summary = useMemo(() => {
    const p = parseFloat(formData.loanAmount) || 0;
    const t = parseFloat(formData.tenure) || 0;
    const r = parseFloat(formData.interestRate) || 0;
    if (p > 0 && t > 0) {
      const interest = (p * r * t) / 100;
      const total = p + interest;
      const emi = total / t;
      return { interest, total, emi };
    }
    return { interest: 0, total: 0, emi: 0 };
  }, [formData.loanAmount, formData.tenure, formData.interestRate]);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleEmiUpdate = (field: string, value: string) => {
    const updates: Partial<MonthlyLoanFormData> = { [field]: value };
    const p = field === 'loanAmount' ? parseFloat(value) || 0 : parseFloat(formData.loanAmount) || 0;
    const t = field === 'tenure' ? parseFloat(value) || 0 : parseFloat(formData.tenure) || 0;
    const r = field === 'interestRate' ? parseFloat(value) || 0 : parseFloat(formData.interestRate) || 0;
    if (p > 0 && t > 0) {
      const interest = (p * r * t) / 100;
      const emi = (p + interest) / t;
      updates.emi = emi.toFixed(2);
    }
    updateFormData(updates as Partial<MonthlyLoanFormData>);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 3: Loan Request Details</h4>
          <p className="text-xs text-on-surface-variant">The EMI will be auto-calculated using flat rate interest.</p>
        </div>
      </div>

      <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-6 space-y-5">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">currency_rupee</span>
          Loan Parameters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
              Loan Amount (₹) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
              <input
                type="number" value={formData.loanAmount}
                onChange={e => handleEmiUpdate('loanAmount', e.target.value)}
                className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Tenure (Months) <span className="text-error">*</span></label>
            <div className="relative">
              <input
                type="number" value={formData.tenure}
                onChange={e => handleEmiUpdate('tenure', e.target.value)}
                className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 pr-20 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">Months</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Interest Rate (Flat %) <span className="text-error">*</span></label>
            <div className="relative">
              <input
                type="number" step="0.1" value={formData.interestRate}
                onChange={e => handleEmiUpdate('interestRate', e.target.value)}
                className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 pr-10 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant">%</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Calculated Monthly EMI</label>
            <div className="bg-tertiary/10 border border-tertiary/20 rounded-xl px-4 py-3 text-sm font-black text-tertiary">
              {summary.emi > 0 ? fmt(summary.emi) : '—'}
            </div>
          </div>
        </div>
        <TextArea label="Purpose of Loan" value={formData.purpose} onChange={v => updateFormData({ purpose: v })} placeholder="e.g., Working capital, personal expenses, medical, education..." />
      </section>

      {/* Summary Box */}
      {summary.emi > 0 && (
        <div className="bg-tertiary rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Principal', value: fmt(parseFloat(formData.loanAmount) || 0) },
            { label: 'Total Interest', value: fmt(summary.interest) },
            { label: 'Total Repayment', value: fmt(summary.total) },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-white font-black text-lg">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
