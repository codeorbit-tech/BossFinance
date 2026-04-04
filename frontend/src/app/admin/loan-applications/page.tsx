'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';

const MOCK_APPLICATIONS = [
  { id: '1', customer: 'Arjun Mehta', loanType: 'PERSONAL', amount: '₹5,00,000', date: '15 Oct 2023', employee: 'Ramesh Kumar', status: 'ACTIVE' },
  { id: '2', customer: 'Priya Sharma', loanType: 'HOME', amount: '₹12,50,000', date: '10 Sep 2023', employee: 'Ramesh Kumar', status: 'ACTIVE' },
  { id: '3', customer: 'Karan Patel', loanType: 'BUSINESS', amount: '₹15,00,000', date: '02 Apr 2024', employee: 'Ramesh Kumar', status: 'PENDING' },
  { id: '4', customer: 'Meera Joshi', loanType: 'HOME', amount: '₹35,00,000', date: '28 Mar 2024', employee: 'Ramesh Kumar', status: 'ACTIVE' },
  { id: '5', customer: 'Anjali Reddy', loanType: 'DAILY', amount: '₹50,000', date: '20 Sep 2023', employee: 'Ramesh Kumar', status: 'ACTIVE' },
];

export default function LoanApplicationsPage() {
  const [page, setPage] = useState(1);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Loan Applications</h2>
          <p className="text-on-surface-variant text-sm">Review, approve, or reject incoming loan applications from employees.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Loan Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {MOCK_APPLICATIONS.map((app) => (
                <tr key={app.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-5 font-bold text-tertiary">{app.customer}</td>
                  <td className="px-6 py-5 text-on-surface-variant capitalize">{app.loanType.toLowerCase()}</td>
                  <td className="px-6 py-5 text-right font-medium">{app.amount}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{app.date}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{app.employee}</td>
                  <td className="px-6 py-5"><StatusBadge status={app.status} /></td>
                  <td className="px-6 py-5">
                    {app.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-[#489d62] transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button className="text-xs font-bold text-accent hover:underline underline-offset-4">View PDF</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
}
