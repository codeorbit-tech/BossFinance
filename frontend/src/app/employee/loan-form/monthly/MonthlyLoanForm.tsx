'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { MonthlyLoanFormData, MonthlyLoanPhotos, emptyMonthlyLoanData, emptyMonthlyPhotos } from './types';
import Section1PrimaryDetails from './Section1PrimaryDetails';
import Section2KycVerification from './Section2KycVerification';
import Section3LoanDetails from './Section3LoanDetails';
import Section4AddressContact from './Section4AddressContact';
import Section5BankDetails from './Section5BankDetails';
import Section6EmploymentBusiness from './Section6EmploymentBusiness';
import Section7Documents from './Section7Documents';
import { customersApi, loansApi } from '@/lib/api';
import { sampleMonthlyData } from './sampleData';

const SECTIONS = [
  { id: 1, label: 'Primary Details', icon: 'person' },
  { id: 2, label: 'KYC Verification', icon: 'verified_user' },
  { id: 3, label: 'Loan Details', icon: 'payments' },
  { id: 4, label: 'Address & Contact', icon: 'location_on' },
  { id: 5, label: 'Bank Details', icon: 'account_balance' },
  { id: 6, label: 'Employment / Business', icon: 'work' },
  { id: 7, label: 'Documents', icon: 'photo_camera' },
];

const TOTAL = SECTIONS.length;

