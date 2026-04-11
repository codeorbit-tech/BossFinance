import jsPDF from 'jspdf';
import { VehicleLoanFormData, PhotoUploads, KycDocEntry } from '../app/employee/loan-form/vehicle/types';

// ─── Page Constants ───
const PW = 210;
const PH = 297;
const ML = 15;
const MR = 15;
const CW = PW - ML - MR;
const LINE_H = 6;       // normal line height
const SMALL_H = 5;      // smaller line height

type Doc = jsPDF;

// ─── Helpers ───
function val(v: string | undefined | null): string {
  if (!v || v.trim() === '') return '-';
  return v.trim();
}

function currency(v: string | undefined | null): string {
  if (!v || isNaN(Number(v))) return '-';
  return 'Rs. ' + parseInt(v).toLocaleString('en-IN');
}

function fullName(...parts: (string | undefined)[]): string {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined || '-';
}

/** Check if we need a new page and return new y */
function checkPage(doc: Doc, y: number, needed = 15): number {
  if (y + needed > PH - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

/** Print a horizontal divider line */
function divider(doc: Doc, y: number): number {
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(ML, y, PW - MR, y);
  return y + 3;
}

/** Section title (bold, underlined) */
function sectionTitle(doc: Doc, y: number, text: string): number {
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

/** Sub-header (bold, smaller) */
function subHeader(doc: Doc, y: number, text: string): number {
  y = checkPage(doc, y, 8);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(text, ML, y);
  return y + LINE_H;
}

/** Single label: value line */
function row(doc: Doc, y: number, label: string, value: string): number {
  y = checkPage(doc, y, SMALL_H + 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(label + ':', ML + 2, y);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(value, CW - 55);
  doc.text(lines, ML + 55, y);
  return y + Math.max(lines.length * SMALL_H, SMALL_H);
}

/** Three-column row for Applicant / Co-Applicant / Guarantor */
function triRow(doc: Doc, y: number, label: string, a: string, ca: string, g: string): number {
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

/** Three-column header for Applicant / Co-Applicant / Guarantor */
function triHeader(doc: Doc, y: number): number {
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

/** Two-column row for Applicant / Co-Applicant */
function dualRow(doc: Doc, y: number, label: string, a: string, ca: string): number {
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

/** Two-column header */
function dualHeader(doc: Doc, y: number): number {
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

/** Draw page footer */
function drawFooter(doc: Doc, pageNum: number, totalPages: number): void {
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

function addFooters(doc: Doc): void {
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(doc, i, total);
  }
}

// ─── COVER HEADER ───
function drawCoverHeader(doc: Doc, formData: VehicleLoanFormData): number {
  let y = 18;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('BOSS FINANCE CONSULTANCY', ML, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('YOUR FINANCIAL PARTNER', ML, y);
  y += 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE LOAN APPLICATION FORM', PW - MR, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Form No: ${val(formData.applicationFormNo)}`, PW - MR, 24, { align: 'right' });
  doc.text(`Date: ${val(formData.applicationDate)}`, PW - MR, 30, { align: 'right' });
  y = 35;
  return divider(doc, y) + 2;
}

// ─── SECTION 1: Application Info ───
function drawSection1(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 1 — Application Information');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Entity Type', val(data.applicantEntityType), val(data.coApplicantEntityType), val(data.guarantorEntityType));
  y = triRow(doc, y, 'CKYC ID', val(data.applicantCkycId), val(data.coApplicantCkycId), val(data.guarantorCkycId));
  y = triRow(doc, y, 'GSTIN', val(data.applicantGstin), val(data.coApplicantGstin), val(data.guarantorGstin));
  if (data.udyamRegNo) {
    y += 2;
    y = row(doc, y, 'Udyam Registration No.', val(data.udyamRegNo));
  }
  return y + 4;
}

// ─── SECTION 2: Personal Details ───
function drawSection2(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 2 — Personal Details');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Full Name',
    fullName(data.applicantPersonal.firstName, data.applicantPersonal.middleName, data.applicantPersonal.lastName),
    fullName(data.coApplicantPersonal.firstName, data.coApplicantPersonal.middleName, data.coApplicantPersonal.lastName),
    fullName(data.guarantorPersonal.firstName, data.guarantorPersonal.middleName, data.guarantorPersonal.lastName),
  );
  y = triRow(doc, y, 'Gender', val(data.applicantPersonal.gender), val(data.coApplicantPersonal.gender), val(data.guarantorPersonal.gender));
  y = triRow(doc, y, 'Date of Birth', val(data.applicantPersonal.dob), val(data.coApplicantPersonal.dob), val(data.guarantorPersonal.dob));
  y = triRow(doc, y, "Father's Name",
    fullName(data.applicantPersonal.fatherFirstName, data.applicantPersonal.fatherMiddleName, data.applicantPersonal.fatherLastName),
    fullName(data.coApplicantPersonal.fatherFirstName, data.coApplicantPersonal.fatherMiddleName, data.coApplicantPersonal.fatherLastName),
    fullName(data.guarantorPersonal.fatherFirstName, data.guarantorPersonal.fatherMiddleName, data.guarantorPersonal.fatherLastName),
  );
  y = triRow(doc, y, "Mother's Name",
    fullName(data.applicantPersonal.motherFirstName, data.applicantPersonal.motherMiddleName, data.applicantPersonal.motherLastName),
    fullName(data.coApplicantPersonal.motherFirstName, data.coApplicantPersonal.motherMiddleName, data.coApplicantPersonal.motherLastName),
    fullName(data.guarantorPersonal.motherFirstName, data.guarantorPersonal.motherMiddleName, data.guarantorPersonal.motherLastName),
  );
  y = triRow(doc, y, 'Religion',
    val(data.applicantPersonal.religion.join(', ') || data.applicantPersonal.religionOther),
    val(data.coApplicantPersonal.religion.join(', ') || data.coApplicantPersonal.religionOther),
    val(data.guarantorPersonal.religion.join(', ') || data.guarantorPersonal.religionOther),
  );
  y = triRow(doc, y, 'Category',
    val(data.applicantPersonal.category.join(', ') || data.applicantPersonal.categoryOther),
    val(data.coApplicantPersonal.category.join(', ') || data.coApplicantPersonal.categoryOther),
    val(data.guarantorPersonal.category.join(', ') || data.guarantorPersonal.categoryOther),
  );
  y = triRow(doc, y, 'Preferred Language',
    val(data.applicantPersonal.preferredLanguage === 'Others' ? data.applicantPersonal.preferredLanguageOther : data.applicantPersonal.preferredLanguage),
    val(data.coApplicantPersonal.preferredLanguage === 'Others' ? data.coApplicantPersonal.preferredLanguageOther : data.coApplicantPersonal.preferredLanguage),
    val(data.guarantorPersonal.preferredLanguage === 'Others' ? data.guarantorPersonal.preferredLanguageOther : data.guarantorPersonal.preferredLanguage),
  );
  return y + 4;
}

// ─── SECTION 3: Address & Contact ───
function drawSection3(doc: Doc, y: number, data: VehicleLoanFormData): number {
  const parties = [
    { label: 'Applicant', contact: data.applicantContact },
    { label: 'Co-Applicant', contact: data.coApplicantContact },
    { label: 'Guarantor', contact: data.guarantorContact },
  ];

  y = sectionTitle(doc, y, 'Section 3 — Address & Contact Details');

  for (const { label, contact } of parties) {
    y = subHeader(doc, y, label);
    const ca = contact.communicationAddress;
    const pa = contact.permanentSameAsCommunication ? contact.communicationAddress : contact.permanentAddress;

    const commAddr = `${val(ca.fullAddress)}, Landmark: ${val(ca.landmark)}, ${val(ca.city)}, ${val(ca.district)}, ${val(ca.state)} - ${val(ca.pinCode)}`;
    const permAddr = contact.permanentSameAsCommunication
      ? 'Same as Communication Address'
      : `${val(pa.fullAddress)}, Landmark: ${val(pa.landmark)}, ${val(pa.city)}, ${val(pa.district)}, ${val(pa.state)} - ${val(pa.pinCode)}`;

    y = row(doc, y, 'Communication Address', commAddr);
    y = row(doc, y, 'Permanent Address', permAddr);
    y = row(doc, y, 'Mobile No.', val(contact.mobile));
    y = row(doc, y, 'Alternate Mobile', val(contact.alternateMobile));
    y = row(doc, y, 'Email', val(contact.email));
    y += 3;
  }
  return y + 2;
}

// ─── SECTION 4: Residence Info ───
function drawSection4(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 4 — Residence & Personal Information');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Residence', val(data.applicantResidence.residence), val(data.coApplicantResidence.residence), val(data.guarantorResidence.residence));
  y = triRow(doc, y, 'Years of Stay', val(data.applicantResidence.yearsOfStay), val(data.coApplicantResidence.yearsOfStay), val(data.guarantorResidence.yearsOfStay));
  y = triRow(doc, y, 'Marital Status', val(data.applicantResidence.maritalStatus), val(data.coApplicantResidence.maritalStatus), val(data.guarantorResidence.maritalStatus));
  y = triRow(doc, y, 'No. of Dependents', val(data.applicantResidence.numberOfDependents), val(data.coApplicantResidence.numberOfDependents), val(data.guarantorResidence.numberOfDependents));
  y = triRow(doc, y, 'Education',
    val(data.applicantResidence.education === 'Others' ? data.applicantResidence.educationOther : data.applicantResidence.education),
    val(data.coApplicantResidence.education === 'Others' ? data.coApplicantResidence.educationOther : data.coApplicantResidence.education),
    val(data.guarantorResidence.education === 'Others' ? data.guarantorResidence.educationOther : data.guarantorResidence.education),
  );
  return y + 4;
}

// ─── SECTION 5: Bank Details ───
function drawSection5(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 5 — Bank Account Details');

  const drawBank = (label: string, bank: typeof data.applicantBank): number => {
    y = subHeader(doc, y, label);
    y = row(doc, y, 'Bank Name', val(bank.bankName));
    y = row(doc, y, 'Branch', val(bank.branch));
    y = row(doc, y, 'Account Type', val(bank.accountType));
    y = row(doc, y, 'Account No.', val(bank.accountNo));
    y = row(doc, y, 'Account Since', val(bank.accountSince));
    y = row(doc, y, 'IFSC Code', val(bank.ifscCode));
    y = row(doc, y, 'Avg. Debit/Month', currency(bank.avgDebitPerMonth));
    y = row(doc, y, 'Avg. Credit/Month', currency(bank.avgCreditPerMonth));
    return y + 3;
  };

  y = drawBank('Applicant Bank', data.applicantBank);
  y = drawBank('Co-Applicant Bank', data.coApplicantBank);
  return y + 2;
}

// ─── SECTION 6: Employment ───
function drawSection6(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 6 — Employment Details');
  y = dualHeader(doc, y);
  y = dualRow(doc, y, 'Establishment / Institution', val(data.applicantEmployment.establishmentName), val(data.coApplicantEmployment.establishmentName));
  y = dualRow(doc, y, 'Designation', val(data.applicantEmployment.designation), val(data.coApplicantEmployment.designation));
  y = dualRow(doc, y, 'Years of Employment', val(data.applicantEmployment.yearsOfEmployment), val(data.coApplicantEmployment.yearsOfEmployment));
  y = dualRow(doc, y, 'CTC Per Annum', currency(data.applicantEmployment.ctcPerAnnum), currency(data.coApplicantEmployment.ctcPerAnnum));
  return y + 4;
}

// ─── SECTION 7: Property Details ───
function drawSection7(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 7 — Property Details');

  // Vehicles Owned
  const parties = [
    { label: 'Applicant', vehicles: data.applicantVehiclesOwned },
    { label: 'Co-Applicant', vehicles: data.coApplicantVehiclesOwned },
  ];

  let hasVehicle = false;
  for (const { label, vehicles } of parties) {
    vehicles.forEach((v, i) => {
      if (v.vehicle || v.registrationNo || v.makeModel) {
        if (!hasVehicle) {
          y = subHeader(doc, y, 'Vehicles Owned');
          hasVehicle = true;
        }
        y = checkPage(doc, y, 30);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`${label} Vehicle #${i + 1}`, ML + 2, y);
        y += SMALL_H;
        y = row(doc, y, '  Vehicle Type', val(v.vehicle));
        y = row(doc, y, '  Registration No.', val(v.registrationNo));
        y = row(doc, y, '  Make & Model', val(v.makeModel));
        y = row(doc, y, '  Declared Value', currency(v.declaredValue));
        y = row(doc, y, '  Financed By', val(v.financedBy));
        y += 2;
      }
    });
  }

  // Movable Property
  if (data.movablePropertyDescription) {
    y = subHeader(doc, y, 'Other Movable Property');
    y = row(doc, y, 'Description', val(data.movablePropertyDescription));
    y = row(doc, y, 'Total Value', currency(data.movablePropertyValue));
    y += 3;
  }

  // Immovable Property
  const immRows = data.immovableProperties.filter(p => p.assetType);
  if (immRows.length > 0) {
    y = subHeader(doc, y, 'Immovable Property');
    immRows.forEach((p, i) => {
      y = checkPage(doc, y, 22);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Property #${i + 1}`, ML + 2, y);
      y += SMALL_H;
      y = row(doc, y, '  Asset Type', val(p.assetType === 'Others' ? p.assetTypeOther : p.assetType));
      y = row(doc, y, '  Built-up Area', val(p.builtUpArea));
      y = row(doc, y, '  Land Area / UDS', val(p.landArea));
      y = row(doc, y, '  Declared Value', currency(p.declaredValue));
      y += 2;
    });
  }

  return y + 2;
}

// ─── SECTION 8 & 9: Photos & Document Checklist ───
function drawSection8(doc: Doc, y: number, data: VehicleLoanFormData, photos: PhotoUploads): number {
  y = sectionTitle(doc, y, 'Section 8 & 9 — Photos & Document Checklist');

  // Photo status
  y = subHeader(doc, y, 'Vehicle Photos');
  const photoRows = [
    { label: 'Front View (Mandatory)', uploaded: !!photos.frontView },
    { label: 'Left Side View (Mandatory)', uploaded: !!photos.leftSideView },
    { label: 'Right Side View (Mandatory)', uploaded: !!photos.rightSideView },
    { label: 'Back View (Mandatory)', uploaded: !!photos.backView },
  ];
  photoRows.forEach(p => {
    y = row(doc, y, p.label, p.uploaded ? 'Submitted' : 'Not Submitted');
  });
  const optionalCount = photos.others.filter(Boolean).length;
  y = row(doc, y, 'Additional Photos (Optional)', `${optionalCount} of 5 submitted`);
  y += 3;

  // KYC Documents
  const KYC_LABELS: Record<string, string> = {
    aadhaarCard: 'Aadhaar Card',
    panCard: 'PAN Card',
    passport: 'Passport',
    drivingLicence: 'Driving Licence',
    gasConnection: 'Gas Connection Card',
    waterBill: 'Water Bill',
    electricityBill: 'Electricity Bill',
    mobilePostpaidBill: 'Postpaid Mobile/Tel Bill',
    voterIdCard: 'Voter ID Card',
  };

  y = subHeader(doc, y, 'KYC Document Verification');

  // Header
  const colW = (CW - 55) / 3;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Document', ML + 2, y);
  doc.text('Applicant', ML + 57, y);
  doc.text('Co-Applicant', ML + 57 + colW, y);
  doc.text('Guarantor', ML + 57 + colW * 2, y);
  doc.setLineWidth(0.1);
  doc.line(ML, y + 1, PW - MR, y + 1);
  y += SMALL_H;

  Object.entries(data.kycDocuments).forEach(([key, entry]: [string, KycDocEntry]) => {
    y = checkPage(doc, y, SMALL_H + 1);
    const label = KYC_LABELS[key] ?? key;
    const aVal = entry.applicantChecked ? `Yes (${entry.applicantDocNo || 'No. not entered'})` : 'No';
    const caVal = entry.coApplicantChecked ? `Yes (${entry.coApplicantDocNo || 'No. not entered'})` : 'No';
    const gVal = entry.guarantorChecked ? `Yes (${entry.guarantorDocNo || 'No. not entered'})` : 'No';
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(label, ML + 2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(aVal, ML + 57, y);
    doc.text(caVal, ML + 57 + colW, y);
    doc.text(gVal, ML + 57 + colW * 2, y);
    y += SMALL_H;
  });
  y += 3;

  // Pre-Sanction Docs
  y = subHeader(doc, y, 'Pre-Sanction Documents');
  const PRE_LABELS: Record<string, string> = {
    proformaInvoice: 'Proforma Invoice & Margin Money receipt for new asset',
    saleDeedUsed: 'Sale deed for used asset',
    rcUsedAsset: 'RC for used asset / Original invoice for unregistrable asset',
    insurance: 'Comprehensive Insurance Policy',
    bankStatement: 'Bank statement (last 6 months)',
    itr: 'Last 2 years ITR (if income assessee)',
    nonIndividualDoc: "Non-individual entity's relevant document",
  };
  Object.entries(PRE_LABELS).forEach(([key, label]) => {
    const status = (data.preSanctionDocs as any)[key] ? 'Verified' : 'Pending';
    y = row(doc, y, label, status);
  });
  if (data.preSanctionDocs.othersText) {
    y = row(doc, y, `Others: ${data.preSanctionDocs.othersText}`, 'Pending');
  }
  y += 3;

  // Post-Disbursement Docs
  y = subHeader(doc, y, 'Post-Disbursement Documents');
  y = row(doc, y, 'Original Invoice (new asset) with hypothecation', data.postDisbursementDocs.originalInvoiceNew ? 'Received' : 'Pending');
  y = row(doc, y, 'Registration Certificate with hypothecation', data.postDisbursementDocs.rcHypothecation ? 'Received' : 'Pending');
  y = row(doc, y, 'Insurance Policy with hypothecation', data.postDisbursementDocs.insuranceHypothecation ? 'Received' : 'Pending');
  if (data.postDisbursementDocs.othersText) {
    y = row(doc, y, `Others: ${data.postDisbursementDocs.othersText}`, 'Pending');
  }

  return y + 4;
}

// ─── DECLARATION PAGE ───
function drawDeclarationPage(doc: Doc, data: VehicleLoanFormData): void {
  doc.addPage();
  let y = 20;

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

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  for (const line of declarationText) {
    if (line === '') {
      y += 2;
      continue;
    }
    y = checkPage(doc, y, 8);
    const lines = doc.splitTextToSize(line, CW - 4);
    doc.text(lines, ML + 2, y);
    y += lines.length * 5;
  }

  y += 8;

  // Signatures
  y = sectionTitle(doc, y, 'Signatures & Date');
  y += 4;

  const signCols = [
    { label: 'Applicant', name: fullName(data.applicantPersonal.firstName, data.applicantPersonal.middleName, data.applicantPersonal.lastName) },
    { label: 'Co-Applicant', name: fullName(data.coApplicantPersonal.firstName, data.coApplicantPersonal.middleName, data.coApplicantPersonal.lastName) },
    { label: 'Guarantor', name: fullName(data.guarantorPersonal.firstName, data.guarantorPersonal.middleName, data.guarantorPersonal.lastName) },
  ];

  const colW = CW / 3;
  signCols.forEach(({ label, name }, i) => {
    const x = ML + i * colW;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(name, x, y + 5);
    doc.setLineWidth(0.3);
    doc.line(x, y + 18, x + colW - 4, y + 18);
    doc.setFontSize(6.5);
    doc.text('Signature / Thumb Impression', x, y + 22);
  });
  y += 28;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Date: ___________________', ML, y);
  doc.text('Place: ___________________', ML + 70, y);
  y += 14;

  // Employee section
  y = checkPage(doc, y, 30);
  y = sectionTitle(doc, y, 'For Official Use Only — Filled by Employee');
  y += 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Employee Name: _______________________________', ML, y);
  doc.text('Date of Filing: _____________________________', ML + 100, y);
  y += 8;
  doc.text('Employee ID: ________________________________', ML, y);
  doc.text("Employee's Signature: _______________________", ML + 100, y);
  y += 10;
  doc.text('Office Seal:', ML, y);
  doc.setLineWidth(0.2);
  doc.rect(ML + 25, y - 4, 35, 20);
  y += 26;

  // Terms note
  y = checkPage(doc, y, 15);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  const tnc = 'The loan will be subject to the Standard Terms and Conditions of Boss Finance Consultancy, a copy of which will be provided to the customer at the time of sanction. By signing above, the Applicant, Co-Applicant, and Guarantor confirm that they have read, understood, and agree to be bound by these terms.';
  const tncLines = doc.splitTextToSize(tnc, CW - 4);
  doc.text(tncLines, ML + 2, y);
}

// ─── MAIN EXPORT FUNCTION ───
export async function generateVehicleLoanPDF(
  formData: VehicleLoanFormData,
  photos: PhotoUploads,
  employeeName?: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = drawCoverHeader(doc, formData);

  y = drawSection1(doc, y, formData);
  y = drawSection2(doc, y, formData);
  y = drawSection3(doc, y, formData);
  y = drawSection4(doc, y, formData);
  y = drawSection5(doc, y, formData);
  y = drawSection6(doc, y, formData);
  y = drawSection7(doc, y, formData);
  y = drawSection8(doc, y, formData, photos);

  drawDeclarationPage(doc, formData);

  addFooters(doc);

  const fileName = `VehicleLoan_${formData.applicationFormNo}_${formData.applicationDate.replace(/-/g, '')}.pdf`;
  doc.save(fileName);
}
