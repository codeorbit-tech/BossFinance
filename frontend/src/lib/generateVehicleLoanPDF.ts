import jsPDF from 'jspdf';
import { VehicleLoanFormData, PhotoUploads, KycDocEntry } from '../app/employee/loan-form/vehicle/types';
import { drawFinanceAnnexures } from './financePdfAnnexures';

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

/** Single label: value line with wrapping for both */
function row(doc: Doc, y: number, label: string, value: string): number {
  const labelW = 55;
  const valueW = CW - labelW - 5;
  const labelLines = doc.splitTextToSize(label + ':', labelW);
  const valueLines = doc.splitTextToSize(value, valueW);
  const maxLines = Math.max(labelLines.length, valueLines.length);
  const h = maxLines * SMALL_H;

  y = checkPage(doc, y, h + 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(labelLines, ML + 2, y);
  
  doc.setFont('helvetica', 'normal');
  doc.text(valueLines, ML + labelW + 5, y);
  
  return y + h + 2;
}

/** Three-column row for Applicant / Co-Applicant / Guarantor */
function triRow(doc: Doc, y: number, label: string, a: string, ca: string, g: string): number {
  const labelW = 45;
  const colW = (CW - labelW) / 3;
  const labelLines = doc.splitTextToSize(label, labelW - 2);
  const aLines = doc.splitTextToSize(a, colW - 2);
  const caLines = doc.splitTextToSize(ca, colW - 2);
  const gLines = doc.splitTextToSize(g, colW - 2);
  const maxLines = Math.max(labelLines.length, aLines.length, caLines.length, gLines.length);
  const h = maxLines * SMALL_H;

  y = checkPage(doc, y, h + 1);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(labelLines, ML + 2, y);
  
  doc.setFont('helvetica', 'normal');
  doc.text(aLines, ML + labelW + 2, y);
  doc.text(caLines, ML + labelW + 2 + colW, y);
  doc.text(gLines, ML + labelW + 2 + colW * 2, y);
  
  return y + h + 1;
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
  const labelW = 55;
  const colW = (CW - labelW) / 2;
  const labelLines = doc.splitTextToSize(label, labelW - 2);
  const aLines = doc.splitTextToSize(a, colW - 2);
  const caLines = doc.splitTextToSize(ca, colW - 2);
  const maxLines = Math.max(labelLines.length, aLines.length, caLines.length);
  const h = maxLines * SMALL_H;

  y = checkPage(doc, y, h + 1);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(labelLines, ML + 2, y);
  
  doc.setFont('helvetica', 'normal');
  doc.text(aLines, ML + labelW + 2, y);
  doc.text(caLines, ML + labelW + 2 + colW, y);
  
  return y + h + 1;
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

interface LoadedPhoto {
  data: string;
  width: number;
  height: number;
  ratio: number;
}

async function loadPhoto(file: File): Promise<LoadedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('No context'); return; }
        ctx.drawImage(img, 0, 0);
        resolve({
          data: canvas.toDataURL('image/jpeg', 0.8),
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalHeight / img.naturalWidth,
        });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadStaticImage(url: string): Promise<LoadedPhoto | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], 'image.png', { type: 'image/png' });
    return await loadPhoto(file);
  } catch (e) {
    return null;
  }
}

