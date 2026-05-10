import jsPDF from 'jspdf';

type LoanKind = 'HOME' | 'VEHICLE';

const PW = 210;
const PH = 297;
const ML = 15;
const MR = 15;
const CW = PW - ML - MR;

function value(v: unknown): string {
  if (v === null || v === undefined) return '-';
  const text = String(v).trim();
  return text || '-';
}

function amount(v: unknown): number {
  const n = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function money(v: unknown): string {
  const n = amount(v);
  return n > 0 ? `Rs. ${Math.round(n).toLocaleString('en-IN')}` : '-';
}

function percent(v: unknown): string {
  const n = amount(v);
  return n > 0 ? `${n}% p.a.` : '-';
}

function checkPage(doc: jsPDF, y: number, needed = 18): number {
  if (y + needed > PH - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

function title(doc: jsPDF, text: string): number {
  doc.addPage();
  let y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(text.toUpperCase(), ML, y);
  y += 2;
  doc.setLineWidth(0.35);
  doc.line(ML, y, PW - MR, y);
  return y + 8;
}

function section(doc: jsPDF, y: number, text: string): number {
  y = checkPage(doc, y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(text.toUpperCase(), ML, y);
  y += 1.5;
  doc.setLineWidth(0.2);
  doc.line(ML, y, PW - MR, y);
  return y + 5;
}

function kv(doc: jsPDF, y: number, label: string, val: string, x = ML, width = CW): number {
  y = checkPage(doc, y, 9);
  const labelW = Math.min(48, width * 0.38);
  const valueW = width - labelW - 4;
  const labelLines = doc.splitTextToSize(`${label}:`, labelW);
  const valueLines = doc.splitTextToSize(val, valueW);
  const h = Math.max(labelLines.length, valueLines.length) * 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(labelLines, x, y);
  doc.setFont('helvetica', 'normal');
  doc.text(valueLines, x + labelW + 4, y);
  return y + h + 2;
}

function twoCol(doc: jsPDF, y: number, left: [string, string], right: [string, string]): number {
  const gap = 8;
  const col = (CW - gap) / 2;
  const nextLeft = kv(doc, y, left[0], left[1], ML, col);
  const nextRight = kv(doc, y, right[0], right[1], ML + col + gap, col);
  return Math.max(nextLeft, nextRight);
}

function box(doc: jsPDF, y: number, text: string): number {
  y = checkPage(doc, y, 24);
  const lines = doc.splitTextToSize(text, CW - 8);
  const h = Math.max(18, lines.length * 4.5 + 8);
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.rect(ML, y, CW, h);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(lines, ML + 4, y + 7);
  return y + h + 6;
}

function tableHeader(doc: jsPDF, y: number, headers: string[], widths: number[]): number {
  y = checkPage(doc, y, 10);
  doc.setFillColor(242, 244, 247);
  doc.rect(ML, y - 5, CW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  let x = ML + 2;
  headers.forEach((h, i) => {
    doc.text(h, x, y);
    x += widths[i];
  });
  return y + 6;
}

function tableRow(doc: jsPDF, y: number, cells: string[], widths: number[]): number {
  y = checkPage(doc, y, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  let x = ML + 2;
  cells.forEach((cell, i) => {
    doc.text(doc.splitTextToSize(cell, widths[i] - 3), x, y);
    x += widths[i];
  });
  doc.setDrawColor(230);
  doc.line(ML, y + 2.5, PW - MR, y + 2.5);
  return y + 6;
}

function applicantName(data: any): string {
  const p = data.applicantPersonal || {};
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim() || '-';
}

function coApplicantName(data: any): string {
  const p = data.coApplicantPersonal || {};
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim() || '-';
}

function guarantorName(data: any): string {
  const p = data.guarantorPersonal || {};
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim() || '-';
}

function drawRepaymentSchedule(doc: jsPDF, y: number, data: any): number {
  const principal = amount(data.loanDetails?.loanAmount);
  const tenure = Math.max(0, Math.round(amount(data.loanDetails?.tenure)));
  const annualRate = amount(data.loanDetails?.interestRate);
  const emi = amount(data.loanDetails?.emi);

  y = section(doc, y, 'Estimated Repayment Schedule');
  y = box(doc, y, 'This schedule is indicative and subject to final sanction, disbursement date, holiday adjustments, part-payments, pre-closure, and any restructuring approved by Boss Finance Consultancy.');

  const headers = ['EMI No.', 'Due Date', 'EMI', 'Principal', 'Interest', 'Balance'];
  const widths = [20, 34, 30, 32, 30, 34];
  y = tableHeader(doc, y, headers, widths);

  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;
  let balance = principal;
  const rows = Math.min(tenure || 0, 24);
  for (let i = 1; i <= rows; i++) {
    const interest = monthlyRate > 0 ? balance * monthlyRate : 0;
    const principalPart = Math.max(0, Math.min(balance, emi - interest));
    balance = Math.max(0, balance - principalPart);
    y = tableRow(doc, y, [
      String(i),
      'As per disbursement',
      money(emi),
      money(principalPart),
      money(interest),
      money(balance),
    ], widths);
  }

  if (tenure > rows) {
    y = kv(doc, y + 2, 'Note', `Only first ${rows} installments are shown. Remaining installments continue as per sanctioned repayment schedule.`);
  }
  return y + 4;
}

function drawSignatureGrid(doc: jsPDF, y: number): number {
  y = checkPage(doc, y, 40);
  const colW = CW / 3;
  ['Prepared By', 'Verified By', 'Approved By'].forEach((label, idx) => {
    const x = ML + idx * colW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(label, x + colW / 2, y, { align: 'center' });
    doc.line(x + 8, y + 18, x + colW - 8, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Signature / Name / Date', x + colW / 2, y + 23, { align: 'center' });
  });
  return y + 32;
}

export function drawFinanceAnnexures(doc: jsPDF, data: any, kind: LoanKind): void {
  const productName = kind === 'HOME' ? 'Home Loan' : 'Vehicle Loan';
  const loanAmount = money(data.loanDetails?.loanAmount);
  const tenure = value(data.loanDetails?.tenure);
  const emi = money(data.loanDetails?.emi);
  const rate = percent(data.loanDetails?.interestRate);
  const formNo = value(data.applicationFormNo);

  let y = title(doc, 'Sanction & Credit Appraisal Summary');
  y = section(doc, y, 'Application Snapshot');
  y = twoCol(doc, y, ['Product', productName], ['Application No.', formNo]);
  y = twoCol(doc, y, ['Applicant', applicantName(data)], ['Co-Applicant', coApplicantName(data)]);
  y = twoCol(doc, y, ['Guarantor', guarantorName(data)], ['Application Date', value(data.applicationDate)]);
  y = twoCol(doc, y, ['Requested Amount', loanAmount], ['Sanctioned Amount', 'To be filled by Admin']);
  y = twoCol(doc, y, ['Tenure', tenure ? `${tenure} months` : '-'], ['Interest Rate', rate]);
  y = twoCol(doc, y, ['Estimated EMI', emi], ['Repayment Mode', 'Monthly EMI / as sanctioned']);

  y = section(doc, y + 4, 'Credit Decision');
  y = twoCol(doc, y, ['Decision', 'Approved / Rejected / Queried'], ['Risk Category', 'Low / Medium / High']);
  y = twoCol(doc, y, ['Processing Fee', 'To be filled by Admin'], ['Margin / Down Payment', 'To be filled by Admin']);
  y = kv(doc, y, 'Sanction Conditions', 'Subject to KYC verification, document scrutiny, repayment capacity checks, asset/property valuation, and execution of loan agreement.');
  y = box(doc, y, 'Final sanction terms must be entered by the approving authority before disbursement. If sanctioned terms differ from requested terms, the sanction letter and repayment schedule will prevail.');

  y = section(doc, y, 'Disbursement Controls');
  y = twoCol(doc, y, ['Disbursement Date', '____________________'], ['Disbursement Amount', 'Rs. __________________']);
  y = twoCol(doc, y, ['Payment Reference', '____________________'], ['Mode', 'Cash / Bank / UPI / Cheque']);
  y = drawSignatureGrid(doc, y + 6);

  y = title(doc, 'Repayment, Charges & Penalty Terms');
  y = drawRepaymentSchedule(doc, y, data);

  y = section(doc, y, 'Charges and Penalty Rules');
  y = tableHeader(doc, y, ['Particulars', 'Current Rule / Value', 'Remarks'], [55, 55, 70]);
  [
    ['EMI Collection', 'Regular EMI only', 'Penalty is not collected with monthly EMI.'],
    ['Late Payment Penalty', 'As configured in system settings', 'Daily penalty accrues after EMI due date until that EMI is paid.'],
    ['Penalty Settlement', 'At loan closure', 'Admin may discount/waive penalty during final document completion.'],
    ['Pre-Closure', 'As approved by Admin', 'Subject to outstanding principal, interest, charges, and applicable approvals.'],
    ['Document Charges', 'To be filled by Admin', 'If applicable.'],
    ['Legal / Valuation Charges', 'To be filled by Admin', kind === 'HOME' ? 'Applicable for property verification where required.' : 'Applicable for asset verification where required.'],
  ].forEach((r) => { y = tableRow(doc, y, r, [55, 55, 70]); });

  y = box(doc, y + 4, 'Penalty accounting: generated penalty, discounted penalty, and collected penalty must be recorded separately. Only actually collected penalty is treated as penalty income / net profit.');

  y = title(doc, 'Completion & Closure Certificate');
  y = section(doc, y, 'To Be Filled at Final Closure');
  y = twoCol(doc, y, ['All EMIs Paid', 'Yes / No'], ['Closure Date', '____________________']);
  y = twoCol(doc, y, ['Total Penalty Generated', 'Rs. __________________'], ['Penalty Discount', 'Rs. __________________']);
  y = twoCol(doc, y, ['Penalty Collected', 'Rs. __________________'], ['Final Status', 'Closed / Pending']);
  y = kv(doc, y, 'Closure Confirmation', 'Loan shall be marked completed only after all EMIs are paid and final penalty is collected or waived by authorized admin.');
  y = drawSignatureGrid(doc, y + 8);
}
