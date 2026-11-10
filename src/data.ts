/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SheetItem {
  id: string;
  category: 'service' | 'product' | 'estimation';
  tabName?: string; // tab name from sheet
  subCategory?: string; // sub-classification for roof
  name: string;
  regularPrice: number;
  promoPrice?: number;
  unit?: string; // Product unit from Column D (e.g. ชิ้น, กล่อง, ถุง, แผ่น)
  note?: string;
  image: string;
  images?: string[]; // Multiple images array for carousel
  status?: string; // 'clearance' or others
  brand?: string; // Brand/manufacturer name from sheet if available
  barcode?: string; // Product barcode from sheet if available
}

export interface ReviewItem {
  id: string;
  name: string;
  comment: string;
  image?: string;
  rating?: number;
  location?: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  period: string;
  details: string;
  image: string;
  coverImage?: string;
}

// Helper to convert Google Drive link to Direct View link
export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // Regular expression to extract the ID from typical Google Drive file links
  const driveRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://docs.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
}

// Helper to parse multiple images from a single Google Sheets cell (split by spaces, commas or newlines)
export function parseMultipleImages(rawImage: string): string[] {
  if (!rawImage) return [];
  // Split by comma, whitespace, or pipe symbols
  const parts = rawImage.split(/[,|\s\n\r]+/).map(item => item.trim()).filter(Boolean);
  return parts.map(url => getDirectImageUrl(url));
}

