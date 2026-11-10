import React, { useState, useEffect, useRef } from 'react';
import { ReviewItem } from '../data';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ReviewImageCarouselProps {
  items: ReviewItem[];
}

export default function ReviewImageCarousel({ items }: ReviewImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const touchStartX = useRef<number | null>(null);

  // Responsive items to show
  const getItemsToShow = (width: number) => {
    if (width >= 1024) return 4; // Desktop
    if (width >= 640) return 3;  // Tablet
    return 1;                    // Mobile
  };

  const itemsToShow = getItemsToShow(windowWidth);
  const maxIndex = Math.max(0, items.length - itemsToShow);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust current index if screen size changes and index becomes out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsToShow, maxIndex, currentIndex]);

  // Auto sliding every 3.5 seconds with auto-pause on hover or touch
  useEffect(() => {
    if (isHovered || items.length === 0 || maxIndex === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // Wrap back to start
        }
        return prev + 1;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, maxIndex, items.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return maxIndex; // Wrap to end
      }
      return prev - 1;
    });
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0; // Wrap to start
      }
      return prev + 1;
    });
  };

  // Touch handlers for swipe gestures and Touch Auto-Pause
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsHovered(true); // Stop auto-slide on touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
      touchStartX.current = null;
    } else if (diff < -50) {
      handlePrev();
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    setIsHovered(false); // Resume auto-slide
  };

  if (items.length === 0) return null;

  return (
    <div 
      className="relative group/carousel w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="review-image-carousel"
    >
      {/* Navigation Arrows */}
      {maxIndex > 0 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-red-600 hover:text-white text-gray-800 rounded-full flex items-center justify-center border border-gray-150 shadow-md transition-all active:scale-95 cursor-pointer md:opacity-0 group-hover/carousel:opacity-100 duration-300"
            aria-label="Previous review slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-red-600 hover:text-white text-gray-800 rounded-full flex items-center justify-center border border-gray-150 shadow-md transition-all active:scale-95 cursor-pointer md:opacity-0 group-hover/carousel:opacity-100 duration-300"
            aria-label="Next review slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Slider Viewport */}
      <div 
        className="overflow-hidden w-full px-1"
        onTouchMove={handleTouchMove}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out -mx-2 sm:-mx-3"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
        >
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className="w-full sm:w-1/3 lg:w-1/4 flex-shrink-0 px-2 sm:px-3"
            >
              {/* Decreased height (h-48 sm:h-60) for vertical space efficiency */}
              <div className="relative h-48 sm:h-60 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-gray-100 group/img bg-gray-50">
                <img
                  src={item.image}
                  alt="Review delivery"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500 group-hover/img:scale-103"
                />
                {/* Ambient Overlay on Hover */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-3">
                  <button
                    onClick={() => setActiveImageUrl(item.image || null)}
                    className="self-center mb-auto mt-auto w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-950 flex items-center justify-center shadow-xs transition-all scale-90 group-hover/img:scale-100 active:scale-95 cursor-pointer"
                  >
                    <Maximize2 className="w-4.5 h-4.5 text-gray-800" />
                  </button>
                  <div className="text-white text-[10px] font-medium bg-black/45 backdrop-blur-xs px-2 py-1 rounded-md text-center truncate">
                    สุโขทัยแสงอุปกรณ์ • ส่งตรงถึงหน้างาน
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NO PAGINATION DOTS (จุดไข่ปลาด้านล่างถูกลบออกตามสั่งอย่างเด็ดขาด) */}

      {/* Lightbox Modal */}
      {activeImageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="absolute top-4 right-4 z-[110]">
            <button
              onClick={() => setActiveImageUrl(null)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div 
            className="absolute inset-0" 
            onClick={() => setActiveImageUrl(null)}
          />
          <div className="relative max-w-4xl max-h-[85vh] z-[105] flex items-center justify-center">
            <img
              src={activeImageUrl}
              alt="High resolution review"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
