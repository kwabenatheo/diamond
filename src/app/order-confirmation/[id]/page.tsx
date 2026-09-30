'use client';

import React, { useEffect, useState, use } from 'react';
import { Order } from '@/lib/types';
import { buildWhatsAppOrderLink } from '@/lib/whatsapp';
import {
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error('Order not found');
        }
        const data = await res.json();
        setOrder(data.order);
        if (data.order?.paymentStatus === 'paid') clearCart();
      } catch (err: any) {
        setError(err.message || 'Error fetching order details');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, clearCart]);

  useEffect(() => {
    if (!order || order.paymentStatus !== 'paid' || typeof window === 'undefined') return;

    const ownerNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '0509735216';
    const whatsappUrl = buildWhatsAppOrderLink(order, ownerNumber);
    const timer = window.setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 600);

    return () => window.clearTimeout(timer);
  }, [order]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-400">
        <PackageCheck className="w-12 h-12 text-[#d4af37] animate-pulse mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Loading Order Details...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Order Record Not Found</h2>
        <p className="text-xs text-slate-400">We could not locate this order. Please verify your order ID or contact customer support.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#d4af37] text-slate-950 px-5 py-2.5 rounded-full text-xs font-bold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isPickup = order.fulfillmentType === 'pickup';

  // Status mapping
  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
    {
      key: isPickup ? 'ready_for_pickup' : 'out_for_delivery',
      label: isPickup ? 'Ready for Pickup' : 'Out for Delivery',
      icon: isPickup ? MapPin : Truck,
    },
    { key: 'completed', label: 'Order Completed', icon: PackageCheck },
  ];

  const getStepStatus = (stepKey: string) => {
    if (order.orderStatus === 'cancelled') return 'cancelled';

    const orderRank: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      out_for_delivery: 2,
      ready_for_pickup: 2,
      completed: 3,
    };

    const stepRank: Record<string, number> = {
      confirmed: 1,
      out_for_delivery: 2,
      ready_for_pickup: 2,
      completed: 3,
    };

    const currentRank = orderRank[order.orderStatus] || 0;
    const requiredRank = stepRank[stepKey] || 0;

    return currentRank >= requiredRank ? 'active' : 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Success banner */}
      <div className="bg-gradient-to-br from-[#0c1a2f] via-[#102342] to-[#080d1a] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
            Payment Verified & Recorded
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Thank you, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Your drinks order <strong className="text-[#d4af37]">{order.orderNumber}</strong> has been received by our store team and is being prepared.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <span className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            Payment: <strong className="text-emerald-400 capitalize">{order.paymentStatus}</strong>
          </span>
          {order.paystackReference && (
            <span className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono text-[11px]">
              Ref: {order.paystackReference}
            </span>
          )}
          <span className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            Method: <strong className="text-white uppercase">{order.paymentMethod?.replace('paystack_', '') || 'Paystack'}</strong>
          </span>
        </div>
      </div>

      {/* Real-time Order Status Tracker */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            Order Fulfillment Status
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37]">
            {order.orderStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Tracker Progress */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {steps.map((st, idx) => {
            const status = getStepStatus(st.key);
            const Icon = st.icon;
            const isCompleted = status === 'active';

            return (
              <div key={st.key} className="space-y-2">
                <div
                  className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center border-2 transition ${
                    isCompleted
                      ? 'bg-[#d4af37] border-[#d4af37] text-slate-950 shadow-md shadow-[#d4af37]/20'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold block ${
                    isCompleted ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fulfillment Instructions Box */}
        <div className="bg-[#111a2e] border border-slate-700/80 rounded-xl p-4 text-xs space-y-1.5">
          {isPickup ? (
            <div>
              <p className="font-bold text-[#d4af37] flex items-center gap-1.5 text-sm mb-1">
                <MapPin className="w-4 h-4" /> Pick Up at Diamond Jay Enterprise
              </p>
              <p className="text-slate-300">
                <strong>Address:</strong> 410 New Road, Accra, Ghana
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                Bring your Order Number (<strong>{order.orderNumber}</strong>) or phone number for quick counter pickup.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-bold text-[#d4af37] flex items-center gap-1.5 text-sm mb-1">
                <Truck className="w-4 h-4" /> Dispatching to Your Address
              </p>
              <p className="text-slate-300">
                <strong>Recipient:</strong> {order.deliveryDetails?.recipientName} ({order.deliveryDetails?.phone})
              </p>
              <p className="text-slate-300">
                <strong>Address:</strong> {order.deliveryDetails?.address} ({order.deliveryDetails?.zone})
              </p>
              {order.deliveryDetails?.deliveryNotes && (
                <p className="text-slate-400 text-[11px] italic mt-1">
                  Notes: "{order.deliveryDetails.deliveryNotes}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Items & Payment Summary */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Drinks Ordered
          </h3>
          <a
            href={buildWhatsAppOrderLink(order, process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '0509735216')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-[11px]"
          >
            Send to Owner on WhatsApp
          </a>
        </div>

        <div className="divide-y divide-slate-800/80">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-white">{item.productName}</h4>
                  <span className="text-slate-400">
                    {item.volume} • {item.quantity} x GHS {item.unitPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <span className="font-bold text-white">GHS {item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-2 text-xs text-slate-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-white">GHS {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fulfillment ({order.fulfillmentType})</span>
            <span className="font-semibold text-white">
              {order.deliveryFee === 0 ? 'FREE' : `GHS ${order.deliveryFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-[#d4af37] border-t border-slate-800 pt-2">
            <span>Total Paid</span>
            <span>GHS {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-4 justify-between items-center pt-2">
        <Link
          href="/catalog"
          className="text-xs font-bold text-[#d4af37] hover:underline flex items-center gap-1"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Continue Shopping
        </Link>

        <Link
          href="/account"
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
        >
          View in My Orders History
        </Link>
      </div>
    </div>
  );
}
