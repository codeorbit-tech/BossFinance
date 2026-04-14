'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { customersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CustomerLoan {
  loanType: string;
  amount: number;
  emi: number;
  status: string;
  nextDueDate: string | null;
  frequency: string;
}

interface Customer {
  id: string;
  customerId: string;
  name: string;
  status: string;
  loans: CustomerLoan[];
}

const loanTypes = ['All', 'Home', 'Vehicle', 'Personal', 'Business', 'Daily'];
const statusFilters = ['All', 'Active', 'Closed', 'Overdue', 'Pending', 'NPA'];
const frequencyFilters = ['All', 'Daily', 'Weekly', 'Monthly'];

function CustomersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [loanTypeFilter, setLoanTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [frequencyFilter, setFrequencyFilter] = useState('All');

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = { 
          page: page.toString(), 
          limit: '10',
          search
        };
        if (loanTypeFilter !== 'All') params.loanType = loanTypeFilter.toUpperCase();
        if (statusFilter !== 'All') params.status = statusFilter.toUpperCase();
        if (frequencyFilter !== 'All') params.frequency = frequencyFilter.toUpperCase();

        const res = await customersApi.list(params);
        setCustomers(res.data.customers);
        setTotalPages(res.data.totalPages);
      } catch {
        toast.error('Failed to fetch customers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [page, search, loanTypeFilter, statusFilter, frequencyFilter, setTotalPages]);

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
          onChange={(e) => { setLoanTypeFilter(e.target.value); setPage(1); }}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        >
          {loanTypes.map((t) => <option key={t} value={t}>{t} Loan</option>)}
        </select>
        <select
          value={frequencyFilter}
          onChange={(e) => { setFrequencyFilter(e.target.value); setPage(1); }}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        >
          {frequencyFilters.map((f) => <option key={f} value={f}>{f} Freq</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        >
          {statusFilters.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-on-surface-variant font-bold animate-pulse">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-bold">No customers found.</div>
          ) : (
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
                {customers.map((c) => {
                  const activeLoan = c.loans[0];
                  return (
                    <tr key={c.id} onClick={() => router.push(`/admin/customers/${c.id}`)} className="hover:bg-surface transition-colors cursor-pointer">
                      <td className="px-6 py-5 font-bold text-tertiary">{c.customerId}</td>
                      <td className="px-6 py-5">{c.name}</td>
                      <td className="px-6 py-5 text-on-surface-variant capitalize">{activeLoan?.loanType.toLowerCase() || '—'}</td>
                      <td className="px-6 py-5 text-on-surface-variant capitalize">{activeLoan?.frequency.toLowerCase() || '—'}</td>
                      <td className="px-6 py-5 text-right font-medium">{activeLoan ? `₹${activeLoan.amount.toLocaleString()}` : '—'}</td>
                      <td className="px-6 py-5 text-right font-bold">{activeLoan ? `₹${activeLoan.emi.toLocaleString()}` : '—'}</td>
                      <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-5 text-xs text-on-surface-variant">
                        {activeLoan?.nextDueDate ? new Date(activeLoan.nextDueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersList />
    </Suspense>
  );
}
