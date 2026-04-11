'use client';

import { VehicleLoanFormData, BankAccountDetails, AccountType } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const ACCOUNT_TYPES: AccountType[] = ['Savings', 'Current', 'OD', 'NRE', 'Others'];

const COLUMNS = [
  { key: 'bankName', label: 'Bank Name', type: 'text', required: true },
  { key: 'branch', label: 'Branch', type: 'text' },
  { key: 'accountSince', label: 'Account Since', type: 'month' },
  { key: 'accountNo', label: 'Account No.', type: 'text', required: true },
  { key: 'ifscCode', label: 'IFSC Code', type: 'text' },
  { key: 'avgDebitPerMonth', label: 'Avg. Debit / Month (₹)', type: 'number' },
  { key: 'avgCreditPerMonth', label: 'Avg. Credit / Month (₹)', type: 'number' },
];

function BankRow({
  label, color, bank, onChange
}: {
  label: string; color: string; bank: BankAccountDetails;
  onChange: (updates: Partial<BankAccountDetails>) => void;
}) {
  const inputCls = `w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all`;

  return (
    <>
      {/* Party Header Row */}
      <tr>
        <td colSpan={COLUMNS.length + 2} className={`px-4 py-2.5 ${color}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-sm">account_balance</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
          </div>
        </td>
      </tr>

      {/* Data Row */}
      <tr className="border-b border-outline-variant/10">
        {/* Fixed label column */}
        <td className="px-3 py-3 align-top w-28">
          <span className="text-xs font-medium text-on-surface-variant">{label}</span>
        </td>

        {/* Account Type */}
        <td className="px-3 py-3 align-top min-w-[130px]">
          <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Account Type</label>
          <select
            value={bank.accountType}
            onChange={e => onChange({ accountType: e.target.value as AccountType })}
            className={`${inputCls} appearance-none`}
          >
            <option value="">Select...</option>
            {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </td>

        {/* Remaining columns */}
        {COLUMNS.map(col => (
          <td key={col.key} className="px-3 py-3 align-top min-w-[130px]">
            <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              {col.label}{col.required && <span className="text-error ml-0.5">*</span>}
            </label>
            <input
              type={col.type}
              value={bank[col.key as keyof BankAccountDetails] as string}
              onChange={e => onChange({ [col.key]: e.target.value } as Partial<BankAccountDetails>)}
              className={inputCls}
              placeholder={col.type === 'number' ? '0.00' : ''}
            />
          </td>
        ))}
      </tr>
    </>
  );
}

export default function Section5BankDetails({ formData, updateFormData }: Props) {
  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-6 bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/20">
        <span className="font-bold text-on-surface">Note:</span> Bank account details for Applicant and Co-Applicant. At minimum, fill in the Applicant&apos;s bank name and account number.
      </p>

      <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
        <table className="w-full min-w-[900px]">
          <tbody>
            <BankRow
              label="Applicant"
              color="bg-primary"
              bank={formData.applicantBank}
              onChange={updates => updateFormData({ applicantBank: { ...formData.applicantBank, ...updates } })}
            />
            <tr className="h-2 bg-surface-container" />
            <BankRow
              label="Co-Applicant"
              color="bg-secondary"
              bank={formData.coApplicantBank}
              onChange={updates => updateFormData({ coApplicantBank: { ...formData.coApplicantBank, ...updates } })}
            />
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {[
          { label: 'Applicant', bank: formData.applicantBank, color: 'bg-primary/5 border-primary/20' },
          { label: 'Co-Applicant', bank: formData.coApplicantBank, color: 'bg-secondary/5 border-secondary/20' },
        ].map(({ label, bank, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">{label} — Summary</p>
            <div className="space-y-1">
              <p className="text-sm font-bold text-on-surface">{bank.bankName || '—'}</p>
              <p className="text-xs text-on-surface-variant">{bank.branch || 'Branch not specified'}</p>
              <div className="flex gap-3 mt-2">
                <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">{bank.accountType || 'Type N/A'}</span>
                <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">{bank.ifscCode || 'IFSC N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
