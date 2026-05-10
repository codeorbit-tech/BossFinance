'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HomeLoanFormData,
  HomePhotoUploads,
  emptyPersonal,
  emptyContact,
  emptyResidence,
  emptyBank,
  emptyEmployment,
  emptyHomeProperty,
  emptyKycDoc,
  emptyLoanDetails,
} from './types';
import Section1PartyDetails from './Section1ApplicantDetails';
import Section2KycVerification from './Section2KycVerification';
import Section3LoanDetails from './Section2LoanDetails'; 
import Section4AddressContact from './Section4AddressContact';
import Section5ResidenceInfo from './Section5ResidenceInfo';
import Section6BankDetails from './Section6BankDetails';
import Section7EmploymentDetails from './Section7EmploymentDetails';
import Section8PropertyDetails from './Section8PropertyDetails';
import Section9PropertyPhotos from './Section9PropertyPhotos';
import Section10DocumentChecklist from './Section10DocumentChecklist';
import ReviewScreen from './ReviewScreen';
import { customersApi, loansApi } from '@/lib/api';
import { sampleHomeData } from './sampleData';

const SECTIONS = [
  { id: 1, label: 'Party Details', icon: 'person' },
  { id: 2, label: 'KYC Verification', icon: 'verified_user' },
  { id: 3, label: 'Loan Details', icon: 'payments' },
  { id: 4, label: 'Address & Contact', icon: 'location_on' },
  { id: 5, label: 'Residence Info', icon: 'home' },
  { id: 6, label: 'Bank Details', icon: 'account_balance' },
  { id: 7, label: 'Employment', icon: 'work' },
  { id: 8, label: 'Property Details', icon: 'real_estate_agent' },
  { id: 9, label: 'Photos & Gallery', icon: 'photo_camera' },
  { id: 10, label: 'Documents', icon: 'checklist' },
];

function generateFormNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HL-${dateStr}-${rand}`;
}

const initialFormData = (): HomeLoanFormData => ({
  applicationFormNo: generateFormNo(),
  applicationDate: new Date().toISOString().slice(0, 10),
  applicantEntityType: '',
  coApplicantEntityType: '',
  guarantorEntityType: '',
  udyamRegNo: '',
  applicantGstin: '',
  applicantOwnedHouse: false,
  coApplicantGstin: '',
  coApplicantOwnedHouse: false,
  guarantorGstin: '',
  guarantorOwnedHouse: false,

  loanDetails: emptyLoanDetails(),
  applicantPersonal: emptyPersonal(),
  coApplicantPersonal: emptyPersonal(),
  guarantorPersonal: emptyPersonal(),
  applicantContact: emptyContact(),
  coApplicantContact: emptyContact(),
  guarantorContact: emptyContact(),
  applicantResidence: emptyResidence(),
  coApplicantResidence: emptyResidence(),
  guarantorResidence: emptyResidence(),
  applicantBank: emptyBank(),
  coApplicantBank: emptyBank(),
  applicantEmployment: emptyEmployment(),
  coApplicantEmployment: emptyEmployment(),
  movablePropertyDescription: '',
  movablePropertyValue: '',
  propertyDetails: emptyHomeProperty(),

  kycDocuments: {
    aadhaarCard: emptyKycDoc(),
    panCard: emptyKycDoc(),
    passport: emptyKycDoc(),
    drivingLicence: emptyKycDoc(),
    gasConnection: emptyKycDoc(),
    waterBill: emptyKycDoc(),
    electricityBill: emptyKycDoc(),
    mobilePostpaidBill: emptyKycDoc(),
    voterIdCard: emptyKycDoc(),
    rationCard: emptyKycDoc(),
  },
  preSanctionDocs: {
    saleAgreement: false, parentDocuments: false, encumbranceCertificate: false,
    pattaChitta: false, approvalPlan: false, nocBuilder: false,
    bankStatement: false, itr: false, othersText: '',
  },
  postDisbursementDocs: {
    saleDeedOriginal: false, modDeposit: false,
    insurancePolicy: false, othersText: '',
  },
});

const initialPhotos = (): HomePhotoUploads => ({
  applicantPhoto: null,
  coApplicantPhoto: null,
  guarantorPhoto: null,
  frontElevation: null,
  interiorView: null,
  sideSiteView: null,
  layoutPlan: null,
  gasBill: null,
  ebBill: null,
  rationCard: null,
  voterId: null,
  others: [null, null, null, null, null],
  uploadedDocuments: [],
});

function validateSection(section: number, data: HomeLoanFormData, photos: HomePhotoUploads): string[] {
  const errors: string[] = [];
  if (section === 1) {
    if (!data.applicantPersonal.fullName) errors.push('Applicant Name is required.');
    if (!data.applicantPersonal.fatherName) errors.push('Husband/Father Name is required.');
    if (!data.applicantPersonal.mobile) errors.push('Applicant Phone Number is required.');
    
    if (data.coApplicantOwnedHouse && !data.coApplicantPersonal.fullName) {
      errors.push('Co-Applicant Name is required as they own the qualifying house.');
    }
    if (data.guarantorOwnedHouse && !data.guarantorPersonal.fullName) {
      errors.push('Guarantor Name is required as they own the qualifying house.');
    }

    const someoneOwnsHouse = data.applicantOwnedHouse || data.coApplicantOwnedHouse || data.guarantorOwnedHouse;
    if (!someoneOwnsHouse) {
      errors.push('At least one member (Applicant, Co-Applicant, or Guarantor) must have an Owned House to proceed.');
    }
  }
  if (section === 2) {
    if (!data.kycDocuments.aadhaarCard.applicantDocNo) errors.push('Applicant Aadhaar No. is required.');
    if (!data.kycDocuments.panCard.applicantDocNo) errors.push('Applicant PAN No. is required.');
  }
  if (section === 3) {
    if (!data.loanDetails.loanAmount) errors.push('Loan Amount is required.');
    if (!data.loanDetails.tenure) errors.push('Tenure is required.');
    if (!data.loanDetails.interestRate) errors.push('Interest Rate is required.');
  }
  if (section === 4) {
    if (!data.applicantContact.communicationAddress.fullAddress) errors.push('Applicant Communication Address is required.');
  }
  if (section === 6) {
    if (!data.applicantBank.bankName) errors.push('Bank Name is required.');
    if (!data.applicantBank.accountNo) errors.push('Account Number is required.');
    if (!data.applicantBank.ifscCode) errors.push('IFSC Code is required.');
  }
  if (section === 7) {
    if (!data.applicantEmployment.designation) errors.push('Applicant Designation is required.');
  }
  if (section === 8) {
    if (!data.propertyDetails.locality) errors.push('Locality is required.');
    if (!data.propertyDetails.marketValue) errors.push('Market Value is required.');
  }
  if (section === 9) {
    if (!photos.applicantPhoto) errors.push('Applicant Photo is required.');
    if (!photos.frontElevation) errors.push('Front Elevation photo is required.');
  }
  return errors;
}

export default function HomeLoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<HomeLoanFormData>(initialFormData);
  const [photos, setPhotos] = useState<HomePhotoUploads>(initialPhotos);
  const [errors, setErrors] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string } | null>(null);

  const updateFormData = useCallback((updates: Partial<HomeLoanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleVerifyAndContinue = () => {
    const sectionErrors = validateSection(currentSection, formData, photos);
    if (sectionErrors.length > 0) {
      setErrors(sectionErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setCompletedSections(prev => prev.includes(currentSection) ? prev : [...prev, currentSection]);
    if (currentSection < 10) {
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

  const handleReset = () => {
    setFormData(initialFormData());
    setPhotos(initialPhotos());
    setCurrentSection(1);
    setCompletedSections([]);
    setShowReview(false);
    setPdfPreview(null);
    setErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Submitting home loan application...');
    try {
      const fullName = formData.applicantPersonal.fullName;
      const guarantorName = formData.guarantorPersonal.fullName;

      // 1. Create/Update Customer
      const custRes = await customersApi.create({
        name: fullName || 'Unknown Customer',
        phone: formData.applicantPersonal.mobile,
        email: formData.applicantContact.email,
        address: formData.applicantContact.communicationAddress.fullAddress,
        aadhaar: formData.kycDocuments.aadhaarCard.applicantDocNo,
        pan: formData.kycDocuments.panCard.applicantDocNo,
        dateOfBirth: formData.applicantPersonal.dob || null,
        occupation: formData.applicantEmployment.designation,
      });

      const customerId = custRes.data.customer.id;

      // 2. Create Loan
      const loanRes = await loansApi.create({
        customerId,
        loanType: 'HOME',
        amount: parseFloat(formData.loanDetails.loanAmount) || 0,
        tenure: parseInt(formData.loanDetails.tenure) || 12,
        interestRate: parseFloat(formData.loanDetails.interestRate) || 0,
        emi: parseFloat(formData.loanDetails.emi) || 0,
        frequency: 'MONTHLY',
        purpose: 'Home Purchase/Construction/Renovation',
        guarantorName,
        guarantorPhone: formData.guarantorPersonal.mobile,
        collateralDetails: `${formData.propertyDetails.propertyType} at ${formData.propertyDetails.locality}`,
        fullData: JSON.stringify(formData)
      });
      const loanId = loanRes.data.loan.id;

      // 3. Generate PDF
      const { generateHomeLoanPDF } = await import('@/lib/generateHomeLoanPDF');
      const { blob, url, fileName } = await generateHomeLoanPDF(formData, photos);
      
      // 4. Upload PDF to server
      if (loanId) {
        try {
          await loansApi.uploadPdf(loanId, blob);
        } catch (uploadErr) {
          console.error('PDF upload failed:', uploadErr);
          toast.error('Application saved but PDF upload failed.', { id: toastId });
        }
      }

      // 5. Generate ZIP folder with PDF and all uploaded documents
      try {
        const JSZip = (await import('jszip')).default;
        const { saveAs } = await import('file-saver');
        const zip = new JSZip();
        
        // Add PDF
        zip.file(fileName, blob);
        
        // Add all photos/documents
        const safeName = (fullName || 'Applicant').replace(/[^a-z0-9]/gi, '_');
        const folderName = `Application_${formData.applicationFormNo}_${safeName}`;
        const docsFolder = zip.folder(folderName);
        
        if (docsFolder) {
          Object.entries(photos).forEach(([key, value]) => {
            if (value instanceof File) {
              docsFolder.file(`${key}_${value.name}`, value);
            } else if (key === 'uploadedDocuments' && Array.isArray(value)) {
              value.forEach((file, idx) => {
                if (file instanceof File) {
                  docsFolder.file(`doc_${idx}_${file.name}`, file);
                }
              });
            }
          });
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${folderName}.zip`);
      } catch (zipErr) {
        console.error('ZIP generation failed:', zipErr);
        toast.error('Application saved, but ZIP download failed.', { id: toastId });
      }

      toast.success('Home Loan application submitted successfully!', { id: toastId });
      setSubmitting(false);
      setPdfPreview({ url, fileName });
    } catch (err: any) {
      console.error('Submission or PDF generation failed:', err);
      const errMsg = err.response?.data?.error || err.message || 'Unknown error occurred';
      toast.error(`Submission failed: ${errMsg}`, { id: toastId });
      setSubmitting(false);
    }
  };

  const handleFillDemoData = () => {
    // 1. Fill Form Data
    setFormData(prev => ({
      ...prev,
      ...sampleHomeData,
      applicationFormNo: prev.applicationFormNo // keep generated ID
    }));

    // 2. Create and set dummy files for photos
    const createDummyFile = (name: string, type = "image/jpeg") => 
      new File(["dummy content"], name, { type });

    const dummyPhotos: HomePhotoUploads = {
      applicantPhoto: createDummyFile("applicant.jpg"),
      coApplicantPhoto: createDummyFile("co_applicant.jpg"),
      guarantorPhoto: createDummyFile("guarantor.jpg"),
      frontElevation: createDummyFile("front_elevation.jpg"),
      interiorView: createDummyFile("interior.jpg"),
      sideSiteView: createDummyFile("side_site.jpg"),
      layoutPlan: createDummyFile("layout_plan.jpg"),
      gasBill: createDummyFile("gas_bill.jpg"),
      ebBill: createDummyFile("eb_bill.jpg"),
      rationCard: createDummyFile("ration_card.jpg"),
      voterId: createDummyFile("voter_id.jpg"),
      others: [
        createDummyFile("other1.jpg"), 
        null, null, null, null
      ],
      uploadedDocuments: [
        createDummyFile("sale_agreement.pdf", "application/pdf"),
        createDummyFile("bank_statement.pdf", "application/pdf"),
        createDummyFile("property_tax.pdf", "application/pdf"),
      ],
    };

    setPhotos(dummyPhotos);

    // 3. Mark all sections as completed
    setCompletedSections([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    
    toast.success('Home Loan demo data filled! All sections ready.');
  };

  const sectionProps = { formData, updateFormData, errors };

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
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-base">home</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-[var(--font-headline)] tracking-tight text-on-surface leading-none">
                Home Loan Application
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
                        ? 'bg-tertiary text-white shadow-md shadow-tertiary/30 ring-2 ring-tertiary ring-offset-2'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {isCompleted
                        ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> 
                        : section.id
                      }
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isActive ? 'text-tertiary' : isCompleted ? 'text-accent' : 'text-on-surface-variant'
                    }`}>
                      {section.label}
                    </span>
                  </button>
                  {idx < SECTIONS.length - 1 && (
                    <div className={`h-0.5 w-6 mx-1 rounded-full transition-all ${
                      completedSections.includes(section.id) ? 'bg-accent' : 'bg-outline-variant/40'
                    }`} />
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

      {/* Section Content */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden min-h-[500px]">
        {pdfPreview ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface tracking-tight">Application Submitted Successfully</h3>
              <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
                The home loan application has been recorded and the PDF has been sent to the admin for review.
              </p>
            </div>
            
            <div className="w-full max-w-4xl h-[600px] border border-outline-variant/20 rounded-2xl overflow-hidden mb-8 bg-surface-container shadow-inner">
              <iframe
                src={`${pdfPreview.url}#view=FitH`}
                className="w-full h-full"
                title="Application PDF Preview"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfPreview.url;
                  link.download = pdfPreview.fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
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
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-tertiary to-tertiary-container text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-tertiary/20"
              >
                Submit New
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        ) : showReview ? (
          <div className="p-8 lg:p-12">
            <ReviewScreen
              formData={formData}
              photos={photos}
              onEdit={(section) => handleJumpTo(section)}
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
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-2xl">{SECTIONS[currentSection - 1].icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Section {currentSection} of 10
                  </p>
                  <h3 className="text-xl font-black text-on-surface font-[var(--font-headline)] tracking-tight">
                    {SECTIONS[currentSection - 1].label}
                  </h3>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Progress</p>
                  <p className="text-xs font-bold text-tertiary">{currentSection * 10}% Complete</p>
                </div>
                <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-tertiary transition-all duration-500" 
                    style={{ width: `${currentSection * 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Section Body */}
            <div className="flex-1 p-8 lg:p-12">
              {currentSection === 1 && <Section1PartyDetails {...sectionProps} />}
              {currentSection === 2 && (
                <Section2KycVerification {...sectionProps} photos={photos} setPhotos={setPhotos} />
              )}
              {currentSection === 3 && <Section3LoanDetails {...sectionProps} />}
              {currentSection === 4 && <Section4AddressContact {...sectionProps} />}
              {currentSection === 5 && <Section5ResidenceInfo {...sectionProps} />}
              {currentSection === 6 && <Section6BankDetails {...sectionProps} />}
              {currentSection === 7 && <Section7EmploymentDetails {...sectionProps} />}
              {currentSection === 8 && <Section8PropertyDetails {...sectionProps} />}
              {currentSection === 9 && (
                <Section9PropertyPhotos photos={photos} setPhotos={setPhotos} />
              )}
              {currentSection === 10 && <Section10DocumentChecklist {...sectionProps} photos={photos} setPhotos={setPhotos} />}
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
                <button
                  onClick={handleVerifyAndContinue}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-tertiary text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-tertiary/20"
                >
                  {currentSection === 10 ? 'Review Application' : 'Next Section'}
                  <span className="material-symbols-outlined text-lg">
                    {currentSection === 10 ? 'visibility' : 'arrow_forward'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
