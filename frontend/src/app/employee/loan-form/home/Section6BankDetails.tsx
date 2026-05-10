'use client';

import { HomeLoanFormData, BankAccountDetails, AccountType } from './types';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

const ACCOUNT_TYPES: AccountType[] = ['Savings', 'Current', 'OD', 'NRE', 'Others'];

function BankForm({
  title, data, onChange, colorClass
}: {
  title: string; data: BankAccountDetails; onChange: (v: Partial<BankAccountDetails>) => void; colorClass: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div className={`w-8 h-8 rounded-lg ${colorClass} text-white flex items-center justify-center font-bold text-xs`}>
           {title.charAt(0)}
        </div>
        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{title} Bank Account</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="md:col-span-2">
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Bank Name *</label>
           <input type="text" value={data.bankName} onChange={e => onChange({ bankName: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Branch</label>
           <input type="text" value={data.branch} onChange={e => onChange({ branch: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Account Type</label>
           <select value={data.accountType} onChange={e => onChange({ accountType: e.target.value as AccountType })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent appearance-none">
             <option value="">Select</option>
             {ACCOUNT_TYPES.map(at => <option key={at} value={at}>{at}</option>)}
           </select>
        </div>
        
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Account Number *</label>
           <input type="text" value={data.accountNo} onChange={e => onChange({ accountNo: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent font-mono" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">IFSC Code</label>
           <input type="text" value={data.ifscCode} onChange={e => onChange({ ifscCode: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent font-mono" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Account Since</label>
           <input type="text" value={data.accountSince} onChange={e => onChange({ accountSince: e.target.value })} placeholder="MM/YYYY" className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Avg Credit/Month (₹)</label>
           <input type="number" value={data.avgCreditPerMonth} onChange={e => onChange({ avgCreditPerMonth: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </div>
    </div>
  );
}

export default function Section6BankDetails({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-10">
       <BankForm 
         title="Applicant" 
         data={formData.applicantBank} 
         onChange={(v) => updateFormData({ applicantBank: { ...formData.applicantBank, ...v }})}
         colorClass="bg-primary"
       />
       <BankForm 
         title="Co-Applicant" 
         data={formData.coApplicantBank} 
         onChange={(v) => updateFormData({ coApplicantBank: { ...formData.coApplicantBank, ...v }})}
         colorClass="bg-secondary"
       />
    </div>
  );
}
