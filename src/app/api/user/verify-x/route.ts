import { NextRequest, NextResponse } from 'next/server';
import { verifyXUser } from '@/lib/twitterVerify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle') || searchParams.get('username') || '';
  
  if (!handle.trim()) {
    return NextResponse.json({ success: false, error: 'Handle is required' }, { status: 400 });
  }

  const result = await verifyXUser(handle);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, notFound: result.notFound ?? true, error: result.error },
      { status: result.notFound ? 404 : 400 }
    );
  }

  return NextResponse.json(
    { success: true, profile: result.profile },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const handle = body.handle || body.username || '';

    if (!handle.trim()) {
      return NextResponse.json({ success: false, error: 'Handle is required' }, { status: 400 });
    }

    const result = await verifyXUser(handle);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, notFound: result.notFound ?? true, error: result.error },
        { status: result.notFound ? 404 : 400 }
      );
    }

    return NextResponse.json({ success: true, profile: result.profile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
