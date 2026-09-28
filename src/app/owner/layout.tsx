'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  Users,
  Settings,
  ClipboardList,
  ShieldCheck,
  Package,
  FileSpreadsheet,
} from 'lucide-react';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Verifying executive authorization...</div>;
  }

  // Strict Guard: ONLY Owner
  if (!user || user.role !== 'owner') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0d1527] border border-red-800 rounded-3xl text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Owner Portal Restricted</h2>
        <p className="text-xs text-slate-400">
          Only the Shop Owner has authorization to access financial reports, sales revenue data, staff management, and store configurations.
        </p>
        <p className="text-xs text-slate-500">
          To test this screen, switch to the <strong>Shop Owner</strong> role using the top demo bar or sign in as <code>owner@diamondjay.com</code>.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#d4af37] text-slate-950 px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Sign In as Owner
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Owner Executive Header */}
      <div className="bg-[#0d1527] border border-amber-600/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#aa820a] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-[#d4af37]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Executive Owner Portal</h1>
              <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-800 uppercase">
                Proprietor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Diamond Jay Enterprise • 410 New Road, Accra, Ghana
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/owner/export"
            download
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Sales CSV
          </a>

          <button
            type="button"
            onClick={logout}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Owner Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <Link
          href="/owner/analytics"
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            pathname === '/owner/analytics'
              ? 'bg-[#d4af37] text-slate-950 font-black shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Sales & Financials
        </Link>

        <Link
          href="/owner/orders"
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            pathname === '/owner/orders'
              ? 'bg-[#d4af37] text-slate-950 font-black shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Orders & Refunds
        </Link>

        <Link
          href="/owner/staff"
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            pathname === '/owner/staff'
              ? 'bg-[#d4af37] text-slate-950 font-black shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Accounts
        </Link>

        <Link
          href="/staff/inventory"
          className="bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <Package className="w-4 h-4" />
          Live Inventory
        </Link>

        <Link
          href="/owner/settings"
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            pathname === '/owner/settings'
              ? 'bg-[#d4af37] text-slate-950 font-black shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Store Settings & Zones
        </Link>
      </div>

      {children}
    </div>
  );
}
