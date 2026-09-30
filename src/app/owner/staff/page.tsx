'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import {
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function OwnerStaffPage() {
  const [staffList, setStaffList] = useState<Omit<User, 'passwordHash'>[]>([]);
  const [loading, setLoading] = useState(true);

  // Add staff modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Password reset modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (e) {
      console.error('Failed to load staff:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create staff account');
      }

      setAddModalOpen(false);
      setAddForm({ name: '', email: '', phone: '', password: '' });
      setMessage({ type: 'success', text: `Staff account created for ${data.staff.name}` });
      fetchStaff();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setMessage(null);

    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStaff.id, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetModalOpen(false);
      setNewPassword('');
      setMessage({ type: 'success', text: `Password successfully reset for ${selectedStaff.name}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return;

    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== id));
        setMessage({ type: 'success', text: `Staff member ${name} removed.` });
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-[#0d1527] border border-slate-800 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#d4af37]" />
            Staff Accounts & Access Controls
          </h2>
          <p className="text-xs text-slate-400">
            Grant day-to-day order processing permissions to shop employees. Inventory changes are owner-only.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
        >
          <UserPlus className="w-4 h-4" />
          Add New Staff Account
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : 'bg-red-950/70 border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading staff records...</div>
      ) : staffList.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Staff Accounts Created</h3>
          <p className="text-xs text-slate-400">Add team members to delegate inventory management and order fulfillment.</p>
        </div>
      ) : (
        <div className="bg-[#0d1527] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111a2e] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Role Assigned</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-900/60 transition">
                  <td className="p-4 font-bold text-white text-sm">
                    {st.name}
                  </td>
                  <td className="p-4 space-y-0.5">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> {st.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> {st.phone}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-950 text-blue-300 border border-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                      Staff
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(st.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedStaff(st);
                        setResetModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      title="Reset Staff Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(st.id, st.name)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition"
                      title="Remove Staff Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1527] border border-slate-700 rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create Staff Member Account</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="staff@diamondjay.com"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number (Ghana) *</label>
                <input
                  type="tel"
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-black shadow"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d1527] border border-slate-700 rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Reset Staff Password</h3>
              <button onClick={() => setResetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Set a new login password for <strong>{selectedStaff.name}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-slate-950 font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
