'use client';

import { useEffect, useState } from 'react';
import { SAMPLE_FORM_DATA } from '../vehicle/sampleData';
import { PhotoUploads } from '../vehicle/types';

/** Creates a tiny transparent PNG as a placeholder "file" for demo purposes */
function makeDemoPhoto(name: string): File {
  // 1x1 transparent PNG (base64)
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const byteString = atob(b64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: 'image/png' });
  return new File([blob], name, { type: 'image/png' });
}

const DEMO_PHOTOS: PhotoUploads = {
  frontView: makeDemoPhoto('front_view.png'),
  leftSideView: makeDemoPhoto('left_side.png'),
  rightSideView: makeDemoPhoto('right_side.png'),
  backView: makeDemoPhoto('back_view.png'),
  others: [null, null, null, null, null],
};

export default function SamplePDFPage() {
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    setStatus('generating');
    try {
      const { generateVehicleLoanPDF } = await import('@/lib/generateVehicleLoanPDF');
      await generateVehicleLoanPDF(SAMPLE_FORM_DATA, DEMO_PHOTOS);
      setStatus('done');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  // Auto-trigger on mount
  useEffect(() => {
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/BossLogo.png" alt="Boss Finance" className="w-20 h-20 object-contain rounded-2xl" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold font-[var(--font-headline)] text-on-surface mb-1">
            Sample PDF Generator
          </h1>
          <p className="text-sm text-on-surface-variant">
            Boss Finance — Vehicle Loan Application
          </p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl border p-8 transition-all ${
          status === 'done'
            ? 'bg-accent/5 border-accent/30'
            : status === 'error'
            ? 'bg-error/5 border-error/30'
            : 'bg-surface-container border-outline-variant/20'
        }`}>
          {status === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">picture_as_pdf</span>
              <p className="text-sm text-on-surface-variant">Initializing...</p>
            </div>
          )}

          {status === 'generating' && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                <span className="material-symbols-outlined absolute inset-0 m-auto text-accent text-xl flex items-center justify-center">picture_as_pdf</span>
              </div>
              <div>
                <p className="text-base font-bold text-on-surface">Generating PDF...</p>
                <p className="text-xs text-on-surface-variant mt-1">Building all sections with sample data</p>
              </div>
              <div className="w-full max-w-xs space-y-2 text-left">
                {[
                  'Loading Boss Finance logo...',
                  'Building header & application info...',
                  'Rendering personal & contact details...',
                  'Formatting bank & employment data...',
                  'Compiling document checklist...',
                  'Adding declaration & signature blocks...',
                  'Finalising page footers...',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-accent text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div>
                <p className="text-lg font-bold text-on-surface">PDF Downloaded!</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Check your Downloads folder for <span className="font-bold text-accent">VehicleLoan_VL-20260412-8842_20260412.pdf</span>
                </p>
              </div>

              <div className="bg-surface-container rounded-xl p-4 w-full text-left space-y-1.5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Sample Data Used</p>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Applicant</span>
                  <span className="font-bold text-on-surface">Rajesh Kumar Sharma</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Co-Applicant</span>
                  <span className="font-bold text-on-surface">Priya Sharma</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Guarantor</span>
                  <span className="font-bold text-on-surface">Venkatesh Rao Pillai</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Employment</span>
                  <span className="font-bold text-on-surface">Infosys Ltd. / Cognizant</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Bank</span>
                  <span className="font-bold text-on-surface">SBI / HDFC</span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-on-surface text-surface font-bold text-sm hover:bg-on-surface/90 transition-all"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Download Again
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-3xl">error</span>
              </div>
              <div>
                <p className="text-base font-bold text-error">PDF Generation Failed</p>
                <p className="text-xs text-error/70 mt-1 font-mono">{errorMsg}</p>
              </div>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:bg-error/90 transition-all"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Retry
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-on-surface-variant">
          This page is for demo/testing only. Navigate to{' '}
          <a href="/employee/loan-form/vehicle" className="text-accent font-bold hover:underline">
            /employee/loan-form/vehicle
          </a>{' '}
          for the actual form.
        </p>
      </div>
    </div>
  );
}
