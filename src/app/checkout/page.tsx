'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import PaystackPaymentModal from '@/components/PaystackPaymentModal';
import {
  ShieldAlert,
  Truck,
  MapPin,
  Smartphone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();

  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  // Delivery Address Fields
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Mandatory 18+ Age Checkbox
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderForPayment, setActiveOrderForPayment] = useState<Order | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('payment') === 'failed') {
      setPaymentNotice('Payment was not completed. Your order is still unpaid; you can retry checkout.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const deliveryFee: number = 0;
  const totalAmount = subtotal + deliveryFee;

  if (items.length === 0 && !activeOrderForPayment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-black text-white">Your Cart is Empty</h1>
        <p className="text-xs text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#d4af37] text-slate-950 px-5 py-2.5 rounded-full text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Browse Catalog
        </Link>
      </div>
    );
  }

  const handleCreateOrderAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ageConfirmed) {
      setError('You must confirm you are 18 years of age or older before proceeding.');
      return;
    }

    if (fulfillmentType === 'delivery' && !address.trim()) {
      setError('Please provide your complete delivery street address for the staff-arranged courier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        fulfillmentType,
        deliveryDetails:
          fulfillmentType === 'delivery'
            ? {
                recipientName: customerName.trim(),
                phone: customerPhone.trim(),
                address: address.trim(),
                zone: 'Staff-arranged courier',
                deliveryNotes: deliveryNotes.trim() || undefined,
              }
            : undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        ageConfirmed: true,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Open Paystack Payment Modal
      setActiveOrderForPayment(data.order);
    } catch (err: any) {
      setError(err.message || 'Error creating order. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Checkout & Order Placement</h1>
        <p className="text-xs text-slate-400">Complete your contact, delivery details, and pay securely via Paystack.</p>
      </div>

      {paymentNotice && (
        <div className="p-4 bg-amber-950/70 border border-amber-800 text-amber-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{paymentNotice}</span>
        </div>
      )}

      <form onSubmit={handleCreateOrderAndPay} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfillment Toggle */}
          <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#d4af37]" />
              1. Choose Fulfillment Method
            </h2>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  fulfillmentType === 'delivery'
                    ? 'border-[#d4af37] bg-[#111c34] shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#d4af37]" /> Staff-Arranged Delivery
                  </span>
                  {fulfillmentType === 'delivery' && <CheckCircle className="w-4 h-4 text-[#d4af37]" />}
                </div>
                <span className="text-[11px] text-slate-400">
                  A staff member will contact a delivery person and confirm the final courier fee.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  fulfillmentType === 'pickup'
                    ? 'border-[#d4af37] bg-[#111c34] shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Free In-Store Pickup
                  </span>
                  {fulfillmentType === 'pickup' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className="text-[11px] text-slate-400">
                  Ready in 15 mins at <strong>410 New Road, Accra</strong>. GHS 0.00
                </span>
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Customer Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number (MoMo / Calls) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +233 24 123 4567"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Email Address (for Receipt) *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. kwame@example.com"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Delivery Details Form (if Delivery selected) */}
          {fulfillmentType === 'delivery' && (
            <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                3. Delivery Address & Courier Details
              </h2>

              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-200">
                  Delivery is handled by the shop’s staff. They will arrange a courier and confirm the rider fee privately before dispatch.
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Street Address / House Number / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 24, Near Shell Station, East Legon"
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Delivery Instructions / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call upon arrival at security gate; extra ice if possible"
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* In-store Pickup Info (if Pickup selected) */}
          {fulfillmentType === 'pickup' && (
            <div className="bg-emerald-950/30 border border-emerald-800/60 p-5 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <MapPin className="w-4 h-4" />
                <span>Pickup Station: 410 New Road, Accra</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Your drinks order will be boxed, packed, and chilled for you. Please present your order confirmation number at the counter when you arrive.
              </p>
              <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pickup hours: Daily 7:40 AM – 9:00 PM (Monday – Saturday) and on Sundays ( 11:30 AM- 8:00 PM)</span>
              </div>
            </div>
          )}

          {/* Age Verification Checkbox (MANDATORY REQUIREMENT) */}
          <div className="bg-[#101b34] border border-[#d4af37]/40 p-5 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="ageCheck"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 accent-[#d4af37] text-slate-950 cursor-pointer mt-0.5 shrink-0"
              />
              <label htmlFor="ageCheck" className="text-xs text-slate-200 cursor-pointer leading-normal">
                <strong className="text-amber-300 block text-sm mb-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Legal Age Confirmation (18+ Required)
                </strong>
                I hereby confirm that I am <strong>18 years of age or older</strong> and legally authorized to purchase alcoholic beverages under the laws of Ghana.
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Col: Summary & Pay Button */}
        <div className="space-y-4">
          <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3 uppercase tracking-wider">
              Order Breakdown
            </h3>

            {/* Quick item list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between items-center text-xs text-slate-300">
                  <span className="truncate max-w-[180px]">
                    {i.quantity}x {i.product.name}
                  </span>
                  <span className="font-bold text-white shrink-0">
                    GHS {(i.product.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">GHS {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fulfillment ({fulfillmentType})</span>
                <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'text-white font-semibold'}>
                  {deliveryFee === 0 ? 'FREE' : `GHS ${deliveryFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="text-2xl font-black text-[#d4af37]">GHS {totalAmount.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !ageConfirmed}
              className="w-full bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black py-4 rounded-xl shadow-xl shadow-[#d4af37]/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Order...</span>
                </>
              ) : (
                <>
                  <span>Pay GHS {totalAmount.toFixed(2)} with Paystack</span>
                </>
              )}
            </button>

            {/* Payment badges */}
            <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1.5">
              <p className="flex items-center justify-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                <span>MTN MoMo, Telecel Cash, AT Money, Visa & Mastercard</span>
              </p>
              <p className="text-slate-500">
                Secured by Paystack • No card/wallet details stored on our servers
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Paystack Payment Modal */}
      {activeOrderForPayment && (
        <PaystackPaymentModal
          order={activeOrderForPayment}
          onCancel={() => setActiveOrderForPayment(null)}
        />
      )}
    </div>
  );
}
