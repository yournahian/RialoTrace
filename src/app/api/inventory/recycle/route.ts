import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, getOrCreateUser } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, cardIdsToBurn } = body;

    if (!username || !Array.isArray(cardIdsToBurn) || cardIdsToBurn.length !== 3) {
      return NextResponse.json({ success: false, error: 'Must provide exactly 3 card IDs to recycle/burn' }, { status: 400 });
    }

    const user = getOrCreateUser(username);

    const tempInv = { ...user.inventory };
    for (const cid of cardIdsToBurn) {
      if (!tempInv[cid] || tempInv[cid] <= 0) {
        return NextResponse.json({ success: false, error: 'You do not own enough of card: ' + cid }, { status: 400 });
      }
      tempInv[cid] -= 1;
    }

    user.inventory = tempInv;
    user.totalCardsCount -= 3;

    const newCard = ALL_30_CARDS[Math.floor(Math.random() * ALL_30_CARDS.length)];
    user.inventory[newCard.id] = (user.inventory[newCard.id] || 0) + 1;
    user.totalCardsCount += 1;
    user.shards += 15;
    user.uniqueCardsCount = Object.keys(user.inventory).filter((k) => user.inventory[k] > 0).length;
    user.updatedAt = new Date().toISOString();

    const db = getDb();
    db.users[user.username] = user;
    saveDb(db);

    return NextResponse.json({
      success: true,
      newCard,
      user,
      message: 'Burned 3 cards and crafted a new mystery card!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
