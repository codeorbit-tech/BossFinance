'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface User {
  name: string;
  role: string;
}

export default function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const showSearch = pathname.startsWith('/admin/customers');

  return (
    <header className="h-16 flex justify-between items-center sticky top-0 z-40 bg-surface px-8 w-full font-[var(--font-body)] text-sm border-b border-outline-variant/10">
      {/* Search */}
      <div className="flex items-center gap-4 w-1/3">
        {showSearch && (
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by customer ID or name..."
              className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-on-surface focus:ring-2 focus:ring-accent transition-all outline-none"
            />
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button className="text-slate-500 hover:text-accent transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-500 hover:text-accent transition-colors">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-primary">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Super Admin' : 'Employee'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
