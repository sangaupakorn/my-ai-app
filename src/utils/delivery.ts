/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ร้านสุโขทัยแสงอุปกรณ์ (SCG  สุโขทัย)
// พิกัด: 17.00905741030001, 99.81122699204761
export const STORE_LOCATION = {
  lat: 17.00905741030001,
  lng: 99.81122699204761,
  name: 'สุโขทัยแสงอุปกรณ์',
  address: 'อ.เมืองสุโขทัย จ.สุโขทัย',
  phone: '055-616437',
  email: 'scghomessk@gmail.com',
  lineId: '@exu1868n',
  mapsUrl: 'https://maps.app.goo.gl/wNSma6LbqY2ebmmf6'
};

export type DeliveryZone = 'thani' | 'sukhothai_other' | 'neighbor_allowed' | 'out_of_zone';

export interface LocationPreset {
  id: string;
  label: string;
  subdistrict?: string;
  district: string;
  province: string;
  lat: number;
  lng: number;
  zone: DeliveryZone;
}

// รายการพื้นที่ที่อยู่ในขอบเขตจัดส่ง
export const LOCATION_PRESETS: LocationPreset[] = [
  // โซน 1: ในเขตเทศบาลตำบลธานี อ.เมืองสุโขทัย
  {
    id: 'thani-center',
    label: 'ในเขตเทศบาลตำบลธานี (อ.เมืองสุโขทัย)',
    subdistrict: 'ธานี',
    district: 'เมืองสุโขทัย',
    province: 'สุโขทัย',
    lat: 17.0076,
    lng: 99.8234,
    zone: 'thani'
  },
  {
    id: 'thani-market',
    label: 'ตลาดสดเทศบาลธานี / ริมแม่น้ำยม',
    subdistrict: 'ธานี',
    district: 'เมืองสุโขทัย',
    province: 'สุโขทัย',
    lat: 17.0112,
    lng: 99.8260,
    zone: 'thani'
  },

  // โซน 2: นอกเขตเทศบาลตำบลธานี อ.เมือง (และอำเภออื่นๆ ในจังหวัดสุโขทัย)
  {
    id: 'sk-mueang-outside',
    label: 'อ.เมืองสุโขทัย (นอกเขตเทศบาลตำบลธานี เช่น บ้านกล้วย, ปากแคว, ยางซ้าย)',
    subdistrict: 'บ้านกล้วย',
    district: 'เมืองสุโขทัย',
    province: 'สุโขทัย',
    lat: 17.0250,
    lng: 99.7950,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-kongkrailat',
    label: 'อ.กงไกรลาศ (สุโขทัย)',
    district: 'กงไกรลาศ',
    province: 'สุโขทัย',
    lat: 16.9485,
    lng: 100.0336,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-khirimat',
    label: 'อ.คีรีมาศ (สุโขทัย)',
    district: 'คีรีมาศ',
    province: 'สุโขทัย',
    lat: 16.8329,
    lng: 99.7997,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-thungsaliam',
    label: 'อ.ทุ่งเสลี่ยม (สุโขทัย)',
    district: 'ทุ่งเสลี่ยม',
    province: 'สุโขทัย',
    lat: 17.3117,
    lng: 99.5592,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-bandanlanhoi',
    label: 'อ.บ้านด่านลานหอย (สุโขทัย)',
    district: 'บ้านด่านลานหอย',
    province: 'สุโขทัย',
    lat: 17.0097,
    lng: 99.5768,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-sisatchanalai',
    label: 'อ.ศรีสัชนาลัย (สุโขทัย)',
    district: 'ศรีสัชนาลัย',
    province: 'สุโขทัย',
    lat: 17.5173,
    lng: 99.7595,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-srisamrong',
    label: 'อ.ศรีสำโรง (สุโขทัย)',
    district: 'ศรีสำโรง',
    province: 'สุโขทัย',
    lat: 17.1648,
    lng: 99.8604,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-sawankhalok',
    label: 'อ.สวรรคโลก (สุโขทัย)',
    district: 'สวรรคโลก',
    province: 'สุโขทัย',
    lat: 17.3159,
    lng: 99.8315,
    zone: 'sukhothai_other'
  },
  {
    id: 'sk-srinakhon',
    label: 'อ.ศรีนคร (สุโขทัย)',
    district: 'ศรีนคร',
    province: 'สุโขทัย',
    lat: 17.3489,
    lng: 100.0782,
    zone: 'sukhothai_other'
  },

  // โซน 3: นอกจังหวัดสุโขทัย (ส่งแค่จังหวัดรอบๆ ตามที่ระบุ)
  {
    id: 'tak-mueang',
    label: 'จ.ตาก (โซน อ.เมืองตาก)',
    district: 'เมืองตาก',
    province: 'ตาก',
    lat: 16.8839,
    lng: 99.1258,
    zone: 'neighbor_allowed'
  },
  {
    id: 'kpp-phrankratai',
    label: 'จ.กำแพงเพชร (อ.พรานกระต่าย)',
    district: 'พรานกระต่าย',
    province: 'กำแพงเพชร',
    lat: 16.6661,
    lng: 99.5878,
    zone: 'neighbor_allowed'
  },
  {
    id: 'phitsanulok-mueang',
    label: 'จ.พิษณุโลก (โซน อ.เมืองพิษณุโลก / อ.ใกล้เคียง)',
    district: 'เมืองพิษณุโลก',
    province: 'พิษณุโลก',
    lat: 16.8211,
    lng: 100.2659,
    zone: 'neighbor_allowed'
  },
  {
    id: 'phitsanulok-phromphiram',
    label: 'จ.พิษณุโลก (อ.พรหมพิราม)',
    district: 'พรหมพิราม',
    province: 'พิษณุโลก',
    lat: 17.0275,
    lng: 100.2078,
    zone: 'neighbor_allowed'
  },
  {
    id: 'phitsanulok-bangrakam',
    label: 'จ.พิษณุโลก (อ.บางระกำ)',
    district: 'บางระกำ',
    province: 'พิษณุโลก',
    lat: 16.7586,
    lng: 100.1197,
    zone: 'neighbor_allowed'
  },
  {
    id: 'uttaradit-pichai',
    label: 'จ.อุตรดิตถ์ (อ.พิชัย)',
    district: 'พิชัย',
    province: 'อุตรดิตถ์',
    lat: 17.2917,
    lng: 100.0894,
    zone: 'neighbor_allowed'
  },
  {
    id: 'uttaradit-tron',
    label: 'จ.อุตรดิตถ์ (อ.ตรอน)',
    district: 'ตรอน',
    province: 'อุตรดิตถ์',
    lat: 17.4811,
    lng: 100.1253,
    zone: 'neighbor_allowed'
  }
];

