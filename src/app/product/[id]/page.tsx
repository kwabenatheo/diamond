'use client';

import React, { useEffect, useState, use } from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import {
  Wine,
  ShieldCheck,
  Truck,
  MapPin,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem, items } = useCart();
  const cartItem = items.find((i) => i.product.id === product?.id);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const data = await res.json();
        setProduct(data.product);

        // Fetch related products in same category
        const relRes = await fetch(`/api/products?category=${data.product.category}`);
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelated(relData.products.filter((p: Product) => p.id !== id).slice(0, 4));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Wine className="w-10 h-10 animate-bounce text-[#d4af37] mx-auto mb-3" />
        <p className="font-semibold">Loading drink details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Drink Not Found</h2>
        <p className="text-xs text-slate-400">The product you are looking for may have been removed or is temporarily unavailable.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#d4af37] text-slate-950 px-5 py-2.5 rounded-full text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-white">Catalog</Link>
        <span>/</span>
        <Link href={`/catalog?category=${product.category}`} className="hover:text-white capitalize">
          {product.category.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-[#d4af37] truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-[#0d1527] border border-slate-800 p-6 sm:p-10 rounded-3xl">
        {/* Left: Image with luxury frame */}
        <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-slate-800 shadow-xl">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-[#080d1a]/85 backdrop-blur-md px-3 py-1 rounded-full border border-[#d4af37]/30 text-xs font-bold text-[#d4af37] uppercase">
            {product.category.replace('-', ' ')}
          </div>
          {product.originCountry && (
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-300">
              Origin: {product.originCountry}
            </div>
          )}
        </div>

        {/* Right: Details & Buying Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md font-bold">
                {product.volume}
              </span>
              {product.alcoholPercentage && (
                <span className="bg-slate-800 text-amber-300 px-2.5 py-1 rounded-md font-bold">
                  {product.alcoholPercentage}% ABV
                </span>
              )}
              {isOutOfStock ? (
                <span className="bg-red-950 text-red-300 border border-red-800 px-2.5 py-1 rounded-md font-bold">
                  Out of Stock
                </span>
              ) : (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> In Stock ({product.stockQuantity} available)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-[#d4af37]">GHS</span>
              <span className="text-3xl sm:text-4xl font-black text-white">
                {product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-normal">incl. VAT</span>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description & Tasting Notes</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-300">Quantity:</span>
                <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 text-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:text-[#d4af37] transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    disabled={quantity >= product.stockQuantity}
                    className="p-2.5 hover:text-[#d4af37] disabled:opacity-40 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Total: <strong className="text-white">GHS {(product.price * quantity).toFixed(2)}</strong>
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => addItem(product, quantity)}
                disabled={isOutOfStock}
                className="flex-1 bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg shadow-[#d4af37]/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{cartItem ? `Update Cart (${cartItem.quantity + quantity})` : 'Add to Drinks Cart'}</span>
              </button>

              <Link
                href="/checkout"
                onClick={() => addItem(product, quantity)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-xl transition text-center text-sm"
              >
                Buy Now
              </Link>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>Pickup available at <strong>410 New Road</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>Accra Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>100% Genuine Sealed Bottle</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <span>🔞 Strict 18+ Age Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-white tracking-tight">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
