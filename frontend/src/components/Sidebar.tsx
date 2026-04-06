'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  email?: string;
}

const adminNav = [
  { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/customers', icon: 'group', label: 'Customers' },
  { href: '/admin/loan-applications', icon: 'description', label: 'Loan Applications' },
  { href: '/admin/repayments', icon: 'payments', label: 'Repayment Tracker' },
  { href: '/admin/notifications', icon: 'notifications', label: 'Notifications' },
  { href: '/admin/settings', icon: 'settings', label: 'Settings' },
];

const employeeNav = [
  { href: '/employee/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/employee/loan-form', icon: 'person_add', label: 'New Loan' },
  { href: '/employee/submissions', icon: 'list_alt', label: 'My Submissions' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const navItems = user?.role === 'ADMIN' ? adminNav : employeeNav;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={() => setCollapsed(true)}
      />

      <aside
        className={`h-screen fixed left-0 top-0 bg-primary flex flex-col py-6 z-50 transition-all duration-200 ease-in-out font-[var(--font-headline)] tracking-tight
          ${collapsed ? 'w-0 -translate-x-full lg:w-20 lg:translate-x-0' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className={`px-4 mb-8 ${collapsed ? 'lg:px-2' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}>
            <div className={`bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20 ${collapsed ? 'w-14 h-14' : 'w-12 h-12'}`}>
              <img src="/BossLogo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold text-white leading-tight">Boss Finance</h1>
                <p className="text-[10px] text-accent uppercase tracking-widest font-black">Consulting</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 transition-colors ${
                  isActive
                    ? 'text-accent font-bold border-l-4 border-accent pl-4 bg-secondary/10'
                    : 'text-slate-400 hover:text-white px-4 hover:bg-secondary/20'
                } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/10 mx-4 space-y-1">
          <div className={`flex items-center gap-3 text-slate-400 px-4 py-3 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <span className="material-symbols-outlined">account_circle</span>
            {!collapsed && <span className="text-sm font-medium truncate">{user?.name || 'Profile'}</span>}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 text-slate-400 hover:text-white px-4 py-3 transition-colors hover:bg-secondary/20 w-full ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <span className="material-symbols-outlined">logout</span>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-primary text-white p-2 rounded-lg"
      >
        <span className="material-symbols-outlined">{collapsed ? 'menu' : 'close'}</span>
      </button>
    </>
  );
}
