'use client';

import { HomeLoanFormData, ImmovableAssetType } from './types';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  errors: string[];
}

const PROPERTY_TYPES: ImmovableAssetType[] = [
  'Vacant Land',
  'Apartments',
  'Building Residential',
  'Building Commercial',
  'Industrial',
  'Agricultural',
  'Others'
];

export default function Section8PropertyDetails({ formData, updateFormData }: Props) {
  const data = formData.propertyDetails;

  const onChange = (v: Partial<typeof data>) => {
    updateFormData({ propertyDetails: { ...data, ...v } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">real_estate_agent</span>
          Home/Site Property Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Property Type *</label>
              <select 
                value={data.propertyType} 
                onChange={e => onChange({ propertyType: e.target.value as ImmovableAssetType })} 
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent appearance-none"
              >
                <option value="">Select</option>
                {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
           </div>
           {data.propertyType === 'Others' && (
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Other Property Type</label>
                <input type="text" value={data.propertyTypeOther} onChange={e => onChange({ propertyTypeOther: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
              </div>
           )}
           <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Locality / Area Name *</label>
              <input type="text" value={data.locality} onChange={e => onChange({ locality: e.target.value })} placeholder="e.g. Prestige Shantiniketan, Whitefield" className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
           </div>

           <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Survey / Plot No. *</label>
              <input type="text" value={data.surveyNo} onChange={e => onChange({ surveyNo: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent font-mono" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Patta / Doc No.</label>
              <input type="text" value={data.pattaNo} onChange={e => onChange({ pattaNo: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent font-mono" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Estimated Market Value (₹) *</label>
              <input type="number" value={data.marketValue} onChange={e => onChange({ marketValue: e.target.value })} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent" />
           </div>

           <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Total Land Area (Sq.Ft) *</label>
              <input type="text" value={data.landArea} onChange={e => onChange({ landArea: e.target.value })} placeholder="e.g. 1200" className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Total Built-up Area (Sq.Ft)</label>
              <input type="text" value={data.builtUpArea} onChange={e => onChange({ builtUpArea: e.target.value })} placeholder="e.g. 1800" className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
           </div>
        </div>

        <div className="mt-8">
           <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Boundary Details (As per Deed)</p>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                 <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">North By</label>
                 <input type="text" value={data.boundaryNorth} onChange={e => onChange({ boundaryNorth: e.target.value })} className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">South By</label>
                 <input type="text" value={data.boundarySouth} onChange={e => onChange({ boundarySouth: e.target.value })} className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">East By</label>
                 <input type="text" value={data.boundaryEast} onChange={e => onChange({ boundaryEast: e.target.value })} className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-on-surface-variant/60 uppercase mb-1">West By</label>
                 <input type="text" value={data.boundaryWest} onChange={e => onChange({ boundaryWest: e.target.value })} className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
