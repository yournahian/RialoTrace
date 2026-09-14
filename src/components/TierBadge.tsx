import React from 'react';

export interface TierInfo {
  name: string;
  badge: string;
  color: string;
  bg: string;
  border: string;
  rank: number;
}

export function getContributorTier(impressions: number): TierInfo {
  if (impressions >= 200000) {
    return {
      name: 'Rialo Legend',
      badge: '💎',
      color: '#00E5FF',
      bg: 'rgba(0, 229, 255, 0.12)',
      border: 'rgba(0, 229, 255, 0.4)',
      rank: 4,
    };
  }
  if (impressions >= 50000) {
    return {
      name: 'Rialo Champion',
      badge: '🥇',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.4)',
      rank: 3,
    };
  }
  if (impressions >= 10000) {
    return {
      name: 'Rialo Builder',
      badge: '🥈',
      color: '#ACC6E9',
      bg: 'rgba(172, 198, 233, 0.12)',
      border: 'rgba(172, 198, 233, 0.35)',
      rank: 2,
    };
  }
  return {
    name: 'Rialo Explorer',
    badge: '🥉',
    color: '#D97706',
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.35)',
    rank: 1,
  };
}

export const TierBadge: React.FC<{ impressions: number }> = ({ impressions }) => {
  const tier = getContributorTier(impressions);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        background: tier.bg,
        border: `1px solid ${tier.border}`,
        color: tier.color,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        boxShadow: `0 0 15px ${tier.bg}`,
      }}
    >
      <span>{tier.badge}</span>
      <span>{tier.name}</span>
    </div>
  );
};
