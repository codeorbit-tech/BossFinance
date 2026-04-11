import {
  VehicleLoanFormData,
  emptyVehicleOwned,
  emptyImmovable,
  emptyKycDoc,
} from './types';

export const SAMPLE_FORM_DATA: VehicleLoanFormData = {
  // Section 1
  applicationFormNo: 'VL-20260412-8842',
  applicationDate: '2026-04-12',
  applicantEntityType: 'Individual',
  coApplicantEntityType: 'Individual',
  guarantorEntityType: 'Individual',
  udyamRegNo: 'UDYAM-TN-24-0012345',
  applicantCkycId: 'CKYC2024001234',
  applicantGstin: '33AABCS1429B1Z8',
  coApplicantCkycId: 'CKYC2024009876',
  coApplicantGstin: '',
  guarantorCkycId: 'CKYC2024005678',
  guarantorGstin: '',

  // Section 2
  applicantPersonal: {
    firstName: 'Rajesh', middleName: 'Kumar', lastName: 'Sharma',
    gender: 'Male', dob: '1988-05-15',
    fatherFirstName: 'Ramesh', fatherMiddleName: 'Lal', fatherLastName: 'Sharma',
    motherFirstName: 'Sunita', motherMiddleName: '', motherLastName: 'Devi',
    religion: ['Hindu'], religionOther: '',
    category: ['General'], categoryOther: '',
    preferredLanguage: 'English', preferredLanguageOther: '',
  },
  coApplicantPersonal: {
    firstName: 'Priya', middleName: '', lastName: 'Sharma',
    gender: 'Female', dob: '1991-11-23',
    fatherFirstName: 'Suresh', fatherMiddleName: '', fatherLastName: 'Nair',
    motherFirstName: 'Meena', motherMiddleName: '', motherLastName: 'Nair',
    religion: ['Hindu'], religionOther: '',
    category: ['General'], categoryOther: '',
    preferredLanguage: 'English', preferredLanguageOther: '',
  },
  guarantorPersonal: {
    firstName: 'Venkatesh', middleName: 'Rao', lastName: 'Pillai',
    gender: 'Male', dob: '1975-03-08',
    fatherFirstName: 'Krishna', fatherMiddleName: '', fatherLastName: 'Pillai',
    motherFirstName: 'Lakshmi', motherMiddleName: '', motherLastName: 'Pillai',
    religion: ['Hindu'], religionOther: '',
    category: ['OBC'], categoryOther: '',
    preferredLanguage: 'Others', preferredLanguageOther: 'Tamil',
  },

  // Section 3
  applicantContact: {
    communicationAddress: {
      fullAddress: '14, Anna Nagar 3rd Street, Flat No. 202, Prestige Apartments',
      landmark: 'Near LIC Office',
      city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pinCode: '600040',
    },
    permanentSameAsCommunication: true,
    permanentAddress: {
      fullAddress: '14, Anna Nagar 3rd Street, Flat No. 202, Prestige Apartments',
      landmark: 'Near LIC Office',
      city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pinCode: '600040',
    },
    mobile: '9876543210',
    alternateMobile: '9123456789',
    email: 'rajesh.sharma@email.com',
  },
  coApplicantContact: {
    communicationAddress: {
      fullAddress: '14, Anna Nagar 3rd Street, Flat No. 202, Prestige Apartments',
      landmark: 'Near LIC Office',
      city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pinCode: '600040',
    },
    permanentSameAsCommunication: true,
    permanentAddress: {
      fullAddress: '14, Anna Nagar 3rd Street, Flat No. 202, Prestige Apartments',
      landmark: 'Near LIC Office',
      city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pinCode: '600040',
    },
    mobile: '9988776655',
    alternateMobile: '',
    email: 'priya.sharma@email.com',
  },
  guarantorContact: {
    communicationAddress: {
      fullAddress: 'Plot 7, Thiruvalluvar Street, Velachery',
      landmark: 'Opposite SBI Branch',
      city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pinCode: '600042',
    },
    permanentSameAsCommunication: false,
    permanentAddress: {
      fullAddress: '45, Main Road, Madurai',
      landmark: 'Near Bus Stand',
      city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', pinCode: '625001',
    },
    mobile: '9443322110',
    alternateMobile: '9551234567',
    email: 'venkatesh.pillai@gmail.com',
  },

  // Section 4
  applicantResidence: {
    residence: 'Owned', yearsOfStay: '8',
    maritalStatus: 'Married', numberOfDependents: '2',
    education: 'Graduate', educationOther: '',
  },
  coApplicantResidence: {
    residence: 'Owned', yearsOfStay: '8',
    maritalStatus: 'Married', numberOfDependents: '2',
    education: 'Post Graduate', educationOther: '',
  },
  guarantorResidence: {
    residence: 'Owned', yearsOfStay: '15',
    maritalStatus: 'Married', numberOfDependents: '3',
    education: 'Graduate', educationOther: '',
  },

  // Section 5
  applicantBank: {
    bankName: 'State Bank of India', branch: 'Anna Nagar Branch',
    accountType: 'Savings', accountNo: '32109876543210',
    accountSince: '2015-06', ifscCode: 'SBIN0004302',
    avgDebitPerMonth: '45000', avgCreditPerMonth: '82000',
  },
  coApplicantBank: {
    bankName: 'HDFC Bank', branch: 'Velachery Branch',
    accountType: 'Savings', accountNo: '50100123456789',
    accountSince: '2018-01', ifscCode: 'HDFC0001234',
    avgDebitPerMonth: '30000', avgCreditPerMonth: '55000',
  },

  // Section 6
  applicantEmployment: {
    establishmentName: 'Infosys Limited',
    designation: 'Senior Software Engineer',
    yearsOfEmployment: '7',
    ctcPerAnnum: '1200000',
  },
  coApplicantEmployment: {
    establishmentName: 'Cognizant Technology Solutions',
    designation: 'Business Analyst',
    yearsOfEmployment: '5',
    ctcPerAnnum: '800000',
  },

  // Section 7
  applicantVehiclesOwned: [
    { vehicle: 'Car', registrationNo: 'TN09AB1234', makeModel: 'Maruti Suzuki Swift', declaredValue: '450000', financedBy: 'Self' },
    { vehicle: 'Two-Wheeler', registrationNo: 'TN09CD5678', makeModel: 'Honda Activa 6G', declaredValue: '85000', financedBy: 'Self' },
    emptyVehicleOwned(),
  ],
  coApplicantVehiclesOwned: [
    emptyVehicleOwned(), emptyVehicleOwned(), emptyVehicleOwned(),
  ],
  movablePropertyDescription: 'Fixed Deposits, Mutual Funds, NSC',
  movablePropertyValue: '350000',
  immovableProperties: [
    { assetType: 'Apartments', assetTypeOther: '', builtUpArea: '1200 sq.ft', landArea: '900 sq.ft (UDS)', declaredValue: '6500000' },
    { assetType: 'Vacant Land', assetTypeOther: '', builtUpArea: 'N/A', landArea: '0.25 Acres', declaredValue: '2500000' },
  ],

  // Section 9
  kycDocuments: {
    aadhaarCard: { applicantChecked: true, applicantDocNo: '1234 5678 9012', coApplicantChecked: true, coApplicantDocNo: '9876 5432 1098', guarantorChecked: true, guarantorDocNo: '5678 9012 3456' },
    panCard: { applicantChecked: true, applicantDocNo: 'ABCPS1234D', coApplicantChecked: true, coApplicantDocNo: 'PQRNS9876F', guarantorChecked: true, guarantorDocNo: 'VWXPV5678G' },
    passport: { ...emptyKycDoc() },
    drivingLicence: { applicantChecked: true, applicantDocNo: 'TN0920180012345', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: true, guarantorDocNo: 'TN0919990098765' },
    gasConnection: { applicantChecked: true, applicantDocNo: 'GAS-2345678', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: false, guarantorDocNo: '' },
    waterBill: { ...emptyKycDoc() },
    electricityBill: { applicantChecked: true, applicantDocNo: 'TNEB-1234567', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: true, guarantorDocNo: 'TNEB-9876543' },
    mobilePostpaidBill: { applicantChecked: true, applicantDocNo: 'JIO-MOB-2025-03', coApplicantChecked: true, coApplicantDocNo: 'AIRTEL-2025-03', guarantorChecked: false, guarantorDocNo: '' },
    voterIdCard: { applicantChecked: false, applicantDocNo: '', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: true, guarantorDocNo: 'TN/24/042/123456' },
  },
  preSanctionDocs: {
    proformaInvoice: true, saleDeedUsed: false, rcUsedAsset: false,
    insurance: true, bankStatement: true, itr: true,
    nonIndividualDoc: false, othersText: '',
  },
  postDisbursementDocs: {
    originalInvoiceNew: false, rcHypothecation: false,
    insuranceHypothecation: false, othersText: '',
  },
};
