'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

const TEMPLATES = ['Loan Approved', 'EMI Reminder', 'Overdue Alert', 'Payment Received', 'Custom'];

const MOCK_HISTORY = [
  { id: '1', customer: 'Arjun Mehta (BF-2024-001)', channel: 'SMS', message: 'Your EMI of ₹12,450 for loan BF-2024-001 has been received.', time: '10 min ago', status: 'DELIVERED' },
  { id: '2', customer: 'Priya Sharma (BF-2023-842)', channel: 'WHATSAPP', message: 'Reminder: Your EMI of ₹28,200 is overdue since 05 Oct 2023.', time: '2 hours ago', status: 'DELIVERED' },
  { id: '3', customer: 'Vikram Singh (BF-2024-009)', channel: 'SMS', message: 'Your EMI of ₹18,900 is due on 28 Oct 2023.', time: '1 day ago', status: 'SENT' },
  { id: '4', customer: 'Anjali Reddy (BF-2023-910)', channel: 'BOTH', message: 'Urgent: Your daily loan payment is overdue.', time: '2 days ago', status: 'FAILED' },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<'send' | 'history'>('send');
  const [template, setTemplate] = useState('EMI Reminder');
  const [channel, setChannel] = useState('SMS');
  const [message, setMessage] = useState('Dear Customer, your EMI of ₹{amount} for loan {loanId} is due on {dueDate}. Please ensure timely payment to avoid penalties. — Boss Finance');

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Notifications</h2>
        <p className="text-on-surface-variant text-sm">Send and manage customer communications via SMS and WhatsApp.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setTab('send')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${tab === 'send' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/50'}`}
        >
          <span className="material-symbols-outlined text-base mr-2 align-middle">send</span>Send
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${tab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/50'}`}
        >
          <span className="material-symbols-outlined text-base mr-2 align-middle">history</span>History
        </button>
      </div>

      {tab === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send form */}
          <div className="bg-surface-container-lowest p-8 rounded-xl">
            <h3 className="text-lg font-bold text-tertiary mb-6">Compose Message</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Search Customer</label>
                <input
                  type="text"
                  placeholder="Search by customer ID or name..."
                  className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Channel</label>
                <div className="flex gap-3">
                  {['SMS', 'WhatsApp', 'Both'].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch.toUpperCase())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        channel === ch.toUpperCase() ? 'border-accent bg-accent/10 text-accent' : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface outline-none"
                >
                  {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Message Preview</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-accent to-on-primary-container text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20">
                <span className="material-symbols-outlined">send</span>
                Send Notification
              </button>
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-surface-container-lowest p-8 rounded-xl">
            <h3 className="text-lg font-bold text-tertiary mb-6">Message Preview</h3>
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-accent">smartphone</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{channel} Preview</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-tertiary leading-relaxed">
                {message}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History */
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Channel</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Message</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-tertiary/70">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {MOCK_HISTORY.map((n) => (
                  <tr key={n.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-5 font-bold text-tertiary">{n.customer}</td>
                    <td className="px-6 py-5 text-on-surface-variant">{n.channel}</td>
                    <td className="px-6 py-5 text-on-surface-variant max-w-xs truncate">{n.message}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant font-mono">{n.time}</td>
                    <td className="px-6 py-5"><StatusBadge status={n.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
