import { MonthlyLoanFormData } from './types';

export const sampleMonthlyData: Partial<MonthlyLoanFormData> = {
  // Section 1: Primary Details
  applicantName: 'Rahul Verma',
  fatherHusbandName: 'Suresh Verma',
  dob: '1988-06-15',
  gender: 'Male',
  mobile: '9876543210',
  alternateMobile: '9876543211',
  email: 'rahul.verma@example.com',
  occupation: 'Business Owner',

  coApplicantName: 'Priya Verma',
  coApplicantRelation: 'Spouse',
  coApplicantMobile: '9876543212',
  coApplicantDob: '1990-08-20',
  coApplicantGender: 'Female',
  coApplicantOccupation: 'Teacher',

  guarantorName: 'Amit Shah',
  guarantorRelation: 'Friend',
  guarantorMobile: '9876543213',
  guarantorOccupation: 'Software Engineer',

  // Section 2: KYC
  aadhaarNo: '1234 5678 9012',
  panNo: 'ABCDE1234F',
  coApplicantAadhaarNo: '2345 6789 0123',
  coApplicantPanNo: 'BCDEF2345G',
  guarantorAadhaarNo: '3456 7890 1234',
  guarantorPanNo: 'CDEFG3456H',

  // Section 3: Loan Details
  loanAmount: '500000',
  tenure: '24',
  interestRate: '1.5',
  emi: '28333.33',
  purpose: 'Business expansion and inventory purchase',

  // Section 4: Address
  communicationAddress: 'Flat 4B, Sunrise Apartments, MG Road',
  communicationCity: 'Bangalore',
  communicationState: 'Karnataka',
  communicationPinCode: '560001',
  permanentSameAsCommunication: true,

  // Section 5: Bank Details
  bankName: 'HDFC Bank',
  branch: 'Koramangala',
  accountNo: '50100234567890',
  accountType: 'Savings',
  ifscCode: 'HDFC0001234',
  avgMonthlyIncome: '85000',

  // Section 6: Employment / Business Details
  businessName: 'Verma Electronics',
  businessType: 'Retail',
  businessAddress: 'Shop No 12, Commercial Street, Bangalore',
  yearsInBusiness: '5',
  annualTurnover: '2500000',
  gstNo: '29ABCDE1234F1Z5',
  monthlyIncome: '120000',
  employerName: 'TechCorp India',
  designation: 'Senior Developer',
  yearsOfEmployment: '4',
  annualCTC: '1800000',
};
