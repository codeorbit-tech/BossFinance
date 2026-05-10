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
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium"
      />
    </div>
  );
}

function SubSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-6 space-y-5">
      <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function KycRow({ title, icon, aadhaar, pan, onAadhaar, onPan, aadhaarLabel = 'Aadhaar No.', panLabel = 'PAN No.' }: {
  title: string; icon: string;
  aadhaar: string; pan: string;
  onAadhaar: (v: string) => void; onPan: (v: string) => void;
  aadhaarLabel?: string; panLabel?: string;
}) {
  return (
    <SubSection title={title} icon={icon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label={aadhaarLabel} value={aadhaar} onChange={onAadhaar} placeholder="XXXX XXXX XXXX" />
        <Field label={panLabel} value={pan} onChange={onPan} placeholder="ABCDE1234F" />
      </div>
    </SubSection>
  );
}

export default function Section2KycVerification({ formData, updateFormData, errors }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">verified_user</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 2: KYC Verification</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Enter Aadhaar and PAN numbers for all parties. These are mandatory for compliance.
          </p>
        </div>
      </div>

      <KycRow
        title="Applicant KYC" icon="person"
        aadhaar={formData.aadhaarNo} pan={formData.panNo}
        onAadhaar={v => updateFormData({ aadhaarNo: v })}
        onPan={v => updateFormData({ panNo: v })}
        aadhaarLabel="Aadhaar No. *" panLabel="PAN No. *"
      />

      <KycRow
        title="Co-Applicant KYC" icon="group"
        aadhaar={formData.coApplicantAadhaarNo} pan={formData.coApplicantPanNo}
        onAadhaar={v => updateFormData({ coApplicantAadhaarNo: v })}
        onPan={v => updateFormData({ coApplicantPanNo: v })}
      />

      <KycRow
        title="Guarantor KYC" icon="support_agent"
        aadhaar={formData.guarantorAadhaarNo} pan={formData.guarantorPanNo}
        onAadhaar={v => updateFormData({ guarantorAadhaarNo: v })}
        onPan={v => updateFormData({ guarantorPanNo: v })}
      />
    </div>
  );
}
