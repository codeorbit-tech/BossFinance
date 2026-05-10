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

export default function Section3GuarantorDetails({ formData, updateFormData, errors }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview */}
      <div className="bg-tertiary/5 border border-tertiary/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-tertiary text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">support_agent</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 3: Guarantor Details</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Please enter the guarantor&apos;s personal details as per Aadhaar.
          </p>
        </div>
      </div>

      <section className="space-y-6 bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
              Guarantor Entity Type
            </label>
            <select
              value={formData.guarantorEntityType}
              onChange={e => updateFormData({ guarantorEntityType: e.target.value as any })}
              className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium appearance-none"
            >
              <option value="" disabled>Select...</option>
              <option value="Individual">Individual</option>
              <option value="Non-Individual">Non-Individual</option>
            </select>
          </div>
          {formData.guarantorEntityType === 'Non-Individual' && (
            <InputField
              label="GSTIN"
              value={formData.guarantorGstin}
              onChange={v => updateFormData({ guarantorGstin: v })}
            />
          )}
        </div>
      </section>

      <section className="bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
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
