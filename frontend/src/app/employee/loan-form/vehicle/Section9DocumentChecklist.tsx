'use client';

import { VehicleLoanFormData, KycDocEntry } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const KYC_DOCS: { key: keyof VehicleLoanFormData['kycDocuments']; label: string }[] = [
  { key: 'aadhaarCard', label: 'Aadhaar Card' },
  { key: 'panCard', label: 'PAN Card' },
  { key: 'passport', label: 'Passport' },
  { key: 'drivingLicence', label: 'Driving Licence' },
  { key: 'gasConnection', label: 'Gas Connection Card' },
  { key: 'waterBill', label: 'Water Bill' },
  { key: 'electricityBill', label: 'Electricity Bill' },
  { key: 'mobilePostpaidBill', label: 'Postpaid Mobile / Tel Bill' },
  { key: 'voterIdCard', label: 'Voter ID Card' },
];

const PRE_SANCTION_DOCS: { key: keyof VehicleLoanFormData['preSanctionDocs']; label: string; isText?: boolean }[] = [
  { key: 'proformaInvoice', label: 'Proforma Invoice & Margin Money receipt for new asset' },
  { key: 'saleDeedUsed', label: 'Sale deed for used asset' },
  { key: 'rcUsedAsset', label: 'Registration Certificate for used asset / Original invoice for unregistrable asset' },
  { key: 'insurance', label: 'Comprehensive Insurance Policy' },
  { key: 'bankStatement', label: 'Bank statement of last 6 months' },
  { key: 'itr', label: 'Last 2 years ITR (if income assessee)' },
  { key: 'nonIndividualDoc', label: "Non-individual entity's relevant document (if Non-individual)" },
  { key: 'othersText', label: 'Others', isText: true },
];

// Document type options (mutually exclusive - radio buttons)
const PRE_SANCTION_DOC_TYPES: { key: keyof VehicleLoanFormData['preSanctionDocs']; label: string }[] = [
  { key: 'proformaInvoice', label: 'Proforma Invoice & Margin Money receipt for new asset' },
  { key: 'saleDeedUsed', label: 'Sale deed for used asset' },
  { key: 'rcUsedAsset', label: 'RC for used asset / Original invoice for unregistrable asset' },
];

const POST_DISBURSE_DOCS: { key: keyof VehicleLoanFormData['postDisbursementDocs']; label: string; isText?: boolean }[] = [
  { key: 'originalInvoiceNew', label: 'Original invoice for new asset with hypothecation in favour of Company' },
  { key: 'rcHypothecation', label: 'Registration Certificate and hypothecation in favour of Company' },
  { key: 'insuranceHypothecation', label: 'Insurance policy hypothecation in favour of Company' },
  { key: 'othersText', label: 'Others', isText: true },
];

// Document type options (mutually exclusive - radio buttons)
const POST_DISBURSE_DOC_TYPES: { key: keyof VehicleLoanFormData['postDisbursementDocs']; label: string }[] = [
  { key: 'originalInvoiceNew', label: 'Original invoice for new asset with hypothecation' },
  { key: 'rcHypothecation', label: 'Registration Certificate with hypothecation' },
  { key: 'insuranceHypothecation', label: 'Insurance policy with hypothecation' },
];

function KycCheckCell({
  checked, docNo, onCheck, onDocNo
}: {
  checked: boolean; docNo: string; onCheck: (v: boolean) => void; onDocNo: (v: string) => void;
}) {
  return (
    <td className="px-3 py-3 border-l border-outline-variant/10">
      <label className="flex flex-col gap-1.5 cursor-pointer">
        <div className="flex items-center gap-1.5">
          <div
            onClick={() => onCheck(!checked)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
              checked ? 'bg-accent border-accent' : 'border-outline-variant hover:border-accent/60'
            }`}
          >
            {checked && (
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '10px' }}>check</span>
            )}
          </div>
          <span className="text-[10px] font-medium text-on-surface-variant">{checked ? 'Verified' : 'Tick to verify'}</span>
        </div>
        {checked && (
          <input
            type="text"
            value={docNo}
            onChange={e => onDocNo(e.target.value)}
            placeholder="Doc. No."
            onClick={e => e.stopPropagation()}
            className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-2 py-1.5 text-[11px] text-on-surface outline-none focus:ring-1 focus:ring-accent/30 transition-all"
          />
        )}
      </label>
    </td>
  );
}

function SimpleRadio({
  checked,
  onChange,
  label,
  name
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-3 border-b border-outline-variant/10 last:border-0">
      <div
        onClick={() => onChange(true)}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 transition-all ${
          checked ? 'bg-accent border-accent' : 'border-outline-variant group-hover:border-accent/60'
        }`}
      >
        {checked && (
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '10px' }}>check</span>
        )}
      </div>
      <span className="text-sm text-on-surface leading-relaxed">{label}</span>
    </label>
  );
}

function SimpleCheckbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-3 border-b border-outline-variant/10 last:border-0">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 transition-all ${
          checked ? 'bg-accent border-accent' : 'border-outline-variant group-hover:border-accent/60'
        }`}
      >
        {checked && (
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '10px' }}>check</span>
        )}
      </div>
      <span className="text-sm text-on-surface leading-relaxed">{label}</span>
    </label>
  );
}

export default function Section9DocumentChecklist({ formData, updateFormData }: Props) {
  const updateKyc = (docKey: keyof VehicleLoanFormData['kycDocuments'], updates: Partial<KycDocEntry>) => {
    updateFormData({
      kycDocuments: {
        ...formData.kycDocuments,
        [docKey]: { ...formData.kycDocuments[docKey], ...updates },
      },
    });
  };

  const updatePreSanction = (updates: Partial<VehicleLoanFormData['preSanctionDocs']>) => {
    updateFormData({ preSanctionDocs: { ...formData.preSanctionDocs, ...updates } });
  };

  const updatePostDisburse = (updates: Partial<VehicleLoanFormData['postDisbursementDocs']>) => {
    updateFormData({ postDisbursementDocs: { ...formData.postDisbursementDocs, ...updates } });
  };

  // Handle mutually exclusive document type selection
  const selectPreSanctionDocType = (selectedKey: keyof VehicleLoanFormData['preSanctionDocs']) => {
    const cleared: any = {
      proformaInvoice: false,
      saleDeedUsed: false,
      rcUsedAsset: false,
    };
    cleared[selectedKey] = true;
    updatePreSanction(cleared);
  };

  const selectPostDisburseDocType = (selectedKey: keyof VehicleLoanFormData['postDisbursementDocs']) => {
    const cleared: any = {
      originalInvoiceNew: false,
      rcHypothecation: false,
      insuranceHypothecation: false,
    };
    cleared[selectedKey] = true;
    updatePostDisburse(cleared);
  };

  const kycVerifiedCount = Object.values(formData.kycDocuments).filter(
    (d: KycDocEntry) => d.applicantChecked || d.coApplicantChecked || d.guarantorChecked
  ).length;

  return (
    <div className="space-y-8">
      {/* KYC Progress */}
      <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4">
        <span className="material-symbols-outlined text-accent text-2xl">verified_user</span>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-bold text-on-surface">KYC Documents Verified</span>
            <span className={`text-xs font-bold ${kycVerifiedCount > 0 ? 'text-accent' : 'text-on-surface-variant'}`}>
              {kycVerifiedCount} / {KYC_DOCS.length}
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(kycVerifiedCount / KYC_DOCS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* KYC Documents Table */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">badge</span>
          KYC Documents Verification
        </h4>
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
          <table className="w-full min-w-[700px]">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-4 py-3 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Document</th>
                <th className="px-4 py-3 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest border-l border-outline-variant/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">A</div>
                    Applicant
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest border-l border-outline-variant/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-secondary text-white text-[8px] font-bold flex items-center justify-center">C</div>
                    Co-Applicant
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest border-l border-outline-variant/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-tertiary text-white text-[8px] font-bold flex items-center justify-center">G</div>
                    Guarantor
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {KYC_DOCS.map((doc, idx) => {
                const entry = formData.kycDocuments[doc.key];
                const rowBg = idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container/20';
                return (
                  <tr key={doc.key} className={`${rowBg} border-t border-outline-variant/10`}>
                    <td className="px-4 py-3">
                      <span className="text-sm text-on-surface font-medium">{doc.label}</span>
                    </td>
                    <KycCheckCell
                      checked={entry.applicantChecked}
                      docNo={entry.applicantDocNo}
                      onCheck={v => updateKyc(doc.key, { applicantChecked: v })}
                      onDocNo={v => updateKyc(doc.key, { applicantDocNo: v })}
                    />
                    <KycCheckCell
                      checked={entry.coApplicantChecked}
                      docNo={entry.coApplicantDocNo}
                      onCheck={v => updateKyc(doc.key, { coApplicantChecked: v })}
                      onDocNo={v => updateKyc(doc.key, { coApplicantDocNo: v })}
                    />
                    <KycCheckCell
                      checked={entry.guarantorChecked}
                      docNo={entry.guarantorDocNo}
                      onCheck={v => updateKyc(doc.key, { guarantorChecked: v })}
                      onDocNo={v => updateKyc(doc.key, { guarantorDocNo: v })}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Sanction Documents */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">folder_open</span>
          Pre-Sanction Documents
        </h4>
        <div className="bg-surface-container/50 rounded-xl border border-outline-variant/20 px-5 py-2">
          {/* Mutually exclusive document type selection */}
          <div className="pb-3 border-b border-outline-variant/10 mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Select Primary Document Type (choose one)
            </p>
            {PRE_SANCTION_DOC_TYPES.map(doc => (
              <SimpleRadio
                key={doc.key}
                name="preSanctionDocType"
                checked={formData.preSanctionDocs[doc.key] as boolean}
                onChange={() => selectPreSanctionDocType(doc.key)}
                label={doc.label}
              />
            ))}
          </div>
          {/* Additional documents (checkboxes - can select multiple) */}
          <div className="pb-3 border-b border-outline-variant/10 mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Additional Documents (optional)
            </p>
            {[
              { key: 'insurance', label: 'Comprehensive Insurance Policy' },
              { key: 'bankStatement', label: 'Bank statement of last 6 months' },
              { key: 'itr', label: 'Last 2 years ITR (if income assessee)' },
              { key: 'nonIndividualDoc', label: "Non-individual entity's relevant document (if Non-individual)" },
            ].map(doc => (
              <SimpleCheckbox
                key={doc.key}
                checked={formData.preSanctionDocs[doc.key as keyof Omit<VehicleLoanFormData['preSanctionDocs'], 'othersText'>] as boolean}
                onChange={v => updatePreSanction({ [doc.key]: v })}
                label={doc.label}
              />
            ))}
          </div>
          {/* Others text field */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Others</label>
            <input
              type="text"
              value={formData.preSanctionDocs.othersText}
              onChange={e => updatePreSanction({ othersText: e.target.value })}
              placeholder="Specify other documents..."
              className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Post-Disbursement Documents */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">task_alt</span>
          Post-Disbursement Documents
        </h4>
        <div className="bg-surface-container/50 rounded-xl border border-outline-variant/20 px-5 py-2">
          {/* Mutually exclusive document type selection */}
          <div className="pb-3 border-b border-outline-variant/10 mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Select Primary Document Type (choose one)
            </p>
            {POST_DISBURSE_DOC_TYPES.map(doc => (
              <SimpleRadio
                key={doc.key}
                name="postDisburseDocType"
                checked={formData.postDisbursementDocs[doc.key] as boolean}
                onChange={() => selectPostDisburseDocType(doc.key)}
                label={doc.label}
              />
            ))}
          </div>
          {/* Others text field */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Others</label>
            <input
              type="text"
              value={formData.postDisbursementDocs.othersText}
              onChange={e => updatePostDisburse({ othersText: e.target.value })}
              placeholder="Specify other documents..."
              className="w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-accent text-base mt-0.5">info</span>
        <p className="text-xs text-accent/90">
          This checklist is for employee verification purposes. All documents should be physically verified by the staff before submission.
        </p>
      </div>
    </div>
  );
}
