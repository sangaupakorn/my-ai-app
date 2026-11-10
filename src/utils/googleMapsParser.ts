/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExtractedCoordinates {
  lat: number;
  lng: number;
  source: string;
}

/**
 * แปลงพิกัดแบบองศา ลิปดา ฟิลิปดา (DMS) เป็นทศนิยม (Decimal Degrees)
 * เช่น 17°00'27.4"N 99°49'24.2"E -> 17.007611, 99.823389
 */
function dmsToDecimal(degrees: string, minutes: string, seconds: string | undefined, direction: string): number {
  const d = parseFloat(degrees) || 0;
  const m = parseFloat(minutes) || 0;
  const s = parseFloat(seconds || '0') || 0;
  let dec = d + m / 60 + s / 3600;
  const dir = direction.trim().toUpperCase();
  if (dir === 'S' || dir === 'W') {
    dec = -dec;
  }
  return dec;
}

/**
 * ดึงพิกัด Latitude และ Longitude จากข้อความหรือลิงก์ Google Maps ทุกรูปแบบ
 * รองรับ:
 * - URL ตัวเต็มจาก Google Maps: @17.0090493,99.8112386
 * - URL ที่มีพารามิเตอร์ !3d17.0090493!4d99.8112386
 * - URL ที่มี query: ?q=17.0090493,99.8112386 หรือ &query= หรือ ll=
 * - URL ที่มี path: /place/17.0090493,99.8112386 หรือ /dir//17.0090493,99.8112386
 * - พิกัด DMS: 17°00'27.4"N 99°49'24.2"E
 * - ตัวเลขพิกัดตรงๆ: 17.0090493, 99.8112386 หรือ 17.0090493 99.8112386
 */
export function extractCoordsFromText(input: string): ExtractedCoordinates | null {
  if (!input || typeof input !== 'string') return null;

  let decoded = input.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch (e) {
    // ใช้ค่าเดิมหาก decode ไม่ผ่าน
  }

  // 1. ตรวจสอบ Protobuf !3d<lat>!4d<lng> (แม่นยำที่สุดสำหรับ Google Maps Place URLs)
  const protoMatch = decoded.match(/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/i);
  if (protoMatch) {
    const lat = parseFloat(protoMatch[1]);
    const lng = parseFloat(protoMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'protobuf_3d_4d' };
    }
  }

  // 2. ตรวจสอบ Protobuf แบบฝัง !2d<lng>!3d<lat>
  const embedMatch = decoded.match(/!2d(-?\d+(?:\.\d+)?)[^!]*!3d(-?\d+(?:\.\d+)?)/i);
  if (embedMatch) {
    const lng = parseFloat(embedMatch[1]);
    const lat = parseFloat(embedMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'protobuf_2d_3d' };
    }
  }

  // 3. ตรวจสอบ @lat,lng เช่น @17.0090493,99.8112386 หรือ @17.0090493,99.8112386,17z
  const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'at_lat_lng' };
    }
  }

  // 4. ตรวจสอบ Query Parameter เช่น ?q=lat,lng หรือ &q=lat,lng หรือ query=, ll=, daddr=, destination=
  const queryMatch =
    decoded.match(/[?&](?:q|query|ll|daddr|destination|center)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i) ||
    decoded.match(/[?&](?:q|query|ll|daddr|destination|center)=(-?\d+\.\d+)%2C(-?\d+\.\d+)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'query_param' };
    }
  }

  // 5. ตรวจสอบ Path เช่น /place/17.00905,99.81124 หรือ /search/17.00905,99.81124 หรือ /dir//17.00905,99.81124
  const pathMatch = decoded.match(/\/(?:place|search|dir\/[^/]*)\/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i);
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lng = parseFloat(pathMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'url_path' };
    }
  }

  // 6. ตรวจสอบพิกัดแบบองศา ลิปดา ฟิลิปดา (DMS) เช่น 17°00'27.4"N 99°49'24.2"E
  const dmsRegex =
    /(\d{1,3})[°\s]+(\d{1,2})['\s]+([\d.]+)?["\s]*([NSEW])\s*[,+]?\s*(\d{1,3})[°\s]+(\d{1,2})['\s]+([\d.]+)?["\s]*([NSEW])/i;
  const dmsMatch = decoded.match(dmsRegex);
  if (dmsMatch) {
    const lat = dmsToDecimal(dmsMatch[1], dmsMatch[2], dmsMatch[3], dmsMatch[4]);
    const lng = dmsToDecimal(dmsMatch[5], dmsMatch[6], dmsMatch[7], dmsMatch[8]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'dms' };
    }
  }

  // 7. ตรวจสอบตัวเลขพิกัดตรงๆ ที่ลูกค้านำมาวาง เช่น 17.0090493, 99.8112386 หรือ 17.0090493 99.8112386
  const rawMatch = decoded.match(/(-?\d{1,2}\.\d{3,})[,\s]+(-?\d{1,3}\.\d{3,})/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, source: 'raw_numbers' };
    }
  }

  return null;
}

