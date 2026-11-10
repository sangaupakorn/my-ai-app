/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Construction, 
  ShoppingBag, 
  FileSpreadsheet, 
  Search, 
  Star, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Award,
  User,
  UploadCloud,
  CheckCircle,
  FileText,
  Send,
  MapPin,
  Phone
} from 'lucide-react';

import { SheetItem, ReviewItem, fetchSheetData, fetchServicesData, fetchReviewsData, GOOGLE_SHEET_URL, PRODUCT_TABS, SERVICE_TABS } from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import ContactModal from './components/ContactModal';
import ReviewImageCarousel from './components/ReviewImageCarousel';
import PromotionSlider from './components/PromotionSlider';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import FloatingCartButton from './components/FloatingCartButton';
import CartToast from './components/CartToast';
import { getAppsScriptUrl } from './utils/appsScript';

function getCategoryIcon(tabName: string, active: boolean = false) {
  const strokeColor = 'currentColor';
  const colorClass = active ? 'text-red-600 font-bold' : 'text-gray-500';
  const sizeClass = `w-4 h-4 shrink-0 transition-all ${colorClass}`;
  
  switch (tabName) {
    case 'ทั้งหมด':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      );
    case 'หลังคาและอุปกรณ์':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M2 20h20" />
          <path d="M5 17V11.5L12 5l7 6.5V17" />
          <path d="M9 17v-4h6v4" />
        </svg>
      );
    case 'กระเบื้องพื้น':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      );
    case 'สุขภัณฑ์ อ่างล้างหน้า':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M7 21h10" />
          <path d="M12 21v-4" />
          <path d="M5 6h14v6a7 7 0 0 1-14 0V6Z" />
          <path d="M3 2h18v2H3z" />
        </svg>
      );
    case 'เครื่องมือช่าง':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'เครื่องมือไฟฟ้า':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'ฮาร์ดแวร์':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      );
    case 'อุปกรณ์ความปลอดภัย':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'ประปา':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case 'ไฟฟ้าแสงสว่าง':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      );
    case 'อุปกรณ์ห้องน้ำ':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M12 2v3" />
          <path d="M12 5a7 7 0 0 1 7 7H5a7 7 0 0 1 7-7z" />
          <path d="M7 16v1" />
          <path d="M12 16v2" />
          <path d="M17 16v1" />
        </svg>
      );
    case 'สีและอุปกรณ์':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <circle cx="7.5" cy="10.5" r="1.5" />
          <circle cx="11.5" cy="7.5" r="1.5" />
          <circle cx="16.5" cy="9.5" r="1.5" />
          <path d="M6 14c0-2 2-3 4-3 2.5 0 3 1.5 4.5 1.5s2.5-.5 3.5-1.5c.5.5.5 1.5 0 2.5C16 16.5 13.5 18 12 18c-3 0-6-1.5-6-4z" />
        </svg>
      );
    case 'เคมีภัณฑ์':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M6 3h12" />
          <path d="M9 3v6L4 18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L15 9V3" />
          <path d="M6 14h12" />
        </svg>
      );
    case 'ประตู หน้าต่าง':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 12h18" />
          <path d="M12 3v18" />
        </svg>
      );
    case 'พื้น ผนังและฝ้า':
    case 'พื้น ผนัง และฝ้า':
    case 'ผนังและฝ้า':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M3 5h18" />
          <path d="M3 10h18" />
          <path d="M3 15h18" />
          <path d="M3 20h18" />
        </svg>
      );
    case 'เหล็ก ปูน':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18H4z" />
          <path d="M12 2v20" />
          <path d="M4 12h16" />
        </svg>
      );
    case 'อุปกรณ์ทำสวน':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M12 22V12" />
          <path d="M12 12c0-2.8 2.2-5 5-5h3" />
          <path d="M12 15c0-3.3-2.7-6-6-6H3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={sizeClass}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
  }
}

function getCategoryDropdownPrefix(tabName: string): string {
  switch (tabName) {
    case 'ทั้งหมด':
      return '⧉';
    case 'หลังคาและอุปกรณ์':
      return '⌂';
    case 'กระเบื้องพื้น':
      return '▩';
    case 'สุขภัณฑ์ อ่างล้างหน้า':
      return '🛁';
    case 'เครื่องมือช่าง':
      return '🔧';
    case 'เครื่องมือไฟฟ้า':
      return '⚡';
    case 'ฮาร์ดแวร์':
      return '⚙';
    case 'อุปกรณ์ความปลอดภัย':
      return '🛡';
    case 'ประปา':
      return '💧';
    case 'ไฟฟ้าแสงสว่าง':
      return '💡';
    case 'อุปกรณ์ห้องน้ำ':
      return '🚿';
    case 'สีและอุปกรณ์':
      return '🎨';
    case 'เคมีภัณฑ์':
      return '⚗';
    case 'ประตู หน้าต่าง':
      return '🚪';
    case 'พื้น ผนังและฝ้า':
    case 'พื้น ผนัง และฝ้า':
    case 'ผนังและฝ้า':
      return '🪵';
    case 'เหล็ก ปูน':
      return '🏗';
    case 'อุปกรณ์ทำสวน':
      return '🌱';
    default:
      return '📦';
  }
}

function getItemBrand(item: SheetItem): string {
  if (item.brand && item.brand.trim() !== '') {
    const b = item.brand.trim();
    const bLower = b.toLowerCase();
    if (bLower === 'scg' || b === 'เอสซีจี') return 'SCG';
    if (b === 'ตราช้าง' || b === 'ช้าง') return 'ตราช้าง';
    if (bLower === 'toa' || b === 'ทีโอเอ') return 'TOA';
    if (bLower === 'cotto' || b === 'คอตโต้') return 'COTTO';
    if (b === 'ตราเสือ' || bLower === 'tiger' || b === 'เสือ') return 'ตราเสือ';
    return b;
  }
  
  // Fallback to text matching for backwards compatibility
  const textToSearch = `${item.name} ${item.note || ''}`.toLowerCase();
  if (textToSearch.includes('scg') || textToSearch.includes('เอสซีจี')) return 'SCG';
  if (textToSearch.includes('ตราช้าง') || textToSearch.includes('ช้าง')) return 'ตราช้าง';
  if (textToSearch.includes('toa') || textToSearch.includes('ทีโอเอ')) return 'TOA';
  if (textToSearch.includes('cotto') || textToSearch.includes('คอตโต้')) return 'COTTO';
  if (textToSearch.includes('เสือ') || textToSearch.includes('tiger')) return 'ตราเสือ';
  
  return 'แบรนด์อื่นๆ';
}