// ─── COVER HEADER ───
async function drawCoverHeader(doc: Doc, formData: VehicleLoanFormData, logo?: LoadedPhoto | null, applicantPhoto?: LoadedPhoto | null): Promise<number> {
  let y = 15;
  
  // 1. Logo
  if (logo) {
    const logoW = 35;
    const logoH = logoW * logo.ratio;
    doc.addImage(logo.data, 'PNG', ML, y, logoW, logoH);
  }

  // 2. Applicant Photo
  if (applicantPhoto) {
    const photoW = 30;
    const photoH = 40;
    doc.setDrawColor(220);
    doc.rect(PW - MR - photoW, y, photoW, photoH);
    doc.addImage(applicantPhoto.data, 'JPEG', PW - MR - photoW + 1, y + 1, photoW - 2, photoH - 2);
    doc.setFontSize(6);
    doc.setTextColor(100);
    doc.text('APPLICANT PHOTO', PW - MR - photoW/2, y + photoH + 4, { align: 'center' });
  }

  y = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('BOSS FINANCE CONSULTANCY', ML + 45, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('YOUR FINANCIAL PARTNER', ML + 45, y);
  
  y = 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE LOAN APPLICATION FORM', ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Form No: ${val(formData.applicationFormNo)}`, PW - MR - 35, y, { align: 'right' });
  doc.text(`Date: ${val(formData.applicationDate)}`, PW - MR - 35, y + 5, { align: 'right' });
  
  y = 52;
  return divider(doc, y) + 2;
}

// ─── SECTION 1: Application Info ───
function drawSection1(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 1 — Primary Identification');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Full Name', 
    fullName(data.applicantPersonal.firstName, data.applicantPersonal.lastName),
    fullName(data.coApplicantPersonal.firstName, data.coApplicantPersonal.lastName),
    fullName(data.guarantorPersonal.firstName, data.guarantorPersonal.lastName)
  );
  y = triRow(doc, y, "Father's Name", 
    fullName(data.applicantPersonal.fatherFirstName, data.applicantPersonal.fatherLastName),
    fullName(data.coApplicantPersonal.fatherFirstName, data.coApplicantPersonal.fatherLastName),
    fullName(data.guarantorPersonal.fatherFirstName, data.guarantorPersonal.fatherLastName)
  );
  y = triRow(doc, y, 'Mobile No', val(data.applicantContact.mobile), val(data.coApplicantContact.mobile), val(data.guarantorContact.mobile));
  y = triRow(doc, y, 'Entity Type', val(data.applicantEntityType), val(data.coApplicantEntityType), val(data.guarantorEntityType));
  y = triRow(doc, y, 'CKYC ID', val(data.applicantCkycId), val(data.coApplicantCkycId), val(data.guarantorCkycId));
  y = triRow(doc, y, 'GSTIN', val(data.applicantGstin), val(data.coApplicantGstin), val(data.guarantorGstin));
  
  if (data.udyamRegNo) {
    y = row(doc, y, 'Udyam Registration No.', val(data.udyamRegNo));
  }
  return y + 4;
}

// ─── SECTION 2: KYC & Compliance ───
function drawSection2(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 2 — KYC Verification');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Aadhaar Card', 
    val(data.kycDocuments.aadhaarCard.applicantDocNo), 
    val(data.kycDocuments.aadhaarCard.coApplicantDocNo), 
    val(data.kycDocuments.aadhaarCard.guarantorDocNo)
  );
  y = triRow(doc, y, 'PAN Card', 
    val(data.kycDocuments.panCard.applicantDocNo), 
    val(data.kycDocuments.panCard.coApplicantDocNo), 
    val(data.kycDocuments.panCard.guarantorDocNo)
  );
  return y + 4;
}

// ─── SECTION 3: Loan Details ───
function drawSection3(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 3 — Loan Request Details');
  y = row(doc, y, 'Requested Loan Amount', currency(data.loanDetails.loanAmount));
  y = row(doc, y, 'Tenure (Months)', val(data.loanDetails.tenure));
  y = row(doc, y, 'Interest Rate (% p.a.)', val(data.loanDetails.interestRate) + ' %');
  y = row(doc, y, 'Estimated EMI', currency(data.loanDetails.emi));
  return y + 4;
}

