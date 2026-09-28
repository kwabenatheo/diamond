'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Grid, ShoppingBag, User, ShieldCheck } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const accountHref = !user
    ? '/login'
    : user.role === 'customer'
    ? '/account'
    : user.role === 'staff'
    ? '/staff/orders'
    : '/owner/analytics';

  const accountLabel = !user
    ? 'Login'
    : user.role === 'customer'
    ? 'Account'
    : user.role === 'staff'
    ? 'Staff Hub'
    : 'Owner Hub';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d1a]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
            pathname === '/' ? 'text-[#d4af37]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/catalog"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
            pathname.startsWith('/catalog') ? 'text-[#d4af37]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>Catalog</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-slate-200 relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-[#d4af37]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#080d1a]">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[#d4af37]">Cart</span>
        </button>

        <Link
          href={accountHref}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
            pathname.startsWith('/account') || pathname.startsWith('/staff') || pathname.startsWith('/owner')
              ? 'text-[#d4af37]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {user?.role === 'owner' ? (
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-400" />
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span>{accountLabel}</span>
        </Link>
      </div>
    </nav>
  );
}
