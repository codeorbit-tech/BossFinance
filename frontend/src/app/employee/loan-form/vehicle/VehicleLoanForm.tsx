'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { customersApi, loansApi } from '@/lib/api';

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
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<VehicleLoanFormData>(initialFormData);
  const [photos, setPhotos] = useState<PhotoUploads>(initialPhotos);
  const [errors, setErrors] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string } | null>(null);
  
  // Track existing customer for edit
  const [existingCustomerId, setExistingCustomerId] = useState<string | null>(null);
  const [queryDescription, setQueryDescription] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      const fetchLoan = async () => {
        try {
          const res = await loansApi.get(editId);
          const loan = res.data.loan;
          if (loan && loan.status === 'QUERIED') {
            setExistingCustomerId(loan.customerId);
            
            if (loan.fullData) {
              try {
                const parsedData = JSON.parse(loan.fullData);
                setFormData(parsedData);
              } catch (e) {
                console.error('Failed to parse fullData:', e);
                // Fallback to basic data if parsing fails
                setFormData(prev => ({
                  ...prev,
                  applicantPersonal: { ...prev.applicantPersonal, firstName: loan.customer.name },
                  applicantContact: { 
                    ...prev.applicantContact, 
                    mobile: loan.customer.phone || '', 
                    email: loan.customer.email || '',
                    communicationAddress: { ...prev.applicantContact.communicationAddress, fullAddress: loan.customer.address || '' }
                  },
                  kycDocuments: {
                    ...prev.kycDocuments,
                    aadhaarCard: { ...prev.kycDocuments.aadhaarCard, applicantDocNo: loan.customer.aadhaar || '' },
                    panCard: { ...prev.kycDocuments.panCard, applicantDocNo: loan.customer.pan || '' }
                  },
                  applicantEmployment: { ...prev.applicantEmployment, designation: loan.customer.occupation || '' }
                }));
              }
            } else {
              // Fallback for loans without fullData
              setFormData(prev => ({
                ...prev,
                applicantPersonal: { ...prev.applicantPersonal, firstName: loan.customer.name },
                applicantContact: { 
                  ...prev.applicantContact, 
                  mobile: loan.customer.phone || '', 
                  email: loan.customer.email || '',
                  communicationAddress: { ...prev.applicantContact.communicationAddress, fullAddress: loan.customer.address || '' }
                },
                kycDocuments: {
                  ...prev.kycDocuments,
                  aadhaarCard: { ...prev.kycDocuments.aadhaarCard, applicantDocNo: loan.customer.aadhaar || '' },
                  panCard: { ...prev.kycDocuments.panCard, applicantDocNo: loan.customer.pan || '' }
                },
                applicantEmployment: { ...prev.applicantEmployment, designation: loan.customer.occupation || '' }
              }));
            }

            // Mark all sections as completed and go directly to review screen
            setCompletedSections([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            setShowReview(true);
            if (loan.queryDescription) {
              setQueryDescription(loan.queryDescription);
              toast(`Admin Query: ${loan.queryDescription}`, { 
                duration: 10000, 
                icon: '⚠️',
                style: { background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }
              });
            }
          }
        } catch (err) {
          toast.error('Failed to load application data.');
        }
      };
      fetchLoan();
    }
  }, [editId]);

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
    const toastId = toast.loading(editId ? 'Resubmitting application...' : 'Submitting application...');
    try {
      const fullName = [
        formData.applicantPersonal.firstName,
        formData.applicantPersonal.middleName,
        formData.applicantPersonal.lastName
      ].filter(Boolean).join(' ');

      const guarantorName = [
        formData.guarantorPersonal.firstName,
        formData.guarantorPersonal.middleName,
        formData.guarantorPersonal.lastName
      ].filter(Boolean).join(' ');

      let vehicleValue = 0;
      if (formData.applicantVehiclesOwned[0] && formData.applicantVehiclesOwned[0].declaredValue) {
        const parsed = parseFloat(formData.applicantVehiclesOwned[0].declaredValue);
        vehicleValue = isNaN(parsed) ? 0 : parsed;
      }

      let loanId = editId;

      if (editId && existingCustomerId) {
        console.log('Resubmitting for existing customer:', existingCustomerId);
        // 1. Update Existing Customer
        try {
          await customersApi.update(existingCustomerId, {
            name: fullName || 'Unknown Customer',
            phone: formData.applicantContact.mobile,
            email: formData.applicantContact.email,
            address: formData.applicantContact.communicationAddress.fullAddress,
            aadhaar: formData.kycDocuments.aadhaarCard.applicantDocNo,
            pan: formData.kycDocuments.panCard.applicantDocNo,
            dateOfBirth: formData.applicantPersonal.dob || null,
            occupation: formData.applicantEmployment.designation,
          });
        } catch (custErr: any) {
          console.error('Customer update failed during resubmit:', custErr);
        }

        // 2. Resubmit Loan
        await loansApi.resubmit(editId, {
          amount: vehicleValue,
          purpose: 'Vehicle Purchase/Refinance',
          fullData: formData
        });
      } else {
        // 1. Create Customer
        const custRes = await customersApi.create({
          name: fullName || 'Unknown Customer',
          phone: formData.applicantContact.mobile,
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
          loanType: 'VEHICLE',
          amount: vehicleValue,
          tenure: 12,
          interestRate: 0,
          emi: 0,
          frequency: 'MONTHLY',
          purpose: 'Vehicle Purchase/Refinance',
          guarantorName,
          guarantorPhone: formData.guarantorContact.mobile,
          fullData: formData
        });
        loanId = loanRes.data.loan.id;
      }

      // 3. Generate PDF
      const { generateVehicleLoanPDF } = await import('@/lib/generateVehicleLoanPDF');
      const { blob, url, fileName } = await generateVehicleLoanPDF(formData, photos);
      
      // 4. Upload PDF to server
      if (loanId) {
        try {
          await loansApi.uploadPdf(loanId, blob);
        } catch (uploadErr) {
          console.error('PDF upload failed:', uploadErr);
          toast.error('Application saved but PDF upload failed.', { id: toastId });
        }
      }

      toast.success(editId ? 'Application resubmitted successfully!' : 'Application submitted successfully!', { id: toastId });
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
    setFormData((prev) => ({
      ...prev,
      applicantEntityType: 'Individual',
      coApplicantEntityType: 'Individual',
      guarantorEntityType: 'Individual',
      
      applicantPersonal: {
        firstName: 'John', middleName: 'A.', lastName: 'Doe',
        gender: 'Male', dob: '1985-05-15',
        fatherFirstName: 'Robert', fatherMiddleName: '', fatherLastName: 'Doe',
        motherFirstName: 'Mary', motherMiddleName: '', motherLastName: 'Doe',
        religion: 'Hindu', religionOther: '',
        category: 'General', categoryOther: '',
        preferredLanguage: 'English', preferredLanguageOther: '',
      },
      coApplicantPersonal: {
        firstName: 'Jane', middleName: 'B.', lastName: 'Smith',
        gender: 'Female', dob: '1988-08-20',
        fatherFirstName: 'William', fatherMiddleName: '', fatherLastName: 'Smith',
        motherFirstName: 'Sarah', motherMiddleName: '', motherLastName: 'Smith',
        religion: 'Hindu', religionOther: '',
        category: 'General', categoryOther: '',
        preferredLanguage: 'English', preferredLanguageOther: '',
      },
      guarantorPersonal: {
        firstName: 'Michael', middleName: 'C.', lastName: 'Johnson',
        gender: 'Male', dob: '1980-02-10',
        fatherFirstName: 'David', fatherMiddleName: '', fatherLastName: 'Johnson',
        motherFirstName: 'Laura', motherMiddleName: '', motherLastName: 'Johnson',
        religion: 'Hindu', religionOther: '',
        category: 'General', categoryOther: '',
        preferredLanguage: 'English', preferredLanguageOther: '',
      },

      applicantContact: {
        communicationAddress: { fullAddress: '123 Elm St', landmark: 'Near Park', city: 'Mumbai', district: 'Mumbai City', state: 'MH', pinCode: '400001' },
        permanentSameAsCommunication: true,
        permanentAddress: { fullAddress: '123 Elm St', landmark: 'Near Park', city: 'Mumbai', district: 'Mumbai City', state: 'MH', pinCode: '400001' },
        mobile: '9876543210', alternateMobile: '9123456780', email: 'john.doe@example.com',
      },
      coApplicantContact: {
        communicationAddress: { fullAddress: '456 Oak St', landmark: 'Near Mall', city: 'Mumbai', district: 'Mumbai City', state: 'MH', pinCode: '400002' },
        permanentSameAsCommunication: true,
        permanentAddress: { fullAddress: '456 Oak St', landmark: 'Near Mall', city: 'Mumbai', district: 'Mumbai City', state: 'MH', pinCode: '400002' },
        mobile: '9876543211', alternateMobile: '', email: 'jane.smith@example.com',
      },
      guarantorContact: {
        communicationAddress: { fullAddress: '789 Pine St', landmark: 'Near Station', city: 'Mumbai', district: 'Mumbai City', state: 'MH', pinCode: '400003' },
        permanentSameAsCommunication: true,
        permanentAddress: { fullAddress: '789 Pine St', landmark: 'Near Station', city: 'Mumbai', district: 'Mumbai City', state: 'MH', pinCode: '400003' },
        mobile: '9876543212', alternateMobile: '', email: 'mike.johnson@example.com',
      },

      applicantResidence: { residence: 'Owned', yearsOfStay: '5', maritalStatus: 'Married', numberOfDependents: '2', education: 'Graduate', educationOther: '' },
      coApplicantResidence: { residence: 'Rented', yearsOfStay: '2', maritalStatus: 'Single', numberOfDependents: '0', education: 'Post Graduate', educationOther: '' },
      guarantorResidence: { residence: 'Owned', yearsOfStay: '10', maritalStatus: 'Married', numberOfDependents: '3', education: 'Graduate', educationOther: '' },

      applicantBank: { bankName: 'Global Bank', branch: 'Downtown', accountType: 'Savings', accountNo: '1020304050', accountSince: '2015', ifscCode: 'GLOB0001234', avgDebitPerMonth: '15000', avgCreditPerMonth: '50000' },
      coApplicantBank: { bankName: 'Metro Bank', branch: 'Uptown', accountType: 'Savings', accountNo: '0987654321', accountSince: '2018', ifscCode: 'METR0005678', avgDebitPerMonth: '10000', avgCreditPerMonth: '40000' },

      applicantEmployment: { establishmentName: 'TechCorp Inc.', designation: 'Software Engineer', yearsOfEmployment: '4', ctcPerAnnum: '1200000' },
      coApplicantEmployment: { establishmentName: 'DesignStudio LLC', designation: 'UX Designer', yearsOfEmployment: '3', ctcPerAnnum: '900000' },

      applicantVehiclesOwned: [
        { vehicle: 'Car', registrationNo: 'MH01AB1234', makeModel: 'Honda City', declaredValue: '500000', financedBy: 'None' },
        ...prev.applicantVehiclesOwned.slice(1)
      ],
      
      kycDocuments: {
        ...prev.kycDocuments,
        aadhaarCard: { applicantChecked: true, applicantDocNo: '111122223333', coApplicantChecked: true, coApplicantDocNo: '444455556666', guarantorChecked: true, guarantorDocNo: '777788889999' },
        panCard: { applicantChecked: true, applicantDocNo: 'ABCDE1234F', coApplicantChecked: true, coApplicantDocNo: 'FGHIJ5678K', guarantorChecked: true, guarantorDocNo: 'LMNOP9012Q' },
      },
    }));

    const createDummyFile = (name: string) => new File(["dummy image content"], name, { type: "image/jpeg" });
    setPhotos({
      frontView: createDummyFile("front_view.jpg"),
      leftSideView: createDummyFile("left_side.jpg"),
      rightSideView: createDummyFile("right_side.jpg"),
      backView: createDummyFile("back_view.jpg"),
      others: [null, null, null, null, null],
    });

    toast.success('Demo data filled successfully!');
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
        {pdfPreview ? (
          <div className="p-6 flex flex-col items-center">
            <div className="mb-4 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Application Submitted Successfully</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                The loan application has been submitted for review on <span className="font-bold text-accent">{new Date().toLocaleDateString()}</span>.
              </p>
            </div>
            
            <div className="w-full max-w-4xl h-[600px] border border-outline-variant/20 rounded-xl overflow-hidden mb-6 bg-surface-container">
              <iframe
                src={`${pdfPreview.url}#view=FitH`}
                className="w-full h-full"
                title="PDF Preview"
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download Application PDF
              </button>
              <button
                onClick={() => router.push('/employee/submissions')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-lg">list_alt</span>
                View My Submissions
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                New Application
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        ) : showReview ? (
          <ReviewScreen
            formData={formData}
            photos={photos}
            onEdit={(section) => handleJumpTo(section)}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            submitting={submitting}
            isResubmit={!!editId}
            queryDescription={queryDescription}
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
