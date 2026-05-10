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

function MultipleFileUploader({ files, onChange }: { files: File[], onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    const updated = [...files];
    updated.splice(idx, 1);
    onChange(updated);
  };

  return (
    <div className="p-6 bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 rounded-2xl min-h-[400px] flex flex-col">
      <div className="flex flex-col items-center justify-center gap-3 text-center mb-8 flex-1">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
          <span className="material-symbols-outlined text-3xl">cloud_upload</span>
        </div>
        <div>
          <h5 className="text-lg font-bold text-on-surface">Upload Loan Documents</h5>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto mt-2">
            Upload any required documents for this application here (KYC proofs, property papers, bank statements, etc.). All uploaded files will be automatically bundled into a ZIP file when you submit the form.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 px-8 py-3 bg-accent text-white font-bold text-sm rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center gap-2 hover:scale-105"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Select Documents
        </button>
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleInput} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-auto">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0">
                  {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                </span>
                <span className="text-xs font-bold text-on-surface truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
              <button type="button" onClick={() => removeFile(idx)} className="text-error/70 hover:text-error hover:bg-error/10 p-1.5 rounded-lg shrink-0 ml-2 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Section10DocumentChecklist({ photos, setPhotos }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MultipleFileUploader 
        files={photos.uploadedDocuments || []} 
        onChange={files => setPhotos({ ...photos, uploadedDocuments: files })} 
      />
    </div>
  );
}