// Configured Sheets ID
export const SPREADSHEET_ID = '1FVCddjaT5h3OY2CLfmQ93brzs20tKiczPn8R0DGad4Y';
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?usp=sharing`;

// Cache configuration
const CACHE_KEY_CATALOG = 'sukhothai_catalog_v9';
const CACHE_KEY_REVIEWS = 'sukhothai_reviews_v8';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

// Defined Tabs
export const SERVICE_TABS = [
  "บริการหลังคา",
  "รีโนเวทบ้าน",
  "ติดตั้งฉนวนกันความร้อน",
  "ติดตั้งโรงรถ กันสาด",
  "ติดตั้งโซล่าเซลล์",
  "ติดตั้งรางน้ำฝน",
  "ทาสี พ่นสีหลังคา",
  "บริการอื่นๆ"
];

export const PRODUCT_TABS = [
  "หลังคาและอุปกรณ์",
  "กระเบื้องพื้น",
  "สุขภัณฑ์ อ่างล้างหน้า",
  "เครื่องมือช่าง",
  "เครื่องมือไฟฟ้า",
  "ฮาร์ดแวร์",
  "อุปกรณ์ความปลอดภัย",
  "ประปา",
  "ไฟฟ้าแสงสว่าง",
  "อุปกรณ์ห้องน้ำ",
  "สีและอุปกรณ์",
  "เคมีภัณฑ์",
  "ประตู หน้าต่าง",
  "พื้น ผนังและฝ้า",
  "เหล็ก ปูน",
  "อุปกรณ์ทำสวน",
  "สินค้าอื่นๆ"
];

// 100% realistic Thai high-fidelity fallback catalog
export const LOCAL_CATALOG: SheetItem[] = [
  {
    id: 'srv-roof-1',
    category: 'service',
    tabName: 'บริการหลังคา',
    name: 'บริการตรวจสอบปัญหาหลังคารั่ว-ซ่อมรั่ว',
    regularPrice: 1000,
    promoPrice: 899,
    note: 'ค่าสำรวจใช้เป็นส่วนลดตอนซ่อมได้',
    image: 'https://storage.googleapis.com/prod-qchang-v1/products/upload/20240705/202407051656382.webp',
    images: ['https://storage.googleapis.com/prod-qchang-v1/products/upload/20240705/202407051656382.webp']
  },
  {
    id: 'srv-roof-2',
    category: 'service',
    tabName: 'บริการหลังคา',
    name: 'บริการตรวจสอบปัญหาหลังคารั่วและฝ้าเพดาน',
    regularPrice: 1000,
    promoPrice: 899,
    note: 'ค่าสำรวจใช้เป็นส่วนลดตอนซ่อมได้',
    image: 'https://storage.googleapis.com/prod-qchang-v1/products/upload/20240710/20240710192506July_PDP%20Plan%20Aw%2001.4.webp',
    images: ['https://storage.googleapis.com/prod-qchang-v1/products/upload/20240710/20240710192506July_PDP%20Plan%20Aw%2001.4.webp']
  },
  {
    id: 'srv-roof-3',
    category: 'service',
    tabName: 'บริการหลังคา',
    name: 'บริการเปลี่ยนวัสดุมุงหลังคา (Re-Roof)',
    regularPrice: 1000,
    promoPrice: 899,
    note: 'ค่าสำรวจใช้เป็นส่วนลดตอนซ่อมได้',
    image: 'https://storage.googleapis.com/prod-qchang-v1/products/upload/20240705/20240705165647July_Aw%201-%204%20%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8B%E0%B9%88%E0%B8%AD%E0%B8%A1%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%A5%E0%B8%B0%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%20%28Re%20roof%29.webp',
    images: ['https://storage.googleapis.com/prod-qchang-v1/products/upload/20240705/20240705165647July_Aw%201-%204%20%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8B%E0%B9%88%E0%B8%AD%E0%B8%A1%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%A5%E0%B8%B0%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%20%28Re%20roof%29.webp']
  },
  {
    id: 'srv-roof-4',
    category: 'service',
    tabName: 'บริการหลังคา',
    name: 'บริการเสริมหลังคาแบบซ้อนทับ (Double Roof)',
    regularPrice: 1000,
    promoPrice: 899,
    note: 'ค่าสำรวจใช้เป็นส่วนลดตอนซ่อมได้',
    image: 'https://storage.googleapis.com/prod-qchang-v1/products/upload/20240705/20240705165644July_Aw%201-%204%20%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8B%E0%B9%88%E0%B8%AD%E0%B8%A1%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%A5%E0%B8%B0%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%20%28Doble%20roof%29.webp',
    images: ['https://storage.googleapis.com/prod-qchang-v1/products/upload/20240705/20240705165644July_Aw%201-%204%20%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8B%E0%B9%88%E0%B8%AD%E0%B8%A1%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%A5%E0%B8%B0%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%20%28Doble%20roof%29.webp']
  },
  {
    id: 'srv-1',
    category: 'service',
    name: 'บริการติดตั้งและมุงหลังคาบ้านโครงเหล็ก',
    regularPrice: 45000,
    promoPrice: 39900,
    note: 'โดยทีมช่างผู้เชี่ยวชาญ รับประกันผลงาน 1 ปี',
    image: 'https://images.unsplash.com/photo-1628744448840-55bef34e2bc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-2',
    category: 'service',
    name: 'บริการทาสีบ้านและอาคารพาณิชย์ครบวงจร',
    regularPrice: 25000,
    promoPrice: 21900,
    note: 'ราคารวมค่าแรงและสีเกรดพรีเมียม TOA Shield-One',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-3',
    category: 'service',
    name: 'บริการเดินสายไฟและวางระบบไฟฟ้านิรภัยในบ้าน',
    regularPrice: 12000,
    note: 'ใช้อุปกรณ์ตัดไฟแบรนด์ Schneider มาตรฐานความปลอดภัยสูง',
    image: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-1',
    category: 'product',
    subCategory: 'หลังคาคอนกรีต',
    name: 'ปูนซีเมนต์โครงสร้าง SCG แดง ซูเปอร์พาวเวอร์ (50 กก.)',
    regularPrice: 165,
    promoPrice: 149,
    unit: 'ถุง',
    note: 'สูตรไฮบริด กำลังอัดสูง เหมาะสำหรับงานคอนกรีตฐานราก เสา คาน',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-3',
    category: 'product',
    name: 'สว่านโรตารี่ Bosch 3 ระบบ รุ่น GBH 2-26 DFR (800W)',
    regularPrice: 6200,
    promoPrice: 4990,
    unit: 'เครื่อง',
    status: 'clearance',
    note: 'ล็อตพิเศษ Clearance ล้างสต๊อก ประสิทธิภาพสูง ของแท้ประกันศูนย์',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'est-1',
    category: 'estimation',
    name: 'บริการถอดแบบประมาณราคางานบ้านเดี่ยว 1 ชั้น',
    regularPrice: 3500,
    promoPrice: 2900,
    note: 'ถอดรายละเอียดเสา คาน ผนัง โครงหลังคา และประปาไฟฟ้าครบถ้วนพร้อมไฟล์ BOQ สำหรับยื่นกู้ธนาคาร',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
  }
];

export const LOCAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'คุณสมชาย',
    comment: 'มาใช้บริการถอดแบบประมาณราคากลางสำหรับยื่นกู้ธนาคาร รวดเร็วและละเอียดมากครับ เอกสารแยกเป็นหมวดหมู่ชัดเจน ธนาคารพิจารณาผ่านฉลุยเลย แนะนำจริงๆ ครับ!',
    rating: 5,
    location: 'อ.เมืองสุโขทัย',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-2',
    name: 'คุณวิภา',
    comment: 'สั่งสีทาบ้าน TOA จากที่นี่ไปทำบ้านใหม่ ได้ส่วนลดเยอะมาก แถมพี่แอดมินคอยแนะนำเรื่องคุณสมบัติของรุ่นสีก่อนทาได้ดีมาก ประทับใจความเป็นกันเองและของดีมีคุณภาพค่ะ',
    rating: 5,
    location: 'อ.สวรรคโลก',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-3',
    name: 'คุณธนกร',
    comment: 'จ้างช่างมุงหลังคาโครงเหล็กของสุโขทัยแสงอุปกรณ์ งานดีเนี้ยบระเบียบดีมาก ไม่ทิ้งงานเลย มีเจ้าหน้าที่โทรสอบถามตลอด และมีรับประกันงาน 1 ปี สบายใจไร้กังวลจริงตามสโลแกน',
    rating: 5,
    location: 'อ.ศรีสัชนาลัย',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
  }
];

// RFC 4180 Compliant CSV Parser
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      result.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }
  return result;
}

function parsePrice(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, '').replace(/฿/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

const findColumnIndex = (headers: string[], keywords: string[]): number => {
  return headers.findIndex(h => {
    const headerStr = h.toLowerCase().trim();
    return keywords.some(kw => headerStr.includes(kw.toLowerCase()));
  });
};

async function fetchTabCSV(tabName: string): Promise<string[][]> {
  const cacheBust = new Date().getTime();
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&cachebust=${cacheBust}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP Error fetching ${tabName}`);
  }
  const text = await response.text();
  return parseCSV(text);
}

