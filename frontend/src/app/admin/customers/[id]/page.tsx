'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

export default function CustomerDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'payment-history' | 'audit-trail'>('payment-history');
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Mock data matching the specific checklist exact text output
  const customer = {
    id: 'BFC-001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 00001',
    address: '12 MG Road, Mumbai',
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F',
    bank: { name: 'HDFC', account: '501002345', ifsc: 'HDFC0001' },
    status: 'ACTIVE',
    loans: [
      {
        loanType: 'PERSONAL',
        amount: 50000,
        interestRate: 0,
        tenure: 10,
        frequency: 'MONTHLY',
        disbursementDate: '05 Dec 2025',
        sanctionDate: '01 Dec 2025',
        emi: 5167,
        collateral: 'Gold chain 10g',
        guarantor: 'Vikram Mehta (+91 91234 56780)',
        totalPaid: 10334,
        outstanding: 39666,
      }
    ]
  };

  const paymentHistory = [
    { num: 1, date: '01 Jan 2026', amount: 5167, status: 'PAID', balance: 44833 },
    { num: 2, date: '01 Feb 2026', amount: 5167, status: 'PAID', balance: 39666 },
    { num: 3, date: '01 Mar 2026', amount: 5167, penal: 200, status: 'OVERDUE', balance: 34499 },
    { num: 4, date: '01 Apr 2026', amount: 5167, status: 'UPCOMING', balance: 29332 },
  ];

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
            <p className="text-sm text-on-surface-variant font-mono">ID: {customer.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowOtpModal(true)} className="px-4 py-2 bg-surface-container-high text-tertiary font-bold text-sm rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Details
          </button>
          <button className="px-4 py-2 bg-error/10 text-error font-bold text-sm rounded-lg hover:bg-error/20 transition-colors">
            Mark NPA
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-surface-container-low p-1.5 rounded-xl w-fit">
        {[
          { id: 'payment-history', label: 'Payment History', icon: 'payments' },
          { id: 'profile', label: 'Customer Profile', icon: 'person' },
          { id: 'audit-trail', label: 'Audit Trail', icon: 'history' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
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
            <div className="text-tertiary mb-6 pb-6 border-b border-dashed border-outline-variant/50">
              <div className="flex justify-between items-center mb-2 font-bold text-base">
                <span>Customer: {customer.name} | ID: {customer.id}</span>
                <button className="text-xs text-accent underline decoration-accent/30 font-sans">Download Ledger</button>
              </div>
              <div className="text-on-surface-variant">
                Loan Amount: ₹{customer.loans[0].amount.toLocaleString()} | EMI: ₹{customer.loans[0].emi.toLocaleString()}/{customer.loans[0].frequency.toLowerCase()}
              </div>
            </div>

            <div className="mb-4 text-tertiary font-bold tracking-widest uppercase">Payment History</div>
            
            <table className="w-full text-left mb-6 whitespace-nowrap">
              <thead>
                <tr className="border-y-2 border-outline-variant/20 text-on-surface-variant">
                  <th className="py-2.5 font-bold w-12">#</th>
                  <th className="py-2.5 font-bold">Date</th>
                  <th className="py-2.5 font-bold">Amount</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paymentHistory.map((p) => (
                  <tr key={p.num} className="text-tertiary">
                    <td className="py-3 align-top">{p.num}</td>
                    <td className="py-3 align-top">{p.date}</td>
                    <td className="py-3 align-top text-on-primary-container font-medium">
                      ₹{p.amount.toLocaleString()}
                      {p.penal && <div className="text-error text-xs mt-1">+₹{p.penal} Penal</div>}
                    </td>
                    <td className="py-3 align-top">
                      <span className={`font-bold ${
                        p.status === 'PAID' ? 'text-accent' :
                        p.status === 'OVERDUE' ? 'text-error' : 'text-on-surface-variant'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 align-top text-right font-medium">₹{p.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="border-t-2 border-outline-variant/20 pt-4 flex justify-between font-bold text-tertiary">
              <span>Total Paid: ₹{customer.loans[0].totalPaid.toLocaleString()}</span>
              <span>Outstanding: ₹{customer.loans[0].outstanding.toLocaleString()}</span>
            </div>
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
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Phone Number</span><span className="font-bold text-sm text-tertiary">{customer.phone}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Address</span><span className="font-bold text-sm text-tertiary">{customer.address}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Aadhaar (Masked)</span><span className="font-bold text-base tracking-widest text-tertiary">XXXX XXXX {customer.aadhaar.slice(-4)}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">PAN Number</span><span className="font-bold text-sm text-tertiary tracking-wider">{customer.pan}</span></div>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Financial Profile</h3>
            <div className="space-y-4">
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Bank Information</span><span className="font-bold text-sm text-tertiary">{customer.bank.name} - A/c: {customer.bank.account}</span><span className="text-xs text-on-surface-variant mt-0.5">IFSC: {customer.bank.ifsc}</span></div>
              <div className="flex flex-col mt-6"><span className="text-xs text-on-surface-variant mb-0.5">Collateral Locked</span><span className="font-bold text-sm text-tertiary bg-warning/10 p-2 rounded-md">{customer.loans[0].collateral}</span></div>
              <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Guarantor</span><span className="font-bold text-sm text-tertiary">{customer.loans[0].guarantor}</span></div>
            </div>
          </div>

          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 mt-2">
            <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Primary Loan Snapshot</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Loan Type</span><span className="font-bold text-sm text-tertiary capitalize">{customer.loans[0].loanType.toLowerCase()}</span></div>
               <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Frequency</span><span className="font-bold text-sm text-tertiary capitalize">{customer.loans[0].frequency.toLowerCase()}</span></div>
               <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Sanctioned</span><span className="font-bold text-sm text-tertiary">{customer.loans[0].sanctionDate}</span></div>
               <div className="flex flex-col"><span className="text-xs text-on-surface-variant mb-0.5">Disbursed</span><span className="font-bold text-sm text-tertiary">{customer.loans[0].disbursementDate}</span></div>
            </div>
          </div>
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
               <tr className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">2026-04-03 14:22:05</td>
                  <td className="px-6 py-4 font-medium text-tertiary">Aditya Varma</td>
                  <td className="px-6 py-4">status</td>
                  <td className="px-6 py-4 text-error font-medium line-through">OVERDUE</td>
                  <td className="px-6 py-4 text-accent font-bold">NPA</td>
               </tr>
               <tr className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">2026-03-10 09:12:30</td>
                  <td className="px-6 py-4 font-medium text-tertiary">Ramesh Kumar</td>
                  <td className="px-6 py-4">collateralDetails</td>
                  <td className="px-6 py-4 text-error font-medium line-through">None</td>
                  <td className="px-6 py-4 text-accent font-bold">Gold chain 10g</td>
               </tr>
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
            <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-[#00401d] transition-colors shadow-lg">Verify & Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}
