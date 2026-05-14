'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { EmptyState } from '@/components/Skeletons';
import { loansApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Submission {
  id: string;
  customer: {
    customerId: string;
    name: string;
  };
  loanType: string;
  amount: number;
  createdAt: string;
  status: string;
  queryDescription?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const res = await loansApi.list({ page: page.toString(), limit: '10' });
        setSubmissions(res.data.loans);
        setTotalPages(res.data.totalPages);
      } catch {
        toast.error('Failed to fetch submissions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, [page]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">My Submissions</h2>
        <p className="text-on-surface-variant text-sm">Track the status of loan applications you have submitted.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-on-surface-variant font-bold animate-pulse">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon="description"
          title="No Submissions Yet"
          description="You haven't submitted any loan applications. Use the Loan Application form to submit your first one."
        />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {/* Mobile Submission Cards */}
            <div className="block sm:hidden divide-y divide-surface-container">
              {submissions.map((s) => (
                <div key={s.id} className="p-4 space-y-4 hover:bg-surface transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-tertiary">{s.customer?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">{s.customer?.customerId || 'N/A'}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Loan Type</p>
                      <p className="text-xs text-tertiary capitalize font-bold">{s.loanType.toLowerCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Amount</p>
                      <p className="text-sm font-black text-accent">₹{s.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                    <p className="font-medium italic">Submitted: {new Date(s.createdAt).toLocaleDateString()}</p>
                    <p className="opacity-60 font-mono">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  {s.status === 'QUERIED' && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">info</span>
                        Admin Query
                      </p>
                      <p className="text-xs text-blue-700 italic mb-3 leading-relaxed">“{s.queryDescription}”</p>
                      <a 
                        href={`/employee/loan-form/vehicle?editId=${s.id}`} 
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Fix Application
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Submission Table */}
            <table className="hidden sm:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Loan Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Submitted</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-tertiary">{s.customer?.name || 'Unknown'}</span>
                        <span className="text-xs text-on-surface-variant">{s.customer?.customerId || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant capitalize">{s.loanType.toLowerCase()}</td>
                    <td className="px-6 py-5 text-right font-medium">₹{s.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">
                      <p>{new Date(s.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] opacity-70">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={s.status} />
                      {s.status === 'QUERIED' && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg max-w-[250px]">
                          <p className="text-[10px] font-bold text-blue-800 uppercase mb-1">Admin Query:</p>
                          <p className="text-xs text-blue-700 italic mb-3">“{s.queryDescription}”</p>
                          <a href={`/employee/loan-form/vehicle?editId=${s.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            Fix Application Form
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
}
