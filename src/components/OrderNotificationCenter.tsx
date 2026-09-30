'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, ClipboardList, X } from 'lucide-react';

type OrderNotification = {
  id: string;
  order_id: string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

export default function OrderNotificationCenter({ role }: { role: 'staff' | 'owner' }) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newOrderToast, setNewOrderToast] = useState<OrderNotification | null>(null);
  const hasLoaded = useRef(false);
  const seenIds = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const incoming: OrderNotification[] = data.notifications || [];
      if (hasLoaded.current) {
        const newest = incoming.find((notification) => !seenIds.current.has(notification.id));
        if (newest) setNewOrderToast(newest);
      }
      incoming.forEach((notification) => seenIds.current.add(notification.id));
      hasLoaded.current = true;
      setNotifications(incoming);
    } catch (error) {
      console.error('Failed to refresh order notifications:', error);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 12000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!newOrderToast) return;
    const timer = window.setTimeout(() => setNewOrderToast(null), 8000);
    return () => window.clearTimeout(timer);
  }, [newOrderToast]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read_at).length, [notifications]);

  const markRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) return;
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => notification.id === notificationId ? { ...notification, read_at: readAt } : notification)
      );
    } catch (error) {
      console.error('Failed to mark order notification read:', error);
    }
  };

  return (
    <div className="relative z-30">
      {newOrderToast && !isOpen && (
        <div role="status" className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-emerald-700 bg-[#0d1527] p-3 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black text-emerald-300">New order received</p>
              <p className="mt-1 text-[11px] text-slate-200">{newOrderToast.message}</p>
              <Link href={role === 'owner' ? '/owner/orders' : '/staff/orders'} onClick={() => setNewOrderToast(null)} className="mt-2 inline-block text-[11px] font-bold text-[#d4af37] hover:underline">
                Open order queue
              </Link>
            </div>
            <button type="button" onClick={() => setNewOrderToast(null)} aria-label="Dismiss new order alert" className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Order notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className={`relative inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${role === 'owner' ? 'border-amber-700/60 bg-amber-950/40 text-amber-200 hover:bg-amber-900/50' : 'border-blue-700/60 bg-blue-950/40 text-blue-200 hover:bg-blue-900/50'}`}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0d1527] bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1527] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-black text-white">Order notifications</h2>
              <p className="text-[11px] text-slate-400">New orders refresh automatically.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Bell className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                No order notifications yet.
              </div>
            ) : notifications.map((notification) => (
              <div key={notification.id} className={`border-b border-slate-800/80 p-3.5 ${notification.read_at ? 'opacity-70' : 'bg-slate-900/60'}`}>
                <div className="flex items-start gap-2.5">
                  <ClipboardList className={`mt-0.5 h-4 w-4 shrink-0 ${role === 'owner' ? 'text-amber-400' : 'text-blue-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white">{notification.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{notification.message}</p>
                    <p className="mt-1.5 text-[10px] text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Link href={role === 'owner' ? '/owner/orders' : '/staff/orders'} onClick={() => setIsOpen(false)} className="text-[11px] font-bold text-[#d4af37] hover:underline">
                        View orders
                      </Link>
                      {!notification.read_at && (
                        <button type="button" onClick={() => void markRead(notification.id)} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white">
                          <Check className="h-3 w-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
