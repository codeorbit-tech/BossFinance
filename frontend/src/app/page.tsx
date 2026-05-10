'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0c1f45]">
      <div className="text-white font-sans text-lg animate-pulse">
        Loading Boss Finance...
      </div>
    </div>
  );
}
