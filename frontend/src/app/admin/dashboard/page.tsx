'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { CardSkeleton } from '@/components/Skeletons';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    // Portfolio
    totalCustomers: 0,
    totalSanctioned: '₹0',
    totalOutstanding: '₹0',
    // Collections
    todayExpected: '₹0',
    todayActual: '₹0',
    weekExpected: '₹0',
    weekActual: '₹0',
    monthExpected: '₹0',
    monthActual: '₹0',
    // Risk
    overdueCount: 0,
    npaCount: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalCustomers: 6,
        totalSanctioned: '₹12,62,500',
        totalOutstanding: '₹9,21,999',
        todayExpected: '₹500',
        todayActual: '₹500',
        weekExpected: '₹14,667',
        weekActual: '₹8,500',
        monthExpected: '₹42,500',
        monthActual: '₹32,500',
        overdueCount: 2,
        npaCount: 1,
      });
      setLoading(false);
    }, 800);
  }, []);

  const recentActivity = [
    { id: 1, action: 'Loan approved', customer: 'Arjun Mehta (BF-2024-001)', time: '2 hours ago', icon: 'check_circle', color: 'text-accent' },
    { id: 2, action: 'Payment received', customer: 'Vikram Singh (BF-2024-009)', time: '4 hours ago', icon: 'payments', color: 'text-accent' },
    { id: 3, action: 'Overdue alert', customer: 'Priya Sharma (BF-2023-842)', time: '1 day ago', icon: 'warning', color: 'text-error' },
    { id: 4, action: 'New customer created', customer: 'Karan Patel (BF-2024-033)', time: '2 days ago', icon: 'person_add', color: 'text-secondary' },
    { id: 5, action: 'Loan application submitted', customer: 'Meera Joshi (BF-2024-022)', time: '3 days ago', icon: 'description', color: 'text-tertiary' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Dashboard</h2>
        <p className="text-on-surface-variant text-sm">Welcome back. Here&apos;s your financial overview.</p>
      </div>

      {/* Categorized Stats grid */}
      <div className="space-y-6 mb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-bold text-tertiary mb-3 uppercase tracking-widest border-b border-outline-variant/30 pb-1">Collections (Actual vs Expected)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Today's Collections" value={stats.todayActual} subtitle={`of ${stats.todayExpected} expected`} variant="primary" />
                <StatCard label="This Week's Collections" value={stats.weekActual} subtitle={`of ${stats.weekExpected} expected`} variant="primary" />
                <StatCard label="This Month's Collections" value={stats.monthActual} subtitle={`of ${stats.monthExpected} expected`} variant="default" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-tertiary mb-3 uppercase tracking-widest border-b border-outline-variant/30 pb-1 mt-6">Overall Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Customers" value={String(stats.totalCustomers)} variant="default" />
                <StatCard label="Total Sanctioned" value={stats.totalSanctioned} variant="accent" />
                <StatCard label="Total Outstanding" value={stats.totalOutstanding} variant="default" />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-error mb-3 uppercase tracking-widest border-b border-outline-variant/30 pb-1 mt-6">Risk & Delinquency</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard label="Overdue Alerts" value={String(stats.overdueCount)} subtitle="Immediate follow-up" variant="error" />
                 <StatCard label="NPA Count" value={String(stats.npaCount)} subtitle="Non-Performing Assets" variant="error" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <span className="text-sm font-bold text-tertiary">Recent Activity</span>
        </div>
        <div className="divide-y divide-surface-container">
          {recentActivity.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface transition-colors">
              <div className={`w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center ${item.color}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-tertiary">{item.action}</p>
                <p className="text-xs text-on-surface-variant">{item.customer}</p>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
