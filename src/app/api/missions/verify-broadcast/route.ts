import { NextRequest, NextResponse } from 'next/server';
import { completeBroadcastMission } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, broadcastId } = body;
    if (!username || !broadcastId) return NextResponse.json({ success: false, error: 'Missing username or broadcastId' }, { status: 400 });
    const result = await completeBroadcastMission(username, broadcastId);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
