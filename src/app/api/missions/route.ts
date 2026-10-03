import { NextRequest, NextResponse } from 'next/server';
import { getMissionsForDate, getAllMissions, getTodayDateStr, getOrCreateUser, saveUser } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    const clientDate = searchParams.get('date') || '';
    const today = getTodayDateStr();
    const targetDate = clientDate || today;

    let missions = await getMissionsForDate(targetDate);
    if (missions.length === 0 && targetDate !== today) {
      missions = await getMissionsForDate(today);
    }
    if (missions.length === 0) {
      const all = await getAllMissions();
      missions = all.filter(m => m.isActive).slice(0, 6);
    }

    let completedIds: string[] = [];
    if (username) {
      const user = await getOrCreateUser(username);
      completedIds = user.completedMissions || [];
    }

    return NextResponse.json({ success: true, today, missions, completedMissions: completedIds });
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
    if (!user.completedMissions.includes(missionId)) {
      user.completedMissions.push(missionId);
      user.shards += mission.rewardShards || 25;
      user.lifetimePoints += 30;
      if (!user.completedMissionsHistory) user.completedMissionsHistory = [];
      user.completedMissionsHistory.unshift({
        id: mission.id, title: mission.title, desc: mission.description,
        type: 'daily_mission', category: mission.type || 'Daily Quest',
        icon: '⚡', shardsReward: mission.rewardShards || 25, completedAt: new Date().toISOString(),
      });
      user.updatedAt = new Date().toISOString();
      await saveUser(user);
    }

    return NextResponse.json({ success: true, user, message: 'Mission completed successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