// Dynamically discover all service tabs from Google Sheets in real-time
export async function getDynamicServiceTabs(): Promise<string[]> {
  try {
    const cacheBust = new Date().getTime();
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/htmlview?cachebust=${cacheBust}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const text = await response.text();
      const regex = /items\.push\(\{\s*name:\s*"((?:\\.|[^"\\])*)"/g;
      const discoveredTabs: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        try {
          discoveredTabs.push(JSON.parse(`"${m[1]}"`));
        } catch {
          discoveredTabs.push(m[1]);
        }
      }

      // Non-service tabs (product tabs, review tabs, etc.)
      const nonServiceTabs = new Set([
        ...PRODUCT_TABS,
        "พื้น ผนัง และฝ้า",
        "ผนังและฝ้า",
        "ภาพรีวิว",
        "โปรโมชั่น",
        "ถอดแบบประมาณการ",
        "Sheet1",
        "Sheet2"
      ]);

      const serviceDiscovered = discoveredTabs.filter(tab => {
        const trimmed = tab.trim();
        if (SERVICE_TABS.includes(trimmed)) return true;
        if (nonServiceTabs.has(trimmed)) return false;
        return true;
      });

      // Union with default SERVICE_TABS to ensure nothing is missed
      return Array.from(new Set([...SERVICE_TABS, ...serviceDiscovered]));
    }
  } catch (err) {
    console.warn("Could not dynamically query service tabs from htmlview, falling back to default SERVICE_TABS:", err);
  }
  return SERVICE_TABS;
}

