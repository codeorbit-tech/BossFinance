'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { CardSkeleton } from '@/components/Skeletons';
import { analyticsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Activity {
  id: string;
  action: string;
  customer: string;
  time: string;
  icon: string;
  color: string;
}

interface DashboardStats {
  expected: string;
  actual: string;
  pending: string;
  customers: number;
  sanctioned: string;
  outstanding: string;
  overdue: number;
  npa: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const fetchRecentActivity = async () => {
    try {
      const res = await analyticsApi.getRecentActivity();
      setRecentActivity(res.data);
    } catch {
      // Silently fail
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboard(activeTab);
      setStats(res.data);
    } catch {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const tabs = [
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'weekly', label: 'Weekly', icon: 'date_range' },
    { id: 'monthly', label: 'Monthly', icon: 'calendar_month' },
  ];

  const formatTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* Page header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Admin Dashboard</h2>
          <p className="text-on-surface-variant text-sm">
            Showing performance for <span className="text-tertiary font-bold capitalize">{activeTab}</span> period.
          </p>
        </div>
        
        {/* Modern Tab Navigation */}
        <div className="flex bg-surface-container-high p-1 rounded-xl w-fit border border-outline-variant/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-surface-container-lowest text-tertiary shadow-md transform scale-[1.02]' 
                  : 'text-on-surface-variant hover:text-tertiary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-12">
        {loading || !stats ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
          </div>
        ) : (
          <>
            {/* Collections Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(var(--color-accent),0.5)]"></div>
                <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Collection Performance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label={`Expected (${activeTab})`} value={stats.expected} variant="primary" />
                <StatCard label={`Received (${activeTab})`} value={stats.actual} subtitle={`of ${stats.expected} target`} variant="accent" />
                <StatCard label={`Pending (${activeTab})`} value={stats.pending} variant="error" />
              </div>
            </section>

            {/* Overall Portfolio Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-secondary rounded-full"></div>
                <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Portfolio Metrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="New Customers" value={String(stats.customers)} subtitle={`Acquired this ${activeTab}`} variant="default" />
                <StatCard label="Amount Sanctioned" value={stats.sanctioned} variant="accent" />
                <StatCard label="Outstanding Balance" value={stats.outstanding} variant="default" />
              </div>
            </section>
            
            {/* Risk & Delinquency Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-error rounded-full shadow-[0_0_8px_rgba(var(--color-error),0.5)]"></div>
                <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Risk & Delinquency</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                 <StatCard label="Overdue Alerts" value={String(stats.overdue)} subtitle={`Currently active`} variant="error" />
                 <StatCard label="NPA Count" value={String(stats.npa)} subtitle={`Total classified`} variant="error" />
              </div>
            </section>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-16 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-lg">
        <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-tertiary">Recent Activity</span>
            <p className="text-xs text-on-surface-variant mt-0.5">Latest system-wide events and transactions</p>
          </div>
          <button onClick={fetchRecentActivity} className="text-sm font-bold text-accent hover:underline px-4 py-2 rounded-lg hover:bg-accent/5 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>
        <div className="divide-y divide-outline-variant/5 min-h-[200px]">
          {recentActivity.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-bold">No recent activity recorded.</div>
          ) : (
            recentActivity.map((item) => (
              <div key={item.id} className="px-8 py-5 flex items-center gap-6 hover:bg-surface-container-low/30 transition-all duration-200 group">
                <div className={`w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-bold text-tertiary leading-snug">{item.action}</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">{item.customer}</p>
                </div>
                <span className="text-xs text-on-surface-variant font-mono bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/5">{formatTime(item.time)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
