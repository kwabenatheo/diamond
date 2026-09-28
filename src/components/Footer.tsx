'use client';

import React from 'react';
import Link from 'next/link';
import { Wine, MapPin, Phone, Mail, Clock, ShieldAlert, CreditCard, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050811] text-slate-400 border-t border-slate-800/80 pt-12 pb-24 md:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand & Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#d4af37] flex items-center justify-center text-slate-950 font-bold">
              <Wine className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-white tracking-wide">
              DIAMOND JAY <span className="text-[#d4af37]">ENTERPRISE</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Accra’s trusted retail destination for authentic imported spirits, fine international wines, chilled local beers, prestige champagnes, and cocktail mixers.
          </p>
          <div className="space-y-1.5 pt-2 text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>410 New Road, Accra, Ghana</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>+233 242 657 521 (Calls & WhatsApp)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>orders@diamondjay.com</span>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            Store Opening Hours
          </h4>
          <ul className="space-y-2 text-slate-300">
            <li className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>Monday – Thursday:</span>
              <span className="font-semibold text-white">7:00 AM – 9:00 PM</span>
            </li>
            <li className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>Friday – Saturday:</span>
              <span className="font-semibold text-[#d4af37]">7:00 AM – 9:00 PM</span>
            </li>
            <li className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>Sunday:</span>
              <span className="font-semibold text-white">7:00 AM – 9:00 PM</span>
            </li>
            <li className="text-[11px] text-amber-400 pt-1">
              * Delivery orders close 45 minutes before store closing time.
            </li>
          </ul>
        </div>

        {/* Quick Links & Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Drinks Categories</h4>
          <ul className="space-y-1.5 text-slate-300">
            <li>
              <Link href="/catalog?category=whisky-spirits" className="hover:text-[#d4af37] transition">
                Whisky & Premium Spirits
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=wines" className="hover:text-[#d4af37] transition">
                Fine Red, White & Rosé Wines
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=champagnes" className="hover:text-[#d4af37] transition">
                Champagnes & Sparkling Wines
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=beers-ciders" className="hover:text-[#d4af37] transition">
                Chilled Beers & Ciders (Bottles & Crates)
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=liqueurs-bitters" className="hover:text-[#d4af37] transition">
                Authentic Ghanaian Bitters & Creams
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=mixers-soft-drinks" className="hover:text-[#d4af37] transition">
                Mixers, Tonics & Energy Drinks
              </Link>
            </li>
          </ul>
        </div>

        {/* Payment & 18+ Advisory */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Supported Payments</h4>
          <p className="text-slate-400 text-xs">
            Secured online payments powered by <strong className="text-slate-200">Paystack Ghana</strong>:
          </p>

          <div className="flex flex-wrap gap-2 text-slate-200">
            <span className="bg-[#111a2e] border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-yellow-400" /> MTN MoMo
            </span>
            <span className="bg-[#111a2e] border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-red-400" /> Telecel Cash
            </span>
            <span className="bg-[#111a2e] border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" /> AT Money
            </span>
            <span className="bg-[#111a2e] border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Visa / Mastercard
            </span>
          </div>

          <div className="mt-4 p-3 bg-red-950/40 border border-red-900/60 rounded-xl">
            <div className="flex items-center gap-1.5 text-red-300 font-bold mb-1">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Strict 18+ Age Verification</span>
            </div>
            <p className="text-[11px] text-red-200/80 leading-normal">
              Alcohol sales are restricted to persons 18 years and older in accordance with the laws of Ghana. Drink responsibly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
        <span>© {new Date().getFullYear()} Diamond Jay Enterprise. 410 New Road, Accra, Ghana. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/catalog" className="hover:text-slate-300">Catalog</Link>
          <Link href="/login" className="hover:text-slate-300">Staff Portal</Link>
          <Link href="/login" className="hover:text-slate-300">Owner Portal</Link>
        </div>
      </div>
    </footer>
  );
}
