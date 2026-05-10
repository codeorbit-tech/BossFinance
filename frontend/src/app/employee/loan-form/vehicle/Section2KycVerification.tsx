'use client';

import { VehicleLoanFormData } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

function KycCard({ party, data, updateKyc, ckycId, gstin, onMetadataChange, color }: {
  party: string;
  data: { aadhaar: string; pan: string };
  updateKyc: (updates: { aadhaar?: string; pan?: string }) => void;
  ckycId: string;
  gstin: string;
  onMetadataChange: (updates: { ckycId?: string; gstin?: string }) => void;
  color: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div className={`w-8 h-8 rounded-lg ${color} text-white flex items-center justify-center font-bold text-xs`}>
          {party.charAt(0)}
        </div>
        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">{party} KYC Details</h4>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Aadhaar Card Number *</label>
          <input 
            type="text" 
            maxLength={12}
            value={data.aadhaar} 
            onChange={e => updateKyc({ aadhaar: e.target.value.replace(/\D/g, '') })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
            placeholder="12-digit number" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">PAN Card Number *</label>
          <input 
            type="text" 
            maxLength={10}
            value={data.pan} 
            onChange={e => updateKyc({ pan: e.target.value.toUpperCase() })} 
            className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-accent transition-all"
            placeholder="ABCDE1234F" 
          />
        </div>
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-dashed border-outline-variant/30 mt-2">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">CKYC ID</label>
            <input 
              type="text" 
              value={ckycId} 
              onChange={e => onMetadataChange({ ckycId: e.target.value })} 
              className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-accent"
              placeholder="Central KYC No." 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">GSTIN</label>
            <input 
              type="text" 
              value={gstin} 
              onChange={e => onMetadataChange({ gstin: e.target.value })} 
              className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-accent"
              placeholder="GST Number" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Section2KycVerification({ formData, updateFormData }: Props) {
  const { kycDocuments } = formData;

  const updateKycField = (party: 'applicant' | 'coApplicant' | 'guarantor', updates: { aadhaar?: string; pan?: string }) => {
    const updatedKyc = { ...kycDocuments };
    if (updates.aadhaar !== undefined) {
      updatedKyc.aadhaarCard = { ...updatedKyc.aadhaarCard, [`${party}DocNo`]: updates.aadhaar, [`${party}Checked`]: !!updates.aadhaar };
    }
    if (updates.pan !== undefined) {
      updatedKyc.panCard = { ...updatedKyc.panCard, [`${party}DocNo`]: updates.pan, [`${party}Checked`]: !!updates.pan };
    }
    updateFormData({ kycDocuments: updatedKyc });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 flex items-center gap-3">
         <span className="material-symbols-outlined text-accent">info</span>
         <p className="text-xs font-medium text-on-surface-variant">
           Entering KYC details early allows for preliminary credit checks and background verification.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KycCard 
          party="Applicant" 
          color="bg-primary"
          data={{ 
            aadhaar: kycDocuments.aadhaarCard.applicantDocNo, 
            pan: kycDocuments.panCard.applicantDocNo 
          }}
          updateKyc={(u) => updateKycField('applicant', u)}
          ckycId={formData.applicantCkycId}
          gstin={formData.applicantGstin}
          onMetadataChange={(u) => updateFormData({
            applicantCkycId: u.ckycId !== undefined ? u.ckycId : formData.applicantCkycId,
            applicantGstin: u.gstin !== undefined ? u.gstin : formData.applicantGstin
          })}
        />

        <KycCard 
          party="Co-Applicant" 
          color="bg-secondary"
          data={{ 
            aadhaar: kycDocuments.aadhaarCard.coApplicantDocNo, 
            pan: kycDocuments.panCard.coApplicantDocNo 
          }}
          updateKyc={(u) => updateKycField('coApplicant', u)}
          ckycId={formData.coApplicantCkycId}
          gstin={formData.coApplicantGstin}
          onMetadataChange={(u) => updateFormData({ 
            coApplicantCkycId: u.ckycId !== undefined ? u.ckycId : formData.coApplicantCkycId,
            coApplicantGstin: u.gstin !== undefined ? u.gstin : formData.coApplicantGstin
          })}
        />

        <KycCard 
          party="Guarantor" 
          color="bg-tertiary"
          data={{ 
            aadhaar: kycDocuments.aadhaarCard.guarantorDocNo, 
            pan: kycDocuments.panCard.guarantorDocNo 
          }}
          updateKyc={(u) => updateKycField('guarantor', u)}
          ckycId={formData.guarantorCkycId}
          gstin={formData.guarantorGstin}
          onMetadataChange={(u) => updateFormData({ 
            guarantorCkycId: u.ckycId !== undefined ? u.ckycId : formData.guarantorCkycId,
            guarantorGstin: u.gstin !== undefined ? u.gstin : formData.guarantorGstin
          })}
        />
      </div>
    </div>
  );
}
