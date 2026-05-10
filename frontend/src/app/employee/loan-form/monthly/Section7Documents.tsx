'use client';

import { MonthlyLoanPhotos } from './types';

interface Props {
  photos: MonthlyLoanPhotos;
  setPhotos: (p: MonthlyLoanPhotos) => void;
  errors: string[];
}

function PhotoUpload({ label, icon, file, onChange, required }: {
  label: string; icon: string; file: File | null; onChange: (f: File | null) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <label className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${file ? 'border-accent bg-accent/5' : 'border-outline-variant/40 hover:border-accent/40 bg-surface-container-high'}`}>
        <input
          type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => onChange(e.target.files?.[0] || null)}
        />
        {file ? (
          <>
            <span className="material-symbols-outlined text-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-xs font-bold text-accent text-center truncate max-w-full px-2">{file.name}</p>
            <p className="text-[10px] text-accent/70">Tap to change</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">{icon}</span>
            <p className="text-xs font-medium text-on-surface-variant text-center">Upload {label}</p>
            <p className="text-[10px] text-on-surface-variant/60">JPG, PNG or PDF</p>
          </>
        )}
      </label>
    </div>
  );
}

export default function Section7Documents({ photos, setPhotos, errors }: Props) {
  const update = (key: keyof MonthlyLoanPhotos, file: File | null) => {
    setPhotos({ ...photos, [key]: file });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">photo_camera</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface mb-1">Section 7: Documents & Photos</h4>
          <p className="text-xs text-on-surface-variant">Upload identity documents and applicant photographs.</p>
        </div>
      </div>

      <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-6 space-y-5">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">portrait</span>
          Applicant Photos
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <PhotoUpload label="Applicant Photo" icon="person" file={photos.applicantPhoto} onChange={f => update('applicantPhoto', f)} required />
          <PhotoUpload label="Co-Applicant Photo" icon="group" file={photos.coApplicantPhoto} onChange={f => update('coApplicantPhoto', f)} />
          <PhotoUpload label="Guarantor Photo" icon="support_agent" file={photos.guarantorPhoto} onChange={f => update('guarantorPhoto', f)} />
        </div>
      </section>

      <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-6 space-y-5">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">badge</span>
          KYC Documents
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <PhotoUpload label="Aadhaar Front" icon="id_card" file={photos.aadhaarFront} onChange={f => update('aadhaarFront', f)} required />
          <PhotoUpload label="Aadhaar Back" icon="id_card" file={photos.aadhaarBack} onChange={f => update('aadhaarBack', f)} />
          <PhotoUpload label="PAN Card" icon="credit_card" file={photos.panCard} onChange={f => update('panCard', f)} />
        </div>
      </section>

      <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-6 space-y-5">
        <h4 className="text-sm font-black text-tertiary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">description</span>
          Supporting Documents
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <PhotoUpload label="Income Proof" icon="receipt_long" file={photos.incomeProof} onChange={f => update('incomeProof', f)} />
          <PhotoUpload label="Business Proof" icon="store" file={photos.businessProof} onChange={f => update('businessProof', f)} />
        </div>
      </section>
    </div>
  );
}
