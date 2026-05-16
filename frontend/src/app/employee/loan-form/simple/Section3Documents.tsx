'use client';

import { SimplePhotoUploads } from './types';

interface Props {
  photos: SimplePhotoUploads;
  setPhotos: (photos: SimplePhotoUploads) => void;
  errors: string[];
}

interface PhotoCardProps {
  field: keyof SimplePhotoUploads;
  label: string;
  icon: string;
  required?: boolean;
  photos: SimplePhotoUploads;
  setPhotos: (photos: SimplePhotoUploads) => void;
  setFileInputRef: (field: keyof SimplePhotoUploads, el: HTMLInputElement | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof SimplePhotoUploads) => void;
}

function PhotoCard({ field, label, icon, required = false, photos, setPhotos, setFileInputRef, handleFileChange }: PhotoCardProps) {
  const file = photos[field];
  const previewUrl = file ? URL.createObjectURL(file as File) : null;

  return (
    <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col items-center text-center border-2 border-dashed border-outline-variant/30 hover:border-accent/40 transition-all group relative overflow-hidden">
      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black">
          <img src={previewUrl} alt={label} className="w-full h-full object-contain" />
          <button
            onClick={() => setPhotos({ ...photos, [field]: null })}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center shadow-lg"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ) : (
        <div className="py-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-on-surface-variant mb-4 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <p className="text-xs font-bold text-on-surface mb-1">
            {label} {required && <span className="text-error">*</span>}
          </p>
          <p className="text-[10px] text-on-surface-variant opacity-60">Upload photo or document</p>
        </div>
      )}

      {!previewUrl && (
        <button
          onClick={() => document.getElementById(`file-input-${String(field)}`)?.click()}
          className="mt-4 px-6 py-2 bg-white text-on-surface font-bold text-[10px] rounded-xl border border-outline-variant shadow-sm hover:bg-surface-container transition-all"
        >
          Choose File
        </button>
      )}

      <input
        type="file"
        id={`file-input-${String(field)}`}
        ref={(el) => setFileInputRef(field, el)}
        onChange={(e) => handleFileChange(e, field)}
        className="hidden"
        accept="image/*,.pdf"
      />
    </div>
  );
}

export default function Section3Documents({ photos, setPhotos }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SimplePhotoUploads) => {
    if (e.target.files && e.target.files[0]) {
      setPhotos({ ...photos, [field]: e.target.files[0] });
    }
  };

  const setFileInputRef = (_field: keyof SimplePhotoUploads, _el: HTMLInputElement | null) => {
    // Keep explicit ref callback for future imperative controls.
  };

  return (
    <div className="space-y-8">
      <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20 mb-4">
        <p className="text-xs text-on-surface-variant font-bold">
          Note: Upload <span className="text-error">4 sides</span> of the applicant's property (Front, Back, Left, Right views). All 4 photos are mandatory.
        </p>
      </div>

      {/* Applicant Documents */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-sm">person</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Applicant Documents</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PhotoCard field="applicantPhoto" label="Applicant Photo" icon="account_circle" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="aadhaarFront" label="Aadhaar Front" icon="badge" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="aadhaarBack" label="Aadhaar Back" icon="badge" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="panCard" label="PAN Card" icon="credit_card" photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="shopPhoto" label="Shop/Business Photo" icon="store" photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
        </div>
      </div>

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* Co-Applicant Documents */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-sm">group</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Co-Applicant Documents</h4>
          <span className="text-[10px] text-on-surface-variant font-medium">(Optional)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PhotoCard field="coApplicantPhoto" label="Co-Applicant Photo" icon="account_circle" photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
        </div>
      </div>

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* Guarantor Documents */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-sm">shield_person</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Guarantor Documents</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PhotoCard field="guarantorPhoto" label="Guarantor Photo" icon="account_circle" photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="guarantorAadhaarFront" label="Guarantor Aadhaar Front" icon="badge" photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="guarantorAadhaarBack" label="Guarantor Aadhaar Back" icon="badge" photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
        </div>
      </div>

      <div className="h-px bg-outline-variant/10 w-full" />

      {/* Property Evidence — 4 Sides */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-sm">home</span>
          </div>
          <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Property Evidence — 4 Sides</h4>
          <span className="text-error text-[10px] font-black">* Mandatory</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PhotoCard field="houseFrontView" label="House Front View" icon="home" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="houseBackView" label="House Back View" icon="home" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="houseLeftView" label="House Left Side" icon="home" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
          <PhotoCard field="houseRightView" label="House Right Side" icon="home" required photos={photos} setPhotos={setPhotos} setFileInputRef={setFileInputRef} handleFileChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
