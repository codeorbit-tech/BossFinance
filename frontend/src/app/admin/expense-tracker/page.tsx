'use client';

import { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Line, PieChart, Pie, Cell, ComposedChart, Bar
} from 'recharts';
import { analyticsApi, expensesApi, repaymentsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ExcelJS from 'exceljs';

interface SummaryData {
  capitalDeployed: number;
  capitalRecovered: number;
  recoveryPercentage: string | number;
  monthlyExpenses: number;
  netProfit: number;
  efficiency: number;
  activeLoans: number;
}

interface AnalyticsData {
  summary: SummaryData;
  chartData: { month: string; income: number; expense: number; profit: number }[];
  loanTypeProfit: { name: string; value: number }[];
}

interface IncomeRecord {
  id: string;
  lastPayment: string | null;
  customerName: string;
  customerId: string;
  loanAmount: number;
  totalPaid: number;
  outstanding: number;
  status: string;
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

// Reusable Skeleton Component
const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
      </div>
    ))}
  </div>
);

// Reusable Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/40">
    <span className="material-symbols-outlined text-6xl mb-4">folder_open</span>
    <p className="font-bold text-sm uppercase tracking-widest">{message}</p>
  </div>
);

// Section 1: Summary Cards Component
const SummaryCards = ({ summary }: { summary: SummaryData }) => {
  const stats = [
    { 
      label: 'Capital Deployed', 
      value: `₹${summary?.capitalDeployed?.toLocaleString() || 0}`, 
      subtext: `Across ${summary?.activeLoans || 0} active loans`, 
      icon: 'account_balance_wallet' 
    },
    { 
      label: 'Capital Recovered', 
      value: `₹${summary?.capitalRecovered?.toLocaleString() || 0}`, 
      subtext: `${summary?.recoveryPercentage || 0}% of deployed capital`, 
      icon: 'keyboard_return' 
    },
    { 
      label: 'Total Expenses', 
      value: `₹${summary?.monthlyExpenses?.toLocaleString() || 0}`, 
      subtext: 'Operational costs this month', 
      icon: 'payments', 
      isNegative: true 
    },
    { 
      label: 'Net Profit', 
      value: `₹${summary?.netProfit?.toLocaleString() || 0}`, 
      subtext: 'This month', 
      icon: 'trending_up', 
      isPositive: (summary?.netProfit || 0) >= 0,
      isNegative: (summary?.netProfit || 0) < 0
    },
    { 
      label: 'Collection Efficiency', 
      value: `${summary?.efficiency || 0}%`, 
      subtext: 'Target: 90%', 
      icon: 'speed', 
      efficiency: summary?.efficiency || 0 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            {stat.efficiency !== undefined && (
              <div className="w-16 h-1 bg-surface-container-high rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full rounded-full ${stat.efficiency > 80 ? 'bg-green-500' : stat.efficiency > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${stat.efficiency}%` }}
                />
              </div>
            )}
          </div>
          <p className="text-sm text-on-surface-variant font-medium mb-1">{stat.label}</p>
          <h3 className={`text-2xl font-bold ${
            stat.isPositive ? 'text-green-600' : 
            stat.isNegative ? 'text-red-600' : 
            'text-tertiary'
          }`}>
            {stat.value}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
};

// Section 3: Income Table
const IncomeTable = () => {
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const res = await repaymentsApi.list({ limit: '10' });
      setIncome(res.data.repayments || []);
    } catch {
      toast.error('Failed to fetch income records');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Income');
    worksheet.columns = [
      { header: 'Date', key: 'paidAt', width: 20 },
      { header: 'Customer ID', key: 'customerId', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Loan Amount', key: 'loanAmount', width: 15 },
      { header: 'Amount Paid', key: 'totalPaid', width: 15 },
      { header: 'Outstanding', key: 'outstanding', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    income.forEach(item => worksheet.addRow({
      ...item,
      paidAt: item.lastPayment ? new Date(item.lastPayment).toLocaleDateString() : 'N/A'
    }));
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Income_Breakdown.xlsx';
    anchor.click();
    toast.success('Income report exported');
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-white/5 mb-8 overflow-hidden">
      <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
        <div>
          <h3 className="font-bold text-tertiary">Recent Repayments</h3>
          <p className="text-xs text-on-surface-variant">Live feed of incoming loan collections.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export
        </button>
      </div>
      <div className="overflow-x-auto min-h-[200px]">
        {isLoading ? (
          <TableSkeleton />
        ) : income.length === 0 ? (
          <EmptyState message="No income records found" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Last Payment</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Loan Amount</th>
                <th className="px-6 py-4 text-right">Total Paid</th>
                <th className="px-6 py-4 text-right">Outstanding</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {income.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-tertiary">
                    {item.lastPayment ? new Date(item.lastPayment).toLocaleDateString() : 'No payments'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-tertiary">{item.customerName}</p>
                    <p className="text-[10px] text-on-surface-variant">{item.customerId}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-on-surface-variant">₹{item.loanAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">₹{item.totalPaid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-tertiary">₹{item.outstanding.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                      item.status === 'CLEARED' ? 'bg-green-100 text-green-700' :
                      item.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Section 4: Expense Table
const ExpenseTable = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Staff Salary',
    description: '',
    amount: '',
    period: 'Monthly'
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await expensesApi.list();
      setExpenses(res.data);
    } catch {
      toast.error('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await expensesApi.create(newExpense);
      toast.success('Expense added successfully');
      setIsModalOpen(false);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Staff Salary',
        description: '',
        amount: '',
        period: 'Monthly'
      });
      fetchExpenses();
    } catch {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense entry?')) return;
    try {
      await expensesApi.delete(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Period', key: 'period', width: 15 },
      { header: 'Added By', key: 'addedBy', width: 15 },
    ];
    expenses.forEach(item => worksheet.addRow({
      ...item,
      date: new Date(item.date).toLocaleDateString()
    }));
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Expense_Breakdown.xlsx';
    anchor.click();
    toast.success('Expense report exported');
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-white/5 mb-8 overflow-hidden">
      <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
        <div>
          <h3 className="font-bold text-tertiary">Expense Breakdown</h3>
          <p className="text-xs text-on-surface-variant">Manual entries of operational costs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Expense
          </button>
          <button 
            onClick={handleExport}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto min-h-[200px]">
        {isLoading ? (
          <TableSkeleton />
        ) : expenses.length === 0 ? (
          <EmptyState message="No expense records found" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-tertiary">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs font-bold text-primary">{item.category}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{item.description}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">₹{item.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-primary text-white">
              <h3 className="font-bold text-lg">Add New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none">
                  <option>Staff Salary</option>
                  <option>Office Rent</option>
                  <option>Travel / Collection Expense</option>
                  <option>Stationary / Printing</option>
                  <option>Software / Tools</option>
                  <option>Legal / Documentation</option>
                  <option>Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <input type="text" placeholder="Rent for Jan 2025" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                <input type="number" placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none" />
              </div>
              <button onClick={handleAddExpense} className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-2 hover:opacity-90 shadow-lg shadow-primary/20">
                Save Expense Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section 5: Profitability Section
const Profitability = ({ summary }: { summary: SummaryData }) => {
  const cards = [
    { label: 'Gross Profit', value: `₹${summary?.netProfit?.toLocaleString() || 0}`, subtext: 'Total Income − Total Expenses', icon: 'payments' },
    { label: 'Net Profit', value: `₹${(summary ? summary.netProfit * 0.8 : 0).toLocaleString()}`, subtext: 'After 20% estimated tax', icon: 'account_balance', color: 'text-green-600' },
    { label: 'Recovery Rate', value: `${summary?.recoveryPercentage || 0}%`, subtext: 'Capital recovered so far', icon: 'show_chart' },
    { label: 'Efficiency', value: `${summary?.efficiency || 0}%`, subtext: 'Collection efficiency', icon: 'speed', color: 'text-blue-600' },
    { label: 'Active Loans', value: summary?.activeLoans?.toString() || '0', subtext: 'Currently serviced', icon: 'receipt_long' },
    { label: 'Net Return', value: `${summary && summary.capitalDeployed > 0 ? (summary.netProfit / summary.capitalDeployed * 100).toFixed(1) : 0}%`, subtext: 'Monthly Net Profit ÷ Capital Deployed', icon: 'pie_chart' },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-tertiary mb-6">Profitability Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-3 ${card.color || 'text-primary'}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">{card.label}</p>
            <h4 className={`text-xl font-black ${card.color || 'text-tertiary'}`}>{card.value}</h4>
            <p className="text-[9px] text-on-surface-variant mt-2 leading-tight">{card.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Section 6: Charts
const Charts = ({ chartData, loanTypeProfit }: { 
  chartData: AnalyticsData['chartData'], 
  loanTypeProfit: AnalyticsData['loanTypeProfit'] 
}) => {
  const COLORS = ['#1a3d2b', '#2d8a4e', '#4ade80', '#86efac', '#bbf7d0'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-white/5 h-80">
        <h3 className="font-bold text-tertiary mb-6">Monthly Income vs Expense</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
            <Tooltip />
            <Legend verticalAlign="top" align="right" />
            <Bar dataKey="income" fill="#2d8a4e" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Net Profit" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-white/5 h-80">
        <h3 className="font-bold text-tertiary mb-6">Income by Loan Type</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={loanTypeProfit} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name}) => name}>
              {loanTypeProfit.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function ExpenseTracker() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsApi.getExpenseTracker();
      setData(res.data);
    } catch {
      toast.error('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-on-surface-variant font-bold">Initializing ledger analytics...</div>;
  }

  if (!data) return null;

  return (
    <div className="pb-10">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-2">Expense Tracker</h2>
          <p className="text-on-surface-variant max-w-2xl">Monitor capital flow, track operational expenses, and analyze organizational profitability.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAnalytics} className="bg-surface-container-high text-tertiary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh Data
          </button>
        </div>
      </header>

      <SummaryCards summary={data.summary} />
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <IncomeTable />
        <ExpenseTable />
      </div>
      
      <Profitability summary={data.summary} />
      <Charts chartData={data.chartData} loanTypeProfit={data.loanTypeProfit} />
    </div>
  );
}