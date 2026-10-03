'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, CheckCircle2, Lock, Gift, ShieldAlert, Award, Clock } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';

interface CryoStreakVaultProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
}

const STREAK_DAYS = [
  { day: 1, title: 'Day 1', reward: '+15 Shards', icon: '⚡', desc: 'Initiation pulse' },
  { day: 2, title: 'Day 2', reward: '+25 Shards', icon: '⚡', desc: 'Lattice resonance' },
  { day: 3, title: 'Day 3', reward: 'Genesis Pack 🎴', icon: '🎴', desc: 'Card pack drop' },
  { day: 4, title: 'Day 4', reward: '+50 Shards', icon: '⚡', desc: 'Deep cooling' },
  { day: 5, title: 'Day 5', reward: '2x Booster 🚀', icon: '🚀', desc: 'Double multipliers' },
  { day: 6, title: 'Day 6', reward: '+100 Shards', icon: '⚡', desc: 'Superfluid surge' },
  { day: 7, title: 'Day 7', reward: 'Mystery Vault 🏆', icon: '💎', desc: 'Holo Card + 250 Shards!' },
];

export const CryoStreakVault: React.FC<CryoStreakVaultProps> = ({ user, onUserUpdate }) => {
  const [streakDay, setStreakDay] = useState<number>(1);
  const [canClaim, setCanClaim] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStreakStatus = async () => {
    if (!user?.username) return;
    try {
      const res = await fetch(`/api/arcade?username=${encodeURIComponent(user.username)}`);
      const data = await res.json();
      if (data.success) {
        setStreakDay(data.streakDay || 1);
        setCanClaim(data.canClaimStreak);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStreakStatus();
  }, [user?.username]);

  const handleClaimStreak = async () => {
    if (!user?.username || claiming || !canClaim) return;
    setErrorMsg(null);
    setClaiming(true);
    sound.playTap();

    try {
      const res = await fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLAIM_STREAK',
          username: user.username,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Failed to claim');
        setClaiming(false);
        return;
      }

      setClaimedReward(data.reward);
      setCanClaim(false);
      setStreakDay(data.nextDay);
      sound.playJackpot();

      if (data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 14, 12, 0.95) 0%, rgba(2, 5, 4, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.25)',
      borderRadius: '24px',
      padding: '28px 22px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      marginBottom: '28px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            background: 'rgba(169, 221, 211, 0.08)',
            border: '1px solid rgba(169, 221, 211, 0.3)',
            borderRadius: '9999px',
            color: '#A9DDD3',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '6px',
          }}>
            <Sparkles size={13} /> Daily Cryogenic Reactor
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#E8E3D5', margin: 0 }}>
            7-Day Streak & <span className="gradient-text-rialo">Mystery Vault</span>
          </h3>
          <p style={{ fontSize: '13px', color: '#8E9B97', margin: '4px 0 0 0' }}>
            Check in consecutively for 7 days to unlock the Grand Mystery Vault with a guaranteed Holographic Card!
          </p>
        </div>

        {/* Action Button */}
        <div>
          {canClaim ? (
            <button
              type="button"
              disabled={claiming}
              onClick={handleClaimStreak}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
                color: '#010101',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 25px rgba(169, 221, 211, 0.5)',
                transition: 'all 0.2s',
              }}
            >
              <Gift size={16} />
              <span>{claiming ? 'Extracting Shards...' : `CLAIM DAY ${streakDay} REWARD`}</span>
            </button>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(169, 221, 211, 0.3)',
              borderRadius: '9999px',
              color: '#A9DDD3',
              fontSize: '13px',
              fontWeight: '700',
            }}>
              <CheckCircle2 size={16} color="#A9DDD3" />
              <span>Day {streakDay > 1 ? streakDay - 1 : 7} Claimed Today</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#f87171',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          {errorMsg}
        </div>
      )}

      {/* 7-Day Cylinders Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
        gap: '12px',
      }}>
        {STREAK_DAYS.map((item) => {
          const isCompleted = item.day < streakDay || (!canClaim && item.day === streakDay - 1);
          const isCurrent = item.day === streakDay && canClaim;
          const isLocked = item.day > streakDay || (!canClaim && item.day >= streakDay);

          return (
            <div
              key={item.day}
              style={{
                background: isCurrent
                  ? 'radial-gradient(circle, rgba(169, 221, 211, 0.15) 0%, rgba(6, 16, 13, 0.95) 100%)'
                  : (isCompleted ? 'rgba(169, 221, 211, 0.06)' : 'rgba(255, 255, 255, 0.02)'),
                border: isCurrent
                  ? '2px solid #A9DDD3'
                  : (isCompleted ? '1px solid rgba(169, 221, 211, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'),
                borderRadius: '18px',
                padding: '16px 10px',
                textAlign: 'center',
                boxShadow: isCurrent ? '0 0 20px rgba(169, 221, 211, 0.35)' : 'none',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              {isCompleted && (
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <CheckCircle2 size={14} color="#A9DDD3" />
                </div>
              )}

              {isLocked && item.day !== 7 && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#556662' }}>
                  <Lock size={12} />
                </div>
              )}

              <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                {item.icon}
              </div>

              <div style={{ fontSize: '11px', color: '#8E9B97', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {item.title}
              </div>

              <div style={{ fontSize: '13px', fontWeight: '900', color: isCurrent || isCompleted ? '#A9DDD3' : '#FFFFFF', margin: '4px 0' }}>
                {item.reward}
              </div>

              <div style={{ fontSize: '10px', color: '#667773' }}>
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
