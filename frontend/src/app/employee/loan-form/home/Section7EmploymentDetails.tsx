'use client';

import { HomeLoanFormData, EmploymentDetails } from './types';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

function EmploymentForm({
  title, data, onChange, colorClass
}: {
  title: string; data: EmploymentDetails; onChange: (v: Partial<EmploymentDetails>) => void; colorClass: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div className={`w-8 h-8 rounded-lg ${colorClass} text-white flex items-center justify-center font-bold text-xs`}>
           {title.charAt(0)}
        </div>
        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{title} Employment</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Establishment Name *</label>
           <input type="text" value={data.establishmentName} onChange={e => onChange({ establishmentName: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Designation</label>
           <input type="text" value={data.designation} onChange={e => onChange({ designation: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Years of Employment</label>
           <input type="number" value={data.yearsOfEmployment} onChange={e => onChange({ yearsOfEmployment: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">CTC Per Annum (₹)</label>
           <input type="number" value={data.ctcPerAnnum} onChange={e => onChange({ ctcPerAnnum: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </div>
    </div>
  );
}

export default function Section7EmploymentDetails({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-10">
       <EmploymentForm 
         title="Applicant" 
         data={formData.applicantEmployment} 
         onChange={(v) => updateFormData({ applicantEmployment: { ...formData.applicantEmployment, ...v }})}
         colorClass="bg-primary"
       />
       <EmploymentForm 
         title="Co-Applicant" 
         data={formData.coApplicantEmployment} 
         onChange={(v) => updateFormData({ coApplicantEmployment: { ...formData.coApplicantEmployment, ...v }})}
         colorClass="bg-secondary"
       />

       {/* Optional Asset Summary */}
       <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
          <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm mb-4">Other Movable Assets</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Description (Gold, FD, Vehicles etc)</label>
                <textarea value={formData.movablePropertyDescription} onChange={e => updateFormData({ movablePropertyDescription: e.target.value })} placeholder="List significant movable assets..." rows={3} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent resize-none" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Total Estimated Value (₹)</label>
                <input type="number" value={formData.movablePropertyValue} onChange={e => updateFormData({ movablePropertyValue: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-accent" />
             </div>
          </div>
       </div>
    </div>
  );
}
