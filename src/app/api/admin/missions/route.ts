import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { Mission } from '@/lib/types';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'rialo-admin-2026';

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const queryKey = new URL(req.url).searchParams.get('key') || '';
  return token === ADMIN_KEY || queryKey === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Key' }, { status: 401 });
  }

  const db = getDb();
  return NextResponse.json({
    success: true,
    totalMissions: db.missions.length,
    missions: db.missions,
    activeSeason: db.activeSeason,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Key' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, mission, missions, missionId, missionIds, isActive } = body;
    const db = getDb();

    // Create or Upsert Mission
    if ((action === 'CREATE_MISSION' || action === 'UPSERT_SINGLE') && mission) {
      const idx = db.missions.findIndex((m) => m.id === mission.id);
      if (idx >= 0) {
        db.missions[idx] = mission;
      } else {
        db.missions.push(mission);
      }
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Mission saved successfully', mission });
    }

    // Bulk schedule (Pre-Schedule 30 Days)
    if (action === 'BULK_SCHEDULE' && Array.isArray(missions)) {
      db.missions = missions;
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Scheduled ' + missions.length + ' missions!', total: missions.length });
    }

    // Reorder Missions
    if (action === 'REORDER_MISSIONS' && Array.isArray(missions)) {
      db.missions = missions;
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Missions reordered successfully', total: missions.length });
    }

    // Toggle active status
    if (action === 'TOGGLE_ACTIVE' || action === 'TOGGLE_STATUS') {
      const idToToggle = missionId || mission?.id;
      const target = db.missions.find((m) => m.id === idToToggle);
      if (target) {
        target.isActive = typeof isActive === 'boolean' ? isActive : !target.isActive;
        saveDb(db);
        return NextResponse.json({ success: true, message: 'Status toggled', mission: target });
      }
    }

    // Single Delete or Bulk Delete
    if (action === 'DELETE_MISSION' || action === 'BULK_DELETE') {
      const idsToDelete = Array.isArray(missionIds)
        ? missionIds
        : missionId
        ? [missionId]
        : mission?.id
        ? [mission.id]
        : [];

      if (idsToDelete.length > 0) {
        db.missions = db.missions.filter((m) => !idsToDelete.includes(m.id));
        saveDb(db);
        return NextResponse.json({ success: true, message: 'Deleted ' + idsToDelete.length + ' missions', deletedCount: idsToDelete.length });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action or payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Mission id required' }, { status: 400 });
    }

    const db = getDb();
    db.missions = db.missions.filter((m) => m.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Mission deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
