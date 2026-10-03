import { supabase } from './supabaseClient';
import { Mission, UserProfile, TradeOffer, Season, BroadcastEvent, GiftCardLog, PendingGiftItem, CardArchetype } from './types';
import { ALL_30_CARDS } from './cardsData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function missionToRow(m: Mission) {
  const row: any = {
    id: m.id,
    day_number: m.dayNumber,
    scheduled_date: m.scheduledDate,
    title: m.title,
    description: m.description,
    link: m.link,
    type: m.type,
    action_label: m.actionLabel ?? null,
    screenshot_requirement: m.screenshotRequirement ?? 'none',
    quiz_question: m.quizQuestion ?? null,
    quiz_options: m.quizOptions ?? null,
    quiz_answer: m.quizAnswer ?? null,
    quiz_explanation: m.quizExplanation ?? null,
    quiz_questions: m.quizQuestions ?? null,
    reward_packs: m.rewardPacks,
    reward_shards: m.rewardShards,
    is_active: m.isActive,
  };
  if (m.rewardCardId) {
    row.reward_card_id = m.rewardCardId;
    row.reward_card_count = m.rewardCardCount ?? 1;
  }
  return row;
}

function rowToMission(r: any): Mission {
  let rewardCardId = r.reward_card_id ?? undefined;
  let rewardCardCount = r.reward_card_count ?? undefined;

  if (!rewardCardId && r.action_label && r.action_label.includes('[CARD:')) {
    const match = r.action_label.match(/\[CARD:([^:]+)(?::(\d+))?\]/);
    if (match) {
      rewardCardId = match[1];
      rewardCardCount = match[2] ? Number(match[2]) : 1;
    }
  }

  const cleanActionLabel = r.action_label ? r.action_label.replace(/\[CARD:[^\]]+\]/, '').trim() : undefined;

  return {
    id: r.id,
    dayNumber: r.day_number,
    scheduledDate: r.scheduled_date,
    title: r.title,
    description: r.description,
    link: r.link,
    type: r.type,
    actionLabel: cleanActionLabel || undefined,
    screenshotRequirement: r.screenshot_requirement ?? 'none',
    quizQuestion: r.quiz_question ?? undefined,
    quizOptions: r.quiz_options ?? undefined,
    quizAnswer: r.quiz_answer ?? undefined,
    quizExplanation: r.quiz_explanation ?? undefined,
    quizQuestions: r.quiz_questions ?? undefined,
    rewardPacks: r.reward_packs,
    rewardShards: r.reward_shards,
    rewardCardId,
    rewardCardCount,
    isActive: r.is_active,
  };
}

function userToRow(u: UserProfile) {
  return {
    username: u.username,
    pin_hash: u.pinHash ?? null,
    address: u.address ?? null,
    inventory: u.inventory,
    unique_cards_count: u.uniqueCardsCount,
    total_cards_count: u.totalCardsCount,
    shards: u.shards,
    lifetime_points: u.lifetimePoints,
    completed_missions: u.completedMissions,
    completed_missions_history: u.completedMissionsHistory ?? [],
    pending_gifts: u.pendingGifts ?? [],
    streak_days: u.streakDays,
    last_claim_date: u.lastClaimDate ?? null,
    favorite_cards: u.favoriteCards ?? [],
    updated_at: new Date().toISOString(),
  };
}

function rowToUser(r: any): UserProfile {
  return {
    username: r.username,
    pinHash: r.pin_hash ?? undefined,
    address: r.address ?? undefined,
    inventory: r.inventory ?? {},
    uniqueCardsCount: r.unique_cards_count ?? 0,
    totalCardsCount: r.total_cards_count ?? 0,
    shards: r.shards ?? 100,
    lifetimePoints: r.lifetime_points ?? 100,
    completedMissions: r.completed_missions ?? [],
    completedMissionsHistory: r.completed_missions_history ?? [],
    pendingGifts: r.pending_gifts ?? [],
    streakDays: r.streak_days ?? 1,
    lastClaimDate: r.last_claim_date ?? undefined,
    favoriteCards: r.favorite_cards ?? [],
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? new Date().toISOString(),
  };
}

// ─── MISSIONS ────────────────────────────────────────────────────────────────

export async function getMissionsForDate(dateStr: string): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('scheduled_date', dateStr)
    .eq('is_active', true)
    .order('day_number', { ascending: true });
  if (error || !data) return [];
  return data.map(rowToMission);
}

