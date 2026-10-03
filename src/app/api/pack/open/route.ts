import { NextRequest, NextResponse } from 'next/server';
import { updateUserInventory, getOrCreateUser } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, packCount = 3, date } = body;
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });

    const user = await getOrCreateUser(username);
    const countToPull = typeof packCount === 'number' && packCount > 0 ? packCount : 3;
    const allCardIds = ALL_30_CARDS.map(c => c.id);
    const pulledCardIds: string[] = [];

    for (let i = 0; i < countToPull; i++) {
      const cardId = allCardIds[Math.floor(Math.random() * allCardIds.length)];
      pulledCardIds.push(cardId);
    }

    const updatedUser = await updateUserInventory(username, pulledCardIds, date);
    const pulledCards = pulledCardIds.map(id => ALL_30_CARDS.find(c => c.id === id)).filter(Boolean);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      cards: pulledCards,
      pulledCards,
      pulledCardIds,
      message: 'Pack claimed successfully!'
    });
  } catch (err: any) {
    console.error('Pack opening error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to claim pack' }, { status: 500 });
  }
}
