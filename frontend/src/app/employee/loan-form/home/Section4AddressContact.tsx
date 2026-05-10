'use client';

import { HomeLoanFormData, PartyContactDetails, AddressBlock, emptyAddress } from './types';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

function AddressInput({
  label, data, onChange
}: {
  label: string; data: AddressBlock; onChange: (v: Partial<AddressBlock>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
           <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">Full Address *</label>
           <input type="text" value={data.fullAddress} onChange={e => onChange({ fullAddress: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">Landmark</label>
           <input type="text" value={data.landmark} onChange={e => onChange({ landmark: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">City</label>
           <input type="text" value={data.city} onChange={e => onChange({ city: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">District</label>
           <input type="text" value={data.district} onChange={e => onChange({ district: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">State</label>
            <input type="text" value={data.state} onChange={e => onChange({ state: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">PIN Code</label>
            <input type="text" value={data.pinCode} onChange={e => onChange({ pinCode: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactBlock({
  title, data, onChange, colorClass, isApplicant = false
}: {
  title: string; data: PartyContactDetails; onChange: (v: Partial<PartyContactDetails>) => void; colorClass: string; isApplicant?: boolean;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
       <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div className={`w-8 h-8 rounded-lg ${colorClass} text-white flex items-center justify-center font-bold text-xs`}>
           {title.charAt(0)}
        </div>
        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{title} Contact</h4>
      </div>

      <div className="space-y-8">
        <AddressInput 
          label="Communication Address" 
          data={data.communicationAddress} 
          onChange={(v) => onChange({ communicationAddress: { ...data.communicationAddress, ...v }})} 
        />

        <div className="flex items-center gap-3">
           <input 
             type="checkbox" 
             checked={data.permanentSameAsCommunication} 
             onChange={e => onChange({ 
               permanentSameAsCommunication: e.target.checked,
               permanentAddress: e.target.checked ? data.communicationAddress : emptyAddress()
             })}
             className="w-4 h-4 accent-primary"
           />
           <span className="text-xs font-bold text-on-surface-variant">Permanent Address same as Communication</span>
        </div>

        {!data.permanentSameAsCommunication && (
           <AddressInput 
            label="Permanent Address" 
            data={data.permanentAddress} 
            onChange={(v) => onChange({ permanentAddress: { ...data.permanentAddress, ...v }})} 
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 border-t border-dashed border-outline-variant/30 text-sm font-medium">
           <div>
             <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Alternate Mobile</label>
             <input type="tel" value={data.alternateMobile} onChange={e => onChange({ alternateMobile: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
           </div>
           <div>
             <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Email ID</label>
             <input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
           </div>
        </div>
      </div>
    </div>
  );
}

export default function Section4AddressContact({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-10">
       <ContactBlock 
         title="Applicant" 
         data={formData.applicantContact} 
         onChange={(v) => updateFormData({ applicantContact: { ...formData.applicantContact, ...v }})}
         colorClass="bg-primary"
         isApplicant={true}
       />
       <ContactBlock 
         title="Co-Applicant" 
         data={formData.coApplicantContact} 
         onChange={(v) => updateFormData({ coApplicantContact: { ...formData.coApplicantContact, ...v }})}
         colorClass="bg-secondary"
       />
       <ContactBlock 
         title="Guarantor" 
         data={formData.guarantorContact} 
         onChange={(v) => updateFormData({ guarantorContact: { ...formData.guarantorContact, ...v }})}
         colorClass="bg-tertiary"
       />
    </div>
  );
}
