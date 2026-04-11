// Run: node generate-sample-pdf.mjs
import { jsPDF } from 'jspdf';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Page Constants ───
const PW = 210;
const PH = 297;
const ML = 15;
const MR = 15;
const CW = PW - ML - MR;
const LINE_H = 6;
const SMALL_H = 5;

function val(v) {
  if (!v || String(v).trim() === '') return '-';
  return String(v).trim();
}

function currency(v) {
  if (!v || isNaN(Number(v))) return '-';
  return 'Rs. ' + parseInt(v).toLocaleString('en-IN');
}

function fullName(...parts) {
  return parts.filter(Boolean).join(' ').trim() || '-';
}

function checkPage(doc, y, needed = 15) {
  if (y + needed > PH - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

function divider(doc, y) {
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(ML, y, PW - MR, y);
  return y + 3;
}

function sectionTitle(doc, y, text) {
  y = checkPage(doc, y, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(text.toUpperCase(), ML, y);
  y += 1;
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  return y + 4;
}

function subHeader(doc, y, text) {
  y = checkPage(doc, y, 8);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(text, ML, y);
  return y + LINE_H;
}

function row(doc, y, label, value) {
  y = checkPage(doc, y, SMALL_H + 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(label + ':', ML + 2, y);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(String(value), CW - 55);
  doc.text(lines, ML + 55, y);
  return y + Math.max(lines.length * SMALL_H, SMALL_H);
}

function triHeader(doc, y) {
  y = checkPage(doc, y, SMALL_H + 1);
  const colW = (CW - 45) / 3;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FIELD', ML + 2, y);
  doc.text('APPLICANT', ML + 47, y);
  doc.text('CO-APPLICANT', ML + 47 + colW, y);
  doc.text('GUARANTOR', ML + 47 + colW * 2, y);
  doc.setLineWidth(0.1);
  doc.line(ML, y + 1, PW - MR, y + 1);
  return y + SMALL_H;
}

function triRow(doc, y, label, a, ca, g) {
  y = checkPage(doc, y, SMALL_H + 1);
  const colW = (CW - 45) / 3;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(label, ML + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(a, colW - 2), ML + 47, y);
  doc.text(doc.splitTextToSize(ca, colW - 2), ML + 47 + colW, y);
  doc.text(doc.splitTextToSize(g, colW - 2), ML + 47 + colW * 2, y);
  return y + SMALL_H;
}

function dualHeader(doc, y) {
  y = checkPage(doc, y, SMALL_H + 1);
  const colW = (CW - 55) / 2;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FIELD', ML + 2, y);
  doc.text('APPLICANT', ML + 57, y);
  doc.text('CO-APPLICANT', ML + 57 + colW, y);
  doc.setLineWidth(0.1);
  doc.line(ML, y + 1, PW - MR, y + 1);
  return y + SMALL_H;
}

function dualRow(doc, y, label, a, ca) {
  y = checkPage(doc, y, SMALL_H + 1);
  const colW = (CW - 55) / 2;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(label, ML + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(a, colW - 2), ML + 57, y);
  doc.text(doc.splitTextToSize(ca, colW - 2), ML + 57 + colW, y);
  return y + SMALL_H;
}

function drawFooter(doc, pageNum, totalPages) {
  const fy = PH - 10;
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(ML, fy - 3, PW - MR, fy - 3);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text('BOSS FINANCE CONSULTANCY — CONFIDENTIAL', ML, fy);
  doc.text(`Page ${pageNum} of ${totalPages}`, PW - MR, fy, { align: 'right' });
  doc.setTextColor(0);
}

function addFooters(doc) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(doc, i, total);
  }
}

// ──────────────────────────────────────────────────────────────────
// SAMPLE DATA
// ──────────────────────────────────────────────────────────────────
const data = {
  applicationFormNo: 'BFC-VL-2026-00142',
  applicationDate: '2026-04-12',
  applicantEntityType: 'Individual',
  coApplicantEntityType: 'Individual',
  guarantorEntityType: 'Individual',
  applicantCkycId: 'CKYC00123456',
  coApplicantCkycId: 'CKYC00789012',
  guarantorCkycId: '-',
  applicantGstin: '-',
  coApplicantGstin: '-',
  guarantorGstin: '-',
  udyamRegNo: '',

  applicantPersonal: {
    firstName: 'Ramesh', middleName: 'Kumar', lastName: 'Sharma',
    gender: 'Male', dob: '15-08-1985',
    fatherFirstName: 'Suresh', fatherMiddleName: '', fatherLastName: 'Sharma',
    motherFirstName: 'Usha', motherMiddleName: '', motherLastName: 'Sharma',
    religion: ['Hindu'], religionOther: '',
    category: ['General'], categoryOther: '',
    preferredLanguage: 'Hindi', preferredLanguageOther: '',
  },
  coApplicantPersonal: {
    firstName: 'Priya', middleName: '', lastName: 'Sharma',
    gender: 'Female', dob: '22-03-1988',
    fatherFirstName: 'Mohan', fatherMiddleName: '', fatherLastName: 'Singh',
    motherFirstName: 'Kamla', motherMiddleName: '', motherLastName: 'Singh',
    religion: ['Hindu'], religionOther: '',
    category: ['General'], categoryOther: '',
    preferredLanguage: 'Hindi', preferredLanguageOther: '',
  },
  guarantorPersonal: {
    firstName: 'Vikram', middleName: '', lastName: 'Mehta',
    gender: 'Male', dob: '10-01-1980',
    fatherFirstName: 'Dinesh', fatherMiddleName: '', fatherLastName: 'Mehta',
    motherFirstName: 'Sarla', motherMiddleName: '', motherLastName: 'Mehta',
    religion: ['Hindu'], religionOther: '',
    category: ['General'], categoryOther: '',
    preferredLanguage: 'Hindi', preferredLanguageOther: '',
  },

  applicantContact: {
    communicationAddress: { fullAddress: '12, Green Park Colony, Near Bus Stand', landmark: 'Opp. SBI Bank', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', pinCode: '302001' },
    permanentSameAsCommunication: true,
    permanentAddress: {},
    mobile: '9876543210', alternateMobile: '9123456789', email: 'ramesh.sharma@email.com',
  },
  coApplicantContact: {
    communicationAddress: { fullAddress: '12, Green Park Colony, Near Bus Stand', landmark: 'Opp. SBI Bank', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', pinCode: '302001' },
    permanentSameAsCommunication: true,
    permanentAddress: {},
    mobile: '9876500001', alternateMobile: '', email: 'priya.sharma@email.com',
  },
  guarantorContact: {
    communicationAddress: { fullAddress: '45, Shastri Nagar, Sector 7', landmark: 'Near Post Office', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', pinCode: '302016' },
    permanentSameAsCommunication: false,
    permanentAddress: { fullAddress: '88, Ram Nagar', landmark: '', city: 'Ajmer', district: 'Ajmer', state: 'Rajasthan', pinCode: '305001' },
    mobile: '9988776655', alternateMobile: '', email: '',
  },

  applicantResidence: { residence: 'Owned', yearsOfStay: '10', maritalStatus: 'Married', numberOfDependents: '2', education: 'Graduate' },
  coApplicantResidence: { residence: 'Owned', yearsOfStay: '10', maritalStatus: 'Married', numberOfDependents: '2', education: 'Post Graduate' },
  guarantorResidence: { residence: 'Rented', yearsOfStay: '5', maritalStatus: 'Married', numberOfDependents: '3', education: 'Graduate' },

  applicantBank: { bankName: 'State Bank of India', branch: 'Jaipur Main Branch', accountType: 'Savings', accountNo: '31245678901', accountSince: '2010', ifscCode: 'SBIN0001234', avgDebitPerMonth: '25000', avgCreditPerMonth: '55000' },
  coApplicantBank: { bankName: 'HDFC Bank', branch: 'Malviya Nagar, Jaipur', accountType: 'Savings', accountNo: '50100123456789', accountSince: '2015', ifscCode: 'HDFC0001122', avgDebitPerMonth: '15000', avgCreditPerMonth: '30000' },

  applicantEmployment: { establishmentName: 'Rajasthan State Govt. — PWD Department', designation: 'Junior Engineer', yearsOfEmployment: '8', ctcPerAnnum: '720000' },
  coApplicantEmployment: { establishmentName: 'City Hospital, Jaipur', designation: 'Staff Nurse', yearsOfEmployment: '6', ctcPerAnnum: '360000' },

  applicantVehiclesOwned: [{ vehicle: 'Two Wheeler', registrationNo: 'RJ14 AB 1234', makeModel: 'Honda Activa 6G', declaredValue: '60000', financedBy: 'Self' }],
  coApplicantVehiclesOwned: [],
  movablePropertyDescription: 'Gold jewellery, household electronics',
  movablePropertyValue: '250000',
  immovableProperties: [{ assetType: 'Residential Plot', assetTypeOther: '', builtUpArea: '1200 sq ft', landArea: '1500 sq ft', declaredValue: '3500000' }],

  kycDocuments: {
    aadhaarCard: { applicantChecked: true, applicantDocNo: '1234 5678 9012', coApplicantChecked: true, coApplicantDocNo: '9876 5432 1011', guarantorChecked: true, guarantorDocNo: '1122 3344 5566' },
    panCard: { applicantChecked: true, applicantDocNo: 'ABCDE1234F', coApplicantChecked: true, coApplicantDocNo: 'PQRST5678G', guarantorChecked: false, guarantorDocNo: '' },
    passport: { applicantChecked: false, applicantDocNo: '', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: false, guarantorDocNo: '' },
    drivingLicence: { applicantChecked: true, applicantDocNo: 'RJ-14 20100012345', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: false, guarantorDocNo: '' },
    gasConnection: { applicantChecked: true, applicantDocNo: 'IGL-99887766', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: false, guarantorDocNo: '' },
    waterBill: { applicantChecked: false, applicantDocNo: '', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: false, guarantorDocNo: '' },
    electricityBill: { applicantChecked: true, applicantDocNo: 'JVVNL-1234567', coApplicantChecked: true, coApplicantDocNo: 'JVVNL-7654321', guarantorChecked: false, guarantorDocNo: '' },
    mobilePostpaidBill: { applicantChecked: false, applicantDocNo: '', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: false, guarantorDocNo: '' },
    voterIdCard: { applicantChecked: true, applicantDocNo: 'ABC1234567', coApplicantChecked: false, coApplicantDocNo: '', guarantorChecked: true, guarantorDocNo: 'XYZ9876543' },
  },

  preSanctionDocs: {
    proformaInvoice: true,
    saleDeedUsed: false,
    rcUsedAsset: false,
    insurance: true,
    bankStatement: true,
    itr: true,
    nonIndividualDoc: false,
    othersText: '',
  },
  postDisbursementDocs: {
    originalInvoiceNew: false,
    rcHypothecation: false,
    insuranceHypothecation: false,
    othersText: '',
  },
};

const photos = {
  frontView: true,
  leftSideView: true,
  rightSideView: false,
  backView: true,
  others: [true, false, false, false, false],
};

// ──────────────────────────────────────────────────────────────────
// GENERATE PDF
// ──────────────────────────────────────────────────────────────────
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

// COVER HEADER
let y = 18;
doc.setFontSize(14);
doc.setFont('helvetica', 'bold');
doc.setTextColor(0);
doc.text('BOSS FINANCE CONSULTANCY', ML, y);
y += 6;
doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.text('YOUR FINANCIAL PARTNER', ML, y);
doc.setFontSize(8.5);
doc.setFont('helvetica', 'bold');
doc.text('VEHICLE LOAN APPLICATION FORM', PW - MR, 18, { align: 'right' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.text(`Form No: ${data.applicationFormNo}`, PW - MR, 24, { align: 'right' });
doc.text(`Date: ${data.applicationDate}`, PW - MR, 30, { align: 'right' });
y = 35;
y = divider(doc, y) + 2;

// SECTION 1
y = sectionTitle(doc, y, 'Section 1 — Application Information');
y = triHeader(doc, y);
y = triRow(doc, y, 'Entity Type', data.applicantEntityType, data.coApplicantEntityType, data.guarantorEntityType);
y = triRow(doc, y, 'CKYC ID', data.applicantCkycId, data.coApplicantCkycId, data.guarantorCkycId);
y = triRow(doc, y, 'GSTIN', val(data.applicantGstin), val(data.coApplicantGstin), val(data.guarantorGstin));
if (data.udyamRegNo) {
  y += 2;
  y = row(doc, y, 'Udyam Registration No.', val(data.udyamRegNo));
}
y += 4;

// SECTION 2
y = sectionTitle(doc, y, 'Section 2 — Personal Details');
y = triHeader(doc, y);
y = triRow(doc, y, 'Full Name',
  fullName(data.applicantPersonal.firstName, data.applicantPersonal.middleName, data.applicantPersonal.lastName),
  fullName(data.coApplicantPersonal.firstName, data.coApplicantPersonal.middleName, data.coApplicantPersonal.lastName),
  fullName(data.guarantorPersonal.firstName, data.guarantorPersonal.middleName, data.guarantorPersonal.lastName));
y = triRow(doc, y, 'Gender', val(data.applicantPersonal.gender), val(data.coApplicantPersonal.gender), val(data.guarantorPersonal.gender));
y = triRow(doc, y, 'Date of Birth', val(data.applicantPersonal.dob), val(data.coApplicantPersonal.dob), val(data.guarantorPersonal.dob));
y = triRow(doc, y, "Father's Name",
  fullName(data.applicantPersonal.fatherFirstName, data.applicantPersonal.fatherMiddleName, data.applicantPersonal.fatherLastName),
  fullName(data.coApplicantPersonal.fatherFirstName, data.coApplicantPersonal.fatherMiddleName, data.coApplicantPersonal.fatherLastName),
  fullName(data.guarantorPersonal.fatherFirstName, data.guarantorPersonal.fatherMiddleName, data.guarantorPersonal.fatherLastName));
y = triRow(doc, y, "Mother's Name",
  fullName(data.applicantPersonal.motherFirstName, data.applicantPersonal.motherMiddleName, data.applicantPersonal.motherLastName),
  fullName(data.coApplicantPersonal.motherFirstName, data.coApplicantPersonal.motherMiddleName, data.coApplicantPersonal.motherLastName),
  fullName(data.guarantorPersonal.motherFirstName, data.guarantorPersonal.motherMiddleName, data.guarantorPersonal.motherLastName));
y = triRow(doc, y, 'Religion',
  val(data.applicantPersonal.religion.join(', ') || data.applicantPersonal.religionOther),
  val(data.coApplicantPersonal.religion.join(', ') || data.coApplicantPersonal.religionOther),
  val(data.guarantorPersonal.religion.join(', ') || data.guarantorPersonal.religionOther));
y = triRow(doc, y, 'Category',
  val(data.applicantPersonal.category.join(', ') || data.applicantPersonal.categoryOther),
  val(data.coApplicantPersonal.category.join(', ') || data.coApplicantPersonal.categoryOther),
  val(data.guarantorPersonal.category.join(', ') || data.guarantorPersonal.categoryOther));
y = triRow(doc, y, 'Preferred Language',
  val(data.applicantPersonal.preferredLanguage === 'Others' ? data.applicantPersonal.preferredLanguageOther : data.applicantPersonal.preferredLanguage),
  val(data.coApplicantPersonal.preferredLanguage === 'Others' ? data.coApplicantPersonal.preferredLanguageOther : data.coApplicantPersonal.preferredLanguage),
  val(data.guarantorPersonal.preferredLanguage === 'Others' ? data.guarantorPersonal.preferredLanguageOther : data.guarantorPersonal.preferredLanguage));
y += 4;

// SECTION 3
y = sectionTitle(doc, y, 'Section 3 — Address & Contact Details');
for (const { label, contact } of [
  { label: 'Applicant', contact: data.applicantContact },
  { label: 'Co-Applicant', contact: data.coApplicantContact },
  { label: 'Guarantor', contact: data.guarantorContact },
]) {
  y = subHeader(doc, y, label);
  const ca = contact.communicationAddress;
  const pa = contact.permanentSameAsCommunication ? ca : contact.permanentAddress;
  const commAddr = `${val(ca.fullAddress)}, Landmark: ${val(ca.landmark)}, ${val(ca.city)}, ${val(ca.district)}, ${val(ca.state)} - ${val(ca.pinCode)}`;
  const permAddr = contact.permanentSameAsCommunication
    ? 'Same as Communication Address'
    : `${val(pa.fullAddress)}, Landmark: ${val(pa.landmark)}, ${val(pa.city)}, ${val(pa.district)}, ${val(pa.state)} - ${val(pa.pinCode)}`;
  y = row(doc, y, 'Communication Address', commAddr);
  y = row(doc, y, 'Permanent Address', permAddr);
  y = row(doc, y, 'Mobile No.', contact.mobile);
  y = row(doc, y, 'Alternate Mobile', contact.alternateMobile || '-');
  y = row(doc, y, 'Email', contact.email || '-');
  y += 3;
}
y += 2;

// SECTION 4
y = sectionTitle(doc, y, 'Section 4 — Residence & Personal Information');
y = triHeader(doc, y);
y = triRow(doc, y, 'Residence', val(data.applicantResidence.residence), val(data.coApplicantResidence.residence), val(data.guarantorResidence.residence));
y = triRow(doc, y, 'Years of Stay', val(data.applicantResidence.yearsOfStay), val(data.coApplicantResidence.yearsOfStay), val(data.guarantorResidence.yearsOfStay));
y = triRow(doc, y, 'Marital Status', val(data.applicantResidence.maritalStatus), val(data.coApplicantResidence.maritalStatus), val(data.guarantorResidence.maritalStatus));
y = triRow(doc, y, 'No. of Dependents', val(data.applicantResidence.numberOfDependents), val(data.coApplicantResidence.numberOfDependents), val(data.guarantorResidence.numberOfDependents));
y = triRow(doc, y, 'Education',
  val(data.applicantResidence.education === 'Others' ? data.applicantResidence.educationOther : data.applicantResidence.education),
  val(data.coApplicantResidence.education === 'Others' ? data.coApplicantResidence.educationOther : data.coApplicantResidence.education),
  val(data.guarantorResidence.education === 'Others' ? data.guarantorResidence.educationOther : data.guarantorResidence.education));
y += 4;

// SECTION 5
y = sectionTitle(doc, y, 'Section 5 — Bank Account Details');
for (const { label, bank } of [
  { label: 'Applicant Bank', bank: data.applicantBank },
  { label: 'Co-Applicant Bank', bank: data.coApplicantBank },
]) {
  y = subHeader(doc, y, label);
  y = row(doc, y, 'Bank Name', bank.bankName);
  y = row(doc, y, 'Branch', bank.branch);
  y = row(doc, y, 'Account Type', bank.accountType);
  y = row(doc, y, 'Account No.', bank.accountNo);
  y = row(doc, y, 'Account Since', bank.accountSince);
  y = row(doc, y, 'IFSC Code', bank.ifscCode);
  y = row(doc, y, 'Avg. Debit/Month', currency(bank.avgDebitPerMonth));
  y = row(doc, y, 'Avg. Credit/Month', currency(bank.avgCreditPerMonth));
  y += 3;
}

// SECTION 6
y = sectionTitle(doc, y, 'Section 6 — Employment Details');
y = dualHeader(doc, y);
y = dualRow(doc, y, 'Establishment / Institution', data.applicantEmployment.establishmentName, data.coApplicantEmployment.establishmentName);
y = dualRow(doc, y, 'Designation', data.applicantEmployment.designation, data.coApplicantEmployment.designation);
y = dualRow(doc, y, 'Years of Employment', data.applicantEmployment.yearsOfEmployment, data.coApplicantEmployment.yearsOfEmployment);
y = dualRow(doc, y, 'CTC Per Annum', currency(data.applicantEmployment.ctcPerAnnum), currency(data.coApplicantEmployment.ctcPerAnnum));
y += 4;

// SECTION 7
y = sectionTitle(doc, y, 'Section 7 — Property Details');
let hasVehicle = false;
[
  { label: 'Applicant', vehicles: data.applicantVehiclesOwned },
  { label: 'Co-Applicant', vehicles: data.coApplicantVehiclesOwned },
].forEach(({ label, vehicles }) => {
  vehicles.forEach((v, i) => {
    if (v.vehicle || v.registrationNo || v.makeModel) {
      if (!hasVehicle) {
        y = subHeader(doc, y, 'Vehicles Owned');
        hasVehicle = true;
      }
      y = checkPage(doc, y, 28);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.text(`${label} Vehicle #${i + 1}`, ML + 2, y); y += SMALL_H;
      y = row(doc, y, '  Vehicle Type', val(v.vehicle));
      y = row(doc, y, '  Registration No.', val(v.registrationNo));
      y = row(doc, y, '  Make & Model', val(v.makeModel));
      y = row(doc, y, '  Declared Value', currency(v.declaredValue));
      y = row(doc, y, '  Financed By', val(v.financedBy));
      y += 2;
    }
  });
});

if (data.movablePropertyDescription) {
  y = subHeader(doc, y, 'Other Movable Property');
  y = row(doc, y, 'Description', data.movablePropertyDescription);
  y = row(doc, y, 'Total Value', currency(data.movablePropertyValue));
  y += 3;
}
data.immovableProperties.filter(p => p.assetType).forEach((p, i) => {
  if (i === 0) y = subHeader(doc, y, 'Immovable Property');
  y = checkPage(doc, y, 22);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.text(`Property #${i + 1}`, ML + 2, y); y += SMALL_H;
  y = row(doc, y, '  Asset Type', val(p.assetType === 'Others' ? p.assetTypeOther : p.assetType));
  y = row(doc, y, '  Built-up Area', val(p.builtUpArea));
  y = row(doc, y, '  Land Area / UDS', val(p.landArea));
  y = row(doc, y, '  Declared Value', currency(p.declaredValue));
  y += 2;
});
y += 2;

// SECTION 8 & 9
y = sectionTitle(doc, y, 'Section 8 & 9 — Photos & Document Checklist');
y = subHeader(doc, y, 'Vehicle Photos');
y = row(doc, y, 'Front View (Mandatory)', photos.frontView ? 'Submitted' : 'Not Submitted');
y = row(doc, y, 'Left Side View (Mandatory)', photos.leftSideView ? 'Submitted' : 'Not Submitted');
y = row(doc, y, 'Right Side View (Mandatory)', photos.rightSideView ? 'Submitted' : 'Not Submitted');
y = row(doc, y, 'Back View (Mandatory)', photos.backView ? 'Submitted' : 'Not Submitted');
y = row(doc, y, 'Additional Photos (Optional)', `${photos.others.filter(Boolean).length} of 5 submitted`);
y += 3;

y = subHeader(doc, y, 'KYC Document Verification');
const KYC_LABELS = { aadhaarCard: 'Aadhaar Card', panCard: 'PAN Card', passport: 'Passport', drivingLicence: 'Driving Licence', gasConnection: 'Gas Connection Card', waterBill: 'Water Bill', electricityBill: 'Electricity Bill', mobilePostpaidBill: 'Postpaid Mobile/Tel Bill', voterIdCard: 'Voter ID Card' };
const colW = (CW - 55) / 3;
doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
doc.text('Document', ML + 2, y);
doc.text('Applicant', ML + 57, y);
doc.text('Co-Applicant', ML + 57 + colW, y);
doc.text('Guarantor', ML + 57 + colW * 2, y);
doc.setLineWidth(0.1); doc.line(ML, y + 1, PW - MR, y + 1);
y += SMALL_H;
for (const [key, entry] of Object.entries(data.kycDocuments)) {
  y = checkPage(doc, y, SMALL_H + 1);
  const label = KYC_LABELS[key] ?? key;
  const aVal = entry.applicantChecked ? `Yes (${entry.applicantDocNo || 'No. not entered'})` : 'No';
  const caVal = entry.coApplicantChecked ? `Yes (${entry.coApplicantDocNo || 'No. not entered'})` : 'No';
  const gVal = entry.guarantorChecked ? `Yes (${entry.guarantorDocNo || 'No. not entered'})` : 'No';
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.text(label, ML + 2, y);
  doc.setFont('helvetica', 'normal'); doc.text(aVal, ML + 57, y); doc.text(caVal, ML + 57 + colW, y); doc.text(gVal, ML + 57 + colW * 2, y);
  y += SMALL_H;
}
y += 3;

y = subHeader(doc, y, 'Pre-Sanction Documents');
const PRE_LABELS = { proformaInvoice: 'Proforma Invoice & Margin Money receipt for new asset', saleDeedUsed: 'Sale deed for used asset', rcUsedAsset: 'RC for used asset / Original invoice for unregistrable asset', insurance: 'Comprehensive Insurance Policy', bankStatement: 'Bank statement (last 6 months)', itr: 'Last 2 years ITR (if income assessee)', nonIndividualDoc: "Non-individual entity's relevant document" };
for (const [key, label] of Object.entries(PRE_LABELS)) {
  y = row(doc, y, label, data.preSanctionDocs[key] ? 'Verified' : 'Pending');
}
if (data.preSanctionDocs.othersText) {
  y = row(doc, y, `Others: ${data.preSanctionDocs.othersText}`, 'Pending');
}
y += 3;

y = subHeader(doc, y, 'Post-Disbursement Documents');
y = row(doc, y, 'Original Invoice (new asset) with hypothecation', data.postDisbursementDocs.originalInvoiceNew ? 'Received' : 'Pending');
y = row(doc, y, 'Registration Certificate with hypothecation', data.postDisbursementDocs.rcHypothecation ? 'Received' : 'Pending');
y = row(doc, y, 'Insurance Policy with hypothecation', data.postDisbursementDocs.insuranceHypothecation ? 'Received' : 'Pending');
if (data.postDisbursementDocs.othersText) {
  y = row(doc, y, `Others: ${data.postDisbursementDocs.othersText}`, 'Pending');
}
y += 4;

// DECLARATION PAGE
doc.addPage();
y = 20;
y = sectionTitle(doc, y, 'Declaration by Applicant, Co-Applicant & Guarantor');
y += 2;
const declarationText = [
  'I/We, the undersigned, hereby declare and confirm the following:',
  '',
  '1. The information furnished in this loan application form is true, correct, and complete to the best of my/our knowledge and belief. No material information has been concealed or withheld.',
  '',
  '2. I/We authorize Boss Finance Consultancy to verify the information provided herein, including credit history, employment details, and other relevant data from appropriate sources.',
  '',
  '3. I/We understand that submission of this application does not guarantee loan approval. Boss Finance Consultancy reserves the right to reject any application without assigning reasons.',
  '',
  '4. I/We agree to abide by the terms and conditions of the loan agreement to be executed upon sanction, including repayment schedule, penal interest, and hypothecation obligations.',
  '',
  '5. I/We consent to the use and processing of my/our personal data as required for the evaluation and operation of this loan application, in accordance with applicable laws.',
  '',
  '6. The vehicle for which the loan is sought is/will be registered in the name of the Applicant, and the hypothecation shall be in favour of Boss Finance Consultancy until the loan is fully repaid.',
  '',
  '7. I/We shall maintain adequate insurance on the financed vehicle, with Boss Finance Consultancy noted as the hypothecatee, throughout the term of the loan.',
  '',
  '8. I/We acknowledge that any false statement or misrepresentation of facts will render this application null and void and may result in immediate recall of the loan amount.',
];
doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
for (const line of declarationText) {
  if (line === '') { y += 2; continue; }
  y = checkPage(doc, y, 8);
  const lines = doc.splitTextToSize(line, CW - 4);
  doc.text(lines, ML + 2, y);
  y += lines.length * 5;
}
y += 8;

y = sectionTitle(doc, y, 'Signatures & Date');
y += 4;
const signCols = [
  { label: 'Applicant', name: fullName(data.applicantPersonal.firstName, data.applicantPersonal.middleName, data.applicantPersonal.lastName) },
  { label: 'Co-Applicant', name: fullName(data.coApplicantPersonal.firstName, data.coApplicantPersonal.lastName) },
  { label: 'Guarantor', name: fullName(data.guarantorPersonal.firstName, data.guarantorPersonal.lastName) },
];
const sigColW = CW / 3;
signCols.forEach(({ label, name }, i) => {
  const x = ML + i * sigColW;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal'); doc.text(name, x, y + 5);
  doc.setLineWidth(0.3); doc.line(x, y + 18, x + sigColW - 4, y + 18);
  doc.setFontSize(6.5); doc.text('Signature / Thumb Impression', x, y + 22);
});
y += 28;

doc.setFontSize(8); doc.setFont('helvetica', 'normal');
doc.text('Date: ___________________', ML, y);
doc.text('Place: ___________________', ML + 70, y);
y += 14;

y = checkPage(doc, y, 30);
y = sectionTitle(doc, y, 'For Official Use Only — Filled by Employee');
y += 2;
doc.setFontSize(8); doc.setFont('helvetica', 'normal');
doc.text('Employee Name: _______________________________', ML, y);
doc.text('Date of Filing: _____________________________', ML + 100, y);
y += 8;
doc.text('Employee ID: ________________________________', ML, y);
doc.text("Employee's Signature: _______________________", ML + 100, y);
y += 10;
doc.text('Office Seal:', ML, y);
doc.setLineWidth(0.2); doc.rect(ML + 25, y - 4, 35, 20);
y += 26;

doc.setFontSize(7.5); doc.setFont('helvetica', 'italic');
const tnc = 'The loan will be subject to the Standard Terms and Conditions of Boss Finance Consultancy, a copy of which will be provided to the customer at the time of sanction. By signing above, the Applicant, Co-Applicant, and Guarantor confirm that they have read, understood, and agree to be bound by these terms.';
doc.text(doc.splitTextToSize(tnc, CW - 4), ML + 2, y);

// Add footers
addFooters(doc);

// Save
const outPath = path.join(__dirname, 'SampleVehicleLoan.pdf');
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
writeFileSync(outPath, pdfBuffer);
console.log('PDF saved to:', outPath);
