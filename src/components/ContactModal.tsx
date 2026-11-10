/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Facebook, MessageCircle, Phone, CalendarCheck } from 'lucide-react';
import { SheetItem } from '../data';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem?: SheetItem;
}

export default function ContactModal({ isOpen, onClose, targetItem }: ContactModalProps) {
  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="contact-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-8 pb-4 sm:p-6 sm:pt-6 bg-black/60 backdrop-blur-xs animate-fade-in overscroll-contain"
      onClick={onClose}
    >
      <div 
        id="contact-modal-content"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100 p-5 sm:p-6 max-h-[85vh] overflow-y-auto overscroll-contain my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="contact-modal-close"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all cursor-pointer shadow-xs"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">ติดต่อจองบริการ / สั่งซื้อสินค้า</h3>
          {targetItem && (
            <p className="text-sm text-gray-500 mt-1 max-w-[320px] line-clamp-2 italic font-medium">
              “{targetItem.name}”
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            เลือกช่องทางที่คุณสะดวกที่สุดเพื่อติดต่อพนักงานผู้ให้บริการของเราได้ทันที
          </p>
        </div>

        {/* Contact Options Buttons */}
        <div className="space-y-3">
          {/* Facebook Option */}
          <a
            id="contact-fb-btn"
            href="https://www.facebook.com/p/%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B8%8B%E0%B8%B5%E0%B8%88%E0%B8%B5-%E0%B9%82%E0%B8%AE%E0%B8%A1-%E0%B9%81%E0%B8%AA%E0%B8%87%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%99%E0%B9%8C-%E0%B8%AA%E0%B8%B8%E0%B9%82%E0%B8%82%E0%B8%97%E0%B8%B1%E0%B8%A2-100064067044139/?locale=th_TH"
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-5 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <div className="flex items-center space-x-3.5">
              <div className="bg-white/10 p-2 rounded-lg">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">ทักแชท Facebook</p>
                <p className="text-xs text-white/80 font-light">สุโขทัยแสงอุปกรณ์</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-light">เปิดแชท</span>
          </a>

          {/* LINE Option */}
          <a
            id="contact-line-btn"
            href="https://lin.ee/vbEDI1N"
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-5 py-4 bg-[#06C755] hover:bg-[#05B04B] text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <div className="flex items-center space-x-3.5">
              <div className="bg-white/10 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">คุยไลน์กับแอดมิน</p>
                <p className="text-xs text-white/80 font-light">LINE ID: @exu1868n</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-light">แอดไลน์</span>
          </a>

          {/* Telephone Option */}
          <a
            id="contact-phone-btn"
            href="tel:055616437"
            className="flex items-center justify-between w-full px-5 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <div className="flex items-center space-x-3.5">
              <div className="bg-white/10 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">โทรด่วนหาเรา</p>
                <p className="text-xs text-white/80 font-light">เบอร์: 055-616437</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-light">โทรออก</span>
          </a>
        </div>

        {/* Note Footer */}
        <div className="text-center mt-5 text-[11px] text-gray-400">
          ยินดีให้บริการและตอบทุกคำปรึกษาเกี่ยวกับบ้าน “เริ่มที่นี่ no worry เรื่องบ้าน”
        </div>
      </div>
    </div>
  );
}
