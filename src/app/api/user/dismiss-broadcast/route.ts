export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server';
import { dismissBroadcastEvent } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, broadcastId, broadcastIds } = body;

    const cleanUsername = (username || '').replace('@', '').trim().toLowerCase();
    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const ids: string[] = Array.isArray(broadcastIds) && broadcastIds.length > 0
      ? broadcastIds
      : broadcastId ? [broadcastId] : [];

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'broadcastId or broadcastIds required' }, { status: 400 });
    }

    let lastUser;
    for (const bId of ids) {
      const res = await dismissBroadcastEvent(cleanUsername, bId);
      if (res.user) lastUser = res.user;
    }

    return NextResponse.json({ success: true, dismissedIds: ids, user: lastUser });
  } catch (error) {
    console.error('Failed to dismiss broadcast:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
