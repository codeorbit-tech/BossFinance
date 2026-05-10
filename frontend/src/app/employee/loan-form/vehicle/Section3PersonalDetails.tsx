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

function PersonForm({
  title, data, onChange, colorClass
}: {
  title: string; data: PartyPersonalDetails; onChange: (v: Partial<PartyPersonalDetails>) => void; colorClass: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div className={`w-10 h-10 rounded-xl ${colorClass} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
           {title.charAt(0)}
        </div>
        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{title} Additional Info</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
           <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Gender *</label>
           <select 
             value={data.gender} 
             onChange={e => onChange({ gender: e.target.value as Gender })} 
             className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent appearance-none transition-all"
           >
             <option value="">Select Gender</option>
             {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
           </select>
        </div>
        
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Date of Birth *</label>
          <input 
            type="date" 
            value={data.dob} 
            onChange={e => onChange({ dob: e.target.value })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Preferred Language</label>
          <input 
            type="text" 
            value={data.preferredLanguage} 
            onChange={e => onChange({ preferredLanguage: e.target.value })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all" 
            placeholder="e.g. English, Hindi"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Religion</label>
          <select 
            value={data.religion} 
            onChange={e => onChange({ religion: e.target.value as Religion })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent appearance-none transition-all"
          >
            <option value="">Select Religion</option>
            {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Category</label>
          <select 
            value={data.category} 
            onChange={e => onChange({ category: e.target.value as Category })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent appearance-none transition-all"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-4">
          {data.religion === 'Others' && (
             <div>
               <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Specify Religion</label>
               <input type="text" value={data.religionOther} onChange={e => onChange({ religionOther: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent" />
             </div>
          )}

          {data.category === 'Others' && (
             <div>
               <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Specify Category</label>
               <input type="text" value={data.categoryOther} onChange={e => onChange({ categoryOther: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Section3PersonalDetails({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
       <PersonForm 
         title="Applicant" 
         data={formData.applicantPersonal} 
         onChange={(v) => updateFormData({ applicantPersonal: { ...formData.applicantPersonal, ...v }})}
         colorClass="bg-primary"
       />
       
       <PersonForm 
         title="Co-Applicant" 
         data={formData.coApplicantPersonal} 
         onChange={(v) => updateFormData({ coApplicantPersonal: { ...formData.coApplicantPersonal, ...v }})}
         colorClass="bg-secondary"
       />

       <PersonForm 
         title="Guarantor" 
         data={formData.guarantorPersonal} 
         onChange={(v) => updateFormData({ guarantorPersonal: { ...formData.guarantorPersonal, ...v }})}
         colorClass="bg-tertiary"
       />
    </div>
  );
}