// คำนวณระยะทาง Haversine Formula (กิโลเมตร)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // รัศมีโลกเป็นกิโลเมตร
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // ระยะทางถนนจริงตามสภาพภูมิศาสตร์สุโขทัยประมาณ 1.18 เท่าของเส้นตรง
  const roadDistance = straightDistance * 1.18;
  return Math.max(1, Math.round(roadDistance * 10) / 10);
}

export interface ZoneEvaluation {
  zone: DeliveryZone;
  zoneName: string;
  isOutOfZone: boolean;
  ratePerKm: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  deliveryFee: number;
  conditionDescription: string;
  warningMessage?: string;
}

/**
 * ประเมินโซนและคิดค่าขนส่งตามเงื่อนไขที่ผู้ใช้ระบุ:
 * 1. ในเขตเทศบาลตำบลธานี อ.เมืองสุโขทัย:
 *    - ยอดซื้อ >= 5,000 บาท: ส่งฟรี
 *    - ยอดซื้อ < 5,000 บาท: 17.-/กม.
 * 2. นอกเขตเทศบาลตำบลธานี อ.เมือง (และใน จ.สุโขทัย):
 *    - ยอดซื้อ < 30,000 บาท: 22.-/กม.
 *    - ยอดซื้อ 30,000 - 59,999 บาท: 17.-/กม.
 *    - ยอดซื้อ >= 60,000 บาท: ส่งฟรี
 * 3. นอก จ.สุโขทัย ส่งแค่:
 *    - ตาก โซน อ.เมือง
 *    - กำแพงเพชร ถึง อ.พรานกระต่าย
 *    - พิษณุโลก อ.ใกล้ๆ (เมือง, พรหมพิราม, บางระกำ)
 *    - อุตรดิตถ์ อ.พิชัย, อ.ตรอน
 *    (คิดเรตยอดซื้อเดียวกัน: ต่ำกว่า 30,000 คิด 22.-/กม., 30,000-59,999 คิด 17.-/กม., 60,000+ ส่งฟรี)
 * 4. นอกจากนี้:
 *    - ขึ้นแจ้งเตือน "คุณอยู่นอกพื้นที่จัดส่ง กรุณาติดต่อพนักงาน หรือโทร 055-616437"
 */
