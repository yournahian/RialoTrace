import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, getOrCreateUser } from '@/lib/db';
import { TradeOffer } from '@/lib/types';
import { RIALO_30_ARCHETYPES } from '@/lib/cardsData';

export async function GET() {
  try {
    const db = getDb();
    const openTrades = db.trades.filter((t) => t.status === 'OPEN');

    const enriched = openTrades.map((t) => ({
      ...t,
      offeredCard: RIALO_30_ARCHETYPES[t.offeredCardId] || null,
      requestedCard: RIALO_30_ARCHETYPES[t.requestedCardId] || null,
    }));

    return NextResponse.json({ success: true, trades: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, offeredCardId, requestedCardId } = body;

    if (!username || !offeredCardId || !requestedCardId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    if (offeredCardId === requestedCardId) {
      return NextResponse.json({ success: false, error: 'Cannot offer and request the exact same card!' }, { status: 400 });
    }

    const db = getDb();
    const cleanUsername = username.replace('@', '').trim().toLowerCase();
    const user = getOrCreateUser(cleanUsername);

    // Rule 1: Must own at least 2 copies (duplicate requirement)
    const ownedCopies = user.inventory[offeredCardId] || 0;
    if (ownedCopies <= 1) {
      return NextResponse.json({
        success: false,
        error: 'You do not have a duplicate copy of this card! You must own at least 2 copies to trade away a duplicate.',
      }, { status: 400 });
    }

    // Rule 2: Check how many copies are already tied up in active open trades
    const activeListingsForThisCard = db.trades.filter(
      (t) => t.offeredBy.toLowerCase() === cleanUsername && t.status === 'OPEN' && t.offeredCardId === offeredCardId
    ).length;

    if (ownedCopies - 1 <= activeListingsForThisCard) {
      return NextResponse.json({
        success: false,
        error: 'All available duplicate copies of this card are already locked in active trade offers!',
      }, { status: 400 });
    }

    // Rule 3: Anti-Spam - Cannot request the same card multiple times across active listings
    const existingRequest = db.trades.find(
      (t) => t.offeredBy.toLowerCase() === cleanUsername && t.status === 'OPEN' && t.requestedCardId === requestedCardId
    );
    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'You already have an active trade offer requesting this card! Delist your existing offer first before creating another.',
      }, { status: 400 });
    }

    const newTrade: TradeOffer = {
      id: 'trade-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      offeredBy: user.username,
      offeredCardId,
      requestedCardId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    db.trades.unshift(newTrade);
    saveDb(db);

    const enriched = {
      ...newTrade,
      offeredCard: RIALO_30_ARCHETYPES[newTrade.offeredCardId] || null,
      requestedCard: RIALO_30_ARCHETYPES[newTrade.requestedCardId] || null,
    };

    return NextResponse.json({ success: true, trade: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tradeId, username } = body;

    if (!tradeId || !username) {
      return NextResponse.json({ success: false, error: 'Missing tradeId or username' }, { status: 400 });
    }

    const db = getDb();
    const trade = db.trades.find((t) => t.id === tradeId && t.status === 'OPEN');
    if (!trade) {
      return NextResponse.json({ success: false, error: 'Trade offer not found or already closed' }, { status: 404 });
    }

    const buyer = getOrCreateUser(username);
    const seller = getOrCreateUser(trade.offeredBy);

    if (buyer.username.toLowerCase() === seller.username.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Cannot accept your own trade' }, { status: 400 });
    }

    const buyerOwned = buyer.inventory[trade.requestedCardId] || 0;
    if (buyerOwned <= 1) {
      return NextResponse.json({
        success: false,
        error: 'You must own a duplicate copy of the requested card (' + trade.requestedCardId + ') to accept this trade! Your single copy is protected to keep your binder complete.',
      }, { status: 400 });
    }

    if (!seller.inventory[trade.offeredCardId] || seller.inventory[trade.offeredCardId] <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Seller no longer owns the offered card',
      }, { status: 400 });
    }

    // Atomic Swap
    buyer.inventory[trade.requestedCardId] -= 1;
    buyer.inventory[trade.offeredCardId] = (buyer.inventory[trade.offeredCardId] || 0) + 1;

    seller.inventory[trade.offeredCardId] -= 1;
    seller.inventory[trade.requestedCardId] = (seller.inventory[trade.requestedCardId] || 0) + 1;

    buyer.uniqueCardsCount = Object.keys(buyer.inventory).filter((k) => buyer.inventory[k] > 0).length;
    seller.uniqueCardsCount = Object.keys(seller.inventory).filter((k) => seller.inventory[k] > 0).length;

    buyer.lifetimePoints += 25;
    seller.lifetimePoints += 25;

    trade.status = 'COMPLETED';

    db.users[buyer.username] = buyer;
    db.users[seller.username] = seller;
    saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Trade executed successfully!',
      buyer,
      givenCardId: trade.requestedCardId,
      receivedCardId: trade.offeredCardId,
      givenCard: RIALO_30_ARCHETYPES[trade.requestedCardId] || null,
      receivedCard: RIALO_30_ARCHETYPES[trade.offeredCardId] || null,
      traderName: seller.username,
      pointsEarned: 25,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tradeId = searchParams.get('id');
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!tradeId || !username) {
      return NextResponse.json({ success: false, error: 'Missing tradeId or username' }, { status: 400 });
    }

    const db = getDb();
    const trade = db.trades.find((t) => t.id === tradeId && t.status === 'OPEN');
    if (!trade) {
      return NextResponse.json({ success: false, error: 'Trade offer not found or already closed' }, { status: 404 });
    }

    if (trade.offeredBy.toLowerCase() !== username) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Only the creator can delist this offer' }, { status: 403 });
    }

    trade.status = 'CANCELLED';
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Trade offer delisted successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
