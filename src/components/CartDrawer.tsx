/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getDirectImageUrl } from '../data';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    totalItems,
    setIsCheckoutOpen
  } = useCart();

  // Lock background body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={() => setIsCartOpen(false)}
      id="cart-drawer-overlay"
    >
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">ตะกร้าสินค้าของคุณ</h3>
                <p className="text-xs text-gray-500 font-light">มีสินค้า {totalItems} รายการในตะกร้า</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="ปิดตะกร้า"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-150">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">ยังไม่มีสินค้าในตะกร้า</h4>
                  <p className="text-xs text-gray-500 font-light max-w-xs">
                    เลือกดูวัสดุก่อสร้างและเครื่องมือคุณภาพ แล้วกด "เพิ่มลงตะกร้า" ได้ทันที
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  เลือกดูสินค้าตอนนี้
                </button>
              </div>
            ) : (
              cart.map((ci) => {
                const item = ci.item;
                const effectivePrice =
                  item.promoPrice !== undefined && item.promoPrice < item.regularPrice
                    ? item.promoPrice
                    : item.regularPrice;
                const itemTotal = effectivePrice * ci.quantity;
                const imageUrl = getDirectImageUrl(item.image);

                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-150 shrink-0">
                      <img
                        src={imageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>

                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xs font-bold text-red-600">
                          ฿{effectivePrice.toLocaleString('th-TH')}
                        </span>
                        {item.unit && (
                          <span className="text-[10px] text-gray-400 font-light">
                            /{item.unit}
                          </span>
                        )}
                        {item.promoPrice !== undefined && item.promoPrice < item.regularPrice && (
                          <span className="text-[10px] text-gray-400 line-through font-light">
                            ฿{item.regularPrice.toLocaleString('th-TH')}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, ci.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-90 transition-all cursor-pointer"
                            aria-label="ลดจำนวน"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, ci.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-90 transition-all cursor-pointer"
                            aria-label="เพิ่มจำนวน"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-gray-900">
                            ฿{itemTotal.toLocaleString('th-TH')}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with subtotal and checkout button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-150 bg-gray-50/80 space-y-4 shrink-0">
              {/* Delivery Tip */}
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <Truck className="w-4 h-4 shrink-0 text-blue-600" />
                <span>
                  คิดค่าส่งตามระยะทางจริงจากร้านสุโขทัยแสงอุปกรณ์ (มีสิทธิ์ส่งฟรีเมื่อยอดถึงเกณฑ์)
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-gray-600">ยอดรวมสินค้า ({totalItems} ชิ้น)</span>
                <span className="text-xl sm:text-2xl font-black text-red-600">
                  ฿{subtotal.toLocaleString('th-TH')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedCheckout}
                  className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <span>ดำเนินการสั่งซื้อและคิดค่าส่ง</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-center text-xs text-gray-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                >
                  ล้างรายการสินค้าทั้งหมด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
