// Types for Monthly Personal & Business Loan Form

export interface MonthlyLoanPersonal {
  fullName: string;
  fatherHusbandName: string;
  dob: string;
  gender: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  occupation: string;
}

export interface MonthlyLoanAddress {
  fullAddress: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
}

export interface MonthlyLoanBank {
  bankName: string;
  branch: string;
  accountNo: string;
  accountType: string;
  ifscCode: string;
}

export interface MonthlyLoanBusiness {
  businessName: string;
  businessType: string;
  businessAddress: string;
  yearsInBusiness: string;
  annualTurnover: string;
  gstNo: string;
}

export interface MonthlyLoanFormData {
  applicationFormNo: string;
  applicationDate: string;
  loanType: string; // PERSONAL | BUSINESS
  frequency: 'MONTHLY';

  // Section 1: Primary Details
  applicantName: string;
  fatherHusbandName: string;
  dob: string;
  gender: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  occupation: string;

  coApplicantName: string;
  coApplicantRelation: string;
  coApplicantMobile: string;
  coApplicantDob: string;
  coApplicantGender: string;
  coApplicantOccupation: string;

  guarantorName: string;
  guarantorRelation: string;
  guarantorMobile: string;
  guarantorOccupation: string;

  // Section 2: KYC
  aadhaarNo: string;
  panNo: string;
  coApplicantAadhaarNo: string;
  coApplicantPanNo: string;
  guarantorAadhaarNo: string;
  guarantorPanNo: string;

  // Section 3: Loan Details
  loanAmount: string;
  tenure: string;
  interestRate: string;
  emi: string;
  purpose: string;

  // Section 4: Address
  communicationAddress: string;
  communicationCity: string;
  communicationState: string;
  communicationPinCode: string;
  permanentSameAsCommunication: boolean;
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPinCode: string;

  // Section 5: Bank Details
  bankName: string;
  branch: string;
  accountNo: string;
  accountType: string;
  ifscCode: string;
  avgMonthlyIncome: string;

  // Section 6: Employment / Business Details
  businessName: string;
  businessType: string;
  businessAddress: string;
  yearsInBusiness: string;
  annualTurnover: string;
  gstNo: string;
  monthlyIncome: string;
  employerName: string;
  designation: string;
  yearsOfEmployment: string;
  annualCTC: string;
}

export interface MonthlyLoanPhotos {
  applicantPhoto: File | null;
  coApplicantPhoto: File | null;
  coApplicantAadhaarFront: File | null;
  coApplicantAadhaarBack: File | null;
  guarantorPhoto: File | null;
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panCard: File | null;
  incomeProof: File | null;
  businessProof: File | null;
}

export const emptyMonthlyLoanData = (): MonthlyLoanFormData => ({
  applicationFormNo: '',
  applicationDate: new Date().toISOString().slice(0, 10),
  loanType: 'PERSONAL',
  frequency: 'MONTHLY',
  applicantName: '',
  fatherHusbandName: '',
  dob: '',
  gender: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  occupation: '',
  coApplicantName: '',
  coApplicantRelation: '',
  coApplicantMobile: '',
  coApplicantDob: '',
  coApplicantGender: '',
  coApplicantOccupation: '',
  guarantorName: '',
  guarantorRelation: '',
  guarantorMobile: '',
  guarantorOccupation: '',
  aadhaarNo: '',
  panNo: '',
  coApplicantAadhaarNo: '',
  coApplicantPanNo: '',
  guarantorAadhaarNo: '',
  guarantorPanNo: '',
  loanAmount: '',
  tenure: '',
  interestRate: '',
  emi: '',
  purpose: '',
  communicationAddress: '',
  communicationCity: '',
  communicationState: '',
  communicationPinCode: '',
  permanentSameAsCommunication: true,
  permanentAddress: '',
  permanentCity: '',
  permanentState: '',
  permanentPinCode: '',
  bankName: '',
  branch: '',
  accountNo: '',
  accountType: 'Savings',
  ifscCode: '',
  avgMonthlyIncome: '',
  businessName: '',
  businessType: '',
  businessAddress: '',
  yearsInBusiness: '',
  annualTurnover: '',
  gstNo: '',
  monthlyIncome: '',
  employerName: '',
  designation: '',
  yearsOfEmployment: '',
  annualCTC: '',
});

export const emptyMonthlyPhotos = (): MonthlyLoanPhotos => ({
  applicantPhoto: null,
  coApplicantPhoto: null,
  coApplicantAadhaarFront: null,
  coApplicantAadhaarBack: null,
  guarantorPhoto: null,
  aadhaarFront: null,
  aadhaarBack: null,
  panCard: null,
  incomeProof: null,
  businessProof: null,
});
