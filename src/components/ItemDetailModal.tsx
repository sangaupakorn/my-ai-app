/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, ShoppingCart, Tag, ZoomIn, Heart, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import { SheetItem, getDirectImageUrl } from '../data';
import { useCart } from '../context/CartContext';

interface ItemDetailModalProps {
  item: SheetItem | null;
  onClose: () => void;
  onBook: (item: SheetItem) => void;
}

interface NoteNode {
  type: 'root' | 'text' | 'b' | 'i' | 'styled';
  text?: string;
  color?: string;
  bold?: boolean;
  children?: NoteNode[];
}

// Parses formatting from Google Sheets (Bold, color, markdown, font tags, span styles)
function parseFormattedNote(input?: string): NoteNode[] {
  if (!input) return [];

  let text = input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  // Thai named color tags -> [styled color="..."]
  const thaiColors: Record<string, string> = {
    'สีแดง': '#DC2626',
    'สีเขียว': '#16A34A',
    'สีส้ม': '#EA580C',
    'สีน้ำเงิน': '#2563EB',
    'สีฟ้า': '#0284C7',
    'สีเหลือง': '#D97706',
    'สีม่วง': '#9333EA',
    'สีเทา': '#4B5563',
    'สีดำ': '#111827',
  };
  for (const [thName, hex] of Object.entries(thaiColors)) {
    text = text.replace(new RegExp(`\\[${thName}\\]`, 'gi'), `[styled color="${hex}"]`)
               .replace(new RegExp(`\\[\\/${thName}\\]`, 'gi'), '[/styled]');
  }

  // Common bracket color names: [red]...[/red], [orange]...[/orange], etc.
  const commonColors = ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'gray', 'grey', 'black'];
  for (const c of commonColors) {
    text = text.replace(new RegExp(`\\[${c}\\]`, 'gi'), `[styled color="${c}"]`)
               .replace(new RegExp(`\\[\\/${c}\\]`, 'gi'), '[/styled]');
  }

  // BBCode style [color=...] and [color:...]
  text = text.replace(/\[color[=:]\s*["']?([^\]"']+)["']?\]/gi, '[styled color="$1"]')
             .replace(/\[\/color\]/gi, '[/styled]');

  // HTML font color: <font color="..."> -> [styled color="..."]
  text = text.replace(/<font\s+color=["']?([^"'>]+)["']?>/gi, '[styled color="$1"]')
             .replace(/<\/font>/gi, '[/styled]');

  // HTML span style="...color:...; font-weight: bold..."
  text = text.replace(/<span\s+style=["']([^"']+)["']>/gi, (_match, style) => {
    const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
    const boldMatch = style.match(/font-weight\s*:\s*(bold|[6-9]00)/i);
    const color = colorMatch ? colorMatch[1].trim() : '';
    const bold = !!boldMatch;
    return `[styled color="${color}" bold="${bold}"]`;
  });
  text = text.replace(/<\/span>/gi, '[/styled]');

  // HTML b, strong with optional style
  text = text.replace(/<(b|strong)\s+style=["']([^"']+)["']>/gi, (_match, _tag, style) => {
    const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
    const color = colorMatch ? colorMatch[1].trim() : '';
    return `[styled color="${color}" bold="true"]`;
  });
  text = text.replace(/<(b|strong)\s*>/gi, '[b]').replace(/<\/(b|strong)>/gi, '[/b]');
  text = text.replace(/<(i|em)\s*>/gi, '[i]').replace(/<\/(i|em)>/gi, '[/i]');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Markdown bold & italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/gs, '[b][i]$1[/i][/b]');
  text = text.replace(/\*\*(.+?)\*\*/gs, '[b]$1[/b]');
  text = text.replace(/__(.+?)__/gs, '[b]$1[/b]');
  text = text.replace(/(?<!\*)\*(?!\*)([^\*\n]+?)(?<!\*)\*(?!\*)/gs, '[i]$1[/i]');

  const tagRegex = /(\[b\]|\[\/b\]|\[i\]|\[\/i\]|\[styled[^\]]*\]|\[\/styled\])/gi;
  const parts = text.split(tagRegex);

  const root: NoteNode = { type: 'root', children: [] };
  const stack: NoteNode[] = [root];

  for (const part of parts) {
    if (!part) continue;
    const lower = part.toLowerCase();
    if (lower === '[b]') {
      const node: NoteNode = { type: 'b', children: [] };
      stack[stack.length - 1].children?.push(node);
      stack.push(node);
    } else if (lower === '[/b]') {
      if (stack.length > 1 && stack[stack.length - 1].type === 'b') {
        stack.pop();
      }
    } else if (lower === '[i]') {
      const node: NoteNode = { type: 'i', children: [] };
      stack[stack.length - 1].children?.push(node);
      stack.push(node);
    } else if (lower === '[/i]') {
      if (stack.length > 1 && stack[stack.length - 1].type === 'i') {
        stack.pop();
      }
    } else if (lower.startsWith('[styled')) {
      const colorMatch = part.match(/color="([^"]*)"/);
      const boldMatch = part.match(/bold="([^"]*)"/);
      const node: NoteNode = {
        type: 'styled',
        color: colorMatch && colorMatch[1] ? colorMatch[1] : undefined,
        bold: boldMatch ? boldMatch[1] === 'true' : false,
        children: [],
      };
      stack[stack.length - 1].children?.push(node);
      stack.push(node);
    } else if (lower === '[/styled]') {
      if (stack.length > 1 && stack[stack.length - 1].type === 'styled') {
        stack.pop();
      }
    } else {
      stack[stack.length - 1].children?.push({ type: 'text', text: part });
    }
  }

  return root.children || [];
}

