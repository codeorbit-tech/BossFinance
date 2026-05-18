'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { loansApi, cashfreeApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface LoanApplication {
  id: string;
  loanNumber?: string | null;
  customer: {
    customerId: string;
    name: string;
    phone?: string;
    aadhaar?: string;
    pan?: string;
  };
  loanType: string;
  amount: number;
  emi: number;
  tenure: number;
  createdAt: string;
  createdBy: {
    name: string;
  };
  status: string;
  pdfUrl: string | null;
  fullData?: string | null;
  queryDescription?: string;
  subscriptionStatus?: string | null;
  razorpaySubscriptionId?: string | null;
  subscriptionShortUrl?: string | null;
  frequency?: string;
  interestRate?: number;
  purpose?: string;
  guarantorName?: string;
  guarantorPhone?: string;
}

// ─── Autopay Status Badge ──────────────────────────────────────────────────────
function AutopayBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;

  const config: Record<string, { label: string; bg: string; dot: string }> = {
    active: {
      label: 'Autopay Active',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    pending_authorization: {
      label: 'Awaiting Mandate',
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500 animate-pulse',
    },
    halted: {
      label: 'Autopay Halted',
      bg: 'bg-red-50 border-red-200 text-red-700',
      dot: 'bg-red-500',
    },
    cancelled: {
      label: 'Autopay Cancelled',
      bg: 'bg-slate-50 border-slate-200 text-slate-500',
      dot: 'bg-slate-400',
    },
  };

  const c = config[status] ?? config['halted'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── Autopay Setup Modal ───────────────────────────────────────────────────────
function AutopayModal({
  loan,
  onClose,
  onSuccess,
}: {
  loan: LoanApplication;
  onClose: () => void;
  onSuccess: (shortUrl: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(loan.subscriptionShortUrl || null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    toast.error('Autopay Subscriptions are currently disabled or not configured.');
  };

  const handleSendPaymentLink = async () => {
    setLoading(true);
    try {
      await cashfreeApi.sendPaymentLink(loan.id);
      toast.success('Payment Link generated and sent to customer via SMS/Email!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const isAlreadySetup = !!loan.subscriptionStatus;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  autorenew
                </span>
              </div>
              <div>
                <p className="font-bold text-white tracking-wide text-lg">Payment Action</p>
                <p className="text-white/70 text-xs">Setup Autopay or Send Manual Payment Link</p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {/* Loan summary chips */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold">
                {loan?.customer?.name || 'Customer'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold">
                ₹{loan?.emi?.toLocaleString('en-IN') || '0'}/mo
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold">
                {loan?.tenure || '0'} EMIs
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold uppercase">
                {loan?.loanType?.toLowerCase() || 'loan'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</p>
            
            <button
              onClick={handleSendPaymentLink}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mb-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-sm">send_money</span>
              )}
              Send Immediate Payment Link (UPI/Card)
            </button>

            <button
              onClick={handleCreate}
              className="w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">autorenew</span>
              Create Autopay Subscription (Unavailable)
            </button>
            <p className="text-center text-[10px] text-slate-400">Autopay requires Cashfree subscription features.</p>
          </div>

          {/* Current status if already set up */}
          {isAlreadySetup && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/20 bg-surface-container">
              <span className="text-sm font-bold text-on-surface-variant">Current Status:</span>
              <AutopayBadge status={loan.subscriptionStatus} />
            </div>
          )}

          {/* Short URL display */}
          {shortUrl ? (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mandate Link — Share with Customer</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 font-mono text-xs text-indigo-700 truncate">
                  {shortUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    copied
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full justify-center py-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-all"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Open Mandate Page
              </a>
            </div>
          )}

          <div className="p-4 bg-slate-50 border-t flex justify-center items-center text-xs text-slate-400 font-medium">
            Requires valid Cashfree credentials &amp; Subscriptions feature enabled on your account.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field Row Helper ─────────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (!value && value !== 0 && value !== false) return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-medium text-on-surface break-words">{display}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const hasContent = Array.isArray(children)
    ? (children as React.ReactNode[]).some(Boolean)
    : !!children;
  if (!hasContent) return null;
  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-outline-variant/10 bg-surface-container">
        <span className="material-symbols-outlined text-accent text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h4 className="text-[11px] sm:text-xs font-black text-tertiary uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4">
        {children}
      </div>
    </div>
  );
}

// ─── Loan Detail Modal ─────────────────────────────────────────────────────────
function LoanDetailModal({ 
  loan, 
  onClose,
  onApprove,
  onQuery
}: { 
  loan: LoanApplication; 
  onClose: () => void;
  onApprove: (id: string) => void;
  onQuery: (loan: LoanApplication) => void;
}) {
  const raw = (() => {
    try { 
      if (!loan.fullData) return null;
      let parsed = JSON.parse(loan.fullData);
      // Handle double serialization
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    } catch { 
      return null; 
    }
  })();

  const f = raw || {};

  // Detect loan type category
  const isSimple = ['DAILY', 'WEEKLY'].includes(f.frequency || loan.frequency || '');
  const isVehicle = loan.loanType === 'VEHICLE';
  const isHome = loan.loanType === 'HOME';

  // For vehicle loans the data lives inside nested objects
  const ap = f.applicantPersonal || {};
  const ac = f.applicantContact || {};
  const ab = f.applicantBank || {};
  const gp = f.guarantorPersonal || {};
  const gc = f.guarantorContact || {};
  const ld = f.loanDetails || {};

  const fmtName = (p: Record<string, string>) =>
    [p?.firstName, p?.middleName, p?.lastName].filter(Boolean).join(' ');

  const fmtAddr = (a: Record<string, string>) =>
    [a?.fullAddress, a?.city, a?.district, a?.state, a?.pinCode].filter(Boolean).join(', ');

  const applicantName    = f.applicantName || fmtName(ap) || loan.customer?.name || '—';
  const applicantMobile  = f.mobile || ac?.mobile || loan.customer?.phone || '—';
  const applicantAadhaar = f.aadhaarNo || f.aadhaar || loan.customer?.aadhaar || '—';
  const applicantPAN     = f.panNo || f.pan || loan.customer?.pan || '—';

  return (
    <div className="fixed inset-0 z-[80] flex items-center sm:items-start justify-center p-2 sm:p-4 sm:pt-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden my-auto sm:mb-10">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-tertiary via-secondary to-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Loan Application Review</p>
              <h3 className="text-base sm:text-lg font-black leading-tight">{applicantName}</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/15 text-[10px] sm:text-xs font-bold capitalize">{loan.loanType?.toLowerCase()}</span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/15 text-[10px] sm:text-xs font-bold">₹{loan.amount?.toLocaleString('en-IN')}</span>
                {loan.frequency && <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/15 text-[10px] sm:text-xs font-bold capitalize">{loan.frequency?.toLowerCase()}</span>}
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/15 text-[10px] sm:text-xs font-bold">{loan.tenure} {isSimple ? 'days/wks' : 'months'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-6 overflow-y-auto max-h-[65vh] sm:max-h-[70vh]">
          {!raw ? (
            <div className="text-center py-10 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">description</span>
              <p className="text-sm font-bold">No detailed data available for this application.</p>
              <p className="text-xs mt-1 opacity-60">This loan was created before full-data capture was enabled.</p>
            </div>
          ) : (
            <>
              {/* Loan Summary */}
              <SectionCard title="Loan Details" icon="payments">
                <FieldRow label="Form No" value={f.applicationFormNo || '—'} />
                <FieldRow label="Application Date" value={f.applicationDate} />
                <FieldRow label="Loan Type" value={loan.loanType} />
                <FieldRow label="Loan Amount" value={loan.amount ? `₹${loan.amount.toLocaleString('en-IN')}` : (f.loanAmount ? `₹${parseFloat(f.loanAmount).toLocaleString('en-IN')}` : ld.loanAmount ? `₹${parseFloat(ld.loanAmount).toLocaleString('en-IN')}` : undefined)} />
                <FieldRow label="EMI" value={loan.emi ? `₹${loan.emi.toLocaleString('en-IN')}` : (f.emi ? `₹${parseFloat(f.emi).toLocaleString('en-IN')}` : ld.emi ? `₹${parseFloat(ld.emi).toLocaleString('en-IN')}` : undefined)} />
                <FieldRow label="Tenure" value={f.tenure || ld.tenure || loan.tenure} />
                <FieldRow label="Interest Rate" value={f.interestRate || ld.interestRate || loan.interestRate} />
                <FieldRow label="Frequency" value={f.frequency || loan.frequency} />
                <FieldRow label="Purpose" value={f.purpose || loan.purpose} />
              </SectionCard>

              {/* Applicant */}
              <SectionCard title="Applicant Details" icon="person">
                <FieldRow label="Name" value={applicantName} />
                <FieldRow label="Entity Type" value={f.applicantEntityType} />
                <FieldRow label="Father / Husband" value={f.fatherHusbandName || (ap?.fatherFirstName ? `${ap.fatherFirstName} ${ap.fatherLastName || ''}`.trim() : undefined)} />
                <FieldRow label="Mother's Name" value={ap?.motherFirstName ? `${ap.motherFirstName} ${ap.motherLastName || ''}`.trim() : undefined} />
                <FieldRow label="Date of Birth" value={f.dob || ap?.dob} />
                <FieldRow label="Gender" value={f.gender || ap?.gender} />
                <FieldRow label="Mobile" value={applicantMobile} />
                <FieldRow label="Alternate Mobile" value={f.alternateMobile || ac?.alternateMobile} />
                <FieldRow label="Email" value={f.email || ac?.email} />
                <FieldRow label="Aadhaar No" value={applicantAadhaar} />
                <FieldRow label="PAN No" value={applicantPAN} />
                <FieldRow label="CKYC ID" value={f.applicantCkycId} />
                <FieldRow label="GSTIN" value={f.applicantGstin || f.gstNo} />
                {f.udyamRegNo && <FieldRow label="Udyam Reg No" value={f.udyamRegNo} />}
                <FieldRow label="Occupation" value={f.occupation} />
                <FieldRow label="Religion" value={ap?.religion} />
                <FieldRow label="Category" value={ap?.category} />
                <FieldRow label="Preferred Language" value={ap?.preferredLanguage} />
              </SectionCard>

              {/* Address */}
              <SectionCard title="Address" icon="location_on">
                <FieldRow label="Address" value={f.address || f.communicationAddress || fmtAddr(ac?.communicationAddress)} />
                <FieldRow label="Landmark" value={ac?.communicationAddress?.landmark} />
                <FieldRow label="City" value={f.communicationCity || ac?.communicationAddress?.city} />
                <FieldRow label="State" value={f.communicationState || ac?.communicationAddress?.state} />
                <FieldRow label="Pincode" value={f.communicationPinCode || ac?.communicationAddress?.pinCode} />
                {!f.permanentSameAsCommunication && !ac?.permanentSameAsCommunication && (
                  <FieldRow label="Permanent Address" value={f.permanentAddress || fmtAddr(ac?.permanentAddress)} />
                )}
                <FieldRow label="Shop/Business Address" value={f.shopAddress || f.businessAddress} />
              </SectionCard>

              {/* Bank */}
              <SectionCard title="Bank Details" icon="account_balance">
                <FieldRow label="Bank Name" value={f.bankName || ab?.bankName || f.applicantBank?.bankName} />
                <FieldRow label="Branch" value={f.branch || ab?.branch || f.applicantBank?.branch} />
                <FieldRow label="Account No" value={f.accountNo || ab?.accountNo || f.applicantBank?.accountNo} />
                <FieldRow label="Account Type" value={f.accountType || ab?.accountType || f.applicantBank?.accountType} />
                <FieldRow label="IFSC Code" value={f.ifscCode || ab?.ifscCode || f.applicantBank?.ifscCode} />
                <FieldRow label="Account Since" value={f.applicantBank?.accountSince} />
                <FieldRow label="Avg Monthly Income" value={f.avgMonthlyIncome} />
                <FieldRow label="Avg Debit/Month" value={f.applicantBank?.avgDebitPerMonth} />
                <FieldRow label="Avg Credit/Month" value={f.applicantBank?.avgCreditPerMonth} />
              </SectionCard>

              {/* Business / Employment */}
              {(f.shopName || f.businessName || f.employerName || f.designation || f.applicantEmployment?.establishmentName) && (
                <SectionCard title="Business / Employment" icon="work">
                  <FieldRow label="Establishment / Business" value={f.shopName || f.businessName || f.employerName || f.applicantEmployment?.establishmentName} />
                  <FieldRow label="Designation" value={f.designation || f.applicantEmployment?.designation} />
                  <FieldRow label="Business Type" value={f.businessType} />
                  <FieldRow label="Years in Business" value={f.yearsInBusiness} />
                  <FieldRow label="Annual Turnover" value={f.annualTurnover} />
                  <FieldRow label="Monthly Income" value={f.monthlyIncome} />
                  <FieldRow label="Years of Employment" value={f.yearsOfEmployment || f.applicantEmployment?.yearsOfEmployment} />
                  <FieldRow label="Annual CTC" value={f.annualCTC || f.applicantEmployment?.ctcPerAnnum} />
                </SectionCard>
              )}

              {/* Co-Applicant */}
              {(f.coApplicantName || f.coApplicantPersonal?.firstName) && (
                <SectionCard title="Co-Applicant" icon="group">
                  <FieldRow label="Name" value={f.coApplicantName || fmtName(f.coApplicantPersonal)} />
                  <FieldRow label="Entity Type" value={f.coApplicantEntityType} />
                  <FieldRow label="Father / Husband" value={f.coApplicantFatherHusbandName || (f.coApplicantPersonal?.fatherFirstName ? `${f.coApplicantPersonal.fatherFirstName} ${f.coApplicantPersonal.fatherLastName || ''}`.trim() : undefined)} />
                  <FieldRow label="Relation" value={f.coApplicantRelation} />
                  <FieldRow label="Mobile" value={f.coApplicantMobile || f.coApplicantContact?.mobile} />
                  <FieldRow label="Aadhaar No" value={f.coApplicantAadhaarNo} />
                  <FieldRow label="PAN No" value={f.coApplicantPanNo} />
                  <FieldRow label="CKYC ID" value={f.coApplicantCkycId} />
                  <FieldRow label="GSTIN" value={f.coApplicantGstin} />
                  <FieldRow label="Gender" value={f.coApplicantGender || f.coApplicantPersonal?.gender} />
                  <FieldRow label="DOB" value={f.coApplicantDob || f.coApplicantPersonal?.dob} />
                  <FieldRow label="Occupation" value={f.coApplicantOccupation} />
                  <FieldRow label="Religion" value={f.coApplicantPersonal?.religion} />
                  <FieldRow label="Category" value={f.coApplicantPersonal?.category} />
                  <FieldRow label="Address" value={f.coApplicantAddress || fmtAddr(f.coApplicantContact?.communicationAddress)} />
                  <FieldRow label="Bank Name" value={f.coApplicantBankName || f.coApplicantBank?.bankName} />
                  <FieldRow label="Account No" value={f.coApplicantAccountNo || f.coApplicantBank?.accountNo} />
                  <FieldRow label="IFSC Code" value={f.coApplicantIfscCode || f.coApplicantBank?.ifscCode} />
                </SectionCard>
              )}

              {/* Guarantor */}
              {(f.guarantorName || loan.guarantorName || gp?.firstName) && (
                <SectionCard title="Guarantor" icon="verified_user">
                  <FieldRow label="Name" value={f.guarantorName || loan.guarantorName || fmtName(gp)} />
                  <FieldRow label="Entity Type" value={f.guarantorEntityType} />
                  <FieldRow label="Father / Husband" value={f.guarantorFatherHusbandName || (gp?.fatherFirstName ? `${gp.fatherFirstName} ${gp.fatherLastName || ''}`.trim() : undefined)} />
                  <FieldRow label="Relation" value={f.guarantorRelation} />
                  <FieldRow label="Mobile" value={f.guarantorMobile || loan.guarantorPhone || gc?.mobile} />
                  <FieldRow label="Aadhaar No" value={f.guarantorAadhaarNo} />
                  <FieldRow label="PAN No" value={f.guarantorPanNo} />
                  <FieldRow label="CKYC ID" value={f.guarantorCkycId} />
                  <FieldRow label="GSTIN" value={f.guarantorGstin} />
                  <FieldRow label="Gender" value={f.guarantorGender || gp?.gender} />
                  <FieldRow label="DOB" value={f.guarantorDob || gp?.dob} />
                  <FieldRow label="Religion" value={gp?.religion} />
                  <FieldRow label="Category" value={gp?.category} />
                  <FieldRow label="Occupation" value={f.guarantorOccupation} />
                  <FieldRow label="Address" value={f.guarantorAddress || fmtAddr(gc?.communicationAddress)} />
                </SectionCard>
              )}

              {/* Vehicle-specific */}
              {isVehicle && f.applicantVehiclesOwned?.length > 0 && (
                <SectionCard title="Vehicles Owned" icon="directions_car">
                  {f.applicantVehiclesOwned.map((v: Record<string, string>, i: number) => (
                    <FieldRow key={i} label={`Vehicle ${i + 1}`} value={[v.vehicle, v.makeModel, v.registrationNo].filter(Boolean).join(' | ')} />
                  ))}
                </SectionCard>
              )}

              {/* Residence & Education */}
              {(f.applicantResidence?.residence || ap?.education) && (
                <SectionCard title="Residence & Education" icon="home">
                  <FieldRow label="Residence Type" value={f.applicantResidence?.residence} />
                  <FieldRow label="Years of Stay" value={f.applicantResidence?.yearsOfStay} />
                  <FieldRow label="Education" value={ap?.education} />
                  <FieldRow label="Marital Status" value={ap?.maritalStatus} />
                  <FieldRow label="Dependents" value={ap?.numberOfDependents} />
                </SectionCard>
              )}

              {/* Property Details (Home / Vehicle) */}
              {(f.propertyDetails || f.immovableProperties?.length > 0 || f.movablePropertyDescription) && (
                <SectionCard title="Asset / Property Details" icon="real_estate_agent">
                  {f.propertyDetails && (
                    <>
                      <FieldRow label="Property Type" value={f.propertyDetails?.propertyType} />
                      <FieldRow label="Locality" value={f.propertyDetails?.locality} />
                      <FieldRow label="Survey No" value={f.propertyDetails?.surveyNo} />
                      <FieldRow label="Patta No" value={f.propertyDetails?.pattaNo} />
                      <FieldRow label="Land Area" value={f.propertyDetails?.landArea} />
                      <FieldRow label="Built-Up Area" value={f.propertyDetails?.builtUpArea} />
                      <FieldRow label="Market Value" value={f.propertyDetails?.marketValue} />
                    </>
                  )}
                  {f.movablePropertyDescription && (
                    <>
                      <FieldRow label="Movable Asset" value={f.movablePropertyDescription} />
                      <FieldRow label="Movable Asset Value" value={f.movablePropertyValue} />
                    </>
                  )}
                  {f.immovableProperties?.map((p: any, i: number) => (
                    <div key={i} className="col-span-1 sm:col-span-2 lg:col-span-3 border-t border-outline-variant/20 pt-4 mt-2 first:border-0 first:pt-0 first:mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                        <FieldRow label={`Immovable Prop ${i+1}`} value={p.assetType === 'Others' ? p.assetTypeOther : p.assetType} />
                        <FieldRow label="Land Area" value={p.landArea} />
                        <FieldRow label="Built-Up Area" value={p.builtUpArea} />
                        <FieldRow label="Declared Value" value={p.declaredValue} />
                      </div>
                    </div>
                  ))}
                </SectionCard>
              )}

              {/* KYC Documents Checklist */}
              {f.kycDocuments && (
                <SectionCard title="KYC Verification" icon="verified">
                  {Object.entries(f.kycDocuments).map(([key, doc]: [string, any]) => (
                     doc.applicantDocNo ? <FieldRow key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={doc.applicantDocNo} /> : null
                  ))}
                </SectionCard>
              )}

              {/* Pre/Post Disbursement Docs Checklist */}
              {(f.preSanctionDocs || f.postDisbursementDocs) && (
                <SectionCard title="Documents Checklist" icon="checklist">
                  {f.preSanctionDocs && Object.entries(f.preSanctionDocs).map(([key, val]) => (
                     typeof val === 'boolean' ? <FieldRow key={key} label={`Pre: ${key}`} value={val} /> : null
                  ))}
                  {f.postDisbursementDocs && Object.entries(f.postDisbursementDocs).map(([key, val]) => (
                     typeof val === 'boolean' ? <FieldRow key={key} label={`Post: ${key}`} value={val} /> : null
                  ))}
                </SectionCard>
              )}
            </>
          )}
        </div>

        <div className="px-4 sm:px-5 py-4 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-end gap-3 bg-surface-container-low">
          {(loan.status === 'PENDING' || loan.status === 'QUERIED') && (
            <>
              <button
                onClick={() => { onQuery(loan); onClose(); }}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">help_outline</span>
                Send Query
              </button>
              <button
                onClick={() => { onApprove(loan.id); onClose(); }}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-accent text-white font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Approve Loan
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-outline-variant/30 text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LoanApplicationsPage() {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoan, setDetailLoan] = useState<LoanApplication | null>(null);

  // Query Modal
  const [queryModalLoan, setQueryModalLoan] = useState<LoanApplication | null>(null);
  const [queryText, setQueryText] = useState('');

  // Autopay Modal
  const [autopayLoan, setAutopayLoan] = useState<LoanApplication | null>(null);

  // Disburse Modal
  const [disburseModalLoan, setDisburseModalLoan] = useState<LoanApplication | null>(null);
  const [disbursementMethod, setDisbursementMethod] = useState('BANK_TRANSFER');
  const [isDisbursing, setIsDisbursing] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [page]);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const res = await loansApi.list({ page: page.toString(), limit: '10' });
      setLoans(res.data.loans);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to fetch loan applications');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLoans = async () => {
    const res = await loansApi.list({ page: page.toString(), limit: '10' });
    setLoans(res.data.loans);
    setTotalPages(res.data.totalPages);
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this loan?')) return;
    try {
      await loansApi.approve(id);
      toast.success('Loan approved successfully');
      refreshLoans();
    } catch {
      toast.error('Failed to approve loan');
    }
  };

  const handleDisburse = async () => {
    if (!disburseModalLoan) return;
    setIsDisbursing(true);
    try {
      const res = await loansApi.disburse(disburseModalLoan.id, disbursementMethod);
      toast.success('Loan disbursed successfully');
      
      // If the backend auto-generated a Razorpay link, show it immediately!
      if (res.data.subscriptionShortUrl) {
        const updatedLoan = res.data.loan;
        setAutopayLoan({
          ...updatedLoan,
          subscriptionShortUrl: res.data.subscriptionShortUrl,
          subscriptionStatus: 'pending_authorization'
        });
      }
      
      setDisburseModalLoan(null);
      refreshLoans();
    } catch (err: any) {
      toast.error('Failed to disburse loan: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDisbursing(false);
    }
  };

  const handleOpenQueryModal = (loan: LoanApplication) => {
    setQueryModalLoan(loan);
    setQueryText('');
  };

  const handleSubmitQuery = async () => {
    if (!queryModalLoan || !queryText.trim()) return;
    try {
      await loansApi.query(queryModalLoan.id, queryText);
      toast.success('Query sent to employee');
      setQueryModalLoan(null);
      refreshLoans();
    } catch (err: any) {
      toast.error('Failed to send query: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  // After subscription created, optimistically update the row
  const handleAutopaySuccess = (shortUrl: string) => {
    if (!autopayLoan) return;
    setLoans(prev =>
      prev.map(l =>
        l.id === autopayLoan.id
          ? { ...l, subscriptionStatus: 'pending_authorization', subscriptionShortUrl: shortUrl }
          : l
      )
    );
  };

  return (
    <div className="pb-10 relative">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">
            Loan Applications
          </h2>
          <p className="text-on-surface-variant text-sm">
            Review, approve, query incoming applications — and setup Cashfree Autopay after disbursement.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/20">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-on-surface-variant font-bold animate-pulse">Loading applications...</div>
          ) : loans.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-bold">No applications found.</div>
          ) : (
            <>
              <div className="block lg:hidden divide-y divide-surface-container">
              {loans.map((app) => (
                <div key={app.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-tertiary">{app.customer?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{app.loanNumber || app.customer?.customerId || 'N/A'}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                    <div>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-widest mb-0.5">Loan Type</p>
                      <p className="text-xs font-bold text-on-surface capitalize">{app.loanType.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-widest mb-0.5">Amount</p>
                      <p className="text-sm font-black text-tertiary">₹{app.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-[11px] font-medium text-on-surface-variant">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-widest mb-0.5">Employee</p>
                      <p className="text-[11px] font-medium text-on-surface-variant truncate">{app.createdBy?.name || 'Auto'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setDetailLoan(app)}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-accent/10 text-accent font-bold text-xs"
                    >
                      <span className="material-symbols-outlined text-lg">description</span>
                      Details
                    </button>
                    {(app.status === 'PENDING' || app.status === 'QUERIED') && (
                      <>
                        <button onClick={() => handleApprove(app.id)} className="flex-1 h-10 rounded-lg bg-accent text-white font-bold text-[10px]">Approve</button>
                        <button onClick={() => handleOpenQueryModal(app)} className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-bold text-[10px]">Query</button>
                      </>
                    )}
                    {app.status === 'APPROVED' && (
                      <button onClick={() => { setDisbursementMethod('BANK_TRANSFER'); setDisburseModalLoan(app); }} className="w-full h-10 rounded-lg bg-primary text-white font-bold text-[10px]">Disburse Funds</button>
                    )}
                    {app.status === 'ACTIVE' && (
                      <button onClick={() => setAutopayLoan(app)} className="w-full h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[10px] flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">autorenew</span>
                        Setup Autopay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <table className="hidden lg:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 border-b border-surface-container">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 border-b border-surface-container">Loan Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right border-b border-surface-container">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 border-b border-surface-container">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 border-b border-surface-container">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 border-b border-surface-container">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 border-b border-surface-container">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {loans.map((app) => (
                  <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-tertiary whitespace-nowrap">{app.customer?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase">{app.loanNumber || '—'}</p>
                      <p className="text-[10px] text-on-surface-variant/60">{app.customer?.customerId || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant capitalize">{app.loanType.toLowerCase()}</td>
                    <td className="px-6 py-5 text-right font-bold text-tertiary">₹{app.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant whitespace-nowrap">
                      <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] opacity-70">
                        {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant whitespace-nowrap">
                      {app.createdBy?.name || 'System / Auto'}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={app.status} />
                      {app.status === 'QUERIED' && (
                        <p className="text-[9px] text-blue-600 mt-1 max-w-[120px] truncate" title={app.queryDescription}>
                          Q: {app.queryDescription}
                        </p>
                      )}
                      {/* Autopay badge shown on ACTIVE loans */}
                      {app.status === 'ACTIVE' && (
                        <div className="mt-1.5">
                          <AutopayBadge status={app.subscriptionStatus} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* View Details */}
                        <button
                          onClick={() => setDetailLoan(app)}
                          className="flex items-center gap-1.5 font-bold text-xs text-accent hover:text-accent-dark transition-colors group"
                        >
                          <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                          <span>Details</span>
                        </button>

                        {/* Approve / Query */}
                        {(app.status === 'PENDING' || app.status === 'QUERIED') && (
                          <div className="flex items-center gap-2 border-l border-surface-container pl-3">
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="px-3 py-1.5 bg-accent text-white text-[10px] font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenQueryModal(app)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                            >
                              Query
                            </button>
                          </div>
                        )}

                        {/* Disburse */}
                        {app.status === 'APPROVED' && (
                          <div className="flex items-center gap-2 border-l border-surface-container pl-3">
                            <button
                              onClick={() => {
                                setDisbursementMethod('BANK_TRANSFER');
                                setDisburseModalLoan(app);
                              }}
                              className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                            >
                              Disburse Funds
                            </button>
                          </div>
                        )}

                        {/* Setup Autopay — shown on ACTIVE loans */}
                        {app.status === 'ACTIVE' && (
                          <div className="flex items-center gap-2 border-l border-surface-container pl-3">
                            <button
                              onClick={() => setAutopayLoan(app)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all shadow-sm active:scale-95 ${
                                app.subscriptionStatus === 'active'
                                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                  : app.subscriptionStatus === 'pending_authorization'
                                  ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                autorenew
                              </span>
                              {app.subscriptionStatus === 'active'
                                ? 'Autopay ✓'
                                : app.subscriptionStatus === 'pending_authorization'
                                ? 'Share Link'
                                : 'Setup Autopay'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
        {!isLoading && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* ── Query Modal ──────────────────────────────────────── */}
      {queryModalLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold text-lg">Send Query to Employee</h3>
              <button onClick={() => setQueryModalLoan(null)} className="hover:bg-white/10 rounded-full p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Explain what needs to be corrected in <strong>{queryModalLoan.customer?.name || 'this'}&apos;s</strong> application.
              </p>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g. Missing bank statement for the last 3 months, or Aadhaar photo is blurry."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
              <button
                onClick={handleSubmitQuery}
                disabled={!queryText.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Autopay Modal ─────────────────────────────────────── */}
      {autopayLoan && (
        <AutopayModal
          loan={autopayLoan}
          onClose={() => setAutopayLoan(null)}
          onSuccess={handleAutopaySuccess}
        />
      )}

      {/* ── Disburse Modal ─────────────────────────────────────── */}
      {disburseModalLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-primary text-white">
              <h3 className="font-bold text-lg">Disburse Loan</h3>
              <button onClick={() => setDisburseModalLoan(null)} className="hover:bg-white/10 rounded-full p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-600">
                Confirm disbursement for <strong>{disburseModalLoan.customer?.name}</strong>. This will activate the loan and generate the EMI schedule.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Select Disbursement Method
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/IMPS/RTGS)', icon: 'account_balance' },
                    { id: 'UPI', label: 'UPI', icon: 'qr_code_scanner' },
                    { id: 'CASH', label: 'Cash', icon: 'payments' },
                    { id: 'CHEQUE', label: 'Cheque', icon: 'request_quote' },
                    { id: 'CASHFREE_PAYMENT_LINK', label: 'Cashfree Payment Link (Auto-send on Due Date)', icon: 'link' },
                    { id: 'CASHFREE_PAYOUT', label: 'Cashfree Payout (Instant Transfer)', icon: 'send' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        disbursementMethod === method.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-outline-variant/20 hover:border-outline-variant/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="disbursementMethod"
                        value={method.id}
                        checked={disbursementMethod === method.id}
                        onChange={(e) => setDisbursementMethod(e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="material-symbols-outlined text-slate-500">{method.icon}</span>
                      <span className={`text-sm font-bold ${disbursementMethod === method.id ? 'text-primary' : 'text-slate-700'}`}>
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setDisburseModalLoan(null)}
                  className="flex-1 bg-surface-container py-3 rounded-xl font-bold text-on-surface hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisburse}
                  disabled={isDisbursing}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  {isDisbursing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Disburse'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loan Detail Modal ──────────────────────────────────── */}
      {detailLoan && (
        <LoanDetailModal 
          loan={detailLoan} 
          onClose={() => setDetailLoan(null)}
          onApprove={handleApprove}
          onQuery={handleOpenQueryModal}
        />
      )}
    </div>
  );
}
