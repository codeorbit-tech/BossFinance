'use client';

import { MonthlyLoanFormData } from './types';

interface Props {
  formData: MonthlyLoanFormData;
  updateFormData: (u: Partial<MonthlyLoanFormData>) => void;
  errors: string[];
}

function Field({ label, value, onChange, type = 'text', placeholder, required, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium disabled:opacity-50"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
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

export default function Section1PrimaryDetails({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">person</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 1: Primary Identification</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Enter the personal details for the Applicant, Co-Applicant, and Guarantor.
          </p>
        </div>
      </div>

      {/* Application Info */}
      <SubSection title="Application Info" icon="description">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Application Form No." value={formData.applicationFormNo} onChange={() => {}} disabled />
          <Field label="Application Date" type="date" value={formData.applicationDate} onChange={v => updateFormData({ applicationDate: v })} required />
        </div>
      </SubSection>

      {/* Applicant */}
      <SubSection title="Applicant Details" icon="person">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Full Name" value={formData.applicantName} onChange={v => updateFormData({ applicantName: v })} required />
          <Field label="Father / Husband Name" value={formData.fatherHusbandName} onChange={v => updateFormData({ fatherHusbandName: v })} required />
          <Field label="Date of Birth" type="date" value={formData.dob} onChange={v => updateFormData({ dob: v })} />
          <SelectField label="Gender" value={formData.gender} onChange={v => updateFormData({ gender: v })} options={['Male', 'Female', 'Other']} />
          <Field label="Mobile Number" type="tel" value={formData.mobile} onChange={v => updateFormData({ mobile: v })} required />
          <Field label="Alternate Mobile" type="tel" value={formData.alternateMobile} onChange={v => updateFormData({ alternateMobile: v })} />
          <Field label="Email" type="email" value={formData.email} onChange={v => updateFormData({ email: v })} />
          <Field label="Occupation" value={formData.occupation} onChange={v => updateFormData({ occupation: v })} />
        </div>
      </SubSection>

      {/* Co-Applicant */}
      <SubSection title="Co-Applicant Details" icon="group">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Full Name" value={formData.coApplicantName} onChange={v => updateFormData({ coApplicantName: v })} />
          <Field label="Relation to Applicant" value={formData.coApplicantRelation} onChange={v => updateFormData({ coApplicantRelation: v })} />
          <Field label="Mobile Number" type="tel" value={formData.coApplicantMobile} onChange={v => updateFormData({ coApplicantMobile: v })} />
          <Field label="Date of Birth" type="date" value={formData.coApplicantDob} onChange={v => updateFormData({ coApplicantDob: v })} />
          <SelectField label="Gender" value={formData.coApplicantGender} onChange={v => updateFormData({ coApplicantGender: v })} options={['Male', 'Female', 'Other']} />
          <Field label="Occupation" value={formData.coApplicantOccupation} onChange={v => updateFormData({ coApplicantOccupation: v })} />
        </div>
      </SubSection>

      {/* Guarantor */}
      <SubSection title="Guarantor Details" icon="support_agent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Full Name" value={formData.guarantorName} onChange={v => updateFormData({ guarantorName: v })} required />
          <Field label="Relation to Applicant" value={formData.guarantorRelation} onChange={v => updateFormData({ guarantorRelation: v })} />
          <Field label="Mobile Number" type="tel" value={formData.guarantorMobile} onChange={v => updateFormData({ guarantorMobile: v })} required />
          <Field label="Occupation" value={formData.guarantorOccupation} onChange={v => updateFormData({ guarantorOccupation: v })} />
        </div>
      </SubSection>
    </div>
  );
}
