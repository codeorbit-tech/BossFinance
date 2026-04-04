'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { EmptyState } from '@/components/Skeletons';

const MOCK_SUBMISSIONS = [
  { id: '1', customer: 'Arjun Mehta', customerId: 'BF-2024-001', loanType: 'PERSONAL', amount: '₹5,00,000', date: '15 Oct 2023', status: 'ACTIVE' },
  { id: '2', customer: 'Priya Sharma', customerId: 'BF-2023-842', loanType: 'HOME', amount: '₹12,50,000', date: '10 Sep 2023', status: 'ACTIVE' },
  { id: '3', customer: 'Karan Patel', customerId: 'BF-2024-033', loanType: 'BUSINESS', amount: '₹15,00,000', date: '02 Apr 2024', status: 'PENDING' },
  { id: '4', customer: 'Meera Joshi', customerId: 'BF-2024-022', loanType: 'HOME', amount: '₹35,00,000', date: '28 Mar 2024', status: 'ACTIVE' },
  { id: '5', customer: 'Vikram Singh', customerId: 'BF-2024-009', loanType: 'BUSINESS', amount: '₹8,20,000', date: '20 Mar 2024', status: 'REJECTED' },
];

export default function SubmissionsPage() {
  const [page, setPage] = useState(1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">My Submissions</h2>
        <p className="text-on-surface-variant text-sm">Track the status of loan applications you have submitted.</p>
      </div>

      {MOCK_SUBMISSIONS.length === 0 ? (
        <EmptyState
          icon="description"
          title="No Submissions Yet"
          description="You haven't submitted any loan applications. Use the Loan Application form to submit your first one."
        />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                {MOCK_SUBMISSIONS.map((s) => (
                  <tr key={s.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-tertiary">{s.customer}</span>
                        <span className="text-xs text-on-surface-variant">{s.customerId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant capitalize">{s.loanType.toLowerCase()}</td>
                    <td className="px-6 py-5 text-right font-medium">{s.amount}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{s.date}</td>
                    <td className="px-6 py-5"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={1} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
