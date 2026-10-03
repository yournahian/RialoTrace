import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, getOrCreateUser } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

// Wheel Prizes Configuration
const WHEEL_PRIZES = [
  { id: 'shards_15', label: '+15', sublabel: 'SHARDS', type: 'shards', amount: 15, color: '#A9DDD3', rarity: 'Common' },
  { id: 'shards_30', label: '+30', sublabel: 'SHARDS', type: 'shards', amount: 30, color: '#E8E3D5', rarity: 'Uncommon' },
  { id: 'bonus_card', label: '🎴 CARD', sublabel: 'GENESIS', type: 'card', amount: 1, color: '#A9DDD3', rarity: 'Rare' },
  { id: 'shards_50', label: '+50', sublabel: 'SHARDS', type: 'shards', amount: 50, color: '#A9DDD3', rarity: 'Rare' },
  { id: 'shards_20', label: '+20', sublabel: 'SHARDS', type: 'shards', amount: 20, color: '#E8E3D5', rarity: 'Common' },
  { id: 'shards_100', label: '+100', sublabel: 'SHARDS', type: 'shards', amount: 100, color: '#A9DDD3', rarity: 'Epic' },
  { id: 'shards_25', label: '+25', sublabel: 'SHARDS', type: 'shards', amount: 25, color: '#E8E3D5', rarity: 'Common' },
  { id: 'jackpot_250', label: '💎 250', sublabel: 'JACKPOT', type: 'shards', amount: 250, color: '#E8E3D5', rarity: 'Mythic' },
];

