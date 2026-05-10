'use client';

import { HomeLoanFormData, HomePhotoUploads } from './types';
import { useRef } from 'react';

interface Props {
  formData: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  photos: HomePhotoUploads;
  setPhotos: (photos: HomePhotoUploads) => void;
  errors: string[];
}

function DocUploadSlot({
  label, file, onChange, icon
}: {
  label: string; file: File | null; onChange: (f: File | null) => void; icon: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-2 animate-in zoom-in-95 duration-200">
      <div 
        onClick={() => inputRef.current?.click()}
        className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
          file ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/20 bg-surface-container hover:border-primary/30'
        }`}
      >
        {preview ? (
          <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover rounded-lg" />
        ) : file ? (
          <div className="flex flex-col items-center gap-1">
             <span className="material-symbols-outlined text-primary text-xl">description</span>
             <span className="text-[8px] font-bold text-primary uppercase text-center px-2 truncate w-full">{file.name}</span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">{icon}</span>
            <span className="text-[8px] font-bold text-on-surface-variant/60 uppercase">Click to Upload</span>
          </>
        )}
        <input 
          ref={inputRef}
          type="file" 
          accept=".jpg,.jpeg,.png,.pdf" 
          onChange={e => onChange(e.target.files?.[0] || null)} 
          className="hidden" 
        />
      </div>
      {file && (
        <button 
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          className="text-[8px] font-bold text-error uppercase flex items-center justify-center gap-1 hover:underline"
        >
          <span className="material-symbols-outlined text-[10px]">delete</span> Remove
        </button>
      )}
    </div>
  );
}

function KycInputField({
  label, value, onChange, placeholder, required, icon
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; icon: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
        <span className="material-symbols-outlined text-xs text-primary">{icon}</span>
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-high border border-outline-variant/10 focus:border-primary/40 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-on-surface-variant/30"
      />
    </div>
  );
}

function DocSelectionToggle({
  label, checked, onChange, icon
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void; icon: string;
}) {
  return (
    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant/30'}`}>
       <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${checked ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
          {checked && <span className="material-symbols-outlined text-white text-base">check</span>}
       </div>
       <div className="flex items-center gap-2 flex-1">
          <span className="material-symbols-outlined text-lg text-on-surface-variant/50">{icon}</span>
          <span className={`text-[10px] font-black uppercase tracking-wider ${checked ? 'text-on-surface' : 'text-on-surface-variant'}`}>{label}</span>
       </div>
       <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
}

