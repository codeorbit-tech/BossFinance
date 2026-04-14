'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { loansApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface LoanApplication {
  id: string;
  customer: {
    customerId: string;
    name: string;
  };
  loanType: string;
  amount: number;
  createdAt: string;
  createdBy: {
    name: string;
  };
  status: string;
  pdfUrl: string | null;
  queryDescription?: string;
}

export default function LoanApplicationsPage() {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  
  // Query Modal State
  const [queryModalLoan, setQueryModalLoan] = useState<LoanApplication | null>(null);
  const [queryText, setQueryText] = useState('');

  useEffect(() => {
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
    fetchLoans();
  }, [page]);

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

  const handleDisburse = async (id: string) => {
    if (!confirm('Confirm disbursement? This will start the EMI schedule.')) return;
    try {
      await loansApi.disburse(id);
      toast.success('Loan disbursed successfully');
      refreshLoans();
    } catch {
      toast.error('Failed to disburse loan');
    }
  };

  const refreshLoans = async () => {
    const res = await loansApi.list({ page: page.toString(), limit: '10' });
    setLoans(res.data.loans);
    setTotalPages(res.data.totalPages);
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
      console.error('Query error:', err);
      toast.error('Failed to send query: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const openPdf = (url: string | null) => {
    if (!url) {
      toast.error('No PDF recorded for this application');
      return;
    }
    
    // If it's a relative URL (starts with /uploads), prepend the API base URL
    const fullUrl = url.startsWith('/') 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + url 
      : url;
      
    setSelectedPdf(fullUrl);
  };

  const closePdf = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="pb-10 relative">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Loan Applications</h2>
          <p className="text-on-surface-variant text-sm">Review, approve, or query incoming loan applications from employees.</p>
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
                      <p className="font-bold text-tertiary whitespace-nowrap">{app.customer.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{app.customer.customerId}</p>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant capitalize">{app.loanType.toLowerCase()}</td>
                    <td className="px-6 py-5 text-right font-bold text-tertiary">₹{app.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant whitespace-nowrap">
                      <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] opacity-70">{new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant whitespace-nowrap">{app.createdBy.name}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={app.status} />
                      {app.status === 'QUERIED' && (
                        <p className="text-[9px] text-blue-600 mt-1 max-w-[120px] truncate" title={app.queryDescription}>
                          Q: {app.queryDescription}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => openPdf(app.pdfUrl)}
                          className={`flex items-center gap-1.5 font-bold text-xs transition-colors group ${app.pdfUrl ? 'text-accent hover:text-accent-dark' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>View PDF</span>
                        </button>

                        {(app.status === 'PENDING' || app.status === 'QUERIED') && (
                          <div className="flex items-center gap-2 border-l border-surface-container pl-4 ml-1">
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

                        {app.status === 'APPROVED' && (
                          <div className="flex items-center gap-2 border-l border-surface-container pl-4 ml-1">
                            <button 
                              onClick={() => handleDisburse(app.id)}
                              className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                            >
                              Disburse Funds
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

      {/* Query Modal */}
      {queryModalLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold text-lg">Send Query to Employee</h3>
              <button onClick={() => setQueryModalLoan(null)} className="hover:bg-white/10 rounded-full p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Explain what needs to be corrected in <strong>{queryModalLoan.customer.name}&apos;s</strong> application.</p>
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

      {/* PDF Modal Overlay */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
              <h3 className="font-bold text-tertiary">Document Preview</h3>
              <button 
                onClick={closePdf}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high text-tertiary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-surface-container-highest">
              <iframe 
                src={`${selectedPdf}#toolbar=0`} 
                className="w-full h-full border-none"
                title="PDF Preview"
              ></iframe>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end bg-surface-container-low">
              <button 
                onClick={closePdf}
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
