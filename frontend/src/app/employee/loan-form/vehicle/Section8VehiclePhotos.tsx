'use client';

import { useRef, useState } from 'react';
import { PhotoUploads } from './types';

interface Props {
  photos: PhotoUploads;
  setPhotos: (photos: PhotoUploads) => void;
  errors: string[];
}

const MANDATORY_SLOTS = [
  { key: 'frontView' as keyof PhotoUploads, label: 'Front View', icon: 'directions_car', mandatory: true },
  { key: 'leftSideView' as keyof PhotoUploads, label: 'Left Side View', icon: 'arrow_back', mandatory: true },
  { key: 'rightSideView' as keyof PhotoUploads, label: 'Right Side View', icon: 'arrow_forward', mandatory: true },
  { key: 'backView' as keyof PhotoUploads, label: 'Back View', icon: 'directions_car', mandatory: true },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png'];

function validateFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Only JPG/PNG files are accepted.';
  if (file.size > MAX_FILE_SIZE) return 'File size must not exceed 5MB.';
  return null;
}

function PhotoSlot({
  label, icon, mandatory, file, onChange
}: {
  label: string; icon: string; mandatory: boolean; file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null);
    onChange(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
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

  const clearFile = () => {
    onChange(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-accent text-base">{icon}</span>
        <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{label}</span>
        {mandatory && <span className="text-error text-xs font-bold">*</span>}
        {file && (
          <span className="ml-auto text-[10px] font-bold text-accent flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Uploaded
          </span>
        )}
      </div>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragOver
              ? 'border-accent bg-accent/5 scale-[1.02]'
              : 'border-outline-variant/40 bg-surface-container hover:border-accent/40 hover:bg-accent/5'
          }`}
        >
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">upload</span>
          <div className="text-center">
            <p className="text-xs font-bold text-on-surface-variant">Click or drag photo here</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">JPG / PNG — Max 5MB</p>
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
        <div className="relative h-36 rounded-xl overflow-hidden border border-accent/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? ''}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-end justify-end p-2 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={clearFile}
              className="w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 transition-all"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              {file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Section8VehiclePhotos({ photos, setPhotos }: Props) {
  const updateMandatory = (key: keyof PhotoUploads, file: File | null) => {
    setPhotos({ ...photos, [key]: file });
  };

  const updateOther = (idx: number, file: File | null) => {
    const updated = [...photos.others];
    updated[idx] = file;
    setPhotos({ ...photos, others: updated });
  };

  const completedMandatory = MANDATORY_SLOTS.filter(s => photos[s.key] !== null).length;

  return (
    <div className="space-y-8">
      {/* Upload Progress */}
      <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-bold text-on-surface">Mandatory Photos</span>
            <span className={`text-xs font-bold ${completedMandatory === 4 ? 'text-accent' : 'text-on-surface-variant'}`}>
              {completedMandatory} / 4
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completedMandatory === 4 ? 'bg-accent' : 'bg-primary'
              }`}
              style={{ width: `${(completedMandatory / 4) * 100}%` }}
            />
          </div>
        </div>
        {completedMandatory === 4 && (
          <div className="flex items-center gap-1.5 text-accent">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="text-xs font-bold">All mandatory photos uploaded</span>
          </div>
        )}
      </div>

      {/* Mandatory Slots */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">photo_camera</span>
          Vehicle Photos — Mandatory <span className="text-error text-sm">*</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MANDATORY_SLOTS.map(slot => (
            <PhotoSlot
              key={slot.key}
              label={slot.label}
              icon={slot.icon}
              mandatory={slot.mandatory}
              file={photos[slot.key] as File | null}
              onChange={f => updateMandatory(slot.key, f)}
            />
          ))}
        </div>
      </div>

      {/* Optional Additional Photos */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-base">add_photo_alternate</span>
          Additional Photos — Optional
        </h4>
        <p className="text-xs text-on-surface-variant mb-4">Up to 5 additional vehicle photos</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos.others.map((file, idx) => (
            <PhotoSlot
              key={idx}
              label={`Others ${idx + 1}`}
              icon="photo"
              mandatory={false}
              file={file}
              onChange={f => updateOther(idx, f)}
            />
          ))}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-accent text-base mt-0.5">info</span>
        <div>
          <p className="text-xs font-bold text-accent mb-1">Photo Upload Guidelines</p>
          <ul className="text-[11px] text-accent/80 space-y-0.5">
            <li>• Accepted formats: JPG, PNG only</li>
            <li>• Maximum file size: 5MB per image</li>
            <li>• All 4 mandatory views (Front, Left, Right, Back) must be uploaded before proceeding</li>
            <li>• Photos should be clear, well-lit, and unobstructed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
