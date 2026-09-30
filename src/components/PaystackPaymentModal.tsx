'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck, Smartphone, CreditCard, X } from 'lucide-react';
import { Order } from '@/lib/types';

interface PaystackPaymentModalProps {
  order: Order;
  onCancel: () => void;
}

export default function PaystackPaymentModal({ order, onCancel }: PaystackPaymentModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setIsRedirecting(true);
    setError(null);

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.data?.authorizationUrl) {
        throw new Error(result.error || 'Could not start Paystack checkout. Please try again.');
      }

      window.location.assign(result.data.authorizationUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Payment initialization failed. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0d1527] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        <div className="bg-[#080d1a] p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm tracking-wide text-white">Secure Paystack Checkout</h3>
            <p className="text-[11px] text-slate-400">Order: {order.orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isRedirecting}
            aria-label="Close payment dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Amount Due</span>
            <div className="text-3xl font-black text-[#d4af37]">GHS {order.totalAmount.toFixed(2)}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <p className="text-xs text-slate-300">You’ll continue to Paystack to choose a payment method and complete payment securely.</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-400" /> Mobile Money</span>
              <span className="inline-flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-[#d4af37]" /> Cards</span>
            </div>
            <p className="text-[10px] text-slate-500">Your card and wallet credentials are entered on Paystack, never on this site.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={isRedirecting}
            className="w-full bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-[#d4af37]/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isRedirecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack...</> : <><ShieldCheck className="w-4 h-4" /> Continue to Paystack</>}
          </button>
        </div>
      </div>
    </div>
  );
}
