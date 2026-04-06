'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';

const MOCK_APPLICATIONS = [
  { id: '1', customer: 'Arjun Mehta', loanType: 'PERSONAL', amount: '₹5,00,000', date: '15 Oct 2023', employee: 'Ramesh Kumar', status: 'ACTIVE' },
  { id: '2', customer: 'Priya Sharma', loanType: 'HOME', amount: '₹12,50,000', date: '10 Sep 2023', employee: 'Ramesh Kumar', status: 'ACTIVE' },
  { id: '3', customer: 'Karan Patel', loanType: 'BUSINESS', amount: '₹15,00,000', date: '02 Apr 2024', employee: 'Suresh Raina', status: 'PENDING' },
  { id: '4', customer: 'Meera Joshi', loanType: 'HOME', amount: '₹35,00,000', date: '28 Mar 2024', employee: 'Ramesh Kumar', status: 'ACTIVE' },
  { id: '5', customer: 'Anjali Reddy', loanType: 'DAILY', amount: '₹50,000', date: '20 Sep 2023', employee: 'Suresh Raina', status: 'PENDING' },
  { id: '6', customer: 'Vikram Singh', loanType: 'VEHICLE', amount: '₹8,20,000', date: '18 Mar 2024', employee: 'Ramesh Kumar', status: 'REJECTED' },
];

export default function LoanApplicationsPage() {
  const [page, setPage] = useState(1);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const openPdf = (url: string) => {
    setSelectedPdf(url);
  };

  const closePdf = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="pb-10 relative">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Loan Applications</h2>
          <p className="text-on-surface-variant text-sm">Review, approve, or reject incoming loan applications from employees.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/20">
        <div className="overflow-x-auto">
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
              {MOCK_APPLICATIONS.map((app) => (
                <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-tertiary whitespace-nowrap">{app.customer}</td>
                  <td className="px-6 py-5 text-on-surface-variant capitalize">{app.loanType.toLowerCase()}</td>
                  <td className="px-6 py-5 text-right font-bold text-tertiary">{app.amount}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant whitespace-nowrap">{app.date}</td>
                  <td className="px-6 py-5 text-on-surface-variant whitespace-nowrap">{app.employee}</td>
                  <td className="px-6 py-5"><StatusBadge status={app.status} /></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => openPdf('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')}
                        className="flex items-center gap-1.5 text-accent hover:text-accent-dark font-bold text-xs transition-colors group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>View PDF</span>
                      </button>

                      {app.status === 'PENDING' && (
                        <div className="flex items-center gap-2 border-l border-surface-container pl-4 ml-1">
                          <button className="px-3 py-1.5 bg-accent text-white text-[10px] font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95">
                            Approve
                          </button>
                          <button className="px-3 py-1.5 bg-error text-white text-[10px] font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm active:scale-95">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={1} onPageChange={setPage} />
      </div>

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
