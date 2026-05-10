'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const FREQUENCIES = [
  { value: 'DAILY', label: 'Daily', icon: 'auto_schedule', description: 'Daily repayment schedule for quick turnover', color: 'from-pink-500/10 to-pink-600/5', activeBorder: 'border-pink-400', activeIcon: 'text-pink-500' },
  { value: 'WEEKLY', label: 'Weekly', icon: 'event_repeat', description: 'Weekly repayment for small business cashflow', color: 'from-blue-500/10 to-blue-600/5', activeBorder: 'border-blue-400', activeIcon: 'text-blue-500' },
  { value: 'MONTHLY', label: 'Monthly', icon: 'calendar_month', description: 'Standard monthly EMI for large loans', color: 'from-accent/10 to-on-primary-container/5', activeBorder: 'border-accent', activeIcon: 'text-accent' },
];

interface LoanOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  fullForm?: boolean;
}

const LOAN_OPTIONS_MAP: Record<string, LoanOption[]> = {
  MONTHLY: [
    { value: 'HOME', label: 'Home Loan', icon: 'home', description: 'Property and construction financing', fullForm: true },
    { value: 'VEHICLE', label: 'Vehicle Loan', icon: 'directions_car', description: 'Car, bike, or transport financing', fullForm: true },
    { value: 'PERSONAL', label: 'Personal Loan', icon: 'person', description: 'Unsecured personal financing', fullForm: true },
    { value: 'BUSINESS', label: 'Business Loan', icon: 'business', description: 'Large business growth financing', fullForm: true },
  ],
  WEEKLY: [
    { value: 'SHOP', label: 'Shop Loan', icon: 'shopping_bag', description: 'For employees working in shops', fullForm: true },
    { value: 'BUSINESS', label: 'Business Loan', icon: 'storefront', description: 'Focus on local business owners', fullForm: true },
    { value: 'PERSONAL', label: 'Personal Loan', icon: 'person', description: 'Personal financing needs', fullForm: true },
  ],
  DAILY: [
    { value: 'SHOP', label: 'Shop Loan', icon: 'shopping_bag', description: 'For employees working in shops', fullForm: true },
    { value: 'BUSINESS', label: 'Business Loan', icon: 'storefront', description: 'Focus on local business owners', fullForm: true },
    { value: 'PERSONAL', label: 'Personal Loan', icon: 'person', description: 'Personal financing needs', fullForm: true },
  ]
};

