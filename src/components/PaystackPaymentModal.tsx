'use client';

import React, { useState } from 'react';
import { Smartphone, CreditCard, ShieldCheck, AlertCircle, Loader2, CheckCircle2, X } from 'lucide-react';
import { Order } from '@/lib/types';

interface PaystackPaymentModalProps {
  order: Order;
  onSuccess: (updatedOrder: Order) => void;
  onCancel: () => void;
}

export default function PaystackPaymentModal({ order, onSuccess, onCancel }: PaystackPaymentModalProps) {
  const [channel, setChannel] = useState<'momo' | 'card'>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
  const [momoPhone, setMomoPhone] = useState(order.customerPhone || '0241234567');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Initialize Paystack reference
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const initData = await initRes.json();

      if (!initRes.ok) {
        throw new Error(initData.error || 'Failed to initialize Paystack checkout');
      }

      const reference = initData.data.reference;

      // 2. Perform Server-side verification (Never trust client alone!)
      const verifyRes = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          reference,
          paymentMethod: channel === 'card' ? 'paystack_card' : 'paystack_momo',
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Server-side payment verification failed at Paystack');
      }

      // Success! Pass updated order to parent
      onSuccess(verifyData.order);
    } catch (err: any) {
      console.error('Payment flow error:', err);
      setError(err.message || 'Payment processing failed. Please retry.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0d1527] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden relative text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Paystack branding */}
        <div className="bg-[#080d1a] p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/40">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm tracking-wide text-white">Paystack Checkout</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-800">
                  Ghana Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Order: {order.orderNumber}</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-gradient-to-r from-[#111a2e] to-[#16223b] p-4 text-center border-b border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Amount Due</span>
          <div className="text-2xl font-black text-[#d4af37] tracking-tight">
            GHS {order.totalAmount.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">
            {order.fulfillmentType === 'delivery' ? 'Includes Accra Delivery' : 'In-Store Pickup (410 New Road)'}
          </span>
        </div>

        {/* Payment Channels Tabs */}
        <form onSubmit={handlePay} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setChannel('momo')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                channel === 'momo'
                  ? 'bg-[#d4af37] text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile Money
            </button>
            <button
              type="button"
              onClick={() => setChannel('card')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                channel === 'card'
                  ? 'bg-[#d4af37] text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Debit / Card
            </button>
          </div>

          {channel === 'momo' ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">Select Network Provider:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMomoProvider('mtn')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                    momoProvider === 'mtn'
                      ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🟡 MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setMomoProvider('vodafone')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                    momoProvider === 'vodafone'
                      ? 'border-red-400 bg-red-500/10 text-red-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🔴 Telecel Cash
                </button>
                <button
                  type="button"
                  onClick={() => setMomoProvider('airteltigo')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                    momoProvider === 'airteltigo'
                      ? 'border-blue-400 bg-blue-500/10 text-blue-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🔵 AT Money
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mobile Money Wallet Number:
                </label>
                <input
                  type="tel"
                  required
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="e.g. 024 123 4567"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  You will receive an instant prompt on your phone to approve the payment with your Mobile Money PIN.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4084 0000 0000 0000"
                  defaultValue="4084 1234 5678 9010"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white text-center font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    defaultValue="123"
                    maxLength={3}
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white text-center font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-[#d4af37]/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying with Paystack Ghana...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pay GHS {order.totalAmount.toFixed(2)} Now</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            256-bit TLS encrypted transaction verified server-side
          </p>
        </form>
      </div>
    </div>
  );
}
