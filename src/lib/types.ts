export type CardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface CardArchetype {
  id: string;
  title: string;
  lore: string;
  rarity: CardRarity;
  glowColor: string;
  image: string;
  badgeEmoji: string;
  iconBg: string;
}

export type ScreenshotRequirement = 'none' | 'optional' | 'mandatory';

export type MissionType = 'twitter_follow' | 'twitter_like' | 'twitter_retweet' | 'discord_join' | 'telegram_join' | 'quiz' | 'custom_url' | 'custom_task';

export interface QuizQuestionItem {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface Mission {
  id: string;
  dayNumber: number; // 1 to 30
  scheduledDate: string; // YYYY-MM-DD
  title: string;
  description: string;
  link: string;
  type: MissionType;
  actionLabel?: string;
  screenshotRequirement?: ScreenshotRequirement;
  quizQuestion?: string;
  quizOptions?: string[];
  quizAnswer?: string;
  quizExplanation?: string;
  quizQuestions?: QuizQuestionItem[];
  rewardPacks: number;
  rewardShards: number;
  isActive: boolean;
}

export interface CompletedMissionLog {
  id: string;
  title: string;
  desc?: string;
  type: string;
  category?: string;
  icon?: string;
  shardsReward: number;
  completedAt: string;
}

export interface PendingGiftItem {
  id: string;
  cardId: string;
  cardTitle: string;
  cardRarity: CardRarity;
  cardImage: string;
  quantity: number;
  reason?: string;
  createdAt: string;
}

export interface UserProfile {
  username: string;
  pinHash?: string;
  address?: string;
  inventory: Record<string, number>; // cardId -> quantity
  uniqueCardsCount: number;
  totalCardsCount: number;
  shards: number;
  lifetimePoints: number;
  completedMissions: string[];
  completedMissionsHistory?: CompletedMissionLog[];
  pendingGifts?: PendingGiftItem[];
  streakDays: number;
  lastClaimDate?: string;
  favoriteCards?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TradeOffer {
  id: string;
  offeredBy: string; // username
  offeredCardId: string;
  requestedCardId: string;
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface WhitelistTierInfo {
  tierNumber: number;
  title: string;
  badgeEmoji: string;
  badgeColor: string;
  percentileText: string;
  ticketName: string;
  rewardSummary: string;
}

export interface Season {
  id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface BroadcastEvent {
  id: string;
  broadcastType?: 'mission' | 'achievement' | 'system_notice';
  noticeSeverity?: 'maintenance' | 'critical' | 'upgrade' | 'announcement';
  achievementId?: string;
  title: string;
  desc: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Mythic';
  recipient: string;
  shardsReward: number;
  message: string;
  missionCategory?: 'trollbox' | 'quests' | 'trade' | 'forge' | 'custom' | string;
  targetCount?: number;
  completedBy?: string[];
  createdAt: string;
}

export interface GiftCardLog {
  id: string;
  username: string;
  cardId: string;
  cardTitle: string;
  cardRarity: CardRarity;
  cardImage: string;
  quantity: number;
  reason?: string;
  timestamp: string;
  claimed?: boolean;
  claimedAt?: string;
}
