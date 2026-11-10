/**
 * Netlify Serverless Function สำหรับคลายลิงก์ Google Maps (maps.app.goo.gl)
 * และดึงพิกัด Latitude, Longitude เพื่อใช้ในระบบคำนวณค่าจัดส่ง
 */

export async function handler(event: any) {
  const rawUrl = event.queryStringParameters?.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: 'กรุณาระบุพารามิเตอร์ url' })
    };
  }

  try {
    const trimmed = rawUrl.trim();
    let currentUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    let hops = 0;
    let finalCoords: { lat: number; lng: number } | null = null;

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

        if (currentUrl.includes('continue=')) {
          try {
            const parsed = new URL(currentUrl);
            const cont = parsed.searchParams.get('continue');
            if (cont) currentUrl = decodeURIComponent(cont);
          } catch (e) {}
        }

        const protoMatch = currentUrl.match(/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/i);
        const atMatch = currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const qMatch = currentUrl.match(/[?&]q=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i);

        if (protoMatch) {
          finalCoords = { lat: parseFloat(protoMatch[1]), lng: parseFloat(protoMatch[2]) };
          break;
        } else if (atMatch) {
          finalCoords = { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
          break;
        } else if (qMatch) {
          finalCoords = { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
          break;
        }
      } else {
        if (response.ok) {
          const body = await response.text();
          const protoMatch = body.match(/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/i);
          const atMatch = body.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (protoMatch) {
            finalCoords = { lat: parseFloat(protoMatch[1]), lng: parseFloat(protoMatch[2]) };
          } else if (atMatch) {
            finalCoords = { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
          }
        }
        break;
      }
    }

    if (finalCoords) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          lat: finalCoords.lat,
          lng: finalCoords.lng,
          resolvedUrl: currentUrl
        })
      };
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: 'ไม่พบพิกัดในลิงก์' })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: err?.message || 'Server error' })
    };
  }
}
