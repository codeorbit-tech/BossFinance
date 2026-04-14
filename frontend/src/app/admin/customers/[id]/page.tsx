'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { customersApi } from '@/lib/api';
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
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const res = await customersApi.get(id);
        setCustomer(res.data.customer);
      } catch {
        toast.error('Failed to fetch customer details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleMarkNpa = async () => {
    if (!confirm('Are you sure you want to mark this customer as NPA? This will halt automated collections.')) return;
    try {
      await customersApi.markNpa(id);
      toast.success('Customer marked as NPA');
      // Re-fetch
      const res = await customersApi.get(id);
      setCustomer(res.data.customer);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div className="p-12 text-center text-on-surface-variant font-bold animate-pulse">Loading profile...</div>;
  if (!customer) return <div className="p-12 text-center text-on-surface-variant font-bold">Customer not found.</div>;

  const activeLoan = customer.loans[0];

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
          <button onClick={() => setShowOtpModal(true)} className="px-4 py-2 bg-surface-container-high text-tertiary font-bold text-sm rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2">
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
                
                <div className="border-t-2 border-outline-variant/20 pt-4 flex justify-between font-bold text-tertiary">
                  <span>Total Paid: ₹{activeLoan.totalPaid.toLocaleString()}</span>
                  <span>Outstanding: ₹{(activeLoan.amount - activeLoan.totalPaid).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-on-surface-variant font-bold">No active loans for this customer.</div>
            )}
          </div>
          
          <div className="flex justify-end">
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
              <div className="flex flex-col mt-6"><span className="text-xs text-on-surface-variant mb-0.5">Collateral Locked</span><span className="font-bold text-sm text-tertiary bg-warning/10 p-2 rounded-md">{activeLoan?.collateralDetails || 'None'}</span></div>
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

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-8 shadow-2xl relative">
            <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-tertiary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-center mb-6">
               <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-2xl">lock</span>
               </div>
               <h3 className="text-xl font-bold font-[var(--font-headline)] text-tertiary">Admin Approval Required</h3>
               <p className="text-sm text-on-surface-variant mt-2">Enter the OTP sent to Super Admin (+91 88888 77777) to edit core profile data.</p>
            </div>
            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4].map(i => (
                <input key={i} type="text" maxLength={1} className="w-12 h-14 bg-surface-container-high rounded-lg text-center text-xl font-bold text-tertiary focus:ring-2 focus:ring-accent outline-none border-none" />
              ))}
            </div>
            <button onClick={() => setShowOtpModal(false)} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-[#00401d] transition-colors shadow-lg">Verify & Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}
