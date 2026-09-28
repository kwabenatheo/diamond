'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Wine, Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    // Role-based automatic routing:
    // Fetch updated user status
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const { user } = await meRes.json();
        if (user?.role === 'owner') {
          router.push('/owner/analytics');
          return;
        }
        if (user?.role === 'staff') {
          router.push('/staff/orders');
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    router.push('/catalog');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa820a] text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-[#d4af37]/20">
          <Wine className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Sign In to Diamond Jay</h1>
        <p className="text-xs text-slate-400">
          Enter your registered email or phone number and password to access your account.
        </p>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Email Address or Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. customer@diamondjay.com or 0241000001"
              className="w-full bg-[#111a2e] border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#111a2e] border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-md shadow-[#d4af37]/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Store</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          New customer?{' '}
          <Link href="/register" className="text-[#d4af37] font-bold hover:underline">
            Register here
          </Link>
        </div>
      </form>

      {/* Pre-Created Testing Credentials Box */}
      <div className="bg-[#0b1222] border border-amber-500/30 p-4 rounded-2xl text-xs space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Pre-Created Test Accounts</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            Password: Password@123
          </span>
        </div>

        <div className="space-y-2">
          {/* Owner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-[11px]">Shop Owner</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded">FULL ACCESS</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">owner@diamondjay.com</div>
              <div className="text-[10px] text-slate-500">Contact: +233 248 565 916</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIdentifier('owner@diamondjay.com');
                setPassword('Password@123');
              }}
              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition"
            >
              Fill Credentials
            </button>
          </div>

          {/* Staff */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-[11px]">Staff Member</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded">OPERATIONS</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">staff@diamondjay.com</div>
              <div className="text-[10px] text-slate-500">Orders queue & inventory only</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIdentifier('staff@diamondjay.com');
                setPassword('Password@123');
              }}
              className="text-[10px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold px-2.5 py-1.5 rounded-lg border border-blue-500/30 transition"
            >
              Fill Credentials
            </button>
          </div>

          {/* Customer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-[11px]">Customer</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded">SHOPPER</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">customer@diamondjay.com</div>
              <div className="text-[10px] text-slate-500">Cart, Accra delivery & tracking</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIdentifier('customer@diamondjay.com');
                setPassword('Password@123');
              }}
              className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition"
            >
              Fill Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
