import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getAllUsersSummary } from '@/lib/db';
import { calculateDynamicTier } from '@/lib/tiers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });

    const user = await getOrCreateUser(username);
    const allUsers = await getAllUsersSummary();
    allUsers.sort((a, b) => b.uniqueCardsCount - a.uniqueCardsCount || b.lifetimePoints - a.lifetimePoints);
    const rank = allUsers.findIndex(u => u.username === user.username) + 1;
    const tier = calculateDynamicTier(rank || 1, allUsers.length);

    return NextResponse.json({ success: true, user, rank, totalUsers: allUsers.length, tier });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
