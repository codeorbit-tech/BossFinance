'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { loansApi, cashfreeApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface LoanApplication {
  id: string;
  customer: {
    customerId: string;
    name: string;
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
  queryDescription?: string;
  subscriptionStatus?: string | null;
  razorpaySubscriptionId?: string | null;
  subscriptionShortUrl?: string | null;
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
    setLoading(true);
    try {
      const res = await cashfreeApi.createSubscription(loan.id);
      const url = res.data.shortUrl;
      setShortUrl(url);
      onSuccess(url);
      toast.success('Autopay subscription created!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create subscription');
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
                <p className="font-bold text-white tracking-wide text-lg">Cashfree Autopay</p>
                <p className="text-white/70 text-xs">Cashfree Subscription EMI</p>
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
          {/* How it works */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">How It Works</p>
            {[
              { icon: 'link', text: 'A unique mandate link is generated via Cashfree' },
              { icon: 'share', text: 'Share the link via WhatsApp, Email, or SMS' },
              { icon: 'verified_user', text: 'Customer authorizes mandate using UPI or Netbanking' },
              { icon: 'autorenew', text: 'Cashfree auto-debits EMI every month — no manual action' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-indigo-500 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
                <p className="text-xs text-slate-600">{text}</p>
              </div>
            ))}
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
          ) : (
            <button
              onClick={isAlreadySetup ? handleCreate : handleCreate}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Subscription...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>autorenew</span>
                  {isAlreadySetup ? 'Regenerate Autopay Link' : 'Create Autopay Subscription'}
                </>
              )}
            </button>
          )}

          <div className="p-4 bg-slate-50 border-t flex justify-center items-center text-xs text-slate-400 font-medium">
            Requires valid Cashfree credentials &amp; Subscriptions feature enabled on your account.
          </div>
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
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

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

  const triggerPdfDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPdf = (url: string | null) => {
    if (!url) { toast.error('No PDF recorded for this application'); return; }
    const fullUrl = url.startsWith('/')
      ? `${window.location.origin}${url}`
      : url;
    triggerPdfDownload(fullUrl);
    setSelectedPdf(fullUrl);
  };

  const getFullPdfUrl = (url: string | null) => {
    if (!url) return null;
    return url.startsWith('/') ? `${window.location.origin}${url}` : url;
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
            <table className="w-full text-left border-collapse">
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
                      <p className="text-[10px] text-on-surface-variant">{app.customer?.customerId || 'N/A'}</p>
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
                        {/* View PDF */}
                        <button
                          onClick={() => openPdf(app.pdfUrl)}
                          className={`flex items-center gap-1.5 font-bold text-xs transition-colors group ${app.pdfUrl ? 'text-accent hover:text-accent-dark' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>PDF</span>
                        </button>
                        {app.pdfUrl && (
                          <a
                            href={getFullPdfUrl(app.pdfUrl) || '#'}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-bold text-xs text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span>Download</span>
                          </a>
                        )}

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
                    { id: 'CASHFREE_AUTOPAY', label: 'Cashfree Autopay (Auto-setup)', icon: 'autorenew' },
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

      {/* ── PDF Modal ─────────────────────────────────────────── */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
              <h3 className="font-bold text-tertiary">Document Preview</h3>
              <button
                onClick={() => setSelectedPdf(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high text-tertiary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-surface-container-highest">
              <iframe src={`${selectedPdf}#toolbar=0`} className="w-full h-full border-none" title="PDF Preview" />
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end bg-surface-container-low">
              <button
                onClick={() => setSelectedPdf(null)}
                className="px-6 py-2 bg-tertiary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
