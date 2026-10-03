import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateDynamicTier } from '@/lib/tiers';

export async function GET() {
  try {
    const db = getDb();
    const usersList = Object.values(db.users);

    // Sort by uniqueCardsCount descending, then lifetimePoints descending
    usersList.sort((a, b) => {
      if (b.uniqueCardsCount !== a.uniqueCardsCount) {
        return b.uniqueCardsCount - a.uniqueCardsCount;
      }
      return b.lifetimePoints - a.lifetimePoints;
    });

    const totalUsers = usersList.length;

    const ranked = usersList.map((u, index) => {
      const rank = index + 1;
      const tier = calculateDynamicTier(rank, totalUsers);
      return {
        rank,
        username: u.username,
        uniqueCardsCount: u.uniqueCardsCount,
        totalCardsCount: u.totalCardsCount,
        lifetimePoints: u.lifetimePoints,
        streakDays: u.streakDays,
        shards: u.shards,
        tier,
        tierInfo: tier,
      };
    });

    return NextResponse.json({
      success: true,
      totalUsers,
      users: ranked,
      leaderboard: ranked,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