// ─── SECTION 4: Personal Details ───
function drawSection4(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 4 — Personal Demographic Details');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Gender', val(data.applicantPersonal.gender), val(data.coApplicantPersonal.gender), val(data.guarantorPersonal.gender));
  y = triRow(doc, y, 'Date of Birth', val(data.applicantPersonal.dob), val(data.coApplicantPersonal.dob), val(data.guarantorPersonal.dob));
  y = triRow(doc, y, 'Religion',
    val(data.applicantPersonal.religion === 'Others' ? data.applicantPersonal.religionOther : data.applicantPersonal.religion),
    val(data.coApplicantPersonal.religion === 'Others' ? data.coApplicantPersonal.religionOther : data.coApplicantPersonal.religion),
    val(data.guarantorPersonal.religion === 'Others' ? data.guarantorPersonal.religionOther : data.guarantorPersonal.religion),
  );
  y = triRow(doc, y, 'Category',
    val(data.applicantPersonal.category === 'Others' ? data.applicantPersonal.categoryOther : data.applicantPersonal.category),
    val(data.coApplicantPersonal.category === 'Others' ? data.coApplicantPersonal.categoryOther : data.coApplicantPersonal.category),
    val(data.guarantorPersonal.category === 'Others' ? data.guarantorPersonal.categoryOther : data.guarantorPersonal.category),
  );
  y = triRow(doc, y, 'Preferred Language',
    val(data.applicantPersonal.preferredLanguage === 'Others' ? data.applicantPersonal.preferredLanguageOther : data.applicantPersonal.preferredLanguage),
    val(data.coApplicantPersonal.preferredLanguage === 'Others' ? data.coApplicantPersonal.preferredLanguageOther : data.coApplicantPersonal.preferredLanguage),
    val(data.guarantorPersonal.preferredLanguage === 'Others' ? data.guarantorPersonal.preferredLanguageOther : data.guarantorPersonal.preferredLanguage),
  );
  return y + 4;
}

// ─── SECTION 5: Address & Contact ───
function drawSection5(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 5 — Address & Contact Details');
  const parties = [
    { label: 'Applicant', contact: data.applicantContact },
    { label: 'Co-Applicant', contact: data.coApplicantContact },
    { label: 'Guarantor', contact: data.guarantorContact },
  ];

  for (const { label, contact } of parties) {
    y = subHeader(doc, y, label);
    const ca = contact.communicationAddress;
    const pa = contact.permanentSameAsCommunication ? contact.communicationAddress : contact.permanentAddress;

    const commAddr = `${val(ca.fullAddress)}, ${val(ca.city)}, ${val(ca.district)}, ${val(ca.state)} - ${val(ca.pinCode)}`;
    const permAddr = contact.permanentSameAsCommunication
      ? 'Same as Communication Address'
      : `${val(pa.fullAddress)}, ${val(pa.city)}, ${val(pa.district)}, ${val(pa.state)} - ${val(pa.pinCode)}`;

    y = row(doc, y, 'Communication Address', commAddr);
    y = row(doc, y, 'Permanent Address', permAddr);
    y = row(doc, y, 'Contact No.', val(contact.mobile) + (contact.alternateMobile ? ` / ${contact.alternateMobile}` : ''));
    y = row(doc, y, 'Email', val(contact.email));
    y += 2;
  }
  return y + 4;
}

// ─── SECTION 6: Residence ───
function drawSection6(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 6 — Residence & Family Status');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Residence Ownership', val(data.applicantResidence.residence), val(data.coApplicantResidence.residence), val(data.guarantorResidence.residence));
  y = triRow(doc, y, 'Years of Stay', val(data.applicantResidence.yearsOfStay), val(data.coApplicantResidence.yearsOfStay), val(data.guarantorResidence.yearsOfStay));
  y = triRow(doc, y, 'Marital Status', val(data.applicantResidence.maritalStatus), val(data.coApplicantResidence.maritalStatus), val(data.guarantorResidence.maritalStatus));
  y = triRow(doc, y, 'No. of Dependents', val(data.applicantResidence.numberOfDependents), val(data.coApplicantResidence.numberOfDependents), val(data.guarantorResidence.numberOfDependents));
  y = triRow(doc, y, 'Highest Education',
    val(data.applicantResidence.education === 'Others' ? data.applicantResidence.educationOther : data.applicantResidence.education),
    val(data.coApplicantResidence.education === 'Others' ? data.coApplicantResidence.educationOther : data.coApplicantResidence.education),
    val(data.guarantorResidence.education === 'Others' ? data.guarantorResidence.educationOther : data.guarantorResidence.education),
  );
  return y + 4;
}

