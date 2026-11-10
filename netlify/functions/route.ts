/**
 * Netlify Serverless Function สำหรับคำนวณระยะทางและแนวเส้นทางถนนจริง (OSRM)
 */

export async function handler(event: any) {
  const destLat = parseFloat(event.queryStringParameters?.destLat || '');
  const destLng = parseFloat(event.queryStringParameters?.destLng || '');
  const originLat = parseFloat(event.queryStringParameters?.originLat || '') || 17.00905741030001;
  const originLng = parseFloat(event.queryStringParameters?.originLng || '') || 99.81122699204761;

  if (isNaN(destLat) || isNaN(destLng)) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: 'พิกัดปลายทางไม่ถูกต้อง' })
    };
  }

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'SukhothaiSangAupakorn-App/1.0'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceMeters = route.distance || 0;
        const distanceKm = Math.max(0.1, Math.round((distanceMeters / 1000) * 10) / 10);
        const durationMin = Math.round((route.duration || 0) / 60);
        const points = (route.geometry?.coordinates || []).map((coord: [number, number]) => [coord[1], coord[0]]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            distanceKm,
            durationMin,
            points: points.length > 0 ? points : [[originLat, originLng], [destLat, destLng]],
            isRoadRoute: true,
            source: 'netlify_osrm'
          })
        };
      }
    }
  } catch (err: any) {
    console.warn('Netlify route calculation error:', err);
  }

  // Fallback คำนวณเส้นตรง
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      distanceKm: approxRoadDist,
      points: [
        [originLat, originLng],
        [destLat, destLng]
      ],
      isRoadRoute: false,
      source: 'fallback'
    })
  };
}
