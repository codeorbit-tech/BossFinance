'use client';

import { VehicleLoanFormData, PhotoUploads } from './types';

interface Props {
  formData: VehicleLoanFormData;
  photos: PhotoUploads;
  onEdit: (section: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  isResubmit?: boolean;
  queryDescription?: string | null;
}

function SectionReviewCard({
  sectionNo, title, icon, onEdit, children
}: {
  sectionNo: number; title: string; icon: string; onEdit: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/10 bg-surface-container/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">{sectionNo}</div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-accent text-base">{icon}</span>
            <h4 className="text-xs font-black text-on-surface uppercase tracking-widest">{title}</h4>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Update
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest shrink-0 w-32">{label}</span>
      <span className="text-sm text-on-surface font-semibold truncate">{value || <span className="text-on-surface-variant/30 italic text-xs font-normal">Not provided</span>}</span>
    </div>
  );
}

function PartyChip({ label, color }: { label: string; color: string }) {
  return <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-wider ${color}`}>{label}</span>;
}

export default function ReviewScreen({ formData, photos, onEdit, onBack, onSubmit, submitting, isResubmit, queryDescription }: Props) {
  const photoCount = Object.values(photos).filter(v => v instanceof File).length 
    + photos.others.filter(v => v instanceof File).length;

  const kycVerifiedDocs = Object.values(formData.kycDocuments).filter(
    d => d.applicantChecked || d.coApplicantChecked || d.guarantorChecked
  ).length;

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Admin Query Banner */}
      {isResubmit && queryDescription && (
        <div className="flex items-start gap-4 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
          <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] mb-1">Attention: Query Details</p>
            <p className="text-sm text-amber-900 font-medium italic leading-relaxed">{queryDescription}</p>
          </div>
        </div>
      )}

      {/* Review Header */}
      <div className="text-center py-6 bg-accent/5 rounded-2xl border border-accent/10">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
          isResubmit ? 'bg-amber-100 border-2 border-amber-300 shadow-lg shadow-amber-200/50' : 'bg-accent/10 border-2 border-accent/30 shadow-lg shadow-accent/20'
        }`}>
          <span className={`material-symbols-outlined text-3xl ${isResubmit ? 'text-amber-600' : 'text-accent'}`}>
            {isResubmit ? 'rate_review' : 'fact_check'}
          </span>
        </div>
        <h3 className="text-xl font-black font-[var(--font-headline)] text-on-surface uppercase tracking-tight">
          {isResubmit ? 'Resubmission Review' : 'Application Review'}
        </h3>
        <p className="text-sm text-on-surface-variant mt-1 font-medium italic">
          {isResubmit ? 'Update the necessary sections and verify before resending.' : 'Verify all details for the vehicle loan application.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Primary Details */}
        <SectionReviewCard sectionNo={1} title="Primary Details" icon="person_outline" onEdit={() => onEdit(1)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { party: 'Applicant', data: formData.applicantPersonal, contact: formData.applicantContact, color: 'bg-primary' },
              { party: 'Co-Applicant', data: formData.coApplicantPersonal, contact: formData.coApplicantContact, color: 'bg-secondary' },
              { party: 'Guarantor', data: formData.guarantorPersonal, contact: formData.guarantorContact, color: 'bg-tertiary' },
            ].map(({ party, data, contact, color }) => (
              <div key={party} className="bg-surface-container rounded-xl p-4 space-y-3 border border-outline-variant/10">
                <PartyChip label={party} color={color} />
                <div className="space-y-1">
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight">{data.firstName || '—'}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">S/O-D/O: {data.fatherFirstName || '—'}</p>
                  <p className="text-xs font-black text-accent mt-2">{contact.mobile || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionReviewCard>

        {/* Section 2: KYC Verification */}
        <SectionReviewCard sectionNo={2} title="KYC Verification" icon="verified_user" onEdit={() => onEdit(2)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
               { party: 'Applicant', aadhaar: formData.kycDocuments.aadhaarCard.applicantDocNo, pan: formData.kycDocuments.panCard.applicantDocNo },
               { party: 'Co-Applicant', aadhaar: formData.kycDocuments.aadhaarCard.coApplicantDocNo, pan: formData.kycDocuments.panCard.coApplicantDocNo },
               { party: 'Guarantor', aadhaar: formData.kycDocuments.aadhaarCard.guarantorDocNo, pan: formData.kycDocuments.panCard.guarantorDocNo },
             ].map(({ party, aadhaar, pan }) => (
               <div key={party} className="p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 border-b border-outline-variant/20 pb-1">{party}</p>
                  <DataRow label="Aadhaar" value={aadhaar} />
                  <DataRow label="PAN" value={pan} />
               </div>
             ))}
          </div>
        </SectionReviewCard>

        {/* Section 3: Loan Details */}
        <SectionReviewCard sectionNo={3} title="Loan Details" icon="payments" onEdit={() => onEdit(3)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container rounded-xl p-3 border border-outline-variant/5">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Principal</p>
              <p className="text-sm font-black text-accent">{formatCurrency(formData.loanDetails.loanAmount)}</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Tenure</p>
              <p className="text-sm font-bold text-on-surface">{formData.loanDetails.tenure || '0'} M</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Rate</p>
              <p className="text-sm font-bold text-on-surface">{formData.loanDetails.interestRate || '0'}%</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3 border border-outline-variant/5">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Monthly EMI</p>
              <p className="text-sm font-black text-accent">{formatCurrency(formData.loanDetails.emi)}</p>
            </div>
          </div>
        </SectionReviewCard>

        {/* Section 10: Property Photos */}
        <SectionReviewCard sectionNo={10} title="Property & ID Photos" icon="photo_camera" onEdit={() => onEdit(10)}>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Party Identification</p>
              <div className="flex gap-4">
                {[
                  { label: 'Applicant', file: photos.applicantPhoto },
                  { label: 'Co-Applicant', file: photos.coApplicantPhoto },
                  { label: 'Guarantor', file: photos.guarantorPhoto },
                ].map(({ label, file }) => (
                  <div key={label} className={`flex flex-col items-center gap-2 p-2 rounded-xl border ${file ? 'border-accent/30 bg-accent/5' : 'border-dashed border-outline-variant/30'}`}>
                    <div className="w-12 h-16 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden">
                       {file ? (
                         <img 
                           src={URL.createObjectURL(file)} 
                           className="w-full h-full object-cover" 
                           onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                         />
                       ) : (
                         <span className="material-symbols-outlined text-lg text-on-surface-variant/30">person</span>
                       )}
                    </div>
                    <span className="text-[9px] font-black text-on-surface uppercase tracking-tighter">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Property Inspection (4 Sides)</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Front', file: photos.houseFrontView },
                  { label: 'Back', file: photos.houseBackView },
                  { label: 'Left', file: photos.houseLeftView },
                  { label: 'Right', file: photos.houseRightView },
                  ...photos.others.filter(Boolean).map((f, i) => ({ label: `Extra ${i + 1}`, file: f })),
                ].map(({ label, file }) => (
                  <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${file ? 'border-accent/40 bg-accent/10 text-accent' : 'border-error/20 bg-error/5 text-error'}`}>
                    <span className="material-symbols-outlined text-xs">{file ? 'check_circle' : 'cancel'}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReviewCard>

        {/* Section 11: Documents */}
        <SectionReviewCard sectionNo={11} title="Document Checklist" icon="checklist" onEdit={() => onEdit(11)}>
          <div className="flex items-center gap-4 text-sm font-black text-on-surface-variant py-2">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">verified</span>
                <span>{kycVerifiedDocs} Records Verified</span>
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">description</span>
                <span>Checklist Certified</span>
             </div>
          </div>
        </SectionReviewCard>
      </div>

      {/* Navigation Buttons */}
      <div className="border-t border-outline-variant/20 pt-8 mt-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-surface-container text-on-surface-variant font-black text-[11px] uppercase tracking-widest hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Cancel & Edit
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className={`w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50 active:scale-95 ${
            isResubmit 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-200' 
            : 'bg-gradient-to-r from-accent to-on-primary-container text-white shadow-accent/20 shadow-lg'
          }`}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined font-black">{isResubmit ? 'replay' : 'verified'}</span>
              {isResubmit ? 'Resubmit Application' : 'Authorize & Submit'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
