'use client';

import { SimpleLoanFormData, SimplePhotoUploads } from './types';

interface Props {
  formData: SimpleLoanFormData;
  photos: SimplePhotoUploads;
  onEdit: (section: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

function SectionHeader({ title, section, onEdit }: { title: string; section: number; onEdit: (section: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-4 mt-8 first:mt-0">
      <h3 className="text-sm font-black text-tertiary uppercase tracking-widest flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-tertiary/10 flex items-center justify-center text-[10px]">{section}</span>
        {title}
      </h3>
      <button
        onClick={() => onEdit(section)}
        className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
      >
        Edit
      </button>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-outline-variant/5">
      <span className="text-xs text-on-surface-variant font-medium">{label}</span>
      <span className="text-xs text-on-surface font-bold">{value || 'N/A'}</span>
    </div>
  );
}

export default function SimpleReviewScreen({ formData, photos, onEdit, onSubmit, onBack, submitting }: Props) {
  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val) || 0);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-on-surface tracking-tight">Review Application</h2>
        <p className="text-sm text-on-surface-variant mt-1">Please verify all details before final submission.</p>
      </div>

      <div className="space-y-4">
        <SectionHeader title="Applicant & Business" section={1} onEdit={onEdit} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <DataRow label="Applicant Name" value={formData.applicantName} />
          <DataRow label="Phone Number" value={formData.mobile} />
          <DataRow label="Aadhaar Number" value={formData.aadhaarNo} />
          <DataRow label="Shop Name" value={formData.shopName} />
          <DataRow label="Business Type" value={formData.businessType} />
        </div>

        <SectionHeader title="Loan & Bank Details" section={2} onEdit={onEdit} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <DataRow label="Loan Amount" value={formatCurrency(formData.loanAmount)} />
          <DataRow label="Tenure" value={`${formData.tenure} ${formData.frequency === 'DAILY' ? 'Days' : 'Weeks'}`} />
          <DataRow label="Interest Rate" value={`${formData.interestRate}% Flat`} />
          <DataRow label="EMI Amount" value={formatCurrency(formData.emi)} />
          <DataRow label="Bank Name" value={formData.bankName} />
          <DataRow label="Account No" value={formData.accountNo} />
        </div>

        <SectionHeader title="Documents" section={3} onEdit={onEdit} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(photos).map(([key, file]) => (
            file && (
              <div key={key} className="flex flex-col gap-2">
                <div className="aspect-square rounded-xl bg-surface-container overflow-hidden border border-outline-variant/20">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={key} />
                </div>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase text-center truncate">{key}</span>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3.5 rounded-2xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all"
        >
          Back to Edit
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-accent text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Submitting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">verified</span>
              Confirm & Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}
