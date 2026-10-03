import { NextRequest, NextResponse } from 'next/server';
import { updateUserFavorites } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, favoriteCardIds } = body;
    if (!username || !Array.isArray(favoriteCardIds)) {
      return NextResponse.json({ success: false, error: 'Missing username or favoriteCardIds' }, { status: 400 });
    }
    const user = await updateUserFavorites(username, favoriteCardIds);
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
