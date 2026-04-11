'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  VehicleLoanFormData,
  PhotoUploads,
  emptyPersonal,
  emptyContact,
  emptyResidence,
  emptyBank,
  emptyEmployment,
  emptyVehicleOwned,
  emptyImmovable,
  emptyKycDoc,
} from './types';
import Section1AppInfo from './Section1AppInfo';
import Section2PersonalDetails from './Section2PersonalDetails';
import Section3AddressContact from './Section3AddressContact';
import Section4ResidenceInfo from './Section4ResidenceInfo';
import Section5BankDetails from './Section5BankDetails';
import Section6EmploymentDetails from './Section6EmploymentDetails';
import Section7PropertyDetails from './Section7PropertyDetails';
import Section8VehiclePhotos from './Section8VehiclePhotos';
import Section9DocumentChecklist from './Section9DocumentChecklist';
import ReviewScreen from './ReviewScreen';

const SECTIONS = [
  { id: 1, label: 'Application Info', icon: 'assignment' },
  { id: 2, label: 'Personal Details', icon: 'person' },
  { id: 3, label: 'Address & Contact', icon: 'location_on' },
  { id: 4, label: 'Residence Info', icon: 'home' },
  { id: 5, label: 'Bank Details', icon: 'account_balance' },
  { id: 6, label: 'Employment', icon: 'work' },
  { id: 7, label: 'Property Details', icon: 'real_estate_agent' },
  { id: 8, label: 'Vehicle Photos', icon: 'photo_camera' },
  { id: 9, label: 'Documents', icon: 'checklist' },
];

function generateFormNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VL-${dateStr}-${rand}`;
}

const initialFormData = (): VehicleLoanFormData => ({
  applicationFormNo: generateFormNo(),
  applicationDate: new Date().toISOString().slice(0, 10),
  applicantEntityType: '',
  coApplicantEntityType: '',
  guarantorEntityType: '',
  udyamRegNo: '',
  applicantCkycId: '',
  applicantGstin: '',
  coApplicantCkycId: '',
  coApplicantGstin: '',
  guarantorCkycId: '',
  guarantorGstin: '',

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

  applicantVehiclesOwned: [emptyVehicleOwned(), emptyVehicleOwned(), emptyVehicleOwned()],
  coApplicantVehiclesOwned: [emptyVehicleOwned(), emptyVehicleOwned(), emptyVehicleOwned()],
  movablePropertyDescription: '',
  movablePropertyValue: '',
  immovableProperties: [emptyImmovable()],

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
  },
  preSanctionDocs: {
    proformaInvoice: false, saleDeedUsed: false, rcUsedAsset: false,
    insurance: false, bankStatement: false, itr: false,
    nonIndividualDoc: false, othersText: '',
  },
  postDisbursementDocs: {
    originalInvoiceNew: false, rcHypothecation: false,
    insuranceHypothecation: false, othersText: '',
  },
});

const initialPhotos = (): PhotoUploads => ({
  frontView: null,
  leftSideView: null,
  rightSideView: null,
  backView: null,
  others: [null, null, null, null, null],
});

// ─── Section validation ───
function validateSection(section: number, data: VehicleLoanFormData, photos: PhotoUploads): string[] {
  const errors: string[] = [];
  if (section === 1) {
    if (!data.applicationDate) errors.push('Application Date is required.');
    if (!data.applicantEntityType) errors.push('Applicant Entity Type is required.');
    if (!data.coApplicantEntityType) errors.push('Co-Applicant Entity Type is required.');
    if (!data.guarantorEntityType) errors.push('Guarantor Entity Type is required.');
  }
  if (section === 2) {
    if (!data.applicantPersonal.firstName) errors.push('Applicant First Name is required.');
    if (!data.applicantPersonal.gender) errors.push('Applicant Gender is required.');
    if (!data.applicantPersonal.dob) errors.push('Applicant Date of Birth is required.');
    if (!data.coApplicantPersonal.firstName) errors.push('Co-Applicant First Name is required.');
    if (!data.guarantorPersonal.firstName) errors.push('Guarantor First Name is required.');
  }
  if (section === 3) {
    if (!data.applicantContact.communicationAddress.fullAddress) errors.push('Applicant Communication Address is required.');
    if (!data.applicantContact.mobile) errors.push('Applicant Mobile No. is required.');
    if (!data.coApplicantContact.communicationAddress.fullAddress) errors.push('Co-Applicant Communication Address is required.');
    if (!data.coApplicantContact.mobile) errors.push('Co-Applicant Mobile No. is required.');
    if (!data.guarantorContact.communicationAddress.fullAddress) errors.push('Guarantor Communication Address is required.');
    if (!data.guarantorContact.mobile) errors.push('Guarantor Mobile No. is required.');
  }
  if (section === 4) {
    if (!data.applicantResidence.residence) errors.push('Applicant Residence type is required.');
    if (!data.applicantResidence.maritalStatus) errors.push('Applicant Marital Status is required.');
  }
  if (section === 5) {
    if (!data.applicantBank.bankName) errors.push('Applicant Bank Name is required.');
    if (!data.applicantBank.accountNo) errors.push('Applicant Account No. is required.');
  }
  if (section === 6) {
    if (!data.applicantEmployment.establishmentName) errors.push('Applicant Establishment Name is required.');
  }
  if (section === 8) {
    if (!photos.frontView) errors.push('Front View photo is mandatory.');
    if (!photos.leftSideView) errors.push('Left Side View photo is mandatory.');
    if (!photos.rightSideView) errors.push('Right Side View photo is mandatory.');
    if (!photos.backView) errors.push('Back View photo is mandatory.');
  }
  return errors;
}

export default function VehicleLoanForm() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<VehicleLoanFormData>(initialFormData);
  const [photos, setPhotos] = useState<PhotoUploads>(initialPhotos);
  const [errors, setErrors] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const updateFormData = useCallback((updates: Partial<VehicleLoanFormData>) => {
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
    if (currentSection < 9) {
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
    const toastId = toast.loading('Submitting application & generating PDF...');
    try {
      // 1. Generate PDF (Download)
      const { generateVehicleLoanPDF } = await import('@/lib/generateVehicleLoanPDF');
      await generateVehicleLoanPDF(formData, photos);
      
      // 2. Simulate submission (Backend call would go here)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Vehicle Loan Application submitted & PDF generated successfully!', { id: toastId });
      setSubmitting(false);
      router.push('/employee/submissions');
    } catch (err) {
      console.error('Submission or PDF generation failed:', err);
      toast.error('Submission failed. Please try again.', { id: toastId });
      setSubmitting(false);
    }
  };

  const sectionProps = { formData, updateFormData, errors };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/employee/loan-form')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Loan Types
        </button>
        <div className="h-5 w-px bg-outline-variant" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-base">directions_car</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold font-[var(--font-headline)] tracking-tight text-on-surface leading-none">
              Vehicle Loan Application
            </h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Form No: <span className="font-bold text-accent">{formData.applicationFormNo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      {!showReview && (
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
      {errors.length > 0 && (
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
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm">
        {showReview ? (
          <ReviewScreen
            formData={formData}
            photos={photos}
            onEdit={(section) => handleJumpTo(section)}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            submitting={submitting}
          />
        ) : (
          <>
            {/* Section Header */}
            <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{SECTIONS[currentSection - 1].icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Section {currentSection} of 9
                </p>
                <h3 className="text-lg font-bold text-on-surface font-[var(--font-headline)]">
                  {SECTIONS[currentSection - 1].label}
                </h3>
              </div>
            </div>

            {/* Section Body */}
            <div className="p-6 lg:p-8">
              {currentSection === 1 && <Section1AppInfo {...sectionProps} />}
              {currentSection === 2 && <Section2PersonalDetails {...sectionProps} />}
              {currentSection === 3 && <Section3AddressContact {...sectionProps} />}
              {currentSection === 4 && <Section4ResidenceInfo {...sectionProps} />}
              {currentSection === 5 && <Section5BankDetails {...sectionProps} />}
              {currentSection === 6 && <Section6EmploymentDetails {...sectionProps} />}
              {currentSection === 7 && <Section7PropertyDetails {...sectionProps} />}
              {currentSection === 8 && (
                <Section8VehiclePhotos photos={photos} setPhotos={setPhotos} errors={errors} />
              )}
              {currentSection === 9 && <Section9DocumentChecklist {...sectionProps} />}
            </div>

            {/* Navigation Footer */}
            <div className="px-8 py-5 border-t border-outline-variant/10 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentSection === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-medium">
                  {currentSection} / 9 sections
                </span>
                <div className="h-1.5 w-24 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentSection / 9) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleVerifyAndContinue}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                {currentSection === 9 ? 'Review Application' : 'Verify & Continue'}
                <span className="material-symbols-outlined text-lg">
                  {currentSection === 9 ? 'preview' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