function renderNoteNodes(nodes: NoteNode[]): React.ReactNode {
  return nodes.map((node, index) => {
    if (node.type === 'text') {
      return node.text;
    }
    if (node.type === 'b') {
      return (
        <strong key={index} className="font-bold">
          {node.children ? renderNoteNodes(node.children) : null}
        </strong>
      );
    }
    if (node.type === 'i') {
      return (
        <em key={index} className="italic">
          {node.children ? renderNoteNodes(node.children) : null}
        </em>
      );
    }
    if (node.type === 'styled') {
      const style: React.CSSProperties = {};
      if (node.color) style.color = node.color;
      return (
        <span
          key={index}
          style={Object.keys(style).length > 0 ? style : undefined}
          className={node.bold ? 'font-bold' : undefined}
        >
          {node.children ? renderNoteNodes(node.children) : null}
        </span>
      );
    }
    return null;
  });
}

// Automatically styles lines based on position:
// 1) Top line (order / headline) -> Bold
// 2) Bottom line (remarks / price condition) -> Red
// Middle lines -> Normal formatting
function renderAutoStyledNote(noteText?: string): React.ReactNode {
  if (!noteText || noteText.trim() === '') {
    return (
      <span className="text-gray-500 font-light">
        ไม่มีเงื่อนไขเพิ่มเติม ติดต่อเจ้าหน้าที่โดยตรงเพื่อขอข้อมูลการทำงานและรายละเอียดสินค้าเพิ่มเติม
      </span>
    );
  }

  const allLines = noteText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let firstIdx = -1;
  let lastIdx = -1;
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].trim() !== '') {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    }
  }

  if (firstIdx === -1) {
    return (
      <span className="text-gray-500 font-light">
        ไม่มีเงื่อนไขเพิ่มเติม ติดต่อเจ้าหน้าที่โดยตรงเพื่อขอข้อมูลการทำงานและรายละเอียดสินค้าเพิ่มเติม
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      {allLines.map((line, idx) => {
        if (line.trim() === '') {
          return <div key={idx} className="h-1" />;
        }

        const isTopLine = idx === firstIdx;
        const isBottomLine = idx === lastIdx && lastIdx > firstIdx;
        const isSingleLine = firstIdx === lastIdx;

        let lineClassName = 'text-gray-600 font-light';
        if (isTopLine && !isSingleLine) {
          lineClassName = 'font-bold text-gray-900';
        } else if (isBottomLine) {
          lineClassName = 'text-red-600 font-medium';
        } else if (isSingleLine) {
          const lower = line.toLowerCase();
          const isRemarkOrPrice =
            lower.includes('หมายเหตุ') ||
            lower.includes('ราคา') ||
            lower.includes('vat') ||
            lower.includes('ภาษี') ||
            line.trim().startsWith('*');
          lineClassName = isRemarkOrPrice
            ? 'text-red-600 font-medium'
            : 'font-bold text-gray-900';
        }

        return (
          <div key={idx} className={`${lineClassName} break-words leading-relaxed`}>
            {renderNoteNodes(parseFormattedNote(line))}
          </div>
        );
      })}
    </div>
  );
}

