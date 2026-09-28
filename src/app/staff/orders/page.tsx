'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import {
  ClipboardList,
  Clock,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update order status');
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (fulfillmentFilter !== 'all' && o.fulfillmentType !== fulfillmentFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(term);
      const matchName = o.customerName.toLowerCase().includes(term);
      const matchPhone = o.customerPhone.toLowerCase().includes(term);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-[#0d1527] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111a2e] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="confirmed" className="bg-slate-900">Confirmed (Paid)</option>
              <option value="out_for_delivery" className="bg-slate-900">Out for Delivery</option>
              <option value="ready_for_pickup" className="bg-slate-900">Ready for Pickup</option>
              <option value="completed" className="bg-slate-900">Completed</option>
              <option value="cancelled" className="bg-slate-900">Cancelled</option>
            </select>
          </div>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-slate-900 text-white border border-slate-700 px-3 py-2 rounded-xl font-semibold focus:outline-none"
          >
            <option value="all">All Delivery & Pickup</option>
            <option value="delivery">Delivery Orders Only</option>
            <option value="pickup">Store Pickup Only</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading incoming orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <ClipboardList className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400">No orders match the selected filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="bg-[#0d1527] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-white">{o.orderNumber}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      o.orderStatus === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : o.orderStatus === 'cancelled'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : o.orderStatus === 'out_for_delivery' || o.orderStatus === 'ready_for_pickup'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {o.orderStatus.replace(/_/g, ' ')}
                  </span>

                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 capitalize font-medium">
                    Payment: <strong className={o.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{o.paymentStatus}</strong>
                  </span>
                </div>
              </div>

              {/* Customer and Fulfillment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-[#111a2e] p-3 rounded-xl">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Customer Contact</span>
                  <p className="font-bold text-white text-sm">{o.customerName}</p>
                  <p className="text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> {o.customerPhone}
                  </p>
                  <p className="text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> {o.customerEmail}
                  </p>
                </div>

                <div className="space-y-1 bg-[#111a2e] p-3 rounded-xl">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Fulfillment Details</span>
                  {o.fulfillmentType === 'delivery' ? (
                    <div className="space-y-1">
                      <p className="text-blue-300 font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Accra Delivery ({o.deliveryDetails?.zone})
                      </p>
                      <p className="text-white">{o.deliveryDetails?.address}</p>
                      {o.deliveryDetails?.deliveryNotes && (
                        <p className="text-amber-300 italic text-[11px]">
                          Note: "{o.deliveryDetails.deliveryNotes}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-emerald-300 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> In-Store Customer Pickup
                      </p>
                      <p className="text-slate-300">Customer will collect at 410 New Road counter.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl text-xs">
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">
                  Items to Pack ({o.items.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex items-center gap-2.5">
                      <img src={i.productImage} alt={i.productName} className="w-8 h-8 rounded object-cover bg-slate-800" />
                      <div>
                        <span className="font-bold text-white block">
                          {i.quantity}x {i.productName}
                        </span>
                        <span className="text-slate-400 text-[11px]">{i.volume}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">Advance Status:</span>

                  {o.orderStatus === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'confirmed')}
                      disabled={updatingId === o.id}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Confirm Order
                    </button>
                  )}

                  {o.orderStatus === 'confirmed' && (
                    <>
                      {o.fulfillmentType === 'delivery' ? (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'out_for_delivery')}
                          disabled={updatingId === o.id}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" /> Dispatch (Out for Delivery)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'ready_for_pickup')}
                          disabled={updatingId === o.id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Ready for Pickup
                        </button>
                      )}
                    </>
                  )}

                  {(o.orderStatus === 'out_for_delivery' || o.orderStatus === 'ready_for_pickup') && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'completed')}
                      disabled={updatingId === o.id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}

                  {o.orderStatus === 'completed' && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Order Complete
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  * Cancellations & refunds require Shop Owner clearance.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
