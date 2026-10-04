import { NextRequest, NextResponse } from 'next/server';
import { addBroadcastEvent, getBroadcastEvents, awardUserShards, deleteBroadcastEvent } from '@/lib/db';
import { BroadcastEvent } from '@/lib/types';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'rialo-admin-2026';

export async function GET() {
  try {
    const broadcasts = await getBroadcastEvents();
    return NextResponse.json({ success: true, broadcasts });
  } catch (error) {
    console.error('Failed to get broadcasts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, broadcastType = 'achievement', achievementId, title, desc, icon, tier, recipient, shardsReward, message, missionCategory, targetCount, noticeSeverity } = body;

    if (passkey !== ADMIN_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Passkey' }, { status: 401 });
    }

    if (!title || !recipient) {
      return NextResponse.json({ success: false, error: 'Title and recipient are required' }, { status: 400 });
    }

    const event: BroadcastEvent = {
      id: 'bcast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      broadcastType: broadcastType === 'system_notice' ? 'system_notice' : broadcastType === 'mission' ? 'mission' : 'achievement',
      noticeSeverity: noticeSeverity || 'maintenance',
      achievementId: achievementId || 'custom',
      title: title.trim(),
      desc: desc ? desc.trim() : (broadcastType === 'mission' ? 'Protocol mission published by admin.' : 'Platform achievement verified and broadcasted by admin.'),
      icon: icon || (broadcastType === 'mission' ? '🎯' : '🏆'),
      tier: tier || 'Gold',
      recipient: recipient.trim(),
      shardsReward: Number(shardsReward) || 0,
      message: message ? message.trim() : '',
      missionCategory: missionCategory || 'trollbox',
      targetCount: Number(targetCount) || 10,
      completedBy: [],
      createdAt: new Date().toISOString(),
    };

    await addBroadcastEvent(event);

    // If recipient is a specific user, shards > 0, and broadcastType is achievement, award shards directly
    const cleanHandle = recipient.replace('@', '').trim();
    if (event.broadcastType === 'achievement' && cleanHandle && cleanHandle.toUpperCase() !== 'ALL' && cleanHandle.toUpperCase() !== 'ALL PLAYERS' && event.shardsReward > 0) {
      await awardUserShards(cleanHandle, event.shardsReward);
    }

    return NextResponse.json({ success: true, broadcast: event });
  } catch (error) {
    console.error('Failed to broadcast achievement:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passkey = searchParams.get('key');
    const id = searchParams.get('id');

    if (passkey !== ADMIN_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Passkey' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Broadcast ID is required' }, { status: 400 });
    }

    const deleted = await deleteBroadcastEvent(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete broadcast:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