/**
 * ตรวจสอบความสมเหตุสมผลของพิกัด Lat, Lng ทั่วโลก
 */
export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    // ป้องกันกรณีตัวเลข 0,0
    !(lat === 0 && lng === 0)
  );
}

/**
 * ตรวจสอบว่าเป็นลิงก์แบบย่อของ Google Maps หรือไม่
 */
export function isShortGoogleMapsUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const clean = input.trim().toLowerCase();
  return (
    clean.includes('maps.app.goo.gl') ||
    clean.includes('goo.gl/maps') ||
    clean.includes('g.co/maps') ||
    clean.includes('maps.google.com/?cid=')
  );
}

/**
 * ฟังก์ชันแก้ลิงก์และดึงพิกัด (ทำงานได้ทั้งลิงก์เต็ม ลิงก์ย่อ และตัวเลขพิกัด)
 */
export async function resolveGoogleMapsLink(
  rawInput: string
): Promise<{ success: boolean; lat?: number; lng?: number; message?: string; resolvedUrl?: string }> {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return {
      success: false,
      message: 'กรุณาวางลิงก์ Google Maps หรือพิกัดละติจูด,ลองจิจูดด้วยค่ะ'
    };
  }

  // ขั้นที่ 1: ลองดึงพิกัดโดยตรงจากตัวอักษรทันที (ครอบคลุมลิงก์ตัวเต็มและตัวเลขพิกัด)
  const directMatch = extractCoordsFromText(trimmed);
  if (directMatch) {
    return {
      success: true,
      lat: directMatch.lat,
      lng: directMatch.lng,
      resolvedUrl: trimmed
    };
  }

  // ขั้นที่ 2: หากเป็นลิงก์แบบย่อ (เช่น maps.app.goo.gl) หรือ URL อื่นๆ
  if (isShortGoogleMapsUrl(trimmed) || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // 2.1 ลองเรียก API เซิร์ฟเวอร์ในระบบก่อน (ทำงานบน Netlify Functions หรือ Dev Server)
    try {
      const response = await fetch(`/api/resolve-maps-url?url=${encodeURIComponent(trimmed)}`);
      const contentType = response.headers.get('content-type') || '';
      // ตรวจสอบว่าได้ JSON จริง ไม่ใช่ HTML จาก SPA redirect บน Netlify
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && data.lat && data.lng) {
          return {
            success: true,
            lat: Number(data.lat),
            lng: Number(data.lng),
            resolvedUrl: data.resolvedUrl || trimmed
          };
        }
      }
    } catch (apiError) {
      // API ในระบบอาจไม่พร้อม (เช่น โหมด Static บน Netlify) ให้ทำงานต่อที่ตัวแก้ลิงก์สำรองทันที
    }

    // 2.2 ลองแก้ลิงก์ผ่าน Public Unshorten API (ทำงานบน Netlify ได้โดยตรง 100% แม้ไม่มี Serverless Backend)
    try {
      const unshortenRes = await fetch(`https://unshorten.me/json/${encodeURIComponent(trimmed)}`);
      if (unshortenRes.ok) {
        const unshortenData = await unshortenRes.json();
        if (unshortenData && unshortenData.resolved_url) {
          const coords = extractCoordsFromText(unshortenData.resolved_url);
          if (coords) {
            return {
              success: true,
              lat: coords.lat,
              lng: coords.lng,
              resolvedUrl: unshortenData.resolved_url
            };
          }
        }
      }
    } catch (unshortenErr) {
      console.warn('Unshorten API error:', unshortenErr);
    }

    // 2.3 ลองอ่านเนื้อหาผ่าน CORS proxy สำรอง (Allorigins)
    try {
      const proxyRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(trimmed)}`);
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData && proxyData.contents) {
          const coords = extractCoordsFromText(proxyData.contents);
          if (coords) {
            return {
              success: true,
              lat: coords.lat,
              lng: coords.lng,
              resolvedUrl: trimmed
            };
          }
        }
      }
    } catch (proxyErr) {
      console.warn('CORS proxy error:', proxyErr);
    }
  }

  return {
    success: false,
    message:
      'ไม่พบพิกัดในลิงก์ที่วาง กรุณาตรวจสอบลิงก์ Google Maps หรือคัดลอกพิกัดตัวเลข (เช่น 17.0076, 99.8234) จาก Google Maps มาวางได้เลยค่ะ'
  };
}