function generateFormNo(prefix: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${rand}`;
}

function validateSection(section: number, data: MonthlyLoanFormData, photos: MonthlyLoanPhotos): string[] {
  const errs: string[] = [];
  if (section === 1) {
    if (!data.applicantName) errs.push('Applicant Name is required.');
    if (!data.fatherHusbandName) errs.push('Father/Husband Name is required.');
    if (!data.mobile) errs.push('Applicant Mobile is required.');
    if (!data.guarantorName) errs.push('Guarantor Name is required.');
    if (!data.guarantorMobile) errs.push('Guarantor Mobile is required.');
  }
  if (section === 2) {
    if (!data.aadhaarNo) errs.push('Applicant Aadhaar No. is required.');
    if (!data.panNo) errs.push('Applicant PAN No. is required.');
  }
  if (section === 3) {
    if (!data.loanAmount) errs.push('Loan Amount is required.');
    if (!data.tenure) errs.push('Tenure is required.');
    if (!data.interestRate) errs.push('Interest Rate is required.');
  }
  if (section === 4) {
    if (!data.communicationAddress) errs.push('Communication Address is required.');
    if (!data.communicationCity) errs.push('City is required.');
  }
  if (section === 5) {
    if (!data.bankName) errs.push('Bank Name is required.');
    if (!data.accountNo) errs.push('Account Number is required.');
    if (!data.ifscCode) errs.push('IFSC Code is required.');
  }
  if (section === 7) {
    if (!photos.applicantPhoto) errs.push('Applicant Photo is required.');
    if (!photos.aadhaarFront) errs.push('Aadhaar Front is required.');
  }
  return errs;
}

export default function MonthlyLoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'PERSONAL';
  const prefix = type === 'PERSONAL' ? 'PL' : 'BL';

  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<MonthlyLoanFormData>(() => ({
    ...emptyMonthlyLoanData(),
    loanType: type,
    frequency: 'MONTHLY',
    applicationFormNo: generateFormNo(prefix),
  }));
  const [photos, setPhotos] = useState<MonthlyLoanPhotos>(emptyMonthlyPhotos());
  const [errors, setErrors] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string } | null>(null);

  const updateFormData = useCallback((updates: Partial<MonthlyLoanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = () => {
    const sectionErrors = validateSection(currentSection, formData, photos);
    if (sectionErrors.length > 0) {
      setErrors(sectionErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setCompletedSections(prev => [...new Set([...prev, currentSection])]);
    if (currentSection < TOTAL) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowReview(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors([]);
    if (showReview) {
      setShowReview(false);
    } else if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpTo = (id: number) => {
    if (completedSections.includes(id - 1) || id === 1 || completedSections.includes(id)) {
      setErrors([]);
      setShowReview(false);
      setCurrentSection(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFormData({ ...emptyMonthlyLoanData(), loanType: type, frequency: 'MONTHLY', applicationFormNo: generateFormNo(prefix) });
    setPhotos(emptyMonthlyPhotos());
    setCurrentSection(1);
    setCompletedSections([]);
    setShowReview(false);
    setPdfPreview(null);
    setErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFillDemoData = () => {
    setFormData(prev => ({
      ...prev,
      ...sampleMonthlyData,
      applicationFormNo: prev.applicationFormNo,
      loanType: type, // preserve current loan type
    }));

    const createDummyFile = (name: string, type = "image/jpeg") => new File(["dummy"], name, { type });

    setPhotos({
      applicantPhoto: createDummyFile("applicant.jpg"),
      coApplicantPhoto: createDummyFile("co_applicant.jpg"),
      guarantorPhoto: createDummyFile("guarantor.jpg"),
      aadhaarFront: createDummyFile("aadhaar_front.jpg"),
      aadhaarBack: createDummyFile("aadhaar_back.jpg"),
      panCard: createDummyFile("pan.jpg"),
      incomeProof: createDummyFile("income_proof.pdf", "application/pdf"),
      businessProof: createDummyFile("business_proof.pdf", "application/pdf"),
    });

    setCompletedSections([1, 2, 3, 4, 5, 6, 7]);
    toast.success('Demo data filled successfully!');
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Submitting application...');
    try {
      // 1. Create Customer
      const custRes = await customersApi.create({
        name: formData.applicantName,
        phone: formData.mobile,
        email: formData.email,
        address: formData.communicationAddress + (formData.communicationCity ? `, ${formData.communicationCity}` : ''),
        aadhaar: formData.aadhaarNo,
        pan: formData.panNo,
        dateOfBirth: formData.dob || null,
        occupation: formData.loanType === 'PERSONAL' ? formData.designation : formData.businessType,
      });
      const customerId = custRes.data.customer.id;

      // 2. Create Loan
      const loanRes = await loansApi.create({
        customerId,
        loanType: formData.loanType,
        amount: parseFloat(formData.loanAmount),
        tenure: parseInt(formData.tenure),
        interestRate: parseFloat(formData.interestRate) || 0,
        emi: parseFloat(formData.emi) || 0,
        frequency: 'MONTHLY',
        purpose: formData.purpose,
        guarantorName: formData.guarantorName,
        guarantorPhone: formData.guarantorMobile,
        fullData: JSON.stringify(formData),
      });
      const loanId = loanRes.data.loan.id;

      // 3. Generate PDF (professional format)
      const { generateMonthlyLoanPDF } = await import('@/lib/generateMonthlyLoanPDF');
      const { blob, url, fileName } = await generateMonthlyLoanPDF(formData as any, photos as any);

      // 4. Upload PDF
      if (loanId) {
        try {
          await loansApi.uploadPdf(loanId, blob);
        } catch (uploadErr) {
          console.error('PDF upload failed:', uploadErr);
        }
      }

      // 5. Generate ZIP with all documents
      try {
        const JSZip = (await import('jszip')).default;
        const { saveAs } = await import('file-saver');
        const zip = new JSZip();
        zip.file(fileName, blob);
        const safeName = (formData.applicantName || 'Applicant').replace(/[^a-z0-9]/gi, '_');
        const folderName = `Application_${formData.applicationFormNo}_${safeName}`;
        const docsFolder = zip.folder(folderName);
        if (docsFolder) {
          Object.entries(photos).forEach(([key, file]) => {
            if (file instanceof File) docsFolder.file(`${key}_${file.name}`, file);
          });
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${folderName}.zip`);
      } catch (zipErr) {
        console.error('ZIP generation failed:', zipErr);
      }

      toast.success('Application submitted successfully!', { id: toastId });
      setSubmitting(false);
      setPdfPreview({ url, fileName });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      toast.error(`Submission failed: ${msg}`, { id: toastId });
      setSubmitting(false);
    }
  };

  const sectionProps = { formData, updateFormData, errors };
  const loanIcon = type === 'PERSONAL' ? 'person' : 'storefront';
  const loanColor = type === 'PERSONAL' ? 'text-blue-600' : 'text-emerald-600';

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/employee/loan-form')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Loan Types
          </button>
          <div className="h-5 w-px bg-outline-variant hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className={`material-symbols-outlined text-base ${loanColor}`}>{loanIcon}</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-[var(--font-headline)] tracking-tight text-on-surface leading-none uppercase">
                Monthly {type === 'PERSONAL' ? 'Personal' : 'Business'} Loan Application
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Form No: <span className="font-bold text-accent">{formData.applicationFormNo}</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleFillDemoData}
          className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-xl font-bold text-sm transition-all"
        >
          <span className="material-symbols-outlined text-lg">magic_button</span>
          Fill Demo Data
        </button>
      </div>

      {/* Progress Stepper */}
      {!showReview && !pdfPreview && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max gap-0">
            {SECTIONS.map((section, idx) => {
              const isCompleted = completedSections.includes(section.id);
              const isActive = currentSection === section.id;
              const isClickable = isCompleted || section.id === 1 || completedSections.includes(section.id - 1);
              return (
                <div key={section.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && handleJumpTo(section.id)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${isClickable ? 'cursor-pointer hover:bg-surface-container' : 'cursor-not-allowed opacity-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isCompleted ? 'bg-accent text-white shadow-md shadow-accent/20'
                        : isActive ? 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-2'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {isCompleted
                        ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        : section.id
                      }
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isActive ? 'text-primary' : isCompleted ? 'text-accent' : 'text-on-surface-variant'
                    }`}>{section.label}</span>
                  </button>
                  {idx < SECTIONS.length - 1 && (
                    <div className={`h-0.5 w-6 mx-1 rounded-full transition-all ${completedSections.includes(section.id) ? 'bg-accent' : 'bg-outline-variant/40'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errors.length > 0 && !showReview && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-4 mb-6">
          <div className="flex gap-3 items-start">
            <span className="material-symbols-outlined text-error text-xl mt-0.5">error</span>
            <div>
              <p className="text-sm font-bold text-error mb-1">Please fix the following to continue:</p>
              <ul className="space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="text-xs text-error/80 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-error/60 inline-block" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden min-h-[500px]">
        {pdfPreview ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface tracking-tight">Application Submitted Successfully</h3>
              <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
                The {type === 'PERSONAL' ? 'Personal' : 'Business'} Loan application has been recorded and sent for admin review.
              </p>
            </div>
            <div className="w-full max-w-4xl h-[600px] border border-outline-variant/20 rounded-2xl overflow-hidden mb-8 bg-surface-container shadow-inner">
              <iframe src={`${pdfPreview.url}#view=FitH`} className="w-full h-full" title="Application PDF Preview" />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => { const l = document.createElement('a'); l.href = pdfPreview.url; l.download = pdfPreview.fileName; l.click(); }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download PDF
              </button>
              <button
                onClick={() => router.push('/employee/submissions')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">list_alt</span>
                View Submissions
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20"
              >
                New Application
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        ) : showReview ? (
          /* ── Review Screen ── */
          <div className="p-8 lg:p-12 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-2xl">preview</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Review & Submit</p>
                <h3 className="text-xl font-black text-on-surface">Application Summary</h3>
              </div>
            </div>

            {/* Summary Cards */}
            {[
              { title: 'Primary Details', icon: 'person', id: 1, rows: [
                ['Applicant', formData.applicantName || '—'],
                ['Father/Husband', formData.fatherHusbandName || '—'],
                ['Mobile', formData.mobile || '—'],
                ['Email', formData.email || '—'],
                ['Guarantor', formData.guarantorName || '—'],
                ['Guarantor Mobile', formData.guarantorMobile || '—'],
              ]},
              { title: 'KYC Details', icon: 'verified_user', id: 2, rows: [
                ['Aadhaar', formData.aadhaarNo || '—'],
                ['PAN', formData.panNo || '—'],
                ['Co-App Aadhaar', formData.coApplicantAadhaarNo || '—'],
                ['Guarantor Aadhaar', formData.guarantorAadhaarNo || '—'],
              ]},
              { title: 'Loan Details', icon: 'payments', id: 3, rows: [
                ['Loan Type', `${formData.loanType} (Monthly)`],
                ['Amount', formData.loanAmount ? `₹${parseFloat(formData.loanAmount).toLocaleString('en-IN')}` : '—'],
                ['Tenure', formData.tenure ? `${formData.tenure} Months` : '—'],
                ['Interest Rate', formData.interestRate ? `${formData.interestRate}%` : '—'],
                ['Monthly EMI', formData.emi ? `₹${parseFloat(formData.emi).toLocaleString('en-IN')}` : '—'],
              ]},
              { title: 'Address', icon: 'location_on', id: 4, rows: [
                ['Communication', [formData.communicationAddress, formData.communicationCity, formData.communicationState, formData.communicationPinCode].filter(Boolean).join(', ') || '—'],
                ['Permanent', formData.permanentSameAsCommunication ? 'Same as Communication' : [formData.permanentAddress, formData.permanentCity].filter(Boolean).join(', ') || '—'],
              ]},
              { title: 'Bank Details', icon: 'account_balance', id: 5, rows: [
                ['Bank', formData.bankName || '—'],
                ['Account No.', formData.accountNo || '—'],
                ['IFSC', formData.ifscCode || '—'],
                ['Account Type', formData.accountType || '—'],
              ]},
            ].map(({ title, icon, id, rows }) => (
              <div key={id} className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent">{icon}</span>
                    <h4 className="text-sm font-black text-tertiary uppercase tracking-wider">{title}</h4>
                  </div>
                  <button
                    onClick={() => handleJumpTo(id)}
                    className="flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Edit
                  </button>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {rows.map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-on-surface break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-gradient-to-r from-accent to-on-primary-container text-white font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 active:scale-95 ml-auto"
              >
                <span className="material-symbols-outlined text-lg">{submitting ? 'progress_activity' : 'verified'}</span>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Section Header */}
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-2xl">{SECTIONS[currentSection - 1].icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Section {currentSection} of {TOTAL}
                  </p>
                  <h3 className="text-xl font-black text-on-surface font-[var(--font-headline)] tracking-tight">
                    {SECTIONS[currentSection - 1].label}
                  </h3>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Progress</p>
                  <p className="text-xs font-bold text-accent">{Math.round((currentSection / TOTAL) * 100)}% Complete</p>
                </div>
                <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-500" style={{ width: `${(currentSection / TOTAL) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Section Body */}
            <div className="flex-1 p-8 lg:p-12">
              {currentSection === 1 && <Section1PrimaryDetails {...sectionProps} />}
              {currentSection === 2 && <Section2KycVerification {...sectionProps} />}
              {currentSection === 3 && <Section3LoanDetails {...sectionProps} />}
              {currentSection === 4 && <Section4AddressContact {...sectionProps} />}
              {currentSection === 5 && <Section5BankDetails {...sectionProps} />}
              {currentSection === 6 && <Section6EmploymentBusiness {...sectionProps} />}
              {currentSection === 7 && <Section7Documents photos={photos} setPhotos={setPhotos} errors={errors} />}
            </div>

            {/* Navigation Footer */}
            <div className="px-8 py-6 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container/10">
              <button
                onClick={handleBack}
                disabled={currentSection === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-medium hidden sm:block">
                  {currentSection} / {TOTAL} sections
                </span>
                <div className="h-1.5 w-24 bg-surface-container rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentSection / TOTAL) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                {currentSection === TOTAL ? 'Review Application' : 'Verify & Continue'}
                <span className="material-symbols-outlined text-lg">
                  {currentSection === TOTAL ? 'preview' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
