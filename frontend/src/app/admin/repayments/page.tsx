'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';
import Pagination from '@/components/Pagination';

const MOCK_REPAYMENTS = [
  { id: '1', customerId: 'BF-2024-001', customerName: 'Arjun Mehta', loanAmount: 500000, totalPaid: 320000, outstanding: 180000, emi: 12450, lastPayment: '12 Oct 2023', nextDueDate: '12 Nov 2023', status: 'PAID' },
  { id: '2', customerId: 'BF-2023-842', customerName: 'Priya Sharma', loanAmount: 1250000, totalPaid: 450000, outstanding: 800000, emi: 28200, lastPayment: '05 Sep 2023', nextDueDate: '05 Oct 2023', status: 'OVERDUE' },
  { id: '3', customerId: 'BF-2024-118', customerName: 'Rohan Varma', loanAmount: 250000, totalPaid: 250000, outstanding: 0, emi: 8500, lastPayment: '20 Oct 2023', nextDueDate: '20 Nov 2023', status: 'UPCOMING' },
  { id: '4', customerId: 'BF-2022-045', customerName: 'Sunita Iyer', loanAmount: 100000, totalPaid: 100000, outstanding: 0, emi: 0, lastPayment: '15 Jun 2023', nextDueDate: 'Closed', status: 'CLEARED' },
  { id: '5', customerId: 'BF-2024-009', customerName: 'Vikram Singh', loanAmount: 820000, totalPaid: 140000, outstanding: 680000, emi: 18900, lastPayment: '28 Sep 2023', nextDueDate: '28 Oct 2023', status: 'UPCOMING' },
];

const filters = ['All', 'Due Today', 'This Week', 'This Month', 'Overdue Only'];

export default function RepaymentTracker() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  const formatCurrency = (n: number) => n.toLocaleString('en-IN');

  const filteredRepayments = MOCK_REPAYMENTS.filter(r => {
    if (activeFilter === 'Due Today') return r.nextDueDate.includes('28 Oct'); // Based on mock data today's date
    if (activeFilter === 'This Week') return !r.nextDueDate.includes('Closed'); // Rough mock matching
    if (activeFilter === 'This Month') return r.nextDueDate.includes('Oct') || r.nextDueDate.includes('Nov');
    if (activeFilter === 'Overdue Only') return r.status === 'OVERDUE';
    return true; // 'All'
  });

  return (
    <div>
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Repayment Tracker</h2>
          <p className="text-on-surface-variant text-sm">Monitor loan recovery and schedule collections efficiently.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-surface-container-low p-1.5 rounded-xl">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeFilter === f
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              {f === 'Overdue Only' && <span className="w-2 h-2 rounded-full bg-error" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Receivable" value="₹42,80,500" variant="default">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
            +8.4% VS LAST MONTH
          </div>
        </StatCard>
        <StatCard label="Collected Today" value="₹2,14,000" variant="accent">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[65%]" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant">65% Target</span>
          </div>
        </StatCard>
        <StatCard label="Total Overdue" value="₹5,40,200" variant="error" subtitle="12 DELINQUENT ACCOUNTS" />
        <StatCard label="Pending EMIs" value="184" variant="primary">
          <button className="text-[10px] font-bold text-white underline decoration-primary-fixed underline-offset-4 hover:text-primary-fixed transition-colors">
            DOWNLOAD COLLECTION LIST
          </button>
        </StatCard>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-tertiary">Live Ledger</span>
            <div className="h-4 w-px bg-outline-variant/30" />
            <span className="text-xs text-on-surface-variant">Displaying 1-{MOCK_REPAYMENTS.length} of 184 records</span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/50 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/50 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-base">download</span>
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">ID & Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Loan Amt (₹)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Paid (₹)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Outstanding (₹)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">EMI (₹)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Payment Dates</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {filteredRepayments.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-surface transition-colors ${
                    r.status === 'OVERDUE' ? 'bg-error/5' : ''
                  } ${r.status === 'CLEARED' ? 'grayscale opacity-70' : ''} ${
                    r.nextDueDate.includes('28 Oct') ? 'border-l-4 border-accent' : ''
                  }`}
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-tertiary">{r.customerId}</span>
                      <span className="text-xs text-on-surface-variant">{r.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-medium">{formatCurrency(r.loanAmount)}</td>
                  <td className="px-6 py-5 text-right text-on-primary-container">{formatCurrency(r.totalPaid)}</td>
                  <td className={`px-6 py-5 text-right ${r.status === 'OVERDUE' ? 'text-error font-bold' : 'text-tertiary'}`}>
                    {formatCurrency(r.outstanding)}
                  </td>
                  <td className="px-6 py-5 text-right font-bold">{formatCurrency(r.emi)}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col text-[11px]">
                      <span className="text-on-surface-variant">Last: {r.lastPayment}</span>
                      <span className={`font-bold ${
                        r.status === 'OVERDUE' ? 'text-error uppercase' :
                        r.nextDueDate.includes('28 Oct') ? 'text-accent uppercase' :
                        'text-tertiary'
                      }`}>
                        {r.status === 'OVERDUE' ? `Overdue: ${r.nextDueDate.split(' ').slice(-2).join(' ')}` :
                         r.nextDueDate.includes('28 Oct') ? `Today: ${r.nextDueDate.split(' ').slice(-2).join(' ')}` :
                         r.status === 'CLEARED' ? 'Status: Closed' :
                         `Next: ${r.nextDueDate}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={16} onPageChange={setPage} />
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-2xl">add_card</span>
      </button>
    </div>
  );
}
