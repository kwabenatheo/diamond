import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Diamond Jay Enterprise | Drinks, Spirits, Wine & Beer Store — Accra, Ghana',
  description:
    'Shop authentic imported whiskies, premium spirits, fine wines, chilled beers, and liqueurs at Diamond Jay Enterprise, 410 New Road, Accra. Fast delivery across Accra and free in-store pickup.',
  keywords: 'drinks store Accra, liquor shop Ghana, alcohol delivery Accra, Diamond Jay Enterprise, buy wine Accra, beer crates Accra',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#080d1a] text-slate-100 selection:bg-[#d4af37] selection:text-slate-950">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
