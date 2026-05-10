import { SimpleLoanFormData, SimplePhotoUploads } from '../app/employee/loan-form/simple/types';
import jsPDF from 'jspdf';

export async function generateSimpleLoanPDF(data: SimpleLoanFormData, photos: SimplePhotoUploads) {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for drawing text
  const text = (content: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.size || 10);
    doc.setFont(options.font || 'helvetica', options.weight || 'normal');
    if (options.color) doc.setTextColor(options.color[0], options.color[1], options.color[2]);
    else doc.setTextColor(0, 0, 0);
    doc.text(content || '', x, y, { align: options.align || 'left' });
  };

  // Header
  doc.setFillColor(31, 41, 55); // Dark Slate
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  text('BOSS FINANCE', pageWidth / 2, 15, { size: 24, weight: 'bold', color: [255, 255, 255], align: 'center' });
  text(`${data.frequency} ${data.loanType} LOAN APPLICATION`, pageWidth / 2, 25, { size: 12, weight: 'bold', color: [200, 200, 200], align: 'center' });
  text(`FORM NO: ${data.applicationFormNo}`, pageWidth / 2, 32, { size: 10, weight: 'normal', color: [255, 255, 255], align: 'center' });

  let y = 50;

  // Section 1: Applicant Details
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, contentWidth, 8, 'F');
  text('APPLICANT DETAILS', margin + 2, y + 6, { size: 10, weight: 'bold' });
  y += 15;

  const col1 = margin + 5;
  const col2 = pageWidth / 2 + 5;

  text(`Name: ${data.applicantName}`, col1, y);
  text(`Phone: ${data.mobile}`, col2, y);
  y += 8;
  text(`Father/Husband Name: ${data.fatherHusbandName}`, col1, y);
  text(`Date of Birth: ${data.dob}`, col2, y);
  y += 8;
  text(`Gender: ${data.gender}`, col1, y);
  text(`Aadhaar No: ${data.aadhaarNo}`, col2, y);
  y += 8;
  text(`PAN No: ${data.panNo}`, col1, y);
  y += 12;

  // Section 2: Business Details
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, contentWidth, 8, 'F');
  text('BUSINESS DETAILS', margin + 2, y + 6, { size: 10, weight: 'bold' });
  y += 15;

  text(`Shop/Business Name: ${data.shopName}`, col1, y);
  text(`Business Type: ${data.businessType}`, col2, y);
  y += 8;
  text(`Shop Address: ${data.shopAddress}`, col1, y);
  y += 15;

  // Section 3: Loan & Bank Details
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, contentWidth, 8, 'F');
  text('LOAN & BANK DETAILS', margin + 2, y + 6, { size: 10, weight: 'bold' });
  y += 15;

  text(`Loan Amount: Rs. ${data.loanAmount}`, col1, y);
  text(`Tenure: ${data.tenure} ${data.frequency === 'DAILY' ? 'Days' : 'Weeks'}`, col2, y);
  y += 8;
  text(`Interest Rate: ${data.interestRate}% Flat`, col1, y);
  text(`Calculated EMI: Rs. ${data.emi}`, col2, y);
  y += 8;
  text(`Bank Name: ${data.bankName}`, col1, y);
  text(`Account No: ${data.accountNo}`, col2, y);
  y += 8;
  text(`IFSC Code: ${data.ifscCode}`, col1, y);
  y += 15;

  // Section 4: Guarantor Details
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, contentWidth, 8, 'F');
  text('GUARANTOR DETAILS', margin + 2, y + 6, { size: 10, weight: 'bold' });
  y += 15;

  text(`Guarantor Name: ${data.guarantorName}`, col1, y);
  text(`Phone: ${data.guarantorMobile}`, col2, y);
  y += 8;
  text(`Relation: ${data.guarantorRelation}`, col1, y);
  y += 30;

  // Signatures
  text('__________________________', col1, y);
  text('Applicant Signature', col1, y + 5);
  
  text('__________________________', col2 + 20, y);
  text('Authorized Signatory', col2 + 20, y + 5);

  const fileName = `Loan_Application_${data.applicationFormNo}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  return { blob, url, fileName };
}
