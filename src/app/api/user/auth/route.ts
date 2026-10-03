import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, getOrCreateUser } from '@/lib/db';
import crypto from 'crypto';

function hashPin(pin: string, username: string): string {
  return crypto.createHash('sha256').update(`${pin}:${username.toLowerCase()}`).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, pin } = body;

    const cleanUsername = (username || '').replace('@', '').trim().toLowerCase();

    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const db = getDb();
    const existingUser = db.users[cleanUsername];

    // ACTION: CHECK_USER
    if (action === 'CHECK_USER') {
      return NextResponse.json({
        success: true,
        exists: Boolean(existingUser),
        hasPin: Boolean(existingUser && existingUser.pinHash),
        username: cleanUsername,
      });
    }

    // PIN is required for SIGN_UP and SIGN_IN
    if (!pin || typeof pin !== 'string' || pin.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    const cleanPin = pin.trim();
    const computedHash = hashPin(cleanPin, cleanUsername);

    // ACTION: SIGN_UP (REGISTER)
    if (action === 'SIGN_UP' || action === 'REGISTER') {
      if (existingUser && existingUser.pinHash) {
        return NextResponse.json({
          success: false,
          error: 'Account already exists. Please enter your PIN to sign in.',
        }, { status: 400 });
      }

      // Ensure user is created in database
      getOrCreateUser(cleanUsername);

      const freshDb = getDb();
      const targetUser = freshDb.users[cleanUsername];
      targetUser.pinHash = computedHash;
      targetUser.updatedAt = new Date().toISOString();
      saveDb(freshDb);

      return NextResponse.json({
        success: true,
        message: 'Account registered and secured with PIN!',
        user: targetUser,
      });
    }

    // ACTION: SIGN_IN (LOGIN)
    if (action === 'SIGN_IN' || action === 'LOGIN') {
      const freshDb = getDb();
      const user = freshDb.users[cleanUsername];

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found. Please sign up to create this profile.',
        }, { status: 404 });
      }

      // If user had no PIN yet (e.g. legacy demo account), let them claim with this PIN
      if (!user.pinHash) {
        user.pinHash = computedHash;
        user.updatedAt = new Date().toISOString();
        saveDb(freshDb);
        return NextResponse.json({
          success: true,
          message: 'PIN successfully configured for this account!',
          user,
        });
      }

      // Check PIN
      if (user.pinHash !== computedHash) {
        return NextResponse.json({
          success: false,
          error: 'Incorrect PIN. Please try again.',
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome back!',
        user,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('User auth route error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
