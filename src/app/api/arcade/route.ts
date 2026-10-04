export const dynamic = 'force-dynamic';
export const revalidate = 0;
﻿import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, saveUser, kvGet, kvSet } from '@/lib/db';
import { ALL_30_CARDS } from '@/lib/cardsData';

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
    const username = new URL(req.url).searchParams.get('username') || '';
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    const user = await getOrCreateUser(username);
    const now = Date.now();
    const lastSpinTime = parseInt(await kvGet(`last_spin_${user.username}`) || '0');
    const isFreeSpinAvailable = now - lastSpinTime >= 24 * 60 * 60 * 1000;
    const timeUntilNextFree = Math.max(0, 24 * 60 * 60 * 1000 - (now - lastSpinTime));
    const arcadeHighscore = parseInt(await kvGet(`highscore_${user.username}`) || '0');
    const glideHighscore = parseInt(await kvGet(`glide_highscore_${user.username}`) || '0');
    const clientDate = new URL(req.url).searchParams.get('date') || '';
    const currentStreakDay = parseInt(await kvGet(`streak_day_${user.username}`) || '1');
    const lastStreakTime = parseInt(await kvGet(`streak_last_${user.username}`) || '0');
    const lastStreakDate = await kvGet(`streak_date_${user.username}`) || '';
    const streakElapsed = now - lastStreakTime;
    
    let canClaimStreak = true;
    if (clientDate && lastStreakDate) {
      canClaimStreak = lastStreakDate !== clientDate;
    } else if (lastStreakDate) {
      const todayUtc = new Date().toISOString().split('T')[0];
      canClaimStreak = lastStreakDate !== todayUtc;
    } else {
      canClaimStreak = lastStreakTime === 0 || streakElapsed >= 20 * 60 * 60 * 1000;
    }
    return NextResponse.json({ success: true, user, isFreeSpinAvailable, timeUntilNextFree, arcadeHighscore, glideHighscore, streakDay: currentStreakDay, canClaimStreak, streakElapsed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username } = body;
    if (!username) return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    const user = await getOrCreateUser(username);
    const now = Date.now();

    if (action === 'SPIN_WHEEL') {
      const lastSpinTime = parseInt(await kvGet(`last_spin_${user.username}`) || '0');
      const isFree = now - lastSpinTime >= 24 * 60 * 60 * 1000;
      if (!isFree && !body.isPaid) return NextResponse.json({ success: false, error: 'Daily free spin used. Use paid spin (25 shards).' }, { status: 400 });
      if (body.isPaid && !isFree) {
        if (user.shards < 25) return NextResponse.json({ success: false, error: 'Insufficient shards (25 required).' }, { status: 400 });
        user.shards -= 25;
      }
      const weights = [25, 18, 10, 15, 18, 7, 18, 4];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      let prizeIndex = 0;
      for (let i = 0; i < weights.length; i++) { if (rand < weights[i]) { prizeIndex = i; break; } rand -= weights[i]; }
      const prize = WHEEL_PRIZES[prizeIndex];
      let bonusCard = null;
      if (prize.type === 'shards') { user.shards = (user.shards || 0) + prize.amount; user.lifetimePoints = (user.lifetimePoints || 0) + prize.amount; }
      else if (prize.type === 'card') {
        const randomCard = ALL_30_CARDS[Math.floor(Math.random() * ALL_30_CARDS.length)];
        user.inventory[randomCard.id] = (user.inventory[randomCard.id] || 0) + 1;
        user.totalCardsCount = (user.totalCardsCount || 0) + 1;
        user.uniqueCardsCount = Object.keys(user.inventory).filter(k => user.inventory[k] > 0).length;
        user.lifetimePoints = (user.lifetimePoints || 0) + 50;
        if (user.uniqueCardsCount === 30) user.lifetimePoints += 2500;
        bonusCard = randomCard;
      }
      if (isFree) await kvSet(`last_spin_${user.username}`, String(now));
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, prizeIndex, prize, bonusCard, user: saved });
    }

    if (action === 'ARCADE_SCORE') {
      const { score, efficiency } = body;
      const validScore = Math.max(0, Number(score) || 0);
      const earnedShards = Math.min(60, Math.max(10, Math.floor(validScore / 40) + (efficiency >= 90 ? 15 : 5)));
      user.shards += earnedShards; user.lifetimePoints += earnedShards;
      const currentHigh = parseInt(await kvGet(`highscore_${user.username}`) || '0');
      const isNewHigh = validScore > currentHigh;
      if (isNewHigh) await kvSet(`highscore_${user.username}`, String(validScore));
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, earnedShards, score: validScore, highscore: Math.max(currentHigh, validScore), isNewHigh, user: saved });
    }

    if (action === 'GLIDE_SCORE') {
      const { distance, shardsCollected } = body;
      const validDist = Math.max(0, Number(distance) || 0);
      const totalEarned = Math.min(80, Math.max(0, Number(shardsCollected) || 0) + Math.floor(validDist / 10));
      user.shards += totalEarned; user.lifetimePoints += totalEarned;
      const prevBest = parseInt(await kvGet(`glide_highscore_${user.username}`) || '0');
      const isNewBest = validDist > prevBest;
      if (isNewBest) await kvSet(`glide_highscore_${user.username}`, String(validDist));
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, earnedShards: totalEarned, distance: validDist, highscore: Math.max(prevBest, validDist), isNewBest, user: saved });
    }

    if (action === 'CLAIM_STREAK') {
      const clientDate = body.date || new Date().toISOString().split('T')[0];
      let currentStreakDay = parseInt(await kvGet(`streak_day_${user.username}`) || '1');
      const lastStreakTime = parseInt(await kvGet(`streak_last_${user.username}`) || '0');
      const lastStreakDate = await kvGet(`streak_date_${user.username}`) || '';
      const streakElapsed = now - lastStreakTime;

      if (lastStreakDate && lastStreakDate === clientDate) {
        return NextResponse.json({ success: false, error: 'Streak reward already claimed today. Resets daily with daily missions!' }, { status: 400 });
      }
      if (!lastStreakDate && lastStreakTime > 0 && streakElapsed < 20 * 60 * 60 * 1000) {
        return NextResponse.json({ success: false, error: 'Streak reward already claimed today.' }, { status: 400 });
      }

      // Check if streak was broken (more than 1 calendar day gap)
      if (lastStreakDate) {
        const prev = new Date(lastStreakDate + 'T00:00:00Z').getTime();
        const curr = new Date(clientDate + 'T00:00:00Z').getTime();
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          currentStreakDay = 1;
        }
      } else if (lastStreakTime > 0 && streakElapsed > 48 * 60 * 60 * 1000) {
        currentStreakDay = 1;
      }

      const reward = STREAK_REWARDS[(currentStreakDay - 1) % STREAK_REWARDS.length];
      user.shards += reward.shards; user.lifetimePoints += reward.shards;
      let bonusCard = null;
      if ((reward as any).pack || (reward as any).foilCard) {
        const pool = (reward as any).foilCard ? ALL_30_CARDS.filter(c => ['RARE','EPIC','LEGENDARY','MYTHIC'].includes(c.rarity)) : ALL_30_CARDS;
        bonusCard = pool[Math.floor(Math.random() * pool.length)];
        user.inventory[bonusCard.id] = (user.inventory[bonusCard.id] || 0) + 1;
        user.totalCardsCount += 1;
        user.uniqueCardsCount = Object.keys(user.inventory).filter(k => user.inventory[k] > 0).length;
        user.lifetimePoints += 100;
      }
      await kvSet(`streak_last_${user.username}`, String(now));
      await kvSet(`streak_date_${user.username}`, clientDate);
      const nextDay = (currentStreakDay % 7) + 1;
      await kvSet(`streak_day_${user.username}`, String(nextDay));
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, claimedDay: currentStreakDay, nextDay, reward, bonusCard, user: saved });
    }

    if (action === 'SHARD_RAIN') {
      if (user.shards < 25) return NextResponse.json({ success: false, error: 'Insufficient shards (25 needed).' }, { status: 400 });
      user.shards -= 25; user.lifetimePoints += 50; user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, shardsRained: 50, user: saved });
    }

    if (action === 'CATCH_RAIN_SHARD') {
      user.shards = (user.shards || 0) + 15;
      user.lifetimePoints = (user.lifetimePoints || 0) + 15;
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, earnedShards: 15, user: saved });
    }

    if (action === 'FUSE_CARDS') {
      const { cardIds } = body;
      if (!Array.isArray(cardIds) || cardIds.length !== 3) return NextResponse.json({ success: false, error: 'Fusion requires exactly 3 cards.' }, { status: 400 });
      if (user.shards < 35) return NextResponse.json({ success: false, error: 'Fusion requires 35 Shards.' }, { status: 400 });
      const countMap: Record<string, number> = {};
      for (const id of cardIds) countMap[id] = (countMap[id] || 0) + 1;
      for (const [id, needed] of Object.entries(countMap)) {
        if ((user.inventory[id] || 0) <= needed) return NextResponse.json({ success: false, error: `Card ${id} requires duplicate copies to fuse!` }, { status: 400 });
      }
      for (const [id, count] of Object.entries(countMap)) {
        user.inventory[id] = Math.max(0, (user.inventory[id] || 0) - count);
        if (user.inventory[id] <= 0) delete user.inventory[id];
      }
      user.shards = Math.max(0, user.shards - 35);
      user.totalCardsCount = Math.max(0, user.totalCardsCount - 3);
      const pool = ALL_30_CARDS.filter(c => ['RARE','EPIC','LEGENDARY','MYTHIC'].includes(c.rarity));
      const forgedCard = pool[Math.floor(Math.random() * pool.length)];
      user.inventory[forgedCard.id] = (user.inventory[forgedCard.id] || 0) + 1;
      user.totalCardsCount += 1;
      user.uniqueCardsCount = Object.keys(user.inventory).filter(k => user.inventory[k] > 0).length;
      user.lifetimePoints += 150;
      if (user.uniqueCardsCount === 30) user.lifetimePoints += 2500;
      user.updatedAt = new Date().toISOString();
      const saved = await saveUser(user);
      return NextResponse.json({ success: true, forgedCard, user: saved });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