export default function ItemDetailModal({ item, onClose, onBook }: ItemDetailModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalQty, setModalQty] = useState(1);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    setActiveImageIndex(0);
    setModalQty(1);
  }, [item?.id]);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (item) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [item]);

  if (!item) return null;

  const images = item.images && item.images.length > 0 ? item.images : [item.image];
  const currentImageUrl = getDirectImageUrl(images[activeImageIndex]);
  const isClearance = item.tabName === 'สินค้าอื่นๆ' && item.status?.toLowerCase().includes('clearance');
  const isSale = item.tabName !== 'สินค้าอื่นๆ' && item.category === 'product' && item.promoPrice !== undefined && item.promoPrice < item.regularPrice;

  // Calculate discount percentage
  const discountPercent = item.promoPrice !== undefined 
    ? Math.round(((item.regularPrice - item.promoPrice) / item.regularPrice) * 100) 
    : 0;

  return (
    <>
      {/* Primary Detail Modal Overlay */}
      <div 
        id="detail-modal-overlay" 
        className="fixed inset-0 z-40 flex items-center justify-center p-3 pt-8 pb-4 sm:p-6 sm:pt-6 bg-black/60 backdrop-blur-xs animate-fade-in overscroll-contain"
        onClick={onClose}
      >
        <div 
          id="detail-modal-content"
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100 max-h-[85vh] sm:max-h-[88vh] flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2.5 py-1 rounded-sm border border-red-100">
                {item.category === 'service' ? 'บริการงานช่าง' : item.category === 'estimation' ? 'ถอดแบบประเมินราคา' : 'วัสดุอุปกรณ์ก่อสร้าง'}
              </span>
            </div>
            <button
              id="detail-modal-close"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all cursor-pointer shadow-xs"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Image Slider with Hover/Zoom click */}
              <div className="space-y-2">
                <div 
                  id="detail-image-trigger"
                  className="relative group aspect-square w-full rounded-xl overflow-hidden border border-gray-100 shadow-xs bg-gray-50"
                >
                  {/* Main Image Click triggers lightbox */}
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-full h-full cursor-zoom-in relative"
                    title="คลิกที่รูปภาพเพื่อดูภาพขนาดใหญ่"
                  >
                    <img
                      src={currentImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80'}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <div className="bg-white/95 px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 text-xs font-semibold text-gray-800 transform scale-95 group-hover:scale-100 transition-all duration-300">
                        <ZoomIn className="w-4 h-4 text-red-600" />
                        <span>ขยายดูรูปภาพจริง ({activeImageIndex + 1}/{images.length})</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows for Carousel */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
                        title="ภาพก่อนหน้า"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
                        title="ภาพถัดไป"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Dot indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/45 backdrop-blur-xs py-1 px-2 rounded-full z-10">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              idx === activeImageIndex ? 'bg-white w-3 scale-110' : 'bg-white/50 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-center text-gray-400 font-light">
                  {images.length > 1 ? '* คลิกปุ่มลูกศรเพื่อเลื่อนดูรูปภาพ หรือคลิกที่รูปเพื่อขยายขนาดใหญ่เต็มจอ' : '* คลิกที่ภาพด้านบนเพื่อซูมและแสดงภาพขนาดใหญ่เต็มจอ'}
                </p>
                {(item.barcode || item.brand) && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 flex-nowrap">
                    {item.barcode && (
                      <span className="inline-flex items-center gap-1 text-xs font-normal text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 shrink-0 whitespace-nowrap">
                        <span className="font-normal text-gray-500">Bar:</span>
                        <span className="font-mono font-normal text-gray-700">{item.barcode}</span>
                      </span>
                    )}
                    {item.brand && (
                      <span className="inline-flex items-center text-xs font-normal text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 shrink-0 uppercase tracking-wide whitespace-nowrap">
                        {item.brand.trim().toUpperCase()}
                      </span>
                    )}
                  </div>
                )}

                {/* Shop Guarantee Badge - Moved below barcode */}
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-gray-50/70 p-2.5 rounded-lg border border-dashed border-gray-200">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                  <span className="leading-snug">ของแท้ 100% สุโขทัยแสงอุปกรณ์ เริ่มที่นี่ no worry เรื่องบ้าน</span>
                </div>
              </div>

              {/* Right Column: Title and Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    {item.name}
                  </h3>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {isClearance && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider bg-[#FF6B00] text-white rounded-md animate-pulse">
                        <Tag className="w-3 h-3" />
                        CLEARANCE
                      </span>
                    )}
                    {isSale && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider bg-red-600 text-white rounded-md animate-pulse">
                        <Tag className="w-3 h-3" />
                        SALE ลดราคาพิเศษ
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" />
                      พร้อมให้บริการ
                    </span>
                  </div>
                </div>

                {/* Price block */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 block mb-1">ราคาให้บริการ / ราคาสินค้า</span>
                  {item.promoPrice !== undefined ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-red-600 animate-pulse flex items-baseline">
                          <span>฿{item.promoPrice.toLocaleString('th-TH')}</span>
                          {item.category === 'product' && item.unit && (
                            <span className="text-sm font-normal text-red-500 ml-1">
                              /{item.unit}
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-400 line-through flex items-baseline">
                          <span>฿{item.regularPrice.toLocaleString('th-TH')}</span>
                          {item.category === 'product' && item.unit && (
                            <span className="text-xs font-light text-gray-400 ml-0.5">
                              /{item.unit}
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-red-700 font-semibold bg-red-50 border border-red-100 rounded px-2 py-0.5 inline-block animate-pulse">
                        ประหยัดทันที ฿{(item.regularPrice - item.promoPrice).toLocaleString('th-TH')} ({discountPercent}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-gray-900 flex items-baseline">
                      <span>฿{item.regularPrice.toLocaleString('th-TH')}</span>
                      {item.category === 'product' && item.unit && (
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          /{item.unit}
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Notes and description */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-800 block">รายละเอียดและเงื่อนไข:</span>
                  <div className="text-xs bg-gray-50 p-3.5 rounded-lg border border-gray-100 break-words h-auto min-h-[auto]">
                    {renderAutoStyledNote(item.note)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="bg-gray-50 border-t border-gray-150 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {item.category === 'product' ? (
              <>
                {/* Quantity Controls */}
                <div className="flex items-center justify-between sm:justify-start border border-gray-250 bg-white rounded-xl p-1 shrink-0">
                  <span className="text-xs font-semibold text-gray-500 px-2 sm:hidden">จำนวน:</span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
                      aria-label="ลดจำนวน"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900">
                      {modalQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalQty((q) => q + 1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
                      aria-label="เพิ่มจำนวน"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  id="detail-modal-add-cart-btn"
                  onClick={() => {
                    addToCart(item, modalQty);
                    onClose();
                    setIsCartOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    เพิ่มลงตะกร้า (฿{(((item.promoPrice !== undefined && item.promoPrice < item.regularPrice ? item.promoPrice : item.regularPrice) * modalQty)).toLocaleString('th-TH')})
                  </span>
                </button>

                {/* Secondary Fast Inquiry Button */}
                <button
                  type="button"
                  onClick={() => {
                    onBook(item);
                    onClose();
                  }}
                  className="px-4 py-3.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  สอบถามทางไลน์ / โทร
                </button>
              </>
            ) : (
              <button
                id="detail-modal-action-btn"
                onClick={() => {
                  onBook(item);
                  onClose();
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-99 ${
                  item.promoPrice !== undefined ? 'animate-pulse' : ''
                }`}
              >
                {item.category === 'service' ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>จองคิวบริการช่างด่วน</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>จองคิวประเมินถอดแบบด่วน</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Lightbox Image Viewer */}
      {isLightboxOpen && (
        <div 
          id="lightbox-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 animate-fade-in cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button in lightbox */}
          <button
            id="lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="ปิดมุมมองขยาย"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main big image */}
          <div className="relative max-w-4xl max-h-[80vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=90'}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />

            {/* Lightbox navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/10"
                  title="ภาพก่อนหน้า"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/10"
                  title="ภาพถัดไป"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Footer title inside lightbox */}
          <div className="text-center text-white mt-4 max-w-2xl px-4">
            <h4 className="text-sm font-semibold tracking-wide">{item.name}</h4>
            <p className="text-xs text-gray-400 mt-1">คลิกที่จุดใดก็ได้บนจอเพื่อย้อนกลับ</p>
          </div>
        </div>
      )}
    </>
  );
}
