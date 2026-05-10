'use client';

import { SimpleLoanFormData } from './types';

interface Props {
  formData: SimpleLoanFormData;
  updateFormData: (updates: Partial<SimpleLoanFormData>) => void;
  errors: string[];
}

export default function Section1ApplicantBusiness({ formData, updateFormData, errors }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      {/* ─── Primary Applicant ─── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-sm">person</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Primary Applicant</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Applicant Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Father / Husband Name
            </label>
            <input
              type="text"
              name="fatherHusbandName"
              value={formData.fatherHusbandName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Mobile Number <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Aadhaar Number <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="aadhaarNo"
              value={formData.aadhaarNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
              maxLength={12}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              PAN Number
            </label>
            <input
              type="text"
              name="panNo"
              value={formData.panNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent uppercase"
              maxLength={10}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Residential Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* ─── Co-Applicant ─── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-sm">group</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Co-Applicant</h4>
          <span className="text-[10px] text-on-surface-variant font-medium">(Optional)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Co-Applicant Name
            </label>
            <input
              type="text"
              name="coApplicantName"
              value={formData.coApplicantName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Father / Husband Name
            </label>
            <input
              type="text"
              name="coApplicantFatherHusbandName"
              value={formData.coApplicantFatherHusbandName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Relation to Applicant
            </label>
            <input
              type="text"
              name="coApplicantRelation"
              value={formData.coApplicantRelation}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
              placeholder="e.g. Spouse, Parent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              name="coApplicantMobile"
              value={formData.coApplicantMobile}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="coApplicantDob"
              value={formData.coApplicantDob}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Gender
            </label>
            <select
              name="coApplicantGender"
              value={formData.coApplicantGender}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Aadhaar Number
            </label>
            <input
              type="text"
              name="coApplicantAadhaarNo"
              value={formData.coApplicantAadhaarNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
              maxLength={12}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              PAN Number
            </label>
            <input
              type="text"
              name="coApplicantPanNo"
              value={formData.coApplicantPanNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary uppercase"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Residential Address
            </label>
            <textarea
              name="coApplicantAddress"
              value={formData.coApplicantAddress}
              onChange={handleChange}
              rows={2}
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-tertiary resize-none"
            />
          </div>
          {/* Co-Applicant Bank Details */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Bank Name
            </label>
            <input
              type="text"
              name="coApplicantBankName"
              value={formData.coApplicantBankName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
              placeholder="e.g. State Bank of India"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Account Number
            </label>
            <input
              type="text"
              name="coApplicantAccountNo"
              value={formData.coApplicantAccountNo}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              name="coApplicantIfscCode"
              value={formData.coApplicantIfscCode}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-tertiary uppercase"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* ─── Business Info ─── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-sm">store</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Business Details</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Shop/Business Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Business Type
            </label>
            <input
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full bg-surface-container-high border-none rounded-xl p-3.5 text-on-surface outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g. Retail, Grocery, Mobile Shop"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Shop Address
            </label>
            <textarea
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleChange}
              rows={2}
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
