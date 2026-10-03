import fs from 'fs';
import path from 'path';
import { Mission, UserProfile, TradeOffer, Season, BroadcastEvent, GiftCardLog, PendingGiftItem, CardArchetype } from './types';
import { ALL_30_CARDS } from './cardsData';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export interface DatabaseStore {
  activeSeason: Season;
  seasons: Season[];
  missions: Mission[];
  users: Record<string, UserProfile>;
  trades: TradeOffer[];
  broadcasts?: BroadcastEvent[];
  giftLogs?: GiftCardLog[];
}

function getInitialMissions(): Mission[] {
  const missions: Mission[] = [];
  const today = new Date();

  const missionTemplates = [
    { title: 'Follow @RialoHQ on X', type: 'twitter_follow' as const, link: 'https://x.com/RialoHQ', desc: 'Join the vanguard and follow official Rialo protocol updates.' },
    { title: 'Retweet Rialo Testnet Announcement', type: 'twitter_retweet' as const, link: 'https://x.com/RialoHQ', desc: 'Amplify the parallelized state revolution to your network.' },
    { title: 'Daily Oracle Quiz: Finality Time', type: 'quiz' as const, link: '', desc: 'What is Rialo deterministic sub-second finality target?', question: 'What is Rialo finality time?', answer: 'Sub-second' },
    { title: 'Join Rialo Discord Command Center', type: 'discord_join' as const, link: 'https://discord.gg/rialo', desc: 'Connect with node validators and testnet developers in Discord.' },
    { title: 'Explore Rialo Docs & Architecture', type: 'custom_url' as const, link: 'https://docs.rialo.io', desc: 'Read the whitepaper on asynchronous state pipeline trees.' },
    { title: 'Like & Quote the Genesis Card Reveal', type: 'twitter_like' as const, link: 'https://x.com/RialoHQ', desc: 'Spread the word about Season 1: 30 Genesis Warrior cards.' },
  ];

  for (let day = 1; day <= 30; day++) {
    const d = new Date(today);
    d.setDate(today.getDate() + (day - 1));
    const dateStr = d.toISOString().split('T')[0];

    const tmpl = missionTemplates[(day - 1) % missionTemplates.length];
    missions.push({
      id: 'm-day-' + day,
      dayNumber: day,
      scheduledDate: dateStr,
      title: 'Day ' + day + ': ' + tmpl.title,
      description: tmpl.desc,
      link: tmpl.link,
      type: tmpl.type,
      quizQuestion: tmpl.question,
      quizAnswer: tmpl.answer,
      rewardPacks: 1,
      rewardShards: 25,
      isActive: true,
    });
  }

  return missions;
}

