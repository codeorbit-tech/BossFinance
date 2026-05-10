'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';

export default function AutopaySetupPage({ params }: { params: { subId: string } }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid link. Session ID is missing.');
      setLoading(false);
      return;
    }

    const initializeCashfree = async () => {
      try {
        const cashfreeMode =
          process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox';
        const cashfree = await load({ mode: cashfreeMode });
        
        await cashfree.subscriptionsCheckout({
          subsSessionId: sessionId,
          redirectTarget: '_self'
        });
      } catch (err: any) {
        console.error('Cashfree SDK Error:', err);
        setError(err.message || 'Failed to securely load the payment gateway.');
        setLoading(false);
      }
    };

    // Slight delay to show loading animation
    setTimeout(() => {
      initializeCashfree();
    }, 1500);

  }, [sessionId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Link Expired or Invalid</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
      <div className="text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-600">lock</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Securing Connection...</h2>
          <p className="text-slate-500 mt-2 font-medium">Redirecting to Cashfree Payments gateway to setup your mandate.</p>
        </div>
        <div className="flex justify-center items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-8">
          <span className="material-symbols-outlined text-[14px]">verified_user</span>
          100% Secure & Encrypted
        </div>
      </div>
    </div>
  );
}
