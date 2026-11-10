/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  MapPin, 
  Truck, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  Mail, 
  ArrowLeft,
  Copy,
  Receipt,
  Building2,
  FileText,
  Clock,
  Check,
  UploadCloud,
  Image as ImageIcon,
  ZoomIn,
  Trash2,
  ExternalLink,
  ChevronRight,
  Store,
  PackageCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import DeliveryMapPicker from './DeliveryMapPicker';
import { STORE_LOCATION, ZoneEvaluation } from '../utils/delivery';
import { sendOrderToAppsScript } from '../utils/appsScript';

// ฟังก์ชันบีบอัดรูปภาพสลิปบนฝั่ง Client ก่อนส่ง เพื่อให้ระบบส่งออเดอร์ได้รวดเร็วทันใจ (ลดขนาดไฟล์จากหลาย MB เหลือ ~100KB)
const compressSlipImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve('');
  });
};

export default function CheckoutModal() {
  const { 
    cart, 
    subtotal, 
    clearCart, 
    isCheckoutOpen, 
    setIsCheckoutOpen,
    setIsCartOpen 
  } = useCart();

  // ข้อมูลลูกค้าและการติดต่อ
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [notes, setNotes] = useState('');

  // รูปแบบการจัดส่ง: 'delivery' (จัดส่งตามที่อยู่) หรือ 'pickup' (รับเองที่ร้าน)
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  // วิธีการชำระเงิน
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod' | 'inquiry'>('bank_transfer');

  // ข้อมูลบัญชีธนาคารและการโอนเงิน
  const [isBankPopupOpen, setIsBankPopupOpen] = useState(false);
  const [isBankFlyerZoomOpen, setIsBankFlyerZoomOpen] = useState(false);
  const [copiedBankNum, setCopiedBankNum] = useState(false);

  // ข้อมูลสลิปโอนเงิน
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipDataUrl, setSlipDataUrl] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [slipFileSize, setSlipFileSize] = useState<string>('');
  const [isCompressingSlip, setIsCompressingSlip] = useState(false);
  const [isSlipZoomOpen, setIsSlipZoomOpen] = useState<boolean>(false);

  // ข้อมูลใบกำกับภาษี (Tax Invoice)
  const [needTaxInvoice, setNeedTaxInvoice] = useState(false);
  const [taxType, setTaxType] = useState<'individual' | 'corporate'>('corporate');
  const [taxName, setTaxName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxBranch, setTaxBranch] = useState('สำนักงานใหญ่');
  const [useSameAddressForTax, setUseSameAddressForTax] = useState(true);
  const [taxAddress, setTaxAddress] = useState('');

  // ข้อมูลแผนที่และการประเมินค่าจัดส่ง
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    distanceKm: number;
    evaluation: ZoneEvaluation;
    addressText: string;
    googleMapsUrl?: string;
  } | null>(null);

  // สถานะการส่งคำสั่งซื้อ
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'sent' | 'failed'>('sent');

  // ล็อคการเลื่อน scroll ของหน้าต่างหลักเมื่อเปิด modal
  useEffect(() => {
    if (isCheckoutOpen || isSuccessModalOpen || isBankPopupOpen || isBankFlyerZoomOpen || isSlipZoomOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [isCheckoutOpen, isSuccessModalOpen, isBankPopupOpen, isBankFlyerZoomOpen, isSlipZoomOpen]);

  if (!isCheckoutOpen && !isSuccessModalOpen) return null;

  // คำนวณค่าส่ง: หากลูกค้าระบุ "รับเองที่ร้าน" ให้ค่าส่งเป็น 0 เสมอ
  const deliveryFee = deliveryMethod === 'pickup' 
    ? 0 
    : (locationData?.evaluation.isOutOfZone ? 0 : (locationData?.evaluation.deliveryFee || 0));
  const grandTotal = subtotal + deliveryFee;

  // ฟังก์ชันเลือกวิธีชำระเงิน
  const handleSelectPaymentMethod = (method: 'bank_transfer' | 'cod' | 'inquiry') => {
    setPaymentMethod(method);
    if (method === 'bank_transfer') {
      setIsBankPopupOpen(true);
    }
  };

  // ฟังก์ชันคัดลอกเลขบัญชีธนาคาร
  const handleCopyBankAccount = () => {
    navigator.clipboard.writeText('157-2-45402-5');
    setCopiedBankNum(true);
    setTimeout(() => setCopiedBankNum(false), 2500);
  };

  // ฟังก์ชันจัดการเลือกไฟล์รูปสลิป พร้อมบีบอัดภาพเพื่อความเร็วสูงสุด
  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('ขนาดไฟล์รูปภาพเกิน 15MB กรุณาเลือกรูปภาพที่ขนาดเล็กกว่านี้ค่ะ');
      return;
    }

    setSlipFile(file);
    setSlipFileName(file.name);
    setIsCompressingSlip(true);

    try {
      const compressedDataUrl = await compressSlipImage(file);
      setSlipDataUrl(compressedDataUrl);
      const estSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setSlipFileSize(estSizeKb + ' KB (บีบอัดพร้อมส่งเร็ว)');
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => setSlipDataUrl(reader.result as string);
      reader.readAsDataURL(file);
      setSlipFileSize((file.size / 1024).toFixed(1) + ' KB');
    } finally {
      setIsCompressingSlip(false);
    }
  };

  // ฟังก์ชันลบรูปสลิป
  const handleRemoveSlip = () => {
    setSlipFile(null);
    setSlipDataUrl('');
    setSlipFileName('');
    setSlipFileSize('');
  };

  // สร้างข้อความสรุปออเดอร์แบบข้อความธรรมดา สำหรับส่งผ่าน LINE, Mailto และ Clipboard
  const generateOrderTextSummary = (orderId: string) => {
    const itemsList = cart
      .map((ci, idx) => {
        const item = ci.item;
        const price = item.promoPrice !== undefined && item.promoPrice < item.regularPrice ? item.promoPrice : item.regularPrice;
        const barcodeText = item.barcode ? ` [บาร์: ${item.barcode}]` : '';
        return `${idx + 1}. ${item.name}${barcodeText} x ${ci.quantity} ${item.unit || 'ชิ้น'} = ฿${(price * ci.quantity).toLocaleString('th-TH')}`;
      })
      .join('\n');

    const isPickup = deliveryMethod === 'pickup';
    const mapsCustomerPin = (!isPickup && locationData)
      ? (locationData.googleMapsUrl ? `${locationData.googleMapsUrl} (พิกัด: ${locationData.lat},${locationData.lng})` : `https://www.google.com/maps?q=${locationData.lat},${locationData.lng}`)
      : 'https://maps.app.goo.gl/wNSma6LbqY2ebmmf6 (หน้าร้านสุโขทัยแสงอุปกรณ์)';

    const finalAddress = isPickup ? 'รับสินค้าเองที่หน้าร้าน (สุโขทัยแสงอุปกรณ์)' : addressDetail;
    const finalTaxAddress = useSameAddressForTax ? finalAddress : taxAddress;
    const taxSectionText = needTaxInvoice
      ? `\n🧾 ข้อมูลใบกำกับภาษี:\n- ประเภท: ${taxType === 'corporate' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}\n- ชื่อผู้เสียภาษี: ${taxName}\n- เลขประจำตัวผู้เสียภาษี: ${taxId}\n- สาขา: ${taxBranch}\n- ที่อยู่ออกใบกำกับ: ${finalTaxAddress}\n`
      : '\n🧾 ใบกำกับภาษี: ไม่ต้องการรับ\n';

    const paymentText = paymentMethod === 'bank_transfer'
      ? `โอนเงินผ่านธนาคาร กสิกรไทย 157-2-45402-5 ${slipDataUrl ? '(แนบสลิปเรียบร้อยแล้ว)' : '(รอส่งสลิป)'}`
      : paymentMethod === 'cod'
      ? 'ชำระเงินปลายทาง'
      : 'ขอใบเสนอราคา / ติดต่อเจ้าหน้าที่';

    const pickupNoticeText = isPickup
      ? `\n🏬 รูปแบบการรับของ: รับเองที่หน้าร้านสุโขทัยแสงอุปกรณ์ (ฟรีค่าส่ง)\n*ทางร้านจะเช็คสินค้าและแจ้งวันนัดรับสินค้ากับลูกค้าอีกครั้งผ่านเบอร์โทร ${phone || 'ที่ท่านระบุ'} นี้*\n`
      : `\n🚚 รูปแบบการรับของ: จัดส่งตามที่อยู่ (ระยะทาง ${locationData?.distanceKm || 0} กม.)\n*รอพนักงานติดต่อกลับเพื่อนัดวันจัดส่งสินค้า*\n`;

    return `📦 คำสั่งซื้อใหม่ สุโขทัยแสงอุปกรณ์
รหัสออเดอร์: #${orderId}
วันที่สั่งซื้อ: ${new Date().toLocaleString('th-TH')}

👤 ข้อมูลผู้สั่งซื้อ:
- ชื่อ-นามสกุล: ${customerName}
- เบอร์โทรศัพท์: ${phone}
- LINE ID: ${lineId || '-'}
- อีเมลลูกค้า: ${customerEmail || '-'}
- ที่อยู่: ${finalAddress}
- พิกัดหมุด (GPS): ${mapsCustomerPin}
${pickupNoticeText}
- ค่าจัดส่ง: ${isPickup ? 'รับเองที่ร้าน (ฟรี ฿0)' : (locationData?.evaluation.isFreeDelivery ? 'ส่งฟรี (฿0)' : `฿${deliveryFee.toLocaleString('th-TH')}`)}
- วิธีชำระเงิน: ${paymentText}
- หมายเหตุ: ${notes || '-'}
${taxSectionText}
🛒 รายการสินค้า:
${itemsList}

💰 สรุปยอดเงิน:
- ยอดรวมค่าสินค้า: ฿${subtotal.toLocaleString('th-TH')}
- ค่าจัดส่ง: ฿${deliveryFee.toLocaleString('th-TH')}
- ยอดสุทธิทั้งสิ้น: ฿${grandTotal.toLocaleString('th-TH')}

-------------------------
ส่งถึง: scghomessk@gmail.com
ร้านสุโขทัยแสงอุปกรณ์ 
โทร: 055-616437 | LINE: @exu1868n`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์ติดต่อให้ครบถ้วนด้วยค่ะ');
      return;
    }

    if (deliveryMethod === 'delivery' && !addressDetail.trim()) {
      alert('กรุณากรอกที่อยู่จัดส่งโดยละเอียดด้วยค่ะ');
      return;
    }

    if (needTaxInvoice) {
      if (!taxName.trim() || !taxId.trim()) {
        alert('กรุณากรอกชื่อผู้เสียภาษี และเลขประจำตัวผู้เสียภาษี 13 หลัก สำหรับออกใบกำกับภาษีด้วยค่ะ');
        return;
      }
      if (!useSameAddressForTax && !taxAddress.trim()) {
        alert('กรุณากรอกที่อยู่สำหรับออกใบกำกับภาษีด้วยค่ะ');
        return;
      }
    }

    if (deliveryMethod === 'delivery' && locationData?.evaluation.isOutOfZone) {
      const confirmProceed = window.confirm(
        'หมุดปลายทางของคุณอยู่นอกพื้นที่จัดส่งปกติ กรุณากดยืนยันหากท่านได้โทรติดต่อตกลงค่าจัดส่งรอบพิเศษกับพนักงานร้านแล้ว หรือโทร 055-616437'
      );
      if (!confirmProceed) return;
    }

    // แจ้งเตือนกรณีเลือกโอนเงินแต่ยังไม่ได้แนบสลิป
    if (paymentMethod === 'bank_transfer' && !slipDataUrl) {
      const confirmNoSlip = window.confirm(
        'ท่านเลือกวิธี "โอนเงินผ่านธนาคาร" แต่ยังไม่ได้แนบรูปสลิป\n\n• กด "ตกลง" (OK) เพื่อส่งคำสั่งซื้อทันที (แล้วส่งสลิปให้ร้านทาง LINE ในภายหลัง)\n• กด "ยกเลิก" (Cancel) เพื่อกลับไปแนบรูปสลิปในหัวข้อที่ 3 ก่อนส่ง'
      );
      if (!confirmNoSlip) return;
    }

    setIsSubmitting(true);
    const orderId = `SK-${Date.now().toString().slice(-6)}`;
    const isPickup = deliveryMethod === 'pickup';
    const finalAddress = isPickup ? 'รับสินค้าเองที่หน้าร้าน (สุโขทัยแสงอุปกรณ์)' : addressDetail;
    const finalTaxAddress = useSameAddressForTax ? finalAddress : taxAddress;

    const customerPinUrl = (!isPickup && locationData)
      ? (locationData.googleMapsUrl ? `${locationData.googleMapsUrl} (พิกัด: ${locationData.lat},${locationData.lng})` : `https://www.google.com/maps?q=${locationData.lat},${locationData.lng}`)
      : STORE_LOCATION.mapsUrl;

    const orderPayload = {
      action: 'create_order',
      orderId,
      createdAt: new Date().toISOString(),
      customerName,
      phone,
      lineId,
      customerEmail: customerEmail.trim(),
      deliveryMethod,
      addressDetail: finalAddress,
      lat: isPickup ? STORE_LOCATION.lat : (locationData?.lat || 0),
      lng: isPickup ? STORE_LOCATION.lng : (locationData?.lng || 0),
      googleMapsUrl: isPickup ? '' : (locationData?.googleMapsUrl || ''),
      mapsUrl: customerPinUrl,
      distanceKm: isPickup ? 0 : (locationData?.distanceKm || 0),
      zoneName: isPickup ? 'รับสินค้าเองที่ร้าน (สุโขทัยแสงอุปกรณ์)' : (locationData?.evaluation.zoneName || ''),
      isOutOfZone: isPickup ? false : (locationData?.evaluation.isOutOfZone || false),
      deliveryFee,
      subtotal,
      grandTotal,
      paymentMethod: paymentMethod === 'bank_transfer' ? 'โอนเงินผ่านธนาคาร (กสิกรไทย 157-2-45402-5)' : paymentMethod === 'cod' ? 'ชำระเงินปลายทาง' : 'ขอใบเสนอราคา',
      slipData: slipDataUrl || '',
      slipName: slipFileName || '',
      needTaxInvoice,
      taxType: needTaxInvoice ? (taxType === 'corporate' ? 'นิติบุคคล' : 'บุคคลธรรมดา') : '',
      taxName: needTaxInvoice ? taxName : '',
      taxId: needTaxInvoice ? taxId : '',
      taxBranch: needTaxInvoice ? taxBranch : '',
      taxAddress: needTaxInvoice ? finalTaxAddress : '',
      notes,
      items: cart.map((ci) => ({
        id: ci.item.id,
        name: ci.item.name,
        barcode: ci.item.barcode || '',
        brand: ci.item.brand || '',
        unit: ci.item.unit || 'ชิ้น',
        quantity: ci.quantity,
        unitPrice:
          ci.item.promoPrice !== undefined && ci.item.promoPrice < ci.item.regularPrice
            ? ci.item.promoPrice
            : ci.item.regularPrice,
        itemTotal:
          (ci.item.promoPrice !== undefined && ci.item.promoPrice < ci.item.regularPrice
            ? ci.item.promoPrice
            : ci.item.regularPrice) * ci.quantity
      })),
      targetEmail: 'scghomessk@gmail.com'
    };

    setCompletedOrder({
      ...orderPayload,
      summaryText: generateOrderTextSummary(orderId)
    });

    // บันทึกคำสั่งซื้อลง LocalStorage สำรองทันที
    try {
      const savedOrders = JSON.parse(localStorage.getItem('sukhothai_orders_history') || '[]');
      savedOrders.unshift({
        ...orderPayload,
        hasSlip: !!slipDataUrl
      });
      localStorage.setItem('sukhothai_orders_history', JSON.stringify(savedOrders.slice(0, 30)));
    } catch (err) {}

    // ดำเนินการส่งข้อมูลไปยัง Google Apps Script (ยิงเข้า Sheet 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4 และส่งเมลเข้า scghomessk@gmail.com และอีเมลลูกค้า)
    try {
      await sendOrderToAppsScript(orderPayload);
    } catch (err) {
      console.warn('sendOrderToAppsScript error:', err);
    }

    setEmailStatus('sent');

    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 }
    });

    setIsSubmitting(false);
    setIsCheckoutOpen(false);
    setIsSuccessModalOpen(true);
    clearCart();
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <>
      {/* 1. หน้าต่างฟอร์ม Checkout คำสั่งซื้อ */}
      {isCheckoutOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-fade-in overscroll-contain"
          id="checkout-modal-overlay"
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden max-h-[92vh] flex flex-col font-sans my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header ด้านบน */}
            <div className="px-5 py-4 border-b border-gray-150 bg-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="ย้อนกลับไปแก้ไขตะกร้า"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    แบบฟอร์มคำสั่งซื้อและคิดค่าขนส่ง
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    รองรับทั้งบริการจัดส่งตามระยะทาง GPS และรับสินค้าเองที่หน้าร้านสุโขทัยแสงอุปกรณ์
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ส่วนของฟอร์ม (Scrollable) */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* ส่วนที่ 1: ข้อมูลผู้สั่งซื้อ */}
              <div className="space-y-3 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>ข้อมูลผู้สั่งซื้อและช่องทางติดต่อ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ชื่อ-นามสกุล หรือชื่อผู้ติดต่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี หรือ หจก. สุโขทัยก่อสร้าง"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เบอร์โทรศัพท์ที่ติดต่อได้สะดวก <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 081-234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      LINE ID หรือช่องทางติดต่อออนไลน์ (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น line_somchai หรือ 0812345678"
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-red-600" />
                        <span>อีเมลของคุณ (สำหรับรับสรุปคำสั่งซื้อ)</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">ไม่บังคับ</span>
                    </label>
                    <input
                      type="email"
                      placeholder="เช่น your-email@gmail.com (ไม่บังคับ)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      💡 หากกรอกอีเมล ระบบจะส่งใบสรุปคำสั่งซื้อให้ท่านทันทีเพื่อเก็บไว้เป็นหลักฐาน
                    </p>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ที่อยู่จัดส่งโดยละเอียด (บ้านเลขที่, ซอย, ถนน, ตำบล, อำเภอ) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required={deliveryMethod === 'delivery'}
                      rows={2}
                      placeholder="เช่น 123/4 หมู่ 2 ถนนจรดวิถีถ่อง ต.ธานี อ.เมืองสุโขทัย จุดสังเกตใกล้โรงเรียน..."
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* ส่วนที่ 2: รูปแบบการรับสินค้า (จัดส่งตามที่อยู่ หรือ รับเองที่ร้าน) */}
              <div className="space-y-3 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">2</span>
                    <span>เลือกรูปแบบการรับสินค้าและค่าจัดส่ง</span>
                  </h4>
                </div>

                {/* ตัวเลือกรูปแบบการรับสินค้า 2 ตัวเลือก */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* ตัวเลือก A: จัดส่งตามที่อยู่ */}
                  <label 
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-2xl border-2 flex items-start space-x-3 cursor-pointer transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'border-red-600 bg-red-50/50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_method"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => setDeliveryMethod('delivery')}
                      className="mt-1 text-red-600 focus:ring-red-500"
                    />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                        <Truck className="w-4 h-4 text-red-600" />
                        <span>จัดส่งถึงที่อยู่ (ตามระยะทาง GPS)</span>
                      </p>
                      <p className="text-gray-500 font-light leading-relaxed">
                        คำนวณค่าจัดส่งจากร้านสุโขทัยแสงอุปกรณ์ มีสิทธิ์ส่งฟรีเมื่อยอดถึงเกณฑ์
                      </p>
                    </div>
                  </label>

                  {/* ตัวเลือก B: รับสินค้าเองที่ร้าน */}
                  <label 
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-4 rounded-2xl border-2 flex items-start space-x-3 cursor-pointer transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_method"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => setDeliveryMethod('pickup')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>รับสินค้าเองที่หน้าร้าน</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">ฟรี ฿0</span>
                      </p>
                      <p className="text-gray-500 font-light leading-relaxed">
                        มารับสินค้าที่ร้านสุโขทัยแสงอุปกรณ์ ไม่มีค่าจัดส่ง
                      </p>
                    </div>
                  </label>
                </div>

                {/* เมื่อเลือกว่า "รับสินค้าเองที่ร้าน" แสดงข้อความแจ้งเตือนตามที่ผู้ใช้สั่ง */}
                {deliveryMethod === 'pickup' ? (
                  <div className="p-4 bg-emerald-50/80 border-2 border-emerald-400 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <PackageCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-emerald-950">
                          เงื่อนไขการรับสินค้าเองที่หน้าร้าน:
                        </h4>
                        <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-300/80">
                          ทางร้านจะเช็คสินค้าและแจ้งวันนัดรับสินค้ากับลูกค้าอีกครั้งผ่านเบอร์โทร <strong className="text-red-600 text-sm font-black underline">{phone ? phone : '*** *******'}</strong> นี้
                        </p>
                      </div>
                    </div>

                    {/* ที่ตั้งหน้าร้านสำหรับมารับของ */}
                    <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-2">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-800">จุดรับสินค้า: ร้านสุโขทัยแสงอุปกรณ์ </p>
                        <p className="text-[11px] text-gray-500">เปิดทุกวัน เวลา 08.00 - 17.00 น. | โทร: 055-616437</p>
                      </div>
                      <a
                        href={STORE_LOCATION.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>เปิด Google Maps นำทางมาร้าน</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* เมื่อเลือกจัดส่งตามที่อยู่ แสดงแผนที่ GPS เลื่อนหมุด */
                  <div className="space-y-3 pt-2">
                    <DeliveryMapPicker
                      subtotal={subtotal}
                      onLocationChange={(loc) => setLocationData(loc)}
                    />

                    {/* แจ้งเตือนเรื่องการนัดวันจัดส่ง */}
                    <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 leading-relaxed">
                        <p className="font-bold text-amber-950">รอพนักงานติดต่อกลับเพื่อนัดวันจัดส่งสินค้า</p>
                        <p className="text-[11px] text-amber-800 font-light">
                          เจ้าหน้าที่จะโทรประสานงานนัดหมายวันเวลาส่งสินค้ากับท่านล่วงหน้าค่ะ
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ส่วนที่ 3: วิธีการชำระเงิน, ช่องทางการโอน & แนบสลิป, ใบกำกับภาษี */}
              <div className="space-y-4 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>วิธีการชำระเงินและหลักฐานการโอน</span>
                </h4>

                {/* ตัวเลือกวิธีการชำระเงิน 3 ปุ่ม */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <label 
                    onClick={() => handleSelectPaymentMethod('bank_transfer')}
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => handleSelectPaymentMethod('bank_transfer')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs leading-tight">
                      <p className="font-bold flex items-center gap-1">
                        <span>โอนเงินผ่านธนาคาร</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-normal">กสิกรไทย</span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-light">มีเลขบัญชี & แนบสลิป</p>
                    </div>
                  </label>

                  <label 
                    onClick={() => handleSelectPaymentMethod('cod')}
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-red-600 bg-red-50/40 text-red-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => handleSelectPaymentMethod('cod')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="text-xs leading-tight">
                      <p className="font-bold">ชำระเงินปลายทาง</p>
                      <p className="text-[10px] text-gray-500 font-light">{deliveryMethod === 'pickup' ? 'ชำระเมื่อมารับของที่ร้าน' : 'ชำระเมื่อของถึงหน้างาน'}</p>
                    </div>
                  </label>

                  <label 
                    onClick={() => handleSelectPaymentMethod('inquiry')}
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition-all ${
                      paymentMethod === 'inquiry'
                        ? 'border-red-600 bg-red-50/40 text-red-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'inquiry'}
                      onChange={() => handleSelectPaymentMethod('inquiry')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="text-xs leading-tight">
                      <p className="font-bold">ขอใบเสนอราคาทางการ</p>
                      <p className="text-[10px] text-gray-500 font-light">สำหรับงานโครงการ/เบิกจ่าย</p>
                    </div>
                  </label>
                </div>

                {/* เมื่อเลือก "โอนเงินผ่านธนาคาร" แสดงกล่องบัญชีธนาคาร + ช่องอัปโหลดสลิป */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    
                    {/* การ์ดบัญชีธนาคารกสิกรไทย */}
                    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-[#00A950] text-white flex items-center justify-center font-bold shadow-md shrink-0">
                            <span className="text-xl font-black">KB</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                              ธนาคาร กสิกรไทย
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                              หจก.สุโขทัยแสงอุปกรณ์
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              เปิดทุกวัน 08.00 - 17.00 น. | โทร: 055-616437
                            </p>
                          </div>
                        </div>

                        {/* ปุ่มดูป้ายประกาศโอนเงิน */}
                        <button
                          type="button"
                          onClick={() => setIsBankPopupOpen(true)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ดูป้ายประกาศโอนเงิน ↗</span>
                        </button>
                      </div>

                      {/* กล่องแสดงเลขที่บัญชีขนาดใหญ่ + ปุ่ม Copy */}
                      <div className="bg-white rounded-xl p-3 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div className="text-center sm:text-left">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">เลขที่บัญชีเงินฝาก:</span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-wider font-mono select-all">
                            157-2-45402-5
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyBankAccount}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          {copiedBankNum ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                          <span>{copiedBankNum ? 'คัดลอกเลขบัญชีแล้ว!' : 'คัดลอกเลขบัญชี'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-emerald-800/80 flex items-center justify-between pt-1">
                        <span>ยอดโอนที่ต้องชำระ: <strong className="text-emerald-900 font-bold text-xs">฿{grandTotal.toLocaleString('th-TH')}</strong></span>
                        <span className="text-[10px] text-gray-400">*โอนแล้วแนบสลิปด้านล่างได้ทันที</span>
                      </div>
                    </div>

                    {/* ช่องอัปโหลดแนบรูปสลิปโอนเงิน */}
                    <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-300 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>แนบรูปสลิปการโอนเงิน (หลักฐานการชำระเงิน):</span>
                        </label>
                        {slipDataUrl && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>แนบสลิปแล้ว</span>
                          </span>
                        )}
                      </div>

                      {/* กรณียังไม่ได้เลือกสลิป */}
                      {!slipDataUrl ? (
                        <label className="flex flex-col items-center justify-center p-5 bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-200/60 rounded-xl cursor-pointer transition-all group">
                          <UploadCloud className={`w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform mb-2 ${isCompressingSlip ? 'animate-bounce' : ''}`} />
                          <p className="text-xs sm:text-sm font-bold text-gray-800 text-center">
                            {isCompressingSlip ? 'กำลังเตรียมไฟล์รูปสลิป...' : 'คลิกเพื่ออัปโหลดรูปสลิปโอนเงิน หรือ ถ่ายรูปสลิป'}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            รองรับไฟล์ภาพ JPG, PNG, WEBP (ระบบปรับขนาดให้อัตโนมัติ ส่งเร็วทันใจ)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isCompressingSlip}
                            onChange={handleSlipUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        /* กรณีมีสลิปแนบแล้ว แสดงพรีวิว */
                        <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div 
                              onClick={() => setIsSlipZoomOpen(true)}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 cursor-zoom-in group shadow-xs bg-white"
                              title="คลิกเพื่อดูสลิปขนาดเต็ม"
                            >
                              <img
                                src={slipDataUrl}
                                alt="สลิปโอนเงิน"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {slipFileName || 'สลิปการโอนเงิน'}
                              </p>
                              <p className="text-[10px] text-gray-500 font-light">
                                ขนาดไฟล์: {slipFileSize || 'รูปภาพ'}
                              </p>
                              <button
                                type="button"
                                onClick={() => setIsSlipZoomOpen(true)}
                                className="text-[11px] text-emerald-700 hover:underline font-bold cursor-pointer"
                              >
                                ดูรูปสลิปขยายเต็มจอ
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveSlip}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                            title="ลบสลิปนี้และเลือกใหม่"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* กล่องเลือกรับใบกำกับภาษี (Tax Invoice Toggle) */}
                <div className="pt-2 border-t border-gray-200/80">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all">
                    <input
                      type="checkbox"
                      checked={needTaxInvoice}
                      onChange={(e) => setNeedTaxInvoice(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-bold text-gray-800">
                          ต้องการรับใบกำกับภาษีเต็มรูปแบบ (Tax Invoice)
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                        ออกให้ถูกต้องตามกฎหมาย
                      </span>
                    </div>
                  </label>

                  {/* ฟอร์มกรอกข้อมูลสำหรับออกใบกำกับภาษี (เมื่อกดเลือก) */}
                  {needTaxInvoice && (
                    <div className="mt-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3.5 animate-fade-in">
                      <span className="text-xs font-bold text-blue-900 block uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        <span>กรอกข้อมูลสำหรับออกใบกำกับภาษี</span>
                      </span>

                      {/* ประเภทผู้เสียภาษี */}
                      <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                          <input
                            type="radio"
                            name="tax_type"
                            checked={taxType === 'corporate'}
                            onChange={() => setTaxType('corporate')}
                            className="text-blue-600"
                          />
                          <span>นิติบุคคล (บริษัท / ห้างหุ้นส่วนจำกัด)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                          <input
                            type="radio"
                            name="tax_type"
                            checked={taxType === 'individual'}
                            onChange={() => setTaxType('individual')}
                            className="text-blue-600"
                          />
                          <span>บุคคลธรรมดา</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {taxType === 'corporate' ? 'ชื่อนิติบุคคล / บริษัท / หจก.' : 'ชื่อ-นามสกุล ผู้เสียภาษี'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={needTaxInvoice}
                            placeholder={taxType === 'corporate' ? 'เช่น บริษัท สุโขทัยการช่าง จำกัด' : 'เช่น นายสมชาย ใจดี'}
                            value={taxName}
                            onChange={(e) => setTaxName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            เลขประจำตัวผู้เสียภาษี (13 หลัก) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={needTaxInvoice}
                            maxLength={13}
                            placeholder="เช่น 0645550000000"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 font-mono focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            สาขา
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                              <input
                                type="radio"
                                name="branch_type"
                                checked={taxBranch === 'สำนักงานใหญ่'}
                                onChange={() => setTaxBranch('สำนักงานใหญ่')}
                                className="text-blue-600"
                              />
                              <span>สำนักงานใหญ่</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                              <input
                                type="radio"
                                name="branch_type"
                                checked={taxBranch !== 'สำนักงานใหญ่'}
                                onChange={() => setTaxBranch('สาขาที่ 00001')}
                                className="text-blue-600"
                              />
                              <span>สาขา</span>
                            </label>
                            {taxBranch !== 'สำนักงานใหญ่' && (
                              <input
                                type="text"
                                placeholder="ระบุเลขที่สาขา เช่น สาขาที่ 00001"
                                value={taxBranch}
                                onChange={(e) => setTaxBranch(e.target.value)}
                                className="px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-lg flex-1"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ที่อยู่ออกใบกำกับภาษี */}
                      <div className="space-y-1.5">
                        <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={useSameAddressForTax}
                            onChange={(e) => setUseSameAddressForTax(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>ใช้ที่อยู่เดียวกันกับสถานที่จัดส่งสินค้า/สถานที่รับของ</span>
                        </label>

                        {!useSameAddressForTax && (
                          <div className="pt-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              ที่อยู่สำหรับออกใบกำกับภาษี <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={2}
                              required={needTaxInvoice && !useSameAddressForTax}
                              placeholder="ระบุเลขที่ตั้ง อาคาร ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                              value={taxAddress}
                              onChange={(e) => setTaxAddress(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-blue-600 resize-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    หมายเหตุเพิ่มเติมถึงพนักงาน (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ทางเข้าแคบ รถ 6 ล้อเข้าไม่ได้ หรือ ให้โทรหาก่อนเข้าส่ง 30 นาที"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* ส่วนที่ 4: สรุปยอดเงินและรายการสินค้า */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>สรุปยอดคำสั่งซื้อ ({cart.length} รายการสินค้า)</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    {deliveryMethod === 'pickup' ? 'รับเองที่ร้าน (ฟรีค่าส่ง)' : `ระยะทาง: ${locationData?.distanceKm || 0} กม.`}
                  </span>
                </div>

                {/* รายการสินค้าในตะกร้า */}
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800">
                  {cart.map((ci) => {
                    const price = ci.item.promoPrice !== undefined && ci.item.promoPrice < ci.item.regularPrice ? ci.item.promoPrice : ci.item.regularPrice;
                    return (
                      <div key={ci.item.id} className="pt-2 first:pt-0 flex justify-between items-baseline text-xs">
                        <span className="text-slate-300 truncate pr-3">
                          {ci.item.name} × {ci.quantity} {ci.item.unit || ''}
                        </span>
                        <span className="text-slate-200 font-mono font-medium shrink-0">
                          ฿{(price * ci.quantity).toLocaleString('th-TH')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* แถวแสดงผลรวมเงิน */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>ยอดรวมค่าสินค้า (Subtotal)</span>
                    <span className="font-mono">฿{subtotal.toLocaleString('th-TH')}</span>
                  </div>

                  <div className="flex justify-between text-slate-300 items-baseline">
                    <div className="flex items-center gap-1.5">
                      <span>รูปแบบการรับของ</span>
                      <span className="text-[10px] text-slate-400">
                        ({deliveryMethod === 'pickup' ? 'รับเองที่ร้านสุโขทัยแสงอุปกรณ์' : (locationData?.evaluation.zoneName || 'กำลังประเมิน')})
                      </span>
                    </div>
                    {deliveryMethod === 'pickup' ? (
                      <span className="text-emerald-400 font-bold">รับเองที่ร้าน (ฟรี ฿0)</span>
                    ) : locationData?.evaluation.isFreeDelivery ? (
                      <span className="text-emerald-400 font-bold">ส่งฟรี! (฿0)</span>
                    ) : locationData?.evaluation.isOutOfZone ? (
                      <span className="text-amber-400 font-bold">ติดต่อสอบถาม</span>
                    ) : (
                      <span className="font-mono text-red-400 font-bold">
                        ฿{deliveryFee.toLocaleString('th-TH')}
                      </span>
                    )}
                  </div>

                  {needTaxInvoice && (
                    <div className="flex justify-between text-blue-300 text-[11px] pt-1">
                      <span>เอกสารภาษี:</span>
                      <span>ขอใบกำกับภาษีเต็มรูป ({taxType === 'corporate' ? 'นิติบุคคล' : 'บุคคลธรรมดา'})</span>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="flex justify-between text-emerald-300 text-[11px] pt-1">
                      <span>การชำระเงิน:</span>
                      <span>โอนกสิกรไทย 157-2-45402-5 {slipDataUrl ? '(แนบสลิปแล้ว ✓)' : '(ยังไม่แนบสลิป)'}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline text-base sm:text-lg font-black">
                    <span className="text-white">ยอดสุทธิที่ต้องชำระทั้งสิ้น</span>
                    <span className="text-red-400 font-mono text-xl sm:text-2xl">
                      ฿{grandTotal.toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
                  <span>📩 ส่งออเดอร์ไปที่: <strong>scghomessk@gmail.com</strong></span>
                  <span>ร้านสุโขทัยแสงอุปกรณ์ โทร 055-616437</span>
                </div>
              </div>

              {/* ปุ่มยืนยันส่งคำสั่งซื้อ */}
              <div className="space-y-3 pt-2">
                {paymentMethod === 'bank_transfer' && !slipDataUrl && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-950">ยังไม่ได้แนบสลิปโอนเงิน (ส่งคำสั่งซื้อก่อนได้ค่ะ)</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed font-light">
                        หากโอนเงินแล้ว สามารถกดแนบรูปสลิปในหัวข้อ 3 เพื่อความรวดเร็ว หรือกดยืนยันเลยแล้วส่งสลิปให้พนักงานทาง LINE @exu1868n ภายหลังได้ค่ะ
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  <Send className={`w-5 h-5 ${isSubmitting ? 'animate-bounce' : ''}`} />
                  <span>{isSubmitting ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันและส่งคำสั่งซื้อทันที'}</span>
                </button>

                <p className="text-[11px] text-center text-gray-400 font-light">
                  * เมื่อกดยืนยัน ข้อมูลออเดอร์จะถูกส่งไปยังอีเมล scghomessk@gmail.com และบันทึกลงระบบ เจ้าหน้าที่จะโทรติดต่อกลับเพื่อยืนยันการจัดส่งค่ะ
                </p>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. ป๊อปอัพข้อมูลช่องทางการโอนเงิน ธนาคารกสิกรไทย */}
      {isBankPopupOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in overscroll-contain"
          onClick={() => setIsBankPopupOpen(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 p-5 sm:p-6 text-center space-y-4 font-sans max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsBankPopupOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="ปิดป๊อปอัพ"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#00A950] text-white flex items-center justify-center font-black text-xl shadow-md">
                KB
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900">
                ช่องทางการโอนเงิน
              </h3>
              <p className="text-xs text-emerald-700 font-semibold">
                ธนาคาร กสิกรไทย
              </p>
            </div>

            <div className="bg-gradient-to-b from-emerald-50 via-white to-emerald-50 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  เลขบัญชี
                </span>
                <div className="bg-white py-2.5 px-4 rounded-xl border border-emerald-300 shadow-inner flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono tracking-wider select-all mx-auto">
                    157-2-45402-5
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyBankAccount}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {copiedBankNum ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                <span>{copiedBankNum ? '✓ คัดลอกเลขบัญชีเรียบร้อยแล้ว!' : '📋 กดเพื่อคัดลอกเลขบัญชี'}</span>
              </button>

              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  ชื่อบัญชี
                </span>
                <div className="bg-emerald-100/60 py-2.5 px-3 rounded-xl border border-emerald-300">
                  <span className="text-sm sm:text-base font-black text-emerald-950 block">
                    หจก.สุโขทัยแสงอุปกรณ์
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">ยอดเงินที่ต้องโอน:</span>
                <span className="text-base font-black text-red-600 font-mono">
                  ฿{grandTotal.toLocaleString('th-TH')}
                </span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-between gap-3">
              <div 
                onClick={() => setIsBankFlyerZoomOpen(true)}
                className="w-12 h-16 rounded-lg overflow-hidden border border-emerald-300 shrink-0 cursor-zoom-in relative group"
                title="คลิกดูรูปป้ายขนาดใหญ่"
              >
                <img
                  src="/assets/aistudio/_____1_e4ae11bc.png"
                  alt="ป้ายบัญชีกสิกรไทย หจก.สุโขทัยแสงอุปกรณ์"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">ป้ายบัญชีร้านอย่างเป็นทางการ</p>
                <p className="text-[10px] text-gray-500 leading-tight">เปิดทุกวัน เวลา 08.00 - 17.00 น. | โทร: 055-616437</p>
                <button
                  type="button"
                  onClick={() => setIsBankFlyerZoomOpen(true)}
                  className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  คลิกขยายดูรูปป้ายเต็ม ↗
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBankPopupOpen(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              รับทราบเลขบัญชีแล้ว (ปิดหน้าต่างและแนบสลิป)
            </button>
          </div>
        </div>
      )}

      {/* 3. ซูมดูรูปป้ายบัญชีร้านขนาดเต็มจอ */}
      {isBankFlyerZoomOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={() => setIsBankFlyerZoomOpen(false)}
        >
          <button
            onClick={() => setIsBankFlyerZoomOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-md max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()}>
            <img
              src="/assets/aistudio/_____1_e4ae11bc.png"
              alt="ป้ายช่องทางการโอน ธนาคารกสิกรไทย หจก.สุโขทัยแสงอุปกรณ์"
              className="w-full h-auto max-h-[85vh] object-contain select-none"
            />
          </div>
        </div>
      )}

      {/* 4. ซูมดูสลิปที่ลูกค้าแนบ */}
      {isSlipZoomOpen && slipDataUrl && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={() => setIsSlipZoomOpen(false)}
        >
          <button
            onClick={() => setIsSlipZoomOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-md max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()}>
            <img
              src={slipDataUrl}
              alt="สลิปโอนเงินขยายเต็มจอ"
              className="w-full h-auto max-h-[85vh] object-contain select-none"
            />
          </div>
        </div>
      )}

      {/* 5. หน้าต่างแจ้งเตือนผลลัพธ์คำสั่งซื้อ (Order Result Modal) */}
      {isSuccessModalOpen && completedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in overscroll-contain"
          id="order-success-modal"
        >
          <div 
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-5 relative border border-gray-150 transform transition-all font-sans max-h-[92vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ไอคอนความสำเร็จสีเขียว */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner bg-emerald-50 text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">
                ส่งคำสั่งซื้อสำเร็จ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 pt-2">
                ขอบพระคุณสำหรับคำสั่งซื้อค่ะ!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                รหัสคำสั่งซื้อของคุณคือ <strong className="text-red-600 font-bold">#{completedOrder.orderId}</strong>
              </p>
            </div>

            {/* แสดงรูปแบบการรับของ */}
            {completedOrder.deliveryMethod === 'pickup' && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-left space-y-1">
                <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <span>รับสินค้าเองที่หน้าร้านสุโขทัยแสงอุปกรณ์ (ฟรีค่าส่ง)</span>
                </span>
                <p className="text-xs text-emerald-800 font-medium">
                  ทางร้านจะเช็คสินค้าและแจ้งวันนัดรับสินค้ากับลูกค้าอีกครั้งผ่านเบอร์โทร <strong className="text-red-600 font-bold underline">{completedOrder.phone}</strong> นี้ค่ะ
                </p>
              </div>
            )}

            {/* แสดงพรีวิวสลิปโอนเงินหากมีแนบมา */}
            {slipDataUrl && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center space-x-3">
                  <img
                    src={slipDataUrl}
                    alt="สลิปที่แนบ"
                    className="w-12 h-12 object-cover rounded-lg border border-emerald-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">✓ แนบหลักฐานสลิปโอนเงินแล้ว</span>
                    <span className="text-[11px] text-gray-500">ยอดชำระ: ฿{grandTotal.toLocaleString('th-TH')}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full">
                  แนบแล้ว
                </span>
              </div>
            )}

            {/* กล่องสรุปสถานะการจัดส่ง & ติดต่อกลับ */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>บันทึกคำสั่งซื้อเข้าสู่ระบบเรียบร้อยแล้ว</span>
              </div>
              {completedOrder.customerEmail && (
                <p className="text-xs text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-300">
                  📧 <strong>ส่งสรุปคำสั่งซื้อไปยังอีเมลลูกค้าแล้ว:</strong> {completedOrder.customerEmail}
                </p>
              )}
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                เจ้าหน้าที่ร้านสุโขทัยแสงอุปกรณ์จะทำการตรวจสอบรายการสินค้า และโทรติดต่อกลับหาคุณที่เบอร์ <strong>{completedOrder.phone}</strong> เพื่อยืนยันการจัดส่งค่ะ
              </p>
            </div>

            {/* กล่องแจ้งเตือน: ลูกค้าสามารถกดส่งผ่านไลน์อีกครั้ง หรือคัดลอกคำสั่งซื้อไว้เพื่อเป็นหลักฐาน */}
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                ลูกค้าสามารถกดส่งผ่านไลน์อีกครั้ง หรือคัดลอกคำสั่งซื้อไว้เพื่อเป็นหลักฐาน
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="https://lin.ee/vbEDI1N"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleCopySummary(completedOrder.summaryText)}
                  className="flex-1 py-3 px-4 bg-[#06C755] hover:bg-[#05B04B] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>🟢 ส่งผ่าน LINE (@exu1868n)</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopySummary(completedOrder.summaryText)}
                  className="flex-1 py-3 px-4 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-700" />}
                  <span>{copiedText ? 'คัดลอกสรุปคำสั่งซื้อแล้ว!' : '📋 คัดลอกสรุปคำสั่งซื้อ'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setCompletedOrder(null);
                handleRemoveSlip();
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            >
              เสร็จสิ้นและกลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      )}
    </>
  );
}
