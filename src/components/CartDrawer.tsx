'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen, subtotal, itemCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d1527] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-base font-bold tracking-wide">Your Drinks Cart</h2>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-semibold text-slate-200">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Browse our chilled beers, fine wines, and premium spirits to get started.
                </p>
                <Link
                  href="/catalog"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#d4af37] text-slate-950 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#c5a028] transition"
                >
                  Explore Drinks Catalog
                </Link>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 bg-[#111a2e]/90 p-3 rounded-xl border border-slate-800/80 items-center"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{product.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {product.volume} • GHS {product.price.toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900/80 text-xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:text-[#d4af37] transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-bold text-slate-200">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stockQuantity}
                          className="p-1 hover:text-[#d4af37] disabled:opacity-40 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-[#d4af37]">
                      GHS {(product.price * quantity).toFixed(2)}
                    </p>
                    {product.stockQuantity < 10 && (
                      <span className="text-[10px] text-amber-400 font-medium">
                        Only {product.stockQuantity} left
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-[#080d1a] space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="text-sm font-black text-white">GHS {subtotal.toFixed(2)}</span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Fulfillment options:</span>
                <span className="text-amber-400 font-semibold">Delivery or Free Store Pickup</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#d4af37]/20 transition active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-center text-[11px] text-slate-500 hover:text-red-400 transition"
              >
                Clear entire cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
