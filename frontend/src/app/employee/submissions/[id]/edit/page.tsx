'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loansApi, customersApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditQueriedSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loan, setLoan] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    aadhaar: '',
    pan: '',
    amount: '',
    purpose: '',
  });

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const res = await loansApi.get(loanId);
        const l = res.data.loan;
        setLoan(l);
        setFormData({
          name: l.customer.name || '',
          phone: l.customer.phone || '',
          email: l.customer.email || '',
          address: l.customer.address || '',
          aadhaar: l.customer.aadhaar || '',
          pan: l.customer.pan || '',
          amount: l.amount ? l.amount.toString() : '',
          purpose: l.purpose || '',
        });
      } catch (err) {
        toast.error('Failed to fetch loan details');
        router.push('/employee/submissions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoan();
  }, [loanId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Resubmitting application...');

    try {
      // 1. Update Customer Details
      await customersApi.update(loan.customer.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        aadhaar: formData.aadhaar,
        pan: formData.pan,
      });

      // 2. Resubmit Loan Application
      await loansApi.resubmit(loanId, {
        amount: formData.amount,
        purpose: formData.purpose,
      });

      toast.success('Application fixed and resubmitted!', { id: toastId });
      router.push('/employee/submissions');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Error resubmitting';
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center animate-pulse">Loading loan details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/employee/submissions')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Submissions
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">
          Fix Application Details
        </h2>
        <p className="text-sm text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-warning text-base">info</span>
          Please correct the details requested by the admin and resubmit.
        </p>
      </div>

      {loan && loan.queryDescription && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 mt-0.5">feedback</span>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">Admin Query Details</h4>
            <p className="text-sm text-blue-800 italic">{loan.queryDescription}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
        
        <h3 className="text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/10 pb-2">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Aadhaar</label>
            <input
              type="text"
              value={formData.aadhaar}
              onChange={e => setFormData({ ...formData, aadhaar: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">PAN</label>
            <input
              type="text"
              value={formData.pan}
              onChange={e => setFormData({ ...formData, pan: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-24 bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all resize-none"
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/10 pb-2">Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Loan Amount (₹)</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Purpose of Loan</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full bg-surface-container rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={() => router.push('/employee/submissions')}
            className="px-6 py-2.5 rounded-xl bg-surface-container font-bold text-sm hover:bg-surface-container-high transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
          >
            {isSubmitting ? 'Resubmitting...' : 'Fix & Resubmit'}
            {!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
