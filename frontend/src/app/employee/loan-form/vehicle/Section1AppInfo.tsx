'use client';

import { VehicleLoanFormData, EntityType } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const ENTITY_TYPES: EntityType[] = ['Individual', 'Non-Individual'];

function InputField({
  label, value, onChange, placeholder, required, hint, pattern
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; hint?: string; pattern?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        pattern={pattern}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40"
      />
      {hint && <p className="text-[10px] text-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}

function EntityTypeRadio({
  label, value, onChange
}: {
  label: string; value: EntityType | ''; onChange: (v: EntityType) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        {label} <span className="text-error">*</span>
      </p>
      <div className="flex flex-col gap-2">
        {ENTITY_TYPES.map(type => (
          <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                value === type ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-primary/50'
              }`}
              onClick={() => onChange(type)}
            >
              {value === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span
              className={`text-sm font-medium cursor-pointer transition-colors ${
                value === type ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-on-surface'
              }`}
              onClick={() => onChange(type)}
            >
              {type}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Section1AppInfo({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-8">
      {/* Application Form No. + Date */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">article</span>
          Application Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Application Form No."
            value={formData.applicationFormNo}
            onChange={v => updateFormData({ applicationFormNo: v })}
            hint="Auto-generated — you may edit if needed"
          />
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
              Application Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={formData.applicationDate}
              onChange={e => updateFormData({ applicationDate: e.target.value })}
              className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Entity Type Selection */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">corporate_fare</span>
          Entity Type Selection
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Applicant */}
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/20">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">A</div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Applicant</span>
            </div>
            <EntityTypeRadio
              label="Entity Type"
              value={formData.applicantEntityType}
              onChange={v => updateFormData({ applicantEntityType: v })}
            />
          </div>

          {/* Co-Applicant */}
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/20">
              <div className="w-6 h-6 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">C</div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Co-Applicant</span>
            </div>
            <EntityTypeRadio
              label="Entity Type"
              value={formData.coApplicantEntityType}
              onChange={v => updateFormData({ coApplicantEntityType: v })}
            />
          </div>

          {/* Guarantor */}
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/20">
              <div className="w-6 h-6 rounded-full bg-tertiary text-white text-[10px] font-bold flex items-center justify-center">G</div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Guarantor</span>
            </div>
            <EntityTypeRadio
              label="Entity Type"
              value={formData.guarantorEntityType}
              onChange={v => updateFormData({ guarantorEntityType: v })}
            />
          </div>
        </div>
      </div>

      {/* UDYAM + KYC IDs */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">badge</span>
          UDYAM & KYC Identifiers
        </h4>

        <div className="mb-5">
          <InputField
            label="UDYAM Registration Number"
            value={formData.udyamRegNo}
            onChange={v => updateFormData({ udyamRegNo: v })}
            placeholder="UDYAM-XX-XX-XXXXXXX"
            hint="Format: UDYAM-[State Code]-[Category]-[Number]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Applicant KYC */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">A</div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Applicant</span>
            </div>
            <InputField label="CKYC ID" value={formData.applicantCkycId} onChange={v => updateFormData({ applicantCkycId: v })} placeholder="CKYC Number" />
            <InputField label="GSTIN" value={formData.applicantGstin} onChange={v => updateFormData({ applicantGstin: v })} placeholder="GST Identification No." />
          </div>

          {/* Co-Applicant KYC */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center">C</div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Co-Applicant</span>
            </div>
            <InputField label="CKYC ID" value={formData.coApplicantCkycId} onChange={v => updateFormData({ coApplicantCkycId: v })} placeholder="CKYC Number" />
            <InputField label="GSTIN" value={formData.coApplicantGstin} onChange={v => updateFormData({ coApplicantGstin: v })} placeholder="GST Identification No." />
          </div>

          {/* Guarantor KYC */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-tertiary text-white text-[9px] font-bold flex items-center justify-center">G</div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Guarantor</span>
            </div>
            <InputField label="CKYC ID" value={formData.guarantorCkycId} onChange={v => updateFormData({ guarantorCkycId: v })} placeholder="CKYC Number" />
            <InputField label="GSTIN" value={formData.guarantorGstin} onChange={v => updateFormData({ guarantorGstin: v })} placeholder="GST Identification No." />
          </div>
        </div>
      </div>
    </div>
  );
}
