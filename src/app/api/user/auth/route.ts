import { NextRequest, NextResponse } from 'next/server';
import { getUser, getOrCreateUser, saveUser } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function hashPin(pin: string, username: string): string {
  return crypto.createHash('sha256').update(`${pin}:${username.toLowerCase()}`).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, pin } = body;
    const cleanUsername = (username || '').replace('@', '').trim().toLowerCase();
    if (!cleanUsername) return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });

    if (action === 'CHECK_USER') {
      // Immediately register / get user so they instantly appear on leaderboard & recommendations!
      const user = await getOrCreateUser(cleanUsername);
      const hasPin = Boolean(user?.pinHash);
      return NextResponse.json(
        { success: true, exists: hasPin, hasPin, username: cleanUsername },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    if (!pin || pin.trim().length < 4) return NextResponse.json({ success: false, error: 'PIN must be at least 4 digits' }, { status: 400 });
    const computedHash = hashPin(pin.trim(), cleanUsername);

    if (action === 'SIGN_UP' || action === 'REGISTER') {
      const existing = await getUser(cleanUsername);
      if (existing?.pinHash) return NextResponse.json({ success: false, error: 'Account already exists. Please sign in.' }, { status: 400 });
      const user = await getOrCreateUser(cleanUsername);
      user.pinHash = computedHash;
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, message: 'Account registered!', user: saved });
    }

    if (action === 'SIGN_IN' || action === 'LOGIN') {
      const user = await getUser(cleanUsername);
      if (!user) return NextResponse.json({ success: false, error: 'User not found. Please sign up.' }, { status: 404 });
      if (!user.pinHash) {
        user.pinHash = computedHash;
        user.updatedAt = new Date().toISOString();
        const saved = await saveUser(user);
        return NextResponse.json({ success: true, message: 'PIN configured!', user: saved });
      }
      if (user.pinHash !== computedHash) return NextResponse.json({ success: false, error: 'Incorrect PIN.' }, { status: 401 });
      return NextResponse.json({ success: true, message: 'Welcome back!', user });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
