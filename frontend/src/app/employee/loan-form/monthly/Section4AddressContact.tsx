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
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)} rows={2} placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium resize-none"
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

export default function Section4AddressContact({ formData, updateFormData }: Props) {
  const sync = (v: boolean) => {
    updateFormData({ permanentSameAsCommunication: v });
    if (v) {
      updateFormData({
        permanentAddress: formData.communicationAddress,
        permanentCity: formData.communicationCity,
        permanentState: formData.communicationState,
        permanentPinCode: formData.communicationPinCode,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">location_on</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 4: Address & Contact</h4>
          <p className="text-xs text-on-surface-variant">Provide applicant&apos;s communication and permanent address.</p>
        </div>
      </div>

      <SubSection title="Communication Address" icon="home">
        <div className="grid grid-cols-1 gap-5">
          <TextArea label="Full Address" value={formData.communicationAddress} onChange={v => updateFormData({ communicationAddress: v })} placeholder="House No, Street, Locality..." required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="City" value={formData.communicationCity} onChange={v => updateFormData({ communicationCity: v })} required />
          <Field label="State" value={formData.communicationState} onChange={v => updateFormData({ communicationState: v })} required />
          <Field label="PIN Code" value={formData.communicationPinCode} onChange={v => updateFormData({ communicationPinCode: v })} placeholder="600001" required />
        </div>
      </SubSection>

      <SubSection title="Permanent Address" icon="maps_home_work">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => sync(!formData.permanentSameAsCommunication)}
            className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${formData.permanentSameAsCommunication ? 'bg-accent' : 'bg-outline-variant'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.permanentSameAsCommunication ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-on-surface">Same as Communication Address</span>
        </label>

        {!formData.permanentSameAsCommunication && (
          <>
            <div className="grid grid-cols-1 gap-5">
              <TextArea label="Full Address" value={formData.permanentAddress} onChange={v => updateFormData({ permanentAddress: v })} placeholder="House No, Street, Locality..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="City" value={formData.permanentCity} onChange={v => updateFormData({ permanentCity: v })} />
              <Field label="State" value={formData.permanentState} onChange={v => updateFormData({ permanentState: v })} />
              <Field label="PIN Code" value={formData.permanentPinCode} onChange={v => updateFormData({ permanentPinCode: v })} />
            </div>
          </>
        )}
      </SubSection>
    </div>
  );
}
