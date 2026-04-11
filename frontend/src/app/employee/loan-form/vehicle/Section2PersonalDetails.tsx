'use client';

import { VehicleLoanFormData, PartyPersonalDetails, Gender, Religion, Category } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const GENDERS: Gender[] = ['Male', 'Female', 'Third Gender'];
const RELIGIONS: Religion[] = ['Hindu', 'Christian', 'Sikh', 'Muslim', 'Others'];
const CATEGORIES: Category[] = ['General', 'SC', 'ST', 'OBC', 'MBC', 'Others'];

function TextInput({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/30"
      />
    </div>
  );
}

function GenderRadio({ value, onChange }: { value: Gender | ''; onChange: (v: Gender) => void }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
        Gender <span className="text-error">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {GENDERS.map(g => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              value === g
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup<T extends string>({
  label, options, selected, onChange, showOther, otherValue, onOtherChange
}: {
  label: string; options: T[]; selected: T[];
  onChange: (v: T[]) => void; showOther?: boolean;
  otherValue?: string; onOtherChange?: (v: string) => void;
}) {
  const toggle = (val: T) => {
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };
  return (
    <div>
      <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</label>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
            <div
              onClick={() => toggle(opt)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                selected.includes(opt)
                  ? 'bg-accent border-accent'
                  : 'border-outline-variant hover:border-accent/60'
              }`}
            >
              {selected.includes(opt) && (
                <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: "'FILL' 1", fontSize: '10px' }}>check</span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant" onClick={() => toggle(opt)}>{opt}</span>
          </label>
        ))}
      </div>
      {showOther && selected.includes('Others' as T) && (
        <input
          type="text"
          value={otherValue}
          onChange={e => onOtherChange?.(e.target.value)}
          placeholder="Specify..."
          className="mt-1.5 w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-1.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-accent/30 transition-all"
        />
      )}
    </div>
  );
}

function PartyColumn({
  label, color, party, onChange
}: {
  label: string; color: string; party: PartyPersonalDetails;
  onChange: (updates: Partial<PartyPersonalDetails>) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Column Header */}
      <div className={`rounded-xl p-3 text-white flex items-center gap-2 ${color}`}>
        <span className="material-symbols-outlined text-base">person</span>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>

      {/* Name */}
      <div className="bg-surface-container/50 rounded-xl p-3 space-y-2">
        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Full Name</p>
        <TextInput label="First Name" value={party.firstName} onChange={v => onChange({ firstName: v })} required />
        <TextInput label="Middle Name" value={party.middleName} onChange={v => onChange({ middleName: v })} />
        <TextInput label="Last Name" value={party.lastName} onChange={v => onChange({ lastName: v })} />
      </div>

      {/* Gender */}
      <div className="bg-surface-container/50 rounded-xl p-3">
        <GenderRadio value={party.gender} onChange={v => onChange({ gender: v })} />
      </div>

      {/* DOB */}
      <div className="bg-surface-container/50 rounded-xl p-3">
        <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
          Date of Birth <span className="text-error">*</span>
        </label>
        <input
          type="date"
          value={party.dob}
          onChange={e => onChange({ dob: e.target.value })}
          className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Father's Name */}
      <div className="bg-surface-container/50 rounded-xl p-3 space-y-2">
        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Father&apos;s Name</p>
        <TextInput label="First" value={party.fatherFirstName} onChange={v => onChange({ fatherFirstName: v })} />
        <TextInput label="Middle" value={party.fatherMiddleName} onChange={v => onChange({ fatherMiddleName: v })} />
        <TextInput label="Last" value={party.fatherLastName} onChange={v => onChange({ fatherLastName: v })} />
      </div>

      {/* Mother's Name */}
      <div className="bg-surface-container/50 rounded-xl p-3 space-y-2">
        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Mother&apos;s Maiden Name</p>
        <TextInput label="First" value={party.motherFirstName} onChange={v => onChange({ motherFirstName: v })} />
        <TextInput label="Middle" value={party.motherMiddleName} onChange={v => onChange({ motherMiddleName: v })} />
        <TextInput label="Last" value={party.motherLastName} onChange={v => onChange({ motherLastName: v })} />
      </div>

      {/* Religion */}
      <div className="bg-surface-container/50 rounded-xl p-3">
        <CheckboxGroup
          label="Religion"
          options={RELIGIONS}
          selected={party.religion}
          onChange={v => onChange({ religion: v })}
          showOther
          otherValue={party.religionOther}
          onOtherChange={v => onChange({ religionOther: v })}
        />
      </div>

      {/* Category */}
      <div className="bg-surface-container/50 rounded-xl p-3">
        <CheckboxGroup
          label="Category"
          options={CATEGORIES}
          selected={party.category}
          onChange={v => onChange({ category: v })}
          showOther
          otherValue={party.categoryOther}
          onOtherChange={v => onChange({ categoryOther: v })}
        />
      </div>

      {/* Preferred Language */}
      <div className="bg-surface-container/50 rounded-xl p-3">
        <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
          Preferred Language
        </label>
        <div className="flex gap-2 mb-1.5">
          {['English', 'Others'].map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => onChange({ preferredLanguage: lang })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                party.preferredLanguage === lang
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        {party.preferredLanguage === 'Others' && (
          <input
            type="text"
            value={party.preferredLanguageOther}
            onChange={e => onChange({ preferredLanguageOther: e.target.value })}
            placeholder="Specify language..."
            className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-1.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-accent/30 transition-all"
          />
        )}
      </div>
    </div>
  );
}

export default function Section2PersonalDetails({ formData, updateFormData }: Props) {
  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-6 bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/20">
        <span className="font-bold text-on-surface">Note:</span> Fill in personal details for all three parties (Applicant, Co-Applicant, and Guarantor) column by column.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PartyColumn
          label="Applicant"
          color="bg-primary"
          party={formData.applicantPersonal}
          onChange={updates => updateFormData({ applicantPersonal: { ...formData.applicantPersonal, ...updates } })}
        />
        <PartyColumn
          label="Co-Applicant"
          color="bg-secondary"
          party={formData.coApplicantPersonal}
          onChange={updates => updateFormData({ coApplicantPersonal: { ...formData.coApplicantPersonal, ...updates } })}
        />
        <PartyColumn
          label="Guarantor"
          color="bg-tertiary"
          party={formData.guarantorPersonal}
          onChange={updates => updateFormData({ guarantorPersonal: { ...formData.guarantorPersonal, ...updates } })}
        />
      </div>
    </div>
  );
}
