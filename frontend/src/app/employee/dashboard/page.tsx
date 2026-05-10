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

interface CollectionMetrics {
  expected: number;
  received: number;
  remaining: number;
  customers: {
    id: string;
    loanId: string;
    customerId: string;
    customerName: string;
    amountDue: number;
    amountPaid: number;
    remaining: number;
    status: string;
  }[];
}

interface TodayCollection {
  DAILY: CollectionMetrics;
  WEEKLY: CollectionMetrics;
  MONTHLY: CollectionMetrics;
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [collection, setCollection] = useState<TodayCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, collectionRes, activitiesRes] = await Promise.all([
        analyticsApi.getEmployeeStats(),
        analyticsApi.getTodayCollection(),
        analyticsApi.getEmployeeActivity()
      ]);
      setStats(statsRes.data);
      setCollection(collectionRes.data);
      setActivities(activitiesRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMetrics = collection ? collection[activeTab] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Employee Dashboard</h2>
          <p className="text-on-surface-variant text-sm">Your activity overview and today&apos;s collection plan.</p>
        </div>
        <button onClick={fetchData} className="text-xs font-bold text-accent flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </div>

      {/* Primary Stats */}
      {isLoading || !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-container-low rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Target Collections" value={`₹${(collection?.MONTHLY.expected || 0).toLocaleString()}`} subtitle="Monthly target" variant="default" />
          <StatCard label="Actual Collections" value={`₹${(collection?.MONTHLY.received || 0).toLocaleString()}`} subtitle="Monthly collected" variant="accent" />
          <StatCard label="Customers Created" value={stats.customersCreated.toString()} subtitle="This month" variant="default" />
          <StatCard label="Approved Loans" value={stats.approvedCount.toString()} subtitle={`${stats.approvedValue}`} variant="default" />
        </div>
      )}

      {/* Today's Collection Section */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-tertiary flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">payments</span>
                Today&apos;s Collection Plan
              </h3>
              <p className="text-xs text-on-surface-variant">Manage installments due for today across all frequencies.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-lg self-start">
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-surface-container-lowest text-accent shadow-sm' 
                      : 'text-on-surface-variant hover:text-tertiary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading || !collection ? (
          <div className="p-12 text-center animate-pulse">
            <div className="h-4 w-32 bg-surface-container-low mx-auto rounded mb-4" />
            <div className="h-2 w-48 bg-surface-container-low mx-auto rounded" />
          </div>
        ) : (
          <div className="p-6">
            {/* Collection Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Amount Expected</p>
                <p className="text-xl font-black text-tertiary">₹{currentMetrics?.expected.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Amount Received</p>
                <p className="text-xl font-black text-accent">₹{currentMetrics?.received.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-error/5 border border-error/10">
                <p className="text-[10px] font-bold text-error uppercase tracking-wider mb-1">Remaining</p>
                <p className="text-xl font-black text-error">₹{currentMetrics?.remaining.toLocaleString()}</p>
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <a href="/employee/loan-form" className="flex items-center gap-6 bg-surface-container-lowest p-6 rounded-xl hover:shadow-md transition-all group border border-outline-variant/10">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <span className="material-symbols-outlined text-accent text-2xl">description</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-tertiary mb-0.5">Submit Loan Application</h3>
              <p className="text-xs text-on-surface-variant">Fill and send a new loan application for review.</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </a>

          <a href="/employee/repayments" className="flex items-center gap-6 bg-surface-container-lowest p-6 rounded-xl hover:shadow-md transition-all group border border-outline-variant/10">
            <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center group-hover:bg-secondary-container/50 transition-colors">
              <span className="material-symbols-outlined text-on-secondary-container text-2xl">payments</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-tertiary mb-0.5">Record Repayment</h3>
              <p className="text-xs text-on-surface-variant">Log a new payment received from a customer.</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h3 className="font-bold text-tertiary flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">history</span>
              My Recent Activity
            </h3>
            <a href="/employee/submissions" className="text-[10px] font-bold text-accent uppercase hover:underline">View All</a>
          </div>
          <div className="divide-y divide-outline-variant/5 max-h-[300px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant italic">No recent activity</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="px-6 py-3 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${act.color.replace('text', 'bg')}/10 flex items-center justify-center ${act.color}`}>
                    <span className="material-symbols-outlined text-sm">{act.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-tertiary truncate">{act.action}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{act.customer}</p>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant whitespace-nowrap">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
