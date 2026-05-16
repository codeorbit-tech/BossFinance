'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  SimpleLoanFormData,
  SimplePhotoUploads,
  emptySimpleLoanData,
  emptySimplePhotos,
} from './types';
import Section1ApplicantBusiness from './Section1ApplicantBusiness';
import Section2LoanBank from './Section2LoanBank';
import Section3Documents from './Section3Documents';
import SimpleReviewScreen from './ReviewScreen';
import { customersApi, loansApi } from '@/lib/api';

const SECTIONS = [
  { id: 1, label: 'Applicant & Business', icon: 'person' },
  { id: 2, label: 'Loan & Bank Details', icon: 'payments' },
  { id: 3, label: 'Documents & Photos', icon: 'photo_camera' },
];

function generateFormNo(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${rand}`;
}

export default function SimpleLoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'SHOP';
  const freq = (searchParams.get('freq') || 'DAILY') as 'DAILY' | 'WEEKLY' | 'MONTHLY';
  
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<SimpleLoanFormData>(() => ({
    ...emptySimpleLoanData(),
    loanType: type,
    frequency: freq,
    applicationFormNo: generateFormNo(freq === 'DAILY' ? 'DL' : freq === 'WEEKLY' ? 'WL' : 'ML'),
  }));
  const [photos, setPhotos] = useState<SimplePhotoUploads>(emptySimplePhotos());
  const [errors, setErrors] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string } | null>(null);

  const updateFormData = useCallback((updates: Partial<SimpleLoanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const validateCurrentSection = () => {
    const errs: string[] = [];
    if (currentSection === 1) {
      if (!formData.applicantName) errs.push('Applicant Name is required.');
      if (!formData.mobile) errs.push('Mobile Number is required.');
      if (!formData.aadhaarNo) errs.push('Aadhaar Number is required.');
      if (!formData.shopName) errs.push('Shop Name is required.');
    }
    if (currentSection === 2) {
      if (!formData.loanAmount) errs.push('Loan Amount is required.');
      if (!formData.tenure) errs.push('Tenure is required.');
    }
    if (currentSection === 3) {
      if (!photos.applicantPhoto) errs.push('Applicant Photo is required.');
      if (!photos.aadhaarFront) errs.push('Aadhaar Front is required.');
      
      if (!photos.houseFrontView) errs.push('House Front View photo is required.');
      if (!photos.houseBackView) errs.push('House Back View photo is required.');
      if (!photos.houseLeftView) errs.push('House Left Side View photo is required.');
      if (!photos.houseRightView) errs.push('House Right Side View photo is required.');
    }
    return errs;
  };

  const handleNext = () => {
    const sectionErrors = validateCurrentSection();
    if (sectionErrors.length > 0) {
      setErrors(sectionErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setCompletedSections(prev => [...new Set([...prev, currentSection])]);
    if (currentSection < 3) {
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

  const handleJumpTo = (sectionId: number) => {
    if (completedSections.includes(sectionId - 1) || sectionId === 1 || completedSections.includes(sectionId)) {
      setErrors([]);
      setShowReview(false);
      setCurrentSection(sectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Submitting application...');
    try {
      // 1. Create Customer
      const custRes = await customersApi.create({
        name: formData.applicantName,
        phone: formData.mobile,
        address: formData.address || formData.shopAddress,
        aadhaar: formData.aadhaarNo,
        pan: formData.panNo,
        dateOfBirth: formData.dob || null,
        occupation: formData.businessType,
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
        frequency: formData.frequency,
        purpose: `${formData.loanType} for ${formData.shopName}`,
        guarantorName: formData.guarantorName,
        guarantorPhone: formData.guarantorMobile,
        fullData: JSON.stringify(formData)
      });
      const loanId = loanRes.data.loan.id;

      // 3. Generate PDF — always use the professional format
      const { generateMonthlyLoanPDF } = await import('@/lib/generateMonthlyLoanPDF');
      const { blob, url, fileName } = await generateMonthlyLoanPDF(formData, photos);
      
      // 4. Upload PDF
      if (loanId) {
        try {
          await loansApi.uploadPdf(loanId, blob);
        } catch (uploadErr) {
          console.error('PDF upload failed:', uploadErr);
        }
      }

      // 5. Generate ZIP folder with PDF and all uploaded documents
      try {
        const JSZip = (await import('jszip')).default;
        const { saveAs } = await import('file-saver');
        const zip = new JSZip();
        
        // Add PDF
        zip.file(fileName, blob);
        
        // Add all photos
        const safeName = (formData.applicantName || 'Applicant').replace(/[^a-z0-9]/gi, '_');
        const folderName = `Application_${formData.applicationFormNo}_${safeName}`;
        const docsFolder = zip.folder(folderName);
        
        if (docsFolder) {
          Object.entries(photos).forEach(([key, value]) => {
            if (value instanceof File) {
              docsFolder.file(`${key}_${value.name}`, value);
            }
          });
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${folderName}.zip`);
      } catch (zipErr) {
        console.error('ZIP generation failed:', zipErr);
        toast.error('Application saved, but ZIP download failed.', { id: toastId });
      }

      toast.success('Application submitted successfully!', { id: toastId });
      setPdfPreview({ url, fileName });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemoData = () => {
    const createDummyFile = (name: string, mime = 'image/jpeg') =>
      new File(['dummy'], name, { type: mime });

    setFormData((prev) => ({
      ...prev,
      applicationDate: new Date().toISOString().slice(0, 10),
      applicantName: 'Ravi Kumar',
      fatherHusbandName: 'Suresh Kumar',
      dob: '1992-06-14',
      gender: 'Male',
      mobile: '9876543210',
      aadhaarNo: '123456789012',
      panNo: 'ABCDE1234F',
      address: '12 Market Lane, Salem',
      coApplicantName: 'Priya Ravi',
      coApplicantFatherHusbandName: 'Ravi Kumar',
      coApplicantDob: '1994-02-08',
      coApplicantGender: 'Female',
      coApplicantMobile: '9876501234',
      coApplicantAadhaarNo: '234567890123',
      coApplicantPanNo: 'BCDEA2345G',
      coApplicantAddress: '12 Market Lane, Salem',
      coApplicantRelation: 'Spouse',
      coApplicantBankName: 'State Bank of India',
      coApplicantAccountNo: '12345678901',
      coApplicantIfscCode: 'SBIN0000123',
      shopName: prev.frequency === 'DAILY' ? 'Ravi Tea Stall' : 'Ravi Mini Mart',
      shopAddress: 'Main Road, Salem',
      businessType: prev.loanType || 'SHOP',
      yearsInBusiness: '4',
      loanAmount: prev.frequency === 'DAILY' ? '30000' : '60000',
      tenure: prev.frequency === 'DAILY' ? '60' : '24',
      interestRate: '10',
      emi: prev.frequency === 'DAILY' ? '550' : '2750',
      bankName: 'Indian Bank',
      accountNo: '98765432109',
      ifscCode: 'IDIB000S123',
      guarantorName: 'Manoj Kumar',
      guarantorFatherHusbandName: 'Ramesh Kumar',
      guarantorDob: '1988-11-22',
      guarantorGender: 'Male',
      guarantorMobile: '9123456780',
      guarantorRelation: 'Friend',
      guarantorAadhaarNo: '345678901234',
      guarantorPanNo: 'CDEAB3456H',
      guarantorAddress: '45 Lake View, Salem',
    }));

    setPhotos({
      applicantPhoto: createDummyFile('applicant.jpg'),
      coApplicantPhoto: createDummyFile('co_applicant.jpg'),
      houseFrontView: createDummyFile('house_front.jpg'),
      houseBackView: createDummyFile('house_back.jpg'),
      houseLeftView: createDummyFile('house_left.jpg'),
      houseRightView: createDummyFile('house_right.jpg'),
      shopPhoto: createDummyFile('shop.jpg'),
      aadhaarFront: createDummyFile('aadhaar_front.jpg'),
      aadhaarBack: createDummyFile('aadhaar_back.jpg'),
      panCard: createDummyFile('pan.jpg'),
      guarantorPhoto: createDummyFile('guarantor.jpg'),
      guarantorAadhaarFront: createDummyFile('guarantor_aadhaar_front.jpg'),
      guarantorAadhaarBack: createDummyFile('guarantor_aadhaar_back.jpg'),
    });

    setCompletedSections([1, 2, 3]);
    setErrors([]);
    toast.success(`${formData.frequency} demo data filled.`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
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
              <span className="material-symbols-outlined text-accent text-base">
                {formData.frequency === 'DAILY' ? 'auto_schedule' : formData.frequency === 'WEEKLY' ? 'event_repeat' : 'calendar_month'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-[var(--font-headline)] tracking-tight text-on-surface leading-none uppercase">
                {formData.frequency} {formData.loanType} Loan
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
              const isActive = currentSection === section.id && !showReview;
              const isClickable = isCompleted || section.id === 1 || completedSections.includes(section.id - 1);
              return (
                <div key={section.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && handleJumpTo(section.id)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all group ${
                      isClickable ? 'cursor-pointer hover:bg-surface-container' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isCompleted
                        ? 'bg-accent text-white shadow-md shadow-accent/20'
                        : isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-2'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {isCompleted
                        ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> 
                        : section.id
                      }
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isActive ? 'text-primary' : isCompleted ? 'text-accent' : 'text-on-surface-variant'
                    }`}>
                      {section.label}
                    </span>
                  </button>
                  {idx < SECTIONS.length - 1 && (
                    <div className={`h-0.5 w-12 mx-1 rounded-full transition-all ${
                      completedSections.includes(section.id) ? 'bg-accent' : 'bg-outline-variant/40'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {pdfPreview ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface tracking-tight">Application Submitted Successfully</h3>
              <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
                The loan application and documents have been compressed into a ZIP folder for your download.
              </p>
            </div>
            
            <div className="w-full max-w-4xl h-[600px] border border-outline-variant/20 rounded-2xl overflow-hidden mb-8 bg-surface-container shadow-inner">
              <iframe src={`${pdfPreview.url}#view=FitH`} className="w-full h-full" title="Application PDF Preview" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfPreview.url;
                  link.download = pdfPreview.fileName;
                  link.click();
                }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download PDF Only
              </button>
              <button
                onClick={() => router.push('/employee/submissions')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">list_alt</span>
                View Submissions
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20"
              >
                New Application
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        ) : showReview ? (
          <div className="p-8 lg:p-12">
            <SimpleReviewScreen
              formData={formData}
              photos={photos}
              onEdit={(s) => { setShowReview(false); setCurrentSection(s); }}
              onSubmit={handleFinalSubmit}
              onBack={handleBack}
              submitting={submitting}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Section Header */}
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-2xl">{SECTIONS[currentSection - 1].icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Section {currentSection} of 3
                  </p>
                  <h3 className="text-xl font-black text-on-surface font-[var(--font-headline)] tracking-tight">
                    {SECTIONS[currentSection - 1].label}
                  </h3>
                </div>
              </div>
            </div>

            {/* Section Body */}
            <div className="flex-1 p-8 lg:p-12">
              {currentSection === 1 && <Section1ApplicantBusiness formData={formData} updateFormData={updateFormData} errors={errors} />}
              {currentSection === 2 && <Section2LoanBank formData={formData} updateFormData={updateFormData} errors={errors} />}
              {currentSection === 3 && <Section3Documents photos={photos} setPhotos={setPhotos} errors={errors} />}
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
              
              <div className="flex flex-col items-center gap-1">
                 {errors.length > 0 && (
                    <p className="text-[10px] font-bold text-error uppercase animate-pulse">{errors[0]}</p>
                 )}
                 <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${currentSection === i ? 'w-8 bg-accent' : 'w-2 bg-outline-variant/30'}`} />
                    ))}
                 </div>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 active:scale-95"
              >
                {currentSection === 3 ? 'Review Application' : 'Next Section'}
                <span className="material-symbols-outlined text-lg">
                  {currentSection === 3 ? 'visibility' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