// Parse a single service row across every column with no limitation on column count
export function parseServiceRow(cells: string[], headers: string[], tabName: string, rowIndex: number): SheetItem | null {
  if (!cells || cells.length === 0) return null;
  // If row is completely empty, skip
  if (cells.every(c => !c || c.trim() === '')) return null;

  // 1. Unlimited column header mapping
  const catIdx = findColumnIndex(headers, ['หมวดหมู่ใหญ่', 'หมวดหมู่', 'category', 'กลุ่มหลัก']);
  const subCatIdx = findColumnIndex(headers, ['ประเภทบริการงานช่างย่อย', 'ประเภทย่อย', 'ประเภทบริการ', 'ประเภทงาน', 'กลุ่มย่อย', 'หมวดหมู่ย่อย', 'subcategory', 'sub_category']);
  const nameIdx = findColumnIndex(headers, ['ชื่อบริการ', 'ชื่อบริการงานช่าง', 'ชื่อสินค้า', 'รายการบริการ', 'รายการ', 'ชื่อ', 'name', 'title', 'service_name', 'service']);
  const regPriceIdx = findColumnIndex(headers, ['ราคาปกติ', 'ราคาเดิม', 'ราคาตั้ง', 'regular price', 'regular_price', 'normal price', 'ราคา']);
  const promoPriceIdx = findColumnIndex(headers, ['ราคาโปรโมชั่น', 'ราคาพิเศษ', 'โปรโมชั่น', 'ราคาลด', 'ลดราคา', 'promo', 'promotion', 'special price', 'promo_price']);
  const noteIdx = findColumnIndex(headers, ['หมายเหตุ', 'รายละเอียดบริการ', 'รายละเอียด', 'ข้อความ', 'เงื่อนไข', 'note', 'description', 'detail', 'details', 'remark']);
  const imageIdx = findColumnIndex(headers, ['link รูปภาพ', 'ลิงก์รูปภาพ', 'ลิงค์รูปภาพ', 'รูปภาพ', 'รูป', 'link รูป', 'image', 'picture', 'photo', 'url', 'images', 'img']);
  const statusIdx = findColumnIndex(headers, ['status', 'สถานะ', 'สเตตัส']);
  const brandIdx = findColumnIndex(headers, ['แบรนด์', 'ยี่ห้อ', 'brand', 'brand_name', 'ผู้ผลิต']);
  const barcodeIdx = findColumnIndex(headers, ['บาร์โค้ด', 'barcode', 'bar']);
  const unitIdx = findColumnIndex(headers, ['หน่วยสินค้า', 'หน่วยนับ', 'หน่วย', 'unit', 'unit_name']);

  // Extract raw values by identified indices
  let rawCategory = (catIdx !== -1 && catIdx < cells.length) ? cells[catIdx].trim() : '';
  let rawSubCategory = (subCatIdx !== -1 && subCatIdx < cells.length) ? cells[subCatIdx].trim() : '';
  let rawName = (nameIdx !== -1 && nameIdx < cells.length) ? cells[nameIdx].trim() : '';
  let rawRegPrice = (regPriceIdx !== -1 && regPriceIdx < cells.length) ? parsePrice(cells[regPriceIdx]) : 0;
  let rawPromoPrice = (promoPriceIdx !== -1 && promoPriceIdx < cells.length && cells[promoPriceIdx].trim() !== '') ? parsePrice(cells[promoPriceIdx]) : undefined;
  let rawNote = (noteIdx !== -1 && noteIdx < cells.length) ? cells[noteIdx].trim() : '';
  let rawImage = (imageIdx !== -1 && imageIdx < cells.length) ? cells[imageIdx].trim() : '';
  let rawStatus = (statusIdx !== -1 && statusIdx < cells.length) ? cells[statusIdx].trim() : '';
  let rawBrand = (brandIdx !== -1 && brandIdx < cells.length) ? cells[brandIdx].trim() : '';
  let rawBarcode = (barcodeIdx !== -1 && barcodeIdx < cells.length) ? cells[barcodeIdx].trim() : '';
  let rawUnit = (unitIdx !== -1 && unitIdx < cells.length) ? cells[unitIdx].trim() : '';

  // Positional fallback if headers were not present or matched:
  // Standard layout in Google Sheets:
  // Col 0: หมวดหมู่ใหญ่ (บริการ)
  // Col 1: ประเภทบริการงานช่างย่อย (เช่น บริการหลังคา)
  // Col 2: ชื่อบริการ
  // Col 3: ราคาปกติ
  // Col 4: ราคาโปรโมชั่น
  // Col 5: หมายเหตุ
  // Col 6: link รูปภาพ
  if (!rawName) {
    if ((cells[0] || '').trim() === 'บริการ' || (cells[0] || '').trim() === 'service') {
      rawCategory = cells[0].trim();
      if (!rawSubCategory && cells[1]) rawSubCategory = cells[1].trim();
      if (cells[2]) rawName = cells[2].trim();
      if (rawRegPrice === 0 && cells[3]) rawRegPrice = parsePrice(cells[3]);
      if (rawPromoPrice === undefined && cells[4]) rawPromoPrice = parsePrice(cells[4]);
      if (!rawNote && cells[5]) rawNote = cells[5].trim();
      if (!rawImage && cells[6]) rawImage = cells[6].trim();
      if (!rawStatus && cells[7]) rawStatus = cells[7].trim();
    } else {
      // Find the first column containing text that is not a numeric price and not an image link
      for (let c = 0; c < cells.length; c++) {
        const val = (cells[c] || '').trim();
        if (val && !val.startsWith('http') && isNaN(parsePrice(val)) && val !== 'บริการ') {
          rawName = val;
          break;
        }
      }
    }
  }

  // Scan ALL columns across the row for image links (support unlimited columns)
  const allImageUrls: string[] = [];
  if (rawImage) {
    allImageUrls.push(...parseMultipleImages(rawImage));
  }
  for (let c = 0; c < cells.length; c++) {
    if (c === imageIdx) continue;
    const val = (cells[c] || '').trim();
    if (val.startsWith('http://') || val.startsWith('https://') || val.includes('drive.google.com') || val.includes('storage.googleapis.com')) {
      const urls = parseMultipleImages(val);
      urls.forEach(u => {
        if (!allImageUrls.includes(u)) allImageUrls.push(u);
      });
    }
  }

  // If still no name, row is not a valid service item
  if (!rawName || rawName.trim() === '') return null;

  // Determine category
  let category: 'service' | 'product' | 'estimation' = 'service';
  const checkText = `${rawCategory} ${rawName} ${rawNote} ${tabName}`.toLowerCase();
  if (checkText.includes('ถอดแบบ') || checkText.includes('ประมาณการ') || checkText.includes('estimation')) {
    category = 'estimation';
  } else if (rawCategory === 'สินค้า' || rawCategory.toLowerCase() === 'product') {
    category = 'product';
  }

  // SubCategory / TabName
  const finalTabName = rawSubCategory || tabName;

  // Check promo price sanity
  const finalPromoPrice = (rawPromoPrice !== undefined && rawRegPrice > 0 && rawPromoPrice < rawRegPrice) 
    ? rawPromoPrice 
    : (rawPromoPrice !== undefined && rawRegPrice === 0 ? rawPromoPrice : undefined);

  return {
    id: `sheet-srv-${tabName}-${rowIndex}`,
    category,
    tabName: finalTabName,
    name: rawName,
    regularPrice: rawRegPrice,
    promoPrice: finalPromoPrice,
    unit: rawUnit || undefined,
    note: rawNote,
    image: allImageUrls[0] || (rawImage ? getDirectImageUrl(rawImage) : ''),
    images: allImageUrls.length > 0 ? allImageUrls : (rawImage ? [getDirectImageUrl(rawImage)] : []),
    status: rawStatus ? rawStatus.toLowerCase().trim() : undefined,
    brand: rawBrand || undefined,
    barcode: rawBarcode || undefined
  };
}

