'use client';

import { MonthlyLoanFormData } from './types';

interface Props {
  formData: MonthlyLoanFormData;
  updateFormData: (u: Partial<MonthlyLoanFormData>) => void;
  errors: string[];
}

function Field({ label, value, onChange, placeholder, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
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

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all appearance-none font-medium"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function Section5BankDetails({ formData, updateFormData, errors }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">account_balance</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 5: Bank Account Details</h4>
          <p className="text-xs text-on-surface-variant">Bank account where the loan will be disbursed.</p>
        </div>
      </div>

      <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-6 space-y-5">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">account_balance</span>
          Applicant Bank Account
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Bank Name" value={formData.bankName} onChange={v => updateFormData({ bankName: v })} placeholder="e.g. State Bank of India" required />
          <Field label="Branch" value={formData.branch} onChange={v => updateFormData({ branch: v })} placeholder="Branch name" />
          <SelectField
            label="Account Type" value={formData.accountType}
            onChange={v => updateFormData({ accountType: v })}
            options={['Savings', 'Current', 'Overdraft']} required
          />
          <Field label="Account No." value={formData.accountNo} onChange={v => updateFormData({ accountNo: v })} placeholder="Enter account number" required />
          <Field label="IFSC Code" value={formData.ifscCode} onChange={v => updateFormData({ ifscCode: v })} placeholder="e.g. SBIN0001234" required />
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Avg Monthly Income (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
              <input
                type="number" value={formData.avgMonthlyIncome}
                onChange={e => updateFormData({ avgMonthlyIncome: e.target.value })}
                className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
