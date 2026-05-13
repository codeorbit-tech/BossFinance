import jsPDF from 'jspdf';
import { SimpleLoanFormData, SimplePhotoUploads } from '../app/employee/loan-form/simple/types';

// ─── Page Constants ───
const PW = 210;
const PH = 297;
const ML = 15;
const MR = 15;
const CW = PW - ML - MR;
const LINE_H = 6;
const SMALL_H = 5;

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

function checkPage(doc: Doc, y: number, needed = 15): number {
  if (y + needed > PH - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

function divider(doc: Doc, y: number): number {
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.line(ML, y, PW - MR, y);
  return y + 3;
}

function sectionTitle(doc: Doc, y: number, text: string): number {
  y = checkPage(doc, y, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(text.toUpperCase(), ML, y);
  y += 1;
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  return y + 5;
}

function row(doc: Doc, y: number, label: string, value: string): number {
  const labelW = 60;
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

function twoColRow(doc: Doc, y: number, label1: string, val1: string, label2: string, val2: string): number {
  const half = CW / 2;
  const labelW = 42;

  y = checkPage(doc, y, SMALL_H + 2);
  doc.setFontSize(8);

  doc.setFont('helvetica', 'bold');
  doc.text(label1 + ':', ML + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(val1, half - labelW - 6), ML + labelW + 4, y);

  doc.setFont('helvetica', 'bold');
  doc.text(label2 + ':', ML + half + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(val2, half - labelW - 6), ML + half + labelW + 4, y);

  return y + SMALL_H + 2;
}

function drawFooter(doc: Doc, pageNum: number, totalPages: number): void {
  const fy = PH - 10;
  doc.setDrawColor(180);
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
async function drawCoverHeader(
  doc: Doc,
  data: SimpleLoanFormData,
  logo?: LoadedPhoto | null,
  applicantPhoto?: LoadedPhoto | null
): Promise<number> {
  let y = 12;

  if (logo) {
    const logoW = 28;
    const logoH = logoW * logo.ratio;
    doc.addImage(logo.data, 'PNG', ML, y, logoW, logoH);
  }

  if (applicantPhoto) {
    const photoW = 30;
    const photoH = 40;
    doc.setDrawColor(220);
    doc.rect(PW - MR - photoW, y, photoW, photoH);
    doc.addImage(applicantPhoto.data, 'JPEG', PW - MR - photoW + 1, y + 1, photoW - 2, photoH - 2);
    doc.setFontSize(6);
    doc.setTextColor(100);
    doc.text('APPLICANT PHOTO', PW - MR - photoW / 2, y + photoH + 4, { align: 'center' });
  }

  y = 16;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('BOSS FINANCE CONSULTANCY', ML + 34, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('YOUR FINANCIAL PARTNER', ML + 34, y);

  y = 44;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.frequency} ${data.loanType} LOAN APPLICATION FORM`, ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Form No: ${val(data.applicationFormNo)}`, PW - MR - 35, y, { align: 'right' });
  doc.text(`Date: ${val(data.applicationDate)}`, PW - MR - 35, y + 5, { align: 'right' });

  y = 56;
  return divider(doc, y) + 2;
}

// ─── SECTION 1: Primary Identification ───
function drawSection1(doc: Doc, y: number, data: SimpleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 1 — Primary Applicant Identification');
  y = twoColRow(doc, y, 'Applicant Name', val(data.applicantName), 'Mobile Number', val(data.mobile));
  y = twoColRow(doc, y, 'Father/Husband Name', val(data.fatherHusbandName), 'Date of Birth', val(data.dob));
  y = twoColRow(doc, y, 'Gender', val(data.gender), 'Aadhaar No.', val(data.aadhaarNo));
  y = twoColRow(doc, y, 'PAN No.', val(data.panNo), 'Residential Address', val(data.address));
  return y + 4;
}

// ─── SECTION 1B: Co-Applicant ───
function drawSection1b(doc: Doc, y: number, data: SimpleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 1B — Co-Applicant Details');
  if (!data.coApplicantName) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(140);
    doc.text('No co-applicant provided.', ML + 2, y);
    doc.setTextColor(0);
    return y + 10;
  }
  y = twoColRow(doc, y, 'Co-Applicant Name', val(data.coApplicantName), 'Mobile Number', val(data.coApplicantMobile));
  y = twoColRow(doc, y, 'Father/Husband Name', val(data.coApplicantFatherHusbandName), 'Date of Birth', val(data.coApplicantDob));
  y = twoColRow(doc, y, 'Gender', val(data.coApplicantGender), 'Relation to Applicant', val(data.coApplicantRelation));
  y = twoColRow(doc, y, 'Aadhaar No.', val(data.coApplicantAadhaarNo), 'PAN No.', val(data.coApplicantPanNo));
  y = row(doc, y, 'Residential Address', val(data.coApplicantAddress));
  y = twoColRow(doc, y, 'Bank Name', val(data.coApplicantBankName), 'Account No.', val(data.coApplicantAccountNo));
  y = twoColRow(doc, y, 'IFSC Code', val(data.coApplicantIfscCode), '', '');
  return y + 4;
}

// ─── SECTION 2: Business / Employment Details ───
function drawSection2(doc: Doc, y: number, data: SimpleLoanFormData): number {
  const isPersonal = data.loanType === 'PERSONAL';
  y = sectionTitle(doc, y, isPersonal ? 'Section 2 — Employment Details' : 'Section 2 — Business Details');
  y = twoColRow(doc, y, isPersonal ? 'Employer / Organisation' : 'Business / Shop Name', val(data.shopName), 'Business Type', val(data.businessType));
  y = twoColRow(doc, y, 'Business Address', val(data.shopAddress), 'Years in Business', val(data.yearsInBusiness));
  return y + 4;
}

// ─── SECTION 3: Loan Details ───
function drawSection3(doc: Doc, y: number, data: SimpleLoanFormData): number {
  const isUpfront = data.frequency === 'DAILY' || data.frequency === 'WEEKLY';
  y = sectionTitle(doc, y, 'Section 3 — Loan Request Details');
  y = twoColRow(doc, y, 'Requested Loan Amount', currency(data.loanAmount), 'Repayment Frequency', val(data.frequency));
  y = twoColRow(doc, y, 'Tenure', val(data.tenure) + (data.frequency === 'DAILY' ? ' Days' : data.frequency === 'WEEKLY' ? ' Weeks' : ' Months'), 'Interest Rate (Flat)', val(data.interestRate) + ' %');
  y = twoColRow(doc, y, 'Calculated EMI', currency(data.emi), 'Loan Type', val(data.loanType));

  const principal = parseFloat(data.loanAmount) || 0;
  const rate = parseFloat(data.interestRate) || 0;
  const tenure = parseFloat(data.tenure) || 0;

  let upfrontInterest = 0;
  let totalInterest = 0;
  let totalRepayment = 0;
  let disbursedAmount = 0;
  let summaryLabel = '';

  if (isUpfront) {
    upfrontInterest = (principal * rate) / 100;
    disbursedAmount = principal - upfrontInterest;
    totalRepayment = principal;
    summaryLabel = 'LOAN SUMMARY (UPFRONT INTEREST — DAILY/WEEKLY)';
  } else {
    totalInterest = (principal * rate * tenure) / 100;
    totalRepayment = principal + totalInterest;
    disbursedAmount = principal;
    summaryLabel = 'LOAN SUMMARY (FLAT RATE)';
  }

  y = checkPage(doc, y + 4, isUpfront ? 36 : 28);
  doc.setFillColor(242, 244, 247);
  doc.rect(ML, y, CW, isUpfront ? 30 : 22, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(summaryLabel, ML + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  const third = CW / 3;
  if (isUpfront) {
    doc.text(`Principal (Loan Amount): ${currency(data.loanAmount)}`, ML + 3, y + 12);
    doc.text(`Upfront Interest Deducted: ${currency(String(upfrontInterest))}`, ML + third + 3, y + 12);
    doc.text(`Amount Disbursed to Customer: ${currency(String(disbursedAmount))}`, ML + third * 2 + 3, y + 12);
    doc.text(`Total Repayment (Principal only): ${currency(String(totalRepayment))}`, ML + 3, y + 20);
    doc.text(`EMI Amount: ${currency(data.emi)} per ${data.frequency === 'DAILY' ? 'Day' : 'Week'}`, ML + third + 3, y + 20);
    return y + 36;
  } else {
    doc.text(`Principal: ${currency(data.loanAmount)}`, ML + 3, y + 12);
    doc.text(`Total Interest: ${currency(String(totalInterest))}`, ML + third + 3, y + 12);
    doc.text(`Total Repayment: ${currency(String(totalRepayment))}`, ML + third * 2 + 3, y + 12);
    return y + 28;
  }
}

// ─── SECTION 4: Bank Details ───
function drawSection4(doc: Doc, y: number, data: SimpleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 4 — Bank Account Details');
  y = twoColRow(doc, y, 'Bank Name', val(data.bankName), 'Account No.', val(data.accountNo));
  y = twoColRow(doc, y, 'IFSC Code', val(data.ifscCode), '', '');
  return y + 4;
}

// ─── SECTION 5: Guarantor Details ───
function drawSection5(doc: Doc, y: number, data: SimpleLoanFormData): number {
  y = sectionTitle(doc, y, 'Section 5 — Guarantor Details');
  y = twoColRow(doc, y, 'Guarantor Name', val(data.guarantorName), 'Mobile Number', val(data.guarantorMobile));
  y = twoColRow(doc, y, 'Father/Husband Name', val(data.guarantorFatherHusbandName), 'Date of Birth', val(data.guarantorDob));
  y = twoColRow(doc, y, 'Gender', val(data.guarantorGender), 'Relation to Applicant', val(data.guarantorRelation));
  y = twoColRow(doc, y, 'Aadhaar No.', val(data.guarantorAadhaarNo), 'PAN No.', val(data.guarantorPanNo));
  y = row(doc, y, 'Residential Address', val(data.guarantorAddress));
  return y + 4;
}

// ─── SECTION 6: Photos ───
async function drawSection6Photos(doc: Doc, photos: SimplePhotoUploads): Promise<void> {
  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, 'Section 6 — Identity & Property Photos');

  const photoItems: { label: string; file: File | null }[] = [
    { label: 'APPLICANT PHOTO', file: photos.applicantPhoto },
    { label: 'CO-APPLICANT PHOTO', file: photos.coApplicantPhoto },
    { label: 'SHOP / BUSINESS PHOTO', file: photos.shopPhoto },
    { label: 'AADHAAR FRONT (APPLICANT)', file: photos.aadhaarFront },
    { label: 'AADHAAR BACK (APPLICANT)', file: photos.aadhaarBack },
    { label: 'PAN CARD (APPLICANT)', file: photos.panCard },
    { label: 'GUARANTOR PHOTO', file: photos.guarantorPhoto },
    { label: 'GUARANTOR AADHAAR FRONT', file: photos.guarantorAadhaarFront },
    { label: 'GUARANTOR AADHAAR BACK', file: photos.guarantorAadhaarBack },
  ];

  const imgW = (CW - 10) / 2;
  const imgH = imgW * 0.75;
  let col = 0;
  let rowY = y + 5;

  for (const item of photoItems) {
    const x = col === 0 ? ML : ML + imgW + 10;

    if (rowY + imgH + 14 > PH - 18) {
      doc.addPage();
      rowY = 20;
      col = 0;
    }

    doc.setDrawColor(200);
    doc.rect(x, rowY, imgW, imgH);

    if (item.file) {
      try {
        const photo = await loadPhoto(item.file);
        doc.addImage(photo.data, 'JPEG', x + 1, rowY + 1, imgW - 2, imgH - 2);
      } catch (e) {
        doc.setFontSize(8);
        doc.text('IMAGE LOAD ERROR', x + imgW / 2, rowY + imgH / 2, { align: 'center' });
      }
    } else {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('NOT UPLOADED', x + imgW / 2, rowY + imgH / 2, { align: 'center' });
      doc.setTextColor(0);
    }

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, x + imgW / 2, rowY + imgH + 6, { align: 'center' });

    if (col === 0) {
      col = 1;
    } else {
      col = 0;
      rowY += imgH + 14;
    }
  }
}

// ─── ANNEXURES: Sanction & Repayment Schedule (adapted for Simple Loan) ───
function drawAnnexures(doc: Doc, data: SimpleLoanFormData): void {
  // Sanction Summary page
  doc.addPage();
  let y = 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SANCTION & CREDIT APPRAISAL SUMMARY', ML, y);
  y += 2;
  doc.setLineWidth(0.35);
  doc.line(ML, y, PW - MR, y);
  y += 10;

  y = sectionTitle(doc, y, 'Application Snapshot');
  y = twoColRow(doc, y, 'Product', `${data.frequency} ${data.loanType} Loan`, 'Application No.', val(data.applicationFormNo));
  y = twoColRow(doc, y, 'Applicant', val(data.applicantName), 'Application Date', val(data.applicationDate));
  y = twoColRow(doc, y, 'Requested Amount', currency(data.loanAmount), 'Sanctioned Amount', 'To be filled by Admin');
  y = twoColRow(doc, y, 'Tenure', val(data.tenure) + (data.frequency === 'DAILY' ? ' Days' : data.frequency === 'WEEKLY' ? ' Weeks' : ' Months'), 'Interest Rate', val(data.interestRate) + '% Flat');
  y = twoColRow(doc, y, 'Calculated EMI', currency(data.emi), 'Repayment Mode', `${data.frequency} EMI`);

  y = sectionTitle(doc, y + 4, 'Credit Decision');
  y = twoColRow(doc, y, 'Decision', 'Approved / Rejected / Queried', 'Risk Category', 'Low / Medium / High');
  y = twoColRow(doc, y, 'Processing Fee', 'To be filled by Admin', 'Margin / Down Payment', 'To be filled by Admin');

  // Repayment Schedule
  doc.addPage();
  y = 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REPAYMENT, CHARGES & PENALTY TERMS', ML, y);
  y += 2;
  doc.setLineWidth(0.35);
  doc.line(ML, y, PW - MR, y);
  y += 10;

  const principal = parseFloat(data.loanAmount) || 0;
  const tenure = Math.max(0, parseInt(data.tenure) || 0);
  const rate = parseFloat(data.interestRate) || 0;
  const emiVal = parseFloat(data.emi) || 0;
  const totalInterest = (principal * rate * tenure) / 100;

  y = sectionTitle(doc, y, 'Estimated Repayment Schedule (Flat Rate)');

  // Summary box
  doc.setFillColor(242, 244, 247);
  doc.rect(ML, y, CW, 24, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const bx = ML + 5;
  doc.text(`Principal Amount: ${currency(data.loanAmount)}`, bx, y + 6);
  doc.text(`Total Interest (Flat): ${currency(String(totalInterest))}`, bx, y + 11);
  doc.text(`Total Repayment: ${currency(String(principal + totalInterest))}`, bx, y + 16);
  doc.text(`EMI: ${currency(data.emi)} per ${data.frequency === 'DAILY' ? 'Day' : data.frequency === 'WEEKLY' ? 'Week' : 'Month'}`, bx + CW / 2, y + 6);
  y += 28;

  // Table header
  doc.setFillColor(230, 235, 245);
  doc.rect(ML, y - 5, CW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const cols = [20, 40, 35, 40, 45];
  const headers = ['EMI No.', 'Due Date', 'EMI Amount', 'Principal Part', 'Remaining Balance'];
  let cx = ML + 2;
  headers.forEach((h, i) => { doc.text(h, cx, y); cx += cols[i]; });
  y += 6;

  // Table rows
  let balance = principal;
  const interestPerEmi = tenure > 0 ? totalInterest / tenure : 0;
  const principalPerEmi = tenure > 0 ? principal / tenure : 0;
  const maxRows = Math.min(tenure, 24);

  for (let i = 1; i <= maxRows; i++) {
    y = checkPage(doc, y, 8);
    balance = Math.max(0, balance - principalPerEmi);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    cx = ML + 2;
    const cells = [
      String(i),
      'As per disbursement',
      currency(String(emiVal)),
      currency(String(principalPerEmi)),
      currency(String(balance)),
    ];
    cells.forEach((cell, i) => {
      doc.text(cell, cx, y);
      cx += cols[i];
    });
    doc.setDrawColor(220);
    doc.line(ML, y + 2.5, PW - MR, y + 2.5);
    y += 6;
  }

  if (tenure > maxRows) {
    y = checkPage(doc, y, 8);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text(`* Only first ${maxRows} installments shown. Remaining continue as per schedule.`, ML + 2, y);
    y += 8;
  }
}

// ─── DECLARATION & SIGNATURES ───
function drawDeclaration(doc: Doc, data: SimpleLoanFormData): void {
  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, 'Official Declaration & Signatures');

  const text =
    `I/We hereby declare that all the information provided in this ${data.frequency} ${data.loanType} Loan Application is true and complete to the best of my/our knowledge. I/We understand that any false information may lead to the rejection of the application or recall of the loan if disbursed. I/We authorize Boss Finance Consultancy to conduct necessary credit checks and visit premises as part of the evaluation process.`;
  const lines = doc.splitTextToSize(text, CW);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(lines, ML, y + 5);
  y += 25;

  // Signature blocks — 3 columns: Applicant, Co-Applicant, Guarantor
  const sigColW = CW / 3;
  const sigs = ['APPLICANT', 'CO-APPLICANT', 'GUARANTOR'];
  sigs.forEach((label, i) => {
    const x = ML + i * sigColW;
    doc.setDrawColor(0);
    doc.line(x + 5, y + 25, x + sigColW - 5, y + 25);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + sigColW / 2, y + 30, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Signature / Date', x + sigColW / 2, y + 35, { align: 'center' });
  });

  y += 50;

  // Staff sign-off
  const staffColW = CW / 3;
  const staffSigs = ['Prepared By', 'Verified By', 'Approved By'];
  staffSigs.forEach((label, i) => {
    const x = ML + i * staffColW;
    doc.setDrawColor(0);
    doc.line(x + 5, y + 18, x + staffColW - 5, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(label, x + staffColW / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Signature / Name / Date', x + staffColW / 2, y + 23, { align: 'center' });
  });
}

function drawTermsAndConditions(doc: Doc, data: SimpleLoanFormData): void {
  doc.addPage();
  let y = 20;
  y = sectionTitle(doc, y, 'Terms & Conditions');

  const terms = [
    `Loan amount, interest rate, tenure, and EMI are as sanctioned by Boss Finance Consultancy and accepted by the borrower at disbursement.`,
    `EMI must be paid on or before each due date. Any delay will attract additional penalty charges as per company policy in force on the payment date.`,
    `For overdue installments, penal charges/penal interest may be applied from due date till realization, and recovery follow-ups may be initiated.`,
    `Payments will be adjusted in the order: (1) penalty/penal charges, (2) interest due, (3) principal outstanding unless otherwise approved in writing.`,
    `Repeated delays, cheque/auto-debit failures, or non-payment may lead to loan recall, legal action, and reporting in internal/default records.`,
    `Borrower and guarantor confirm all submitted documents and declarations are true. Any false information can lead to immediate rejection/recall.`,
    `Borrower must promptly inform changes in mobile number, address, employment/business, or bank mandate details.`,
    `Foreclosure/pre-closure, part-payment, and related charges (if any) are governed by prevailing policy communicated at the time of request.`,
    `In case of dispute, company records, signed application, repayment ledger, and sanction terms will be treated as primary reference documents.`,
    `By signing this application, borrower/co-applicant/guarantor agree to all terms and authorize verification, field visits, and communication reminders.`,
  ];

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  terms.forEach((term, idx) => {
    y = checkPage(doc, y, 12);
    const line = `${idx + 1}. ${term}`;
    const wrapped = doc.splitTextToSize(line, CW - 2);
    doc.text(wrapped, ML + 1, y);
    y += wrapped.length * 4.5 + 2;
  });

  y += 3;
  y = checkPage(doc, y, 16);
  doc.setFont('helvetica', 'bold');
  doc.text('Penalty Note:', ML + 1, y);
  doc.setFont('helvetica', 'normal');
  const penaltyNote = doc.splitTextToSize(
    `If EMI is not paid on the due date, the account is treated as overdue and penalty/penal interest is applied for the delayed period until payment clearance.`,
    CW - 35
  );
  doc.text(penaltyNote, ML + 28, y);
}

// ─── MAIN EXPORT ───
export async function generateMonthlyLoanPDF(
  data: SimpleLoanFormData,
  photos: SimplePhotoUploads
): Promise<{ blob: Blob; url: string; fileName: string }> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const logo = await loadStaticImage('/BossLogo.png');
  let appPhoto: LoadedPhoto | null = null;
  if (photos.applicantPhoto) {
    try { appPhoto = await loadPhoto(photos.applicantPhoto); } catch (e) {}
  }

  let y = await drawCoverHeader(doc, data, logo, appPhoto);
  y = drawSection1(doc, y, data);
  y = drawSection1b(doc, y, data);
  y = drawSection2(doc, y, data);
  y = drawSection3(doc, y, data);
  y = drawSection4(doc, y, data);
  y = drawSection5(doc, y, data);
  drawAnnexures(doc, data);
  drawTermsAndConditions(doc, data);
  drawDeclaration(doc, data);
  addFooters(doc);

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const fileName = `${data.loanType}Loan_${data.applicationFormNo}_${new Date().toISOString().split('T')[0]}.pdf`;

  return { blob, url, fileName };
}
