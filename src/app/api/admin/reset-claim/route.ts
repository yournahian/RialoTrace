import { NextRequest, NextResponse } from 'next/server';
import { resetUserClaimDate } from '@/lib/db';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || 'rialo-admin-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, adminKey, passkey } = body;
    const key = adminKey || passkey;
    if (key !== ADMIN_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }
    const cleanUsername = username.replace(/^@/, '').trim();
    const updatedUser = await resetUserClaimDate(cleanUsername);
    return NextResponse.json({ success: true, user: updatedUser, message: `Reset claim lock for @${cleanUsername}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
