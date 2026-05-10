'use client';

import { VehicleLoanFormData, EntityType } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const ENTITY_TYPES: EntityType[] = ['Individual', 'Non-Individual'];

function PartyCard({
  title, icon, color, data, onChange, name, fatherName, mobile, hint
}: {
  title: string; icon: string; color: string; data: any; onChange: (v: any) => void;
  name: string; fatherName: string; mobile: string; hint: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-black/10`}>
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{title}</h4>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">{hint}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Full Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => onChange({ ...data, firstName: e.target.value })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-on-surface-variant/30"
            placeholder="As per Aadhaar" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Husband / Father Name *</label>
          <input 
            type="text" 
            value={fatherName} 
            onChange={e => onChange({ ...data, fatherFirstName: e.target.value })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-on-surface-variant/30"
            placeholder="Full Name" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Mobile Number *</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">+91</span>
             <input 
              type="tel" 
              maxLength={10}
              value={mobile} 
              onChange={e => onChange({ ...data, mobile: e.target.value.replace(/\D/g, '') })} 
              className="w-full bg-surface-container-high rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-on-surface-variant/30"
              placeholder="10-digit number" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Section1AppInfo({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-accent/5 rounded-2xl border border-accent/10">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Application Form Number</label>
          <input 
            type="text" 
            value={formData.applicationFormNo} 
            onChange={e => updateFormData({ applicationFormNo: e.target.value })}
            className="w-full bg-transparent text-xl font-black text-on-surface outline-none border-b-2 border-accent/20 focus:border-accent transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Date of Application</label>
          <input 
            type="date" 
            value={formData.applicationDate} 
            onChange={e => updateFormData({ applicationDate: e.target.value })}
            className="w-full bg-transparent text-xl font-black text-on-surface outline-none border-b-2 border-accent/20 focus:border-accent transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PartyCard 
          title="Primary Applicant"
          icon="A"
          color="bg-primary"
          hint="Main Borrower"
          data={formData.applicantPersonal}
          name={formData.applicantPersonal.firstName}
          fatherName={formData.applicantPersonal.fatherFirstName}
          mobile={formData.applicantContact.mobile}
          onChange={(v) => {
            updateFormData({ 
              applicantPersonal: { ...formData.applicantPersonal, firstName: v.firstName, fatherFirstName: v.fatherFirstName },
              applicantContact: { ...formData.applicantContact, mobile: v.mobile }
            });
          }}
        />

        <PartyCard 
          title="Co-Applicant"
          icon="C"
          color="bg-secondary"
          hint="Joint Liability"
          data={formData.coApplicantPersonal}
          name={formData.coApplicantPersonal.firstName}
          fatherName={formData.coApplicantPersonal.fatherFirstName}
          mobile={formData.coApplicantContact.mobile}
          onChange={(v) => {
            updateFormData({ 
              coApplicantPersonal: { ...formData.coApplicantPersonal, firstName: v.firstName, fatherFirstName: v.fatherFirstName },
              coApplicantContact: { ...formData.coApplicantContact, mobile: v.mobile }
            });
          }}
        />

        <PartyCard 
          title="Guarantor"
          icon="G"
          color="bg-tertiary"
          hint="Payment Guarantee"
          data={formData.guarantorPersonal}
          name={formData.guarantorPersonal.firstName}
          fatherName={formData.guarantorPersonal.fatherFirstName}
          mobile={formData.guarantorContact.mobile}
          onChange={(v) => {
            updateFormData({ 
              guarantorPersonal: { ...formData.guarantorPersonal, firstName: v.firstName, fatherFirstName: v.fatherFirstName },
              guarantorContact: { ...formData.guarantorContact, mobile: v.mobile }
            });
          }}
        />
      </div>

      {/* Entity Type Selection */}
      <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
        <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-accent">corporate_fare</span>
          Business Entity Classification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Applicant', field: 'applicantEntityType', value: formData.applicantEntityType },
             { label: 'Co-Applicant', field: 'coApplicantEntityType', value: formData.coApplicantEntityType },
             { label: 'Guarantor', field: 'guarantorEntityType', value: formData.guarantorEntityType },
           ].map(item => (
             <div key={item.label}>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 ml-1">{item.label}</p>
                <div className="flex gap-2 p-1 bg-surface-container-high rounded-xl">
                   {ENTITY_TYPES.map(type => (
                     <button
                       key={type}
                       type="button"
                       onClick={() => updateFormData({ [item.field]: type })}
                       className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${item.value === type ? 'bg-white text-accent shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
