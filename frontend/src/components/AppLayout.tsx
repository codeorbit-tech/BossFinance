'use client';

import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f1f33',
            color: '#ffffff',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#57b171', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' } },
        }}
      />
      <Sidebar />
      <main className="ml-0 lg:ml-64 min-h-screen transition-all">
        <Suspense fallback={<div className="h-16 bg-surface border-b border-outline-variant/10 w-full" />}>
          <TopNav />
        </Suspense>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
