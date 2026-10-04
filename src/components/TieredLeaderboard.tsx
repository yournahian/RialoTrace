'use client';

import React, { useState, useEffect } from 'react';
import { WhitelistTierInfo } from '@/lib/types';
import { WHITELIST_TIERS } from '@/lib/tiers';
import { Trophy, Users, Shield, Award, Sparkles, Filter } from 'lucide-react';

interface RankedUser {
  rank: number;
  username: string;
  uniqueCardsCount: number;
  totalCardsCount: number;
  lifetimePoints: number;
  streakDays: number;
  shards: number;
  tierInfo: WhitelistTierInfo;
}

interface TieredLeaderboardProps {
  currentUsername?: string;
}

export const TieredLeaderboard: React.FC<TieredLeaderboardProps> = ({ currentUsername }) => {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedTierFilter, setSelectedTierFilter] = useState<number | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else if (users.length === 0) setLoading(true);

      const res = await fetch(`/api/leaderboard?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotalUsers(data.totalUsers || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Live poll every 8 seconds so newly joined questers appear live on the leaderboard!
    const interval = setInterval(() => {
      fetchLeaderboard(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUsername]);

  const filtered = selectedTierFilter !== null
    ? users.filter((u) => u.tierInfo?.tierNumber === selectedTierFilter)
    : users;

  return (
    <div className="tcg-container">
      {/* Top Banner */}
      <div className="tcg-header">
        <div>
          <div className="tcg-eyebrow">
            <Trophy size={14} /> Season 1 & Lifetime Whitelist Standings
          </div>
          <h2 className="tcg-title">
            Dynamic 10-Tier <span className="gradient-text-rialo">Whitelist Leaderboard</span>
          </h2>
          <p className="tcg-subtitle">
            Tiers dynamically scale with total participants ({totalUsers} Registered). Full 30/30 collectors secure Tier 1 Guaranteed Free Mint!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchLeaderboard(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(169, 221, 211, 0.1)',
              border: '1px solid rgba(169, 221, 211, 0.3)',
              color: '#A9DDD3',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Refresh Leaderboard"
          >
            <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            <span>{isRefreshing ? 'Syncing...' : 'Live Sync'}</span>
          </button>
          <div className="tcg-stats-pill">
            <div className="tcg-stat-item" style={{ color: 'var(--arc-cyan)' }}>
              <Users size={16} />
              <span>{totalUsers} Active Questers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Tier Filter Pills */}
      <div className="tier-filter-row">
        <button
          type="button"
          onClick={() => setSelectedTierFilter(null)}
          className={`tier-pill-btn ${selectedTierFilter === null ? 'active' : ''}`}
        >
          All Tiers
        </button>
        {WHITELIST_TIERS.map((t) => {
          const isSelected = selectedTierFilter === t.tierNumber;
          return (
            <button
              key={t.tierNumber}
              type="button"
              onClick={() => setSelectedTierFilter(isSelected ? null : t.tierNumber)}
              className={`tier-pill-btn ${isSelected ? 'active' : ''}`}
              style={{
                borderColor: isSelected ? t.badgeColor : undefined,
                color: isSelected ? '#FFFFFF' : undefined,
              }}
            >
              <span>{t.badgeEmoji}</span>
              <span style={{ color: t.badgeColor }}>T{t.tierNumber}: {t.title}</span>
              <span style={{ fontSize: '10px', opacity: 0.65 }}>({t.percentileText})</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Unique Cards</th>
              <th>Lifetime Points</th>
              <th style={{ whiteSpace: 'nowrap', minWidth: '220px' }}>Dynamic Whitelist Tier</th>
              <th style={{ whiteSpace: 'nowrap', minWidth: '240px' }}>Mainnet Reward Ticket</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--rialo-text-dim)' }}>
                  Computing dynamic percentiles and ranks...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--rialo-text-dim)' }}>
                  No users found in this tier bracket.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isMe = currentUsername && currentUsername.replace('@', '').toLowerCase() === u.username.toLowerCase();
                return (
                  <tr
                    key={u.username}
                    className={isMe ? 'is-me' : ''}
                  >
                    {/* Rank */}
                    <td style={{ fontWeight: 800 }}>
                      {u.rank === 1 ? (
                        <span style={{ color: '#A9DDD3', display: 'inline-flex', alignItems: 'center', gap: '4px', textShadow: '0 0 12px rgba(169, 221, 211, 0.5)' }}>
                          👑 #1
                        </span>
                      ) : u.rank === 2 ? (
                        <span style={{ color: '#E8E3D5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          🥈 #2
                        </span>
                      ) : u.rank === 3 ? (
                        <span style={{ color: 'rgba(232, 227, 213, 0.75)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          🥉 #3
                        </span>
                      ) : (
                        <span style={{ color: 'var(--rialo-text-muted)' }}>#{u.rank}</span>
                      )}
                    </td>

                    {/* Username */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#FFFFFF' }}>@{u.username}</span>
                        {isMe && (
                          <span
                            style={{
                              padding: '2px 6px',
                              fontSize: '9px',
                              fontWeight: 800,
                              background: 'rgba(169, 221, 211, 0.15)',
                              color: 'var(--arc-cyan)',
                              border: '1px solid rgba(169, 221, 211, 0.35)',
                              borderRadius: '6px',
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unique Cards */}
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--arc-cyan)' }}>
                        {u.uniqueCardsCount}/30
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--rialo-text-dim)', marginLeft: '4px' }}>
                        ({u.totalCardsCount} total)
                      </span>
                    </td>

                    {/* Lifetime Points */}
                    <td>
                      <span style={{ fontWeight: 800, color: '#FFFFFF' }}>
                        {u.lifetimePoints.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--rialo-text-dim)', marginLeft: '4px' }}>
                        PTS
                      </span>
                    </td>

                    {/* Dynamic Whitelist Tier */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: `${u.tierInfo?.badgeColor}12`,
                          border: `1px solid ${u.tierInfo?.badgeColor}30`,
                          whiteSpace: 'nowrap',
                          flexWrap: 'nowrap',
                        }}
                      >
                        <span style={{ fontSize: '13px', flexShrink: 0 }}>{u.tierInfo?.badgeEmoji}</span>
                        <span style={{ color: u.tierInfo?.badgeColor, fontWeight: 700, fontSize: '12px', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                          {u.tierInfo?.title}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--rialo-text-dim)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          ({u.tierInfo?.percentileText})
                        </span>
                      </div>
                    </td>

                    {/* Mainnet Ticket */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className="tier-ticket-tag"
                        style={{
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          color: u.tierInfo?.badgeColor,
                          borderColor: `${u.tierInfo?.badgeColor}40`,
                          background: `${u.tierInfo?.badgeColor}10`,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={11} color={u.tierInfo?.badgeColor} />
                        <span>{u.tierInfo?.ticketName}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
