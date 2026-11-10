/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tag, ShoppingBag, Plus } from 'lucide-react';
import { SheetItem, getDirectImageUrl } from '../data';
import { useCart } from '../context/CartContext';

interface ItemCardProps {
  key?: string;
  item: SheetItem;
  onClick: (item: SheetItem) => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const imageUrl = getDirectImageUrl(item.image);
  const { addToCart } = useCart();
  
  // Tag validation logic:
  // 1. Specific to "สินค้าอื่นๆ" category: if status contains "clearance" -> Dark red "CLEARANCE"
  // 2. Under other product categories: if there is a promo price and not in "สินค้าอื่นๆ" tab -> Bright red "SALE"
  const isClearance = item.tabName === 'สินค้าอื่นๆ' && item.status?.toLowerCase().includes('clearance');
  const isSale = item.tabName !== 'สินค้าอื่นๆ' && item.category === 'product' && item.promoPrice !== undefined && item.promoPrice < item.regularPrice;

  return (
    <div 
      id={`item-card-${item.id}`}
      onClick={() => onClick(item)}
      className="group bg-white rounded-lg shadow-sm p-3 border border-gray-150 flex flex-col relative hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer h-full justify-between font-sans"
    >
      {/* Badges overlay inside relative container */}
      {isClearance && (
        <span className="absolute top-4 left-4 bg-[#FF6B00] text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md shadow-md z-10 uppercase animate-pulse">
          CLEARANCE
        </span>
      )}
      {isSale && (
        <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md shadow-md z-10 uppercase animate-pulse">
          SALE
        </span>
      )}

      {/* Image container */}
      <div className="w-full h-32 bg-gray-50 rounded mb-2.5 overflow-hidden shrink-0 relative">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80'}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Body content */}
      <div className="flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          {/* Item Category Tag */}
          <span className="text-[9px] font-medium tracking-wider text-gray-400 uppercase bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 inline-block">
            {item.category === 'service' ? 'บริการช่าง' : item.category === 'estimation' ? 'ถอดแบบประเมิน' : 'สินค้าวัสดุ'}
          </span>

          {/* Item Name */}
          <h4 className="text-sm font-extrabold text-black group-hover:text-red-600 transition-colors line-clamp-1">
            {item.name}
          </h4>

          {/* Short Note */}
          {item.note && (
            <p className="text-xs text-gray-500 line-clamp-1 font-light">
              {item.note}
            </p>
          )}
        </div>

        {/* Price Tag Footer */}
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
          <div>
            {item.promoPrice !== undefined ? (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-red-600 font-extrabold text-lg sm:text-xl leading-none animate-pulse flex items-baseline">
                  <span>฿{item.promoPrice.toLocaleString('th-TH')}</span>
                  {item.category === 'product' && item.unit && (
                    <span className="text-xs font-normal text-red-500 ml-0.5">
                      /{item.unit}
                    </span>
                  )}
                </span>
                <span className="text-gray-400/60 text-[11px] font-light line-through flex items-baseline">
                  <span>฿{item.regularPrice.toLocaleString('th-TH')}</span>
                  {item.category === 'product' && item.unit && (
                    <span className="text-[9px] font-light text-gray-400 ml-0.5">
                      /{item.unit}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <span className="text-gray-800 font-bold text-sm leading-none flex items-baseline">
                <span>฿{item.regularPrice.toLocaleString('th-TH')}</span>
                {item.category === 'product' && item.unit && (
                  <span className="text-xs font-normal text-gray-500 ml-0.5">
                    /{item.unit}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.category === 'product' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(item, 1);
                }}
                className="p-1 sm:px-2 py-1 rounded-md bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all shadow-xs active:scale-90 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                title="เพิ่มลงในตะกร้า"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">ใส่ตะกร้า</span>
              </button>
            )}
            <span className="text-[10px] text-red-600 font-semibold group-hover:underline">
              ดูข้อมูล &gt;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
