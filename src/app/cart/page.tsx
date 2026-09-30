'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-white">Your Drinks Cart is Empty</h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
          Stock up on your favorite whiskies, beers, fine wines, or party crates before heading to checkout.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#d4af37] text-slate-950 font-bold px-6 py-3 rounded-full text-xs shadow-lg hover:bg-[#c5a028] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">Review your drinks before proceeding to checkout</p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-red-400 hover:text-red-300 transition"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-[#0d1527] border border-slate-800 p-4 rounded-2xl flex gap-4 items-center"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-xl bg-slate-900 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  href={`/product/${product.id}`}
                  className="font-bold text-sm text-white hover:text-[#d4af37] transition truncate block"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-slate-400">
                  {product.volume} • GHS {product.price.toFixed(2)} each
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 text-xs">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1.5 hover:text-[#d4af37] transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stockQuantity}
                      className="p-1.5 hover:text-[#d4af37] disabled:opacity-40 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 transition text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-medium">Total</span>
                <span className="text-base font-black text-[#d4af37]">
                  GHS {(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping for More Drinks
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4 h-fit shadow-xl">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Order Summary</h2>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Items Total ({itemCount})</span>
              <span className="font-bold text-white">GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment</span>
              <span className="text-amber-400 font-semibold">Select at Checkout</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              • In-Store Pickup at <strong>410 New Road</strong> is <strong>FREE</strong>.
              <br />• Delivery across Accra starts from <strong>GHS 25</strong>.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
            <span className="font-bold text-sm text-white">Estimated Subtotal</span>
            <span className="text-xl font-black text-[#d4af37]">GHS {subtotal.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#d4af37]/20 active:scale-98"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
