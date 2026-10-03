import { NextRequest, NextResponse } from 'next/server';
import { getMissionsForDate, getAllMissions, getTodayDateStr, getOrCreateUser, saveUser } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    const clientDate = searchParams.get('date') || '';
    const today = getTodayDateStr();
    const targetDate = clientDate || today;

    // 1. Fetch missions scheduled for target date
    let missions = await getMissionsForDate(targetDate);

    // 2. Fallback to today's date if target date yielded no missions
    if (missions.length === 0 && targetDate !== today) {
      missions = await getMissionsForDate(today);
    }

    // 3. If no missions match today either, load ONLY the first active day's tasks (e.g. Day 1), NEVER mixing future days
    if (missions.length === 0) {
      const all = await getAllMissions();
      const active = all.filter(m => m.isActive);
      if (active.length > 0) {
        const firstDay = active[0].dayNumber;
        missions = active.filter(m => m.dayNumber === firstDay);
      }
    }

    let completedIds: string[] = [];
    if (username) {
      const user = await getOrCreateUser(username);
      completedIds = user.completedMissions || [];
    }

    return NextResponse.json({ success: true, today: targetDate, missions, completedMissions: completedIds });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, missionId, proofScreenshot } = body;
    if (!username || !missionId) {
      return NextResponse.json({ success: false, error: 'Missing username or missionId' }, { status: 400 });
    }

    const all = await getAllMissions();
    const mission = all.find(m => m.id === missionId);
    if (!mission) return NextResponse.json({ success: false, error: 'Mission not found' }, { status: 404 });
    if (mission.screenshotRequirement === 'mandatory' && !proofScreenshot) {
      return NextResponse.json({ success: false, error: 'Screenshot proof is mandatory.' }, { status: 400 });
    }

    const user = await getOrCreateUser(username);
    let rewardedCard = null;

    if (!user.completedMissions.includes(missionId)) {
      user.completedMissions.push(missionId);
      user.shards += mission.rewardShards || 25;
      user.lifetimePoints += 30;

      // Optional Card Drop Reward!
      if (mission.rewardCardId) {
        const cardQty = Number(mission.rewardCardCount) || 1;
        user.inventory[mission.rewardCardId] = (user.inventory[mission.rewardCardId] || 0) + cardQty;
        user.totalCardsCount = (user.totalCardsCount || 0) + cardQty;
        user.lifetimePoints += 50 * cardQty;
        user.uniqueCardsCount = Object.keys(user.inventory).filter((k) => user.inventory[k] > 0).length;
        if (user.uniqueCardsCount === 30) {
          user.lifetimePoints += 2500;
        }

        const cardArch = ALL_30_CARDS.find((c) => c.id === mission.rewardCardId);
        rewardedCard = {
          id: mission.rewardCardId,
          title: cardArch?.title || mission.rewardCardId,
          rarity: cardArch?.rarity || 'RARE',
          image: cardArch?.image || `/cards/${mission.rewardCardId}.png`,
          badgeEmoji: cardArch?.badgeEmoji || '??',
          quantity: cardQty,
        };
      }

      if (!user.completedMissionsHistory) user.completedMissionsHistory = [];
      user.completedMissionsHistory.unshift({
        id: mission.id,
        title: mission.title,
        desc: mission.description,
        type: 'daily_mission',
        category: mission.type || 'Daily Quest',
        icon: rewardedCard ? rewardedCard.badgeEmoji : '?',
        shardsReward: mission.rewardShards || 25,
        completedAt: new Date().toISOString(),
      });
      user.updatedAt = new Date().toISOString();
      await saveUser(user);
    }

    return NextResponse.json({
      success: true,
      user,
      rewardedCard,
      message: 'Mission completed successfully!'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
