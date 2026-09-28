'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import {
  ClipboardList,
  Search,
  Filter,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
  Truck,
  MapPin,
  X,
  AlertCircle,
} from 'lucide-react';

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Refund modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('Customer requested order cancellation and refund');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToRefund) return;
    setProcessingRefund(true);

    try {
      const res = await fetch(`/api/orders/${orderToRefund.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue refund');
      }

      setOrders((prev) => prev.map((o) => (o.id === orderToRefund.id ? data.order : o)));
      setRefundModalOpen(false);
      setOrderToRefund(null);
    } catch (err: any) {
      alert(err.message || 'Refund error');
    } finally {
      setProcessingRefund(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(term);
      const matchName = o.customerName.toLowerCase().includes(term);
      const matchRef = o.paystackReference?.toLowerCase().includes(term);
      if (!matchNum && !matchName && !matchRef) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and CSV Bar */}
      <div className="bg-[#0d1527] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by order #, customer, Paystack ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111a2e] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-[#d4af37]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none"
            >
              <option value="all" className="bg-slate-900">All Order Statuses</option>
              <option value="confirmed" className="bg-slate-900">Confirmed (Paid)</option>
              <option value="out_for_delivery" className="bg-slate-900">Out for Delivery</option>
              <option value="ready_for_pickup" className="bg-slate-900">Ready for Pickup</option>
              <option value="completed" className="bg-slate-900">Completed</option>
              <option value="cancelled" className="bg-slate-900">Refunded / Cancelled</option>
            </select>
          </div>

          <a
            href="/api/owner/export"
            download
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading order records...</div>
      ) : (
        <div className="bg-[#0d1527] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#111a2e] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Order # & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Total (GHS)</th>
                  <th className="p-4">Payment & Paystack Ref</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Owner Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/60 transition">
                    <td className="p-4">
                      <span className="font-black text-white block text-sm">{o.orderNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <span className="font-bold text-white block">{o.customerName}</span>
                      <span className="text-slate-400 text-[11px] block">{o.customerPhone}</span>
                      <span className="text-slate-500 text-[11px] block">{o.customerEmail}</span>
                    </td>
                    <td className="p-4">
                      {o.fulfillmentType === 'pickup' ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <MapPin className="w-3.5 h-3.5" /> Pickup
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-400 font-semibold">
                          <Truck className="w-3.5 h-3.5" /> Delivery ({o.deliveryDetails?.zone?.split('&')[0]})
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-black text-white text-sm block">
                        GHS {o.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Subtotal: GHS {o.subtotal.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : o.paymentStatus === 'refunded'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                      {o.paystackReference && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {o.paystackReference}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-800 text-slate-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled' ? (
                        <button
                          onClick={() => {
                            setOrderToRefund(o);
                            setRefundModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-900/80 font-bold text-[11px] flex items-center gap-1 ml-auto transition"
                        >
                          <RotateCcw className="w-3 h-3" /> Issue Refund
                        </button>
                      ) : o.paymentStatus === 'refunded' ? (
                        <span className="text-purple-400 font-semibold text-[11px]">Refunded</span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Owner Refund Modal */}
      {refundModalOpen && orderToRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1527] border border-red-800 rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-red-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Issue Refund & Cancellation
              </h3>
              <button onClick={() => setRefundModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl space-y-1 text-xs text-slate-300">
              <p>
                <strong>Order:</strong> {orderToRefund.orderNumber}
              </p>
              <p>
                <strong>Customer:</strong> {orderToRefund.customerName} ({orderToRefund.customerPhone})
              </p>
              <p>
                <strong>Total to Refund:</strong>{' '}
                <span className="text-red-400 font-black">GHS {orderToRefund.totalAmount.toFixed(2)}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Action: Marks order as refunded/cancelled and automatically restores stock quantities to inventory.
              </p>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason for Refund/Cancellation *</label>
                <textarea
                  rows={3}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black transition disabled:opacity-50"
                >
                  {processingRefund ? 'Processing...' : 'Confirm Refund & Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
