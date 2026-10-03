import { NextRequest, NextResponse } from 'next/server';
import { getAllTrades, createTrade, updateTradeStatus, getOrCreateUser, saveUser } from '@/lib/db';
import { TradeOffer } from '@/lib/types';
import { RIALO_30_ARCHETYPES } from '@/lib/cardsData';

export async function GET() {
  try {
    const trades = await getAllTrades();
    const open = trades.filter(t => t.status === 'OPEN');
    const enriched = open.map(t => ({ ...t, offeredCard: RIALO_30_ARCHETYPES[t.offeredCardId] || null, requestedCard: RIALO_30_ARCHETYPES[t.requestedCardId] || null }));
    return NextResponse.json({ success: true, trades: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, offeredCardId, requestedCardId } = body;
    if (!username || !offeredCardId || !requestedCardId) return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    if (offeredCardId === requestedCardId) return NextResponse.json({ success: false, error: 'Cannot offer and request the exact same card!' }, { status: 400 });
    const cleanUsername = username.replace('@', '').trim().toLowerCase();
    const user = await getOrCreateUser(cleanUsername);
    const ownedCopies = user.inventory[offeredCardId] || 0;
    if (ownedCopies <= 1) return NextResponse.json({ success: false, error: 'You must own at least 2 copies to trade.' }, { status: 400 });
    const trades = await getAllTrades();
    const activeListings = trades.filter(t => t.offeredBy.toLowerCase() === cleanUsername && t.status === 'OPEN' && t.offeredCardId === offeredCardId).length;
    if (ownedCopies - 1 <= activeListings) return NextResponse.json({ success: false, error: 'All duplicate copies are locked in active trades!' }, { status: 400 });
    const existingRequest = trades.find(t => t.offeredBy.toLowerCase() === cleanUsername && t.status === 'OPEN' && t.requestedCardId === requestedCardId);
    if (existingRequest) return NextResponse.json({ success: false, error: 'You already have an active trade requesting this card!' }, { status: 400 });
    const newTrade: TradeOffer = { id: 'trade-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6), offeredBy: user.username, offeredCardId, requestedCardId, status: 'OPEN', createdAt: new Date().toISOString() };
    const saved = await createTrade(newTrade);
    return NextResponse.json({ success: true, trade: { ...saved, offeredCard: RIALO_30_ARCHETYPES[saved.offeredCardId] || null, requestedCard: RIALO_30_ARCHETYPES[saved.requestedCardId] || null } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tradeId, username } = body;
    if (!tradeId || !username) return NextResponse.json({ success: false, error: 'Missing tradeId or username' }, { status: 400 });
    const trades = await getAllTrades();
    const trade = trades.find(t => t.id === tradeId && t.status === 'OPEN');
    if (!trade) return NextResponse.json({ success: false, error: 'Trade not found or already closed' }, { status: 404 });
    const buyer = await getOrCreateUser(username);
    const seller = await getOrCreateUser(trade.offeredBy);
    if (buyer.username === seller.username) return NextResponse.json({ success: false, error: 'Cannot accept your own trade' }, { status: 400 });
    if ((buyer.inventory[trade.requestedCardId] || 0) <= 1) return NextResponse.json({ success: false, error: 'You must own a duplicate copy of the requested card.' }, { status: 400 });
    if (!seller.inventory[trade.offeredCardId] || seller.inventory[trade.offeredCardId] <= 0) return NextResponse.json({ success: false, error: 'Seller no longer owns the offered card' }, { status: 400 });
    buyer.inventory[trade.requestedCardId] -= 1;
    buyer.inventory[trade.offeredCardId] = (buyer.inventory[trade.offeredCardId] || 0) + 1;
    seller.inventory[trade.offeredCardId] -= 1;
    seller.inventory[trade.requestedCardId] = (seller.inventory[trade.requestedCardId] || 0) + 1;
    buyer.uniqueCardsCount = Object.keys(buyer.inventory).filter(k => buyer.inventory[k] > 0).length;
    seller.uniqueCardsCount = Object.keys(seller.inventory).filter(k => seller.inventory[k] > 0).length;
    buyer.lifetimePoints += 25; seller.lifetimePoints += 25;
    await saveUser(buyer); await saveUser(seller);
    await updateTradeStatus(tradeId, 'COMPLETED');
    return NextResponse.json({ success: true, message: 'Trade executed!', buyer, givenCardId: trade.requestedCardId, receivedCardId: trade.offeredCardId, givenCard: RIALO_30_ARCHETYPES[trade.requestedCardId] || null, receivedCard: RIALO_30_ARCHETYPES[trade.offeredCardId] || null, traderName: seller.username, pointsEarned: 25 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tradeId = searchParams.get('id');
    const username = searchParams.get('username')?.toLowerCase().trim();
    if (!tradeId || !username) return NextResponse.json({ success: false, error: 'Missing tradeId or username' }, { status: 400 });
    const trades = await getAllTrades();
    const trade = trades.find(t => t.id === tradeId && t.status === 'OPEN');
    if (!trade) return NextResponse.json({ success: false, error: 'Trade not found or already closed' }, { status: 404 });
    if (trade.offeredBy.toLowerCase() !== username) return NextResponse.json({ success: false, error: 'Unauthorized: Only the creator can delist' }, { status: 403 });
    await updateTradeStatus(tradeId, 'CANCELLED');
    return NextResponse.json({ success: true, message: 'Trade offer delisted!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
