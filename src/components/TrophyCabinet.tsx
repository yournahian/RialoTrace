'use client';

import React from 'react';
import { Trophy, Award, Lock, CheckCircle2, Zap, Sparkles, Star } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface TrophyCabinetProps {
  user: UserProfile | null;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  shardsReward: number;
  isUnlocked: boolean;
}

export const TrophyCabinet: React.FC<TrophyCabinetProps> = ({ user }) => {
  const inventoryCount = user?.uniqueCardsCount || 0;
  const completedMissionsCount = user?.completedMissions?.length || 0;
  const shards = user?.shards || 0;

  const ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_quest',
      title: 'First Quantum Pulse',
      desc: 'Complete your first daily mission on RialoTrace.',
      icon: '⚡',
      shardsReward: 25,
      isUnlocked: completedMissionsCount >= 1,
    },
    {
      id: 'card_collector',
      title: 'Genesis Collector',
      desc: 'Collect at least 5 unique cards in your album.',
      icon: '🎴',
      shardsReward: 50,
      isUnlocked: inventoryCount >= 5,
    },
    {
      id: 'forge_master',
      title: 'Cryogenic Alchemist',
      desc: 'Fuse 3 cards into higher rarity in The Forge.',
      icon: '🧪',
      shardsReward: 75,
      isUnlocked: (user?.totalCardsCount || 0) >= 3,
    },
    {
      id: 'shard_whale',
      title: 'Shard Vault Whale',
      desc: 'Accumulate over 200 Shards in your active balance.',
      icon: '💎',
      shardsReward: 100,
      isUnlocked: shards >= 200,
    },
    {
      id: 'arcade_pilot',
      title: 'Meissner Ace Pilot',
      desc: 'Achieve flight distance over 50m in Zero-Friction Glide.',
      icon: '🚀',
      shardsReward: 50,
      isUnlocked: true,
    },
    {
      id: 'lucky_spinner',
      title: 'Quantum High Roller',
      desc: 'Spin the Daily Quantum Lucky Wheel.',
      icon: '🎰',
      shardsReward: 30,
      isUnlocked: true,
    },
    {
      id: 'quiz_genius',
      title: 'Rialo Oracle Mind',
      desc: 'Solve technical Web3 quizzes with zero friction.',
      icon: '🧠',
      shardsReward: 40,
      isUnlocked: completedMissionsCount >= 2,
    },
    {
      id: 'cyber_dj',
      title: 'Synthesizer Maestro',
      desc: 'Drop beats and trigger loops on the Rialo DJ Soundboard.',
      icon: '🎹',
      shardsReward: 35,
      isUnlocked: true,
    },
    {
      id: 'streak_titan',
      title: 'Cryo-Streak Titan',
      desc: 'Maintain an active 3+ day check-in streak.',
      icon: '🔥',
      shardsReward: 60,
      isUnlocked: (user?.streakDays || 1) >= 3,
    },
    {
      id: 'meme_artisan',
      title: 'Meme Protocol Artisan',
      desc: 'Forge your own custom trading card in the Creator Studio.',
      icon: '🎨',
      shardsReward: 50,
      isUnlocked: true,
    },
  ];

  const unlockedCount = ACHIEVEMENTS.filter(a => a.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 14, 12, 0.95) 0%, rgba(2, 5, 4, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.25)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      marginBottom: '28px',
    }}>
      {/* Title & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            background: 'rgba(169, 221, 211, 0.08)',
            border: '1px solid rgba(169, 221, 211, 0.3)',
            borderRadius: '9999px',
            color: '#A9DDD3',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            <Trophy size={13} /> Hall of Fame
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#E8E3D5', margin: 0 }}>
            Trophy Cabinet & Secret Achievements
          </h2>
          <p style={{ color: '#8E9B97', fontSize: '13px', margin: '4px 0 0 0' }}>
            Complete platform feats to unlock badges, profile titles, and instant Shard payouts.
          </p>
        </div>

        {/* Progress Counter */}
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(169, 221, 211, 0.3)',
          borderRadius: '16px',
          padding: '12px 20px',
          textAlign: 'right',
        }}>
          <div style={{ fontSize: '11px', color: '#8E9B97', textTransform: 'uppercase' }}>Trophies Claimed</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#A9DDD3' }}>
            {unlockedCount} / {ACHIEVEMENTS.length} ({progressPercent}%)
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '14px',
      }}>
        {ACHIEVEMENTS.map((ach) => (
          <div
            key={ach.id}
            style={{
              background: ach.isUnlocked ? 'rgba(169, 221, 211, 0.06)' : 'rgba(255, 255, 255, 0.02)',
              border: ach.isUnlocked ? '1px solid rgba(169, 221, 211, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.2s',
              boxShadow: ach.isUnlocked ? '0 0 15px rgba(169, 221, 211, 0.12)' : 'none',
              opacity: ach.isUnlocked ? 1 : 0.6,
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: ach.isUnlocked ? 'radial-gradient(circle, #102e26 0%, #030a08 100%)' : '#070a09',
              border: ach.isUnlocked ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}>
              {ach.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: ach.isUnlocked ? '#FFFFFF' : '#888888', margin: 0 }}>
                  {ach.title}
                </h4>
                {ach.isUnlocked ? (
                  <CheckCircle2 size={15} color="#A9DDD3" />
                ) : (
                  <Lock size={13} color="#555555" />
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#8E9B97', margin: '4px 0 6px 0', lineHeight: 1.35 }}>
                {ach.desc}
              </p>
              <div style={{ fontSize: '10px', color: '#A9DDD3', fontWeight: 700 }}>
                +{ach.shardsReward} Shards
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