export interface RoadRouteResult {
  distanceKm: number;
  durationMin?: number;
  points: [number, number][];
  isRoadRoute: boolean;
  source: string;
}

/**
 * ดึงระยะทางและแนวเส้นทางถนนจริง (Real Road Routing) จากร้านสุโขทัยแสงอุปกรณ์ไปยังพิกัดปลายทาง
 * รองรับทั้งการเรียกผ่าน API เซิร์ฟเวอร์ (/api/route) และการดึงตรงจาก OSRM
 * หากออฟไลน์หรือขัดข้อง จะคำนวณสำรองอัตโนมัติ
 */
export async function fetchRoadRoute(
  destLat: number,
  destLng: number,
  originLat: number = STORE_LOCATION.lat,
  originLng: number = STORE_LOCATION.lng
): Promise<RoadRouteResult> {
  // 1. ลองเรียกผ่าน Express API เซิร์ฟเวอร์ในระบบ
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `/api/route?destLat=${destLat}&destLng=${destLng}&originLat=${originLat}&originLng=${originLng}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && typeof data.distanceKm === 'number') {
        return {
          distanceKm: data.distanceKm,
          durationMin: data.durationMin,
          points: data.points || [[originLat, originLng], [destLat, destLng]],
          isRoadRoute: data.isRoadRoute ?? true,
          source: data.source || 'api_route'
        };
      }
    }
  } catch (err) {
    // API ในระบบอาจไม่พร้อม (เช่น โหมด Static บน Netlify) ให้ลองดึงตรง
  }

  // 2. ดึงตรงจาก OSRM Public Endpoint (Client-side fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await osrmResJson(res);
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distKm = Math.max(0.1, Math.round((route.distance / 1000) * 10) / 10);
        const pts: [number, number][] = (route.geometry?.coordinates || []).map(
          (c: [number, number]) => [c[1], c[0]]
        );
        return {
          distanceKm: distKm,
          durationMin: Math.round(route.duration / 60),
          points: pts.length > 0 ? pts : [[originLat, originLng], [destLat, destLng]],
          isRoadRoute: true,
          source: 'client_osrm'
        };
      }
    }
  } catch (err) {
    // Fallback ต่อไป
  }

  // 3. Fallback: คำนวณ Haversine แบบออฟไลน์
  const fallbackDist = calculateDistanceKm(originLat, originLng, destLat, destLng);
  return {
    distanceKm: fallbackDist,
    points: [
      [originLat, originLng],
      [destLat, destLng]
    ],
    isRoadRoute: false,
    source: 'haversine_fallback'
  };
}

async function osrmResJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch (e) {
    return {};
  }
}

export function evaluateDelivery(
  lat: number,
  lng: number,
  subtotal: number,
  manualZone?: DeliveryZone,
  customDistanceKm?: number
): ZoneEvaluation {
  const distanceKm =
    typeof customDistanceKm === 'number' && customDistanceKm > 0
      ? customDistanceKm
      : calculateDistanceKm(
          STORE_LOCATION.lat,
          STORE_LOCATION.lng,
          lat,
          lng
        );

  let zone: DeliveryZone = 'out_of_zone';

  if (manualZone) {
    zone = manualZone;
  } else {
    // คำนวณจากพิกัดอัตโนมัติ:
    // เทศบาลตำบลธานี อยู่ใกล้ร้านในรัศมีประมาณ 4.5 กิโลเมตร
    if (distanceKm <= 4.5) {
      zone = 'thani';
    } else if (distanceKm <= 75) {
      // ภายในจังหวัดสุโขทัย หรือขอบเขตจังหวัดข้างเคียงที่อนุญาต
      // พิกัดสุโขทัย: Lat 16.7 - 17.7, Lng 99.3 - 100.2
      const isSukhothaiArea =
        lat >= 16.7 && lat <= 17.65 && lng >= 99.4 && lng <= 100.15;
      
      // ตากโซนเมือง: Lat ~16.88, Lng ~99.12
      const isTakMueang =
        lat >= 16.75 && lat <= 17.05 && lng >= 99.0 && lng <= 99.35;

      // กำแพงเพชร พรานกระต่าย: Lat ~16.66, Lng ~99.58
      const isPhrankratai =
        lat >= 16.55 && lat <= 16.85 && lng >= 99.45 && lng <= 99.75;

      // พิษณุโลกใกล้ๆ: Lat ~16.7 - 17.15, Lng ~100.1 - 100.4
      const isPhitsanulokNear =
        lat >= 16.7 && lat <= 17.15 && lng >= 100.05 && lng <= 100.4;

      // อุตรดิตถ์ พิชัย, ตรอน: Lat ~17.2 - 17.6, Lng ~99.95 - 100.25
      const isUttaraditAllowed =
        lat >= 17.2 && lat <= 17.6 && lng >= 99.95 && lng <= 100.3;

      if (isSukhothaiArea) {
        zone = 'sukhothai_other';
      } else if (isTakMueang || isPhrankratai || isPhitsanulokNear || isUttaraditAllowed) {
        zone = 'neighbor_allowed';
      } else {
        zone = 'out_of_zone';
      }
    } else {
      zone = 'out_of_zone';
    }
  }

  // คำนวณค่าส่งตามเงื่อนไข
  if (zone === 'thani') {
    const isFree = subtotal >= 5000;
    const rate = 17;
    const fee = isFree ? 0 : Math.round(distanceKm * rate);

    return {
      zone: 'thani',
      zoneName: 'ในเขตเทศบาลตำบลธานี อ.เมืองสุโขทัย',
      isOutOfZone: false,
      ratePerKm: rate,
      freeDeliveryThreshold: 5000,
      isFreeDelivery: isFree,
      deliveryFee: fee,
      conditionDescription:
        subtotal >= 5000
          ? '🎉 ยอดซื้อครบ 5,000 บาทขึ้นไป จัดส่งฟรี!'
          : `ยอดซื้อต่ำกว่า 5,000 บาท คิดค่าส่ง 17.-/กม. (อีก ฿${(
              5000 - subtotal
            ).toLocaleString('th-TH')} จะได้ส่งฟรี)`
    };
  }

  if (zone === 'sukhothai_other' || zone === 'neighbor_allowed') {
    const isFree = subtotal >= 60000;
    let rate = 22;
    if (subtotal >= 30000 && subtotal < 60000) {
      rate = 17;
    } else if (subtotal >= 60000) {
      rate = 0;
    }

    const fee = isFree ? 0 : Math.round(distanceKm * rate);

    const zoneLabel =
      zone === 'sukhothai_other'
        ? 'นอกเขตเทศบาลตำบลธานี (อ.เมือง และ จ.สุโขทัย)'
        : 'ต่างจังหวัดใกล้เคียง (ตาก โซนเมือง / พรานกระต่าย / พิษณุโลก / พิชัย-ตรอน)';

    let condition = '';
    if (subtotal >= 60000) {
      condition = '🎉 ยอดซื้อครบ 60,000 บาทขึ้นไป จัดส่งฟรี!';
    } else if (subtotal >= 30000) {
      condition = `ยอดซื้อ 30,000 - 59,999 บาท อัตราพิเศษ 17.-/กม. (ซื้อเพิ่มอีก ฿${(
        60000 - subtotal
      ).toLocaleString('th-TH')} จะได้ส่งฟรี)`;
    } else {
      condition = `ยอดซื้อต่ำกว่า 30,000 บาท อัตรา 22.-/กม. (ซื้อครบ 30,000 บ. ลดเหลือ 17.-/กม.)`;
    }

    return {
      zone,
      zoneName: zoneLabel,
      isOutOfZone: false,
      ratePerKm: rate,
      freeDeliveryThreshold: 60000,
      isFreeDelivery: isFree,
      deliveryFee: fee,
      conditionDescription: condition
    };
  }

  // กรณีอยู่นอกพื้นที่จัดส่ง
  return {
    zone: 'out_of_zone',
    zoneName: 'นอกพื้นที่จัดส่งที่กำหนด',
    isOutOfZone: true,
    ratePerKm: 0,
    freeDeliveryThreshold: 0,
    isFreeDelivery: false,
    deliveryFee: 0,
    conditionDescription: 'อยู่นอกพื้นที่บริการจัดส่งปกติ',
    warningMessage:
      'คุณอยู่นอกพื้นที่จัดส่ง กรุณาติดต่อพนักงาน หรือโทร 055-616437'
  };
}
