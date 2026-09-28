'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import {
  User,
  ShoppingBag,
  Clock,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const res = await fetch(`/api/orders?customerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (user) {
      loadOrders();
    } else if (!authLoading) {
      setLoadingOrders(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading account details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-white">Sign In to View Orders</h1>
        <p className="text-xs text-slate-400">
          Log in with your email or phone number to view your past drink orders, delivery status, and profile information.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="bg-[#d4af37] text-slate-950 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#c5a028] transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-slate-700 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa820a] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-[#d4af37]/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
              <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] font-bold px-2 py-0.5 rounded-full uppercase">
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> {user.phone}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/60 px-3.5 py-2 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
            Order History
          </h2>
          <span className="text-xs text-slate-400">{orders.length} orders placed</span>
        </div>

        {loadingOrders ? (
          <div className="p-8 text-center text-slate-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Orders Yet</h3>
            <p className="text-xs text-slate-400">You haven’t placed any orders with Diamond Jay Enterprise yet.</p>
            <Link
              href="/catalog"
              className="inline-block mt-2 bg-[#d4af37] text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs"
            >
              Browse Drinks Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-[#0d1527] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-sm font-black text-white">{o.orderNumber}</span>
                    <span className="text-xs text-slate-400 block">
                      Placed on {new Date(o.createdAt).toLocaleDateString()} at{' '}
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        o.orderStatus === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : o.orderStatus === 'cancelled'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                      }`}
                    >
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {o.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-200">
                        {item.quantity}x {item.productName} ({item.volume})
                      </span>
                      <span className="text-slate-400">GHS {item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    {o.fulfillmentType === 'pickup' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <MapPin className="w-3.5 h-3.5" /> Pickup at 410 New Road
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-400 font-semibold">
                        <Truck className="w-3.5 h-3.5" /> Delivery to {o.deliveryDetails?.zone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white">
                      Total: <span className="text-[#d4af37]">GHS {o.totalAmount.toFixed(2)}</span>
                    </span>

                    <Link
                      href={`/order-confirmation/${o.id}`}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      Track Order <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
