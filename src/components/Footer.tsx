/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Facebook, MessageCircle, Phone } from 'lucide-react';

interface FooterProps {
  isHome?: boolean;
}

export default function Footer({ isHome = false }: FooterProps) {
  return (
    <footer 
      id="main-footer" 
      className="bg-[#1A1A1E] text-white py-4 border-t border-neutral-800 shrink-0 font-sans w-full relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Leftmost: Brand and slogan and business hours */}
        <div id="footer-left-info" className="text-sm font-semibold tracking-wide text-white text-center lg:text-left flex flex-col gap-0.5">
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <span>สุโขทัยแสงอุปกรณ์ | เริ่มที่นี่ no worry เรื่องบ้าน</span>
          </div>
          <span className="text-xs text-neutral-400 font-normal">🕒 เปิดบริการทุกวัน 08:00 - 17:00 น.</span>
        </div>

        {/* Center to Right: Contact buttons and mini map */}
        <div id="footer-right-actions" className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          {/* Facebook Button */}
          <a 
            id="footer-fb-btn"
            href="https://www.facebook.com/p/%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B8%8B%E0%B8%B5%E0%B8%88%E0%B8%B5-%E0%B9%82%E0%B8%AE%E0%B8%A1-%E0%B9%81%E0%B8%AA%E0%B8%87%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%99%E0%B9%8C-%E0%B8%AA%E0%B8%B8%E0%B9%82%E0%B8%82%E0%B8%97%E0%B8%B1%E0%B8%A2-100064067044139/?locale=th_TH" 
            target="_blank" 
            referrerPolicy="no-referrer" 
            rel="noreferrer"
            className="flex items-center space-x-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Facebook className="w-4 h-4 shrink-0" />
            <span>เอสซีจี สุโขทัยแสงอุปกรณ์</span>
          </a>

          {/* LINE Button */}
          <a 
            id="footer-line-btn"
            href="https://lin.ee/vbEDI1N" 
            target="_blank" 
            referrerPolicy="no-referrer" 
            rel="noreferrer"
            className="flex items-center space-x-2 bg-[#06C755] hover:bg-[#05B04B] text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>@exu1868n</span>
          </a>

          {/* Phone Button */}
          <a 
            id="footer-phone-btn"
            href="tel:055616437" 
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>โทร: 055-616437</span>
          </a>

          {/* Mini Google Map (Goo.gl link) */}
          <a 
            id="footer-mini-map"
            href="https://goo.gl/maps/9N3tcTqAzsULj4i46"
            target="_blank"
            rel="noreferrer"
            referrerPolicy="no-referrer"
            className="w-20 h-10 rounded-xl overflow-hidden border border-white/20 shadow-sm shrink-0 bg-slate-950 block hover:opacity-90 transition-opacity"
            title="ดูแผนที่ Google Maps"
          >
            <iframe 
              id="footer-google-map-mini"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3810.1581452934447!2d99.81127078965378!3d17.009285236980304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30de31df2ff9f929%3A0xe13c63cb32b21cf5!2z4LmA4Lit4Liq4Li04Li14LiH4LiX4LmI4Liy4LiX4Lij4Lix4LiZ4Lit4Li44Li Rely!5e0!3m2!1sth!2sth!4v1719600000000!5m2!1sth!2sth" 
              width="100%" 
              height="100%" 
              style={{ border: 0, pointerEvents: 'none' }} 
              allowFullScreen={false} 
              loading="lazy"
              title="Mini Map"
            ></iframe>
          </a>
        </div>
      </div>
    </footer>
  );
}