// ─── SECTION 7: Bank Details ───
function drawSection7(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 7 — Bank Account Details');

  const drawBank = (yIn: number, label: string, bank: typeof data.applicantBank): number => {
    let yy = subHeader(doc, yIn, label);
    yy = row(doc, yy, 'Bank & Branch', `${val(bank.bankName)} (${val(bank.branch)})`);
    yy = row(doc, yy, 'Account Info', `${val(bank.accountNo)} [${val(bank.accountType)}]`);
    yy = row(doc, yy, 'IFSC Code', val(bank.ifscCode));
    yy = row(doc, yy, 'Avg Business/Month', `Debit: ${currency(bank.avgDebitPerMonth)} | Credit: ${currency(bank.avgCreditPerMonth)}`);
    return yy + 2;
  };

  y = drawBank(y, 'Applicant Banking', data.applicantBank);
  y = drawBank(y, 'Co-Applicant Banking', data.coApplicantBank);
  return y + 4;
}

// ─── SECTION 8: Employment ───
function drawSection8(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 8 — Employment Details');
  y = dualHeader(doc, y);
  y = dualRow(doc, y, 'Organization Name', val(data.applicantEmployment.establishmentName), val(data.coApplicantEmployment.establishmentName));
  y = dualRow(doc, y, 'Current Designation', val(data.applicantEmployment.designation), val(data.coApplicantEmployment.designation));
  y = dualRow(doc, y, 'Experience (Years)', val(data.applicantEmployment.yearsOfEmployment), val(data.coApplicantEmployment.yearsOfEmployment));
  y = dualRow(doc, y, 'Annual CTC', currency(data.applicantEmployment.ctcPerAnnum), currency(data.coApplicantEmployment.ctcPerAnnum));
  return y + 4;
}

// ─── SECTION 9: Property ───
function drawSection9(doc: Doc, y: number, data: VehicleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 9 — Existing Asset Portfolio');
  if (data.movablePropertyDescription) {
    y = subHeader(doc, y, 'Other Movable Assets');
    y = row(doc, y, 'Description', val(data.movablePropertyDescription));
    y = row(doc, y, 'Total Value', currency(data.movablePropertyValue));
  }
  const imm = data.immovableProperties.filter(p => p.assetType);
  if (imm.length > 0) {
    y = subHeader(doc, y, 'Immovable Properties');
    for (let i = 0; i < imm.length; i++) {
      const p = imm[i];
      y = row(doc, y, `Property #${i+1} Type`, val(p.assetType === 'Others' ? p.assetTypeOther : p.assetType));
      y = row(doc, y, `Property #${i+1} Valuation`, currency(p.declaredValue));
    }
  }
  return y + 4;
}

// ─── SECTION 10: Property Inspection Gallery (4 sides) ───
async function drawSection10HouseGallery(doc: jsPDF, photos: PhotoUploads): Promise<void> {
  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, 'Section 10 — Property Inspection Gallery');

  const imgW = (CW - 10) / 2;
  const imgH = imgW * 0.6; // landscape ratio

  const drawSlot = async (label: string, file: File | null, x: number, yPos: number): Promise<void> => {
    doc.setDrawColor(200);
    doc.rect(x, yPos, imgW, imgH);
    if (file) {
      try {
        const photo = await loadPhoto(file);
        doc.addImage(photo.data, 'JPEG', x + 1, yPos + 1, imgW - 2, imgH - 2);
      } catch (e) {}
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + imgW / 2, yPos + imgH + 5, { align: 'center' });
  };

  const row1Y = y + 5;
  await drawSlot('HOUSE FRONT VIEW', photos.houseFrontView, ML, row1Y);
  await drawSlot('HOUSE BACK VIEW', photos.houseBackView, ML + imgW + 10, row1Y);

  const row2Y = row1Y + imgH + 14;
  await drawSlot('HOUSE LEFT SIDE VIEW', photos.houseLeftView, ML, row2Y);
  await drawSlot('HOUSE RIGHT SIDE VIEW', photos.houseRightView, ML + imgW + 10, row2Y);
}