// Real-time Service Data Fetching API:
// Fetches every sheet/tab, every column, and every row for the Services page directly from Google Sheets
export async function fetchServicesData(forceRefresh = true): Promise<SheetItem[]> {
  try {
    const tabsToFetch = await getDynamicServiceTabs();
    console.log(`[Services Realtime API] Fetching ${tabsToFetch.length} service tabs dynamically:`, tabsToFetch);

    const servicePromises = tabsToFetch.map(async (tab) => {
      try {
        const rows = await fetchTabCSV(tab);
        if (!rows || rows.length === 0) return [];

        // Check if row 0 is header or data
        const firstRow = rows[0] || [];
        const isHeader = firstRow.some(cell => {
          const str = (cell || '').toLowerCase().trim();
          return ['ชื่อ', 'ราคา', 'หมวด', 'หมายเหตุ', 'รูป', 'name', 'price', 'category', 'image'].some(kw => str.includes(kw));
        });

        const headers = isHeader ? firstRow : [];
        const startRowIndex = isHeader ? 1 : 0;

        const tabItems: SheetItem[] = [];
        // Iterate every single row from first to last with data
        for (let i = startRowIndex; i < rows.length; i++) {
          const cells = rows[i];
          const item = parseServiceRow(cells, headers, tab, i);
          if (item) {
            tabItems.push(item);
          }
        }
        return tabItems;
      } catch (err) {
        console.warn(`[Services Realtime API] Could not load tab ${tab}:`, err);
        return [];
      }
    });

    const results = await Promise.all(servicePromises);
    const flatServices: SheetItem[] = [];
    results.forEach(list => flatServices.push(...list));

    console.log(`[Services Realtime API] Successfully fetched ${flatServices.length} live service items from Google Sheets`);
    return flatServices;
  } catch (err) {
    console.error("[Services Realtime API] Error fetching live services:", err);
    return [];
  }
}