function getSubCategoryHeading(tab: string): string {
  let cleanTab = tab;
  if (cleanTab.endsWith('และอุปกรณ์')) {
    cleanTab = cleanTab.replace('และอุปกรณ์', '');
  }
  return `แยกย่อย${cleanTab}:`;
}

function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | string)[] = [];

  if (current <= 3) {
    for (let i = 1; i <= Math.min(3, total - 1); i++) {
      range.push(i);
    }
    if (total > 3) {
      range.push('...');
      range.push(total);
    }
  } else if (current >= total - 2) {
    range.push(1);
    range.push('...');
    for (let i = total - 2; i <= total; i++) {
      range.push(i);
    }
  } else {
    range.push(1);
    range.push('...');
    range.push(current - 1);
    range.push(current);
    range.push(current + 1);
    range.push('...');
    range.push(total);
  }

  return range;
}

export default function App() {
  // Page Routing State: 'home' | 'services' | 'products' | 'estimation'
  const [currentPage, setCurrentPage] = useState<'home' | 'services' | 'products' | 'estimation'>('home');
  
  // Data Catalog States
  const [catalog, setCatalog] = useState<SheetItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('sukhothai_dynamic_reviews');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Selection & Modal States
  const [selectedItem, setSelectedItem] = useState<SheetItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [contactTarget, setContactTarget] = useState<SheetItem | undefined>(undefined);

  // Estimation Form States
  const [estName, setEstName] = useState<string>('');
  const [estPhone, setEstPhone] = useState<string>('');
  const [estAddress, setEstAddress] = useState<string>('');
  const [estOnlineContact, setEstOnlineContact] = useState<string>('');
  const [estFile, setEstFile] = useState<File | null>(null);
  const [estDriveLink, setEstDriveLink] = useState<string>('');
  const [isEstSuccessOpen, setIsEstSuccessOpen] = useState<boolean>(false);
  const [submittingEst, setSubmittingEst] = useState<boolean>(false);
  const [isEstimationContactOpen, setIsEstimationContactOpen] = useState<boolean>(false);

  // Search & Filtering States (for Products page)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productFilter, setProductFilter] = useState<'all' | 'clearance' | 'sale'>('all');
  const [selectedProductTab, setSelectedProductTab] = useState<string>('ทั้งหมด');
  const [selectedRoofSub, setSelectedRoofSub] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('ทั้งหมด');
  const [selectedServiceTab, setSelectedServiceTab] = useState<string>('ทั้งหมด');
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');

  // Pagination State (for Products page)
  const [productPage, setProductPage] = useState<number>(1);
  const itemsPerPage = 24;

  // Review Form States
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewLocation, setReviewLocation] = useState<string>('');
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('กรุณากรอกชื่อและข้อความแสดงความคิดเห็นด้วยค่ะ');
      return;
    }
    const newReview: ReviewItem = {
      id: `dynamic-review-${Date.now()}`,
      name: reviewName,
      comment: reviewComment,
      rating: reviewRating,
      location: reviewLocation.trim() ? reviewLocation : 'สุโขทัย',
    };
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem('sukhothai_dynamic_reviews', JSON.stringify(updatedReviews));
    
    // Clear form
    setReviewName('');
    setReviewComment('');
    setReviewLocation('');
    setReviewRating(5);
  };

  // Ref to scroll to Testimonials
  const reviewsRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const [shouldScrollToReviews, setShouldScrollToReviews] = useState<boolean>(false);

  // Load catalog on mount
  useEffect(() => {
    loadData();
  }, []);

  // Real-time synchronization for services page:
  // Whenever user is on services page or navigates to it, fetch fresh live data from Google Sheets
  useEffect(() => {
    if (currentPage !== 'services') return;

    const syncServicesRealtime = () => {
      fetchServicesData(true).then((liveServices) => {
        if (liveServices && liveServices.length > 0) {
          setCatalog(prev => {
            const nonServices = prev.filter(it => it.category !== 'service');
            return [...liveServices, ...nonServices];
          });
        }
      }).catch(err => {
        console.warn('Real-time service sync error:', err);
      });
    };

    // Immediate sync upon viewing services page
    syncServicesRealtime();

    // Periodic live sync every 25 seconds while on services page
    const interval = setInterval(syncServicesRealtime, 25000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSheetData(false);
      setCatalog(data);
      
      try {
        const sheetReviews = await fetchReviewsData(false);
        const saved = localStorage.getItem('sukhothai_dynamic_reviews');
        const localReviews: ReviewItem[] = saved ? JSON.parse(saved) : [];
        const combinedReviews = [...sheetReviews];
        localReviews.forEach(lr => {
          if (!combinedReviews.some(r => r.id === lr.id || r.comment === lr.comment)) {
            combinedReviews.push(lr);
          }
        });
        setReviews(combinedReviews);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchSheetData(true);
      setCatalog(data);
      
      try {
        const sheetReviews = await fetchReviewsData(true);
        const saved = localStorage.getItem('sukhothai_dynamic_reviews');
        const localReviews: ReviewItem[] = saved ? JSON.parse(saved) : [];
        const combinedReviews = [...sheetReviews];
        localReviews.forEach(lr => {
          if (!combinedReviews.some(r => r.id === lr.id || r.comment === lr.comment)) {
            combinedReviews.push(lr);
          }
        });
        setReviews(combinedReviews);
      } catch (err) {
        console.error("Failed to refresh reviews:", err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle Navbar navigation
  const handleNavigate = (page: 'home' | 'services' | 'products' | 'estimation', scrollToReviews = false, isBack = false) => {
    // Record current scroll position
    scrollPositions.current[currentPage] = window.scrollY;

    setCurrentPage(page);
    
    // Restore previous scroll position if going back, otherwise scroll to top
    const targetScroll = isBack ? (scrollPositions.current[page] || 0) : 0;
    setTimeout(() => {
      window.scrollTo({
        top: targetScroll,
        behavior: isBack ? 'instant' as any : 'smooth'
      });
    }, 50);
    
    if (scrollToReviews) {
      if (page === 'home') {
        // If already on home, scroll directly
        setTimeout(() => {
          reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        // If on other page, trigger scroll after routing back to home
        setShouldScrollToReviews(true);
        setCurrentPage('home');
      }
    }
  };

  // Listen for redirection to home to scroll to reviews
  useEffect(() => {
    if (currentPage === 'home' && shouldScrollToReviews) {
      setShouldScrollToReviews(false);
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [currentPage, shouldScrollToReviews]);

  // Lock background body scroll when estimation modals are open
  useEffect(() => {
    if (isEstimationContactOpen || isEstSuccessOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [isEstimationContactOpen, isEstSuccessOpen]);

  // Open direct contact modal
  const handleOpenContact = (item?: SheetItem) => {
    setContactTarget(item);
    setIsContactOpen(true);
  };

  // Handle estimation form submission
  const handleEstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estName || !estPhone || !estAddress) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนด้วยค่ะ');
      return;
    }
    
    setSubmittingEst(true);
    
    try {
      let fileData = "";
      let fileName = "";
      let fileType = "";
      
      if (estFile) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(estFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
          });
          fileData = base64;
          fileName = estFile.name;
          fileType = estFile.type;
        } catch (err) {
          console.error("Error reading file:", err);
        }
      }
      
      const payload = {
        name: estName,
        phone: estPhone,
        onlineContact: estOnlineContact,
        address: estAddress,
        driveLink: estDriveLink,
        fileData: fileData,
        fileName: fileName,
        fileType: fileType
      };
      
      const appsScriptUrl = getAppsScriptUrl();
      
      if (appsScriptUrl) {
        // Send actual fetch post to the Google Apps Script Web App
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // standard for Apps Script Web App redirection
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log("Form successfully submitted to Google Apps Script Web App");
      } else {
        // Log to console if no endpoint configured, and keep a backup in localStorage
        console.warn("VITE_APPS_SCRIPT_URL is not configured. Saving submission to local history as backup.");
        const pendingSubmissions = JSON.parse(localStorage.getItem('pending_estimations') || '[]');
        pendingSubmissions.push({
          ...payload,
          fileData: payload.fileData ? `[Base64 Data Omitted - size: ${payload.fileData.length} chars]` : "",
          id: `local-est-${Date.now()}`,
          submittedAt: new Date().toLocaleString()
        });
        localStorage.setItem('pending_estimations', JSON.stringify(pendingSubmissions));
      }
      
      setSubmittingEst(false);
      setIsEstSuccessOpen(true);
    } catch (error) {
      console.error("Failed to submit estimation request:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบฐานข้อมูล กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่โดยตรงค่ะ");
      setSubmittingEst(false);
    }
  };

  const resetEstForm = () => {
    setEstName('');
    setEstPhone('');
    setEstAddress('');
    setEstOnlineContact('');
    setEstFile(null);
    setEstDriveLink('');
    setIsEstSuccessOpen(false);
  };

  // Filter items based on Category
  const services = catalog.filter(item => item.category === 'service');
  const products = catalog.filter(item => item.category === 'product');
  const estimations = catalog.filter(item => item.category === 'estimation');

  // Dynamic service sub-categories derived from actual retrieved services
  const dynamicServiceTabs = React.useMemo(() => {
    const tabsSet = new Set<string>();
    services.forEach(item => {
      if (item.tabName && item.tabName.trim() !== '') {
        tabsSet.add(item.tabName.trim());
      }
    });
    return Array.from(tabsSet);
  }, [services]);

  // Get available subcategories for the currently selected category (except "สินค้าอื่นๆ" and "ทั้งหมด")
  const currentSubCategories = React.useMemo(() => {
    if (selectedProductTab === 'ทั้งหมด' || selectedProductTab === 'สินค้าอื่นๆ') {
      return [];
    }
    // Filter products of this tab that have a non-empty subCategory
    const tabProducts = products.filter(item => item.tabName === selectedProductTab);
    const subs = tabProducts
      .map(item => item.subCategory)
      .filter((sub): sub is string => !!sub && sub.trim() !== '');
    return Array.from(new Set(subs)).sort();
  }, [products, selectedProductTab]);

  // Clearance products only (Section 3 of Home Page)
  // MUST only pull products (not services!) and status is clearance in "สินค้าอื่นๆ"
  const clearanceProducts = products.filter(item => item.tabName === 'สินค้าอื่นๆ' && item.status?.toLowerCase().includes('clearance'));

  // Reset page, roof subcategory & brand filter when selected tab changes
  useEffect(() => {
    setSelectedRoofSub('all');
    setSelectedBrand('ทั้งหมด');
    setProductPage(1);
  }, [selectedProductTab]);

  // Reset brand filter to 'ทั้งหมด' if the selected brand is not available in the selected subcategory
  useEffect(() => {
    if (selectedBrand !== 'ทั้งหมด') {
      const baseProds = selectedProductTab === 'ทั้งหมด' 
        ? products 
        : products.filter(item => item.tabName === selectedProductTab);
      
      const filteredBySub = (selectedProductTab !== 'ทั้งหมด' && selectedProductTab !== 'สินค้าอื่นๆ' && selectedRoofSub !== 'all')
        ? baseProds.filter(item => item.subCategory === selectedRoofSub)
        : baseProds;
      
      const availableBrands = new Set(filteredBySub.map(getItemBrand));
      if (!availableBrands.has(selectedBrand)) {
        setSelectedBrand('ทั้งหมด');
      }
    }
  }, [selectedRoofSub, selectedProductTab, products, selectedBrand]);

  // Search, Tab, Brand & Tag Filtered Products
  const filteredProducts = products.filter(item => {
    // 1. Filter by selected tab (if not 'ทั้งหมด')
    if (selectedProductTab !== 'ทั้งหมด' && item.tabName !== selectedProductTab) {
      return false;
    }

    // 2. Filter by sub-classification
    if (selectedProductTab !== 'ทั้งหมด' && selectedProductTab !== 'สินค้าอื่นๆ' && selectedRoofSub !== 'all') {
      if (item.subCategory !== selectedRoofSub) {
        return false;
      }
    }

    // 3. Filter by brand
    if (selectedBrand !== 'ทั้งหมด') {
      if (getItemBrand(item) !== selectedBrand) {
        return false;
      }
    }

    // 4. Search query filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // 5. Promo/Clearance status filter
    if (productFilter === 'clearance') {
      return item.tabName === 'สินค้าอื่นๆ' && item.status?.toLowerCase().includes('clearance');
    }
    if (productFilter === 'sale') {
      const isSale = item.tabName !== 'สินค้าอื่นๆ' && 
                     item.category === 'product' && 
                     item.promoPrice !== undefined && 
                     item.promoPrice < item.regularPrice;
      return isSale;
    }
    return true;
  });

  // Filtered Services based on sub-category tab selection & Real-time Search query
  const filteredServices = services.filter(item => {
    // 1. Filter by service sub-category
    if (selectedServiceTab !== 'ทั้งหมด' && item.tabName !== selectedServiceTab) {
      return false;
    }
    // 2. Filter by service search query (Real-time) on Column C (name)
    if (serviceSearchQuery.trim() !== '') {
      const matchesSearch = item.name.toLowerCase().includes(serviceSearchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const startIndex = (productPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter, search, subcategory, or brand changes to prevent blank page
  useEffect(() => {
    setProductPage(1);
  }, [searchQuery, productFilter, selectedRoofSub, selectedBrand]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header */}
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* -------------------- HOME PAGE VIEW -------------------- */}
            {currentPage === 'home' && (
              <div id="home-view" className="animate-fade-in space-y-16 pb-32">
                
                 {/* SECTION 1: HERO SECTION */}
                 <section id="hero-section" className="relative overflow-hidden border-b border-red-950 text-white py-16 md:py-28 shrink-0 min-h-[500px] flex items-center">
                   {/* Full-width Background Image */}
                   <img 
                     src="https://i.postimg.cc/wvB0tBZc/Chat-GPT-Image-29-m-kh-2569-15-44-09-copy.png"
                     alt="สุโขทัยแสงอุปกรณ์ Hero Background"
                     referrerPolicy="no-referrer"
                     className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                   />
                   {/* Dark Vignette Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-black/75 to-black/50 z-0"></div>
                   
                   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                     <div className="max-w-xl bg-black/60 backdrop-blur-md p-6 sm:p-10 rounded-2xl border border-white/10 shadow-2xl space-y-6 mx-auto lg:ml-auto lg:mr-0 text-center lg:text-left font-sans">
                       
                       {/* Authorized Dealer Badge */}
                       <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase shadow-md border border-red-500/50">
                         <Award className="w-4 h-4 text-white shrink-0" />
                         <span>เราคือตัวแทนจำหน่ายอย่างเป็นทางการ SCG Authorized Dealer</span>
                       </div>

                       <div className="space-y-4">
                         <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                           สุโขทัยแสงอุปกรณ์
                         </h1>
                         <p className="text-xl sm:text-2xl font-light text-red-100 drop-shadow-sm">
                           “เริ่มที่นี่ no worry เรื่องบ้าน”
                         </p>
                       </div>

                       <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-light">
                         บริการงานช่างระดับมืออาชีพ คลังวัสดุก่อสร้างครบวงจร และบริการออกแบบประเมินราคาถอดแบบ BOQ ด้วยราคาที่เป็นธรรม ได้รับการไว้วางใจจากชาวสุโขทัยมาอย่างยาวนาน
                       </p>

                       <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2 text-xs font-medium">
                         <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-white/15 text-white shadow-xs">
                           <ShieldCheck className="w-4 h-4 text-red-500" />
                           <span>ของแท้แบรนด์ดัง 100%</span>
                         </span>
                         <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-white/15 text-white shadow-xs">
                           <Clock className="w-4 h-4 text-red-500" />
                           <span>เปิดบริการทุกวัน 08:00-17:00 น.</span>
                         </span>
                       </div>
                     </div>
                   </div>
                 </section>


                {/* PROMOTION SLIDER */}
                <PromotionSlider />

                {/* SECTION 2: THREE LARGE HORIZONTAL CATEGORY MENU CARDS */}
                <section id="categories-menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">เลือกบริการที่ตอบโจทย์คุณ</h2>
                    <p className="text-xs text-gray-400 font-light">เริ่มต้นสร้าง ดูแล หรือถอดแบบประมาณการเรื่องบ้านกับเราได้ทันที</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category 1: บริการช่าง */}
                    <div
                      id="cat-card-services"
                      onClick={() => handleNavigate('services')}
                      className="group bg-blue-50/30 border-2 border-blue-100 rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.04] hover:shadow-lg hover:border-blue-500 hover:bg-white transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300 shrink-0">
                        <Construction className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-blue-950 text-base sm:text-lg group-hover:text-blue-600 transition-colors">บริการช่าง</h3>
                        <p className="text-xs text-blue-800/70 font-light leading-snug">ติดตั้ง ดูแล ครบวงจร โดยทีมช่างผู้เชี่ยวชาญมืออาชีพ</p>
                      </div>
                    </div>

                    {/* Category 2: สินค้าและอุปกรณ์ */}
                    <div
                      id="cat-card-products"
                      onClick={() => handleNavigate('products')}
                      className="group bg-red-50/20 border-2 border-red-100/60 rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.04] hover:shadow-lg hover:border-red-600 hover:bg-white transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-red-600 text-white flex items-center justify-center ring-4 ring-red-100/80 shadow-sm group-hover:bg-red-700 transition-all duration-300 shrink-0">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-red-950 text-base sm:text-lg group-hover:text-red-600 transition-colors">สินค้าและอุปกรณ์</h3>
                        <p className="text-xs text-red-800/70 font-light leading-snug">วัสดุก่อสร้างพรีเมียม สั่งตรงจาก SCG แบรนด์แท้ 100%</p>
                      </div>
                    </div>

                    {/* Category 3: ถอดแบบประมาณการ */}
                    <div
                      id="cat-card-estimation"
                      onClick={() => handleNavigate('estimation')}
                      className="group bg-stone-50 border-2 border-stone-200 rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.04] hover:shadow-lg hover:border-amber-600 hover:bg-stone-900 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:bg-amber-500 transition-colors duration-300 shrink-0">
                        <FileSpreadsheet className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-white transition-colors">ถอดแบบประมาณการ</h3>
                        <p className="text-xs text-stone-500 group-hover:text-stone-300 font-light leading-snug">คุมงบประมาณแม่นยำด้วยรายงาน BOQ วิศวกรรมมาตรฐาน</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 3: CLEARANCE PRODUCTS */}
                <section id="clearance-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-orange-500/40 p-6 sm:p-8 shadow-[0_20px_40px_rgba(255,107,0,0.15)] relative overflow-hidden">
                    {/* Corner decorative light effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 relative z-10">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
                          สินค้า ลดราคา สินค้า Clearance ด่วน!
                        </h2>
                        <p className="text-xs sm:text-sm text-red-700 font-light">
                          * เฉพาะหมวดสินค้าและอุปกรณ์เท่านั้น (สินค้าจำนวนจำกัด ล้างสต๊อกหมดแล้วหมดเลย)
                        </p>
                      </div>
                      <button
                        id="view-all-clearance"
                        onClick={() => {
                          setProductFilter('clearance');
                          handleNavigate('products');
                        }}
                        className="text-xs font-bold text-red-700 bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        ดูสินค้าทั้งหมด
                      </button>
                    </div>

                    {clearanceProducts.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-6 bg-white rounded-xl">ไม่มีสินค้าจัดรายการลดล้างสต็อกในขณะนี้</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {clearanceProducts.slice(0, 4).map(item => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            onClick={(it) => setSelectedItem(it)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>


                {/* SECTION 4: INFINITE IMAGE REVIEW GALLERY */}
                <section 
                  id="testimonials-section" 
                  ref={reviewsRef}
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-12 rounded-2xl border border-gray-100"
                >
                  <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">ภาพรีวิวการส่งของหน้างาน / บริการช่าง</h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-light">
                      ภาพการส่งมอบสินค้าและบริการช่างของสุโขทัยแสงอุปกรณ์ มั่นใจได้ด้วยความพึงพอใจและการดูแลจากทีมงานมืออาชีพ
                    </p>
                  </div>

                  <div className="relative group">
                    <ReviewImageCarousel items={reviews} />
                  </div>
                </section>

              </div>
            )}


            {/* -------------------- 1) SERVICES SUB-PAGE -------------------- */}
            {currentPage === 'services' && (
              <div id="services-view" className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
                {/* Back Button */}
                <button 
                  id="services-back-btn"
                  onClick={() => handleNavigate('home', false, true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600 rounded-lg border border-gray-200 shadow-xs text-sm font-medium transition-all mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับหน้าแรก</span>
                </button>

                {/* Sub-page Header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <Construction className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">บริการงานช่างมืออาชีพครบวงจร</h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed max-w-2xl">
                    เรารวบรวมทีมงานช่างมืออาชีพที่ได้รับมาตรฐานวิชาชีพและการอบรมจากเครือ SCG ครอบคลุมงานโครงสร้างหลังคา งานสี งานปูกระเบื้อง งานไฟฟ้า และห้องน้ำ รับประกันคุณภาพงาน
                  </p>
                </div>

                {/* Service Search Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="พิมพ์ค้นหาชื่อบริการงานช่างที่ต้องการ... (เช่น ซ่อมหลังคา, รางน้ำฝน, ทาสี)"
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-16 py-3.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-xl text-sm transition-all outline-none text-gray-900 font-medium"
                    />
                    {serviceSearchQuery && (
                      <button
                        onClick={() => setServiceSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-600 text-xs font-semibold transition-all cursor-pointer"
                      >
                        ล้างค่า
                      </button>
                    )}
                  </div>
                </div>

                {/* Service Category Selector */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 space-y-4">
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block">เลือกประเภทบริการงานช่างย่อย ({1 + dynamicServiceTabs.length} ประเภท):</span>
                  <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-gray-200">
                    <button
                      onClick={() => setSelectedServiceTab('ทั้งหมด')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                        selectedServiceTab === 'ทั้งหมด'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-white'
                      }`}
                    >
                      🛠️ ทั้งหมด ({services.length})
                    </button>
                    {dynamicServiceTabs.map((tab) => {
                      const tabCount = services.filter(item => item.tabName === tab).length;
                      return (
                        <button
                          key={tab}
                          onClick={() => setSelectedServiceTab(tab)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                            selectedServiceTab === tab
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-white'
                          }`}
                        >
                          {tab} ({tabCount})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Services Grid */}
                {filteredServices.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-12 bg-white rounded-xl border">ไม่พบบริการช่างในประเภทที่คุณเลือก</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onClick={(it) => setSelectedItem(it)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* -------------------- 2) PRODUCTS SUB-PAGE -------------------- */}
            {currentPage === 'products' && (
              <div id="products-view" className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
                {/* Back Button */}
                <button 
                  id="products-back-btn"
                  onClick={() => handleNavigate('home', false, true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600 rounded-lg border border-gray-200 shadow-xs text-sm font-medium transition-all mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับหน้าแรก</span>
                </button>

                {/* Sub-page Header and Controls */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-red-600">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">คลังสินค้าวัสดุอุปกรณ์</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-gray-900">แคตตาล็อกรวมสินค้าและเครื่องมือ</h1>
                      <p className="text-xs sm:text-sm text-gray-500 font-light">
                        เลือกสรรอุปกรณ์ก่อสร้าง ปูน ท่อ สี และเครื่องมือช่างคุณภาพดีที่สุดสำหรับบ้านคุณ
                      </p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-gray-100">
                      {/* Search Field */}
                      <div className="relative md:col-span-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อสินค้า คีย์เวิร์ด หรือยี่ห้อ เช่น ปูน, TOA, Bosch..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all text-gray-900"
                        />
                      </div>

                      {/* Filters Tabs */}
                      <div className="flex md:col-span-6 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <button
                          onClick={() => setProductFilter('all')}
                          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            productFilter === 'all' 
                              ? 'bg-white text-red-600 shadow-xs border border-gray-200/50' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          ทั้งหมด ({products.length})
                        </button>
                        <button
                          onClick={() => setProductFilter('clearance')}
                          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            productFilter === 'clearance' 
                              ? 'bg-red-950 text-white shadow-xs' 
                              : 'text-gray-500 hover:text-red-700'
                          }`}
                        >
                          ลดล้างสต๊อก ({clearanceProducts.length})
                        </button>
                        <button
                          onClick={() => setProductFilter('sale')}
                          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            productFilter === 'sale' 
                              ? 'bg-red-600 text-white shadow-xs' 
                              : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          ลดพิเศษ Sale ({products.filter(item => item.tabName !== 'สินค้าอื่นๆ' && item.promoPrice !== undefined && item.promoPrice < item.regularPrice).length})
                        </button>
                      </div>
                    </div>

                    {/* Secondary Filters Dropdowns */}
                    <div className="pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Beautiful Product Category Dropdown Selector */}
                      <div className="space-y-2">
                        <label htmlFor="product-category-select" className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                          เลือกหมวดหมู่สินค้าและอุปกรณ์
                        </label>
                        <div className="relative w-full">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-600">
                              <rect width="7" height="7" x="3" y="3" rx="1" />
                              <rect width="7" height="7" x="14" y="3" rx="1" />
                              <rect width="7" height="7" x="14" y="14" rx="1" />
                              <rect width="7" height="7" x="3" y="14" rx="1" />
                            </svg>
                          </div>
                          <select
                            id="product-category-select"
                            value={selectedProductTab}
                            onChange={(e) => {
                              setSelectedProductTab(e.target.value);
                              setProductPage(1);
                            }}
                            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-red-600 focus:bg-white transition-all appearance-none cursor-pointer shadow-xs hover:border-gray-300 text-gray-950"
                          >
                            <option value="ทั้งหมด">
                              {getCategoryDropdownPrefix('ทั้งหมด')} &nbsp; ทั้งหมด ({products.length} รายการ)
                            </option>
                            {PRODUCT_TABS.map((tab) => {
                              const tabCount = products.filter(item => item.tabName === tab).length;
                              return (
                                <option key={tab} value={tab}>
                                  {getCategoryDropdownPrefix(tab)} &nbsp; {tab} ({tabCount} รายการ)
                                </option>
                              );
                            })}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Right: Brand Filter Dropdown */}
                      <div className="space-y-2">
                        <label htmlFor="product-brand-select" className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                          กรองตามแบรนด์สินค้า (แบรนด์)
                        </label>
                        <div className="relative w-full">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Award className="w-4 h-4 text-red-600" />
                          </div>
                          <select
                            id="product-brand-select"
                            value={selectedBrand}
                            onChange={(e) => {
                              setSelectedBrand(e.target.value);
                              setProductPage(1);
                            }}
                            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-red-600 focus:bg-white transition-all appearance-none cursor-pointer shadow-xs hover:border-gray-300 text-gray-950"
                          >
                            {(() => {
                              // Count of items in CURRENT category (or ALL categories if category is 'ทั้งหมด')
                              let baseProductsForCount = selectedProductTab === 'ทั้งหมด' 
                                ? products 
                                : products.filter(item => item.tabName === selectedProductTab);
                              
                              // Filter by selected subcategory if active
                              if (selectedProductTab !== 'ทั้งหมด' && selectedProductTab !== 'สินค้าอื่นๆ' && selectedRoofSub !== 'all') {
                                baseProductsForCount = baseProductsForCount.filter(item => item.subCategory === selectedRoofSub);
                              }
                              
                              // Get all unique brands present in these products
                              const uniqueBrands = Array.from(new Set<string>(baseProductsForCount.map(getItemBrand)));
                              
                              // Build dynamic list of brand options: 
                              // Standard order of known brands, then other dynamic ones, and "แบรนด์อื่นๆ" at the end if it exists
                              const knownOrder = ['SCG', 'ตราช้าง', 'TOA', 'COTTO', 'ตราเสือ'];
                              const presentKnownBrands = knownOrder.filter(kb => uniqueBrands.includes(kb));
                              const presentOtherBrands = uniqueBrands.filter(b => b !== 'แบรนด์อื่นๆ' && !knownOrder.includes(b)).sort();
                              const hasOthers = uniqueBrands.includes('แบรนด์อื่นๆ');
                              
                              const finalBrandsList = ['ทั้งหมด', ...presentKnownBrands, ...presentOtherBrands, ...(hasOthers ? ['แบรนด์อื่นๆ'] : [])];
                              
                              return finalBrandsList.map((brand) => {
                                let brandCount = 0;
                                if (brand === 'ทั้งหมด') {
                                  brandCount = baseProductsForCount.length;
                                } else {
                                  brandCount = baseProductsForCount.filter(item => getItemBrand(item) === brand).length;
                                }
                                return (
                                  <option key={brand} value={brand}>
                                    {brand} ({brandCount} รายการ)
                                  </option>
                                );
                              });
                            })()}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Subcategory Filter */}
                    {selectedProductTab !== 'ทั้งหมด' && selectedProductTab !== 'สินค้าอื่นๆ' && currentSubCategories.length > 0 && (
                      <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 animate-fade-in">
                        <span className="text-xs font-bold text-red-950">{getSubCategoryHeading(selectedProductTab)}</span>
                        <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl border border-gray-200/60 gap-1">
                          <button
                            onClick={() => setSelectedRoofSub('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              selectedRoofSub === 'all'
                                ? 'bg-white text-red-600 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            ทั้งหมด ({products.filter(item => item.tabName === selectedProductTab).length})
                          </button>
                          {currentSubCategories.map((sub) => {
                            const count = products.filter(item => item.tabName === selectedProductTab && item.subCategory === sub).length;
                            return (
                              <button
                                key={sub}
                                onClick={() => setSelectedRoofSub(sub)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  selectedRoofSub === sub
                                    ? 'bg-red-800 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-red-800'
                                }`}
                              >
                                {sub} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-page Toggle Helper to switch to Services view easily */}
                <div className="mb-6 flex space-x-2">
                  <button
                    onClick={() => handleNavigate('products')}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm border border-red-600"
                  >
                    สินค้าและอุปกรณ์
                  </button>
                  <button
                    onClick={() => handleNavigate('services')}
                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-600/30 transition-all"
                  >
                    งานบริการช่าง
                  </button>
                </div>

                {/* Products Grid */}
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-2">
                    <p className="text-gray-500 text-sm font-semibold">ไม่พบข้อมูลสินค้าที่ตรงกับเงื่อนไข</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setProductFilter('all'); }} 
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      ล้างตัวกรองและดูสินค้าทั้งหมด
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {paginatedProducts.map(item => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onClick={(it) => setSelectedItem(it)}
                        />
                      ))}
                    </div>

                    {/* Pagination (แบ่งหน้า) - Dynamic and Real-time */}
                    {totalPages > 1 && (
                      <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 font-light">
                          แสดง {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalProducts)} จากสินค้าทั้งหมด {totalProducts} ชิ้น
                        </span>
                        
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                            disabled={productPage === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:enabled:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 transition-all cursor-pointer"
                            aria-label="หน้าก่อนหน้า"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Dynamic Page Numbers with Ellipsis */}
                          {getPaginationRange(productPage, totalPages).map((item, idx) => (
                            item === '...' ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className="w-8 sm:w-9 h-9 flex items-center justify-center text-xs font-bold text-gray-400 select-none px-1"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={`page-${item}`}
                                onClick={() => setProductPage(item as number)}
                                className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                  productPage === item
                                    ? 'bg-red-600 border-red-600 text-white font-bold shadow-xs'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {item}
                              </button>
                            )
                          ))}

                          <button
                            onClick={() => setProductPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={productPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:enabled:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 transition-all cursor-pointer"
                            aria-label="หน้าถัดไป"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {/* -------------------- 3) ESTIMATION SUB-PAGE -------------------- */}
            {currentPage === 'estimation' && (
              <div id="estimation-view" className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
                {/* Back Button */}
                <button 
                  id="estimation-back-btn"
                  onClick={() => handleNavigate('home', false, true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600 rounded-lg border border-gray-200 shadow-xs text-sm font-medium transition-all mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับหน้าแรก</span>
                </button>

                {/* Sub-page Header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">บริการถอดแบบแปลนและประมาณการราคา</h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed max-w-2xl">
                    บริการถอดแผ่นพิมพ์เขียว แปลนบ้าน โครงสร้าง อาคารเพื่อคำนวณปริมาณปูน, เหล็กเส้น, กระเบื้อง, และสีที่ต้องใช้จริง แม่นยำสูง ออกรายงานบัญชีแสดงปริมาณวัสดุและราคา (BOQ) เพื่อยื่นขอสินเชื่อหรือวางแผนงบประมาณก่อสร้างอย่างมีประสิทธิภาพ
                  </p>
                </div>

                {/* Estimation Services Grid */}
                {estimations.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {estimations.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onClick={(it) => setSelectedItem(it)}
                      />
                    ))}
                  </div>
                )}

                {/* Highly-visible, beautiful Service Summary and Contact Trigger */}
                <div id="estimation-form-card" className="mt-12 max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden font-sans">
                  <div className="bg-slate-900 text-white p-6 md:p-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-red-600/10 mb-2">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black">สนใจบริการถอดแบบประมาณการราคา</h3>
                    <p className="text-xs text-slate-300 font-light max-w-md mx-auto">
                      บริการคำนวณปริมาณวัสดุและจัดทำ BOQ โดยทีมวิศวกรและผู้เชี่ยวชาญจาก สุโขทัยแสงอุปกรณ์
                    </p>
                  </div>

                  <div className="p-6 md:p-8 space-y-6 text-center">
                    <div className="bg-red-50/80 border border-red-100 rounded-2xl p-5 text-left space-y-3.5 max-w-md mx-auto">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">เงื่อนไขสำคัญของการให้บริการ:</span>
                      <ul className="text-xs text-gray-600 space-y-2 leading-relaxed font-light">
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>ค่าบริการถอดแบบประมาณการ 399 บาท</strong> (ใช้เป็นส่วนลดตอนซื้อสินค้าได้)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span>เป็นเพียงการประมาณการสินค้าเท่านั้น สินค้าอาจจะเหลือหรือขาดได้</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>สนใจปรึกษาฟรี!</strong></span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEstimationContactOpen(true)}
                      className="w-full max-w-md py-4 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover:scale-101 active:scale-95 cursor-pointer text-center inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>ติดต่อเจ้าหน้าที่เพื่อถอดแบบ / ปรึกษาฟรี</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        )}

      </main>

      {/* Footer (Compact size, bottom of every page) */}
      <Footer isHome={currentPage === 'home'} />

      {/* --- POPUP / MODALS --- */}
      
      {/* 1. Item Detail Modal (หน้าเจาะลึก) */}
      <ItemDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onBook={handleOpenContact}
      />

      {/* 2. Contact Modal (กล่องติดต่อ 3 ปุ่มใหญ่) */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        targetItem={contactTarget}
      />

      {/* 4. Custom Estimation Contact Modal (กล่องสิทธิ์ประโยชน์และช่องทางติดต่อบริการถอดแบบ) */}
      {isEstimationContactOpen && (
        <div 
          id="estimation-contact-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-8 pb-4 sm:p-6 sm:pt-6 bg-black/60 backdrop-blur-xs animate-fade-in overscroll-contain"
          onClick={() => setIsEstimationContactOpen(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-5 sm:p-6 font-sans text-center max-h-[85vh] overflow-y-auto overscroll-contain my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsEstimationContactOpen(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all cursor-pointer shadow-xs"
              aria-label="ปิดหน้าต่าง"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center mt-2 mb-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">บริการถอดแบบประมาณการราคา</h3>
            </div>

            {/* Crucial Note Box */}
            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-5 mb-6 text-left space-y-3">
              <p className="text-sm text-gray-900 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                <span>ข้อตกลงและเงื่อนไขสำคัญ:</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                ค่าบริการถอดแบบประมาณการ <strong className="text-red-600 font-bold">399 บาท</strong> (ใช้เป็นส่วนลดตอนซื้อสินค้าได้)<br />
                เป็นเพียงการประมาณการสินค้าเท่านั้น สินค้าอาจจะเหลือหรือขาดได้<br />
                <strong className="text-gray-900 font-bold">สนใจปรึกษาฟรี!</strong>
              </p>
            </div>

            <p className="text-xs text-gray-400 mb-4 font-light">
              กรุณาเลือกช่องทางที่ท่านสะดวกในการส่งรูปภาพหรือไฟล์แบบแปลนเพื่อติดต่อพูดคุยกับเจ้าหน้าที่
            </p>

            {/* Contact Buttons */}
            <div className="space-y-3">
              {/* Line Contact */}
              <a
                href="https://lin.ee/vbEDI1N"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="flex items-center justify-between w-full px-5 py-4 bg-[#06C755] hover:bg-[#05B04B] text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">คุยไลน์กับแอดมิน (LINE)</p>
                    <p className="text-xs text-white/80 font-light">LINE ID: @exu1868n</p>
                  </div>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-light">แอดไลน์</span>
              </a>

              {/* Facebook Contact */}
              <a
                href="https://www.facebook.com/p/%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B8%8B%E0%B8%B5%E0%B8%88%E0%B8%B5-%E0%B9%82%E0%B8%AE%E0%B8%A1-%E0%B9%81%E0%B8%AA%E0%B8%87%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%99%E0%B9%8C-%E0%B8%AA%E0%B8%B8%E0%B9%82%E0%B8%82%E0%B8%97%E0%B8%B1%E0%B8%A2-100064067044139/?locale=th_TH"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="flex items-center justify-between w-full px-5 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">ส่งข้อมูลทาง Facebook</p>
                    <p className="text-xs text-white/80 font-light">สุโขทัยแสงอุปกรณ์</p>
                  </div>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-light">เปิดแชท</span>
              </a>

              {/* Telephone Contact */}
              <a
                href="tel:055616437"
                className="flex items-center justify-between w-full px-5 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">โทรศัพท์ติดต่อโดยตรง</p>
                    <p className="text-xs text-white/80 font-light">เบอร์: 055-616437</p>
                  </div>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-light">โทรออก</span>
              </a>
            </div>

            {/* Note Footer */}
            <div className="text-center mt-5 text-[11px] text-gray-400">
              เริ่มที่นี่ no worry เรื่องบ้าน • สุโขทัยแสงอุปกรณ์
            </div>
          </div>
        </div>
      )}

      {/* 3. Estimation Request Success Modal */}
      {isEstSuccessOpen && (
        <div 
          id="estimation-success-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-8 pb-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in overscroll-contain"
        >
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 text-center space-y-6 relative border border-gray-100 transform scale-100 transition-all font-sans max-h-[85vh] overflow-y-auto overscroll-contain my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">ส่งข้อมูลแบบแปลนเรียบร้อยแล้ว!</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                ทางสุโขทัยแสงอุปกรณ์ขอขอบพระคุณเป็นอย่างสูงที่ท่านสนใจบริการถอดแบบประมาณการราคาของเรา
              </p>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4 text-left border border-emerald-100 space-y-3.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">ขั้นตอนถัดไปสำหรับท่าน:</span>
              <ul className="text-xs text-gray-600 space-y-2.5 leading-relaxed font-light">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span><strong>เจ้าหน้าที่ประเมินราคาจะติดต่อกลับหาท่าน</strong> ภายใน 24 ชั่วโมง เพื่อยืนยันขอบเขตงานและตรวจสอบความถูกต้องของระยะในแบบแปลน</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><strong>ทีมวิศวกรผู้เชี่ยวชาญจะทำการคำนวณถอดแบบ</strong> จัดเตรียมข้อมูล BOQ (บัญชีรายการวัสดุและค่าแรง) ระยะเวลาประเมินประมาณ 3-5 วันทำการ</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span><strong>รับเอกสารรายงานวัสดุ BOQ ทางออนไลน์</strong> ในรูปแบบไฟล์ PDF สรุปปริมาณวัสดุที่ต้องใช้ในการก่อสร้างอย่างละเอียดและมีมาตรฐานสากล</span>
                </li>
              </ul>
            </div>

                                 <div className="flex flex-col gap-2 mb-4 w-full max-w-md mx-auto">
                    <button 
                      type="button" 
                      onClick={() => window.open('https://lin.ee', '_blank')} 
                      className="w-full py-3 bg-[#06C755] hover:bg-[#05B34C] text-white rounded-xl font-bold transition-all shadow-md active:scale-99 cursor-pointer text-center text-base"
                    >
                      {"🟢 ส่งข้อมูลยืนยันเข้า LINE"}
                    </button>
                  </div>
                {/* === สิ้นสุดโค้ดกลุ่มปุ่มใหม่ === */}

                {/* === ปุ่มสีดำเดิมที่แก้ไขข้อความให้อยู่ในแท็กถูกต้อง === */}
                <button
                  onClick={resetEstForm}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-99 cursor-pointer"
                >
                 รับทราบและย้อนกลับหน้าหลัก
                </button>
          </div>
        </div>
      )}

      {/* 5. Cart Drawer, Checkout Order Modal, Floating Button & Toast */}
      <CartDrawer />
      <CheckoutModal />
      <FloatingCartButton />
      <CartToast />

    </div>
  );
}
