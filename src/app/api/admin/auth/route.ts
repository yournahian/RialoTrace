import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passkey = (body.passkey || '').trim();
    const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'rialo-admin-2026';

    if (!passkey || passkey !== adminSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Authenticated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
