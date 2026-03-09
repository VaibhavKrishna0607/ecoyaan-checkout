'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { Leaf, Search, Heart, ShoppingCart, User, ChevronDown, MapPin, Truck } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartData } = useCheckout();
  const itemCount = cartData?.cartItems?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#1b4332] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-[#95d5b2]">
            <Truck size={12} />
            <span>Free shipping on orders over ₹499</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[#b7e0c8]">
            <span>100% Eco-certified products</span>
            <span className="text-[#52b788]">|</span>
            <span>Carbon-neutral delivery</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-[#2d6a4f] shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-white/10 rounded-lg p-1.5">
              <Leaf size={20} className="text-[#95d5b2]" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-white text-lg tracking-tight leading-none block">Ecoyaan</span>
              <span className="text-[10px] text-[#95d5b2] leading-none">.in</span>
            </div>
          </Link>

          {/* Deliver to */}
          <button className="hidden md:flex flex-col items-start shrink-0 text-white hover:bg-white/10 rounded px-2 py-1 transition-colors">
            <span className="text-[10px] text-[#95d5b2] flex items-center gap-0.5"><MapPin size={10} /> Deliver to</span>
            <span className="text-xs font-bold flex items-center gap-0.5">India <ChevronDown size={11} /></span>
          </button>

          {/* Search bar */}
          <div className="flex-1 flex rounded-lg overflow-hidden shadow-inner max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search eco-friendly products…"
              className="flex-1 px-4 py-2 text-sm text-gray-800 bg-white outline-none placeholder-gray-400"
            />
            <button
              aria-label="Search"
              className="bg-[#52b788] hover:bg-[#40916c] px-4 flex items-center justify-center transition-colors"
            >
              <Search size={18} className="text-white" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button className="hidden sm:flex flex-col items-center px-2 py-1 rounded text-white hover:bg-white/10 transition-colors">
              <User size={18} />
              <span className="text-[10px] mt-0.5 font-medium">Account</span>
            </button>
            <button className="hidden sm:flex flex-col items-center px-2 py-1 rounded text-white hover:bg-white/10 transition-colors">
              <Heart size={18} />
              <span className="text-[10px] mt-0.5 font-medium">Wishlist</span>
            </button>
            <Link
              href="/cart"
              className="flex flex-col items-center px-2 py-1 rounded text-white hover:bg-white/10 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#95d5b2] text-[#1b4332] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium hidden sm:block">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="bg-[#40916c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-6 overflow-x-auto scrollbar-none text-[12px] font-medium text-white/90">
          {['All Categories', 'Personal Care', 'Kitchen', 'Bags & Packaging', 'Clothing', 'Home & Living', 'Stationery', 'Kids'].map(cat => (
            <button
              key={cat}
              className="whitespace-nowrap hover:text-white hover:underline underline-offset-2 transition-colors shrink-0"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