function getInitialStore(): DatabaseStore {
  return {
    activeSeason: {
      id: 'season-1',
      name: 'Season 1: Genesis',
      theme: '30 Genesis Protocol Warriors',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: true,
    },
    seasons: [
      {
        id: 'season-1',
        name: 'Season 1: Genesis',
        theme: '30 Genesis Protocol Warriors',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        isActive: true,
      }
    ],
    missions: getInitialMissions(),
    users: {
      'cryptowhale': {
        username: 'cryptowhale',
        inventory: {
          'pioneer': 3,
          'vanguard': 2,
          'chronomancer': 1,
          'zk_oracle': 1,
          'hypervisor': 1,
          'devourer': 2,
          'valkyrie': 1,
          'rialo_overseer': 1,
          'mev_slayer': 1,
          'solaris_priest': 2,
          'liquidity_siren': 1,
          'cross_chain_courier': 1,
        },
        uniqueCardsCount: 12,
        totalCardsCount: 17,
        shards: 350,
        lifetimePoints: 1250,
        completedMissions: ['m-day-1'],
        streakDays: 5,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'rialo_runner': {
        username: 'rialo_runner',
        inventory: {
          'pioneer': 2,
          'navigator': 1,
          'arbitrageur': 1,
          'cyber_ronin': 1,
          'ephemeral_runner': 2,
          'consensus_warden': 1,
          'plasma_reaper': 1,
          'photon_striker': 1,
          'aether_weaver': 1,
        },
        uniqueCardsCount: 9,
        totalCardsCount: 11,
        shards: 220,
        lifetimePoints: 890,
        completedMissions: ['m-day-1'],
        streakDays: 4,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'sarah_eth': {
        username: 'sarah_eth',
        inventory: {
          'pioneer': 1,
          'vanguard': 1,
          'architect': 1,
          'finalizer': 1,
          'celestial_envoy': 1,
          'synthetic_alchemist': 1,
        },
        uniqueCardsCount: 6,
        totalCardsCount: 6,
        shards: 150,
        lifetimePoints: 620,
        completedMissions: ['m-day-1'],
        streakDays: 2,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    },
    trades: [
      {
        id: 'trade-1',
        offeredBy: 'cryptowhale',
        offeredCardId: 'pioneer',
        requestedCardId: 'cyber_ronin',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'trade-2',
        offeredBy: 'rialo_runner',
        offeredCardId: 'ephemeral_runner',
        requestedCardId: 'chronomancer',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      }
    ],
  };
}

export function getDb(): DatabaseStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initial = getInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read db store:', err);
    return getInitialStore();
  }
}

export function saveDb(data: DatabaseStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMissionsForDate(dateStr: string): Mission[] {
  const db = getDb();
  return db.missions.filter((m) => m.scheduledDate === dateStr && m.isActive);
}

export function getOrCreateUser(username: string): UserProfile {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const db = getDb();

  if (db.users[cleanUsername]) {
    return db.users[cleanUsername];
  }

  const newUser: UserProfile = {
    username: cleanUsername,
    inventory: {},
    uniqueCardsCount: 0,
    totalCardsCount: 0,
    shards: 100,
    lifetimePoints: 100,
    completedMissions: [],
    completedMissionsHistory: [],
    streakDays: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users[cleanUsername] = newUser;
  saveDb(db);
  return newUser;
}

export function updateUserInventory(
  username: string,
  newCardIds: string[]
): UserProfile {
  const user = getOrCreateUser(username);
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  for (const cid of newCardIds) {
    user.inventory[cid] = (user.inventory[cid] || 0) + 1;
    user.totalCardsCount += 1;
    user.lifetimePoints += 50;
  }

  user.lastClaimDate = today;

  user.uniqueCardsCount = Object.keys(user.inventory).filter(
    (k) => user.inventory[k] > 0
  ).length;

  if (user.uniqueCardsCount === 30) {
    user.lifetimePoints += 2500;
  }

  user.updatedAt = new Date().toISOString();
  db.users[user.username] = user;
  saveDb(db);
  return user;
}

export function updateUserFavorites(
  username: string,
  favoriteCardIds: string[]
): UserProfile {
  const user = getOrCreateUser(username);
  const db = getDb();

  // Validate that user owns each card
  const validFavorites = favoriteCardIds
    .filter((cid) => (user.inventory[cid] || 0) > 0)
    .slice(0, 3);

  user.favoriteCards = validFavorites;
  user.updatedAt = new Date().toISOString();
  db.users[user.username] = user;
  saveDb(db);
  return user;
}

export function addBroadcastEvent(event: BroadcastEvent): BroadcastEvent {
  const db = getDb();
  if (!db.broadcasts) {
    db.broadcasts = [];
  }
  db.broadcasts.unshift(event);
  if (db.broadcasts.length > 50) {
    db.broadcasts = db.broadcasts.slice(0, 50);
  }
  saveDb(db);
  return event;
}

export function getBroadcastEvents(): BroadcastEvent[] {
  const db = getDb();
  return db.broadcasts || [];
}

export function awardUserShards(username: string, amount: number): UserProfile {
  const user = getOrCreateUser(username);
  const db = getDb();
  user.shards = (user.shards || 0) + amount;
  user.lifetimePoints = (user.lifetimePoints || 0) + amount;
  user.updatedAt = new Date().toISOString();
  db.users[user.username] = user;
  saveDb(db);
  return user;
}

export function deleteBroadcastEvent(id: string): boolean {
  const db = getDb();
  if (!db.broadcasts) return false;
  const initialLen = db.broadcasts.length;
  db.broadcasts = db.broadcasts.filter((b) => b.id !== id);
  if (db.broadcasts.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

export function giftCardToUser(
  username: string,
  cardId: string,
  quantity: number = 1,
  reason?: string
): { user: UserProfile; giftLog: GiftCardLog } {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const user = getOrCreateUser(cleanUsername);
  const db = getDb();

  const qty = Math.max(1, Math.floor(quantity));
  const card = ALL_30_CARDS.find((c) => c.id === cardId);
  const giftId = 'gift-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  const pendingItem: PendingGiftItem = {
    id: giftId,
    cardId,
    cardTitle: card?.title || cardId,
    cardRarity: card?.rarity || 'RARE',
    cardImage: card?.image || ('/cards/' + cardId + '.png'),
    quantity: qty,
    reason: reason?.trim() || 'Admin Card Grant',
    createdAt: new Date().toISOString(),
  };

  if (!user.pendingGifts) {
    user.pendingGifts = [];
  }
  user.pendingGifts.unshift(pendingItem);

  user.updatedAt = new Date().toISOString();
  db.users[user.username] = user;

  const log: GiftCardLog = {
    id: giftId,
    username: user.username,
    cardId,
    cardTitle: card?.title || cardId,
    cardRarity: card?.rarity || 'RARE',
    cardImage: card?.image || ('/cards/' + cardId + '.png'),
    quantity: qty,
    reason: reason?.trim() || 'Admin Card Grant',
    timestamp: new Date().toISOString(),
    claimed: false,
  };

  if (!db.giftLogs) {
    db.giftLogs = [];
  }
  db.giftLogs.unshift(log);
  if (db.giftLogs.length > 100) {
    db.giftLogs = db.giftLogs.slice(0, 100);
  }

  saveDb(db);
  return { user, giftLog: log };
}

export function claimUserGift(
  username: string,
  giftId?: string
): { success: boolean; user?: UserProfile; cards?: CardArchetype[]; giftLog?: GiftCardLog; error?: string } {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const db = getDb();
  const user = db.users[cleanUsername];
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (!user.pendingGifts || user.pendingGifts.length === 0) {
    return { success: false, error: 'No pending gifts found for this user' };
  }

  let targetGiftIndex = 0;
  if (giftId && giftId !== 'all') {
    targetGiftIndex = user.pendingGifts.findIndex((g) => g.id === giftId);
    if (targetGiftIndex === -1) {
      return { success: false, error: 'Gift item not found or already claimed' };
    }
  }

  const gift = user.pendingGifts[targetGiftIndex];
  const cardArchetype = ALL_30_CARDS.find((c) => c.id === gift.cardId);
  if (!cardArchetype) {
    return { success: false, error: 'Card archetype not found' };
  }

  const pulledCards: CardArchetype[] = [];
  for (let i = 0; i < gift.quantity; i++) {
    pulledCards.push({ ...cardArchetype });
  }

  // Credit into user inventory upon claim & reveal
  user.inventory[gift.cardId] = (user.inventory[gift.cardId] || 0) + gift.quantity;
  user.totalCardsCount = (user.totalCardsCount || 0) + gift.quantity;
  user.lifetimePoints = (user.lifetimePoints || 0) + (50 * gift.quantity);
  user.uniqueCardsCount = Object.keys(user.inventory).filter(
    (k) => user.inventory[k] > 0
  ).length;

  if (user.uniqueCardsCount === 30) {
    user.lifetimePoints += 2500;
  }

  user.pendingGifts.splice(targetGiftIndex, 1);
  user.updatedAt = new Date().toISOString();

  if (db.giftLogs) {
    const log = db.giftLogs.find((l) => l.id === gift.id);
    if (log) {
      log.claimed = true;
      log.claimedAt = new Date().toISOString();
    }
  }

  db.users[user.username] = user;
  saveDb(db);

  return {
    success: true,
    user,
    cards: pulledCards,
    giftLog: {
      id: gift.id,
      username: user.username,
      cardId: gift.cardId,
      cardTitle: gift.cardTitle,
      cardRarity: gift.cardRarity,
      cardImage: gift.cardImage,
      quantity: gift.quantity,
      reason: gift.reason,
      timestamp: gift.createdAt,
      claimed: true,
      claimedAt: new Date().toISOString(),
    },
  };
}

export function getUserPendingGifts(username: string): PendingGiftItem[] {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const db = getDb();
  const user = db.users[cleanUsername];
  if (!user) return [];
  return user.pendingGifts || [];
}

export function getGiftLogs(): GiftCardLog[] {
  const db = getDb();
  return db.giftLogs || [];
}

export function deleteGiftLog(id: string): boolean {
  const db = getDb();
  if (!db.giftLogs) return false;
  const initialLen = db.giftLogs.length;
  db.giftLogs = db.giftLogs.filter((g) => g.id !== id);
  if (db.giftLogs.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

export function getAllUsersSummary(): Array<{
  username: string;
  totalCardsCount: number;
  uniqueCardsCount: number;
  lifetimePoints: number;
  inventory: Record<string, number>;
}> {
  const db = getDb();
  return Object.values(db.users).map((u) => ({
    username: u.username,
    totalCardsCount: u.totalCardsCount || 0,
    uniqueCardsCount: u.uniqueCardsCount || 0,
    lifetimePoints: u.lifetimePoints || 0,
    inventory: u.inventory || {},
  }));
}


export function completeBroadcastMission(username: string, broadcastId: string): { success: boolean; user?: UserProfile; broadcast?: BroadcastEvent; error?: string } {
  const db = getDb();
  if (!db.broadcasts) return { success: false, error: 'No broadcasts available' };
  
  const broadcast = db.broadcasts.find(b => b.id === broadcastId);
  if (!broadcast) return { success: false, error: 'Mission not found' };
  
  const cleanUsername = username.replace('@', '').trim();
  const user = getOrCreateUser(cleanUsername);
  
  if (!broadcast.completedBy) {
    broadcast.completedBy = [];
  }
  
  if (broadcast.completedBy.includes(cleanUsername)) {
    return { success: false, error: 'Mission reward already claimed by this user' };
  }
  
  broadcast.completedBy.push(cleanUsername);
  
  // Award shards & points
  const shardsReward = broadcast.shardsReward || 0;
  user.shards = (user.shards || 0) + shardsReward;
  user.lifetimePoints = (user.lifetimePoints || 0) + shardsReward;
  
  if (!user.completedMissions) user.completedMissions = [];
  if (!user.completedMissions.includes(broadcast.id)) {
    user.completedMissions.push(broadcast.id);
  }
  
  if (!user.completedMissionsHistory) {
    user.completedMissionsHistory = [];
  }
  user.completedMissionsHistory.unshift({
    id: broadcast.id,
    title: broadcast.title,
    desc: broadcast.desc,
    type: 'broadcast_mission',
    category: broadcast.missionCategory || 'Protocol Mission',
    icon: broadcast.icon || '🎯',
    shardsReward: shardsReward,
    completedAt: new Date().toISOString(),
  });
  
  user.updatedAt = new Date().toISOString();
  db.users[user.username] = user;
  saveDb(db);
  
  return { success: true, user, broadcast };
}
