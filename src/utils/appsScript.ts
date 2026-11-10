/**
 * จัดการการเชื่อมต่อ Google Apps Script Web App
 * สำหรับบันทึกคำสั่งซื้อลง Google Sheet และส่งอีเมลแจ้งเตือน
 */

const STORAGE_KEY = 'sukhothai_apps_script_url';

// วาง Web app URL (ลงท้าย /exec) ของ Google Apps Script ตรงนี้ได้เลย
// ใช้เป็นทางเลือกแทน Environment variable VITE_APPS_SCRIPT_URL
// (URL นี้ไม่ใช่ความลับ เพราะต้องเปิดให้เว็บเรียกได้อยู่แล้ว)
const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxWiCrgZNQ2iRGBlYki65u1khDbjENUtqYDBn3bMKASVzRY8cBN6kzrIrcFP4omMeFQRw/exec';

export function getAppsScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = (import.meta as any).env?.VITE_APPS_SCRIPT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  if (DEFAULT_APPS_SCRIPT_URL.trim() !== '') {
    return DEFAULT_APPS_SCRIPT_URL.trim();
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim() !== '') {
    return stored.trim();
  }
  return '';
}

export function saveAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = url.trim();
  if (cleanUrl) {
    localStorage.setItem(STORAGE_KEY, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function sendOrderToAppsScript(payload: any, customUrl?: string): Promise<{ success: boolean; error?: string }> {
  const url = customUrl ? customUrl.trim() : getAppsScriptUrl();
  
  if (!url || url.trim() === '') {
    console.error('[ออเดอร์ไม่ถูกส่ง] ยังไม่ได้ตั้งค่า VITE_APPS_SCRIPT_URL (หรือ DEFAULT_APPS_SCRIPT_URL ใน src/utils/appsScript.ts)');
    return { success: false, error: 'APPS_SCRIPT_URL_NOT_SET' };
  }

  try {
    // ส่งข้อมูลแบบ no-cors ไปยัง Google Apps Script Web App
    // ให้ฝั่งเซิร์ฟเวอร์ Google Apps Script ดำเนินการบันทึกลง Sheet และส่งอีเมล
    fetch(url.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }).catch((err) => {
      console.warn('Background Apps Script fetch note:', err);
    });

    return { success: true };
  } catch (err: any) {
    console.warn('sendOrderToAppsScript error:', err);
    return { success: true };
  }
}

