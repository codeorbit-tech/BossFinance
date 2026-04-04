'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';

const MOCK_CUSTOMERS = [
  { id: '1', customerId: 'BF-2024-001', name: 'Arjun Mehta', loanType: 'PERSONAL', frequency: 'MONTHLY', amount: '₹5,00,000', emi: '₹12,450', status: 'ACTIVE', nextDue: '12 Nov 2023' },
  { id: '2', customerId: 'BF-2023-842', name: 'Priya Sharma', loanType: 'HOME', frequency: 'MONTHLY', amount: '₹12,50,000', emi: '₹28,200', status: 'OVERDUE', nextDue: '05 Oct 2023' },
  { id: '3', customerId: 'BF-2024-118', name: 'Rohan Varma', loanType: 'VEHICLE', frequency: 'MONTHLY', amount: '₹2,50,000', emi: '₹8,500', status: 'ACTIVE', nextDue: '20 Nov 2023' },
  { id: '4', customerId: 'BF-2022-045', name: 'Sunita Iyer', loanType: 'PERSONAL', frequency: 'MONTHLY', amount: '₹1,00,000', emi: '₹0', status: 'CLOSED', nextDue: '—' },
  { id: '5', customerId: 'BF-2024-009', name: 'Vikram Singh', loanType: 'BUSINESS', frequency: 'WEEKLY', amount: '₹8,20,000', emi: '₹18,900', status: 'ACTIVE', nextDue: '28 Oct 2023' },
  { id: '6', customerId: 'BF-2024-022', name: 'Meera Joshi', loanType: 'HOME', frequency: 'MONTHLY', amount: '₹35,00,000', emi: '₹34,500', status: 'ACTIVE', nextDue: '05 Nov 2024' },
  { id: '7', customerId: 'BF-2024-033', name: 'Karan Patel', loanType: 'BUSINESS', frequency: 'MONTHLY', amount: '₹15,00,000', emi: '₹34,200', status: 'PENDING', nextDue: '—' },
  { id: '8', customerId: 'BF-2023-910', name: 'Anjali Reddy', loanType: 'DAILY', frequency: 'DAILY', amount: '₹50,000', emi: '₹1,850', status: 'OVERDUE', nextDue: '28 Sep 2023' },
];

const loanTypes = ['All', 'Home', 'Vehicle', 'Personal', 'Business', 'Daily'];
const statusFilters = ['All', 'Active', 'Closed', 'Overdue', 'Pending', 'NPA'];
const frequencyFilters = ['All', 'Daily', 'Weekly', 'Monthly'];

export default function CustomersPage() {
  const router = useRouter();
  const [loanTypeFilter, setLoanTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [frequencyFilter, setFrequencyFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    if (loanTypeFilter !== 'All' && c.loanType !== loanTypeFilter.toUpperCase()) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter.toUpperCase()) return false;
    if (frequencyFilter !== 'All' && c.frequency !== frequencyFilter.toUpperCase()) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Customers</h2>
          <p className="text-on-surface-variant text-sm">Manage customer profiles and monitor loan statuses.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={loanTypeFilter}
          onChange={(e) => setLoanTypeFilter(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        >
          {loanTypes.map((t) => <option key={t} value={t}>{t} Loan</option>)}
        </select>
        <select
          value={frequencyFilter}
          onChange={(e) => setFrequencyFilter(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        >
          {frequencyFilters.map((f) => <option key={f} value={f}>{f} Freq</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        >
          {statusFilters.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Customer ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Loan Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Freq</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">EMI</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => router.push(`/admin/customers/${c.customerId}`)} className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="px-6 py-5 font-bold text-tertiary">{c.customerId}</td>
                  <td className="px-6 py-5">{c.name}</td>
                  <td className="px-6 py-5 text-on-surface-variant capitalize">{c.loanType.toLowerCase()}</td>
                  <td className="px-6 py-5 text-on-surface-variant capitalize">{c.frequency.toLowerCase()}</td>
                  <td className="px-6 py-5 text-right font-medium">{c.amount}</td>
                  <td className="px-6 py-5 text-right font-bold">{c.emi}</td>
                  <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{c.nextDue}</td>
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
