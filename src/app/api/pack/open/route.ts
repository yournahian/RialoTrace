import { NextRequest, NextResponse } from 'next/server';
import { ALL_30_CARDS, RIALO_30_ARCHETYPES } from '@/lib/cardsData';
import { updateUserInventory, getOrCreateUser, getDb } from '@/lib/db';
import { CardArchetype } from '@/lib/types';

function drawRandomCard(): CardArchetype {
  // Weighted probability:
  // Common: 50%, Rare: 30%, Epic: 14%, Legendary: 5%, Mythic: 1%
  const rand = Math.random() * 100;
  let targetRarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

  if (rand < 50) targetRarity = 'COMMON';
  else if (rand < 80) targetRarity = 'RARE';
  else if (rand < 94) targetRarity = 'EPIC';
  else if (rand < 99) targetRarity = 'LEGENDARY';
  else targetRarity = 'MYTHIC';

  const matching = ALL_30_CARDS.filter((c) => c.rarity === targetRarity);
  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }
  return ALL_30_CARDS[Math.floor(Math.random() * ALL_30_CARDS.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const user = getOrCreateUser(username);

    // 1. Strict check: Has user already claimed their daily pack today?
    if (user.lastClaimDate === today) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already claimed today's 3-card pack! New daily packs unlock at 00:00 UTC.",
          alreadyClaimed: true,
        },
        { status: 400 }
      );
    }

    // 2. Check if all missions for today are completed
    const db = getDb();
    const todayMissions = db.missions.filter((m) => m.scheduledDate === today && m.isActive);
    if (todayMissions.length > 0) {
      const allCompleted = todayMissions.every((m) => user.completedMissions.includes(m.id));
      if (!allCompleted) {
        return NextResponse.json(
          {
            success: false,
            error: "Please complete all of today's quests before claiming your pack!",
          },
          { status: 400 }
        );
      }
    }

    // 3. Draw exactly 3 cards for daily pack
    const pulledCards: CardArchetype[] = [
      drawRandomCard(),
      drawRandomCard(),
      drawRandomCard(),
    ];

    const cardIds = pulledCards.map((c) => c.id);
    const updatedUser = updateUserInventory(username, cardIds);

    return NextResponse.json({
      success: true,
      cards: pulledCards,
      user: updatedUser,
      message: "Congratulations! 3 new cards added to your collection.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
