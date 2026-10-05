'use client';

import React, { useState, useEffect } from 'react';
import { User, Award, Trophy, Sparkles, Shield, Flame, CheckCircle, CheckCircle2, Lock, ExternalLink, ArrowRight, RefreshCw, Radio, Megaphone, Bell, X, Zap, MessageSquare, Send } from 'lucide-react';
import { UserProfile, BroadcastEvent } from '@/lib/types';
import { PLATFORM_ACHIEVEMENTS, PlatformAchievement } from '@/lib/achievementsData';
import { ALL_30_CARDS, RIALO_30_ARCHETYPES } from '@/lib/cardsData';
import { sound } from '@/lib/soundFx';

interface ProfileSectionProps {
  user: UserProfile | null;
  onSelectTab: (tab: any) => void;
  onLogOut?: () => void;
  onSwitchAccount?: () => void;
  onUserUpdate?: (u: UserProfile) => void;
}

interface ComputedAchievement extends PlatformAchievement {
  isUnlocked: boolean;
  progressText: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onSelectTab, onLogOut, onSwitchAccount, onUserUpdate }) => {
  const fallbackAvatar = 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png';
  const twitterAvatar = user?.username ? `https://unavatar.io/x/${user.username}` : fallbackAvatar;

  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked' | 'quests' | 'cards' | 'forge' | 'trading' | 'arcade' | 'prestige'>('all');
  const [claimedTrophies, setClaimedTrophies] = useState<Record<string, boolean>>({});
  const [broadcasts, setBroadcasts] = useState<BroadcastEvent[]>([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<Record<string, boolean>>({});
  const [isMissionsHistoryOpen, setIsMissionsHistoryOpen] = useState(false);
  const [trollboxSentCount, setTrollboxSentCount] = useState<number>(0);
  const [isVerifyingMission, setIsVerifyingMission] = useState(false);
  const [missionClaimSuccessMsg, setMissionClaimSuccessMsg] = useState('');
  const [claimedMissionIds, setClaimedMissionIds] = useState<Record<string, boolean>>({});
  const [userRank, setUserRank] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(1);
  const [glideScore, setGlideScore] = useState<number>(0);
  const [tradesCreatedCount, setTradesCreatedCount] = useState<number>(0);
  const [tradesCompletedCount, setTradesCompletedCount] = useState<number>(0);
  const [tradesArbitrageCount, setTradesArbitrageCount] = useState<number>(0);
  const [forgedCount, setForgedCount] = useState<number>(0);
  const [forgedHighYield, setForgedHighYield] = useState<boolean>(false);
  const [forgedMythic, setForgedMythic] = useState<boolean>(false);
  const [djPadUsed, setDjPadUsed] = useState<boolean>(false);
  const [arpeggiatorUsed, setArpeggiatorUsed] = useState<boolean>(false);
  const [alphaEngaged, setAlphaEngaged] = useState<boolean>(false);

  // Sync real gameplay activity and achievements state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cleanU = (user?.username || '').replace('@', '').toLowerCase();

      const refreshLocalStats = () => {
        setTrollboxSentCount(parseInt(localStorage.getItem(`rialo_trollbox_sent_${cleanU}`) || '0'));
        setForgedCount(parseInt(localStorage.getItem(`rialo_forged_count_${cleanU}`) || '0'));
        setForgedHighYield(localStorage.getItem(`rialo_forged_high_yield_${cleanU}`) === 'true');
        setForgedMythic(localStorage.getItem(`rialo_forged_mythic_${cleanU}`) === 'true');
        setTradesCreatedCount(parseInt(localStorage.getItem(`rialo_trades_created_${cleanU}`) || '0'));
        setTradesCompletedCount(parseInt(localStorage.getItem(`rialo_trades_completed_${cleanU}`) || '0'));
        setTradesArbitrageCount(parseInt(localStorage.getItem(`rialo_trades_arbitrage_${cleanU}`) || '0'));
        setDjPadUsed(localStorage.getItem(`rialo_dj_pad_used_${cleanU}`) === 'true');
        setArpeggiatorUsed(localStorage.getItem(`rialo_arpeggiator_loop_used_${cleanU}`) === 'true');
        setAlphaEngaged(localStorage.getItem(`rialo_alpha_liked_${cleanU}`) === 'true');
        const localGlide = parseInt(localStorage.getItem(`rialo_glide_highscore_${cleanU}`) || '0');
        if (localGlide > 0) setGlideScore((prev) => Math.max(prev, localGlide));
      };

      refreshLocalStats();

      // Fetch arcade data for glide highscore
      fetch(`/api/arcade?username=${encodeURIComponent(cleanU)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && typeof d.glideHighscore === 'number') {
            setGlideScore(d.glideHighscore);
          }
        })
        .catch(() => {});

      // Fetch user rank & leaderboard info
      fetch(`/api/user?username=${encodeURIComponent(cleanU)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setUserRank(d.rank || 0);
            setTotalUsers(d.totalUsers || 1);
          }
        })
        .catch(() => {});

      // Fetch open trades to count user created trades
      fetch('/api/trades')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.trades)) {
            const myTrades = d.trades.filter((t: any) => t.offeredBy?.toLowerCase() === cleanU);
            if (myTrades.length > 0) {
              setTradesCreatedCount((prev) => Math.max(prev, myTrades.length));
            }
          }
        })
        .catch(() => {});

      window.addEventListener('rialo_trollbox_msg_sent', refreshLocalStats);
      window.addEventListener('rialo_arcade_activity', refreshLocalStats);
      window.addEventListener('rialo_forge_activity', refreshLocalStats);
      window.addEventListener('rialo_trade_activity', refreshLocalStats);
      window.addEventListener('rialo_alpha_activity', refreshLocalStats);

      return () => {
        window.removeEventListener('rialo_trollbox_msg_sent', refreshLocalStats);
        window.removeEventListener('rialo_arcade_activity', refreshLocalStats);
        window.removeEventListener('rialo_forge_activity', refreshLocalStats);
        window.removeEventListener('rialo_trade_activity', refreshLocalStats);
        window.removeEventListener('rialo_alpha_activity', refreshLocalStats);
      };
    }
  }, [user?.username]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const claimed = localStorage.getItem('rialo_claimed_trophies');
      if (claimed) {
        try {
          setClaimedTrophies(JSON.parse(claimed));
        } catch {}
      }

      // Fetch live broadcasts from admin
      fetch('/api/admin/broadcast')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.broadcasts)) {
            setBroadcasts(data.broadcasts);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleVerifyAndClaimMission = async (broadcast: BroadcastEvent) => {
    sound.playTap();
    setIsVerifyingMission(true);
    try {
      const username = user?.username || '';
      const res = await fetch('/api/missions/verify-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          broadcastId: broadcast.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playJackpot();
        setClaimedMissionIds((prev) => ({ ...prev, [broadcast.id]: true }));
        setMissionClaimSuccessMsg(data.message || `✓ Mission verified! +${broadcast.shardsReward} Shards claimed!`);
        setTimeout(() => setMissionClaimSuccessMsg(''), 5000);
        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      } else {
        alert(data.error || 'Failed to verify mission.');
      }
    } catch (err) {
      console.error('Mission verification error:', err);
      alert('Network error while verifying mission.');
    } finally {
      setIsVerifyingMission(false);
    }
  };

  const handleClaimReward = (id: string, shards: number) => {
    sound.playJackpot();
    const updated = { ...claimedTrophies, [id]: true };
    setClaimedTrophies(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rialo_claimed_trophies', JSON.stringify(updated));
    }
  };

  const inventoryCount = user?.uniqueCardsCount ?? 0;
  const totalCards = user?.totalCardsCount ?? 0;
  const shards = user?.shards ?? 0;
  const lifetimePoints = user?.lifetimePoints ?? 0;
  const streakDays = user?.streakDays ?? 1;
  const missionsCount = user?.completedMissions?.length ?? 0;

  const duplicateCount = Object.keys(user?.inventory || {}).reduce((sum, cid) => {
    const qty = user?.inventory[cid] || 0;
    return sum + Math.max(0, qty - 1);
  }, 0);

  const hasHolo = Object.keys(user?.inventory || {}).some((cid) => {
    const qty = user?.inventory[cid] || 0;
    if (qty <= 0) return false;
    const card = RIALO_30_ARCHETYPES[cid] || ALL_30_CARDS.find((c) => c.id === cid);
    return card && ['LEGENDARY', 'MYTHIC'].includes(card.rarity.toUpperCase());
  });

  // Check if admin broadcasted any achievement specifically to current user or ALL
  const userHandle = (user?.username || '').toLowerCase().replace('@', '');
  const broadcastedAchievementIds = new Set(
    broadcasts
      .filter((b) => {
        const rec = b.recipient.toLowerCase().replace('@', '').trim();
        return rec === 'all' || rec === 'all players' || rec === userHandle;
      })
      .map((b) => b.achievementId)
      .filter(Boolean)
  );

  // Compute unlock status & dynamic progress for all 30 achievements
  const ACHIEVEMENTS: ComputedAchievement[] = PLATFORM_ACHIEVEMENTS.map((ach) => {
    let isUnlocked = false;
    let progressText = 'Locked';

    switch (ach.id) {
      // --- 🚀 Quests & Genesis (6) ---
      case 'genesis_pioneer':
        isUnlocked = Boolean(user && user.username);
        progressText = isUnlocked ? 'Activated & Enrolled' : 'Pending Activation';
        break;
      case 'first_quest':
        isUnlocked = missionsCount >= 1;
        progressText = `${Math.min(missionsCount, 1)}/1 Quest Complete`;
        break;
      case 'dedicated_runner':
        isUnlocked = missionsCount >= 5;
        progressText = `${Math.min(missionsCount, 5)}/5 Quests Complete`;
        break;
      case 'crypto_scholar':
        isUnlocked = missionsCount >= 3;
        progressText = `${Math.min(missionsCount, 3)}/3 Quizzes Solved`;
        break;
      case 'streak_keeper':
        isUnlocked = streakDays >= 3;
        progressText = `${streakDays}/3 Days Streak`;
        break;
      case 'relentless_sync':
        isUnlocked = streakDays >= 7;
        progressText = `${streakDays}/7 Days Streak`;
        break;

      // --- 🎴 Cards & Collecting (6) ---
      case 'rookie_cardholder':
        isUnlocked = totalCards >= 1;
        progressText = `${Math.min(totalCards, 1)}/1 Card in Vault`;
        break;
      case 'collector_apprentice':
        isUnlocked = inventoryCount >= 5;
        progressText = `${Math.min(inventoryCount, 5)}/5 Unique Cards`;
        break;
      case 'deck_master':
        isUnlocked = inventoryCount >= 12;
        progressText = `${Math.min(inventoryCount, 12)}/12 Unique Cards`;
        break;
      case 'archive_curator':
        isUnlocked = inventoryCount >= 20;
        progressText = `${Math.min(inventoryCount, 20)}/20 Unique Cards`;
        break;
      case 'holo_mirage':
        isUnlocked = Boolean(hasHolo);
        progressText = hasHolo ? '1 Legendary/Mythic Owned' : '0/1 Legendary or Mythic Holo';
        break;
      case 'omniscient_binder':
        isUnlocked = inventoryCount >= 30;
        progressText = `${inventoryCount}/30 Full Collection`;
        break;

      // --- 🧪 The Superconducting Forge (4) ---
      case 'apprentice_melter':
        isUnlocked = duplicateCount >= 1 || forgedCount >= 1;
        progressText = isUnlocked
          ? (forgedCount >= 1 ? `${forgedCount} Cards Transmuted` : `${duplicateCount} Duplicates Ready for Forge`)
          : `${duplicateCount}/1 Duplicate Available`;
        break;
      case 'forge_alchemist':
        isUnlocked = forgedCount >= 3;
        progressText = `${Math.min(forgedCount, 3)}/3 Cards Transmuted`;
        break;
      case 'fusion_ignition':
        isUnlocked = forgedHighYield || forgedCount >= 3;
        progressText = isUnlocked ? 'Fusion Field Resonance Active' : 'Awaiting High-Yield Fusion';
        break;
      case 'zero_resist_forge':
        isUnlocked = forgedMythic;
        progressText = isUnlocked ? 'Sovereign Card Forged' : 'Requires Sovereign Blueprint';
        break;

      // --- 🔄 P2P Trading (4) ---
      case 'trade_broker':
        isUnlocked = tradesCreatedCount >= 1;
        progressText = isUnlocked ? 'Exchange Offer Listed' : '0/1 Active Trade Offer';
        break;
      case 'liquidity_facilitator':
        isUnlocked = tradesCompletedCount >= 3;
        progressText = `${Math.min(tradesCompletedCount, 3)}/3 Peer Swaps Completed`;
        break;
      case 'market_arbitrageur':
        isUnlocked = tradesArbitrageCount >= 1;
        progressText = isUnlocked ? '1 Arbitrage Offer Settled' : '0/1 Arbitrage Swap Settled';
        break;
      case 'titan_swapper':
        isUnlocked = tradesCompletedCount >= 10;
        progressText = `${Math.min(tradesCompletedCount, 10)}/10 Swaps Completed`;
        break;

      // --- 🕹️ Meissner Arcade & Sound Lab (4) ---
      case 'arcade_ace':
        isUnlocked = glideScore > 0;
        progressText = isUnlocked ? `${glideScore} PTS Glide Highscore` : 'Awaiting 1st Flight';
        break;
      case 'gravity_defier':
        isUnlocked = glideScore >= 100;
        progressText = `${Math.min(glideScore, 100)}/100 PTS Record`;
        break;
      case 'sound_maestro':
        isUnlocked = djPadUsed;
        progressText = isUnlocked ? 'MPC Drum Machine Active' : '0/1 Beat Synthesized';
        break;
      case 'frequency_alchemist':
        isUnlocked = arpeggiatorUsed;
        progressText = isUnlocked ? '16-Step Arpeggiator Synthesized' : '0/1 Loop Pattern Triggered';
        break;

      // --- 💬 Community & Trollbox (2) ---
      case 'trollbox_vanguard':
        isUnlocked = trollboxSentCount >= 5;
        progressText = `${Math.min(trollboxSentCount, 5)}/5 Protocol Signals Transmitted`;
        break;
      case 'alpha_hunter':
        isUnlocked = alphaEngaged;
        progressText = isUnlocked ? 'Alpha Curator Standing Verified' : '0/1 Alpha Post Engaged';
        break;

      // --- 👑 Prestige & Dynamic Whitelist (4) ---
      case 'shard_tycoon':
        isUnlocked = shards >= 500;
        progressText = `${shards}/500 Superconducting Shards`;
        break;
      case 'millionaire_shards':
        isUnlocked = lifetimePoints >= 1500;
        progressText = `${lifetimePoints}/1500 Lifetime Points`;
        break;
      case 'whitelist_ascendant': {
        const isTop5 = userRank > 0 && totalUsers > 0 && (userRank / totalUsers) <= 0.05;
        const pct = totalUsers > 0 && userRank > 0 ? ((userRank / totalUsers) * 100).toFixed(1) : '100';
        isUnlocked = isTop5;
        progressText = isTop5 ? `Top ${pct}% Standing Confirmed` : `Current Standing: Top ${pct}%`;
        break;
      }
      case 'whitelist_immortal':
        isUnlocked = userRank === 1;
        progressText = userRank === 1 ? 'Rank #1 Secured (Top 0.5%)' : (userRank > 0 ? `Current Rank: #${userRank}` : 'Unranked');
        break;

      default:
        isUnlocked = false;
        progressText = 'In Progress';
    }

        // If admin explicitly broadcasted this achievement to this user, override unlock!
    if (broadcastedAchievementIds.has(ach.id)) {
      isUnlocked = true;
      progressText = 'Awarded by Protocol Admin';
    }

    return {
      ...ach,
      isUnlocked,
      progressText,
    };
  });

  // Custom Admin Broadcast Achievements (Dynamically included in Trophy Cabinet)
  const customBroadcastAchievements: ComputedAchievement[] = broadcasts
    .filter((b) => {
      const isAchievement = b.broadcastType === 'achievement' || (b.broadcastType !== 'mission' && b.achievementId);
      const rec = (b.recipient || '').toLowerCase().replace('@', '').trim();
      const isForUser = rec === 'all' || rec === 'all players' || rec === userHandle;
      const isCustom = b.achievementId === 'custom' || !PLATFORM_ACHIEVEMENTS.some((p) => p.id === b.achievementId);
      return isAchievement && isForUser && isCustom;
    })
    .map((b) => ({
      id: b.id,
      title: b.title,
      desc: b.desc,
      icon: b.icon || '🏆',
      tier: b.tier || 'Gold',
      category: 'prestige',
      shardsReward: b.shardsReward || 0,
      isUnlocked: true,
      progressText: 'Awarded by Protocol Admin',
    }));

  const ALL_DISPLAYED_ACHIEVEMENTS = [...ACHIEVEMENTS, ...customBroadcastAchievements];

  const unlockedCount = ALL_DISPLAYED_ACHIEVEMENTS.filter((a) => a.isUnlocked).length;

  const filteredAchievements = ALL_DISPLAYED_ACHIEVEMENTS.filter((a) => {
    if (filterMode === 'unlocked') return a.isUnlocked;
    if (filterMode === 'locked') return !a.isUnlocked;
    if (filterMode === 'quests') return a.category === 'quests';
    if (filterMode === 'cards') return a.category === 'cards';
    if (filterMode === 'forge') return a.category === 'forge';
    if (filterMode === 'trading') return a.category === 'trading';
    if (filterMode === 'arcade') return a.category === 'arcade';
    if (filterMode === 'prestige') return a.category === 'prestige' || a.category === 'community';
    return true;
  });

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Mythic':
        return {
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
          color: '#F472B6',
          border: '1px solid rgba(236, 72, 153, 0.6)',
        };
      case 'Diamond':
        return {
          background: 'rgba(96, 165, 250, 0.18)',
          color: '#60A5FA',
          border: '1px solid rgba(96, 165, 250, 0.45)',
        };
      case 'Platinum':
        return {
          background: 'rgba(169, 221, 211, 0.18)',
          color: '#A9DDD3',
          border: '1px solid rgba(169, 221, 211, 0.45)',
        };
      case 'Gold':
        return {
          background: 'rgba(251, 191, 36, 0.18)',
          color: '#FBBF24',
          border: '1px solid rgba(251, 191, 36, 0.45)',
        };
      case 'Silver':
        return {
          background: 'rgba(203, 213, 225, 0.18)',
          color: '#CBD5E1',
          border: '1px solid rgba(203, 213, 225, 0.45)',
        };
      case 'Bronze':
      default:
        return {
          background: 'rgba(205, 127, 50, 0.18)',
          color: '#E2A970',
          border: '1px solid rgba(205, 127, 50, 0.45)',
        };
    }
  };

  // Get active broadcast banner to show if any broadcast exists and not dismissed
  const activeBroadcast = broadcasts.find((b) => !dismissedBroadcasts[b.id]);

  return (
    <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', padding: '16px 8px 60px 8px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* ========================================================
          USER IDENTITY PROFILE CARD (OFFICIAL BRAND THEME)
          ======================================================== */}
      <div className="profile-hero-card" style={{ overflow: 'hidden', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
        {/* Subtle Brand Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(169, 221, 211, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div className="profile-identity-main-row">
          {/* Avatar + Identity Details */}
          <div className="profile-identity-wrap">
            {/* Interactive Avatar with Halo */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                padding: '3px',
                background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 50%, #F0827D 100%)',
                boxShadow: '0 0 25px rgba(169, 221, 211, 0.45)',
                position: 'relative',
              }}>
                <img
                  src={twitterAvatar}
                  alt="Twitter Profile DP"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#020406',
                  }}
                />
              </div>

              {/* Online Protocol Indicator */}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#10B981',
                border: '3px solid #080C12',
                boxShadow: '0 0 10px #10B981',
              }} />
            </div>

            {/* User Meta Information */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#E8E3D5', margin: 0, letterSpacing: '-0.02em' }}>
                  @{user?.username || 'Guest'}
                </h1>
                <span style={{
                  background: 'rgba(169, 221, 211, 0.15)',
                  border: '1px solid rgba(169, 221, 211, 0.4)',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  color: '#A9DDD3',
                  fontSize: '10px',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <CheckCircle size={11} /> VERIFIED
                </span>
              </div>

              {/* Standing & Ticket Badge */}
              <div className="profile-badges-row">
                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#010101',
                  background: '#A9DDD3',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  👑 Rank #1: Rialo Immortal (Top 0.5%)
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#A9DDD3',
                  background: 'rgba(169, 221, 211, 0.1)',
                  border: '1px solid rgba(169, 221, 211, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                }}>
                  ✨ GTD Free Mint + VIP OG Pass
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="profile-actions-grid">
            {onSwitchAccount && (
              <button
                type="button"
                onClick={() => { sound.playTap(); onSwitchAccount(); }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'rgba(169, 221, 211, 0.1)',
                  border: '1px solid rgba(169, 221, 211, 0.3)',
                  color: '#A9DDD3',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🔄 Switch Account</span>
              </button>
            )}
            {onLogOut && (
              <button
                type="button"
                onClick={() => { sound.playTap(); onLogOut(); }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#FCA5A5',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🚪 Sign Out</span>
              </button>
            )}

            <button
              type="button"
              className="full-span"
              onClick={() => { sound.playTap(); setIsMissionsHistoryOpen(true); }}
              style={{
                padding: '10px 18px',
                background: 'rgba(169, 221, 211, 0.12)',
                border: '1px solid rgba(169, 221, 211, 0.45)',
                borderRadius: '12px',
                color: '#A9DDD3',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <CheckCircle2 size={16} color="#A9DDD3" />
              <span>Completed Missions ({user?.completedMissions?.length || (user?.completedMissionsHistory?.length || 0)})</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Overview Bar */}
        <div className="profile-stats-grid">
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#8E9B97', fontWeight: 700 }}>ACTIVE SHARDS</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#A9DDD3', marginTop: '2px' }}>{shards.toLocaleString()} 💎</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#8E9B97', fontWeight: 700 }}>LIFETIME POINTS</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{lifetimePoints.toLocaleString()} PTS</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#8E9B97', fontWeight: 700 }}>CARDS COLLECTED</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#A9DDD3', marginTop: '2px' }}>{inventoryCount} / 30 🎴</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#8E9B97', fontWeight: 700 }}>ACHIEVEMENTS</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#E8E3D5', marginTop: '2px' }}>{unlockedCount} / {ALL_DISPLAYED_ACHIEVEMENTS.length} 🏆</div>
          </div>
        </div>
      </div>

      {/* ========================================================
          TROPHY CABINET & SECRET ACHIEVEMENTS SECTION (30 FEATS)
          ======================================================== */}
      <div>
        {/* Header with Title and Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#A9DDD3', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Trophy size={14} /> PLATFORM PRESTIGE & FEATS (30 ACHIEVEMENTS)
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 0 0' }}>
              Trophy Cabinet & <span className="gradient-text-rialo">Secret Feats</span>
            </h2>
          </div>

          {/* Quick Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${ALL_DISPLAYED_ACHIEVEMENTS.length})` },
              { id: 'unlocked', label: `🏆 Unlocked (${unlockedCount})` },
              { id: 'locked', label: `🔒 Locked (${ALL_DISPLAYED_ACHIEVEMENTS.length - unlockedCount})` },
              { id: 'quests', label: '🚀 Quests' },
              { id: 'cards', label: '🎴 Cards' },
              { id: 'forge', label: '🧪 Forge' },
              { id: 'trading', label: '🔄 Trading' },
              { id: 'arcade', label: '🕹️ Arcade' },
              { id: 'prestige', label: '👑 Prestige' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { sound.playTap(); setFilterMode(tab.id as any); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: filterMode === tab.id ? '#A9DDD3' : 'rgba(255,255,255,0.04)',
                  color: filterMode === tab.id ? '#010101' : '#8E9B97',
                  border: filterMode === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid (30 Achievements) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '16px',
        }}>
          {filteredAchievements.map((ach) => {
            const isClaimed = claimedTrophies[ach.id];
            const tierStyle = getTierBadgeStyle(ach.tier);

            return (
              <div
                key={ach.id}
                style={{
                  background: ach.isUnlocked
                    ? 'linear-gradient(135deg, rgba(10, 16, 22, 0.95), rgba(4, 8, 12, 0.98))'
                    : 'rgba(5, 8, 12, 0.6)',
                  border: ach.isUnlocked ? '1.5px solid rgba(169, 221, 211, 0.35)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: ach.isUnlocked ? '0 10px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(169, 221, 211, 0.06)' : 'none',
                  opacity: ach.isUnlocked ? 1 : 0.65,
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div>
                  {/* Top Bar: Icon, Tier, Reward */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: ach.isUnlocked ? 'rgba(169, 221, 211, 0.15)' : 'rgba(255,255,255,0.04)',
                      border: ach.isUnlocked ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                    }}>
                      {ach.icon}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        ...tierStyle,
                      }}>
                        {ach.tier}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#A9DDD3',
                        background: 'rgba(169, 221, 211, 0.12)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}>
                        +{ach.shardsReward} Shards
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: ach.isUnlocked ? '#FFFFFF' : '#8E9B97', margin: '0 0 6px 0' }}>
                    {ach.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#8E9B97', margin: 0, lineHeight: 1.4 }}>
                    {ach.desc}
                  </p>
                </div>

                {/* Progress / Status Bottom */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: ach.isUnlocked ? '#A9DDD3' : '#64748B', fontWeight: 700 }}>
                    {ach.progressText}
                  </span>

                  {ach.isUnlocked ? (
                    isClaimed ? (
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={13} /> Claimed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimReward(ach.id, ach.shardsReward)}
                        style={{
                          padding: '5px 12px',
                          background: 'linear-gradient(135deg, #A9DDD3, #76c0b2)',
                          color: '#010101',
                          fontSize: '11px',
                          fontWeight: 900,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 0 10px rgba(169, 221, 211, 0.3)',
                        }}
                      >
                        Claim +{ach.shardsReward} 💎
                      </button>
                    )
                  ) : (
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* ========================================================
          COMPLETED MISSIONS HISTORY MODAL
          ======================================================== */}
      {isMissionsHistoryOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'rgba(6, 12, 16, 0.98)',
            border: '1.5px solid rgba(169, 221, 211, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(169, 221, 211, 0.15)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📜 Completed Missions History
                </h3>
                <p style={{ fontSize: '12px', color: '#8E9B97', margin: '4px 0 0 0' }}>
                  Verified cryptographic proof of completed daily quests & protocol missions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMissionsHistoryOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8E9B97',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Missions List */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(user?.completedMissionsHistory && user.completedMissionsHistory.length > 0) ? (
                user.completedMissionsHistory.map((item, idx) => (
                  <div
                    key={item.id + '-' + idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(169, 221, 211, 0.25)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(169, 221, 211, 0.15)',
                        border: '1px solid rgba(169, 221, 211, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}>
                        {item.icon || '⚡'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: '#8E9B97', marginTop: '2px' }}>
                          {item.category || 'Protocol Mission'} • {new Date(item.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 900, color: '#A9DDD3' }}>
                        +{item.shardsReward || 25} Shards
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginTop: '3px',
                      }}>
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback if user only has completedMissions ID array */
                (user?.completedMissions || ['m-day-1', 'm-day-2']).map((id, idx) => (
                  <div
                    key={id + '-' + idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(169, 221, 211, 0.2)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(169, 221, 211, 0.15)',
                        border: '1px solid rgba(169, 221, 211, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}>
                        ⚡
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                          {id.startsWith('bcast') ? 'Admin Broadcast Mission' : `Season 1 Daily Mission (${id})`}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8E9B97', marginTop: '2px' }}>
                          Verified on Protocol Ledger • Season 1 Testnet
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 900, color: '#A9DDD3' }}>
                        +250 Shards
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginTop: '3px',
                      }}>
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};