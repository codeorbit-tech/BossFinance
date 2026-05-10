'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { customersApi, loansApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AuditLog {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
  changedBy?: { name: string };
}

interface Repayment {
  id: string;
  amount: number;
  paidAt: string;
  status: string;
  method: string;
}

interface Loan {
  id: string;
  loanType: string;
  amount: number;
  emi: number;
  frequency: string;
  status: string;
  totalPaid: number;
  currentBalance: number;
  disbursedAt: string | null;
  approvedAt: string | null;
  collateralDetails: string | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  repayments: Repayment[];
  installments: {
    id: string;
    installmentNumber: number;
    dueDate: string;
    expectedAmount: number;
    amountPaid: number;
    penalInterest: number;
    penaltyPaid: number;
    totalRemaining: number;
    status: string;
  }[];
}

interface Customer {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  address: string;
  aadhaar: string;
  pan: string;
  status: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  loans: Loan[];
  auditLogs: AuditLog[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'payment-history' | 'audit-trail'>('payment-history');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreclosureModal, setShowPreclosureModal] = useState(false);
  const [preclosureQuote, setPreclosureQuote] = useState<{
    outstandingPrincipal: number;
    penalties: number;
    totalPayable: number;
  } | null>(null);
  const [preclosureForm, setPreclosureForm] = useState({
    method: 'CASH',
    reference: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCustomerData();

    // Polling every 60s for real-time status/balance updates
    const interval = setInterval(fetchCustomerData, 60000);
    return () => clearInterval(interval);
  }, [id]);

