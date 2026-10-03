import { NextRequest, NextResponse } from 'next/server';
import { completeBroadcastMission, getOrCreateUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, broadcastId } = body;

    if (!username || !broadcastId) {
      return NextResponse.json({ success: false, error: 'Username and broadcastId are required' }, { status: 400 });
    }

    const result = completeBroadcastMission(username, broadcastId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      broadcast: result.broadcast,
      message: `🎉 Mission verified successfully! +${result.broadcast?.shardsReward || 0} Shards added to your vault!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
