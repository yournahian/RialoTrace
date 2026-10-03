import { NextRequest, NextResponse } from 'next/server';
import { getAllMissions, upsertMission, upsertManyMissions, deleteMission, deleteManyMissions, toggleMissionActive, getActiveSeason } from '@/lib/db';
import { Mission } from '@/lib/types';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || 'rialo-admin-2026';
function isAuthorized(req: NextRequest) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
  const queryKey = new URL(req.url).searchParams.get('key') || '';
  return token === ADMIN_KEY || queryKey === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const missions = await getAllMissions();
  const season = await getActiveSeason();
  return NextResponse.json({ success: true, totalMissions: missions.length, missions, activeSeason: season });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { action, mission, missions, missionId, missionIds, isActive } = body;

    if ((action === 'CREATE_MISSION' || action === 'UPSERT_SINGLE') && mission) {
      const saved = await upsertMission(mission as Mission);
      return NextResponse.json({ success: true, message: 'Mission saved successfully', mission: saved });
    }
    if (action === 'BULK_SCHEDULE' && Array.isArray(missions)) {
      await upsertManyMissions(missions as Mission[]);
      return NextResponse.json({ success: true, message: `Scheduled ${missions.length} missions!`, total: missions.length });
    }
    if (action === 'REORDER_MISSIONS' && Array.isArray(missions)) {
      await upsertManyMissions(missions as Mission[]);
      return NextResponse.json({ success: true, message: 'Missions reordered', total: missions.length });
    }
    if (action === 'TOGGLE_ACTIVE' || action === 'TOGGLE_STATUS') {
      const idToToggle = missionId || mission?.id;
      const all = await getAllMissions();
      const target = all.find(m => m.id === idToToggle);
      const newState = typeof isActive === 'boolean' ? isActive : !target?.isActive;
      const updated = await toggleMissionActive(idToToggle, newState);
      return NextResponse.json({ success: true, message: 'Status toggled', mission: updated });
    }
    if (action === 'DELETE_MISSION' || action === 'BULK_DELETE') {
      const ids = Array.isArray(missionIds) ? missionIds : missionId ? [missionId] : mission?.id ? [mission.id] : [];
      if (ids.length > 0) {
        await deleteManyMissions(ids);
        return NextResponse.json({ success: true, message: `Deleted ${ids.length} missions`, deletedCount: ids.length });
      }
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Mission id required' }, { status: 400 });
  await deleteMission(id);
  return NextResponse.json({ success: true, message: 'Mission deleted' });
}
