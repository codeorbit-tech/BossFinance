'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Line, PieChart, Pie, Cell, ComposedChart, Bar
} from 'recharts';
import { expensesApi, repaymentsApi, investmentApi, analyticsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Summary {
  income: number;
  expenses: number;
  razorpayFees: number;
  manualExpenses: number;
  grossProfit: number;
  interestEarned: number;
  penaltyEarned: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
  capitalDeployed: number;
  capitalRecovered: number;
  recoveryPercentage: number;
  activeLoans: number;
  efficiency: number;
  totalInvested: number;
  netBalance: number;
}

interface ChartPoint { month: string; income: number; expense: number; profit: number; }
interface LoanTypePoint { name: string; value: number; }
interface CategoryPoint { name: string; value: number; }

interface AnalyticsData {
  summary: Summary;
  chartData: ChartPoint[];
  loanTypeProfit: LoanTypePoint[];
  categoryBreakdown: CategoryPoint[];
}

interface IncomeRecord {
  id: string;
  paidAt: string;
  customerName: string;
  customerId: string;
  loanType: string;
  amount: number;
  method: string;
  paymentType: string;
  transactionId: string | null;
}

interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  period: string;
  addedBy: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const EXPENSE_CATEGORIES = [
  'Staff Salary', 'Office Rent', 'Travel / Collection Expense',
  'Stationary / Printing', 'Software / Tools', 'Legal / Documentation', 'Miscellaneous',
];

const PIE_COLORS = ['#1a3d2b', '#2d8a4e', '#4ade80', '#86efac', '#bbf7d0', '#6366f1', '#f59e0b'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/5" />
          <div className="h-4 bg-slate-200 rounded w-1/5" />
          <div className="h-4 bg-slate-200 rounded w-2/5" />
          <div className="h-4 bg-slate-200 rounded w-1/5" />
        </div>
      ))}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/40">
      <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
      <p className="font-bold text-sm uppercase tracking-widest">{message}</p>
    </div>
  );
}

