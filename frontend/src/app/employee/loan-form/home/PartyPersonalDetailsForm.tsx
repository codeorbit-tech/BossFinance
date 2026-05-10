import React from 'react';
import { PartyPersonalDetails } from './types';

interface Props {
  data: PartyPersonalDetails;
  updateData: (data: PartyPersonalDetails) => void;
  ownedHouseValue: boolean;
  onOwnedHouseUpdate: (v: boolean) => void;
  isApplicant?: boolean;
}

function InputField({
  label, value, onChange, placeholder, required, hint, type = "text", disabled = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; hint?: string; type?: string; disabled?: boolean;
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
      {hint && <p className="text-[10px] text-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, options, required
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
      >
        <option value="" disabled>Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

export default function PartyPersonalDetailsForm({ data, updateData, ownedHouseValue, onOwnedHouseUpdate, isApplicant }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
        <h4 className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2">
          Personal Details
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Owns House?</span>
          <button
            onClick={() => onOwnedHouseUpdate(!ownedHouseValue)}
            className={`w-10 h-5 rounded-full p-1 transition-all duration-300 relative ${ownedHouseValue ? 'bg-accent' : 'bg-outline-variant/30'}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${ownedHouseValue ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
          label="Full Name (as per Aadhaar)"
          value={data.fullName}
          onChange={v => updateData({ ...data, fullName: v })}
          placeholder="e.g. Rahul Kumar Sharma"
          required={isApplicant}
        />
        <InputField
          label="Date of Birth"
          type="date"
          value={data.dob}
          onChange={v => updateData({ ...data, dob: v })}
          required={isApplicant}
        />
        <SelectField
          label="Gender"
          value={data.gender}
          onChange={v => updateData({ ...data, gender: v as any })}
          options={['Male', 'Female', 'Third Gender']}
          required={isApplicant}
        />
        <InputField
          label="Father's Name"
          value={data.fatherName}
          onChange={v => updateData({ ...data, fatherName: v })}
          placeholder="Father's Name"
          required={isApplicant}
        />
        <InputField
          label="Mobile Number"
          type="tel"
          value={data.mobile}
          onChange={v => updateData({ ...data, mobile: v })}
          placeholder="10-digit mobile"
          required={isApplicant}
        />
        <SelectField
          label="Marital Status"
          value={data.maritalStatus}
          onChange={v => updateData({ ...data, maritalStatus: v as any })}
          options={['Single', 'Married', 'Divorced', 'Widowed']}
          required={isApplicant}
        />
        
        {data.maritalStatus === 'Married' && (
          <InputField
            label="Spouse Name"
            value={data.spouseName}
            onChange={v => updateData({ ...data, spouseName: v })}
            placeholder="Spouse's Name"
          />
        )}
        
        <InputField
          label="Number of Dependents"
          type="number"
          value={data.numberOfDependents}
          onChange={v => updateData({ ...data, numberOfDependents: v })}
          placeholder="e.g. 2"
        />
        
        <SelectField
          label="Education"
          value={data.education}
          onChange={v => updateData({ ...data, education: v as any })}
          options={['SSC', 'HSC', 'Graduate', 'Post Graduate', 'Others']}
        />
        {data.education === 'Others' && (
          <InputField
            label="Other Education"
            value={data.educationOther}
            onChange={v => updateData({ ...data, educationOther: v })}
            placeholder="Specify"
          />
        )}

        <SelectField
          label="Religion"
          value={data.religion}
          onChange={v => updateData({ ...data, religion: v as any })}
          options={['Hindu', 'Christian', 'Sikh', 'Muslim', 'Others']}
        />
        {data.religion === 'Others' && (
          <InputField
            label="Other Religion"
            value={data.religionOther}
            onChange={v => updateData({ ...data, religionOther: v })}
            placeholder="Specify"
          />
        )}

        <SelectField
          label="Category"
          value={data.category}
          onChange={v => updateData({ ...data, category: v as any })}
          options={['General', 'SC', 'ST', 'OBC', 'MBC', 'Others']}
        />
        {data.category === 'Others' && (
          <InputField
            label="Other Category"
            value={data.categoryOther}
            onChange={v => updateData({ ...data, categoryOther: v })}
            placeholder="Specify"
          />
        )}
      </div>
    </div>
  );
}
