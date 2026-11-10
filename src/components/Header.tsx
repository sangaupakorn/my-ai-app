/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Construction, Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentPage: 'home' | 'services' | 'products' | 'estimation';
  onNavigate: (page: 'home' | 'services' | 'products' | 'estimation', scrollToReviews?: boolean) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  const handleNavClick = (page: 'home' | 'services' | 'products' | 'estimation', scrollToReviews = false) => {
    onNavigate(page, scrollToReviews);
    setIsOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-white border-b border-gray-150 h-[60px] flex items-center shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-[60px]">
          {/* Logo / Brand */}
          <div 
            id="brand-logo" 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => handleNavClick('home')}
          >
            <img 
              src="https://i.postimg.cc/3R7Qz2kz/d-sin-th-y-ngmi-di-t-ngch-x-(12).png"
              alt="Sukhothai Sangapukan Logo" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-red-500 object-cover shadow-sm shrink-0"
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-red-600 block leading-tight font-sans">
                สุโขทัยแสงอุปกรณ์
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex space-x-6 items-center">
            <button
              id="nav-home"
              onClick={() => handleNavClick('home')}
              className={`px-1 py-1 text-sm font-semibold transition-all cursor-pointer ${
                currentPage === 'home' 
                  ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              หน้าแรก
            </button>
            
            {/* Click "บริการและสินค้า" to navigate to products/services */}
            <button
              id="nav-services-products"
              onClick={() => handleNavClick('products')}
              className={`px-1 py-1 text-sm font-semibold transition-all cursor-pointer ${
                (currentPage === 'products' || currentPage === 'services')
                  ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              บริการและสินค้า
            </button>

            <button
              id="nav-reviews"
              onClick={() => handleNavClick('home', true)}
              className="px-1 py-1 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              งานรีวิว
            </button>

            {/* Shopping Cart Button Desktop */}
            <button
              id="nav-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/80 transition-all cursor-pointer active:scale-95"
              title="เปิดตะกร้าสินค้า"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold">ตะกร้า</span>
              {totalItems > 0 && (
                <span className="bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4.5 text-center leading-tight">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>

          {/* Slogan Desktop */}
          <div className="hidden lg:block text-right">
            <span className="text-sm font-light text-gray-500 italic bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              “เริ่มที่นี่ no worry เรื่องบ้าน”
            </span>
          </div>

          {/* Mobile Right Container (Cart button + Hamburger) */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              id="mobile-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-gray-50"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div id="mobile-nav" className="md:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-2 shadow-inner">
          <button
            id="mob-nav-home"
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium ${
              currentPage === 'home' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            หน้าแรก
          </button>
          <button
            id="mob-nav-products"
            onClick={() => handleNavClick('products')}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium ${
              currentPage === 'products' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            สินค้าและคลังอุปกรณ์
          </button>
          <button
            id="mob-nav-services"
            onClick={() => handleNavClick('services')}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium ${
              currentPage === 'services' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            บริการช่างมืออาชีพ
          </button>
          <button
            id="mob-nav-estimation"
            onClick={() => handleNavClick('estimation')}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium ${
              currentPage === 'estimation' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ถอดแบบประมาณการ
          </button>
          <button
            id="mob-nav-cart"
            onClick={() => {
              setIsCartOpen(true);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-red-600 bg-red-50/70 hover:bg-red-50 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>ตะกร้าสินค้าของฉัน</span>
            </span>
            {totalItems > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems} รายการ
              </span>
            )}
          </button>
          <button
            id="mob-nav-reviews"
            onClick={() => handleNavClick('home', true)}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50"
          >
            งานรีวิว
          </button>
        </div>
      )}
    </header>
  );
}