function PartyKycGroup({
  title, partyKey, data, updateFormData, photos, setPhotos
}: {
  title: string; partyKey: 'applicant' | 'coApplicant' | 'guarantor'; data: HomeLoanFormData;
  updateFormData: (updates: Partial<HomeLoanFormData>) => void;
  photos: HomePhotoUploads; setPhotos: (p: HomePhotoUploads) => void;
}) {
  const isReq = partyKey === 'applicant' || (partyKey === 'coApplicant' && data.coApplicantOwnedHouse) || (partyKey === 'guarantor' && data.guarantorOwnedHouse);
  const kyc = data.kycDocuments;

  const updateDocCheck = (docKey: keyof typeof kyc, checked: boolean) => {
    updateFormData({
      kycDocuments: {
        ...kyc,
        [docKey]: { ...kyc[docKey], [`${partyKey}Checked`]: checked }
      }
    });
  };

  const updateDocNo = (docKey: keyof typeof kyc, val: string) => {
    updateFormData({
      kycDocuments: {
        ...kyc,
        [docKey]: { ...kyc[docKey], [`${partyKey}DocNo`]: val }
      }
    });
  };

  const updateGst = (val: string) => {
    updateFormData({ [`${partyKey}Gstin`]: val } as any);
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-10">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${partyKey === 'applicant' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
               <span className="material-symbols-outlined text-2xl">fingerprint</span>
            </div>
            <div>
               <h4 className="font-black text-on-surface uppercase tracking-widest text-base">{title} Identification</h4>
               <p className="text-[10px] text-on-surface-variant font-bold">Government ID Details</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <KycInputField 
           label="Aadhaar Card No." 
           value={(kyc.aadhaarCard as any)[`${partyKey}DocNo`] || ''} 
           onChange={v => updateDocNo('aadhaarCard', v)} 
           placeholder="1111 2222 3333"
           required={isReq}
           icon="id_card"
         />
         <KycInputField 
           label="PAN Card No." 
           value={(kyc.panCard as any)[`${partyKey}DocNo`] || ''} 
           onChange={v => updateDocNo('panCard', v)} 
           placeholder="ABCDE1234F"
           required={isReq}
           icon="demography"
         />
         <KycInputField 
           label="GSTIN (Optional)" 
           value={(data as any)[`${partyKey}Gstin`] || ''} 
           onChange={v => updateGst(v)} 
           placeholder="GST Number"
           icon="receipt_long"
         />
      </div>

      {partyKey === 'applicant' && (
        <div className="pt-6 border-t border-outline-variant/10 space-y-8">
          <div className="flex flex-col gap-1">
             <h5 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
               <span className="material-symbols-outlined text-xs text-accent">upload_file</span>
               Address & Identity Proof Documents
             </h5>
             <p className="text-[9px] text-on-surface-variant/60 font-bold uppercase italic">Select at least one utility bill for address verification</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="space-y-4">
                <DocSelectionToggle 
                  label="Gas Connection" 
                  checked={kyc.gasConnection.applicantChecked} 
                  onChange={v => {
                    updateDocCheck('gasConnection', v);
                    if (!v) setPhotos({...photos, gasBill: null});
                  }} 
                  icon="gas_meter" 
                />
                {kyc.gasConnection.applicantChecked && (
                  <DocUploadSlot label="Upload Gas Bill" file={photos.gasBill} onChange={f => setPhotos({...photos, gasBill: f})} icon="gas_meter" />
                )}
             </div>

             <div className="space-y-4">
                <DocSelectionToggle 
                  label="EB Bill (Electricity)" 
                  checked={kyc.electricityBill.applicantChecked} 
                  onChange={v => {
                    updateDocCheck('electricityBill', v);
                    if (!v) setPhotos({...photos, ebBill: null});
                  }} 
                  icon="bolt" 
                />
                {kyc.electricityBill.applicantChecked && (
                  <DocUploadSlot label="Upload EB Bill" file={photos.ebBill} onChange={f => setPhotos({...photos, ebBill: f})} icon="bolt" />
                )}
             </div>

             <div className="space-y-4">
                <DocSelectionToggle 
                  label="Ration Card" 
                  checked={kyc.rationCard.applicantChecked} 
                  onChange={v => {
                    updateDocCheck('rationCard', v);
                    if (!v) setPhotos({...photos, rationCard: null});
                  }} 
                  icon="shopping_basket" 
                />
                {kyc.rationCard.applicantChecked && (
                  <DocUploadSlot label="Upload Ration Card" file={photos.rationCard} onChange={f => setPhotos({...photos, rationCard: f})} icon="shopping_basket" />
                )}
             </div>

             <div className="space-y-4">
                <DocSelectionToggle 
                  label="Voter ID Card" 
                  checked={kyc.voterIdCard.applicantChecked} 
                  onChange={v => {
                    updateDocCheck('voterIdCard', v);
                    if (!v) setPhotos({...photos, voterId: null});
                  }} 
                  icon="how_to_vote" 
                />
                {kyc.voterIdCard.applicantChecked && (
                  <DocUploadSlot label="Upload Voter ID" file={photos.voterId} onChange={f => setPhotos({...photos, voterId: f})} icon="how_to_vote" />
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Section2KycVerification({ formData, updateFormData, photos, setPhotos }: Props) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-3xl p-8 flex items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-2xl">verified</span>
        </div>
        <div>
          <h4 className="text-lg font-black text-on-surface mb-2 tracking-tight">Identity & Verification</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl font-medium">
            Provide Aadhaar and PAN details for all parties. Select the available utility bills to enable the respective upload slots.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <PartyKycGroup title="Applicant" partyKey="applicant" data={formData} updateFormData={updateFormData} photos={photos} setPhotos={setPhotos} />
        <PartyKycGroup title="Co-Applicant" partyKey="coApplicant" data={formData} updateFormData={updateFormData} photos={photos} setPhotos={setPhotos} />
        <PartyKycGroup title="Guarantor" partyKey="guarantor" data={formData} updateFormData={updateFormData} photos={photos} setPhotos={setPhotos} />
      </div>
    </div>
  );
}
