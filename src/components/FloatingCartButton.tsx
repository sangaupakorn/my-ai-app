/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FloatingCartButton() {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 animate-bounce-short">
      <button
        onClick={() => setIsCartOpen(true)}
        className="group flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/30 cursor-pointer font-sans"
        aria-label="เปิดตะกร้าสินค้า"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-950 font-black text-[10px] sm:text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {totalItems}
          </span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] sm:text-xs text-red-100 font-light leading-none">
            ตะกร้าสินค้า
          </span>
          <span className="text-xs sm:text-sm font-black leading-tight">
            ฿{subtotal.toLocaleString('th-TH')}
          </span>
        </div>

        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
}