// ─── Month Picker ──────────────────────────────────────────────────────────────
function MonthPicker({ value, onChange }: { value: { month: number; year: number }; onChange: (v: { month: number; year: number }) => void }) {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ month: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }) });
  }

  return (
    <select
      value={`${value.year}-${value.month}`}
      onChange={(e) => {
        const [y, m] = e.target.value.split('-').map(Number);
        onChange({ year: y, month: m });
      }}
      className="bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-bold text-on-surface focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
    >
      {options.map(o => (
        <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Export Buttons ───────────────────────────────────────────────────────────
function ExportButtons({ onExportIncome, onExportExpenses }: { onExportIncome: () => void; onExportExpenses: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onExportIncome} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all">
        <span className="material-symbols-outlined text-sm">payments</span> Export Income
      </button>
      <button onClick={onExportExpenses} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all">
        <span className="material-symbols-outlined text-sm">receipt_long</span> Export Expenses
      </button>
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ summary, loading, onProfitClick, onExpenseClick }: { 
  summary: Summary | null; 
  loading: boolean;
  onProfitClick?: () => void;
  onExpenseClick?: () => void;
}) {
  const cards = [
    { 
      label: 'Total Profit', 
      value: summary?.grossProfit ?? 0, 
      icon: 'workspace_premium', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100', 
      sub: 'Click for breakdown',
      interactive: true,
      onClick: onProfitClick
    },
    { 
      label: 'Total Expenses', 
      value: -(summary?.expenses ?? 0), 
      icon: 'receipt_long', 
      color: 'text-error', 
      bg: 'bg-error/10', 
      sub: 'Click for breakdown',
      interactive: true,
      onClick: onExpenseClick
    },
    { label: 'Total Invested', value: summary?.totalInvested ?? 0, icon: 'trending_up', color: 'text-blue-500', bg: 'bg-blue-100', sub: `Net: ${fmt(summary?.netBalance ?? 0)}` },
    { label: 'Capital Deployed', value: summary?.capitalDeployed ?? 0, icon: 'account_balance_wallet', color: 'text-tertiary', bg: 'bg-tertiary/10', sub: `${summary?.activeLoans ?? 0} active loans` },
    { label: 'Capital Recovered', value: summary?.capitalRecovered ?? 0, icon: 'keyboard_return', color: 'text-primary', bg: 'bg-primary/10', sub: `${summary?.recoveryPercentage ?? 0}% of deployed` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((c, i) => (
        <div 
          key={i} 
          onClick={c.interactive ? c.onClick : undefined}
          className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 shadow-sm transition-all ${c.interactive ? 'cursor-pointer hover:border-accent hover:shadow-md active:scale-[0.98]' : ''}`}
        >
          <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
            <span className={`material-symbols-outlined text-lg ${c.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
          </div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{c.label}</p>
          {loading ? (
            <div className="h-6 w-28 bg-slate-200 rounded animate-pulse" />
          ) : (
            <h3 className={`text-xl font-black ${c.color}`}>
              {c.value < 0 ? '−' : ''}{fmt(c.value)}
            </h3>
          )}
          <p className="text-[10px] text-on-surface-variant mt-1">{c.sub}</p>
          {c.interactive && (
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-accent uppercase tracking-tighter">
              <span className="material-symbols-outlined text-xs">analytics</span>
              View Details
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


// ─── Expense Table ────────────────────────────────────────────────────────────
function ExpenseTable({ month, year, onSummaryRefresh }: { month: number; year: number; onSummaryRefresh: () => void }) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ExpenseRecord | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: 'Staff Salary',
    description: '',
    amount: '',
    period: 'MONTHLY',
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expensesApi.list({ 
        month: month.toString(), 
        year: year.toString()
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.expenses ?? []);
      setExpenses(list);
      setTotal(data.total ?? list.length);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ date: new Date().toISOString().slice(0, 10), category: 'Staff Salary', description: '', amount: '', period: 'MONTHLY' });
    setModalOpen(true);
  };

  const openEdit = (e: ExpenseRecord) => {
    setEditTarget(e);
    setForm({ date: e.date.slice(0, 10), category: e.category, description: e.description, amount: e.amount.toString(), period: e.period });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.description) { toast.error('Fill all required fields'); return; }
    try {
      if (editTarget) {
        await expensesApi.update(editTarget.id, form);
        toast.success('Expense updated');
      } else {
        await expensesApi.create(form);
        toast.success('Expense added');
      }
      setModalOpen(false);
      fetch();
      onSummaryRefresh();
    } catch {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await expensesApi.delete(id);
      toast.success('Expense deleted');
      fetch();
      onSummaryRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExport = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Expenses');
    ws.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Period', key: 'period', width: 15 },
      { header: 'Added By', key: 'addedBy', width: 18 },
    ];
    expenses.forEach(e => ws.addRow({ ...e, date: fmtDate(e.date) }));
    const buf = await wb.xlsx.writeBuffer();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = `Expenses_${year}-${month}.xlsx`;
    a.click();
    toast.success('Expenses exported');
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-tertiary">Expenses — Operational Costs</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{total} expense entries for this period</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20">
            <span className="material-symbols-outlined text-sm">add</span> Add Expense
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto min-h-[200px]">
        {loading ? <Skeleton /> : expenses.length === 0 ? <Empty message="No expense entries yet — add your first one" /> : (
          <>
            {/* Mobile Cards */}
            <div className="block lg:hidden divide-y divide-outline-variant/5">
              {expenses.map(e => (
                <div key={e.id} className="p-4 space-y-3 hover:bg-surface/60 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-tighter">{e.category}</span>
                      <p className="font-bold text-on-surface mt-1.5">{e.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-error text-base">{fmt(e.amount)}</p>
                      <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">{e.period}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {fmtDate(e.date)}
                      <span className="mx-1 opacity-20">|</span>
                      <span className="material-symbols-outlined text-xs">person</span>
                      {e.addedBy}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg bg-surface-container-high text-primary active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg bg-error/10 text-error active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <table className="hidden lg:table w-full text-left text-sm">
              <thead className="bg-surface-container/50 text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Added By</th>
                  <th className="px-6 py-4 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-6 py-4 text-on-surface-variant text-xs">{fmtDate(e.date)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{e.category}</span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{e.description}</td>
                    <td className="px-6 py-4 text-right font-black text-error">{fmt(e.amount)}</td>
                    <td className="px-6 py-4 text-[10px] text-on-surface-variant">{e.period}</td>
                    <td className="px-6 py-4 text-[10px] text-on-surface-variant">{e.addedBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(e)} className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b flex items-center justify-between bg-primary text-white rounded-t-2xl">
              <h3 className="font-bold">{editTarget ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button onClick={() => setModalOpen(false)} className="hover:bg-white/10 rounded-full p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {['date', 'category', 'description', 'amount', 'period'].map(field => (
                <div key={field}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{field}</label>
                  {field === 'category' ? (
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  ) : field === 'period' ? (
                    <select
                      value={form.period}
                      onChange={e => setForm({ ...form, period: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      {['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field === 'date' ? 'date' : field === 'amount' ? 'number' : 'text'}
                      value={(form as any)[field]}
                      placeholder={field === 'description' ? 'e.g. Office rent – April 2026' : field === 'amount' ? '0.00' : ''}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  )}
                </div>
              ))}
              <button onClick={handleSave} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 mt-2">
                {editTarget ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function Charts({ data, loading }: { data: Pick<AnalyticsData, 'chartData' | 'loanTypeProfit' | 'categoryBreakdown'> | null; loading: boolean }) {
  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map(i => <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 h-72 animate-pulse" />)}
    </div>
  );

  const allZeroLoan   = !data?.loanTypeProfit?.some(l => l.value > 0);
  const allZeroCategory = !data?.categoryBreakdown?.some(c => c.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Income vs Expense Chart */}
      <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6">
        <h3 className="font-bold text-tertiary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-accent">bar_chart</span>
          6-Month Income vs Expense Trend
        </h3>
        {!data?.chartData?.length ? <Empty message="No chart data available" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }}
                tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} />
              <Tooltip formatter={(v) => [fmt(Number(v ?? 0)), '']} />
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="income" fill="#2d8a4e" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name="Net Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Charts stacked */}
      <div className="flex flex-col gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 flex-1">
          <h3 className="font-bold text-tertiary text-sm mb-3">Income by Loan Type</h3>
          {allZeroLoan ? <Empty message="No income recorded yet" /> : (
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={data?.loanTypeProfit} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                  {data?.loanTypeProfit?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [fmt(Number(v ?? 0)), '']} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!allZeroLoan && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {data?.loanTypeProfit?.filter(l => l.value > 0).map((l, i) => (
                <span key={l.name} className="flex items-center gap-1 text-[9px] font-bold text-on-surface-variant">
                  <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 flex-1">
          <h3 className="font-bold text-tertiary text-sm mb-3">Expenses by Category</h3>
          {allZeroCategory ? <Empty message="No expenses recorded" /> : (
            <div className="space-y-2">
              {data?.categoryBreakdown?.slice(0, 5).map((c, i) => {
                const total = data.categoryBreakdown.reduce((a, b) => a + b.value, 0);
                const pct = total > 0 ? (c.value / total * 100).toFixed(0) : 0;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-[10px] font-bold mb-0.5">
                      <span className="text-on-surface">{c.name}</span>
                      <span className="text-error">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-error/70 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Investment Section Components ──────────────────────────────────────────
function InvestmentTable({ month, year, onRefresh }: { month: number, year: number, onRefresh: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await investmentApi.list({ month: month.toString(), year: year.toString() });
      setItems(res.data.investments);
    } catch {
      toast.error('Failed to load investment transactions');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await investmentApi.delete(id);
      toast.success('Transaction deleted');
      fetchItems();
      onRefresh(); // Refresh total analytics
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  if (loading) return <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" />;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low flex items-center justify-between">
        <h3 className="font-black text-tertiary uppercase tracking-wider text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">ledger</span>
          Investment Ledger
        </h3>
      </div>
      <div className="overflow-x-auto">
        {/* Mobile Cards */}
        <div className="block lg:hidden divide-y divide-outline-variant/5">
          {items.length === 0 ? (
            <div className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium italic">
              No transactions recorded this month.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 space-y-3 hover:bg-surface-container-lowest/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      item.type === 'INVESTMENT' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'PROFIT' ? 'bg-accent/20 text-accent' :
                      'bg-error/10 text-error'
                    }`}>
                      {item.type}
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-1.5">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${item.type === 'PROFIT' ? 'text-accent' : 'text-on-surface'}`}>
                      {fmt(item.amount)}
                    </p>
                    <p className="text-[9px] text-on-surface-variant font-bold">{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-error/5 text-error active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Desktop Table */}
        <table className="hidden lg:table w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium italic">
                  No transactions recorded this month.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-on-surface">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      item.type === 'INVESTMENT' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'PROFIT' ? 'bg-accent/20 text-accent' :
                      'bg-error/10 text-error'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant max-w-[200px] truncate">{item.description}</td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${item.type === 'PROFIT' ? 'text-accent' : 'text-on-surface'}`}>
                    {fmt(item.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddInvestmentModal({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], type: 'INVESTMENT', description: '', amount: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await investmentApi.create(formData);
      toast.success('Transaction added successfully');
      onRefresh();
      onClose();
    } catch {
      toast.error('Failed to add investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-8 text-white relative">
          <button type="button" onClick={onClose} className="absolute top-6 right-6 font-black text-xl">×</button>
          <h2 className="text-2xl font-black tracking-tight mb-1">New Investment Activity</h2>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Record capital movement or profits</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-surface-container-high rounded-xl border-none text-sm font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="INVESTMENT">Investment</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="PROFIT">Profit Entry</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-surface-container-high rounded-xl border-none text-sm font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Amount (₹)</label>
            <input
              type="number"
              required
              placeholder="e.g. 50000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-surface-container-high rounded-xl border-none text-xl font-black py-4 px-4 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Description</label>
            <textarea
              placeholder="Source, reason, or details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface-container-high rounded-xl border-none text-sm font-medium py-3 px-4 h-24 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Confirm Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

function InvestmentSection({ month, year, onSummaryRefresh }: { month: number, year: number, onSummaryRefresh: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await investmentApi.list({ month: month.toString(), year: year.toString() });
      setSummary(res.data.summary);
    } catch {
      toast.error('Failed to load investment summary');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const cards = [
    { label: 'Total Invested', value: summary?.totalInvested ?? 0, color: 'text-blue-600', icon: 'account_balance', sub: 'Capital committed' },
    { label: 'Total Withdrawn', value: summary?.totalWithdrawn ?? 0, color: 'text-amber-600', icon: 'output', sub: 'Funds returned to business' },
    { label: 'Earned Profit', value: summary?.totalProfit ?? 0, color: 'text-accent', icon: 'trending_up', sub: 'Contribution to Net Profit' },
    { label: 'Net Balance', value: (summary?.totalInvested ?? 0) - (summary?.totalWithdrawn ?? 0), color: 'text-tertiary', icon: 'wallet', sub: 'Current active capital' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-tertiary uppercase tracking-wider text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">trending_up</span>
          Investment Performance
        </h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg font-bold">add</span>
          Record Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-surface-container-high ${c.color.replace('text', 'text-opacity-20')}`}>
                <span className={`material-symbols-outlined text-xl ${c.color}`}>{c.icon}</span>
              </div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{c.label}</p>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className={`text-2xl font-black ${c.color}`}>{fmt(c.value)}</p>
            )}
            <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-tight">{c.sub}</p>
          </div>
        ))}
      </div>

      <InvestmentTable month={month} year={year} onRefresh={() => { fetchSummary(); onSummaryRefresh(); }} />
      {isModalOpen && <AddInvestmentModal onClose={() => setIsModalOpen(false)} onRefresh={() => { fetchSummary(); onSummaryRefresh(); }} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpenseTrackerPage() {
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [profitBreakdown, setProfitBreakdown] = useState<any>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await expensesApi.summary({ 
        month: period.month.toString(), 
        year: period.year.toString()
      });
      setAnalytics(res.data);
    } catch {
      toast.error('Failed to load analytics summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [period]);

  const fetchProfitBreakdown = async () => {
    setLoadingBreakdown(true);
    try {
      const res = await analyticsApi.getProfitBreakdown({});
      setProfitBreakdown(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profit breakdown');
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleProfitClick = () => {
    setIsProfitModalOpen(true);
    fetchProfitBreakdown();
  };

  const handleExpenseClick = () => {
    setIsExpenseModalOpen(true);
    if (!profitBreakdown) fetchProfitBreakdown();
  };

  useEffect(() => { fetchSummary(); }, [fetchSummary]);



  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">
            General Expense Tracker
          </h2>
          <p className="text-sm text-on-surface-variant">
            A comprehensive overview of business income, operational costs, and net profitability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthPicker value={period} onChange={setPeriod} />
          <button
            onClick={fetchSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        {/* Summary Cards */}
        <SummaryCards 
          summary={analytics?.summary ?? null} 
          loading={summaryLoading} 
          onProfitClick={handleProfitClick} 
          onExpenseClick={handleExpenseClick}
        />

        {/* Profitability Quick Stats */}
        {analytics?.summary && !summaryLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Recovery Rate', value: `${analytics.summary.recoveryPercentage}%`, icon: 'pie_chart', color: 'text-accent' },
              { label: 'Active Loans', value: analytics.summary.activeLoans.toString(), icon: 'receipt_long', color: 'text-tertiary' },
              { label: 'Net Return', value: analytics.summary.capitalDeployed > 0 ? `${(analytics.summary.netProfit / analytics.summary.capitalDeployed * 100).toFixed(2)}%` : '0%', icon: 'trending_up', color: analytics.summary.netProfit >= 0 ? 'text-accent' : 'text-error' },
            ].map((s, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 flex items-center gap-3">
                <span className={`material-symbols-outlined text-2xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</p>
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Income & Expense Tables */}
        <div className="grid grid-cols-1 gap-6">
          <ExpenseTable month={period.month} year={period.year} onSummaryRefresh={fetchSummary} />
        </div>

        {/* Charts */}
        <Charts data={analytics} loading={summaryLoading} />

        {/* Investment Section */}
        <InvestmentSection month={period.month} year={period.year} onSummaryRefresh={fetchSummary} />
      </div>

      {/* Profit Breakdown Modal */}
      {isProfitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-tertiary p-8 text-white relative">
              <button 
                onClick={() => setIsProfitModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-xl"
              >
                ×
              </button>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">Detailed Analytics</p>
              <h2 className="text-3xl font-black tracking-tight leading-none mb-4">Profit Breakdown</h2>
              <div className="mt-6 p-4 rounded-2xl bg-white/10 border border-white/10 flex items-baseline gap-2">
                <span className="text-4xl font-black text-accent">{loadingBreakdown ? '...' : fmt(profitBreakdown?.netProfit ?? 0)}</span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Net Profit</span>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {loadingBreakdown ? (
                <div className="space-y-4 py-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {profitBreakdown?.breakdown.map((item: any, i: number) => (
                      <div key={i} className="bg-surface-container-high p-4 rounded-2xl border border-outline-variant/10 hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                        </div>
                        <p className={`text-lg font-black ${item.color}`}>{fmt(item.value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-outline-variant/30 mt-4">
                    <div className="bg-accent/10 p-5 rounded-2xl border border-accent/20">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest font-mono">Tally Ledger</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/20 rounded-full border border-accent/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          <span className="text-accent text-[8px] font-black uppercase tracking-wider">Calculated</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant font-medium">Interest + Penalties</span>
                          <span className="text-accent font-black">{fmt((profitBreakdown?.interest ?? 0) + (profitBreakdown?.penalty ?? 0))}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant font-medium">Monthly Expenses</span>
                          <span className="text-error font-black">−{fmt(profitBreakdown?.expenses ?? 0)}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t border-accent/20 flex justify-between items-center">
                          <span className="text-tertiary font-bold">Net Profit</span>
                          <span className="text-2xl font-black text-tertiary tracking-tighter">{fmt(profitBreakdown?.netProfit ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setIsProfitModalOpen(false)}
                className="w-full mt-8 py-4 bg-tertiary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-tertiary/20 active:scale-95"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Breakdown Modal — card-grid style matching Profit modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-error p-8 text-white relative">
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-xl"
              >
                ×
              </button>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">Detailed Analytics</p>
              <h2 className="text-3xl font-black tracking-tight leading-none mb-4">Expense Breakdown</h2>
              <div className="mt-6 p-4 rounded-2xl bg-white/10 border border-white/10 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">
                  {loadingBreakdown ? '...' : fmt(profitBreakdown?.expenses ?? analytics?.summary?.expenses ?? 0)}
                </span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Total Expenses This Month</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {loadingBreakdown ? (
                <div className="space-y-4 py-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Expense cards — same grid as profit modal */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Manual operational expenses */}
                    <div className="bg-surface-container-high p-4 rounded-2xl border border-outline-variant/10 hover:border-error/30 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-sm text-error">receipt_long</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Manual Expenses</span>
                      </div>
                      <p className="text-lg font-black text-error">−{fmt(profitBreakdown?.manualExpenses ?? 0)}</p>
                      <p className="text-[9px] text-on-surface-variant mt-1">Staff salary, rent, travel, etc.</p>
                    </div>

                    {/* Cashfree / Razorpay commission */}
                    <div className="bg-surface-container-high p-4 rounded-2xl border border-outline-variant/10 hover:border-amber-400/30 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-sm text-amber-600">currency_exchange</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cashfree Commission</span>
                      </div>
                      <p className="text-lg font-black text-amber-600">−{fmt(profitBreakdown?.razorpayFees ?? 0)}</p>
                      <p className="text-[9px] text-on-surface-variant mt-1">1% on online/UPI collections</p>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Manual Expense Breakdown</p>
                      <div className="space-y-2">
                        {analytics.categoryBreakdown.sort((a, b) => b.value - a.value).map((cat, i) => {
                          const total = profitBreakdown?.manualExpenses || analytics.summary?.expenses || 1;
                          const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : '0';
                          return (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                              <span className="text-sm text-on-surface-variant font-medium">{cat.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{pct}%</span>
                                <span className="font-black text-error text-sm w-24 text-right">−{fmt(cat.value)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tally ledger — same as profit modal */}
                  <div className="pt-4 border-t border-outline-variant/30 mt-2">
                    <div className="bg-error/5 p-5 rounded-2xl border border-error/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-error uppercase tracking-widest font-mono">Cost Summary</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-error/10 rounded-full border border-error/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                          <span className="text-error text-[8px] font-black uppercase tracking-wider">Calculated</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant font-medium">Operational Costs</span>
                          <span className="text-error font-black">−{fmt(profitBreakdown?.manualExpenses ?? 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant font-medium">Cashfree Commission (1%)</span>
                          <span className="text-error font-black">−{fmt(profitBreakdown?.razorpayFees ?? 0)}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t border-error/20 flex justify-between items-center">
                          <span className="text-tertiary font-bold">Total Outgoing</span>
                          <span className="text-2xl font-black text-error tracking-tighter">−{fmt(profitBreakdown?.expenses ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-full mt-8 py-4 bg-error text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-error/20 active:scale-95"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}