export default function LoanFormPage() {
  const router = useRouter();
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedLoanType, setSelectedLoanType] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [form, setForm] = useState({
    name: '', phone: '', address: '', aadhaar: '', pan: '', occupation: '',
    customerId: '',
    loanType: '', amount: '', tenure: '',
    interestRate: '', emi: '', frequency: 'MONTHLY',
    purpose: '', guarantorName: '', guarantorPhone: '',
  });

  const [loading, setLoading] = useState(false);

  const summary = useMemo(() => {
    const p = parseFloat(form.amount) || 0;
    const t = parseFloat(form.tenure) || 0;
    const r = parseFloat(form.interestRate) || 0;

    if (p > 0 && t > 0) {
      if (form.frequency === 'DAILY' || form.frequency === 'WEEKLY') {
        const interest = (p * r) / 100;
        return { 
          totalInterest: interest, 
          totalRepayment: p, // Customer only repays principal
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFrequencySelect = (value: string) => {
    setSelectedFrequency(value);
    setSelectedLoanType('');
    setForm(prev => ({ ...prev, frequency: value, loanType: '' }));
  };

  const handleLoanTypeSelect = (value: string) => {
    setSelectedLoanType(value);
    setForm(prev => ({ ...prev, loanType: value }));

    if (value === 'VEHICLE') {
      router.push('/employee/loan-form/vehicle');
      return;
    }
    if (value === 'HOME') {
      router.push('/employee/loan-form/home');
      return;
    }

    if (selectedFrequency === 'MONTHLY' && (value === 'PERSONAL' || value === 'BUSINESS')) {
      router.push(`/employee/loan-form/monthly?type=${value}`);
      return;
    }

    // Redirect to simple form for all other types (Daily, Weekly)
    router.push(`/employee/loan-form/simple?type=${value}&freq=${selectedFrequency}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewCustomer) {
      if (!form.name || !form.phone || !form.loanType || !form.amount) {
        toast.error('Customer name, phone, loan type, and amount are required.');
        return;
      }
    } else {
      if (!form.customerId || !form.loanType || !form.amount) {
        toast.error('Customer ID, loan type, and amount are required.');
        return;
      }
    }
    setLoading(true);
    setTimeout(() => {
      toast.success(isNewCustomer ? 'Customer & Loan Application created!' : 'Loan Application submitted!');
      setLoading(false);
    }, 1500);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const showBasicForm = selectedLoanType && selectedLoanType !== 'VEHICLE' && selectedLoanType !== 'HOME';

  return (
    <div className="pb-12 pr-0 xl:pr-[360px]">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">
          Loan Application
        </h2>
        <p className="text-on-surface-variant text-sm">
          Select a loan type to get started. Vehicle Loan includes a full multi-section application.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="space-y-8 flex-1 w-full">

          {/* Phase 1: Frequency Selector */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">1</div>
              <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Select Frequency</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FREQUENCIES.map((freq) => {
                const isSelected = selectedFrequency === freq.value;
                return (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => handleFrequencySelect(freq.value)}
                    className={`relative p-6 rounded-2xl text-left transition-all group border-2 bg-gradient-to-br ${freq.color} ${
                      isSelected
                        ? `${freq.activeBorder} shadow-md`
                        : 'border-transparent hover:border-outline-variant/30 bg-surface-container-high'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-4xl block mb-3 transition-transform ${
                      isSelected ? freq.activeIcon : 'text-on-surface-variant'
                    } ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {freq.icon}
                    </span>
                    <p className={`text-base font-bold mb-1 ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {freq.label}
                    </p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-70">{freq.description}</p>
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-accent text-white rounded-full p-1 leading-none animate-in zoom-in-50 duration-300">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phase 2: Loan Type Selector (Shows only after frequency is selected) */}
          {selectedFrequency && (
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary font-bold text-lg">2</div>
                <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Select Loan Type</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(LOAN_OPTIONS_MAP[selectedFrequency] || []).map((lt) => {
                  const isSelected = selectedLoanType === lt.value;
                  return (
                    <button
                      key={lt.value}
                      type="button"
                      onClick={() => handleLoanTypeSelect(lt.value)}
                      className={`relative p-5 rounded-2xl text-left transition-all group border-2 ${
                        isSelected
                          ? `border-accent shadow-md bg-white`
                          : `border-transparent hover:border-outline-variant/30 bg-surface-container-high`
                      }`}
                    >
                      {lt.fullForm && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Full Form</span>
                        </div>
                      )}

                      <span className={`material-symbols-outlined text-3xl block mb-3 transition-transform ${
                        isSelected ? 'text-accent' : 'text-on-surface-variant'
                      } ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                        {lt.icon}
                      </span>
                      <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {lt.label}
                      </p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-80">{lt.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Basic Loan Form — Only shown for non-vehicle types */}
          {showBasicForm && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">2</div>
                    <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Customer Details</h3>
                  </div>
                  <div className="flex bg-surface-container-high p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsNewCustomer(true)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isNewCustomer ? 'bg-white text-tertiary shadow-sm' : 'text-on-surface-variant hover:text-tertiary'}`}
                    >
                      New Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewCustomer(false)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isNewCustomer ? 'bg-white text-tertiary shadow-sm' : 'text-on-surface-variant hover:text-tertiary'}`}
                    >
                      Existing Customer
                    </button>
                  </div>
                </div>

                {!isNewCustomer ? (
                  <div className="max-w-md">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Search Customer (ID or Phone)
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                      <input
                        type="text"
                        name="customerId"
                        value={form.customerId}
                        onChange={handleChange}
                        placeholder="e.g. BF-2024-001"
                        className="w-full bg-surface-container-high border-none rounded-xl pl-10 pr-4 py-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        Full Name <span className="text-error">*</span>
                      </label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Address</label>
                      <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Loan Info Section */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">3</div>
                  <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Loan Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Loan Amount (₹) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                      <input type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl pl-8 pr-4 py-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tenure</label>
                    <div className="relative">
                      <input type="number" name="tenure" value={form.tenure} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">
                        {form.frequency === 'DAILY' ? 'Days' : 'Months'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Payment Frequency</label>
                    <select name="frequency" value={form.frequency} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent appearance-none capitalize">
                      {FREQUENCIES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Interest Rate (% Flat)</label>
                    <div className="relative">
                      <input type="number" name="interestRate" value={form.interestRate} onChange={handleChange} step="0.1" className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Guarantor Name</label>
                    <input type="text" name="guarantorName" value={form.guarantorName} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Guarantor Phone</label>
                    <input type="tel" name="guarantorPhone" value={form.guarantorPhone} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-12 py-4 bg-gradient-to-r from-accent to-on-primary-container text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 active:scale-95"
              >
                <span className="material-symbols-outlined">{loading ? 'progress_activity' : 'verified'}</span>
                {loading ? 'Processing...' : isNewCustomer ? 'Register & Apply for Loan' : 'Submit Loan Application'}
              </button>
            </form>
          )}
        </div>

        {/* Fixed Loan Summary Card */}
        {showBasicForm && (
          <div className="hidden xl:block">
            <div className="fixed right-12 top-1/2 -translate-y-1/2 w-80 bg-tertiary rounded-2xl overflow-hidden shadow-2xl z-10">
              <div className="bg-white/10 px-6 py-4 border-b border-white/10">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Loan Summary</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Principal Amount</p>
                  <p className="text-white text-2xl font-black">{formatCurrency(parseFloat(form.amount) || 0)}</p>
                </div>
                <div className="space-y-4">
                  {(form.frequency === 'DAILY' || form.frequency === 'WEEKLY') && (
                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                      <span className="text-emerald-400/80 text-xs font-bold">Disbursed Amount</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(summary.disbursedAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-white/60 text-xs">{form.frequency === 'DAILY' || form.frequency === 'WEEKLY' ? 'Upfront Interest' : 'Total Interest'}</span>
                    <span className="text-accent font-bold">{formatCurrency(summary.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-white/60 text-xs">Repayment Total</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(summary.totalRepayment)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Calculated EMI</span>
                      <span className="text-accent text-xl font-black leading-none mt-1">{formatCurrency(summary.emiAmount)}</span>
                    </div>
                    <span className="text-white/40 text-[10px] font-bold rotate-90 tracking-widest uppercase">
                      Per {form.frequency === 'DAILY' ? 'Day' : form.frequency === 'WEEKLY' ? 'Week' : 'Month'}
                    </span>
                  </div>
                </div>
                <div className="bg-accent/10 rounded-xl p-4 flex gap-3 items-start border border-accent/20">
                  <span className="material-symbols-outlined text-accent text-lg mt-0.5">info</span>
                  <p className="text-accent/90 text-[10px] font-medium leading-relaxed">
                    {form.frequency === 'DAILY' || form.frequency === 'WEEKLY' 
                      ? 'Upfront interest is deducted from the principal. EMI includes principal only.' 
                      : 'Flat interest calculation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