export async function fetchSheetData(forceRefresh = false): Promise<SheetItem[]> {
  // Always try to fetch fresh data from Google Sheets first to ensure real-time updates.
  // The localStorage cache is only used as a fallback when offline or if fetch fails.
  try {
    console.log('Fetching live catalog data from Google Sheets in parallel...');
    const allItems: SheetItem[] = [];

    // 1. Fetch all service items in real time via the dynamic service fetching API
    const serviceItemsPromise = fetchServicesData(forceRefresh);

    // Map product tabs
    const productPromises = PRODUCT_TABS.map(async (tab) => {
      try {
        let rows = await fetchTabCSV(tab);
        if (tab === "พื้น ผนังและฝ้า" && (rows.length <= 1 || (rows[0] && rows[0].some(h => h.includes('หมวดหมู่ใหญ่'))))) {
          for (const candidate of ["พื้น ผนัง และฝ้า", "ผนังและฝ้า"]) {
            try {
              const altRows = await fetchTabCSV(candidate);
              if (altRows.length > 1 && !altRows[0].some(h => h.includes('หมวดหมู่ใหญ่'))) {
                rows = altRows;
                break;
              }
            } catch {
              // ignore and try next
            }
          }
        }
        if (rows.length <= 1) return [];
        const headers = rows[0];

        const nameIdx = findColumnIndex(headers, ['ชื่อสินค้า', 'ชื่อบริการ', 'ชื่อ', 'รายการ', 'name', 'title']);
        const regPriceIdx = findColumnIndex(headers, ['ราคาปกติ', 'ราคาเดิม', 'regular price', 'regular_price', 'ราคา']);
        const promoPriceIdx = findColumnIndex(headers, ['ราคาโปรโมชั่น', 'ราคาพิเศษ', 'โปรโมชั่น', 'ลดราคา', 'promo', 'promotion']);
        const noteIdx = findColumnIndex(headers, ['หมายเหตุ', 'รายละเอียด', 'note', 'description']);
        const imageIdx = findColumnIndex(headers, ['link รูปภาพ', 'รูปภาพ', 'รูป', 'link รูป', 'image', 'picture', 'url']);
        const statusIdx = findColumnIndex(headers, ['status', 'สถานะ', 'สเตตัส']);
        const brandIdx = findColumnIndex(headers, ['แบรนด์', 'ยี่ห้อ', 'brand', 'brand_name', 'ผู้ผลิต']);
        const barcodeIdx = findColumnIndex(headers, ['บาร์โค้ด', 'barcode']);
        const unitIdx = findColumnIndex(headers, ['หน่วยสินค้า', 'หน่วยนับ', 'หน่วย', 'unit', 'unit_name']);

        const tabItems: SheetItem[] = [];
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i];
          if (!cells || cells.length === 0) continue;

          // Skip completely empty or deleted rows
          if (cells.every(c => !c || c.trim() === '')) continue;

          const rawName = nameIdx !== -1 && cells[nameIdx] ? cells[nameIdx] : cells[0];
          if (!rawName || rawName.trim() === '') continue;

          const rawRegPrice = regPriceIdx !== -1 ? parsePrice(cells[regPriceIdx]) : 0;
          const rawPromoPriceStr = promoPriceIdx !== -1 ? cells[promoPriceIdx] : '';
          const rawPromoPrice = rawPromoPriceStr ? parsePrice(rawPromoPriceStr) : undefined;
          const rawNote = noteIdx !== -1 ? cells[noteIdx] : '';
          const rawImage = imageIdx !== -1 ? cells[imageIdx] : '';
          // Column F in Google Sheets corresponds to index 5 (แบรนด์) (0-indexed: A=0, B=1, C=2, D=3, E=4, F=5)
          const finalBrandIdx = brandIdx !== -1 ? brandIdx : 5;
          const rawBrand = (finalBrandIdx !== -1 && finalBrandIdx < cells.length) ? cells[finalBrandIdx].trim() : '';
          
          // Column E in Google Sheets corresponds to index 4 (บาร์โค้ด)
          const finalBarcodeIdx = barcodeIdx !== -1 ? barcodeIdx : 4;
          const rawBarcode = (finalBarcodeIdx !== -1 && finalBarcodeIdx < cells.length) ? cells[finalBarcodeIdx].trim() : '';
          
          // Column D in Google Sheets corresponds to index 3 (0-indexed: A=0, B=1, C=2, D=3)
          const finalUnitIdx = unitIdx !== -1 ? unitIdx : 3;
          let rawUnit = (finalUnitIdx !== -1 && finalUnitIdx < cells.length) ? cells[finalUnitIdx]?.trim() : '';
          if (rawUnit) {
            rawUnit = rawUnit.replace(/^บาท\//, '').replace(/^\/+/, '').trim();
          }
          
          let rawStatus = statusIdx !== -1 && statusIdx < cells.length ? cells[statusIdx] : '';
          if (tab === "สินค้าอื่นๆ") {
            const subGrpIdx = findColumnIndex(headers, ['กลุ่มย่อย', 'กลุ่ม']);
            const finalIdx = subGrpIdx !== -1 ? subGrpIdx : 7; // Column H is index 7 (0-indexed)
            const cellValue = finalIdx < cells.length ? cells[finalIdx] : '';
            if (cellValue.toLowerCase().includes('clearance')) {
              rawStatus = 'clearance';
            } else {
              rawStatus = cellValue;
            }
          }

          // Determine subCategory classification from Column H (กลุ่มย่อย/กลุ่ม) for all categories
          const subGrpIdx = findColumnIndex(headers, ['กลุ่มย่อย', 'กลุ่ม', 'subcategory', 'sub_category', 'sub-category']);
          const finalSubGrpIdx = subGrpIdx !== -1 ? subGrpIdx : 7; // Column H is 7 (0-indexed)
          const rawSubCategory = (finalSubGrpIdx !== -1 && finalSubGrpIdx < cells.length) ? cells[finalSubGrpIdx].trim() : '';

          let subCategory: string | undefined = rawSubCategory || undefined;
          
          if (!subCategory && tab === "หลังคาและอุปกรณ์") {
            const lowerName = rawName.toLowerCase();
            const lowerNote = rawNote.toLowerCase();
            if (lowerName.includes('คอนกรีต') || lowerNote.includes('คอนกรีต')) {
              subCategory = "หลังคาคอนกรีต";
            } else if (lowerName.includes('ไฟเบอร์') || lowerName.includes('ลอนคู่') || lowerName.includes('กระเบื้องลอน') || lowerName.includes('ห้าห่วง') || lowerNote.includes('ไฟเบอร์') || lowerNote.includes('ลอนคู่')) {
              subCategory = "หลังคาไฟเบอร์ซีเมนต์";
            } else {
              subCategory = "หลังคาอื่นๆ";
            }
          }

          const parsedImages = parseMultipleImages(rawImage);
          tabItems.push({
            id: `sheet-prod-${tab}-${i}`,
            category: 'product',
            tabName: tab,
            subCategory,
            name: rawName,
            regularPrice: rawRegPrice,
            promoPrice: (rawPromoPrice && rawPromoPrice < rawRegPrice) ? rawPromoPrice : undefined,
            unit: rawUnit || undefined,
            note: rawNote,
            image: parsedImages[0] || '',
            images: parsedImages,
            status: rawStatus ? rawStatus.toLowerCase().trim() : undefined,
            brand: rawBrand || undefined,
            barcode: rawBarcode || undefined
          });
        }
        return tabItems;
      } catch (err) {
        console.warn(`Optional product tab not loaded: ${tab}`, err);
        return [];
      }
    });

    const [serviceItems, productResults] = await Promise.all([
      serviceItemsPromise,
      Promise.all(productPromises)
    ]);

    allItems.push(...serviceItems);
    productResults.forEach(list => allItems.push(...list));

    if (allItems.length > 0) {
      console.log(`Fetched ${allItems.length} items successfully from Google Sheets!`);
      const combinedItems = allItems;

      // Update local storage cache
      try {
        localStorage.setItem(CACHE_KEY_CATALOG, JSON.stringify({
          timestamp: Date.now(),
          data: combinedItems
        }));
      } catch (err) {
        console.warn('Could not store catalog in cache', err);
      }
      return combinedItems;
    }
  } catch (e) {
    console.warn('Google Sheets connection failed. Falling back to Cache or Local Mock Catalog.', e);
  }

  // Fallback to expired cache if available
  try {
    const cached = localStorage.getItem(CACHE_KEY_CATALOG);
    if (cached) {
      const { data } = JSON.parse(cached);
      if (Array.isArray(data) && data.length > 0) {
        console.log('Falling back to expired Local Cache data.');
        return data;
      }
    }
  } catch (e) {}

  console.log('No cache available, falling back to beautiful LOCAL_CATALOG.');
  return LOCAL_CATALOG;
}

