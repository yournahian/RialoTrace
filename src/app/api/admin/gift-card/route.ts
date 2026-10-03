import { NextRequest, NextResponse } from 'next/server';
import { giftCardToUser, getGiftLogs, deleteGiftLog, getAllUsersSummary } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'rialo-admin-2026';

export async function GET(req: NextRequest) {
  try {
    const giftLogs = getGiftLogs();
    const users = getAllUsersSummary();
    return NextResponse.json({
      success: true,
      cards: ALL_30_CARDS,
      users,
      giftLogs,
    });
  } catch (error) {
    console.error('Failed to get gift card data:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, username, cardId, quantity, reason } = body;

    if (passkey !== ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Admin Passkey' },
        { status: 401 }
      );
    }

    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, error: 'Recipient username is required' },
        { status: 400 }
      );
    }

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: 'Card ID to gift is required' },
        { status: 400 }
      );
    }

    const cardExists = ALL_30_CARDS.find((c) => c.id === cardId);
    if (!cardExists) {
      return NextResponse.json(
        { success: false, error: `Invalid card ID: ${cardId}` },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Math.min(50, Number(quantity) || 1));
    const result = giftCardToUser(username.trim(), cardId, qty, reason);

    return NextResponse.json({
      success: true,
      user: result.user,
      giftLog: result.giftLog,
      message: `Successfully gifted ${qty}x "${cardExists.title}" to @${result.user.username}!`,
    });
  } catch (error) {
    console.error('Failed to gift card:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passkey = searchParams.get('key');
    const id = searchParams.get('id');

    if (passkey !== ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Admin Passkey' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Gift log ID is required' }, { status: 400 });
    }

    const deleted = deleteGiftLog(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete gift log:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
