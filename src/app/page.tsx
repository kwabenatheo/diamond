'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import {
  Wine,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  ArrowRight,
  Flame,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        if (prodRes.ok) {
          const pData = await prodRes.json();
          setProducts(pData.products || []);
        }
        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.categories || []);
        }
      } catch (e) {
        console.error('Error fetching home data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  return (
    <div className="space-y-16">
      {/* Announcement bar */}
      <div className="bg-[#111c34] border-b border-[#d4af37]/20 py-2.5 px-4 text-center text-xs text-amber-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
          <span>
            🎉 <strong className="text-white">Diamond Jay Enterprise:</strong> Fast Chilled Delivery Across Accra • Free Pickup at <strong>410 New Road</strong>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-[#0e172e] via-[#101b38] to-[#080d1a] border border-[#d4af37]/30 p-8 md:p-14 relative shadow-2xl overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
              <Wine className="w-3.5 h-3.5" />
              Accra’s Premier Drinks Destination
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Prestige Drinks & Liquors, Delivered{' '}
              <span className="gold-gradient-text">Cold Across Accra.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              From aged single malt whiskies and French champagnes to chilled Ghanaian lagers and traditional bitters. Order online with instant Paystack (MTN MoMo, Card) or pick up in-store at <strong>410 New Road</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/catalog"
                className="bg-gradient-to-r from-[#e6af2e] to-[#d4af37] hover:from-[#d4af37] hover:to-[#aa820a] text-slate-950 font-black px-6 py-3.5 rounded-full text-sm shadow-xl shadow-[#d4af37]/25 transition flex items-center gap-2 active:scale-95"
              >
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/catalog?category=beers-ciders"
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-5 py-3.5 rounded-full text-sm transition"
              >
                Beers & Ciders
              </Link>
            </div>

            {/* Quick stats / guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-base font-black text-white block">100%</span>
                <span className="text-slate-400">Authentic Imports</span>
              </div>
              <div>
                <span className="text-base font-black text-[#d4af37] block">45 Mins</span>
                <span className="text-slate-400">Avg. Accra Delivery</span>
              </div>
              <div>
                <span className="text-base font-black text-white block">GHS MoMo</span>
                <span className="text-slate-400">Paystack Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Explore by Category
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#d4af37] hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-slate-800 hover:border-[#d4af37]/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#d4af37]/10 flex flex-col justify-end p-4"
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-60 group-hover:opacity-75"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/50 to-transparent" />
              <div className="relative z-10">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#d4af37] transition">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-300 flex items-center gap-0.5 mt-0.5 opacity-80 group-hover:opacity-100">
                  Shop collection <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold block mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Top Shelf & Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Featured Spirits & Drinks
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#d4af37] hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>See Everything</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Store Location & Value Propositions */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-[#0c1426] border border-slate-800 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              Physical Store Location in Accra
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Visit Diamond Jay Enterprise at 410 New Road
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Prefer to choose your drinks in person or pick up an online order? We are conveniently situated on New Road in Accra. Our shelves are always stocked with chilled beers, gift-boxed whiskies, and celebration champagnes.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span><strong>Address:</strong> 410 New Road, Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span><strong>Hours:</strong> Daily 7:40 AM – 9:00 PM (Monday – Saturday) Sunday (11:30- 8:00pm) </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span><strong>Contact / WhatsApp:</strong> +233 242 657 521</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span><strong>Fulfillment:</strong> Express Dispatch across Accra or Free In-Store Pickup</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-slate-950 px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#c5a028] transition shadow"
              >
                Order for Delivery or Pickup
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111a2e] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Genuine Imports</h4>
              <p className="text-xs text-slate-400">
                100% genuine bottles sourced directly from authorized distributors.
              </p>
            </div>

            <div className="bg-[#111a2e] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Chilled Dispatch</h4>
              <p className="text-xs text-slate-400">
                Cold beers and wines dispatched rapidly to your door in Accra.
              </p>
            </div>

            <div className="bg-[#111a2e] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Paystack MoMo</h4>
              <p className="text-xs text-slate-400">
                Instant checkout with MTN MoMo, Telecel Cash, AT Money or card.
              </p>
            </div>

            <div className="bg-[#111a2e] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Party & Event Packs</h4>
              <p className="text-xs text-slate-400">
                Crates of Club beer, spirits, and ice-cold mixers for your gatherings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
