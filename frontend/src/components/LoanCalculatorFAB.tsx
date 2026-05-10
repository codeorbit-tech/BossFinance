'use client';

import { useState, useMemo } from 'react';

const FREQUENCIES = [
  { value: 'DAILY', label: 'Daily', unit: 'Days' },
  { value: 'WEEKLY', label: 'Weekly', unit: 'Weeks' },
  { value: 'MONTHLY', label: 'Monthly', unit: 'Months' },
];

export default function LoanCalculatorFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    amount: '10000',
    tenure: '12',
    interestRate: '10',
    frequency: 'MONTHLY',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const summary = useMemo(() => {
    const p = parseFloat(form.amount) || 0;
    const t = parseFloat(form.tenure) || 0;
    const r = parseFloat(form.interestRate) || 0;

    if (p > 0 && t > 0) {
      if (form.frequency === 'DAILY' || form.frequency === 'WEEKLY') {
        const interest = (p * r) / 100;
        return { 
          totalInterest: interest, 
          totalRepayment: p, 
          emiAmount: p / t,
          disbursedAmount: p - interest 
        };
      }
      const interest = (p * r * t) / 100;
      const total = p + interest;
      return { 
        totalInterest: interest, 
        totalRepayment: total, 
        emiAmount: total / t,
        disbursedAmount: p
      };
    }
    return { totalInterest: 0, totalRepayment: 0, emiAmount: 0, disbursedAmount: 0 };
  }, [form.amount, form.tenure, form.interestRate, form.frequency]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const activeUnit = FREQUENCIES.find((f) => f.value === form.frequency)?.unit || 'Months';

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-accent to-on-primary-container text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group border-4 border-surface"
        title="Open Loan Calculator"
      >
        <span className="material-symbols-outlined text-3xl">calculate</span>
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-tertiary text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          EMI Calculator
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-outline-variant/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <span className="material-symbols-outlined text-xl">calculate</span>
            </div>
            <h2 className="text-xl font-bold text-tertiary">Quick Calculator</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Loan Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high border-none rounded-xl pl-8 pr-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-accent font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Repayment Frequency
              </label>
              <div className="flex bg-surface-container-high p-1 rounded-xl">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setForm({ ...form, frequency: freq.value })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      form.frequency === freq.value
                        ? 'bg-white text-tertiary shadow-sm'
                        : 'text-on-surface-variant hover:text-tertiary'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Tenure
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="tenure"
                    value={form.tenure}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high border-none rounded-xl p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">
                    {activeUnit}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Interest Rate (Flat)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="interestRate"
                    value={form.interestRate}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full bg-surface-container-high border-none rounded-xl p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-tertiary rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-white/10 px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Calculation Result</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-white/60 text-xs">Principal Amount</span>
                  <span className="text-white font-bold">{formatCurrency(parseFloat(form.amount) || 0)}</span>
                </div>
                {(form.frequency === 'DAILY' || form.frequency === 'WEEKLY') && (
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-emerald-400/80 text-xs font-bold">Disbursed Amount</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(summary.disbursedAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-white/60 text-xs">
                    {form.frequency === 'DAILY' || form.frequency === 'WEEKLY' ? 'Upfront Interest' : 'Total Interest'}
                  </span>
                  <span className="text-accent font-bold">{formatCurrency(summary.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-white/60 text-xs">Total Repayment</span>
                  <span className="text-white font-bold text-lg">{formatCurrency(summary.totalRepayment)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">EMI Amount</span>
                    <span className="text-accent text-2xl font-black leading-none mt-1">
                      {formatCurrency(summary.emiAmount)}
                    </span>
                  </div>
                  <span className="text-white/40 text-[10px] font-bold rotate-90 tracking-widest uppercase ml-4 text-center">
                    Per<br />{activeUnit.slice(0, -1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
