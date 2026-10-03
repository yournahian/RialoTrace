import { NextRequest, NextResponse } from 'next/server';
import { updateUserInventory, getOrCreateUser } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || 'rialo-admin-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, packCount = 1 } = body;
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    const user = await getOrCreateUser(username);
    const allCardIds = ALL_30_CARDS.map(c => c.id);
    const pulledCardIds: string[] = [];
    for (let i = 0; i < packCount; i++) {
      const cardId = allCardIds[Math.floor(Math.random() * allCardIds.length)];
      pulledCardIds.push(cardId);
    }
    const updatedUser = await updateUserInventory(username, pulledCardIds);
    const pulledCards = pulledCardIds.map(id => ALL_30_CARDS.find(c => c.id === id)).filter(Boolean);
    return NextResponse.json({ success: true, user: updatedUser, pulledCards, pulledCardIds });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
