import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, saveUser } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, cardIdsToBurn } = body;
    if (!username || !Array.isArray(cardIdsToBurn) || cardIdsToBurn.length !== 3) {
      return NextResponse.json({ success: false, error: 'Must provide exactly 3 card IDs to recycle/burn' }, { status: 400 });
    }
    const user = await getOrCreateUser(username);
    for (const cid of cardIdsToBurn) {
      if (!user.inventory[cid] || user.inventory[cid] <= 0) {
        return NextResponse.json({ success: false, error: 'You do not own enough of card: ' + cid }, { status: 400 });
      }
      user.inventory[cid] -= 1;
    }
    user.totalCardsCount -= 3;
    const newCard = ALL_30_CARDS[Math.floor(Math.random() * ALL_30_CARDS.length)];
    user.inventory[newCard.id] = (user.inventory[newCard.id] || 0) + 1;
    user.totalCardsCount += 1;
    user.shards += 15;
    user.uniqueCardsCount = Object.keys(user.inventory).filter(k => user.inventory[k] > 0).length;
    user.updatedAt = new Date().toISOString();
    const saved = await saveUser(user);
    return NextResponse.json({ success: true, newCard, user: saved, message: 'Burned 3 cards and crafted a new mystery card!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
