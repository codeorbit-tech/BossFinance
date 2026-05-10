import jsPDF from 'jspdf';
import { HomeLoanFormData, HomePhotoUploads, KycDocEntry } from '../app/employee/loan-form/home/types';
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

function fullName(name: string | undefined): string {
  return name?.trim() || '-';
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
async function drawCoverHeader(doc: Doc, formData: HomeLoanFormData, logo?: LoadedPhoto | null, applicantPhoto?: LoadedPhoto | null): Promise<number> {
  let y = 15;
  
  // 1. Logo
  if (logo) {
    const logoW = 35;
    const logoH = logoW * logo.ratio;
    doc.addImage(logo.data, 'PNG', ML, y, logoW, logoH);
  }

  // 2. Applicant Photo (Passport style on right)
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
  doc.text('HOME LOAN APPLICATION FORM', ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Form No: ${val(formData.applicationFormNo)}`, PW - MR - 35, y, { align: 'right' });
  doc.text(`Date: ${val(formData.applicationDate)}`, PW - MR - 35, y + 5, { align: 'right' });
  
  y = 52;
  return divider(doc, y) + 2;
}

// ─── SECTION 1: Application Info ───
// ─── SECTION 1: Primary Details ───
function drawSection1(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 1 — Primary Details');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Full Name',
    fullName(data.applicantPersonal.fullName),
    fullName(data.coApplicantPersonal.fullName),
    fullName(data.guarantorPersonal.fullName),
  );
  y = triRow(doc, y, "Husband / Father's",
    val(data.applicantPersonal.fatherName),
    val(data.coApplicantPersonal.fatherName),
    val(data.guarantorPersonal.fatherName),
  );
  y = triRow(doc, y, 'Mobile Number', 
    val(data.applicantPersonal.mobile), 
    val(data.coApplicantPersonal.mobile), 
    val(data.guarantorPersonal.mobile)
  );
  y = triRow(doc, y, 'Owned House?', 
    data.applicantOwnedHouse ? 'YES' : 'NO', 
    data.coApplicantOwnedHouse ? 'YES' : 'NO', 
    data.guarantorOwnedHouse ? 'YES' : 'NO'
  );
  return y + 4;
}

// ─── SECTION 2: KYC Details ───
function drawSection2(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 2 — KYC Verification');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Aadhaar No.', 
    val(data.kycDocuments.aadhaarCard.applicantDocNo),
    val(data.kycDocuments.aadhaarCard.coApplicantDocNo),
    val(data.kycDocuments.aadhaarCard.guarantorDocNo)
  );
  y = triRow(doc, y, 'PAN Card No.', 
    val(data.kycDocuments.panCard.applicantDocNo),
    val(data.kycDocuments.panCard.coApplicantDocNo),
    val(data.kycDocuments.panCard.guarantorDocNo)
  );
  y = triRow(doc, y, 'GSTIN', val(data.applicantGstin), val(data.coApplicantGstin), val(data.guarantorGstin));
  return y + 4;
}

// ─── SECTION 2: Loan Details ───
// ─── SECTION 3: Loan Details ───
function drawSection3(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 3 — Loan Request Details');
  y = row(doc, y, 'Requested Loan Amount', currency(data.loanDetails.loanAmount));
  y = row(doc, y, 'Tenure (Months)', val(data.loanDetails.tenure));
  y = row(doc, y, 'Interest Rate (% p.a.)', val(data.loanDetails.interestRate) + ' %');
  y = row(doc, y, 'Estimated EMI', currency(data.loanDetails.emi));
  return y + 4;
}

// ─── SECTION 3: Personal Details ───
// ─── SECTION 4: Personal Details ───
function drawSection4(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 4 — Personal Information');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Gender', val(data.applicantPersonal.gender), val(data.coApplicantPersonal.gender), val(data.guarantorPersonal.gender));
  y = triRow(doc, y, 'Date of Birth', val(data.applicantPersonal.dob), val(data.coApplicantPersonal.dob), val(data.guarantorPersonal.dob));
  y = triRow(doc, y, "Spouse's Name",
    val(data.applicantPersonal.spouseName),
    val(data.coApplicantPersonal.spouseName),
    val(data.guarantorPersonal.spouseName),
  );
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
  return y + 4;
}

// ─── SECTION 4: Address & Contact ───
// ─── SECTION 5: Address & Contact ───
function drawSection5(doc: Doc, y: number, data: HomeLoanFormData): number {
  const parties = [
    { label: 'Applicant', contact: data.applicantContact },
    { label: 'Co-Applicant', contact: data.coApplicantContact },
    { label: 'Guarantor', contact: data.guarantorContact },
  ];

  y = sectionTitle(doc, y, 'Section 5 — Address & Contact Details');

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
    y = row(doc, y, 'Alternate Mobile', val(contact.alternateMobile));
    y = row(doc, y, 'Email', val(contact.email));
    y += 3;
  }
  return y + 2;
}

// ─── SECTION 5: Residence Info ───
// ─── SECTION 6: Residence Info ───
function drawSection6(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 6 — Residence & Marital Information');
  y = triHeader(doc, y);
  y = triRow(doc, y, 'Residence', val(data.applicantResidence.residence), val(data.coApplicantResidence.residence), val(data.guarantorResidence.residence));
  y = triRow(doc, y, 'Years of Stay', val(data.applicantResidence.yearsOfStay), val(data.coApplicantResidence.yearsOfStay), val(data.guarantorResidence.yearsOfStay));
  y = triRow(doc, y, 'Marital Status', val(data.applicantPersonal.maritalStatus), val(data.coApplicantPersonal.maritalStatus), val(data.guarantorPersonal.maritalStatus));
  y = triRow(doc, y, 'No. of Dependents', val(data.applicantPersonal.numberOfDependents), val(data.coApplicantPersonal.numberOfDependents), val(data.guarantorPersonal.numberOfDependents));
  y = triRow(doc, y, 'Education',
    val(data.applicantPersonal.education === 'Others' ? data.applicantPersonal.educationOther : data.applicantPersonal.education),
    val(data.coApplicantPersonal.education === 'Others' ? data.coApplicantPersonal.educationOther : data.coApplicantPersonal.education),
    val(data.guarantorPersonal.education === 'Others' ? data.guarantorPersonal.educationOther : data.guarantorPersonal.education),
  );
  return y + 4;
}

// ─── SECTION 6: Bank Details ───
// ─── SECTION 7: Bank Details ───
function drawSection7(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 7 — Bank Account Details');

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

// ─── SECTION 7: Employment ───
// ─── SECTION 8: Employment ───
function drawSection8(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 8 — Employment Details');
  y = dualHeader(doc, y);
  y = dualRow(doc, y, 'Establishment / Institution', val(data.applicantEmployment.establishmentName), val(data.coApplicantEmployment.establishmentName));
  y = dualRow(doc, y, 'Designation', val(data.applicantEmployment.designation), val(data.coApplicantEmployment.designation));
  y = dualRow(doc, y, 'Years of Employment', val(data.applicantEmployment.yearsOfEmployment), val(data.coApplicantEmployment.yearsOfEmployment));
  y = dualRow(doc, y, 'CTC Per Annum', currency(data.applicantEmployment.ctcPerAnnum), currency(data.coApplicantEmployment.ctcPerAnnum));
  return y + 4;
}

// ─── SECTION 8: Property Details ───
// ─── SECTION 9: Property Details ───
function drawSection9(doc: Doc, y: number, data: HomeLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 9 — Property Details (Proposed for Finance)');

  const p = data.propertyDetails;
  y = row(doc, y, 'Property Type', val(p.propertyType === 'Others' ? p.propertyTypeOther : p.propertyType));
  y = row(doc, y, 'Locality', val(p.locality));
  y = row(doc, y, 'Survey No. / Plot No.', val(p.surveyNo));
  y = row(doc, y, 'Patta No.', val(p.pattaNo));
  y = row(doc, y, 'Land Area (Sq.Ft)', val(p.landArea));
  y = row(doc, y, 'Built-up Area (Sq.Ft)', val(p.builtUpArea));
  y = row(doc, y, 'Market Value', currency(p.marketValue));
  
  y = subHeader(doc, y, 'Property Boundaries');
  y = row(doc, y, 'North By', val(p.boundaryNorth));
  y = row(doc, y, 'South By', val(p.boundarySouth));
  y = row(doc, y, 'East By', val(p.boundaryEast));
  y = row(doc, y, 'West By', val(p.boundaryWest));

  // Movable Property
  if (data.movablePropertyDescription) {
    y = sectionTitle(doc, y, 'Other Assets');
    y = row(doc, y, 'Movable Assets', val(data.movablePropertyDescription));
    y = row(doc, y, 'Total Value', currency(data.movablePropertyValue));
  }

  return y + 2;
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
        if (!ctx) {
          reject('Could not get canvas context');
          return;
        }
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

async function drawGallery(doc: Doc, photos: HomePhotoUploads): Promise<number> {
  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, 'Section 10 — Photos & Gallery');

  // Individual Photos
  y = subHeader(doc, y, 'Personal Identification Photos');
  const indW = 45;
  const indH = indW * (4/3);
  const gap = (CW - indW * 3) / 2;

  const drawIndPhoto = async (label: string, file: File | null, x: number, currentY: number) => {
    if (file) {
      try {
        const photo = await loadPhoto(file);
        doc.addImage(photo.data, 'JPEG', x, currentY, indW, indH);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(label, x + indW/2, currentY + indH + 4, { align: 'center' });
      } catch (e) {
        doc.rect(x, currentY, indW, indH);
        doc.text('Error', x + indW/2, currentY + indH/2, { align: 'center' });
      }
    } else {
      doc.setDrawColor(200);
      doc.rect(x, currentY, indW, indH);
      doc.setFontSize(7);
      doc.text(`${label}\n(Not Uploaded)`, x + indW/2, currentY + indH/2, { align: 'center' });
    }
  };

  await drawIndPhoto('APPLICANT', photos.applicantPhoto, ML, y);
  await drawIndPhoto('CO-APPLICANT', photos.coApplicantPhoto, ML + indW + gap, y);
  await drawIndPhoto('GUARANTOR', photos.guarantorPhoto, ML + (indW + gap) * 2, y);

  y += indH + 15;

  // Property Photos
  y = subHeader(doc, y, 'Front Elevation & Layout Plan');
  const maxW = CW - 10;
  const maxH = 75;
  const center = ML + CW / 2;

  const drawPhoto = async (label: string, currentY: number, file?: File | null): Promise<number> => {
    if (!file) return currentY;
    const nextY = checkPage(doc, currentY, 40);
    try {
      const photo = await loadPhoto(file);
      let dW = maxW;
      let dH = dW * photo.ratio;
      if (dH > maxH) { dH = maxH; dW = dH / photo.ratio; }
      const dX = ML + (CW - dW) / 2;
      doc.addImage(photo.data, 'JPEG', dX, nextY, dW, dH);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(label, center, nextY + dH + 4, { align: 'center' });
      return nextY + dH + 12;
    } catch (e) { return nextY + 10; }
  };

  y = await drawPhoto('FRONT ELEVATION', y, photos.frontElevation);
  y = await drawPhoto('LAYOUT PLAN', y, photos.layoutPlan);
  y = await drawPhoto('INTERIOR VIEW', y, photos.interiorView);
  y = await drawPhoto('SIDE SITE VIEW', y, photos.sideSiteView);

  return y;
}

// Property Photos Page 2 logic merged into drawGallery for brevity and consistency

// ─── SECTION 11: Document Checklist ───
async function drawSection11(doc: Doc, y: number, data: HomeLoanFormData): Promise<number> {
  doc.addPage();
  y = 20;

  y = sectionTitle(doc, y, 'Section 11 — Document Checklist');

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
    rationCard: 'Ration Card',
  };

  y = subHeader(doc, y, 'KYC Document Verification');

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
    const label = KYC_LABELS[key] ?? key;
    const aVal = entry.applicantChecked ? `Yes (${entry.applicantDocNo || 'No. not entered'})` : 'No';
    const caVal = entry.coApplicantChecked ? `Yes (${entry.coApplicantDocNo || 'No. not entered'})` : 'No';
    const gVal = entry.guarantorChecked ? `Yes (${entry.guarantorDocNo || 'No. not entered'})` : 'No';
    
    const labelW = 55;
    const colW = (CW - labelW) / 3;
    
    const labelLines = doc.splitTextToSize(label, labelW - 2);
    const aLines = doc.splitTextToSize(aVal, colW - 2);
    const caLines = doc.splitTextToSize(caVal, colW - 2);
    const gLines = doc.splitTextToSize(gVal, colW - 2);
    const maxLines = Math.max(labelLines.length, aLines.length, caLines.length, gLines.length, 1);
    const h = maxLines * SMALL_H;
    
    y = checkPage(doc, y, h + 1);
    
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(labelLines, ML + 2, y);
    doc.setFont('helvetica', 'normal');
    
    doc.text(aLines, ML + labelW + 2, y);
    doc.text(caLines, ML + labelW + 2 + colW, y);
    doc.text(gLines, ML + labelW + 2 + colW * 2, y);
    
    y += h;
  });
  y += 3;

  // Pre-Sanction Docs
  y = subHeader(doc, y, 'Pre-Sanction Documents');
  const PRE_LABELS: Record<string, string> = {
    saleAgreement: 'Agreement for Sale / Cost Appreciation',
    parentDocuments: 'Parent Documents (Last 13/30 years)',
    encumbranceCertificate: 'Encumbrance Certificate (EC)',
    pattaChitta: 'Patta / Chitta / Adangal / TSLR',
    approvalPlan: 'DTCP / LPA / CMDA Approved Plan',
    nocBuilder: 'NOC from Builder / Association',
    bankStatement: 'Bank statement (last 6 months)',
    itr: 'Last 2 years ITR (if income assessee)',
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
  y = row(doc, y, 'Original Registered Sale Deed', data.postDisbursementDocs.saleDeedOriginal ? 'Received' : 'Pending');
  y = row(doc, y, 'MOD Receipt / Deposit of Title Deeds', data.postDisbursementDocs.modDeposit ? 'Received' : 'Pending');
  y = row(doc, y, 'Property Insurance Policy', data.postDisbursementDocs.insurancePolicy ? 'Received' : 'Pending');
  if (data.postDisbursementDocs.othersText) {
    y = row(doc, y, `Others: ${data.postDisbursementDocs.othersText}`, 'Pending');
  }

  return y + 4;
}

// ─── DECLARATION PAGE ───
function drawDeclarationPage(doc: Doc, data: HomeLoanFormData): void {
  doc.addPage();
  let y = 20;

  y = sectionTitle(doc, y, 'Declaration by Applicant, Co-Applicant & Guarantor');
  y += 2;

  const declarationText = [
    'I/We, the undersigned, hereby declare and confirm the following:',
    '',
    '1. The information furnished in this Home Loan application form is true, correct, and complete to the best of my/our knowledge and belief. No material information has been concealed or withheld.',
    '',
    '2. I/We authorize Boss Finance Consultancy to verify the information provided herein, including credit history, employment details, property valuation, and legal status from appropriate sources.',
    '',
    '3. I/We understand that submission of this application does not guarantee loan approval. Boss Finance Consultancy reserves the right to reject any application without assigning reasons.',
    '',
    '4. I/We agree to abide by the terms and conditions of the loan agreement to be executed upon sanction, including repayment schedule, penal interest, and mortgage obligations.',
    '',
    '5. I/We consent to the use and processing of my/our personal data as required for the evaluation and operation of this loan application, in accordance with applicable laws.',
    '',
    '6. The property for which the loan is sought will be legally mortgaged in favour of Boss Finance Consultancy until the loan is fully repaid.',
    '',
    '7. I/We shall maintain adequate insurance on the financed property throughout the term of the loan.',
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
    { label: 'Applicant', name: fullName(data.applicantPersonal.fullName) },
    { label: 'Co-Applicant', name: fullName(data.coApplicantPersonal.fullName) },
    { label: 'Guarantor', name: fullName(data.guarantorPersonal.fullName) },
  ];

  const colW = CW / 3;
  signCols.forEach(({ label, name }, i) => {
    const x = ML + i * colW;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(label, x + colW / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(name, x + colW / 2, y + 5, { align: 'center' });
    doc.setLineWidth(0.3);
    doc.line(x + 5, y + 18, x + colW - 5, y + 18);
    doc.setFontSize(6.5);
    doc.text('Signature / Thumb Impression', x + colW / 2, y + 22, { align: 'center' });
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
export async function generateHomeLoanPDF(
  formData: HomeLoanFormData,
  photos: HomePhotoUploads,
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
  
  // Photo pages
  await drawGallery(doc, photos);
  
  // Documents and Declaration
  y = await drawSection11(doc, 20, formData);
  drawFinanceAnnexures(doc, formData, 'HOME');
  drawDeclarationPage(doc, formData);

  addFooters(doc);

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const fileName = `HL_Application_${formData.applicationFormNo}.pdf`;

  return { blob, url, fileName };
}
