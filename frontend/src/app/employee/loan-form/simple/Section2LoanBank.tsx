'use client';

import { SimpleLoanFormData } from './types';

interface Props {
  formData: SimpleLoanFormData;
  updateFormData: (updates: Partial<SimpleLoanFormData>) => void;
  errors: string[];
}

export default function Section2LoanBank({ formData, updateFormData, errors }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const calculateEmi = (amount: string, tenure: string, rate: string) => {
    const p = parseFloat(amount) || 0;
    const t = parseFloat(tenure) || 0;
    const r = parseFloat(rate) || 0;
    if (p > 0 && t > 0) {
      if (formData.frequency === 'DAILY' || formData.frequency === 'WEEKLY') {
        return (p / t).toFixed(2);
      }
      const interest = (p * r * t) / 100;
      const total = p + interest;
      return (total / t).toFixed(2);
    }
    return '0.00';
  };

  const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updates: Partial<SimpleLoanFormData> = { [name]: value };
    
    // Auto-calculate EMI if amount, tenure or rate changes
    const amount = name === 'loanAmount' ? value : formData.loanAmount;
    const tenure = name === 'tenure' ? value : formData.tenure;
    const rate = name === 'interestRate' ? value : formData.interestRate;
    
    updates.emi = calculateEmi(amount, tenure, rate);
    updateFormData(updates);
  };

  return (
    <div className="space-y-8">
      {/* Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Loan Amount (₹) <span className="text-error">*</span>
          </label>
          <input
            type="number"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleLoanChange}
            className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Tenure ({formData.frequency === 'DAILY' ? 'Days' : formData.frequency === 'WEEKLY' ? 'Weeks' : 'Months'}) <span className="text-error">*</span>
          </label>
          <input
            type="number"
            name="tenure"
            value={formData.tenure}
            onChange={handleLoanChange}
            className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Interest Rate (% Flat)
          </label>
          <input
            type="number"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleLoanChange}
            step="0.1"
            className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Calculated EMI (₹)
          </label>
          <input
            type="text"
            name="emi"
            value={formData.emi}
            readOnly
            className="w-full bg-surface-container/50 border-none rounded-xl p-3.5 text-accent font-black outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {(formData.frequency === 'DAILY' || formData.frequency === 'WEEKLY') && parseFloat(formData.loanAmount) > 0 && parseFloat(formData.interestRate) > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex gap-4 items-start">
          <span className="material-symbols-outlined text-accent text-xl mt-0.5">local_atm</span>
          <div>
            <h4 className="text-accent font-bold text-sm mb-1">Upfront Interest Deduction Applied</h4>
            <p className="text-accent/80 text-xs leading-relaxed mb-3">
              For Daily and Weekly loans, interest is charged upfront based on a flat percentage of the principal. The customer pays back only the principal amount spread across the tenure.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-white/50 p-2.5 rounded-lg border border-accent/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-0.5">Upfront Interest</p>
                <p className="font-black text-accent">₹{((parseFloat(formData.loanAmount) * parseFloat(formData.interestRate)) / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white/50 p-2.5 rounded-lg border border-accent/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-0.5">Amount Disbursed</p>
                <p className="font-black text-emerald-600">₹{(parseFloat(formData.loanAmount) - ((parseFloat(formData.loanAmount) * parseFloat(formData.interestRate)) / 100)).toFixed(2)}</p>
              </div>
              <div className="bg-white/50 p-2.5 rounded-lg border border-accent/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-0.5">Calculated EMI</p>
                <p className="font-black text-tertiary">₹{formData.emi}</p>
              </div>
              <div className="bg-white/50 p-2.5 rounded-lg border border-accent/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-0.5">Total Repayment</p>
                <p className="font-black text-tertiary">₹{formData.loanAmount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* Bank Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Account Number
          </label>
          <input
            type="text"
            name="accountNo"
            value={formData.accountNo}
            onChange={handleChange}
            className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent uppercase"
          />
        </div>
      </div>

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* Guarantor Details */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-sm">shield_person</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Guarantor Details</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Guarantor Name
            </label>
            <input
              type="text"
              name="guarantorName"
              value={formData.guarantorName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Father / Husband Name
            </label>
            <input
              type="text"
              name="guarantorFatherHusbandName"
              value={formData.guarantorFatherHusbandName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Relation to Applicant
            </label>
            <input
              type="text"
              name="guarantorRelation"
              value={formData.guarantorRelation}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50"
              placeholder="e.g. Spouse, Friend, Parent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              name="guarantorMobile"
              value={formData.guarantorMobile}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="guarantorDob"
              value={formData.guarantorDob}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Gender
            </label>
            <select
              name="guarantorGender"
              value={formData.guarantorGender}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50 appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Aadhaar Number
            </label>
            <input
              type="text"
              name="guarantorAadhaarNo"
              value={formData.guarantorAadhaarNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50"
              maxLength={12}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              PAN Number
            </label>
            <input
              type="text"
              name="guarantorPanNo"
              value={formData.guarantorPanNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-error/50 uppercase"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Residential Address
            </label>
            <textarea
              name="guarantorAddress"
              value={formData.guarantorAddress}
              onChange={handleChange}
              rows={2}
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-error/50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
