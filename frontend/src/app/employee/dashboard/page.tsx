'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { analyticsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface EmployeeStats {
  customersCreated: number;
  applicationsSubmitted: number;
  pendingReview: number;
  approvedCount: number;
  approvedValue: string;
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await analyticsApi.getEmployeeStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Employee Dashboard</h2>
          <p className="text-on-surface-variant text-sm">Your activity overview and quick actions.</p>
        </div>
        <button onClick={fetchStats} className="text-xs font-bold text-accent flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </div>

      {isLoading || !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-container-low rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Customers Created" value={stats.customersCreated.toString()} subtitle="This month" variant="default" />
          <StatCard label="Applications Submitted" value={stats.applicationsSubmitted.toString()} variant="accent">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
              {stats.pendingReview} PENDING REVIEW
            </div>
          </StatCard>
          <StatCard label="Approved Loans" value={stats.approvedCount.toString()} subtitle={`${stats.approvedValue} total value`} variant="default" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <a href="/employee/loan-form" className="bg-surface-container-lowest p-8 rounded-xl hover:shadow-md transition-all group cursor-pointer border border-outline-variant/10">
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
