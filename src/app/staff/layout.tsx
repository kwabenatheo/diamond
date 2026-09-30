'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import OrderNotificationCenter from '@/components/OrderNotificationCenter';
import { Package, ClipboardList, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Verifying staff credentials...</div>;
  }

  // Guard: Must be Staff or Owner
  if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0d1527] border border-red-800 rounded-3xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Staff Access Restricted</h2>
        <p className="text-xs text-slate-400">
          This portal is reserved for Diamond Jay Enterprise staff and management. Please log in with staff credentials or use the role switcher above.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#d4af37] text-slate-950 px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Sign In as Staff
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Staff Top Nav */}
      <div className="bg-[#0d1527] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              Staff Operations Portal
              <span className="text-[10px] bg-blue-900/60 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-700">
                Staff Access
              </span>
            </h1>
            <p className="text-xs text-slate-400">Manage daily orders queue and live drink inventory</p>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <OrderNotificationCenter role="staff" />
          <Link
            href="/staff/orders"
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              pathname === '/staff/orders'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Orders Queue
          </Link>

          <Link
            href="/staff/inventory"
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              pathname === '/staff/inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            View Inventory
          </Link>

          <button
            type="button"
            onClick={logout}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Strict Role Policy Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Staff Policy: Inventory is view-only. Order cancellations, refunds, staff account management, and financial revenue reports are owner-restricted.
          </span>
        </div>
        {user.role === 'owner' && (
          <Link
            href="/owner/analytics"
            className="text-amber-400 hover:underline font-bold text-xs shrink-0 ml-2"
          >
            Switch to Owner Dashboard →
          </Link>
        )}
      </div>

      {children}
    </div>
  );
}
