'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Plus, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="group bg-[#0d1527] hover:bg-[#111c34] border border-slate-800/80 hover:border-[#d4af37]/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-[#d4af37]/5">
      {/* Product Image & Badges */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1527] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] font-bold">
          <span className="bg-[#080d1a]/80 backdrop-blur-md text-[#d4af37] px-2.5 py-1 rounded-full border border-[#d4af37]/20 uppercase tracking-wider">
            {product.category.replace('-', ' ')}
          </span>

          {product.alcoholPercentage ? (
            <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              {product.alcoholPercentage}% ABV
            </span>
          ) : null}
        </div>

        {/* Low or Out of Stock Tag */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <span className="bg-red-900/90 text-red-200 text-xs font-black uppercase px-3 py-1.5 rounded-full border border-red-500 tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
            </span>
          </div>
        ) : product.stockQuantity <= 10 ? (
          <span className="absolute bottom-2 left-2.5 bg-amber-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
            Only {product.stockQuantity} left
          </span>
        ) : null}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>{product.volume}</span>
            {product.originCountry && <span>{product.originCountry}</span>}
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Price</span>
            <span className="text-base font-black text-white">
              <span className="text-xs text-[#d4af37] mr-0.5">GHS</span>
              {product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addItem(product, 1)}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : cartItem
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-[#d4af37] text-slate-950 hover:bg-[#c5a028] shadow-md shadow-[#d4af37]/20'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {cartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Cart ({cartItem.quantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
