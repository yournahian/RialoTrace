import { NextRequest, NextResponse } from 'next/server';
import { claimUserGift, getUserPendingGifts } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }
    const pendingGifts = getUserPendingGifts(username);
    return NextResponse.json({ success: true, pendingGifts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, giftId } = body;
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }
    const result = claimUserGift(username, giftId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to claim gift' }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      user: result.user,
      cards: result.cards,
      giftLog: result.giftLog,
      message: 'Successfully claimed gift cards!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
