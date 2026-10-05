import { NextRequest, NextResponse } from 'next/server';
import { getUser, getOrCreateUser, saveUser } from '@/lib/db';
import { verifyXUser } from '@/lib/twitterVerify';
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

    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    // Step 1: CHECK_USER - Live X Validation
    if (action === 'CHECK_USER') {
      // 1. Format check
      if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid handle format. X handles must be 1-15 characters (letters, numbers, underscores).',
          },
          { status: 400 }
        );
      }

      // 2. Check if user already registered in DB
      const existingUser = await getUser(cleanUsername);
      const hasPin = Boolean(existingUser?.pinHash);

      // 3. Verify real-time existence on X (Twitter)
      const verification = await verifyXUser(cleanUsername);
      if (!verification.ok) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: verification.error || `Account @${cleanUsername} does not exist on X (Twitter).`,
          },
          { status: 404 }
        );
      }

      // Return verified profile for preview and confirmation
      return NextResponse.json(
        {
          success: true,
          exists: hasPin,
          hasPin,
          username: cleanUsername,
          xProfile: verification.profile,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    if (!pin || pin.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'PIN must be at least 4 digits' }, { status: 400 });
    }
    const computedHash = hashPin(pin.trim(), cleanUsername);

    // Step 2: SIGN_UP / REGISTER
    if (action === 'SIGN_UP' || action === 'REGISTER') {
      const existing = await getUser(cleanUsername);
      if (existing?.pinHash) {
        return NextResponse.json({ success: false, error: 'Account already exists. Please sign in.' }, { status: 400 });
      }

      // Ensure user is truly verified on X before creating in database
      const verification = await verifyXUser(cleanUsername);
      if (!verification.ok) {
        return NextResponse.json(
          { success: false, notFound: true, error: verification.error || `Account @${cleanUsername} does not exist on X.` },
          { status: 400 }
        );
      }

      const user = await getOrCreateUser(cleanUsername);
      user.pinHash = computedHash;
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);

      return NextResponse.json({
        success: true,
        message: 'Account registered!',
        user: saved,
        xProfile: verification.profile,
      });
    }

    // Step 3: SIGN_IN / LOGIN
    if (action === 'SIGN_IN' || action === 'LOGIN') {
      const user = await getUser(cleanUsername);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found. Please sign up.' }, { status: 404 });
      }
      if (!user.pinHash) {
        user.pinHash = computedHash;
        user.updatedAt = new Date().toISOString();
        const saved = await saveUser(user);
        return NextResponse.json({ success: true, message: 'PIN configured!', user: saved });
      }
      if (user.pinHash !== computedHash) {
        return NextResponse.json({ success: false, error: 'Incorrect PIN.' }, { status: 401 });
      }
      return NextResponse.json({ success: true, message: 'Welcome back!', user });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
