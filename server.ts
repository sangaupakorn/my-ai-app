/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { extractCoordsFromText, isValidLatLng } from './src/utils/googleMapsParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint สำหรับดึงพิกัดจาก Google Maps Link (รวมถึงลิงก์แบบย่อ เช่น maps.app.goo.gl)
  app.get('/api/resolve-maps-url', async (req: Request, res: Response): Promise<void> => {
    const rawUrl = req.query.url as string;
    if (!rawUrl || typeof rawUrl !== 'string') {
      res.status(400).json({ success: false, error: 'กรุณาระบุพารามิเตอร์ url' });
      return;
    }

    try {
      const trimmed = rawUrl.trim();

      // 1. ตรวจสอบพิกัดโดยตรงจาก URL เดิมก่อน
      const direct = extractCoordsFromText(trimmed);
      if (direct && isValidLatLng(direct.lat, direct.lng)) {
        res.json({
          success: true,
          lat: direct.lat,
          lng: direct.lng,
          resolvedUrl: trimmed,
          source: direct.source
        });
        return;
      }

      // 2. หากเป็น URL ให้ตามรอย HTTP 301/302 Redirect เพื่อหา URL ปลายทางตัวเต็ม
      let currentUrl = trimmed;
      if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
        currentUrl = 'https://' + currentUrl;
      }

      let hops = 0;
      let finalCoords = null;

      while (hops < 5) {
        hops++;
        const response = await fetch(currentUrl, {
          redirect: 'manual',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const location = response.headers.get('location');
        if (location) {
          try {
            currentUrl = new URL(location, currentUrl).toString();
          } catch (e) {
            currentUrl = location;
          }

          // กรณี redirect เข้าหน้า consent หรือ sorry ของ Google ดึงลิงก์ continue
          if (currentUrl.includes('continue=')) {
            try {
              const parsed = new URL(currentUrl);
              const cont = parsed.searchParams.get('continue');
              if (cont) currentUrl = decodeURIComponent(cont);
            } catch (e) {}
          }

          finalCoords = extractCoordsFromText(currentUrl);
          if (finalCoords && isValidLatLng(finalCoords.lat, finalCoords.lng)) {
            break;
          }
        } else {
          // หากไม่มี location header ลองอ่านเนื้อหาเพื่อหา meta หรือ protobuf
          if (response.ok) {
            const bodyText = await response.text();
            finalCoords = extractCoordsFromText(bodyText);
          }
          break;
        }
      }

      if (finalCoords && isValidLatLng(finalCoords.lat, finalCoords.lng)) {
        res.json({
          success: true,
          lat: finalCoords.lat,
          lng: finalCoords.lng,
          resolvedUrl: currentUrl,
          source: finalCoords.source
        });
        return;
      }

      res.status(404).json({
        success: false,
        error: 'ไม่สามารถดึงพิกัดจากลิงก์ที่ระบุได้ กรุณาตรวจสอบลิงก์ Google Maps หรือคัดลอกพิกัดตัวเลขมาวางโดยตรง'
      });
    } catch (err: any) {
      console.error('Error resolving map link:', err);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง'
      });
    }
  });

  // แคชสำหรับเก็บผลการคำนวณเส้นทางถนนจริง (Key: fromLat,fromLng-toLat,toLng)
  const routeCache = new Map<string, { timestamp: number; data: any }>();

  // API endpoint สำหรับคำนวณระยะทางและแนวถนนจริง (Real Road Routing)
  app.get('/api/route', async (req: Request, res: Response): Promise<void> => {
    const destLat = parseFloat(req.query.destLat as string);
    const destLng = parseFloat(req.query.destLng as string);
    const originLat = parseFloat(req.query.originLat as string) || 17.00905741030001;
    const originLng = parseFloat(req.query.originLng as string) || 99.81122699204761;

    if (isNaN(destLat) || isNaN(destLng)) {
      res.status(400).json({ success: false, error: 'พิกัดปลายทางไม่ถูกต้อง' });
      return;
    }

    const cacheKey = `${originLat.toFixed(5)},${originLng.toFixed(5)}-${destLat.toFixed(5)},${destLng.toFixed(5)}`;
    const cached = routeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      res.json(cached.data);
      return;
    }

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const osrmRes = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SukhothaiSangAupakorn-App/1.0'
        }
      });
      clearTimeout(timeoutId);

      if (osrmRes.ok) {
        const data = await osrmRes.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceMeters = route.distance || 0;
          const distanceKm = Math.max(0.1, Math.round((distanceMeters / 1000) * 10) / 10);
          const durationMin = Math.round((route.duration || 0) / 60);

          // แปลง GeoJSON [lng, lat] เป็น [lat, lng] สำหรับ Leaflet
          const points = (route.geometry?.coordinates || []).map((coord: [number, number]) => [coord[1], coord[0]]);

          const result = {
            success: true,
            distanceKm,
            durationMin,
            points: points.length > 0 ? points : [[originLat, originLng], [destLat, destLng]],
            isRoadRoute: true,
            source: 'osrm_road_network'
          };

          routeCache.set(cacheKey, { timestamp: Date.now(), data: result });
          res.json(result);
          return;
        }
      }
    } catch (routeErr) {
      console.warn('OSRM Route fetch error:', routeErr);
    }

    // กรณีเครือข่ายภายนอกช้าหรือล่ม: ใช้การคำนวณสำรอง (Fallback)
    const R = 6371;
    const dLat = ((destLat - originLat) * Math.PI) / 180;
    const dLon = ((destLng - originLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((originLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    const approxRoadDist = Math.max(0.5, Math.round(straightDist * 1.12 * 10) / 10);

    const fallbackResult = {
      success: true,
      distanceKm: approxRoadDist,
      points: [
        [originLat, originLng],
        [destLat, destLng]
      ],
      isRoadRoute: false,
      source: 'fallback_approx'
    };
    res.json(fallbackResult);
  });

  // ในโหมด Development ให้ใช้ Vite Middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // ในโหมด Production เสิร์ฟไฟล์จาก dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 เซิร์ฟเวอร์พร้อมทำงานที่ http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
