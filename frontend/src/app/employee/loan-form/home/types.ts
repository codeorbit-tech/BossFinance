// ─── Home Loan Form — TypeScript Types ───

export type EntityType = 'Individual' | 'Non-Individual';
export type Gender = 'Male' | 'Female' | 'Third Gender';
export type Religion = 'Hindu' | 'Christian' | 'Sikh' | 'Muslim' | 'Others';
export type Category = 'General' | 'SC' | 'ST' | 'OBC' | 'MBC' | 'Others';
export type ResidenceType = 'Owned' | 'Rented';
export type MaritalStatus = 'Single' | 'Married';
export type Education = 'SSC' | 'HSC' | 'Graduate' | 'Post Graduate' | 'Others';
export type AccountType = 'Savings' | 'Current' | 'OD' | 'NRE' | 'Others';
export type ImmovableAssetType =
  | 'Vacant Land'
  | 'Apartments'
  | 'Building Residential'
  | 'Building Commercial'
  | 'Industrial'
  | 'Agricultural'
  | 'Others';

// ─── Personal Details ───
export interface PartyPersonalDetails {
  fullName: string;
  dob: string;
  gender: Gender | '';
  preferredLanguage?: string;
  fatherName: string;
  mobile: string;
  maritalStatus: MaritalStatus | '';
  spouseName: string;
  numberOfDependents: string;
  education: Education | '';
  educationOther: string;
  religion: Religion | '';
  religionOther: string;
  category: Category | '';
  categoryOther: string;
}

// ─── Address Block ───
export interface AddressBlock {
  fullAddress: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
}

// ─── Contact Details ───
export interface PartyContactDetails {
  communicationAddress: AddressBlock;
  permanentSameAsCommunication: boolean;
  permanentAddress: AddressBlock;
  alternateMobile: string;
  email: string;
}

// ─── Residence Info ───
export interface PartyResidenceInfo {
  residence: ResidenceType | '';
  yearsOfStay: string;
}

// ─── Bank Account ───
export interface BankAccountDetails {
  bankName: string;
  branch: string;
  accountType: AccountType | '';
  accountNo: string;
  accountSince: string;
  ifscCode: string;
  avgDebitPerMonth: string;
  avgCreditPerMonth: string;
}

// ─── Employment Details ───
export interface EmploymentDetails {
  establishmentName: string;
  designation: string;
  yearsOfEmployment: string;
  ctcPerAnnum: string;
}

// ─── Property Details (For Section 8) ───
export interface HomePropertyDetails {
  propertyType: ImmovableAssetType | '';
  propertyTypeOther: string;
  locality: string;
  surveyNo: string;
  pattaNo: string;
  landArea: string; // e.g., 1200 sqft
  builtUpArea: string;
  marketValue: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
}

// ─── Loan Details ───
export interface LoanDetails {
  loanAmount: string;
  tenure: string;
  interestRate: string;
  emi: string;
}

// ─── KYC Document Entry ───
export interface KycDocEntry {
  applicantChecked: boolean;
  applicantDocNo: string;
  coApplicantChecked: boolean;
  coApplicantDocNo: string;
  guarantorChecked: boolean;
  guarantorDocNo: string;
}

// ─── Full Home Loan Form Data ───
export interface HomeLoanFormData {
  // Section 1
  applicationFormNo: string;
  applicationDate: string;
  applicantEntityType: EntityType | '';
  coApplicantEntityType: EntityType | '';
  guarantorEntityType: EntityType | '';
  udyamRegNo: string;
  applicantGstin: string;
  applicantOwnedHouse: boolean;
  coApplicantGstin: string;
  coApplicantOwnedHouse: boolean;
  guarantorGstin: string;
  guarantorOwnedHouse: boolean;

  // Loan Details
  loanDetails: LoanDetails;

  // Section 2
  applicantPersonal: PartyPersonalDetails;
  coApplicantPersonal: PartyPersonalDetails;
  guarantorPersonal: PartyPersonalDetails;

  // Section 3
  applicantContact: PartyContactDetails;
  coApplicantContact: PartyContactDetails;
  guarantorContact: PartyContactDetails;

