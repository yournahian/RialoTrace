import { NextRequest, NextResponse } from 'next/server';
import { claimUserGift, getUserPendingGifts } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    const pending = await getUserPendingGifts(username);
    return NextResponse.json({ success: true, pendingGifts: pending });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, giftId } = body;
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    const result = await claimUserGift(username, giftId);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
