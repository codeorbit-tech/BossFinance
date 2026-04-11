'use client';

import { VehicleLoanFormData, PartyResidenceInfo, ResidenceType, MaritalStatus, Education } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const EDUCATIONS: Education[] = ['SSC', 'HSC', 'Graduate', 'Post Graduate', 'Others'];

function RadioGroup<T extends string>({
  label, options, value, onChange, required
}: {
  label: string; options: T[]; value: T | ''; onChange: (v: T) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              value === opt
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type="number"
        value={value}
        min={0}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all"
      />
    </div>
  );
}

function PartyResidenceCard({
  label, color, party, onChange
}: {
  label: string; color: string; party: PartyResidenceInfo;
  onChange: (updates: Partial<PartyResidenceInfo>) => void;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
      <div className={`px-4 py-3 flex items-center gap-2 ${color}`}>
        <span className="material-symbols-outlined text-white text-base">home</span>
        <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      </div>
      <div className="p-4 space-y-4">
        <RadioGroup<ResidenceType>
          label="Residence"
          options={['Owned', 'Rented']}
          value={party.residence}
          onChange={v => onChange({ residence: v })}
          required
        />
        <NumberInput
          label="No. of Years of Stay"
          value={party.yearsOfStay}
          onChange={v => onChange({ yearsOfStay: v })}
        />
        <RadioGroup<MaritalStatus>
          label="Marital Status"
          options={['Single', 'Married']}
          value={party.maritalStatus}
          onChange={v => onChange({ maritalStatus: v })}
          required
        />
        <NumberInput
          label="No. of Dependents"
          value={party.numberOfDependents}
          onChange={v => onChange({ numberOfDependents: v })}
        />
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Education</label>
          <div className="flex flex-wrap gap-2">
            {EDUCATIONS.map(edu => (
              <button
                key={edu}
                type="button"
                onClick={() => onChange({ education: edu })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  party.education === edu
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {edu}
              </button>
            ))}
          </div>
          {party.education === 'Others' && (
            <input
              type="text"
              value={party.educationOther}
              onChange={e => onChange({ educationOther: e.target.value })}
              placeholder="Specify..."
              className="mt-2 w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Section4ResidenceInfo({ formData, updateFormData }: Props) {
  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-6 bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/20">
        <span className="font-bold text-on-surface">Note:</span> Fill in residence and personal information for all three parties.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PartyResidenceCard
          label="Applicant"
          color="bg-primary"
          party={formData.applicantResidence}
          onChange={updates => updateFormData({ applicantResidence: { ...formData.applicantResidence, ...updates } })}
        />
        <PartyResidenceCard
          label="Co-Applicant"
          color="bg-secondary"
          party={formData.coApplicantResidence}
          onChange={updates => updateFormData({ coApplicantResidence: { ...formData.coApplicantResidence, ...updates } })}
        />
        <PartyResidenceCard
          label="Guarantor"
          color="bg-tertiary"
          party={formData.guarantorResidence}
          onChange={updates => updateFormData({ guarantorResidence: { ...formData.guarantorResidence, ...updates } })}
        />
      </div>
    </div>
  );
}
