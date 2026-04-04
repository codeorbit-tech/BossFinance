'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreateCustomerPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '',
    aadhaar: '', pan: '', dateOfBirth: '', occupation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and phone number are required.');
      return;
    }
    setLoading(true);
    // TODO: Connect to API
    setTimeout(() => {
      toast.success('Customer created successfully! ID: BF-2024-009');
      setForm({ name: '', phone: '', email: '', address: '', aadhaar: '', pan: '', dateOfBirth: '', occupation: '' });
      setLoading(false);
    }, 1000);
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: 'person', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', icon: 'call', required: true },
    { name: 'email', label: 'Email Address', type: 'email', icon: 'mail' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', icon: 'calendar_month' },
    { name: 'occupation', label: 'Occupation', type: 'text', icon: 'work' },
    { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', icon: 'badge' },
    { name: 'pan', label: 'PAN Number', type: 'text', icon: 'credit_card' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-1">Create Customer</h2>
        <p className="text-on-surface-variant text-sm">Register a new customer profile. A unique Customer ID will be auto-generated.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-8 rounded-xl max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {f.label} {f.required && <span className="text-error">*</span>}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">{f.icon}</span>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 px-8 py-3.5 bg-gradient-to-r from-accent to-on-primary-container text-white font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">{loading ? 'progress_activity' : 'person_add'}</span>
          {loading ? 'Creating...' : 'Create Customer'}
        </button>
      </form>
    </div>
  );
}
