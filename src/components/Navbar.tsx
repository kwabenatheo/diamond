'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  User as UserIcon,
  Wine,
  Menu,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top micro info bar */}
      <div className="hidden md:block bg-[#050811] text-[11px] text-slate-400 py-1.5 px-4 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-[#d4af37]" />
              410 New Road, Accra, Ghana
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-[#d4af37]" />
              Open Daily: 7:40 AM – 9:00 PM
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#d4af37] font-medium">
              🚚 Express delivery across Accra & Free In-Store Pickup
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-semibold text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
              18+ ONLY
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition">
            <Image
              src="/diamond-jay-logo.svg"
              alt="Diamond Jay Enterprise logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="whitespace-nowrap text-sm sm:text-lg leading-tight font-black tracking-tight text-white flex items-center gap-1.5">
              DIAMOND JAY
              <span className="hidden sm:inline text-[10px] bg-[#d4af37]/20 text-[#d4af37] font-bold px-1.5 py-0.5 rounded uppercase">
                Enterprise
              </span>
            </span>
            <span className="truncate whitespace-nowrap text-[8px] sm:text-[10px] text-slate-400 tracking-[0.08em] sm:tracking-wider uppercase font-semibold">
              <span className="sm:hidden text-[#d4af37]">Enterprise • </span>Drinks & Liquor Boutique • Accra
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop/Tablet) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Search whisky, champagne, beer, wines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111a2e] text-slate-100 placeholder-slate-400 text-sm rounded-full pl-10 pr-4 py-2 border border-slate-700/60 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Navigation Links */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link
            href="/catalog"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-[#d4af37] transition px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
          >
            <Layers className="w-4 h-4 text-[#d4af37]" />
            All Drinks
          </Link>

          {/* Role Hub Quick Buttons */}
          {user?.role === 'owner' && (
            <Link
              href="/owner/analytics"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-3 py-1.5 rounded-lg hover:bg-amber-900/60 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              Owner Hub
            </Link>
          )}

          {user?.role === 'staff' && (
            <Link
              href="/staff/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-950/60 border border-blue-600/40 px-3 py-1.5 rounded-lg hover:bg-blue-900/60 transition"
            >
              <Wine className="w-3.5 h-3.5" />
              Staff Orders
            </Link>
          )}

          {/* Account Link */}
          <Link
            href={user ? (user.role === 'customer' ? '/account' : user.role === 'owner' ? '/owner/analytics' : '/staff/orders') : '/login'}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition px-1.5 sm:px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60"
          >
            <UserIcon className="w-4 h-4 text-[#d4af37]" />
            <span className="hidden sm:inline">
              {user ? user.name.split(' ')[0] : 'Account'}
            </span>
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold px-2.5 sm:px-3.5 py-2 rounded-full transition shadow-md shadow-[#d4af37]/20 active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-xs uppercase tracking-wide">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#080d1a] shadow animate-bounce">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d1527] border-b border-slate-800 p-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search drinks & liquors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111a2e] text-slate-100 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2 border border-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold">
            <Link
              href="/catalog?category=whisky-spirits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            >
              🥃 Whisky & Spirits
            </Link>
            <Link
              href="/catalog?category=wines"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            >
              🍷 Fine Wines
            </Link>
            <Link
              href="/catalog?category=champagnes"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            >
              🍾 Champagnes
            </Link>
            <Link
              href="/catalog?category=beers-ciders"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            >
              🍺 Beers & Ciders
            </Link>
            <Link
              href="/catalog?category=liqueurs-bitters"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            >
              🍸 Local Bitters & Creams
            </Link>
            <Link
              href="/catalog?category=mixers-soft-drinks"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            >
              🥤 Soft Drinks & Mixers
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>📍 410 New Road, Accra</span>
            <span>📞 +233 248 565 916</span>
          </div>
        </div>
      )}
    </header>
  );
}