  // Section 4
  applicantResidence: PartyResidenceInfo;
  coApplicantResidence: PartyResidenceInfo;
  guarantorResidence: PartyResidenceInfo;

  // Section 5
  applicantBank: BankAccountDetails;
  coApplicantBank: BankAccountDetails;

  // Section 6
  applicantEmployment: EmploymentDetails;
  coApplicantEmployment: EmploymentDetails;

  // Section 7 (Generic Assets - kept for similarity)
  movablePropertyDescription: string;
  movablePropertyValue: string;

  // Section 8 (Core Home Property)
  propertyDetails: HomePropertyDetails;

  // Section 10
  kycDocuments: {
    aadhaarCard: KycDocEntry;
    panCard: KycDocEntry;
    passport: KycDocEntry;
    drivingLicence: KycDocEntry;
    gasConnection: KycDocEntry;
    waterBill: KycDocEntry;
    electricityBill: KycDocEntry;
    mobilePostpaidBill: KycDocEntry;
    voterIdCard: KycDocEntry;
    rationCard: KycDocEntry;
  };
  preSanctionDocs: {
    saleAgreement: boolean;
    parentDocuments: boolean;
    encumbranceCertificate: boolean;
    pattaChitta: boolean;
    approvalPlan: boolean;
    nocBuilder: boolean;
    bankStatement: boolean;
    itr: boolean;
    othersText: string;
  };
  postDisbursementDocs: {
    saleDeedOriginal: boolean;
    modDeposit: boolean;
    insurancePolicy: boolean;
    othersText: string;
  };
}

// ─── Property Photo Upload State ───
export interface HomePhotoUploads {
  applicantPhoto: File | null;
  coApplicantPhoto: File | null;
  guarantorPhoto: File | null;
  frontElevation: File | null;
  interiorView: File | null;
  sideSiteView: File | null;
  layoutPlan: File | null;
  // KYC Doc Files
  gasBill: File | null;
  ebBill: File | null;
  rationCard: File | null;
  voterId: File | null;
  others: (File | null)[];
  // Legal & Miscellaneous Documents (Generic Multiple Uploads)
  uploadedDocuments: File[];
}

// ─── Default factory helpers ───
export const emptyPersonal = (): PartyPersonalDetails => ({
  fullName: '',
  dob: '',
  gender: '',
  preferredLanguage: '',
  fatherName: '',
  mobile: '',
  maritalStatus: '',
  spouseName: '',
  numberOfDependents: '',
  education: '',
  educationOther: '',
  religion: '',
  religionOther: '',
  category: '',
  categoryOther: '',
});

export const emptyAddress = (): AddressBlock => ({
  fullAddress: '', landmark: '', city: '', district: '', state: '', pinCode: '',
});

export const emptyContact = (): PartyContactDetails => ({
  communicationAddress: emptyAddress(),
  permanentSameAsCommunication: false,
  permanentAddress: emptyAddress(),
  alternateMobile: '', email: '',
});

export const emptyResidence = (): PartyResidenceInfo => ({
  residence: '', yearsOfStay: '',
});

export const emptyBank = (): BankAccountDetails => ({
  bankName: '', branch: '', accountType: '', accountNo: '',
  accountSince: '', ifscCode: '', avgDebitPerMonth: '', avgCreditPerMonth: '',
});

export const emptyEmployment = (): EmploymentDetails => ({
  establishmentName: '', designation: '', yearsOfEmployment: '', ctcPerAnnum: '',
});

export const emptyHomeProperty = (): HomePropertyDetails => ({
  propertyType: '', propertyTypeOther: '', locality: '', surveyNo: '', pattaNo: '',
  landArea: '', builtUpArea: '', marketValue: '',
  boundaryNorth: '', boundarySouth: '', boundaryEast: '', boundaryWest: '',
});

export const emptyLoanDetails = (): LoanDetails => ({
  loanAmount: '', tenure: '', interestRate: '', emi: '',
});

export const emptyKycDoc = (): KycDocEntry => ({
  applicantChecked: false, applicantDocNo: '',
  coApplicantChecked: false, coApplicantDocNo: '',
  guarantorChecked: false, guarantorDocNo: '',
});
