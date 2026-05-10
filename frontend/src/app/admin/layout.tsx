'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useStoredUser } from '@/lib/authState';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useStoredUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/employee/dashboard');
    }
  }, [mounted, router, user]);

  if (!mounted) return null;
  if (user?.role !== 'ADMIN') return null;

  return <AppLayout>{children}</AppLayout>;
}