export async function fetchReviewsData(forceRefresh = false): Promise<ReviewItem[]> {
  // Always try to fetch fresh data from Google Sheets first to ensure real-time updates.
  // The localStorage cache is only used as a fallback when offline or if fetch fails.
  try {
    const rows = await fetchTabCSV("ภาพรีวิว");
    const reviews: ReviewItem[] = [];
    
    // Row 0 is headers, data is from Row 1 (i.e. Row 2 in Google Sheets) onwards
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      if (!cells || cells.length === 0) continue;
      
      // Skip completely empty or deleted rows
      if (cells.every(c => !c || c.trim() === '')) continue;
      
      const rawImage = cells[0] || '';
      if (!rawImage || rawImage.trim() === '') continue;
      
      const parsedImage = getDirectImageUrl(rawImage.trim());
      if (parsedImage) {
        reviews.push({
          id: `sheet-review-img-${i}`,
          name: '',
          comment: '',
          image: parsedImage,
          rating: 5,
          location: 'สุโขทัย'
        });
      }
    }
    
    if (reviews.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY_REVIEWS, JSON.stringify({
          timestamp: Date.now(),
          data: reviews
        }));
      } catch (err) {}
      return reviews;
    }
  } catch (e) {
    console.warn('Failed to fetch review images from Sheet, using fallbacks', e);
  }
  
  // Fallback to expired cache if available
  try {
    const cached = localStorage.getItem(CACHE_KEY_REVIEWS);
    if (cached) {
      const { data } = JSON.parse(cached);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {}

  // High-fidelity fallback review images
  const fallbackUrls = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
  ];
  
  return fallbackUrls.map((url, idx) => ({
    id: `fallback-review-img-${idx}`,
    name: '',
    comment: '',
    image: url,
    rating: 5,
    location: 'สุโขทัย'
  }));
}

