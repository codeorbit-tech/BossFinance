'use client';

import { useState, useEffect } from 'react';
import { settingsApi, usersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
  state: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);
  
  // Holiday Manager State
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [countSaturdays, setCountSaturdays] = useState(false);
  const [taxRate, setTaxRate] = useState('20');
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);

  // Staff Management State
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'EMPLOYEE',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const [holidaysRes, settingsRes] = await Promise.all([
        settingsApi.listHolidays(),
        settingsApi.getSettings()
      ]);
      setHolidays(holidaysRes.data);
      if (settingsRes.data.taxRate) setTaxRate(settingsRes.data.taxRate);
      if (settingsRes.data.countSaturdays) setCountSaturdays(settingsRes.data.countSaturdays === 'true');
    } catch {
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoadingHolidays(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await usersApi.list();
      setUsers(res.data);
    } catch {
      toast.error('Failed to fetch team members');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await usersApi.create(newUser);
      toast.success('User created successfully');
      setIsAddUserModalOpen(false);
      setNewUser({ username: '', password: '', name: '', role: 'EMPLOYEE', email: '', phone: '' });
      fetchUsers();
    } catch {
      toast.error('Failed to create user. Username might be taken.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleAddHoliday = async () => {
    const name = prompt('Enter holiday name:');
    const date = prompt('Enter holiday date (YYYY-MM-DD):');
    if (!name || !date) return;

    try {
      await settingsApi.addHoliday({ name, date, type: 'STATE', state: 'Tamil Nadu' });
      toast.success('Holiday added');
      fetchData();
    } catch {
      toast.error('Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Delete this holiday?')) return;
    try {
      await settingsApi.deleteHoliday(id);
      toast.success('Holiday deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete holiday');
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await settingsApi.updateSetting(key, value);
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
    }
  };

  return (
    <div className="pb-12">
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

        {/* Team Management */}
        <section className="bg-surface-container-lowest p-8 rounded-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-tertiary mb-1">Team Management</h3>
              <p className="text-sm text-on-surface-variant">Manage employee access and administrative privileges.</p>
            </div>
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="bg-accent text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Add Team Member
            </button>
          </div>

          <div className="overflow-hidden border border-surface-container-high rounded-xl">
            {isLoadingUsers ? (
              <div className="p-8 text-center text-on-surface-variant">Loading team...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name & Username</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-tertiary">{u.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">@{u.username}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-tertiary">{u.phone || 'No phone'}</p>
                        <p className="text-[10px] text-on-surface-variant">{u.email || 'No email'}</p>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteUser(u.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Holiday Manager & Working Days */}
        <section className="bg-surface-container-lowest p-8 rounded-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-tertiary mb-1">Holiday & Working Days Manager</h3>
              <p className="text-sm text-on-surface-variant">Configure calendar rules for penal interest exemptions.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-xl">
                <p className="text-xs font-bold text-tertiary">Count Saturdays as working?</p>
                <label className="toggle-switch scale-75">
                  <input type="checkbox" checked={countSaturdays} onChange={() => {
                    const newVal = !countSaturdays;
                    setCountSaturdays(newVal);
                    updateSetting('countSaturdays', newVal.toString());
                  }} />
                  <div className="toggle-track" />
                </label>
              </div>
              <button onClick={handleAddHoliday} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Holiday
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden border border-surface-container-high rounded-xl">
            {isLoadingHolidays ? (
              <div className="p-8 text-center text-on-surface-variant">Loading holidays...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Holiday Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">State Coverage</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {holidays.map((h, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-tertiary">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{h.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.type === 'National' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{h.state}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleDeleteHoliday(h.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>System Rule:</strong> If a daily loan payment due date falls on a Sunday or any listed holiday, the system will automatically shift the due date to the next working day. Penal interest will not be applied for this gap.
            </p>
          </div>
        </section>

        {/* Broadcasting Rules & Tax Config */}
        <section className="bg-surface-container-lowest p-8 rounded-xl">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-tertiary mb-1">Financial & Broadcasting Rules</h3>
            <p className="text-sm text-on-surface-variant">Configure system-wide constants and communication rules.</p>
          </div>
          
          <div className="mb-6 p-4 bg-surface rounded-xl border border-surface-container-high">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Estimated Tax Rate (%)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                onBlur={() => updateSetting('taxRate', taxRate)}
                className="w-24 bg-white border border-surface-container-highest rounded-lg px-3 py-2 text-sm font-bold text-tertiary outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-on-surface-variant">Used for Net Profit calculations in Expense Tracker.</p>
            </div>
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

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-accent text-white">
              <h3 className="font-bold text-lg">Add Team Member</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="hover:bg-white/10 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username *</label>
                  <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                  <input type="text" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <button onClick={handleAddUser} className="w-full bg-accent text-white py-3 rounded-xl font-bold mt-2 hover:opacity-90 shadow-lg shadow-accent/20">
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
