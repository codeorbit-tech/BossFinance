'use client';

import StatCard from '@/components/StatCard';

export default function EmployeeDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Employee Dashboard</h2>
        <p className="text-on-surface-variant text-sm">Your activity overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Customers Created" value="24" subtitle="This month" variant="default" />
        <StatCard label="Applications Submitted" value="18" variant="accent">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
            5 PENDING REVIEW
          </div>
        </StatCard>
        <StatCard label="Approved Loans" value="13" subtitle="₹42,50,000 total value" variant="default" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/employee/create-customer" className="bg-surface-container-lowest p-8 rounded-xl hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
            <span className="material-symbols-outlined text-accent text-2xl">person_add</span>
          </div>
          <h3 className="text-lg font-bold text-tertiary mb-1">Create New Customer</h3>
          <p className="text-sm text-on-surface-variant">Register a new customer profile in the system.</p>
        </a>
        <a href="/employee/loan-form" className="bg-surface-container-lowest p-8 rounded-xl hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
            <span className="material-symbols-outlined text-accent text-2xl">description</span>
          </div>
          <h3 className="text-lg font-bold text-tertiary mb-1">Submit Loan Application</h3>
          <p className="text-sm text-on-surface-variant">Fill and send a new loan application for review.</p>
        </a>
      </div>
    </div>
  );
}
