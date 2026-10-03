import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, getTodayDateStr, getOrCreateUser } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    const today = getTodayDateStr();

    const db = getDb();
    const todayMissions = db.missions.filter((m) => m.scheduledDate === today && m.isActive);

    let completedIds: string[] = [];
    if (username) {
      const user = getOrCreateUser(username);
      completedIds = user.completedMissions || [];
    }

    return NextResponse.json({
      success: true,
      today,
      missions: todayMissions,
      completedMissions: completedIds,
    });
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

    const db = getDb();
    const mission = db.missions.find((m) => m.id === missionId);
    if (!mission) {
      return NextResponse.json({ success: false, error: 'Mission not found' }, { status: 404 });
    }

    if (mission.screenshotRequirement === 'mandatory' && !proofScreenshot) {
      return NextResponse.json({ success: false, error: 'Screenshot proof (SS) is mandatory for this mission.' }, { status: 400 });
    }

    const user = getOrCreateUser(username);
    if (!user.completedMissions.includes(missionId)) {
      user.completedMissions.push(missionId);
      user.shards += mission.rewardShards || 25;
      user.lifetimePoints += 30; // 30 pts per mission
      if (!user.completedMissionsHistory) {
        user.completedMissionsHistory = [];
      }
      user.completedMissionsHistory.unshift({
        id: mission.id,
        title: mission.title,
        desc: mission.description,
        type: 'daily_mission',
        category: mission.type || 'Daily Quest',
        icon: '⚡',
        shardsReward: mission.rewardShards || 25,
        completedAt: new Date().toISOString(),
      });
      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Mission completed successfully!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
