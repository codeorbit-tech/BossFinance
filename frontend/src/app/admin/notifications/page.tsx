'use client';

import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { notificationsApi, customersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

const TEMPLATES: Record<string, string> = {
  'EMI Reminder': 'Dear {name}, your EMI of ₹{emi} for loan {loanId} is due on {dueDate}. Please ensure timely payment to avoid penalties. — Boss Finance & Consulting',
  'Overdue Alert': 'Dear {name}, your EMI payment for loan {loanId} is OVERDUE. Please clear the dues immediately to avoid penal interest. Contact us: Boss Finance & Consulting.',
  'Loan Approved': 'Dear {name}, congratulations! Your loan application {loanId} has been approved. Our team will contact you shortly for disbursement. — Boss Finance.',
  'Payment Received': 'Dear {name}, we have received your payment of ₹{amount} for loan {loanId}. Thank you for your timely payment. — Boss Finance & Consulting.',
  'Custom': '',
};

interface Notification {
  id: string;
  customerId: string;
  customer: { customerId: string; name: string };
  channel: string;
  template: string;
  message: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  customerId: string;
  name: string;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<'send' | 'history'>('send');

  // ─── Send Tab State ───────────────────────────────────────────────────────
  const [template, setTemplate] = useState('EMI Reminder');
  const [channel, setChannel] = useState('SMS');
  const [message, setMessage] = useState(TEMPLATES['EMI Reminder']);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [sending, setSending] = useState(false);

  // ─── History Tab State ────────────────────────────────────────────────────
  const [history, setHistory] = useState<Notification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // ─── Customer Search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!customerSearch.trim()) { setCustomerResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await customersApi.list({ search: customerSearch, limit: '8' });
        setCustomerResults(res.data.customers ?? []);
      } catch { setCustomerResults([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const toggleCustomer = (c: Customer) => {
    setSelectedCustomers(prev =>
      prev.find(x => x.id === c.id) ? prev.filter(x => x.id !== c.id) : [...prev, c]
    );
  };

  const handleTemplateChange = (t: string) => {
    setTemplate(t);
    if (t !== 'Custom') setMessage(TEMPLATES[t]);
  };

  // ─── Send ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (selectedCustomers.length === 0) { toast.error('Select at least one customer'); return; }
    if (!message.trim()) { toast.error('Message cannot be empty'); return; }
    setSending(true);
    try {
      const res = await notificationsApi.send({
        customerIds: selectedCustomers.map(c => c.id),
        channel,
        template,
        message,
      });
      toast.success(`Notification sent to ${res.data.count} customer(s)`);
      setSelectedCustomers([]);
      setCustomerSearch('');
      setCustomerResults([]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  // ─── History ──────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await notificationsApi.list({ page: historyPage.toString(), limit: '20' });
      setHistory(res.data.notifications ?? []);
      setHistoryTotal(res.data.total ?? 0);
      setHistoryTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load notification history');
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage]);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab, fetchHistory]);

  const formatTime = (d: string | null) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const CHANNEL_ICON: Record<string, string> = { SMS: 'sms', WHATSAPP: 'chat', BOTH: 'forum', EMAIL: 'mail' };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Notifications</h2>
        <p className="text-on-surface-variant text-sm">Send and manage customer communications. All history is stored in the database.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit mb-8">
        {(['send', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-base mr-2 align-middle">{t === 'send' ? 'send' : 'history'}</span>
            {t === 'send' ? 'Send' : `History ${historyTotal > 0 ? `(${historyTotal})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compose */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
            <h3 className="text-lg font-bold text-tertiary mb-6">Compose Message</h3>
            <div className="space-y-5">

              {/* Customer Search */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Search & Select Customers</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Type customer name or ID..."
                    className="w-full bg-surface-container-high rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                  {customerResults.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden">
                      {customerResults.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { toggleCustomer(c); setCustomerSearch(''); setCustomerResults([]); }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container text-left text-sm border-b last:border-0 border-outline-variant/10"
                        >
                          <span>
                            <span className="font-bold text-tertiary">{c.name}</span>
                            <span className="text-[10px] text-on-surface-variant ml-2">{c.customerId}</span>
                          </span>
                          {selectedCustomers.find(x => x.id === c.id) && (
                            <span className="material-symbols-outlined text-accent text-base">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Chips */}
                {selectedCustomers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCustomers.map(c => (
                      <span key={c.id} className="flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-bold px-3 py-1.5 rounded-full">
                        {c.name}
                        <button onClick={() => toggleCustomer(c)} className="hover:text-error">×</button>
                      </span>
                    ))}
                    {selectedCustomers.length > 0 && (
                      <button onClick={() => setSelectedCustomers([])} className="text-[10px] text-on-surface-variant hover:text-error transition-colors ml-1">Clear all</button>
                    )}
                  </div>
                )}
              </div>

              {/* Channel */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Channel</label>
                <div className="flex gap-3">
                  {['SMS', 'WHATSAPP', 'BOTH'].map(ch => (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${channel === ch ? 'border-accent bg-accent/10 text-accent' : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface'}`}
                    >
                      <span className="material-symbols-outlined text-base">{CHANNEL_ICON[ch]}</span>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Template</label>
                <select
                  value={template}
                  onChange={e => handleTemplateChange(e.target.value)}
                  className="w-full bg-surface-container-high rounded-xl p-4 text-on-surface outline-none text-sm"
                >
                  {Object.keys(TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-container-high rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">{message.length} characters</p>
              </div>

              <button
                onClick={handleSend}
                disabled={sending || selectedCustomers.length === 0}
                className="w-full py-4 bg-gradient-to-r from-accent to-on-primary-container text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">{sending ? 'hourglass_empty' : 'send'}</span>
                {sending ? 'Sending...' : `Send to ${selectedCustomers.length > 0 ? `${selectedCustomers.length} Customer${selectedCustomers.length > 1 ? 's' : ''}` : 'Selected Customers'}`}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
            <h3 className="text-lg font-bold text-tertiary mb-6">Message Preview</h3>
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-accent">{CHANNEL_ICON[channel] || 'sms'}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{channel} Preview</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-tertiary leading-relaxed min-h-[100px]">
                {message || <span className="text-on-surface-variant/40 italic">Enter a message above...</span>}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-3">Sending to: <strong>{selectedCustomers.length === 0 ? 'No customers selected' : selectedCustomers.map(c => c.name).join(', ')}</strong></p>
            </div>

            {/* Quick Guide */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-bold text-amber-700 mb-2">Template Variables</p>
              <div className="grid grid-cols-2 gap-1">
                {['{name}', '{loanId}', '{emi}', '{dueDate}', '{amount}'].map(v => (
                  <span key={v} className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-amber-800 border border-amber-100">{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History */
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-tertiary">Notification History</h3>
              <p className="text-xs text-on-surface-variant">{historyTotal} notifications sent (from DB)</p>
            </div>
            <button onClick={fetchHistory} disabled={historyLoading} className="flex items-center gap-2 text-sm font-bold text-accent hover:underline px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>

          {historyLoading ? (
            <div className="p-12 text-center animate-pulse text-on-surface-variant font-bold">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">notifications_off</span>
              <p className="font-bold text-on-surface-variant">No notifications sent yet.</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Sent notifications will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <>
                {/* Mobile Notification Cards */}
                <div className="block sm:hidden divide-y divide-outline-variant/5">
                {history.map(n => (
                  <div key={n.id} className="p-4 space-y-3 hover:bg-surface/60 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-tertiary">{n.customer.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{n.customer.customerId}</p>
                      </div>
                      <StatusBadge status={n.status} />
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="material-symbols-outlined text-sm text-accent">{CHANNEL_ICON[n.channel] || 'sms'}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{n.template}</span>
                      </div>
                      <p className="text-xs text-tertiary leading-relaxed line-clamp-3">{n.message}</p>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-mono text-right">{formatTime(n.sentAt)}</p>
                  </div>
                ))}
              </div>

              {/* Desktop Notification Table */}
              <table className="hidden sm:table w-full text-left text-sm">
                <thead className="bg-surface-container/50 text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">Sent</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {history.map(n => (
                    <tr key={n.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-tertiary">{n.customer.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{n.customer.customerId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">{CHANNEL_ICON[n.channel] || 'sms'}</span>
                          {n.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{n.template}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant max-w-xs truncate">{n.message}</td>
                      <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{formatTime(n.sentAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={n.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            </div>
          )}

          {!historyLoading && historyTotalPages > 1 && (
            <div className="px-6 py-3 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">Page {historyPage} of {historyTotalPages}</p>
              <div className="flex gap-2">
                <button disabled={historyPage <= 1} onClick={() => setHistoryPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-xs font-bold disabled:opacity-40 hover:bg-surface-container">← Prev</button>
                <button disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-xs font-bold disabled:opacity-40 hover:bg-surface-container">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