export async function getAllMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('day_number', { ascending: true });
  if (error || !data) return [];
  return data.map(rowToMission);
}

export async function upsertMission(mission: Mission): Promise<Mission> {
  const row = missionToRow(mission);
  let { data, error } = await supabase
    .from('missions')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error && (error.code === '42703' || error.message && error.message.includes('reward_card_id'))) {
    const fallbackRow = Object.assign({}, row);
    delete fallbackRow.reward_card_id;
    delete fallbackRow.reward_card_count;
    if (mission.rewardCardId) {
      fallbackRow.action_label = ((fallbackRow.action_label || '') + ' [CARD:' + mission.rewardCardId + ':' + (mission.rewardCardCount || 1) + ']').trim();
    }
    const retryRes = await supabase
      .from('missions')
      .upsert(fallbackRow, { onConflict: 'id' })
      .select()
      .single();
    if (retryRes.error) throw new Error(retryRes.error.message);
    return rowToMission(retryRes.data);
  }

  if (error) throw new Error(error.message);
  return rowToMission(data);
}

export async function upsertManyMissions(missions: Mission[]): Promise<void> {
  const { error } = await supabase
    .from('missions')
    .upsert(missions.map(missionToRow), { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deleteMission(id: string): Promise<boolean> {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  return !error;
}

export async function deleteManyMissions(ids: string[]): Promise<boolean> {
  const { error } = await supabase.from('missions').delete().in('id', ids);
  return !error;
}

export async function toggleMissionActive(id: string, isActive: boolean): Promise<Mission | null> {
  const { data, error } = await supabase
    .from('missions')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) return null;
  return rowToMission(data);
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getUser(username: string): Promise<UserProfile | null> {
  const clean = username.replace('@', '').trim().toLowerCase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', clean)
    .single();
  if (error || !data) return null;
  return rowToUser(data);
}

export async function getOrCreateUser(username: string): Promise<UserProfile> {
  const clean = username.replace('@', '').trim().toLowerCase();
  const existing = await getUser(clean);
  if (existing) return existing;

  const newUser: UserProfile = {
    username: clean,
    inventory: {},
    uniqueCardsCount: 0,
    totalCardsCount: 0,
    shards: 100,
    lifetimePoints: 100,
    completedMissions: [],
    completedMissionsHistory: [],
    pendingGifts: [],
    streakDays: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('users')
    .insert(userToRow(newUser))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToUser(data);
}

export async function saveUser(user: UserProfile): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .upsert(userToRow(user), { onConflict: 'username' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToUser(data);
}

export async function getAllUsersSummary() {
  const { data, error } = await supabase
    .from('users')
    .select('username, total_cards_count, unique_cards_count, lifetime_points, inventory')
    .order('lifetime_points', { ascending: false });
  if (error || !data) return [];
  return data.map((r: any) => ({
    username: r.username,
    totalCardsCount: r.total_cards_count ?? 0,
    uniqueCardsCount: r.unique_cards_count ?? 0,
    lifetimePoints: r.lifetime_points ?? 0,
    inventory: r.inventory ?? {},
  }));
}

export async function updateUserInventory(username: string, newCardIds: string[]): Promise<UserProfile> {
  const user = await getOrCreateUser(username);
  const today = getTodayDateStr();

  for (const cid of newCardIds) {
    user.inventory[cid] = (user.inventory[cid] || 0) + 1;
    user.totalCardsCount += 1;
    user.lifetimePoints += 50;
  }

  user.lastClaimDate = today;
  user.uniqueCardsCount = Object.keys(user.inventory).filter((k) => user.inventory[k] > 0).length;

  if (user.uniqueCardsCount === 30) {
    user.lifetimePoints += 2500;
  }

  user.updatedAt = new Date().toISOString();
  return saveUser(user);
}

export async function updateUserFavorites(username: string, favoriteCardIds: string[]): Promise<UserProfile> {
  const user = await getOrCreateUser(username);
  const validFavorites = favoriteCardIds.filter((cid) => (user.inventory[cid] || 0) > 0).slice(0, 3);
  user.favoriteCards = validFavorites;
  user.updatedAt = new Date().toISOString();
  return saveUser(user);
}

export async function awardUserShards(username: string, amount: number): Promise<UserProfile> {
  const user = await getOrCreateUser(username);
  user.shards = (user.shards || 0) + amount;
  user.lifetimePoints = (user.lifetimePoints || 0) + amount;
  user.updatedAt = new Date().toISOString();
  return saveUser(user);
}

// ─── TRADES ──────────────────────────────────────────────────────────────────

export async function getAllTrades(): Promise<TradeOffer[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    offeredBy: r.offered_by,
    offeredCardId: r.offered_card_id,
    requestedCardId: r.requested_card_id,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function createTrade(trade: TradeOffer): Promise<TradeOffer> {
  const { data, error } = await supabase
    .from('trades')
    .insert({
      id: trade.id,
      offered_by: trade.offeredBy,
      offered_card_id: trade.offeredCardId,
      requested_card_id: trade.requestedCardId,
      status: trade.status,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, offeredBy: data.offered_by, offeredCardId: data.offered_card_id, requestedCardId: data.requested_card_id, status: data.status, createdAt: data.created_at };
}

export async function updateTradeStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabase.from('trades').update({ status }).eq('id', id);
  return !error;
}

export async function deleteTrade(id: string): Promise<boolean> {
  const { error } = await supabase.from('trades').delete().eq('id', id);
  return !error;
}

// ─── BROADCASTS ──────────────────────────────────────────────────────────────

export async function getBroadcastEvents(): Promise<BroadcastEvent[]> {
  const { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    broadcastType: r.broadcast_type,
    noticeSeverity: r.notice_severity,
    achievementId: r.achievement_id,
    title: r.title,
    desc: r.desc,
    icon: r.icon,
    tier: r.tier,
    recipient: r.recipient,
    shardsReward: r.shards_reward,
    message: r.message,
    missionCategory: r.mission_category,
    targetCount: r.target_count,
    completedBy: r.completed_by ?? [],
    createdAt: r.created_at,
  }));
}

export async function addBroadcastEvent(event: BroadcastEvent): Promise<BroadcastEvent> {
  const { error } = await supabase.from('broadcasts').insert({
    id: event.id,
    broadcast_type: event.broadcastType ?? null,
    notice_severity: event.noticeSeverity ?? null,
    achievement_id: event.achievementId ?? null,
    title: event.title,
    desc: event.desc,
    icon: event.icon,
    tier: event.tier,
    recipient: event.recipient,
    shards_reward: event.shardsReward,
    message: event.message,
    mission_category: event.missionCategory ?? null,
    target_count: event.targetCount ?? null,
    completed_by: event.completedBy ?? [],
  });
  if (error) throw new Error(error.message);
  return event;
}

export async function deleteBroadcastEvent(id: string): Promise<boolean> {
  const { error } = await supabase.from('broadcasts').delete().eq('id', id);
  return !error;
}

export async function completeBroadcastMission(
  username: string,
  broadcastId: string
): Promise<{ success: boolean; user?: UserProfile; broadcast?: BroadcastEvent; error?: string }> {
  const broadcasts = await getBroadcastEvents();
  const broadcast = broadcasts.find((b) => b.id === broadcastId);
  if (!broadcast) return { success: false, error: 'Mission not found' };

  const cleanUsername = username.replace('@', '').trim();
  if (!broadcast.completedBy) broadcast.completedBy = [];
  if (broadcast.completedBy.includes(cleanUsername)) {
    return { success: false, error: 'Mission reward already claimed by this user' };
  }

  broadcast.completedBy.push(cleanUsername);
  await supabase.from('broadcasts').update({ completed_by: broadcast.completedBy }).eq('id', broadcastId);

  const user = await getOrCreateUser(cleanUsername);
  const shardsReward = broadcast.shardsReward || 0;
  user.shards = (user.shards || 0) + shardsReward;
  user.lifetimePoints = (user.lifetimePoints || 0) + shardsReward;
  if (!user.completedMissions.includes(broadcast.id)) user.completedMissions.push(broadcast.id);
  if (!user.completedMissionsHistory) user.completedMissionsHistory = [];
  user.completedMissionsHistory.unshift({
    id: broadcast.id,
    title: broadcast.title,
    desc: broadcast.desc,
    type: 'broadcast_mission',
    category: broadcast.missionCategory || 'Protocol Mission',
    icon: broadcast.icon || '🎯',
    shardsReward,
    completedAt: new Date().toISOString(),
  });
  user.updatedAt = new Date().toISOString();
  const savedUser = await saveUser(user);

  return { success: true, user: savedUser, broadcast };
}

// ─── GIFT LOGS ────────────────────────────────────────────────────────────────

export async function getGiftLogs(): Promise<GiftCardLog[]> {
  const { data, error } = await supabase
    .from('gift_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    username: r.username,
    cardId: r.card_id,
    cardTitle: r.card_title,
    cardRarity: r.card_rarity,
    cardImage: r.card_image,
    quantity: r.quantity,
    reason: r.reason,
    timestamp: r.created_at,
    claimed: r.claimed,
    claimedAt: r.claimed_at,
  }));
}

export async function giftCardToUser(
  username: string,
  cardId: string,
  quantity: number = 1,
  reason?: string
): Promise<{ user: UserProfile; giftLog: GiftCardLog }> {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const user = await getOrCreateUser(cleanUsername);

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

  if (!user.pendingGifts) user.pendingGifts = [];
  user.pendingGifts.unshift(pendingItem);
  user.updatedAt = new Date().toISOString();
  const savedUser = await saveUser(user);

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

  await supabase.from('gift_logs').insert({
    id: log.id,
    username: log.username,
    card_id: log.cardId,
    card_title: log.cardTitle,
    card_rarity: log.cardRarity,
    card_image: log.cardImage,
    quantity: log.quantity,
    reason: log.reason,
    claimed: false,
  });

  return { user: savedUser, giftLog: log };
}

export async function claimUserGift(
  username: string,
  giftId?: string
): Promise<{ success: boolean; user?: UserProfile; cards?: CardArchetype[]; giftLog?: GiftCardLog; error?: string }> {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const user = await getUser(cleanUsername);
  if (!user) return { success: false, error: 'User not found' };
  if (!user.pendingGifts || user.pendingGifts.length === 0) return { success: false, error: 'No pending gifts found' };

  let targetGiftIndex = 0;
  if (giftId && giftId !== 'all') {
    targetGiftIndex = user.pendingGifts.findIndex((g) => g.id === giftId);
    if (targetGiftIndex === -1) return { success: false, error: 'Gift item not found or already claimed' };
  }

  const gift = user.pendingGifts[targetGiftIndex];
  const cardArchetype = ALL_30_CARDS.find((c) => c.id === gift.cardId);
  if (!cardArchetype) return { success: false, error: 'Card archetype not found' };

  const pulledCards: CardArchetype[] = [];
  for (let i = 0; i < gift.quantity; i++) pulledCards.push({ ...cardArchetype });

  user.inventory[gift.cardId] = (user.inventory[gift.cardId] || 0) + gift.quantity;
  user.totalCardsCount = (user.totalCardsCount || 0) + gift.quantity;
  user.lifetimePoints = (user.lifetimePoints || 0) + 50 * gift.quantity;
  user.uniqueCardsCount = Object.keys(user.inventory).filter((k) => user.inventory[k] > 0).length;
  if (user.uniqueCardsCount === 30) user.lifetimePoints += 2500;
  user.pendingGifts.splice(targetGiftIndex, 1);
  user.updatedAt = new Date().toISOString();

  const savedUser = await saveUser(user);

  await supabase.from('gift_logs').update({ claimed: true, claimed_at: new Date().toISOString() }).eq('id', gift.id);

  return {
    success: true,
    user: savedUser,
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

export async function deleteGiftLog(id: string): Promise<boolean> {
  const { error } = await supabase.from('gift_logs').delete().eq('id', id);
  return !error;
}

export async function getUserPendingGifts(username: string): Promise<PendingGiftItem[]> {
  const user = await getUser(username);
  return user?.pendingGifts ?? [];
}

// ─── SEASONS ──────────────────────────────────────────────────────────────────

export async function getActiveSeason(): Promise<Season | null> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return { id: data.id, name: data.name, theme: data.theme, startDate: data.start_date, endDate: data.end_date, isActive: data.is_active };
}

// ─── KV STORE (misc state like last_spin, high scores) ───────────────────────

export async function kvGet(key: string): Promise<string | null> {
  const { data, error } = await supabase.from('kv_store').select('value').eq('key', key).single();
  if (error || !data) return null;
  return data.value;
}

export async function kvSet(key: string, value: string): Promise<void> {
  await supabase.from('kv_store').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

// ─── Legacy sync helper (used by old routes that still call getDb/saveDb) ─────
// These provide a backward-compatible shim so we don't break every API route at once.
// TODO: migrate each API route to use the async functions above directly.

export interface DatabaseStore {
  activeSeason: Season;
  seasons: Season[];
  missions: Mission[];
  users: Record<string, UserProfile>;
  trades: TradeOffer[];
  broadcasts?: BroadcastEvent[];
  giftLogs?: GiftCardLog[];
}

export function getMissionsForDateSync(_dateStr: string): Mission[] { return []; }
