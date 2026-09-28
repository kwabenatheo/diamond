'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Truck,
  MapPin,
  Flame,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/owner/analytics');
        if (res.ok) {
          const body = await res.json();
          setData(body.analytics);
        }
      } catch (e) {
        console.error('Error fetching analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Computing financial and revenue analytics...</div>;
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    averageOrderValue = 0,
    topProducts = [],
    deliveryCount = 0,
    pickupCount = 0,
    lowStockProducts = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Sales Revenue</span>
            <div className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            <span className="text-xs text-[#d4af37] mr-1">GHS</span>
            {totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Paid & Settled
          </span>
        </div>

        {/* Paid Orders */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Completed Orders</span>
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalOrders}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {deliveryCount} Delivery • {pickupCount} Pickup
          </span>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Average Order Value</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            <span className="text-xs text-emerald-400 mr-1">GHS</span>
            {averageOrderValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Per customer checkout</span>
        </div>

        {/* Stock Alerts */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Low Stock Items</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">{lowStockProducts.length}</div>
          <Link
            href="/staff/inventory"
            className="text-[11px] text-amber-400 hover:underline mt-1 block font-semibold"
          >
            Review inventory items →
          </Link>
        </div>
      </div>

      {/* 2-Column: Best Sellers & Fulfillment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Selling Products */}
        <div className="lg:col-span-2 bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Best-Selling Spirits & Beers
            </h3>
            <span className="text-xs text-slate-400">Ranked by gross revenue</span>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No sales data recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {topProducts.map((p: any, idx: number) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-[11px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block text-sm">{p.name}</span>
                      <span className="text-slate-400">{p.quantity} bottles/packs sold</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#d4af37] text-sm block">
                      GHS {p.revenue.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">Gross Sales</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fulfillment Breakdown */}
        <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
              Fulfillment Preferences
            </h3>

            <div className="space-y-3">
              <div className="bg-[#111a2e] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">Accra Delivery</span>
                    <span className="text-[11px] text-slate-400">Shipped to homes & offices</span>
                  </div>
                </div>
                <span className="text-lg font-black text-white">{deliveryCount}</span>
              </div>

              <div className="bg-[#111a2e] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">In-Store Pickup</span>
                    <span className="text-[11px] text-slate-400">Collected at 410 New Road</span>
                  </div>
                </div>
                <span className="text-lg font-black text-white">{pickupCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <a
              href="/api/owner/export"
              download
              className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Complete CSV Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