export async function fetchPromotionsData(forceRefresh = false): Promise<PromotionItem[]> {
  try {
    const rows = await fetchTabCSV("โปรโมชั่น");
    const promotions: PromotionItem[] = [];
    
    // Row 0 is headers (e.g. ระยะเวลาโปรโมชั่น, รายละเอียด, ลิงก์รูปภาพ, ชื่อโปรโมชั่น)
    // Row 1 onwards is data
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      if (!cells || cells.length === 0) continue;
      
      // Skip completely empty rows
      if (cells.every(c => !c || c.trim() === '')) continue;
      
      const period = cells[0] || '';
      const details = cells[1] || '';
      const rawImage = cells[2] || '';
      const title = cells[3] || 'โปรโมชั่นพิเศษ';
      const rawCoverImage = cells[4] || '';
      
      if ((!rawImage || rawImage.trim() === '') && (!rawCoverImage || rawCoverImage.trim() === '')) continue;
      
      const firstRawImage = rawImage.split(',')[0]?.trim() || '';
      const parsedCoverImage = rawCoverImage.trim()
        ? getDirectImageUrl(rawCoverImage.trim())
        : (firstRawImage ? getDirectImageUrl(firstRawImage) : '');
      
      promotions.push({
        id: `sheet-promo-${i}`,
        title: title.trim(),
        period: period.trim(),
        details: details.trim(),
        image: rawImage.trim(),
        coverImage: parsedCoverImage
      });
    }
    
    if (promotions.length > 0) {
      try {
        localStorage.setItem('sukhothai_promotions_v8', JSON.stringify({
          timestamp: Date.now(),
          data: promotions
        }));
      } catch (err) {}
      return promotions;
    }
  } catch (e) {
    console.warn('Failed to fetch promotions from Sheet, using fallbacks', e);
  }
  
  // Fallback to expired cache if available
  try {
    const cached = localStorage.getItem('sukhothai_promotions_v8');
    if (cached) {
      const { data } = JSON.parse(cached);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {}

  // High-fidelity fallback promotions
  return [
    {
      id: 'fallback-promo-1',
      title: 'โปรโมชั่นหลังคาใหม่รับหน้าฝน SCG',
      period: 'วันนี้ - 31 กรกฎาคม 2569',
      details: 'โปรโมชั่นเปิดตัวบริการติดตั้งหลังคาใหม่จาก SCG รับส่วนลดทันที 5,000 บาท เมื่อลงทะเบียนบริการมุงหลังคาบ้านเดี่ยว 1 ชั้น พร้อมรับประกันงานติดตั้งยาวนานถึง 1 ปีเต็ม ด่วนสิทธิ์มีจำนวนจำกัด!',
      image: 'https://images.unsplash.com/photo-1628744448840-55bef34e2bc0?auto=format&fit=crop&w=1200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1628744448840-55bef34e2bc0?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'fallback-promo-2',
      title: 'ฉลองปรับปรุงร้านโฉมใหม่ ลดกระหน่ำ TOA',
      period: 'วันนี้ - 15 สิงหาคม 2569',
      details: 'ฉลองเปิดร้านโฉมใหม่! สีกระป๋อง TOA และเครื่องมือช่างคุณภาพระดับมืออาชีพ ลดกระหน่ำสูงสุด 30% เฉพาะสินค้าที่ร่วมรายการเท่านั้น ช้อปเลยที่สุโขทัยแสงอุปกรณ์!',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80'
    }
  ];
}
