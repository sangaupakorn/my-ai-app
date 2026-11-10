/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function CartToast() {
  const { toastMessage, setIsCartOpen } = useCart();
  if (!toastMessage) return null;

  return (
    <div 
      className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-sm sm:max-w-md pointer-events-none animate-fade-in font-sans"
      id="cart-toast-banner"
    >
      <div 
        onClick={() => setIsCartOpen(true)}
        className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-white/15 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer hover:bg-slate-900 transition-all select-none hover:scale-[1.01] active:scale-98"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>เพิ่มสินค้าลงตะกร้าแล้ว</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </p>
            <p className="text-[11px] sm:text-xs text-slate-300 font-normal truncate mt-0.5">
              {toastMessage}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCartOpen(true);
          }}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <span>ดูตะกร้า</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
