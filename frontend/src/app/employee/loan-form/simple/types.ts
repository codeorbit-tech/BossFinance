export interface SimpleLoanFormData {
  applicationFormNo: string;
  applicationDate: string;
  loanType: string; // SHOP, BUSINESS, PERSONAL
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  
  // Applicant Details
  applicantName: string;
  fatherHusbandName: string;
  dob: string;
  gender: string;
  mobile: string;
  aadhaarNo: string;
  panNo: string;
  address: string;

  // Co-Applicant Details
  coApplicantName: string;
  coApplicantFatherHusbandName: string;
  coApplicantDob: string;
  coApplicantGender: string;
  coApplicantMobile: string;
  coApplicantAadhaarNo: string;
  coApplicantPanNo: string;
  coApplicantAddress: string;
  coApplicantRelation: string;
  coApplicantBankName: string;
  coApplicantAccountNo: string;
  coApplicantIfscCode: string;

  // Shop/Business Details
  shopName: string;
  shopAddress: string;
  businessType: string;
  yearsInBusiness: string;

  // Loan Details
  loanAmount: string;
  tenure: string; // Days or Weeks
  interestRate: string;
  emi: string;

  // Bank Details
  bankName: string;
  accountNo: string;
  ifscCode: string;

  // Guarantor Details
  guarantorName: string;
  guarantorFatherHusbandName: string;
  guarantorDob: string;
  guarantorGender: string;
  guarantorMobile: string;
  guarantorRelation: string;
  guarantorAadhaarNo: string;
  guarantorPanNo: string;
  guarantorAddress: string;
}

export interface SimplePhotoUploads {
  applicantPhoto: File | null;
  coApplicantPhoto: File | null;
  shopPhoto: File | null;
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panCard: File | null;
  guarantorPhoto: File | null;
  guarantorAadhaarFront: File | null;
  guarantorAadhaarBack: File | null;
}

export const emptySimpleLoanData = (): SimpleLoanFormData => ({
  applicationFormNo: '',
  applicationDate: new Date().toISOString().slice(0, 10),
  loanType: '',
  frequency: 'DAILY',
  applicantName: '',
  fatherHusbandName: '',
  dob: '',
  gender: '',
  mobile: '',
  aadhaarNo: '',
  panNo: '',
  address: '',
  coApplicantName: '',
  coApplicantFatherHusbandName: '',
  coApplicantDob: '',
  coApplicantGender: '',
  coApplicantMobile: '',
  coApplicantAadhaarNo: '',
  coApplicantPanNo: '',
  coApplicantAddress: '',
  coApplicantRelation: '',
  coApplicantBankName: '',
  coApplicantAccountNo: '',
  coApplicantIfscCode: '',
  shopName: '',
  shopAddress: '',
  businessType: '',
  yearsInBusiness: '',
  loanAmount: '',
  tenure: '',
  interestRate: '',
  emi: '',
  bankName: '',
  accountNo: '',
  ifscCode: '',
  guarantorName: '',
  guarantorFatherHusbandName: '',
  guarantorDob: '',
  guarantorGender: '',
  guarantorMobile: '',
  guarantorRelation: '',
  guarantorAadhaarNo: '',
  guarantorPanNo: '',
  guarantorAddress: '',
});

export const emptySimplePhotos = (): SimplePhotoUploads => ({
  applicantPhoto: null,
  coApplicantPhoto: null,
  shopPhoto: null,
  aadhaarFront: null,
  aadhaarBack: null,
  panCard: null,
  guarantorPhoto: null,
  guarantorAadhaarFront: null,
  guarantorAadhaarBack: null,
});
