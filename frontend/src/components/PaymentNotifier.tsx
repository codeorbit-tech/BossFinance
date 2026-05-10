'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useStoredUser } from '@/lib/authState';

export default function PaymentNotifier() {
  const user = useStoredUser();
  const lastCheck = useRef<string>(new Date().toISOString());

  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/repayments/recent?after=${lastCheck.current}`);
        const newPayments = res.data;
        
        if (newPayments && newPayments.length > 0) {
          // Update lastCheck to the latest payment's createdAt or now
          lastCheck.current = new Date().toISOString(); 
          
          newPayments.forEach((p: any) => {
            // Ignore upfront interest internal payments
            if (p.paymentType === 'UPFRONT_INTEREST') return;

            const method = p.method === 'SYSTEM' ? 'System' : p.method === 'RAZORPAY' ? 'Autopay' : 'Manual';
            
            toast.custom((t) => (
              <div 
                className={`${
                  t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out slide-out-to-top-2'
                } max-w-sm w-full bg-surface-container-high border border-outline-variant/30 shadow-2xl rounded-xl pointer-events-auto flex flex-col overflow-hidden ring-1 ring-black/5`}
              >
                <div className="flex items-start p-4 gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        payments
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {p.loan?.customer?.name ? `${p.loan.customer.name}'s Payment` : 'Payment Received'}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Amount: <span className="font-bold text-emerald-400">₹{p.amount.toLocaleString()}</span> via {method}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="rounded-lg p-1 hover:bg-surface-container-highest transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
                    </button>
                  </div>
                </div>
                {/* 3-second progress bar */}
                <div className="h-1 w-full bg-surface-container-highest">
                  <div 
                    className="h-full bg-emerald-500"
                    style={{ 
                      animation: 'shrink-x 3s linear forwards',
                      transformOrigin: 'left'
                    }}
                  />
                </div>
              </div>
            ), { duration: 3000, id: `payment-${p.id}` }); // Prevent duplicate toasts for same payment
          });
        }
      } catch (err) {
        // Silently fail on polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes shrink-x {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }
    `}} />
  );
}
