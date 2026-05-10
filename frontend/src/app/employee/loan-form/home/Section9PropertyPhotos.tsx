'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HomePhotoUploads } from './types';

interface Props {
  photos: HomePhotoUploads;
  setPhotos: (photos: HomePhotoUploads) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png'];

function validateFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Only JPG/PNG files are accepted.';
  if (file.size > MAX_FILE_SIZE) return 'File size must not exceed 5MB.';
  return null;
}

function PhotoSlot({
  label, icon, required, file, onChange, aspect = "aspect-[3/4]"
}: {
  label: string; icon: string; required: boolean; file: File | null;
  onChange: (file: File | null) => void; aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null);
    onChange(f);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-accent text-base">{icon}</span>
        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{label}</span>
        {required && <span className="text-error text-[10px] font-black">*</span>}
      </div>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`relative ${aspect} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragOver ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-outline-variant/30 bg-surface-container hover:border-accent/40'
          }`}
        >
          <span className="material-symbols-outlined text-2xl text-on-surface-variant/30 text-accent">add_a_photo</span>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase">Upload</p>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleInput} className="hidden" />
        </div>
      ) : (
        <div className={`relative ${aspect} rounded-2xl overflow-hidden border-2 border-accent/20 group`}>
          {preview ? (
            <img src={preview} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button type="button" onClick={clearFile} className="w-8 h-8 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-[9px] font-bold text-error flex items-center gap-1 mt-1">{error}</p>}
    </div>
  );
}

export default function Section9PropertyPhotos({ photos, setPhotos }: Props) {
  const updatePhoto = useCallback((key: keyof HomePhotoUploads, file: File | null) => {
    setPhotos({ ...photos, [key]: file });
  }, [photos, setPhotos]);

  const updateOther = useCallback((idx: number, file: File | null) => {
    const updated = [...photos.others];
    updated[idx] = file;
    setPhotos({ ...photos, others: updated });
  }, [photos, setPhotos]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Portraits */}
      <div>
        <h4 className="text-sm font-black text-on-surface mb-6 flex items-center gap-3 uppercase tracking-widest">
           <span className="material-symbols-outlined text-primary">person</span>
           Passport Size Photos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <PhotoSlot label="Applicant" icon="account_circle" required={true} file={photos.applicantPhoto} onChange={f => updatePhoto('applicantPhoto', f)} />
          <PhotoSlot label="Co-Applicant" icon="account_circle" required={false} file={photos.coApplicantPhoto} onChange={f => updatePhoto('coApplicantPhoto', f)} />
          <PhotoSlot label="Guarantor" icon="account_circle" required={false} file={photos.guarantorPhoto} onChange={f => updatePhoto('guarantorPhoto', f)} />
        </div>
      </div>

      <div className="h-px bg-outline-variant/10" />

      {/* 2. Property Photos */}
      <div>
        <h4 className="text-sm font-black text-on-surface mb-6 flex items-center gap-3 uppercase tracking-widest">
           <span className="material-symbols-outlined text-accent">home_work</span>
           Property Site Photos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
           <PhotoSlot label="Elevation View" icon="architecture" required={true} aspect="aspect-video" file={photos.frontElevation} onChange={f => updatePhoto('frontElevation', f)} />
           <PhotoSlot label="Interior View" icon="chair" required={true} aspect="aspect-video" file={photos.interiorView} onChange={f => updatePhoto('interiorView', f)} />
           <PhotoSlot label="Side / Site Context" icon="location_on" required={true} aspect="aspect-video" file={photos.sideSiteView} onChange={f => updatePhoto('sideSiteView', f)} />
           <PhotoSlot label="Layout / Site Plan" icon="map" required={true} aspect="aspect-video" file={photos.layoutPlan} onChange={f => updatePhoto('layoutPlan', f)} />
        </div>

        <div className="space-y-4">
           <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Additional Photos (Optional)</p>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
             {photos.others.map((file, idx) => (
               <PhotoSlot key={idx} label={`Extra ${idx + 1}`} icon="add_a_photo" required={false} aspect="aspect-square" file={file} onChange={f => updateOther(idx, f)} />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
