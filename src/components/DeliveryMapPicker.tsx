/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Phone, 
  MessageCircle,
  ExternalLink,
  Maximize2,
  Minimize2,
  LocateFixed,
  Store,
  Compass,
  Link2,
  Search,
  Loader2,
  XCircle,
  Car
} from 'lucide-react';
import { 
  STORE_LOCATION, 
  LOCATION_PRESETS, 
  calculateDistanceKm, 
  evaluateDelivery, 
  ZoneEvaluation, 
  DeliveryZone,
  fetchRoadRoute
} from '../utils/delivery';
import { resolveGoogleMapsLink } from '../utils/googleMapsParser';

interface DeliveryMapPickerProps {
  subtotal: number;
  onLocationChange: (data: {
    lat: number;
    lng: number;
    distanceKm: number;
    evaluation: ZoneEvaluation;
    addressText: string;
    googleMapsUrl?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function DeliveryMapPicker({
  subtotal,
  onLocationChange,
  initialLat = 17.0076, // เทศบาลตำบลธานี อ.เมืองสุโขทัย
  initialLng = 99.8234
}: DeliveryMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string>('thani-center');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [manualZoneOverride, setManualZoneOverride] = useState<DeliveryZone | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // ข้อมูลสำหรับช่องวางลิงก์ Google Maps
  const [mapLinkInput, setMapLinkInput] = useState<string>('');
  const [isResolvingLink, setIsResolvingLink] = useState<boolean>(false);
  const [linkNotice, setLinkNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // ข้อมูลเส้นทางถนนจริง (Real Road Routing) เพื่อให้ตรงกับ Google Maps
  const [roadDistanceKm, setRoadDistanceKm] = useState<number | null>(null);
  const [roadDurationMin, setRoadDurationMin] = useState<number | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [isRealRoadRoute, setIsRealRoadRoute] = useState<boolean>(false);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  // ระยะทางที่นำมาใช้คำนวณ (ใช้ระยะทางถนนจริงก่อน หากยังไม่มีให้ใช้ระยะทางสำรอง)
  const activeDistanceKm =
    roadDistanceKm ??
    calculateDistanceKm(
      STORE_LOCATION.lat,
      STORE_LOCATION.lng,
      customerCoords.lat,
      customerCoords.lng
    );

  // คำนวณผลการประเมินค่าจัดส่งโดยอ้างอิงระยะทางถนนจริง
  const evaluation = evaluateDelivery(
    customerCoords.lat,
    customerCoords.lng,
    subtotal,
    manualZoneOverride,
    activeDistanceKm
  );

  // แจ้ง parent component เมื่อพิกัดหรือผลการประเมินเปลี่ยน
  useEffect(() => {
    onLocationChange({
      lat: customerCoords.lat,
      lng: customerCoords.lng,
      distanceKm: activeDistanceKm,
      evaluation,
      addressText: `ละติจูด: ${customerCoords.lat.toFixed(5)}, ลองจิจูด: ${customerCoords.lng.toFixed(5)}`,
      googleMapsUrl: mapLinkInput.trim() || undefined
    });
  }, [customerCoords, activeDistanceKm, evaluation.deliveryFee, evaluation.zone, subtotal, mapLinkInput]);

  // ตั้งค่าแผนที่ Leaflet เริ่มต้น
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // ไอคอนร้านสุโขทัยแสงอุปกรณ์
    const storeIcon = L.divIcon({
      className: 'custom-store-pin',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
          <div style="background:#DC2626; color:#fff; font-weight:bold; font-size:11px; padding:3px 8px; border-radius:9999px; box-shadow:0 2px 8px rgba(220,38,38,0.4); white-space:nowrap; border:1.5px solid #fff;">
            🏢 ร้านสุโขทัยแสงอุปกรณ์
          </div>
          <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #DC2626;"></div>
        </div>
      `,
      iconSize: [0, 0]
    });

    // ไอคอนหมุดลูกค้าสไตล์ LINE MAN / Grab (ลากได้ คลิกได้)
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); cursor:grab;">
          <div style="background:#2563EB; color:#fff; font-weight:bold; font-size:11px; padding:3px 8px; border-radius:9999px; box-shadow:0 4px 12px rgba(37,99,235,0.5); white-space:nowrap; border:2px solid #fff;">
            📍 หมุดส่งของ (ลากเลื่อนได้)
          </div>
          <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #2563EB;"></div>
          <div style="width:8px; height:8px; background:rgba(37,99,235,0.4); border-radius:50%; margin-top:2px;"></div>
        </div>
      `,
      iconSize: [0, 0]
    });

    // กำหนดขอบเขตแผนที่ให้อยู่ในประเทศไทย
    const thailandBounds = L.latLngBounds(
      L.latLng(5.5, 97.0),
      L.latLng(20.6, 106.0)
    );

    const map = L.map(mapContainerRef.current, {
      center: [customerCoords.lat, customerCoords.lng],
      zoom: 14,
      minZoom: 6,
      maxBounds: thailandBounds,
      maxBoundsViscosity: 0.8,
      scrollWheelZoom: true
    });

    mapInstanceRef.current = map;

    // Tile Layer: OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ปักหมุดร้านสุโขทัยแสงอุปกรณ์
    const sMarker = L.marker([STORE_LOCATION.lat, STORE_LOCATION.lng], {
      icon: storeIcon,
      interactive: true
    }).addTo(map);
    sMarker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
        <strong style="color:#DC2626; font-size:13px;">สุโขทัยแสงอุปกรณ์ (SCG  สุโขทัย)</strong><br/>
        จุดเริ่มต้นคำนวณระยะทางและค่าส่งสินค้า<br/>
        <a href="${STORE_LOCATION.mapsUrl}" target="_blank" style="color:#2563EB; text-decoration:underline; font-weight:bold;">เปิดใน Google Maps ↗</a>
      </div>
    `);
    storeMarkerRef.current = sMarker;

    // ปักหมุดลูกค้า (สามารถลากได้อิสระเหมือน LINE MAN)
    const cMarker = L.marker([customerCoords.lat, customerCoords.lng], {
      icon: customerIcon,
      draggable: true,
      autoPan: true
    }).addTo(map);

    cMarker.on('dragend', () => {
      const pos = cMarker.getLatLng();
      setCustomerCoords({ lat: pos.lat, lng: pos.lng });
      setSelectedPresetId('custom');
      setManualZoneOverride(undefined);
      setLocationNotice(null);
    });

    customerMarkerRef.current = cMarker;

    // เส้นทางตามแนวถนนระหว่างร้านกับลูกค้า (ค่าเริ่มต้นเป็นเส้นเชื่อมระหว่างจุดสองจุด)
    const polyline = L.polyline(
      [
        [STORE_LOCATION.lat, STORE_LOCATION.lng],
        [customerCoords.lat, customerCoords.lng]
      ],
      {
        color: '#2563EB',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }
    ).addTo(map);
    polylineRef.current = polyline;

    // คลิกจุดใดก็ได้บนแผนที่เพื่อย้ายหมุดมาที่นั่นทันที
    map.on('click', (e: L.LeafletMouseEvent) => {
      cMarker.setLatLng(e.latlng);
      setCustomerCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      setSelectedPresetId('custom');
      setManualZoneOverride(undefined);
      setLocationNotice(null);
    });

    // Invalidate map size after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // เมื่อขนาดความสูงแผนที่เปลี่ยน (โหมดขยายใหญ่) ให้ resize map
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }
  }, [isExpanded]);

  // ซิงค์ตำแหน่งหมุดและคำนวณเส้นทางถนนจริง (Real Road Routing) เมื่อ customerCoords เปลี่ยน
  useEffect(() => {
    if (!customerMarkerRef.current || !polylineRef.current || !mapInstanceRef.current) return;

    // 1. อัปเดตตำแหน่งหมุดลูกค้าบนแผนที่ทันที
    customerMarkerRef.current.setLatLng([customerCoords.lat, customerCoords.lng]);

    let isCancelled = false;
    setIsCalculatingRoute(true);

    // 2. เรียกคำนวณเส้นทางตามโครงข่ายถนนจริง (OSRM) เพื่อให้ได้ระยะทางตามแนวถนนเป๊ะเหมือน Google Maps
    fetchRoadRoute(customerCoords.lat, customerCoords.lng)
      .then((route) => {
        if (isCancelled) return;
        setIsCalculatingRoute(false);
        setRoadDistanceKm(route.distanceKm);
        setRoadDurationMin(route.durationMin ?? null);
        setIsRealRoadRoute(route.isRoadRoute);
        setRoutePoints(route.points);

        // 3. วาดเส้นทางเลี้ยวโค้งตามแนวถนนจริง (Solid Road Curve) บนแผนที่ Leaflet
        if (polylineRef.current && route.points && route.points.length > 0) {
          polylineRef.current.setLatLngs(route.points);
          polylineRef.current.setStyle({
            color: '#2563EB',
            weight: 5,
            opacity: 0.88,
            dashArray: route.isRoadRoute ? undefined : '6, 8'
          });
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn('Route calculation error:', err);
        setIsCalculatingRoute(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [customerCoords]);

  // เมื่อลูกค้าเลือกอำเภอหรือโซนจาก Dropdown:
  // ให้ Map ซูมบินเข้าไปยังอำเภอนั้นที่ระดับ Zoom 15 ทันที (ไม่ซูมถอยหลัง) เพื่อให้เห็นถนนและลากหมุดเข้าบ้านได้สะดวก!
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    setLocationNotice(null);

    const preset = LOCATION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCustomerCoords({ lat: preset.lat, lng: preset.lng });
      setManualZoneOverride(preset.zone);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([preset.lat, preset.lng], 15, {
          duration: 1.2
        });
      }
    }
  };

  // ดึงตำแหน่ง GPS อุปกรณ์ของผู้ใช้ พร้อมตรวจสอบความถูกต้องให้อยู่ในประเทศไทย
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice({
        type: 'error',
        message: 'อุปกรณ์หรือเบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง GPS'
      });
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        // ตรวจสอบว่าพิกัดอยู่ในเขตประเทศไทยหรือไม่ (Lat: 5.5 - 20.6, Lng: 97.0 - 106.0)
        const isInsideThailand =
          latitude >= 5.5 && latitude <= 20.6 && longitude >= 97.0 && longitude <= 106.0;

        if (!isInsideThailand) {
          // หากตรวจพบพิกัดนอกประเทศ (เช่น เปิด VPN ต่างประเทศ หรือ IP เซิร์ฟเวอร์จำลอง)
          setLocationNotice({
            type: 'warning',
            message: `ระบบตรวจพบพิกัด GPS อยู่นอกประเทศไทย (${latitude.toFixed(2)}, ${longitude.toFixed(2)}) ซึ่งมักเกิดจากการเชื่อมต่อ VPN หรือสัญญาณเครือข่ายจำลอง ทางเราจึงได้ปักหมุดไว้ที่ อ.เมืองสุโขทัย ให้คุณสามารถคลิกเลื่อนหมุดบนแผนที่ได้ตามจริงค่ะ`
          });

          // ปักหมุดที่ อ.เมืองสุโขทัย แทน
          const fallbackLat = 17.0076;
          const fallbackLng = 99.8234;
          setCustomerCoords({ lat: fallbackLat, lng: fallbackLng });
          setSelectedPresetId('thani-center');
          setManualZoneOverride('thani');

          mapInstanceRef.current?.flyTo([fallbackLat, fallbackLng], 15, {
            duration: 1.2
          });
          return;
        }

        // กรณีพิกัดถูกต้องในประเทศไทย
        setCustomerCoords({ lat: latitude, lng: longitude });
        setSelectedPresetId('custom');
        setManualZoneOverride(undefined);
        setLocationNotice({
          type: 'success',
          message: `ระบุตำแหน่ง GPS ปัจจุบันในไทยสำเร็จเรียบร้อย (${latitude.toFixed(5)}, ${longitude.toFixed(5)}) สามารถคลิกเลื่อนปรับหมุดให้ตรงกับหน้าบ้านได้เลยค่ะ`
        });

        // เลื่อนกล้องแผนที่ซูมลึกระดับ 16 เห็นซอยชัดเจนเหมือน LINE MAN
        mapInstanceRef.current?.flyTo([latitude, longitude], 16, {
          duration: 1.2
        });
      },
      (error) => {
        setIsLocating(false);
        let msg = 'ไม่สามารถดึงตำแหน่ง GPS ได้';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'กรุณากด "อนุญาต (Allow)" การเข้าถึงตำแหน่งในเบราว์เซอร์ของคุณ หรือเลือกอำเภอจากรายการด้านล่างได้ทันทีค่ะ';
        } else if (error.code === error.TIMEOUT) {
          msg = 'หมดเวลาเชื่อมต่อสัญญาณ GPS กรุณาลองใหม่อีกครั้ง';
        }
        setLocationNotice({
          type: 'error',
          message: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // ซูมมุมมอง
  const handleFocusCustomer = () => {
    mapInstanceRef.current?.flyTo([customerCoords.lat, customerCoords.lng], 16, { duration: 0.8 });
  };

  const handleFocusStore = () => {
    mapInstanceRef.current?.flyTo([STORE_LOCATION.lat, STORE_LOCATION.lng], 16, { duration: 0.8 });
  };

  const handleFitRoute = () => {
    if (polylineRef.current && routePoints.length > 1) {
      mapInstanceRef.current?.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50], maxZoom: 15 });
    } else {
      const bounds = L.latLngBounds([
        [STORE_LOCATION.lat, STORE_LOCATION.lng],
        [customerCoords.lat, customerCoords.lng]
      ]);
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  // ฟังก์ชันดึงพิกัดจากลิงก์ Google Maps และย้ายตำแหน่งหมุดบนแผนที่ทันที
  const handleApplyMapLink = async () => {
    const trimmed = mapLinkInput.trim();
    if (!trimmed) {
      setLinkNotice({
        type: 'error',
        message: 'กรุณาวางลิงก์ Google Maps หรือพิกัดละติจูด,ลองจิจูดก่อนกดปุ่มยืนยันค่ะ'
      });
      return;
    }

    setIsResolvingLink(true);
    setLinkNotice(null);

    try {
      const result = await resolveGoogleMapsLink(trimmed);
      setIsResolvingLink(false);

      if (result.success && result.lat !== undefined && result.lng !== undefined) {
        const { lat, lng } = result;

        // ตรวจสอบว่าพิกัดอยู่ในเขตประเทศไทยหรือไม่ (Lat: 5.5 - 20.6, Lng: 97.0 - 106.0)
        const isInsideThailand =
          lat >= 5.5 && lat <= 20.6 && lng >= 97.0 && lng <= 106.0;

        if (!isInsideThailand) {
          setLinkNotice({
            type: 'warning',
            message: `พิกัดที่พบ (${lat.toFixed(4)}, ${lng.toFixed(4)}) อยู่นอกประเทศไทย กรุณาตรวจสอบลิงก์ Google Maps อีกครั้งค่ะ`
          });
          return;
        }

        // ย้ายพิกัดลูกค้า
        setCustomerCoords({ lat, lng });
        setSelectedPresetId('custom');
        setManualZoneOverride(undefined);

        // ย้ายหมุดลูกค้าทันที
        if (customerMarkerRef.current) {
          customerMarkerRef.current.setLatLng([lat, lng]);
        }

        // เลื่อนและซูมแผนที่เข้ามายังตำแหน่งหมุดที่ระดับ Zoom 16 เพื่อให้เห็นบ้านและถนนชัดเจน
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, {
            duration: 1.2
          });
        }

        const dist = calculateDistanceKm(
          STORE_LOCATION.lat,
          STORE_LOCATION.lng,
          lat,
          lng
        );

        setLinkNotice({
          type: 'success',
          message: `ระบุตำแหน่งจาก Google Maps สำเร็จ!`
        });
        setLocationNotice(null);
      } else {
        setLinkNotice({
          type: 'error',
          message:
            result.message ||
            'ไม่สามารถดึงพิกัดจากลิงก์ที่วางได้ กรุณาตรวจสอบว่าเป็นลิงก์ Google Maps หรือคัดลอกพิกัดตัวเลข (เช่น 17.0090, 99.8112) มาวางได้เลยค่ะ'
        });
      }
    } catch (err: any) {
      setIsResolvingLink(false);
      setLinkNotice({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการตรวจสอบลิงก์ กรุณาลองใหม่อีกครั้ง'
      });
    }
  };

  return (
    <div className="space-y-3 font-sans" id="delivery-map-picker">
      {/* ส่วนควบคุม: วางลิงก์ Google Maps + เลือกอำเภอ + ปุ่มดึงพิกัด GPS */}
      <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 space-y-3.5">
        
        {/* 1. ช่องรับข้อมูลลิงก์ Google Maps สำหรับคำนวณค่าขนส่งอย่างแม่นยำ */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-red-500/40 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs shadow-xs">
                📍
              </span>
              <span>วางลิงก์พิกัดจาก Google Maps (Google Map Link):</span>
            </label>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
              แม่นยำสูงสุด ⭐
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={mapLinkInput}
                onChange={(e) => {
                  setMapLinkInput(e.target.value);
                  if (linkNotice) setLinkNotice(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyMapLink();
                  }
                }}
                placeholder="วางลิงก์ Google Maps เช่น https://maps.app.goo.gl/... หรือพิกัด 17.0076, 99.8234"
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 rounded-xl text-xs sm:text-sm text-gray-900 transition-all placeholder:text-gray-400"
              />
              {mapLinkInput && (
                <button
                  type="button"
                  onClick={() => {
                    setMapLinkInput('');
                    setLinkNotice(null);
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="ล้างข้อมูล"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleApplyMapLink}
              disabled={isResolvingLink || !mapLinkInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              title="ดึงพิกัดจากลิงก์และย้ายหมุดบนแผนที่ทันที"
            >
              {isResolvingLink ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังดึงพิกัด...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>ดึงพิกัด & ย้ายหมุดทันที</span>
                </>
              )}
            </button>
          </div>

          {/* ข้อความแจ้งเตือนสถานะเมื่อวางลิงก์ Google Maps */}
          {linkNotice && (
            <div
              className={`text-xs p-3 rounded-xl border flex items-start gap-2.5 animate-fade-in ${
                linkNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : linkNotice.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
            >
              {linkNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{linkNotice.message}</span>
            </div>
          )}

          <div className="flex items-start gap-1.5 text-[11px] text-gray-500 pt-0.5 leading-relaxed">
            <span className="text-red-600 font-bold shrink-0">💡 คำแนะนำ:</span>
            <span>
              เปิด Google Maps &gt; กดปุ่ม <strong>"แชร์ (Share)"</strong> &gt; เลือก <strong>"คัดลอกลิงก์ (Copy Link)"</strong> แล้วนำมาวางในช่องนี้ได้ทันที หรือสามารถคัดลอกตัวเลขพิกัด (เช่น 17.0090, 99.8112) มาวางได้เช่นกันค่ะ
            </span>
          </div>
        </div>

        {/* เส้นคั่นตัวเลือก */}
        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="shrink-0 mx-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            หรือเลือกตามอำเภอ / ใช้ GPS อุปกรณ์
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>เลือกโซนหรืออำเภอปลายทาง:</span>
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-500 shadow-xs cursor-pointer"
            >
              <optgroup label="📍 ในเขตเทศบาล">
                {LOCATION_PRESETS.filter((p) => p.zone === 'thani').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏘️ อำเภอในจังหวัดสุโขทัย">
                {LOCATION_PRESETS.filter((p) => p.zone === 'sukhothai_other').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🚚 จังหวัดใกล้เคียงที่ให้บริการส่ง">
                {LOCATION_PRESETS.filter((p) => p.zone === 'neighbor_allowed').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
              {selectedPresetId === 'custom' && (
                <option value="custom">📍 หมุดที่คุณระบุเองบนแผนที่ (GPS)</option>
              )}
            </select>
          </div>

          {/* ปุ่มดึงพิกัด GPS อัตโนมัติ */}
          <div className="sm:self-end">
            <button
              type="button"
              onClick={handleGetDeviceLocation}
              disabled={isLocating}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="ดึงตำแหน่ง GPS จากอุปกรณ์ของคุณ"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'กำลังค้นหา GPS...' : 'ใช้พิกัด GPS ของฉัน'}</span>
            </button>
          </div>
        </div>

        {/* ข้อความแจ้งเตือนสถานะ GPS */}
        {locationNotice && (
          <div
            className={`text-xs p-3 rounded-xl border flex items-start gap-2 animate-fade-in ${
              locationNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : locationNotice.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {locationNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            )}
            <span className="leading-relaxed">{locationNotice.message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-1 pt-1">
          <span className="flex items-center gap-1 text-blue-700 font-medium">
            <span>👆</span>
            <span>กดคลิกบนแผนที่ หรือกดค้างลากหมุดสีน้ำเงิน เพื่อย้ายหมุดหน้าบ้านของคุณได้</span>
          </span>
          <a
            href={STORE_LOCATION.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-red-600 hover:underline inline-flex items-center gap-1 font-semibold shrink-0"
          >
            <span>พิกัดร้านสุโขทัยแสงอุปกรณ์</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* แผนที่ Interactive Leaflet Map พร้อมปุ่มควบคุมมุมมอง */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100 w-full z-0 transition-all duration-300">
        
        {/* แถบเครื่องมือควบคุมแผนที่ลอยอยู่บน Map */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl shadow-md border border-gray-200 text-xs font-semibold">
          <button
            type="button"
            onClick={handleFocusCustomer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors cursor-pointer"
            title="ซูมส่องหมุดลูกค้า"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">หมุดฉัน</span>
          </button>
          <button
            type="button"
            onClick={handleFocusStore}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-red-50 text-red-700 rounded-lg transition-colors cursor-pointer"
            title="ซูมส่องร้านสุโขทัยแสงอุปกรณ์"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ที่ร้าน</span>
          </button>
          <button
            type="button"
            onClick={handleFitRoute}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors cursor-pointer"
            title="ดูภาพรวมเส้นทางทั้งหมด"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ภาพรวม</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors cursor-pointer border-t border-gray-100 pt-1.5"
            title={isExpanded ? 'ย่อแผนที่' : 'ขยายแผนที่ใหญ่'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isExpanded ? 'ย่อจอ' : 'ขยายจอ'}</span>
          </button>
        </div>

        {/* แถบแสดงพิกัดที่หมุดลูกค้าอยู่ */}
        <div className="absolute bottom-2.5 left-2.5 z-20 bg-black/75 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-xl shadow-md border border-white/10 pointer-events-none">
          <span>📍 พิกัดหมุด: <strong>{customerCoords.lat.toFixed(5)}, {customerCoords.lng.toFixed(5)}</strong></span>
        </div>

        {/* Container แสดง Map */}
        <div
          ref={mapContainerRef}
          className={`w-full transition-all duration-300 ${
            isExpanded ? 'h-[440px] sm:h-[500px]' : 'h-64 sm:h-72'
          }`}
        />
      </div>

      {/* บล็อกแสดงผลการประเมินค่าจัดส่ง */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
        {evaluation.isOutOfZone ? (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-red-900">
                  {evaluation.warningMessage || 'คุณอยู่นอกพื้นที่จัดส่ง กรุณาติดต่อพนักงาน หรือโทร 055-616437'}
                </h4>
                <p className="text-xs text-red-700 font-light leading-relaxed">
                  เนื่องจากปลายทางอยู่เกินระยะบริการจัดส่งปกติ (ระยะทางประมาณ {activeDistanceKm} กม.) กรุณาติดต่อเจ้าหน้าที่เพื่อประเมินค่าจัดส่งพิเศษค่ะ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="tel:055616437"
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>โทร 055-616437</span>
              </a>
              <a
                href="https://lin.ee/vbEDI1N"
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#06C755] hover:bg-[#05B04B] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>ทัก LINE @exu1868n</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    {evaluation.zoneName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-600">
                  <span>ระยะทางจากร้านสุโขทัยแสงอุปกรณ์:</span>
                  <strong className="text-gray-900 font-black text-sm">{activeDistanceKm} กิโลเมตร</strong>
                  {isCalculatingRoute ? (
                    <span className="text-[10px] text-gray-400 animate-pulse flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>กำลังคำนวณเส้นทาง...</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-400 block">ค่าจัดส่งคำนวณ:</span>
                {evaluation.isFreeDelivery ? (
                  <span className="text-lg sm:text-xl font-black text-emerald-600 flex items-center sm:justify-end gap-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>ส่งฟรี! (฿0)</span>
                  </span>
                ) : (
                  <div className="flex items-baseline sm:justify-end gap-1">
                    <span className="text-xl sm:text-2xl font-black text-red-600">
                      ฿{evaluation.deliveryFee.toLocaleString('th-TH')}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      ({activeDistanceKm} กม. × {evaluation.ratePerKm}.-)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-semibold">{evaluation.conditionDescription}</p>
                <p className="text-[11px] text-amber-800/80 font-light">
                  * กฎค่าส่ง: ในเขตเทศบาลธานี ยอด 5,000+ ส่งฟรี (ต่ำกว่า คิด 17.-/กม.) | นอกเทศบาล ยอด 60,000+ ส่งฟรี (30k-60k คิด 17.-/กม., ต่ำกว่า 30k คิด 22.-/กม.)
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
