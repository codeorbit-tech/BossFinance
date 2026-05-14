'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { CardSkeleton } from '@/components/Skeletons';
import { analyticsApi, repaymentsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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

interface NpaDetail {
  id: string;
  dbId: string;
  customerId: string;
  customerDbId: string;
  customerName: string;
  customerPhone: string;
  loanAmount: number;
  emiAmount: number;
  dueDate: string;
  loanType: string;
  status: string;
  unpaidAmount: number;
  penaltyAmount: number;
  totalEmis: number;
  emisPaid: number;
  emisRemaining: number;
  isManualNpa: boolean;
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


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [npaDetails, setNpaDetails] = useState<NpaDetail[]>([]);
  const [selectedNpa, setSelectedNpa] = useState<NpaDetail | null>(null);
  const [showNpaTable, setShowNpaTable] = useState(false);
  const [collection, setCollection] = useState<TodayCollection | null>(null);


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
      const freqMap: Record<string, string> = {
        'daily': 'DAILY',
        'weekly': 'WEEKLY',
        'monthly': 'MONTHLY'
      };
      const frequency = freqMap[activeTab];

      const [statsRes, npaRes, collectionRes] = await Promise.all([
        analyticsApi.getDashboard(activeTab),
        repaymentsApi.getNpaDetails({ frequency }),
        analyticsApi.getAdminTodayCollection()
      ]);
      setStats(statsRes.data);
      setNpaDetails(npaRes.data.details);
      setCollection(collectionRes.data);
    } catch {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();

    // Real-time polling every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchRecentActivity();
    }, 60000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const tabs = [
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'weekly', label: 'Weekly', icon: 'date_range' },
    { id: 'monthly', label: 'Monthly', icon: 'calendar_month' },
  ];

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  const getDaysOverdue = (dueDate: string) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    if (due >= now) return 0;
    const diffTime = Math.abs(now.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getNpaStatus = (npa: NpaDetail) => {
    if (npa.isManualNpa) return { label: 'NPA', color: 'bg-red-900 text-white' };
    const days = getDaysOverdue(npa.dueDate);
    if (days > 60) return { label: 'Severe', color: 'bg-red-600 text-white' };
    if (days > 30) return { label: 'Critical', color: 'bg-orange-500 text-white' };
    return { label: 'Overdue', color: 'bg-yellow-400 text-black' };
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
        <div className="flex bg-surface-container-high p-1 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-outline-variant/10">
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


            {/* Today's Collection Plan (New) */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-80">
              <div className="p-6 border-b border-outline-variant/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-tertiary flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent">payments</span>
                      Today&apos;s Collection Plan
                    </h3>
                    <p className="text-xs text-on-surface-variant">System-wide installments due for today.</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Collection Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {(() => {
                    const cKey = activeTab.toUpperCase() as keyof TodayCollection;
                    const metrics = collection?.[cKey];
                    return (
                      <>
                        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Amount Expected</p>
                          <p className="text-xl font-black text-tertiary">₹{metrics?.expected.toLocaleString() || '0'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Amount Received</p>
                          <p className="text-xl font-black text-accent">₹{metrics?.received.toLocaleString() || '0'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-error/5 border border-error/10">
                          <p className="text-[10px] font-bold text-error uppercase tracking-wider mb-1">Remaining</p>
                          <p className="text-xl font-black text-error">₹{metrics?.remaining.toLocaleString() || '0'}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>
            </section>

            {/* Overall Portfolio Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-secondary rounded-full"></div>
                <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Portfolio Metrics</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard label="Target Collections" value={stats.expected} subtitle={`Due in ${activeTab} period`} variant="default" />
                <StatCard label="Actual Collections" value={stats.actual} subtitle={`Collected in ${activeTab} period`} variant="accent" />
                <StatCard label="Amount Sanctioned" value={stats.sanctioned} variant="default" />
                <StatCard label="Outstanding Balance" value={stats.outstanding} variant="default" />
              </div>
            </section>

            {/* Risk & Delinquency Section */}
            <section className="mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-error rounded-full shadow-[0_0_8px_rgba(var(--color-error),0.5)]"></div>
                <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider">Risk & Delinquency</h3>
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
                 <StatCard 
                  label="Overdue Alerts" 
                  value={String(stats.overdue)} 
                  subtitle={`Currently active`} 
                  variant="error" 
                 />
                 <StatCard 
                  label="NPA Count" 
                  value={String(stats.npa)} 
                  subtitle={`Total classified (Click to view)`} 
                  variant="error" 
                  onClick={() => setShowNpaTable(!showNpaTable)}
                 />
              </div>

            </section>

            {/* NPA — NON PAID CUSTOMERS Section - Visible only on toggle */}
            {showNpaTable && (
              <section className="animate-in fade-in zoom-in-95 duration-500 delay-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1.5 bg-error rounded-full shadow-[0_0_8px_rgba(var(--color-error),0.5)]"></div>
                    <h3 className="text-lg font-bold text-tertiary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-error">warning</span>
                      NPA — {activeTab.toUpperCase()} NON PAID CUSTOMERS
                    </h3>
                    {npaDetails.length > 0 && (
                      <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                        ({npaDetails.length})
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowNpaTable(false)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface-variant hover:text-tertiary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    Hide Section
                  </button>
                </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                {npaDetails.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-accent text-3xl">check_circle</span>
                    </div>
                    <h4 className="text-tertiary font-bold">All customers are up to date</h4>
                    <p className="text-xs text-on-surface-variant mt-1">No overdue installments or NPA flags found.</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block lg:hidden divide-y divide-outline-variant/10">
                      {npaDetails.map((npa) => {
                        const status = getNpaStatus(npa);
                        return (
                          <div 
                            key={npa.id} 
                            onClick={() => setSelectedNpa(npa)}
                            className="p-4 space-y-4 active:bg-surface-container-low/50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-black text-tertiary">{npa.customerName}</p>
                                <p className="text-[10px] font-mono text-on-surface-variant">{npa.customerId}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">EMI Amount</p>
                                <p className="text-xs font-black text-tertiary">₹{npa.emiAmount.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Penalty</p>
                                <p className="text-xs font-black text-error">₹{npa.penaltyAmount.toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs text-on-surface-variant">calendar_today</span>
                                <span className="text-[10px] font-bold text-on-surface-variant">
                                  {npa.dueDate ? new Date(npa.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                                </span>
                              </div>
                              <span className={`text-[10px] font-black ${getDaysOverdue(npa.dueDate) > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                                {getDaysOverdue(npa.dueDate)}d Overdue
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/5">
                        <tr>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Loan ID</th>
                          <th className="px-6 py-4">EMI Amount</th>
                          <th className="px-6 py-4">EMI Due Date</th>
                          <th className="px-6 py-4 text-center">Days Overdue</th>
                          <th className="px-6 py-4 text-right">Penalty</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {npaDetails.map((npa) => {
                          const status = getNpaStatus(npa);
                          return (
                            <tr 
                              key={npa.id} 
                              onClick={() => setSelectedNpa(npa)}
                              className="hover:bg-surface-container-low/30 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4">
                                <span className="font-bold text-tertiary group-hover:text-accent transition-colors">{npa.customerName}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs text-on-surface-variant">{npa.customerId}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-tertiary">₹{npa.emiAmount.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-on-surface-variant">
                                  {npa.dueDate ? new Date(npa.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-xs font-bold ${getDaysOverdue(npa.dueDate) > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                                  {getDaysOverdue(npa.dueDate)}d
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-sm font-bold text-error">₹{npa.penaltyAmount.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${status.color}`}>
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </div>
            </section>
            )}

            {/* NPA Detail Modal */}
            {selectedNpa && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div 
                  className="bg-surface-container-lowest w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/10 animate-in zoom-in-95 duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
                    <h3 className="text-xl font-bold text-tertiary">Customer Details</h3>
                    <button 
                      onClick={() => setSelectedNpa(null)}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Customer Name</p>
                        <p className="text-lg font-bold text-tertiary">{selectedNpa.customerName}</p>
                        <p className="text-sm text-accent font-bold mt-1">{selectedNpa.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Loan ID</p>
                        <p className="text-lg font-bold text-tertiary font-mono">{selectedNpa.customerId}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getNpaStatus(selectedNpa).color}`}>
                          {getNpaStatus(selectedNpa).label}
                        </span>
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Loan Amount</p>
                        <p className="font-bold text-tertiary">₹{selectedNpa.loanAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center border-x border-outline-variant/10">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">EMI Amount</p>
                        <p className="font-bold text-tertiary text-accent">₹{selectedNpa.emiAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Days Overdue</p>
                        <p className="font-bold text-error">{getDaysOverdue(selectedNpa.dueDate)} Days</p>
                      </div>
                    </div>

                    {/* Progress Info */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Repayment Progress</p>
                          <p className="text-sm font-bold text-tertiary">
                            {selectedNpa.emisPaid} Paid / {selectedNpa.totalEmis} Total EMIs
                          </p>
                        </div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase">
                          {selectedNpa.emisRemaining} Remaining
                        </p>
                      </div>
                      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-1000"
                          style={{ width: `${(selectedNpa.emisPaid / selectedNpa.totalEmis) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Debt Breakdown */}
                    <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Penalty Accumulated</span>
                        <span className="font-bold text-error">₹{selectedNpa.penaltyAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-error/5 border border-error/10 rounded-xl">
                        <span className="font-bold text-tertiary">Outstanding Total</span>
                        <span className="text-lg font-bold text-error">
                          ₹{(selectedNpa.unpaidAmount + selectedNpa.penaltyAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-6 bg-surface-container-low/50 flex gap-4">
                    <Link 
                      href={`/admin/customers/${selectedNpa.customerDbId}`}
                      className="flex-1 bg-tertiary text-white font-bold py-3.5 rounded-2xl text-center hover:bg-tertiary/90 transition-all active:scale-[0.98]"
                    >
                      View Full Profile
                    </Link>
                    <button 
                      onClick={() => setSelectedNpa(null)}
                      className="flex-1 bg-surface-container-high text-tertiary font-bold py-3.5 rounded-2xl text-center hover:bg-surface-container-highest transition-all active:scale-[0.98]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {/* Recent Activity */}
      <div className="mt-8 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-lg">
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
