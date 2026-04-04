'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const LOAN_TYPES = [
  { value: 'HOME', label: 'Home Loan', icon: 'home' },
  { value: 'VEHICLE', label: 'Vehicle Loan', icon: 'directions_car' },
  { value: 'PERSONAL', label: 'Personal Loan', icon: 'person' },
  { value: 'BUSINESS', label: 'Business Loan', icon: 'business' },
  { value: 'DAILY', label: 'Daily Loan', icon: 'today' },
];

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];

export default function LoanFormPage() {
  const [form, setForm] = useState({
    customerId: '', loanType: '', amount: '', tenure: '',
    interestRate: '', emi: '', frequency: 'MONTHLY',
    purpose: '', guarantorName: '', guarantorPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.loanType || !form.amount) {
      toast.error('Customer ID, loan type, and amount are required.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('Loan application submitted successfully!');
      setLoading(false);
    }, 1500);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Loan Application</h2>
        <p className="text-on-surface-variant text-sm">Fill loan details for an existing customer. PDF will be generated and sent to admin.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-8 rounded-xl max-w-4xl">
        {/* Customer ID */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Customer ID <span className="text-error">*</span></label>
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              placeholder="e.g. BF-2024-001"
              className="w-full bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Loan Type Selection */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Loan Type <span className="text-error">*</span></label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {LOAN_TYPES.map((lt) => (
              <button
                key={lt.value}
                type="button"
                onClick={() => setForm({ ...form, loanType: lt.value })}
                className={`p-4 rounded-xl text-center transition-all ${
                  form.loanType === lt.value
                    ? 'bg-accent/10 border-2 border-accent text-accent'
                    : 'bg-surface border-2 border-transparent hover:border-outline-variant/30 text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-2xl block mb-1">{lt.icon}</span>
                <span className="text-xs font-bold">{lt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loan Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Loan Amount (₹) <span className="text-error">*</span></label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tenure (months)</label>
            <input type="number" name="tenure" value={form.tenure} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Interest Rate (%)</label>
            <input type="number" name="interestRate" value={form.interestRate} onChange={handleChange} step="0.1" className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">EMI Amount (₹)</label>
            <input type="number" name="emi" value={form.emi} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Frequency</label>
            <select name="frequency" value={form.frequency} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none">
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Purpose of Loan</label>
          <textarea name="purpose" value={form.purpose} onChange={handleChange} rows={2} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none" />
        </div>

        {/* Guarantor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Guarantor Name</label>
            <input type="text" name="guarantorName" value={form.guarantorName} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Guarantor Phone</label>
            <input type="tel" name="guarantorPhone" value={form.guarantorPhone} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg p-3 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-gradient-to-r from-accent to-on-primary-container text-white font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">{loading ? 'progress_activity' : 'send'}</span>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
