'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold font-[var(--font-headline)] tracking-tight text-tertiary mb-2">Global Settings</h2>
        <p className="text-on-surface-variant max-w-2xl">Configure your administrative workspace, security protocols, and integration pipelines for Boss Finance & Consulting.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admin Profile */}
        <section className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-tertiary mb-1">Admin Profile</h3>
              <p className="text-sm text-on-surface-variant">Your personal identification within the ledger system.</p>
            </div>
            <button className="text-accent text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4">
              <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
            </button>
          </div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-xl bg-surface-container-high border-4 border-surface shadow-sm flex items-center justify-center text-2xl font-bold text-on-secondary-container">
              AV
            </div>
            <div>
              <p className="text-2xl font-bold text-tertiary leading-tight">Aditya Varma</p>
              <p className="text-on-surface-variant flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-base">verified_user</span>
                Master Administrator Account
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-low/50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">call</span>
                <span className="text-sm font-medium text-on-surface-variant">Phone Number</span>
              </div>
              <span className="text-tertiary font-bold">+91 88888 77777</span>
            </div>
            <div className="bg-surface-container-low/50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">mail</span>
                <span className="text-sm font-medium text-on-surface-variant">Email Address</span>
              </div>
              <span className="text-tertiary font-bold">aditya.varma@bossfinance.in</span>
            </div>
          </div>
        </section>

        {/* Security Protocols */}
        <section className="bg-surface-container-lowest p-8 rounded-xl">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-tertiary mb-1">Security Protocols</h3>
            <p className="text-sm text-on-surface-variant">Update your access credentials to maintain vault integrity.</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all outline-none"
              />
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-primary to-[#004d1d] text-white font-bold rounded-lg mt-4 flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-xl">key</span>
              Update Access Credentials
            </button>
          </div>
        </section>



        {/* Broadcasting Rules */}
        <section className="bg-surface-container-lowest p-8 rounded-xl">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-tertiary mb-1">Broadcasting Rules</h3>
            <p className="text-sm text-on-surface-variant">Control how the system communicates mission-critical alerts.</p>
          </div>
          <div className="space-y-6">
            {[
              { icon: 'alternate_email', label: 'Email Alerts', desc: 'Daily summaries and loan approvals.', value: emailAlerts, onChange: setEmailAlerts },
              { icon: 'notifications_active', label: 'Push Notifications', desc: 'Real-time admin dashboard activities.', value: pushNotifications, onChange: setPushNotifications },
              { icon: 'sms', label: 'SMS Updates', desc: 'Critical security breach alerts only.', value: smsUpdates, onChange: setSmsUpdates },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between p-4 bg-surface rounded-xl group hover:bg-accent/5 transition-colors ${!item.value ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary group-hover:bg-white transition-colors">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-tertiary">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={item.value} onChange={() => item.onChange(!item.value)} />
                  <div className="toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* System Status Footer */}
      <footer className="mt-12 flex items-center justify-between px-8 py-6 bg-tertiary rounded-xl text-white">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">Server Region</p>
            <p className="text-sm font-semibold">Mumbai (Asia-South-1)</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">Encryption</p>
            <p className="text-sm font-semibold">AES-256-GCM</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">System Uptime</p>
            <p className="text-sm font-semibold">99.98%</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">Boss Finance & Consulting Admin v2.4.1</p>
        </div>
      </footer>
    </div>
  );
}
