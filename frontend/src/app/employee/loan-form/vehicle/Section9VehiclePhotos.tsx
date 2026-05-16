'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PhotoUploads } from './types';

interface Props {
  photos: PhotoUploads;
  setPhotos: (photos: PhotoUploads) => void;
  errors: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png'];

function validateFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Only JPG/PNG files are accepted.';
  if (file.size > MAX_FILE_SIZE) return 'File size must not exceed 5MB.';
  return null;
}

function PhotoSlot({
  label, icon, mandatory, file, onChange, aspect = "aspect-video"
}: {
  label: string; icon: string; mandatory: boolean; file: File | null;
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering click on parent
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-accent text-base">{icon}</span>
        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{label}</span>
        {mandatory && <span className="text-error text-[10px] font-black">*</span>}
        {file && (
          <span className="ml-auto text-[9px] font-black text-accent flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            READY
          </span>
        )}
      </div>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative ${aspect} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragOver
              ? 'border-accent bg-accent/5 scale-[1.02]'
              : 'border-outline-variant/30 bg-surface-container-low hover:border-accent/40 hover:bg-accent/5'
          }`}
        >
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">add_a_photo</span>
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Upload Image</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className={`relative ${aspect} rounded-2xl overflow-hidden border-2 border-accent/20 group`}>
          {preview ? (
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={clearFile}
              className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[9px] font-bold text-error flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Section9VehiclePhotos({ photos, setPhotos }: Props) {
  const updatePhoto = (key: keyof PhotoUploads, file: File | null) => {
    setPhotos({ ...photos, [key]: file });
  };

  const updateOther = (idx: number, file: File | null) => {
    const updated = [...photos.others];
    updated[idx] = file;
    setPhotos({ ...photos, others: updated });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Individual Portraits */}
      <div>
        <h4 className="text-sm font-black text-on-surface mb-6 flex items-center gap-3 uppercase tracking-widest">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
          </div>
          Personal Identification Photos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <PhotoSlot
            label="Applicant Passport Photo"
            icon="account_circle"
            mandatory={true}
            aspect="aspect-[3/4]"
            file={photos.applicantPhoto}
            onChange={f => updatePhoto('applicantPhoto', f)}
          />
          <PhotoSlot
            label="Co-Applicant Passport Photo"
            icon="account_circle"
            mandatory={false}
            aspect="aspect-[3/4]"
            file={photos.coApplicantPhoto}
            onChange={f => updatePhoto('coApplicantPhoto', f)}
          />
          <PhotoSlot
            label="Guarantor Passport Photo"
            icon="account_circle"
            mandatory={false}
            aspect="aspect-[3/4]"
            file={photos.guarantorPhoto}
            onChange={f => updatePhoto('guarantorPhoto', f)}
          />
        </div>
      </div>

      <div className="h-px bg-outline-variant/10" />

      {/* 2. House Photos */}
      <div>
        <h4 className="text-sm font-black text-on-surface mb-6 flex items-center gap-3 uppercase tracking-widest">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-lg">home</span>
          </div>
          Property Inspection Gallery
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
           <PhotoSlot label="House Front View" icon="home" mandatory={true} file={photos.houseFrontView} onChange={f => updatePhoto('houseFrontView', f)} />
           <PhotoSlot label="House Back View" icon="home" mandatory={true} file={photos.houseBackView} onChange={f => updatePhoto('houseBackView', f)} />
           <PhotoSlot label="House Left Side View" icon="home" mandatory={true} file={photos.houseLeftView} onChange={f => updatePhoto('houseLeftView', f)} />
           <PhotoSlot label="House Right Side View" icon="home" mandatory={true} file={photos.houseRightView} onChange={f => updatePhoto('houseRightView', f)} />
        </div>

        <div className="space-y-4">
           <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Additional Photos (Optional)</p>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
             {photos.others.map((file, idx) => (
               <PhotoSlot
                 key={idx}
                 label={`Other ${idx + 1}`}
                 icon="add_photo_alternate"
                 mandatory={false}
                 file={file}
                 onChange={f => updateOther(idx, f)}
               />
             ))}
           </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
        <div className="flex items-center gap-3 mb-4">
           <span className="material-symbols-outlined text-accent">verified</span>
           <p className="text-xs font-black text-on-surface uppercase tracking-widest">Upload Quality Standards</p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
           {[
             'Passport photos must be 3:4 aspect ratio with clear face visibility.',
             'Property photos must show the full structure without obstructions.',
             'Maximum file size is 5MB. Highly recommended to use original quality.',
             'Only JPG and PNG formats are supported for PDF generation.'
           ].map((g, i) => (
             <li key={i} className="flex items-start gap-2 text-[11px] text-on-surface-variant font-medium">
               <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
               {g}
             </li>
           ))}
        </ul>
      </div>
    </div>
  );
}
