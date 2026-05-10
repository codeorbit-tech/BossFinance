'use client';

import { HomeLoanFormData } from './types';
import PartyPersonalDetailsForm from './PartyPersonalDetailsForm';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

function InputField({
  label, value, onChange, placeholder, required, type = "text", disabled = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium disabled:opacity-50"
      />
    </div>
  );
}

export default function Section1PartyDetails({ formData, updateFormData, errors }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview */}
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">person</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 1: Application & Party Details</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Please enter the primary application information and personal details for the Applicant, Co-Applicant, and Guarantor.
          </p>
        </div>
      </div>

      {/* Application Info */}
      <section className="space-y-6 bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-lg">description</span>
          Application Info
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField
            label="Application Form No."
            value={formData.applicationFormNo}
            onChange={v => updateFormData({ applicationFormNo: v })}
            placeholder="Auto-generated"
            disabled={true}
          />
          <InputField
            label="Application Date"
            type="date"
            value={formData.applicationDate}
            onChange={v => updateFormData({ applicationDate: v })}
            required={true}
          />
        </div>
      </section>

      {/* Applicant Section */}
      <section className="space-y-6 bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-lg">person</span>
          Applicant Details
        </h4>

        <PartyPersonalDetailsForm
          data={formData.applicantPersonal}
          updateData={v => updateFormData({ applicantPersonal: v })}
          ownedHouseValue={formData.applicantOwnedHouse}
          onOwnedHouseUpdate={v => updateFormData({ applicantOwnedHouse: v })}
          isApplicant={true}
        />
      </section>

      {/* Co-Applicant Section */}
      <section className="space-y-6 bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-lg">group</span>
          Co-Applicant Details
        </h4>

        <PartyPersonalDetailsForm
          data={formData.coApplicantPersonal}
          updateData={v => updateFormData({ coApplicantPersonal: v })}
          ownedHouseValue={formData.coApplicantOwnedHouse}
          onOwnedHouseUpdate={v => updateFormData({ coApplicantOwnedHouse: v })}
          isApplicant={false}
        />
      </section>

      {/* Guarantor Section */}
      <section className="space-y-6 bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-lg">support_agent</span>
          Guarantor Details
        </h4>

        <PartyPersonalDetailsForm
          data={formData.guarantorPersonal}
          updateData={v => updateFormData({ guarantorPersonal: v })}
          ownedHouseValue={formData.guarantorOwnedHouse}
          onOwnedHouseUpdate={v => updateFormData({ guarantorOwnedHouse: v })}
          isApplicant={false}
        />
      </section>

    </div>
  );
}
