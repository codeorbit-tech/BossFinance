'use client';

import { HomeLoanFormData, PartyResidenceInfo, ResidenceType, MaritalStatus, Education } from './types';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

const RESIDENCE_TYPES: ResidenceType[] = ['Owned', 'Rented'];

function ResidenceForm({
  title, data, onChange, colorClass
}: {
  title: string; data: PartyResidenceInfo; onChange: (v: Partial<PartyResidenceInfo>) => void; colorClass: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div className={`w-8 h-8 rounded-lg ${colorClass} text-white flex items-center justify-center font-bold text-xs`}>
           {title.charAt(0)}
        </div>
        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{title} Residence</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Residence Status *</label>
           <select value={data.residence} onChange={e => onChange({ residence: e.target.value as ResidenceType })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent appearance-none">
             <option value="">Select</option>
             {RESIDENCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Years of Stay</label>
           <input type="number" value={data.yearsOfStay} onChange={e => onChange({ yearsOfStay: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </div>
    </div>
  );
}

export default function Section5ResidenceInfo({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-10">
       <ResidenceForm 
         title="Applicant" 
         data={formData.applicantResidence} 
         onChange={(v) => updateFormData({ applicantResidence: { ...formData.applicantResidence, ...v }})}
         colorClass="bg-primary"
       />
       <ResidenceForm 
         title="Co-Applicant" 
         data={formData.coApplicantResidence} 
         onChange={(v) => updateFormData({ coApplicantResidence: { ...formData.coApplicantResidence, ...v }})}
         colorClass="bg-secondary"
       />
       <ResidenceForm 
         title="Guarantor" 
         data={formData.guarantorResidence} 
         onChange={(v) => updateFormData({ guarantorResidence: { ...formData.guarantorResidence, ...v }})}
         colorClass="bg-tertiary"
       />
    </div>
  );
}
