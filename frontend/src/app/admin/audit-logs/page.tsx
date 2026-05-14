'use client';

import { useState, useEffect } from 'react';
import { auditApi } from '@/lib/api';
import Pagination from '@/components/Pagination';
import { toast } from 'react-hot-toast';

interface AuditLog {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
  customer?: { name: string; customerId: string };
  changedBy: { name: string; role: string };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ 
        page: page.toString(), 
        limit: '20',
        search 
      });
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">System Audit Trail</h2>
          <p className="text-on-surface-variant text-sm">Comprehensive history of all data modifications across the platform.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search by field or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 bg-surface-container border border-outline-variant/30 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none"
          />
          <button type="submit" className="h-11 px-6 bg-tertiary text-white font-bold rounded-xl hover:opacity-90 shadow-md">
            Search
          </button>
        </form>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-lg">
        <div className="overflow-x-auto">
          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-outline-variant/10">
            {loading ? (
              <div className="py-20 text-center animate-pulse font-bold text-on-surface-variant">Fetching audit data...</div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center font-bold text-on-surface-variant">No logs found matching your criteria.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 space-y-3 hover:bg-surface-container-low/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-tertiary">{log.changedBy?.name || 'System'}</span>
                      <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">{log.changedBy?.role || 'Service'}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-tertiary text-[10px] font-bold">{new Date(log.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] text-on-surface-variant">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-surface-container-high px-2 py-1 rounded border border-outline-variant/10 uppercase font-black text-[10px] text-tertiary">
                      {log.field}
                    </span>
                    {log.customer ? (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-tertiary">{log.customer.name}</span>
                        <span className="text-[9px] font-mono text-accent leading-none">{log.customer.customerId}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant/40 italic">Global/System</span>
                    )}
                  </div>

                  <div className="bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/5">
                    {log.oldValue && log.oldValue !== 'None' && log.oldValue !== 'undefined' && (
                      <div className="flex items-center gap-1.5 opacity-40 mb-1">
                        <span className="material-symbols-outlined text-xs">remove_circle</span>
                        <span className="line-through truncate text-[10px]">{log.oldValue}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-accent">
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      <span className="font-bold text-[11px] break-all">{log.newValue}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden lg:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60 tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60 tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60 tracking-widest">Event/Field</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60 tracking-widest">Entity</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-tertiary/60 tracking-widest">Change Detail</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse font-bold text-on-surface-variant">Fetching audit data...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-on-surface-variant">No logs found matching your criteria.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-tertiary text-xs font-bold">{new Date(log.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-on-surface-variant">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-tertiary">{log.changedBy?.name || 'System'}</span>
                        <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">{log.changedBy?.role || 'Service'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="bg-surface-container-high px-2 py-1 rounded border border-outline-variant/10 uppercase font-black text-tertiary">
                        {log.field}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.customer ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-tertiary">{log.customer.name}</span>
                          <span className="text-[10px] font-mono text-accent">{log.customer.customerId}</span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/40 italic">Global/System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        {log.oldValue && log.oldValue !== 'None' && log.oldValue !== 'undefined' && (
                          <div className="flex items-center gap-1.5 opacity-40">
                             <span className="material-symbols-outlined text-sm">remove_circle</span>
                             <span className="line-through truncate text-[11px]">{log.oldValue}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-accent">
                           <span className="material-symbols-outlined text-[14px]">add_circle</span>
                           <span className="font-bold text-[12px] truncate">{log.newValue}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/10">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
