import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function generateFallbackSvg(name: string) {
  const initial = (name.replace(/^@/, '')[0] || 'R').toUpperCase();
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0E1715"/>
          <stop offset="50%" stop-color="#070A09"/>
          <stop offset="100%" stop-color="#020403"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E5C365" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#E5C365" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <circle cx="200" cy="200" r="160" fill="url(#glow)"/>
      <circle cx="200" cy="200" r="140" fill="none" stroke="#E5C365" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="8 6"/>
      <text x="200" y="240" font-family="'Inter', sans-serif" font-size="120" font-weight="900" fill="#E5C365" text-anchor="middle">${initial}</text>
      <text x="200" y="320" font-family="'Space Mono', monospace" font-size="16" font-weight="700" fill="#A9DDD3" text-anchor="middle" letter-spacing="3">RIALO SPECIMEN</text>
    </svg>
  `.trim();
}

export async function GET(req: NextRequest, { params }: { params: { handle: string } }) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  const handle = (params.handle || searchParams.get('handle') || '').replace(/^@/, '').trim();

  // 1. Direct URL proxy
  if (targetUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          },
        });
      }
    } catch (err) {
      console.warn('Direct avatar proxy failed for URL:', targetUrl, err);
    }
  }

  // 2. Fetch by handle
  if (handle) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const xerperRes = await fetch('https://www.xerper.com/api/impressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          username: handle,
          project: 'RialoHQ',
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (xerperRes.ok) {
        const xData = await xerperRes.json();
        const avatarUrl = xData?.profile?.avatar?.replace('_normal', '_400x400');
        if (avatarUrl) {
          const imgRes = await fetch(avatarUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (imgRes.ok) {
            const buf = await imgRes.arrayBuffer();
            return new NextResponse(buf, {
              headers: {
                'Content-Type': imgRes.headers.get('content-type') || 'image/jpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
              },
            });
          }
        }
      }
    } catch (e) {
      console.warn('Xerper avatar lookup failed for handle:', handle, e);
    }

    try {
      const unavatarUrl = `https://unavatar.io/x/${encodeURIComponent(handle)}`;
      const unRes = await fetch(unavatarUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (unRes.ok) {
        const buf = await unRes.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            'Content-Type': unRes.headers.get('content-type') || 'image/jpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          },
        });
      }
    } catch (e) {
      console.warn('Unavatar lookup failed for handle:', handle, e);
    }
  }

  const svg = generateFallbackSvg(handle || 'Rialo');
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  });
}
