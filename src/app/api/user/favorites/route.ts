import { NextRequest, NextResponse } from 'next/server';
import { updateUserFavorites, getOrCreateUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, favoriteCards } = body;

    if (!username || !Array.isArray(favoriteCards)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters. Provide username and favoriteCards array.' },
        { status: 400 }
      );
    }

    const updatedUser = updateUserFavorites(username, favoriteCards);
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Favorite cards updated successfully!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