  const handleMarkNpa = async () => {
    if (!confirm('Are you sure you want to mark this customer as NPA? This will halt automated collections.')) return;
    try {
      await customersApi.markNpa(id);
      toast.success('Customer marked as NPA');
      fetchCustomerData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const fetchCustomerData = async () => {
    try {
      const res = await customersApi.get(id);
      setCustomer(res.data.customer);
    } catch {
      // Background refresh fail is silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPreclosure = async () => {
    if (!activeLoan) return;
    try {
      const res = await loansApi.getPreclosureQuote(activeLoan.id);
      setPreclosureQuote(res.data.quote);
      setShowPreclosureModal(true);
    } catch {
      toast.error('Failed to fetch preclosure quote');
    }
  };

  const handleExecutePreclosure = async () => {
    if (!activeLoan || !preclosureQuote) return;
    if (!confirm(`Are you absolutely sure you want to CLOSE this loan for ₹${preclosureQuote.totalPayable.toLocaleString()}? This action is irreversible.`)) return;

    setIsProcessing(true);
    try {
      await loansApi.precloseLoan(activeLoan.id, {
        amount: preclosureQuote.totalPayable,
        method: preclosureForm.method,
        reference: preclosureForm.reference
      });
      toast.success('Loan pre-closed successfully');
      setShowPreclosureModal(false);
      fetchCustomerData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to pre-close loan');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-on-surface-variant font-bold animate-pulse">Loading profile...</div>;
  if (!customer) return <div className="p-12 text-center text-on-surface-variant font-bold">Customer not found.</div>;

  const activeLoan = customer.loans[0];

  const calculateDebt = () => {
    if (!activeLoan) return { unpaid: 0, penalty: 0 };
    const unpaid = activeLoan.installments
      .filter(i => i.status !== 'PAID')
      .reduce((sum, i) => sum + i.totalRemaining, 0);
    const penalty = activeLoan.installments
      .filter(i => i.status !== 'PAID')
      .reduce((sum, i) => sum + Math.max(0, (i.penalInterest || 0) - (i.penaltyPaid || 0)), 0);
    return { unpaid, penalty };
  };

  const debt = calculateDebt();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold font-[var(--font-headline)] text-tertiary">{customer.name}</h2>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-on-surface-variant font-mono">ID: {customer.customerId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            disabled // Placeholder for now, but lock removed
            className="px-4 py-2 bg-surface-container-high text-tertiary font-bold text-sm rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Details
          </button>
          <button 
            onClick={handleMarkNpa}
            disabled={customer.status === 'NPA'}
            className="px-4 py-2 bg-error/10 text-error font-bold text-sm rounded-lg hover:bg-error/20 transition-colors disabled:opacity-50"
          >
            Mark NPA
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-surface-container-low p-1.5 rounded-xl w-fit">
        {[
          { id: 'payment-history' as const, label: 'Payment History', icon: 'payments' },
          { id: 'profile' as const, label: 'Customer Profile', icon: 'person' },
          { id: 'audit-trail' as const, label: 'Audit Trail', icon: 'history' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'payment-history' && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 font-mono text-sm overflow-x-auto shadow-sm">
            {activeLoan ? (
              <>
                <div className="text-tertiary mb-6 pb-6 border-b border-dashed border-outline-variant/50">
                  <div className="flex justify-between items-center mb-2 font-bold text-base">
                    <span>Customer: {customer.name} | ID: {customer.customerId}</span>
                    <button className="text-xs text-accent underline decoration-accent/30 font-sans">Download Ledger</button>
                  </div>
                  <div className="text-on-surface-variant">
                    Loan Amount: ₹{activeLoan.amount.toLocaleString()} | EMI: ₹{activeLoan.emi.toLocaleString()}/{activeLoan.frequency.toLowerCase()}
                  </div>
                </div>

                <div className="mb-4 text-tertiary font-bold tracking-widest uppercase">Payment History</div>
                
                <table className="w-full text-left mb-6 whitespace-nowrap">
                  <thead>
                    <tr className="border-y-2 border-outline-variant/20 text-on-surface-variant">
                      <th className="py-2.5 font-bold">Date</th>
                      <th className="py-2.5 font-bold">Amount</th>
                      <th className="py-2.5 font-bold">Method</th>
                      <th className="py-2.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {activeLoan.repayments.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No repayment records found.</td></tr>
                    ) : (
                      activeLoan.repayments.map((p) => (
                        <tr key={p.id} className="text-tertiary">
                          <td className="py-3">{new Date(p.paidAt).toLocaleDateString()}</td>
                          <td className="py-3 font-medium text-on-primary-container">₹{p.amount.toLocaleString()}</td>
                          <td className="py-3">{p.method}</td>
                          <td className="py-3 text-right">
                            <span className={`font-bold ${p.status === 'SUCCESS' ? 'text-accent' : 'text-on-surface-variant'}`}>{p.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                <div className="border-t-2 border-outline-variant/20 pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-tertiary">
                    <span>Total Principal Paid: ₹{activeLoan.totalPaid.toLocaleString()}</span>
                    <span>Remaining Principal: ₹{(activeLoan.amount - activeLoan.totalPaid).toLocaleString()}</span>
                  </div>
                  {(debt.unpaid > 0 || debt.penalty > 0) && (
                    <div className="pt-2 border-t border-dashed border-outline-variant/30 flex justify-between font-bold text-error">
                      <span>Total Unpaid EMIs: ₹{debt.unpaid.toLocaleString()}</span>
                      <span>Accumulated Penalty: ₹{debt.penalty.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-on-surface-variant font-bold">No active loans for this customer.</div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
             {activeLoan && activeLoan.status === 'ACTIVE' && (
               <button 
                 onClick={handleOpenPreclosure}
                 className="px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 font-bold rounded-lg flex items-center gap-2 hover:bg-red-600/20 transition-colors"
               >
                 <span className="material-symbols-outlined">running_with_errors</span>
                 Pre-close Loan
               </button>
             )}
             <button className="px-6 py-3 bg-gradient-to-r from-accent to-on-primary-container text-white font-bold rounded-lg flex items-center gap-2 hover:opacity-90 shadow-lg shadow-accent/20">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Record Extraneous Payment
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Personal Identity</h3>
            <div className="space-y-4">
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Phone Number</span><span className="font-bold text-sm text-tertiary">{customer.phone || '—'}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Address</span><span className="font-bold text-sm text-tertiary">{customer.address || '—'}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Aadhaar (Masked)</span><span className="font-bold text-base tracking-widest text-tertiary">XXXX XXXX {customer.aadhaar?.slice(-4) || '—'}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">PAN Number</span><span className="font-bold text-sm text-tertiary tracking-wider">{customer.pan || '—'}</span></div>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Financial Profile</h3>
            <div className="space-y-4">
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Bank Information</span><span className="font-bold text-sm text-tertiary">{customer.bankName || '—'} - A/c: {customer.bankAccount || '—'}</span><span className="text-xs text-on-surface-variant mt-0.5">IFSC: {customer.bankIfsc || '—'}</span></div>
              
              {customer.status === 'NPA' || debt.unpaid > 0 ? (
                <div className="p-3 bg-error/5 border border-error/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-error font-bold uppercase">NPA Amount</span>
                    <span className="text-error font-extrabold text-sm font-mono">₹{debt.unpaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-error font-bold uppercase">Accrued Penalty</span>
                    <span className="text-error font-extrabold text-sm font-mono">₹{debt.penalty.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-sm">verified</span>
                  <span className="text-xs text-accent font-bold">Account in Good Standing</span>
                </div>
              )}

              <div className="flex flex-col mt-4"><span className="text-xs text-on-surface-variant mb-0.5">Collateral Locked</span><span className="font-bold text-sm text-tertiary bg-warning/5 p-2 rounded-md">{activeLoan?.collateralDetails || 'None'}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Guarantor</span><span className="font-bold text-sm text-tertiary">{activeLoan?.guarantorName ? `${activeLoan.guarantorName} (${activeLoan.guarantorPhone})` : '—'}</span></div>
            </div>
          </div>

          {activeLoan && (
            <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 mt-2">
              <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Primary Loan Snapshot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Loan Type</span><span className="font-bold text-sm text-tertiary capitalize">{activeLoan.loanType.toLowerCase()}</span></div>
                 <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Frequency</span><span className="font-bold text-sm text-tertiary capitalize">{activeLoan.frequency.toLowerCase()}</span></div>
                 <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Approved On</span><span className="font-bold text-sm text-tertiary">{activeLoan.approvedAt ? new Date(activeLoan.approvedAt).toLocaleDateString() : '—'}</span></div>
                 <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Disbursed On</span><span className="font-bold text-sm text-tertiary">{activeLoan.disbursedAt ? new Date(activeLoan.disbursedAt).toLocaleDateString() : '—'}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit-trail' && (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60">Date & Time</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60">Changed By</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60">Field</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60">Old Value</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60">New Value</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant/10">
               {customer.auditLogs.length === 0 ? (
                 <tr><td colSpan={5} className="py-12 text-center text-on-surface-variant font-bold">No audit logs found.</td></tr>
               ) : (
                 customer.auditLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium text-tertiary">{log.changedBy?.name || 'Admin'}</td>
                      <td className="px-6 py-4">{log.field}</td>
                      <td className="px-6 py-4 text-error font-medium line-through">{log.oldValue}</td>
                      <td className="px-6 py-4 text-accent font-bold">{log.newValue}</td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      )}

      {/* Preclosure Modal */}
      {showPreclosureModal && preclosureQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowPreclosureModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-tertiary">
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="text-center mb-6">
               <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-2xl">lock_open</span>
               </div>
               <h3 className="text-xl font-bold font-[var(--font-headline)] text-tertiary">Loan Pre-closure</h3>
               <p className="text-sm text-on-surface-variant mt-2">Settle the full loan balance now to close the application.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-5 mb-6 space-y-3 font-mono">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Outstanding Principal:</span>
                <span className="font-bold text-tertiary">₹{preclosureQuote.outstandingPrincipal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Unpaid Penalties:</span>
                <span className="font-bold text-tertiary text-error">₹{preclosureQuote.penalties.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-outline-variant flex justify-between font-bold text-base">
                <span className="text-tertiary">Total Payable:</span>
                <span className="text-accent underline decoration-accent/30">₹{preclosureQuote.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-tertiary uppercase mb-1.5 block">Payment Method</label>
                <select 
                  value={preclosureForm.method}
                  onChange={(e) => setPreclosureForm({...preclosureForm, method: e.target.value})}
                  className="w-full h-11 bg-surface-container-high rounded-lg px-4 text-sm font-bold text-tertiary focus:ring-2 focus:ring-accent outline-none border-none"
                >
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-tertiary uppercase mb-1.5 block">Reference (Optional)</label>
                <input 
                  type="text"
                  placeholder="Txn ID / Receipt No"
                  value={preclosureForm.reference}
                  onChange={(e) => setPreclosureForm({...preclosureForm, reference: e.target.value})}
                  className="w-full h-11 bg-surface-container-high rounded-lg px-4 text-sm font-bold text-tertiary placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-accent outline-none border-none" 
                />
              </div>
            </div>

            <button 
              onClick={handleExecutePreclosure}
              disabled={isProcessing}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">done_all</span>
                  Confirm Pre-closure
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal (Lock Removed per user request) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-8 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-tertiary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-center mb-6">
               <h3 className="text-xl font-bold font-[var(--font-headline)] text-tertiary">Edit Profile</h3>
               <p className="text-sm text-on-surface-variant mt-2">Update customer information directly.</p>
            </div>
            {/* Form fields would go here, currently just removing the OTP gate */}
            <button onClick={() => setShowEditModal(false)} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-[#00401d] transition-colors shadow-lg">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