// ─── SECTION 11: Document Checklist ───
async function drawSection11(doc: Doc, y: number, data: VehicleLoanFormData): Promise<number> {
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, 'Section 11 — Internal Checklist');
  
  y = subHeader(doc, y, 'Compliance Verification');
  
  const KYC_LABELS: Record<string, string> = {
    aadhaarCard: 'Aadhaar Card',
    panCard: 'PAN Card',
    passport: 'Passport',
    drivingLicence: 'Driving Licence',
  };

  const kycEntries = Object.entries(data.kycDocuments).slice(0, 4) as [string, KycDocEntry][];
  for (const [key, entry] of kycEntries) {
    const label = KYC_LABELS[key] ?? key;
    const aVal = entry.applicantChecked ? `Verified (${entry.applicantDocNo})` : 'Pending';
    y = row(doc, y, label, aVal);
  }

  return y + 10;
}

function drawDeclaration(doc: Doc, data: VehicleLoanFormData) {
  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, 'Official Declaration & Signatures');
  
  const text = "I/We hereby declare that all the information provided in this application is true and complete to the best of my/our knowledge. I/We understand that any false information may lead to the rejection of the application or recall of the loan if disbursed. I/We authorize Boss Finance Consultancy to conduct necessary credit checks and visit premises as part of the evaluation process.";
  const lines = doc.splitTextToSize(text, CW);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(lines, ML, y + 5);
  y += 25;

  const signColW = CW / 3;
  ['APPLICANT', 'CO-APPLICANT', 'GUARANTOR'].forEach((label, i) => {
    const x = ML + i * signColW;
    doc.line(x + 5, y + 20, x + signColW - 5, y + 20);
    doc.setFontSize(8);
    doc.text(label, x + signColW/2, y + 25, { align: 'center' });
  });
}

// ─── MAIN EXPORT FUNCTION ───
export async function generateVehicleLoanPDF(
  formData: VehicleLoanFormData,
  photos: PhotoUploads,
  employeeName?: string
): Promise<{ blob: Blob; url: string; fileName: string }> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Load static resources
  const logo = await loadStaticImage('/BossLogo.png');
  let appPhoto: LoadedPhoto | null = null;
  if (photos.applicantPhoto) {
    try { appPhoto = await loadPhoto(photos.applicantPhoto); } catch (e) {}
  }

  let y = await drawCoverHeader(doc, formData, logo, appPhoto);
  y = drawSection1(doc, y, formData);
  y = drawSection2(doc, y, formData);
  y = drawSection3(doc, y, formData);
  y = drawSection4(doc, y, formData);
  y = drawSection5(doc, y, formData);
  y = drawSection6(doc, y, formData);
  y = drawSection7(doc, y, formData);
  y = drawSection8(doc, y, formData);
  y = drawSection9(doc, y, formData);
  
  await drawSection10HouseGallery(doc, photos);
  await drawSection11(doc, 30, formData);
  drawFinanceAnnexures(doc, formData, 'VEHICLE');
  drawDeclaration(doc, formData);

  addFooters(doc);

  const pdfOutput = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfOutput);
  const fileName = `VehicleLoan_${formData.applicationFormNo || 'Draft'}_${new Date().toISOString().split('T')[0]}.pdf`;

  return { blob: pdfOutput, url: pdfUrl, fileName };
}
