import { WhitelistTierInfo } from './types';

// Strictly adheres to the 3 Rialo Brand Kit Colors:
// #010101 (Obsidian), #A9DDD3 (Superconducting Mint), #E8E3D5 (Off-White Silk)
export const WHITELIST_TIERS: WhitelistTierInfo[] = [
  {
    tierNumber: 1,
    title: 'Rialo Immortal',
    badgeEmoji: '👑',
    badgeColor: '#A9DDD3',
    percentileText: 'Top 0.5%',
    ticketName: 'GTD Free Mint + VIP OG Pass',
    rewardSummary: 'Guaranteed Free Mint + VIP OG Role + 3x Genesis Airdrop Multiplier',
  },
  {
    tierNumber: 2,
    title: 'Grandmaster Ascendant',
    badgeEmoji: '💎',
    badgeColor: '#BCEAE1',
    percentileText: 'Top 2.0%',
    ticketName: 'GTD Free Mint',
    rewardSummary: 'Guaranteed Free Mint (100% Free NFT Spot)',
  },
  {
    tierNumber: 3,
    title: 'Protocol Sovereign',
    badgeEmoji: '⚡',
    badgeColor: '#CEEFE9',
    percentileText: 'Top 5.0%',
    ticketName: 'GTD Whitelist Phase 1',
    rewardSummary: 'Guaranteed Whitelist Phase 1 Allocation',
  },
  {
    tierNumber: 4,
    title: 'Quantum Hypervisor',
    badgeEmoji: '🛡️',
    badgeColor: '#E8E3D5',
    percentileText: 'Top 10.0%',
    ticketName: 'GTD Whitelist Phase 2',
    rewardSummary: 'Guaranteed Whitelist Phase 2 Allocation',
  },
  {
    tierNumber: 5,
    title: 'Consensus Vanguard',
    badgeEmoji: '🌀',
    badgeColor: '#E0DBD0',
    percentileText: 'Top 20.0%',
    ticketName: 'Priority Whitelist',
    rewardSummary: 'Priority Early Access with Discounted Mint Price',
  },
  {
    tierNumber: 6,
    title: 'Voidwalker Elite',
    badgeEmoji: '⚔️',
    badgeColor: '#D5D0C4',
    percentileText: 'Top 35.0%',
    ticketName: 'FCFS Whitelist Phase 1',
    rewardSummary: 'First-Come First-Serve Fast-Lane Allocation',
  },
  {
    tierNumber: 7,
    title: 'Cyber Operative',
    badgeEmoji: '🗡️',
    badgeColor: '#CBC5B8',
    percentileText: 'Top 50.0%',
    ticketName: 'FCFS Whitelist Phase 2',
    rewardSummary: 'First-Come First-Serve Standard Whitelist',
  },
  {
    tierNumber: 8,
    title: 'Testnet Sentinel',
    badgeEmoji: '🌊',
    badgeColor: '#BFB9AB',
    percentileText: 'Top 70.0%',
    ticketName: 'Community Mint Pass',
    rewardSummary: 'Community Pre-Sale Access & Discord Sentinel Badge',
  },
  {
    tierNumber: 9,
    title: 'Mempool Navigator',
    badgeEmoji: '🧭',
    badgeColor: '#B2AB9D',
    percentileText: 'Top 85.0%',
    ticketName: 'Mainnet Raffle Pass',
    rewardSummary: 'Genesis NFT & Token Airdrop Raffle Ticket',
  },
  {
    tierNumber: 10,
    title: 'Ecosystem Pioneer',
    badgeEmoji: '🚀',
    badgeColor: '#A49D8F',
    percentileText: 'All Active Participants',
    ticketName: 'Genesis SBT Pass',
    rewardSummary: 'Genesis Proof-of-Participation Soulbound Token + Community Pool',
  },
];

/**
 * Calculates the dynamic 10-tier ranking based on total user count
 * @param rank 1-indexed position in leaderboard
 * @param totalUsers total number of active users
 */
export function calculateDynamicTier(rank: number, totalUsers: number): WhitelistTierInfo {
  const n = Math.max(totalUsers, 1);
  const percentile = (rank / n) * 100;

  // Smart minimum floor cutoffs so early stage launch guarantees top rankers get top tiers
  if (rank === 1 || percentile <= 0.5) return WHITELIST_TIERS[0];
  if (rank <= 2 || percentile <= 2.0) return WHITELIST_TIERS[1];
  if (rank <= 3 || percentile <= 5.0) return WHITELIST_TIERS[2];
  if (rank <= 5 || percentile <= 10.0) return WHITELIST_TIERS[3];
  if (rank <= 10 || percentile <= 20.0) return WHITELIST_TIERS[4];
  if (rank <= 15 || percentile <= 35.0) return WHITELIST_TIERS[5];
  if (rank <= 20 || percentile <= 50.0) return WHITELIST_TIERS[6];
  if (rank <= 30 || percentile <= 70.0) return WHITELIST_TIERS[7];
  if (rank <= 50 || percentile <= 85.0) return WHITELIST_TIERS[8];
  return WHITELIST_TIERS[9];
}
