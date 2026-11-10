import React, { useState, useEffect, useRef } from 'react';
import { PromotionItem, fetchPromotionsData, getDirectImageUrl } from '../data';
import { ChevronLeft, ChevronRight, Calendar, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function PromotionSlider() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromotionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [desktopIdx, setDesktopIdx] = useState(0);

  // Load promotion data
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await fetchPromotionsData();
        setPromotions(data);
      } catch (err) {
        console.error('Error loading promotions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPromotions();
  }, []);

  // Desktop Vertical Auto slide every 3.5 seconds
  useEffect(() => {
    if (isHovered || promotions.length <= 1) return;

    const timer = setInterval(() => {
      setDesktopIdx((prev) => (prev + 1) % promotions.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, promotions.length]);

  if (loading) {
    return (
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-[40px] mt-4 mb-10">
        <div className="rounded-[12px] shadow-md p-4 sm:p-6 lg:py-4 lg:px-8 border border-[#D0DDEB] bg-[#F0F4F8]">
          <div className="text-center space-y-2 mb-6">
            <div className="h-7 w-48 bg-gray-200 rounded-md mx-auto animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded-md mx-auto animate-pulse" />
          </div>
          
          {/* Mobile loading row */}
          <div className="flex lg:hidden gap-2 overflow-x-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className="w-[calc((100%-16px)/3.5)] shrink-0 aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>

          {/* Desktop loading block */}
          <div className="hidden lg:block w-full max-w-[960px] h-[250px] mx-auto bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (promotions.length === 0) return null;

  return (
    <section 
      id="promotion-banner-section" 
      className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-[40px] mt-4 mb-10"
    >
      <div className="rounded-[12px] shadow-md p-4 sm:p-6 lg:py-4 lg:px-8 border border-[#D0DDEB] bg-[#F0F4F8]">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: '#004B93' }}>📢 โปรโมชั่น ประจำเดือน ✨</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">*คลิกที่รูปภาพโปรโมชั่นเพื่อเปิดดูรายละเอียดและเงื่อนไข</p>
        </div>

        {/* 1. Desktop View: Vertical Autoplay Slider with right-side Pagination dots */}
        <div className="hidden lg:block">
          <div 
            className="relative w-full max-w-[960px] h-[250px] mx-auto overflow-hidden rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all duration-300 bg-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Slides container */}
            <div className="absolute inset-0 w-full h-full">
              {promotions.map((promo, idx) => {
                const firstImage = promo.coverImage || (promo.image.split(',')[0] ? getDirectImageUrl(promo.image.split(',')[0].trim()) : promo.image);

                let transformClass = 'translate-y-full opacity-0';
                if (idx === desktopIdx) {
                  transformClass = 'translate-y-0 opacity-100 z-10';
                } else if (idx < desktopIdx) {
                  transformClass = '-translate-y-full opacity-0 z-0';
                }

                return (
                  <div
                    key={promo.id || idx}
                    onClick={() => setSelectedPromo(promo)}
                    className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out cursor-pointer ${transformClass}`}
                  >
                    <img
                      src={firstImage}
                      alt={promo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center pointer-events-none select-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Vertical Pagination Dots on the right of the image card */}
            {promotions.length > 1 && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 bg-black/45 backdrop-blur-md px-1.5 py-3 rounded-full">
                {promotions.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesktopIdx(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === desktopIdx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Mobile View: Horizontal Touch Swipe Slider (exactly 3.5 items visible) */}
        <div className="block lg:hidden">
          <div 
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-1"
            style={{ scrollBehavior: 'smooth' }}
          >
            {promotions.map((promo, idx) => {
              const firstImage = promo.coverImage || (promo.image.split(',')[0] ? getDirectImageUrl(promo.image.split(',')[0].trim()) : promo.image);

              return (
                <div
                  key={promo.id || idx}
                  onClick={() => setSelectedPromo(promo)}
                  className="w-[calc((100%-16px)/3.5)] shrink-0 snap-start cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                    <img
                      src={firstImage}
                      alt={promo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center pointer-events-none select-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Detail Popup Modal with Inner Carousel support */}
      {selectedPromo && (
        <PopupModal 
          promo={selectedPromo} 
          onClose={() => setSelectedPromo(null)} 
        />
      )}
    </section>
  );
}

// Separate component for the Popup Modal to cleanly reset slide state on promotion switch
function PopupModal({ promo, onClose }: { promo: PromotionItem; onClose: () => void }) {
  const images = promo.image.split(',').map(url => url.trim()).filter(Boolean).map(url => getDirectImageUrl(url));
  const [imgIdx, setImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev + 1) % images.length);
  };

  const activeImageUrl = images[imgIdx] || promo.image;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 pt-8 pb-4 sm:p-6 overscroll-contain"
      id="promotion-popup"
    >
      {/* Overlay click to close */}
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={onClose}
      />

      {/* Modal Container: split into left (image slider) and right (texts) */}
      <div 
        className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full border border-gray-150 shadow-2xl z-10 flex flex-col md:flex-row max-h-[85vh] sm:max-h-[90vh] md:h-[520px] animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X in upper right corner) */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 bg-black/75 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer border border-white/10"
          aria-label="ปิดหน้าต่างโปรโมชั่น"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SIDE: Image display with optional inner slider */}
        <div 
          onClick={() => setIsZoomed(true)}
          className="w-full md:w-1/2 h-52 md:h-full relative overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center cursor-zoom-in group select-none"
          title="คลิกเพื่อขยายรูปภาพ"
        >
          <img
            src={activeImageUrl}
            alt={promo.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Hover zoom glass indicator */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>คลิกเพื่อขยายรูปภาพ</span>
            </div>
          </div>

          {/* Inner Carousel navigation controls (If there is more than 1 image) */}
          {images.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                onClick={handlePrevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200/50 transition-all active:scale-90 cursor-pointer"
                aria-label="รูปภาพก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200/50 transition-all active:scale-90 cursor-pointer"
                aria-label="รูปภาพถัดไป"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Image index indicator / progress badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-semibold z-20">
                {imgIdx + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE: Details & Content */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col min-h-0 overflow-hidden font-sans">
          <div className="flex flex-col h-full space-y-4">
            
            {/* 1) ชื่อโปรโมชั่น (คอลัมน์ D) - Large, bold, premium dark title */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#222222] leading-tight">
              {promo.title}
            </h3>

            {/* 2) ระยะเวลาโปรโมชั่น (คอลัมน์ A) - Tag with white bg, red text, and red outline */}
            <div className="inline-flex items-center space-x-1.5 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold self-start shadow-xs select-none">
              <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>🕒 {promo.period || 'จำกัดระยะเวลา'}</span>
            </div>

            {/* 3) รายละเอียดเงื่อนไข (คอลัมน์ B) - Takes as much space as possible */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block shrink-0">
                เงื่อนไขและรายละเอียดกิจกรรม:
              </span>
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin text-gray-700 text-xs sm:text-sm font-light leading-relaxed space-y-2 pb-4">
                {promo.details ? (
                  promo.details.split('\n').map((line, idx) => (
                    <p key={idx} className="border-l-2 border-red-500 pl-3 py-0.5">
                      {line.trim()}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-400 italic font-light">ไม่มีรายละเอียดเงื่อนไขเพิ่มเติม กรุณาติดต่อสอบถามหน้าร้านโดยตรงค่ะ</p>
                )}
              </div>
            </div>

            {/* Pure visual footer decoration - No external links or buttons */}
            <div className="pt-3 border-t border-gray-100 text-center shrink-0">
              <p className="text-[10px] text-gray-400 font-medium">
                สอบถามข้อมูลเพิ่มเติมได้โดยตรงที่จุดบริการ สุโขทัยแสงอุปกรณ์
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox zoom wrapper */}
      {isZoomed && (
        <ImageLightbox 
          imageUrl={activeImageUrl} 
          altText={promo.title} 
          onClose={() => setIsZoomed(false)} 
        />
      )}
    </div>
  );
}

// Full-screen Image Lightbox with Pinch to Zoom and Mouse Drag support
function ImageLightbox({ imageUrl, altText, onClose }: { imageUrl: string; altText: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const touchStartRef = useRef<{ dist: number; scale: number; x: number; y: number } | null>(null);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomIntensity * 0.05, 1), 4);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRef.current = {
        dist: distance,
        scale: scale,
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = distance / touchStartRef.current.dist;
      const newScale = Math.min(Math.max(touchStartRef.current.scale * factor, 1), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current = null;
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center select-none"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[130] text-white pointer-events-none">
        <div className="text-xs sm:text-sm font-light text-gray-300 drop-shadow-sm select-none">
          {scale > 1 ? `ซูมเข้า ${Math.round(scale * 100)}% (เลื่อนรูปเพื่อดูรายละเอียด)` : 'แตะกางนิ้วเพื่อซูมรูปภาพ'}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScale(prev => {
                const s = Math.max(prev - 0.5, 1);
                if (s === 1) setPosition({ x: 0, y: 0 });
                return s;
              });
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 cursor-pointer border border-white/5 shadow-md"
            title="ซูมออก"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScale(prev => Math.min(prev + 0.5, 4));
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 cursor-pointer border border-white/5 shadow-md"
            title="ซูมเข้า"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {scale > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="px-3 h-9 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 cursor-pointer border border-white/5 shadow-md"
            >
              รีเซ็ต
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer border border-white/10"
            aria-label="ปิดรูปขยาย"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="transition-transform duration-75 ease-out select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? 'grab' : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={imageUrl}
            alt={altText}
            referrerPolicy="no-referrer"
            className="max-w-[95vw] max-h-[85vh] object-contain pointer-events-none select-none rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