const STREAK_REWARDS = [
  { day: 1, shards: 15, label: '+15 Shards', icon: '⚡' },
  { day: 2, shards: 25, label: '+25 Shards', icon: '⚡' },
  { day: 3, shards: 40, pack: 1, label: 'Free Gacha Pack', icon: '🎴' },
  { day: 4, shards: 50, label: '+50 Shards', icon: '⚡' },
  { day: 5, shards: 75, multiplier: 2, label: '2x Shards Booster', icon: '🚀' },
  { day: 6, shards: 100, label: '+100 Shards', icon: '⚡' },
  { day: 7, shards: 250, foilCard: true, label: 'Mystery Vault Unlock', icon: '🏆' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }

    const user = getOrCreateUser(username);
    const db = getDb();

    // Check last spin time
    const lastSpinKey = `last_spin_${user.username}`;
    const lastSpinTime = (db as any)[lastSpinKey] || 0;
    const now = Date.now();
    const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
    const isFreeSpinAvailable = now - lastSpinTime >= COOLDOWN_MS;
    const timeUntilNextFree = Math.max(0, COOLDOWN_MS - (now - lastSpinTime));

    const rushHighscore = (db as any)[`highscore_${user.username}`] || 0;
    const glideHighscore = (db as any)[`glide_highscore_${user.username}`] || 0;

    // Streak status
    const streakDayKey = `streak_day_${user.username}`;
    const streakLastKey = `streak_last_${user.username}`;
    const currentStreakDay = (db as any)[streakDayKey] || 1;
    const lastStreakTime = (db as any)[streakLastKey] || 0;

    const streakElapsed = now - lastStreakTime;
    const canClaimStreak = lastStreakTime === 0 || streakElapsed >= 20 * 60 * 60 * 1000; // after 20h

    return NextResponse.json({
      success: true,
      user,
      isFreeSpinAvailable,
      timeUntilNextFree,
      arcadeHighscore: rushHighscore,
      glideHighscore,
      streakDay: currentStreakDay,
      canClaimStreak,
      streakElapsed,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }

    const user = getOrCreateUser(username);
    const db = getDb();
    const now = Date.now();

    // 1. LUCKY WHEEL SPIN
    if (action === 'SPIN_WHEEL') {
      const { isPaid } = body;
      const lastSpinKey = `last_spin_${user.username}`;
      const lastSpinTime = (db as any)[lastSpinKey] || 0;
      const isFree = now - lastSpinTime >= 24 * 60 * 60 * 1000;

      if (!isFree && !isPaid) {
        return NextResponse.json({ success: false, error: 'Daily free spin used. Use paid spin (25 shards).' }, { status: 400 });
      }

      if (isPaid && !isFree) {
        if (user.shards < 25) {
          return NextResponse.json({ success: false, error: 'Insufficient shards (25 required).' }, { status: 400 });
        }
        user.shards -= 25;
      }

      const weights = [25, 18, 10, 15, 18, 7, 18, 4];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      let prizeIndex = 0;

      for (let i = 0; i < weights.length; i++) {
        if (rand < weights[i]) {
          prizeIndex = i;
          break;
        }
        rand -= weights[i];
      }

      const prize = WHEEL_PRIZES[prizeIndex];
      let bonusCard = null;

      if (prize.type === 'shards') {
        user.shards = (user.shards || 0) + prize.amount;
        user.lifetimePoints = (user.lifetimePoints || 0) + prize.amount;
      } else if (prize.type === 'pack' || prize.type === 'card') {
        if (!user.inventory) {
          user.inventory = {};
        }
        const randomCard = ALL_30_CARDS[Math.floor(Math.random() * ALL_30_CARDS.length)];
        user.inventory[randomCard.id] = (user.inventory[randomCard.id] || 0) + 1;
        user.totalCardsCount = (user.totalCardsCount || 0) + 1;
        user.uniqueCardsCount = Object.keys(user.inventory).filter((k) => user.inventory[k] > 0).length;
        user.lifetimePoints = (user.lifetimePoints || 0) + 50;
        if (user.uniqueCardsCount === 30) {
          user.lifetimePoints += 2500;
        }
        bonusCard = randomCard;
      }

      if (isFree) {
        (db as any)[lastSpinKey] = now;
      }

      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        prizeIndex,
        prize,
        bonusCard,
        user,
      });
    }

    // 2. SUPERCONDUCTOR RUSH ARCADE SCORE SUBMIT
    if (action === 'ARCADE_SCORE') {
      const { score, nodesHit, efficiency } = body;
      const validScore = Math.max(0, Number(score) || 0);

      const earnedShards = Math.min(60, Math.max(10, Math.floor(validScore / 40) + (efficiency >= 90 ? 15 : 5)));
      user.shards += earnedShards;
      user.lifetimePoints += earnedShards;

      const highscoreKey = `highscore_${user.username}`;
      const currentHigh = (db as any)[highscoreKey] || 0;
      const isNewHigh = validScore > currentHigh;
      if (isNewHigh) {
        (db as any)[highscoreKey] = validScore;
      }

      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        earnedShards,
        score: validScore,
        highscore: Math.max(currentHigh, validScore),
        isNewHigh,
        user,
      });
    }

    // 3. ZERO-FRICTION GLIDE ENDLESS RUNNER SCORE
    if (action === 'GLIDE_SCORE') {
      const { distance, shardsCollected } = body;
      const validDist = Math.max(0, Number(distance) || 0);
      const validShards = Math.max(0, Number(shardsCollected) || 0);

      // Shards earned: collected shards + bonus based on distance
      const distanceBonus = Math.floor(validDist / 10);
      const totalEarned = Math.min(80, validShards + distanceBonus);

      user.shards += totalEarned;
      user.lifetimePoints += totalEarned;

      const glideKey = `glide_highscore_${user.username}`;
      const prevBest = (db as any)[glideKey] || 0;
      const isNewBest = validDist > prevBest;
      if (isNewBest) {
        (db as any)[glideKey] = validDist;
      }

      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        earnedShards: totalEarned,
        distance: validDist,
        highscore: Math.max(prevBest, validDist),
        isNewBest,
        user,
      });
    }

    // 4. CLAIM 7-DAY CRYOGENIC STREAK REWARD
    if (action === 'CLAIM_STREAK') {
      const streakDayKey = `streak_day_${user.username}`;
      const streakLastKey = `streak_last_${user.username}`;
      let currentStreakDay = (db as any)[streakDayKey] || 1;
      const lastStreakTime = (db as any)[streakLastKey] || 0;

      const streakElapsed = now - lastStreakTime;
      if (lastStreakTime > 0 && streakElapsed < 20 * 60 * 60 * 1000) {
        return NextResponse.json({ success: false, error: 'Streak reward already claimed today. Come back tomorrow!' }, { status: 400 });
      }

      // If over 48h since last claim, streak resets to 1 (unless freeze)
      if (lastStreakTime > 0 && streakElapsed > 48 * 60 * 60 * 1000) {
        currentStreakDay = 1;
      }

      const reward = STREAK_REWARDS[(currentStreakDay - 1) % STREAK_REWARDS.length];
      user.shards += reward.shards;
      user.lifetimePoints += reward.shards;

      let bonusCard = null;
      if (reward.pack || reward.foilCard) {
        const pool = reward.foilCard
          ? ALL_30_CARDS.filter(c => ['RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].includes(c.rarity))
          : ALL_30_CARDS;
        bonusCard = pool[Math.floor(Math.random() * pool.length)];
        user.inventory[bonusCard.id] = (user.inventory[bonusCard.id] || 0) + 1;
        user.totalCardsCount += 1;
        user.uniqueCardsCount = Object.keys(user.inventory).filter(k => user.inventory[k] > 0).length;
        user.lifetimePoints += 100;
      }

      (db as any)[streakLastKey] = now;
      const nextDay = (currentStreakDay % 7) + 1;
      (db as any)[streakDayKey] = nextDay;

      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        claimedDay: currentStreakDay,
        nextDay,
        reward,
        bonusCard,
        user,
      });
    }

    // 5. TRIGGER COMMUNITY SHARD RAIN
    if (action === 'SHARD_RAIN') {
      const COST = 25;
      if (user.shards < COST) {
        return NextResponse.json({ success: false, error: 'Insufficient shards to start a Shard Rain (25 needed).' }, { status: 400 });
      }

      user.shards -= COST;
      user.lifetimePoints += 50; // generous rain karma bonus
      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        shardsRained: 50,
        user,
      });
    }

    // 6. CATCH RAIN SHARD
    if (action === 'CATCH_RAIN_SHARD') {
      user.shards += 5;
      user.lifetimePoints += 5;
      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        user,
      });
    }

    // 7. THE FORGE (CARD FUSION)
    if (action === 'FUSE_CARDS') {
      const { cardIds } = body;
      if (!Array.isArray(cardIds) || cardIds.length !== 3) {
        return NextResponse.json({ success: false, error: 'Fusion requires exactly 3 cards.' }, { status: 400 });
      }

      const FUSION_COST = 35;
      if (user.shards < FUSION_COST) {
        return NextResponse.json({ success: false, error: `Fusion requires ${FUSION_COST} Shards.` }, { status: 400 });
      }

      const countMap: Record<string, number> = {};
      for (const id of cardIds) {
        countMap[id] = (countMap[id] || 0) + 1;
      }

      for (const [id, needed] of Object.entries(countMap)) {
        const owned = user.inventory[id] || 0;
        // User must keep at least 1 copy for their binder album!
        if (owned <= needed) {
          return NextResponse.json({
            success: false,
            error: `Card ${id} requires duplicate copies to fuse! You must keep at least 1 copy for your collection album. (Owned: ${owned}, Selected: ${needed})`,
          }, { status: 400 });
        }
      }

      if (!user.inventory) {
        user.inventory = {};
      }
      for (const [id, count] of Object.entries(countMap)) {
        user.inventory[id] = Math.max(0, (user.inventory[id] || 0) - count);
        if (user.inventory[id] <= 0) {
          delete user.inventory[id];
        }
      }
      user.shards = Math.max(0, (user.shards || 0) - FUSION_COST);
      user.totalCardsCount = Math.max(0, (user.totalCardsCount || 0) - 3);

      const highTierCards = ALL_30_CARDS.filter(c => ['RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].includes(c.rarity));
      const pool = highTierCards.length > 0 ? highTierCards : ALL_30_CARDS;
      const forgedCard = pool[Math.floor(Math.random() * pool.length)];

      user.inventory[forgedCard.id] = (user.inventory[forgedCard.id] || 0) + 1;
      user.totalCardsCount = (user.totalCardsCount || 0) + 1;
      user.uniqueCardsCount = Object.keys(user.inventory).filter((k) => user.inventory[k] > 0).length;
      user.lifetimePoints = (user.lifetimePoints || 0) + 150;
      if (user.uniqueCardsCount === 30) {
        user.lifetimePoints += 2500;
      }

      user.updatedAt = new Date().toISOString();
      db.users[user.username] = user;
      saveDb(db);

      return NextResponse.json({
        success: true,
        forgedCard,
        user,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
