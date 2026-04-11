'use client';

import { VehicleLoanFormData, EmploymentDetails } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

function EmploymentCard({
  label, headerColor, employment, onChange
}: {
  label: string; headerColor: string; employment: EmploymentDetails;
  onChange: (updates: Partial<EmploymentDetails>) => void;
}) {
  const inputCls = `w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all`;

  return (
    <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
      <div className={`px-4 py-3 flex items-center gap-2 ${headerColor}`}>
        <span className="material-symbols-outlined text-white text-base">work</span>
        <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Establishment Name */}
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Entity / Establishment / Institution Name
            {label === 'Applicant' && <span className="text-error ml-1">*</span>}
          </label>
          <input
            type="text"
            value={employment.establishmentName}
            onChange={e => onChange({ establishmentName: e.target.value })}
            placeholder="Company or institution name"
            className={inputCls}
          />
        </div>

        {/* Designation */}
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Designation</label>
          <input
            type="text"
            value={employment.designation}
            onChange={e => onChange({ designation: e.target.value })}
            placeholder="Job title / role"
            className={inputCls}
          />
        </div>

        {/* Years of Employment */}
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">No. of Years of Employment</label>
          <div className="relative">
            <input
              type="number"
              value={employment.yearsOfEmployment}
              onChange={e => onChange({ yearsOfEmployment: e.target.value })}
              min={0}
              placeholder="0"
              className={`${inputCls} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase">Years</span>
          </div>
        </div>

        {/* CTC Per Annum */}
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">CTC Per Annum</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
            <input
              type="number"
              value={employment.ctcPerAnnum}
              onChange={e => onChange({ ctcPerAnnum: e.target.value })}
              min={0}
              placeholder="0"
              className={`${inputCls} pl-8`}
            />
          </div>
          {employment.ctcPerAnnum && (
            <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-accent text-sm">info</span>
              Monthly equivalent: ₹{(parseFloat(employment.ctcPerAnnum) / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      {employment.establishmentName && (
        <div className="px-4 pb-4">
          <div className="bg-surface-container rounded-xl p-3 flex flex-wrap gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Employer</span>
              <span className="text-xs font-bold text-on-surface">{employment.establishmentName}</span>
            </div>
            {employment.designation && (
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Role</span>
                <span className="text-xs font-bold text-on-surface">{employment.designation}</span>
              </div>
            )}
            {employment.yearsOfEmployment && (
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Experience</span>
                <span className="text-xs font-bold text-on-surface">{employment.yearsOfEmployment} yr{parseInt(employment.yearsOfEmployment) !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Section6EmploymentDetails({ formData, updateFormData }: Props) {
  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-6 bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/20">
        <span className="font-bold text-on-surface">Note:</span> Employment details for Applicant (mandatory) and Co-Applicant. Enter 0 for CTC if unemployed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmploymentCard
          label="Applicant"
          headerColor="bg-primary"
          employment={formData.applicantEmployment}
          onChange={updates => updateFormData({ applicantEmployment: { ...formData.applicantEmployment, ...updates } })}
        />
        <EmploymentCard
          label="Co-Applicant"
          headerColor="bg-secondary"
          employment={formData.coApplicantEmployment}
          onChange={updates => updateFormData({ coApplicantEmployment: { ...formData.coApplicantEmployment, ...updates } })}
        />
      </div>
    </div>
  );
}
