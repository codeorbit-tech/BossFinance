// ─── Vehicle Loan Form — TypeScript Types ───

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
  | 'Others';

// ─── Personal Details ───
export interface PartyPersonalDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: Gender | '';
  dob: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  religion: Religion | '';
  religionOther: string;
  category: Category | '';
  categoryOther: string;
  preferredLanguage: string;
  preferredLanguageOther: string;
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
  mobile: string;
  alternateMobile: string;
  email: string;
}

// ─── Residence Info ───
export interface PartyResidenceInfo {
  residence: ResidenceType | '';
  yearsOfStay: string;
  maritalStatus: MaritalStatus | '';
  numberOfDependents: string;
  education: Education | '';
  educationOther: string;
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

// ─── Vehicle Owned ───
export interface VehicleOwned {
  vehicle: string;
  registrationNo: string;
  makeModel: string;
  declaredValue: string;
  financedBy: string;
}

// ─── Immovable Property ───
export interface ImmovableProperty {
  assetType: ImmovableAssetType | '';
  assetTypeOther: string;
  builtUpArea: string;
  landArea: string;
  declaredValue: string;
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

// ─── Full Form Data ───
export interface VehicleLoanFormData {
  // Section 1
  applicationFormNo: string;
  applicationDate: string;
  applicantEntityType: EntityType | '';
  coApplicantEntityType: EntityType | '';
  guarantorEntityType: EntityType | '';
  udyamRegNo: string;
  applicantCkycId: string;
  applicantGstin: string;
  coApplicantCkycId: string;
  coApplicantGstin: string;
  guarantorCkycId: string;
  guarantorGstin: string;

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

  // Section 7
  applicantVehiclesOwned: VehicleOwned[];
  coApplicantVehiclesOwned: VehicleOwned[];
  movablePropertyDescription: string;
  movablePropertyValue: string;
  immovableProperties: ImmovableProperty[];

  // Section 9
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
  };
  preSanctionDocs: {
    proformaInvoice: boolean;
    saleDeedUsed: boolean;
    rcUsedAsset: boolean;
    insurance: boolean;
    bankStatement: boolean;
    itr: boolean;
    nonIndividualDoc: boolean;
    othersText: string;
  };
  postDisbursementDocs: {
    originalInvoiceNew: boolean;
    rcHypothecation: boolean;
    insuranceHypothecation: boolean;
    othersText: string;
  };
}

// ─── Photo Upload State ───
export interface PhotoUploads {
  frontView: File | null;
  leftSideView: File | null;
  rightSideView: File | null;
  backView: File | null;
  others: (File | null)[];
}

// ─── Default factory helpers ───
export const emptyPersonal = (): PartyPersonalDetails => ({
  firstName: '', middleName: '', lastName: '',
  gender: '', dob: '',
  fatherFirstName: '', fatherMiddleName: '', fatherLastName: '',
  motherFirstName: '', motherMiddleName: '', motherLastName: '',
  religion: '', religionOther: '',
  category: '', categoryOther: '',
  preferredLanguage: 'English', preferredLanguageOther: '',
});

export const emptyAddress = (): AddressBlock => ({
  fullAddress: '', landmark: '', city: '', district: '', state: '', pinCode: '',
});

export const emptyContact = (): PartyContactDetails => ({
  communicationAddress: emptyAddress(),
  permanentSameAsCommunication: false,
  permanentAddress: emptyAddress(),
  mobile: '', alternateMobile: '', email: '',
});

export const emptyResidence = (): PartyResidenceInfo => ({
  residence: '', yearsOfStay: '', maritalStatus: '',
  numberOfDependents: '', education: '', educationOther: '',
});

export const emptyBank = (): BankAccountDetails => ({
  bankName: '', branch: '', accountType: '', accountNo: '',
  accountSince: '', ifscCode: '', avgDebitPerMonth: '', avgCreditPerMonth: '',
});

export const emptyEmployment = (): EmploymentDetails => ({
  establishmentName: '', designation: '', yearsOfEmployment: '', ctcPerAnnum: '',
});

export const emptyVehicleOwned = (): VehicleOwned => ({
  vehicle: '', registrationNo: '', makeModel: '', declaredValue: '', financedBy: '',
});

export const emptyImmovable = (): ImmovableProperty => ({
  assetType: '', assetTypeOther: '', builtUpArea: '', landArea: '', declaredValue: '',
});

export const emptyKycDoc = (): KycDocEntry => ({
  applicantChecked: false, applicantDocNo: '',
  coApplicantChecked: false, coApplicantDocNo: '',
  guarantorChecked: false, guarantorDocNo: '',
});
