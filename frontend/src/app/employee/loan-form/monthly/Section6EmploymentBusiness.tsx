'use client';

import { MonthlyLoanFormData } from './types';

interface Props {
  formData: MonthlyLoanFormData;
  updateFormData: (u: Partial<MonthlyLoanFormData>) => void;
  errors: string[];
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-on-surface-variant/40 font-medium"
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

export default function Section6EmploymentBusiness({ formData, updateFormData }: Props) {
  const isPersonal = formData.loanType === 'PERSONAL';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">{isPersonal ? 'work' : 'storefront'}</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">
            Section 6: {isPersonal ? 'Employment Details' : 'Business Details'}
          </h4>
          <p className="text-xs text-on-surface-variant">
            {isPersonal ? 'Provide employment and income information.' : 'Provide business registration and financial information.'}
          </p>
        </div>
      </div>

      {isPersonal ? (
        <SubSection title="Employment Information" icon="work">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Employer / Company Name" value={formData.employerName} onChange={v => updateFormData({ employerName: v })} placeholder="e.g. Infosys Ltd." />
            <Field label="Designation / Job Title" value={formData.designation} onChange={v => updateFormData({ designation: v })} placeholder="e.g. Software Engineer" />
            <Field label="Years of Employment" value={formData.yearsOfEmployment} onChange={v => updateFormData({ yearsOfEmployment: v })} placeholder="e.g. 3" />
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Annual CTC (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
                <input
                  type="number" value={formData.annualCTC}
                  onChange={e => updateFormData({ annualCTC: e.target.value })}
                  className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Monthly Take-Home Income (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
                <input
                  type="number" value={formData.monthlyIncome}
                  onChange={e => updateFormData({ monthlyIncome: e.target.value })}
                  className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </SubSection>
      ) : (
        <>
          <SubSection title="Business Information" icon="storefront">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Business / Shop Name" value={formData.businessName} onChange={v => updateFormData({ businessName: v })} placeholder="e.g. Kumar Textiles" />
              <Field label="Business Type / Category" value={formData.businessType} onChange={v => updateFormData({ businessType: v })} placeholder="e.g. Retail, Manufacturing, Services" />
              <Field label="Years in Business" value={formData.yearsInBusiness} onChange={v => updateFormData({ yearsInBusiness: v })} placeholder="e.g. 5" />
              <Field label="GST No. (if applicable)" value={formData.gstNo} onChange={v => updateFormData({ gstNo: v })} placeholder="27ABCDE1234F1Z5" />
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Annual Turnover (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
                  <input
                    type="number" value={formData.annualTurnover}
                    onChange={e => updateFormData({ annualTurnover: e.target.value })}
                    className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Monthly Income (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
                  <input
                    type="number" value={formData.monthlyIncome}
                    onChange={e => updateFormData({ monthlyIncome: e.target.value })}
                    className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </SubSection>
          <SubSection title="Business Address" icon="location_on">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Business Address" value={formData.businessAddress} onChange={v => updateFormData({ businessAddress: v })} placeholder="Shop No, Street, Area..." />
            </div>
          </SubSection>
        </>
      )}
    </div>
  );
}
