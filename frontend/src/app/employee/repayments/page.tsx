'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { repaymentsApi, customersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/StatusBadge';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Repayment {
  id: string;
  customerId: string;
  customerName: string;
  loanAmount: number;
  totalPaid: number;
  outstanding: number;
  emi: number;
  lastPayment: string | null;
  nextDueDate: string | null;
  status: string;
  rank?: number;
  subscriptionStatus?: string | null;
  razorpaySubscriptionId?: string | null;
}

// ─── Autopay Badge ────────────────────────────────────────────────────────────
function AutopayBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const config: Record<string, { label: string; cls: string; dot: string }> = {
    active: { label: 'Autopay', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
    pending_authorization: { label: 'Pending Mandate', cls: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-400 animate-pulse' },
    halted: { label: 'Halted', cls: 'bg-red-50 border-red-200 text-red-600', dot: 'bg-red-500' },
  };
  const c = config[status] ?? config['halted'];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

interface SearchResult {
  id: string;
  customerId: string;
  name: string;
  phone: string;
}

interface Stats {
  outstanding: string;
  outstandingNum: number;
  collectedToday: number;
  collectedTodayTarget: number;
  overdueCount: number;
  overdueAmount: string;
  overdueNum: number;
  totalActive: number;
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '₹', className = '' }: { value: number; prefix?: string; className?: string }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const diff = end - start;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(start + diff * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const formatted = `${prefix}${Math.abs(displayed).toLocaleString('en-IN')}`;
  return <span className={className}>{formatted}</span>;
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  const colors = ['bg-yellow-400 text-yellow-900', 'bg-slate-300 text-slate-700', 'bg-orange-300 text-orange-900'];
  const icons = ['🥇', '🥈', '🥉'];
  if (rank <= 3) {
    return (
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black ${colors[rank - 1]}`}>
        {icons[rank - 1]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
      {rank}
    </span>
  );
}

// ─── Stat Card (Live) ─────────────────────────────────────────────────────────
function LiveStatCard({ label, value, numericValue, icon, variant, children }: {
  label: string; value?: string; numericValue?: number; icon: string;
  variant: 'default' | 'accent' | 'error' | 'primary'; children?: React.ReactNode;
}) {
  const variantMap = {
    default: 'bg-surface-container-lowest border-outline-variant/20',
    accent: 'bg-accent text-white border-accent/60',
    error: 'border-error/20 bg-error/5',
    primary: 'bg-primary text-white border-primary/60',
  };
  const iconColor = {
    default: 'text-tertiary',
    accent: 'text-white/80',
    error: 'text-error',
    primary: 'text-white/80',
  };
  const valueColor = {
    default: 'text-on-surface',
    accent: 'text-white',
    error: 'text-error',
    primary: 'text-white',
  };

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-700 ${variantMap[variant]}`}>
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined text-lg ${iconColor[variant]}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${variant === 'accent' || variant === 'primary' ? 'text-white/70' : 'text-on-surface-variant'}`}>{label}</p>
      </div>
      {numericValue !== undefined ? (
        <AnimatedNumber
          value={numericValue}
          className={`text-2xl font-black font-[var(--font-headline)] tracking-tight ${valueColor[variant]}`}
        />
      ) : (
        <p className={`text-2xl font-black font-[var(--font-headline)] tracking-tight ${valueColor[variant]}`}>{value}</p>
      )}
      {children}
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function RecordPaymentModal({ loan, onClose, onSuccess }: {
  loan: Repayment; onClose: () => void; onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(loan.emi.toString());
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await repaymentsApi.record({ loanId: loan.id, amount: parseFloat(amount), method, reference });
      toast.success(`Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} recorded!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-gradient-to-r from-accent to-on-primary-container text-white rounded-t-2xl">
          <h3 className="font-bold text-lg">Record Payment</h3>
          <p className="text-sm text-white/80 mt-1">{loan.customerName} — {loan.customerId}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Outstanding</p>
              <p className="text-sm font-black text-error">₹{loan.outstanding.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase">EMI Amount</p>
              <p className="text-sm font-black text-accent">₹{loan.emi.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            >
              {['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'ONLINE'].map(m => (
                <option key={m} value={m}>{m.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Reference / Transaction ID</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SEGMENT_MAP: Record<string, { filter: string; frequency: string }> = {
  'All': { filter: '', frequency: '' },
  'Daily': { filter: '', frequency: 'DAILY' },
  'Weekly': { filter: '', frequency: 'WEEKLY' },
  'Monthly': { filter: '', frequency: 'MONTHLY' },
  'Due Today': { filter: 'due-today', frequency: '' },
  'Overdue': { filter: 'overdue', frequency: '' },
};

const POLL_INTERVAL_MS = 8000; // 8 seconds live poll

export default function RepaymentTracker() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [stats, setStats] = useState<Stats>({
    outstanding: '', outstandingNum: 0,
    collectedToday: 0, collectedTodayTarget: 500000,
    overdueCount: 0, overdueAmount: '', overdueNum: 0,
    totalActive: 0,
  });
  const [activeSegment, setActiveSegment] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<Repayment | null>(null);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const prevOrderRef = useRef<string[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [pulsing, setPulsing] = useState(false);
  const [search, setSearch] = useState('');

  // ─ Rank repayments: most recently paid first, then soonest due next ─
  const rankRepayments = (data: Repayment[]): Repayment[] => {
    return [...data]
      .sort((a, b) => {
        // CLEARED goes to bottom
        if (a.status === 'CLEARED' && b.status !== 'CLEARED') return 1;
        if (b.status === 'CLEARED' && a.status !== 'CLEARED') return -1;

        // OVERDUE always rises to top
        if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
        if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1;

        // Most recently paid goes next
        const aLast = a.lastPayment ? new Date(a.lastPayment).getTime() : 0;
        const bLast = b.lastPayment ? new Date(b.lastPayment).getTime() : 0;
        if (aLast !== bLast) return bLast - aLast;

        // Soonest due goes next
        const aDue = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity;
        const bDue = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity;
        return aDue - bDue;
      })
      .map((r, i) => ({ ...r, rank: i + 1 }));
  };

  // ─ Detect rank changes and trigger flash animation ─
  const detectAndAnimateChanges = useCallback((newRanked: Repayment[]) => {
    const newOrder = newRanked.map(r => r.id);
    const prevOrder = prevOrderRef.current;

    if (prevOrder.length === 0) {
      prevOrderRef.current = newOrder;
      return;
    }

    const changed = newOrder.filter((id, idx) => prevOrder[idx] !== id);
    if (changed.length > 0) {
      setAnimatingIds(new Set(changed));
      setTimeout(() => setAnimatingIds(new Set()), 1500);
    }

    prevOrderRef.current = newOrder;
  }, []);

  const fetchRepayments = useCallback(async (isFirst = false) => {
    if (isFirst) setLoading(true);
    try {
      const segment = SEGMENT_MAP[activeSegment];
      const params: Record<string, string> = {
        ...(segment.filter ? { filter: segment.filter } : {}),
        ...(segment.frequency ? { frequency: segment.frequency } : {}),
        page: page.toString(),
        limit: '12',
      };
      if (search.trim()) params.search = search.trim();

      const res = await repaymentsApi.list(params);
      const data: Repayment[] = res.data.repayments ?? [];
      const ranked = rankRepayments(data);
      detectAndAnimateChanges(ranked);
      setRepayments(ranked);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
      setLastUpdated(new Date());
      setPulsing(true);
      setTimeout(() => pulsing ? null : setPulsing(false), 600);
    } catch (err) {
      if (isFirst) toast.error('Failed to load repayments');
    } finally {
      if (isFirst) setLoading(false);
    }
  }, [activeSegment, page, search, detectAndAnimateChanges]);

  // ─ Fetch live stats ─
  const fetchStats = useCallback(async () => {
    try {
      const res = await repaymentsApi.stats();
      const d = res.data;
      setStats({
        outstanding: '',
        collectedToday: d.collectedToday ?? 0,
        collectedTodayTarget: 500000,
        overdueCount: d.overdueCount ?? 0,
        overdueAmount: '',
        totalActive: d.totalActive ?? 0,
        outstandingNum: d.outstanding ?? 0,
        overdueNum: d.overdueAmount ?? 0,
      });
    } catch {
      // silently fail
    }
  }, []);


  // ─ Setup polling ─
  useEffect(() => {
    fetchRepayments(true);
    fetchStats();

    pollRef.current = setInterval(() => {
      fetchRepayments(false);
      fetchStats();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchRepayments, fetchStats]);

  const handlePaymentSuccess = () => {
    // Immediately re-fetch after payment
    setTimeout(() => {
      fetchRepayments(false);
      fetchStats();
    }, 300);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDueDateLabel = (r: Repayment) => {
    if (!r.nextDueDate) return '—';
    const now = new Date();
    const due = new Date(r.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due in ${diffDays}d (${formatDate(r.nextDueDate)})`;
  };

  const getDueDateColor = (r: Repayment) => {
    if (r.status === 'OVERDUE') return 'text-error font-black';
    if (!r.nextDueDate) return 'text-on-surface-variant';
    const diffDays = Math.ceil((new Date(r.nextDueDate).getTime() - Date.now()) / 86400000);
    if (diffDays <= 0) return 'text-error font-black';
    if (diffDays <= 2) return 'text-amber-600 font-bold';
    if (diffDays <= 7) return 'text-yellow-600 font-bold';
    return 'text-on-surface-variant';
  };

  const { outstandingNum, overdueNum } = stats;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">
            Repayment Tracker
          </h2>
          <p className="text-on-surface-variant text-sm">
            Live leaderboard — auto-ranked by last payment &amp; upcoming due dates.
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 ${pulsing ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-surface-container border-outline-variant/20 text-on-surface-variant'}`}>
            <span className={`w-2 h-2 rounded-full ${pulsing ? 'bg-accent animate-ping' : 'bg-accent'}`} />
            LIVE
            <span className="font-normal opacity-70">{lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <LiveStatCard label="Total Outstanding" numericValue={outstandingNum} icon="account_balance" variant="default">
          <p className="text-[10px] text-on-surface-variant">{total} active loans being tracked</p>
        </LiveStatCard>

        <LiveStatCard label="Collected Today" numericValue={stats.collectedToday} icon="payments" variant="accent">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000 rounded-full"
                style={{ width: `${Math.min(100, (stats.collectedToday / (stats.collectedTodayTarget || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white/80">
              {Math.round((stats.collectedToday / (stats.collectedTodayTarget || 1)) * 100)}% Target
            </span>
          </div>
        </LiveStatCard>

        <LiveStatCard label="Overdue Amount" numericValue={overdueNum} icon="warning" variant="error">
          <div className="flex items-center gap-1 text-error/80">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="text-[10px] font-bold">{stats.overdueCount} overdue accounts</span>
          </div>
        </LiveStatCard>

        <LiveStatCard label="Total Records" value={total.toString()} icon="list_alt" variant="primary">
          <button
            onClick={() => fetchRepayments(true)}
            className="text-[10px] font-bold text-white/80 underline underline-offset-2 hover:text-white transition-colors"
          >
            REFRESH NOW
          </button>
        </LiveStatCard>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5 bg-surface-container-low p-1.5 rounded-xl">
          {Object.keys(SEGMENT_MAP).map(s => (
            <button
              key={s}
              onClick={() => { setActiveSegment(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSegment === s
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              {s === 'Overdue' && <span className="w-1.5 h-1.5 rounded-full bg-error" />}
              {s}
            </button>
          ))}
        </div>


        <div className="relative group max-w-xs flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-accent transition-colors text-sm">search</span>
          <input
            type="text"
            placeholder="Search name or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-on-surface focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>



      {/* Live Leaderboard Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-tertiary">Live Leaderboard</span>
            <span className="text-xs text-on-surface-variant">{total} total records</span>
            {pulsing && (
              <span className="text-[10px] font-bold text-accent animate-pulse">● Updated</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold uppercased">
            <span className="material-symbols-outlined text-sm text-accent">swap_vert</span>
            Auto-ranked by last payment &amp; due date
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant text-sm font-bold animate-pulse">Fetching live repayment data...</p>
          </div>
        ) : repayments.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">
              account_balance_wallet
            </span>
            <p className="text-on-surface-variant font-bold">No active repayment records found.</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">Disbursed loans with repayment schedules will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50">
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 w-12">Rank</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Customer</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Loan</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Paid</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">Outstanding</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70 text-right">EMI</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Last Paid</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Next Due</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Status</th>
                  <th className="px-4 py-4 w-16" />
                </tr>
              </thead>
              <tbody className="text-sm">
                {repayments.map((r) => {
                  const isAnimating = animatingIds.has(r.id);
                  const paidPct = r.loanAmount > 0 ? Math.min(100, (r.totalPaid / r.loanAmount) * 100) : 0;
                  const isOverdue = r.status === 'OVERDUE';
                  const isCleared = r.status === 'CLEARED';
                  const isDueToday = r.status === 'DUE_TODAY';
                  const isAutopayActive = r.subscriptionStatus === 'active';

                  return (
                    <tr
                      key={r.id}
                      className={`
                        border-b border-outline-variant/5 last:border-0
                        transition-all duration-700
                        ${isAnimating ? 'bg-accent/10 scale-[1.01] shadow-md' : ''}
                        ${isOverdue && !isAnimating ? 'bg-error/5' : ''}
                        ${isDueToday && !isAnimating ? 'bg-accent/5 border-l-2 border-l-accent' : ''}
                        ${isCleared ? 'opacity-50' : ''}
                        hover:bg-surface/80
                      `}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4">
                        <div className={`transition-all duration-500 ${isAnimating ? 'scale-125' : ''}`}>
                          <RankBadge rank={r.rank ?? 0} />
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-tertiary">{r.customerName}</p>
                          <AutopayBadge status={r.subscriptionStatus} />
                        </div>
                        <p className="text-[10px] text-on-surface-variant">{r.customerId}</p>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-1 flex-1 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                isCleared ? 'bg-accent' :
                                isOverdue ? 'bg-error' :
                                'bg-tertiary'
                              }`}
                              style={{ width: `${paidPct}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-on-surface-variant whitespace-nowrap">
                            {paidPct.toFixed(0)}% paid
                          </span>
                        </div>
                      </td>

                      {/* Loan Amount */}
                      <td className="px-4 py-4 text-right font-medium text-on-surface">
                        <AnimatedNumber value={r.loanAmount} className="font-medium" />
                      </td>

                      {/* Total Paid */}
                      <td className="px-4 py-4 text-right text-accent font-bold">
                        <AnimatedNumber value={r.totalPaid} className="font-bold text-accent" />
                      </td>

                      {/* Outstanding */}
                      <td className="px-4 py-4 text-right">
                        <AnimatedNumber
                          value={r.outstanding}
                          className={`font-bold ${isOverdue ? 'text-error' : isCleared ? 'text-on-surface-variant line-through opacity-50' : 'text-tertiary'}`}
                        />
                      </td>

                      {/* EMI */}
                      <td className="px-4 py-4 text-right font-bold text-on-surface">
                        <AnimatedNumber value={r.emi} />
                      </td>

                      {/* Last Paid */}
                      <td className="px-4 py-4">
                        <p className={`text-xs ${r.lastPayment ? 'text-accent font-bold' : 'text-on-surface-variant/50 italic'}`}>
                          {r.lastPayment ? formatDate(r.lastPayment) : 'No payment yet'}
                        </p>
                      </td>

                      {/* Next Due */}
                      <td className="px-4 py-4">
                        <p className={`text-xs ${getDueDateColor(r)}`}>
                          {isCleared ? '✓ Fully Repaid' : getDueDateLabel(r)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={r.status} />
                        {isAnimating && (
                          <span className="text-[9px] block mt-1 text-accent font-bold animate-pulse">↑ Updated</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        {!isCleared && (
                          isAutopayActive ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold cursor-default select-none">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>autorenew</span>
                              Auto
                            </span>
                          ) : (
                            <button
                              onClick={() => setPaymentModal(r)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-[10px] font-bold hover:bg-accent hover:text-white transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-sm">add_card</span>
                              Pay
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold disabled:opacity-40 hover:bg-surface-container transition-all"
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold disabled:opacity-40 hover:bg-surface-container transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModal && (
        <RecordPaymentModal
          loan={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* FAB — quick record payment */}
      <button
        onClick={() => toast('Click the Pay button on any row to record a repayment.', { icon: '💳' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl shadow-accent/30 hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined text-2xl">add_card</span>
      </button>
    </div>
  );
}
