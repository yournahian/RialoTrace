'use client';

import React, { useEffect } from 'react';
import { sound } from '@/lib/soundFx';
import { TabType } from './NavigationDock';
import { UserProfile } from '@/lib/types';
import {
  X,
  Zap,
  Flame,
  Layers,
  Repeat,
  Trophy,
  Swords,
  Radio,
  Gamepad2,
  Gem,
  User,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile | null;
  currentUsername: string;
  onSwitchAccount?: () => void;
  onLogOut?: () => void;
}

interface NavDrawerItem {
  id: TabType;
  label: string;
  tagline: string;
  badge?: string;
  icon: React.ReactNode;
}

const DRAWER_SECTIONS: { title: string; items: NavDrawerItem[] }[] = [
  {
    title: 'Core Quests & Identity',
    items: [
      {
        id: 'proof',
        label: 'Rialo Proof of Work',
        tagline: 'Track 𝕏 engagement & score',
        icon: <Zap size={18} />,
      },
      {
        id: 'missions',
        label: 'Daily Tasks & Packs',
        tagline: '30 Daily missions & cryogenic reactor',
        badge: 'NEW',
        icon: <Flame size={18} />,
      },
      {
        id: 'profile',
        label: 'Persona & Identity',
        tagline: 'Card showcase & whitelist rank',
        icon: <User size={18} />,
      },
    ],
  },
  {
    title: 'Season 1 TCG Collectibles',
    items: [
      {
        id: 'binder',
        label: 'Digital Card Binder',
        tagline: '30 Season 1 Quantum Archetypes',
        badge: '30 Cards',
        icon: <Layers size={18} />,
      },
      {
        id: 'trades',
        label: 'P2P Trading Market',
        tagline: '0-gas duplicate card swap desk',
        icon: <Repeat size={18} />,
      },
      {
        id: 'versus',
        label: 'Versus Battle Arena',
        tagline: 'Holographic card duels & PvP',
        badge: 'LIVE',
        icon: <Swords size={18} />,
      },
    ],
  },
  {
    title: 'Community, Arcade & Alpha',
    items: [
      {
        id: 'leaderboard',
        label: 'Dynamic Leaderboard',
        tagline: 'Dynamic 10-tier whitelist standings',
        icon: <Trophy size={18} />,
      },
      {
        id: 'arcade',
        label: 'Quantum Arcade & Fun',
        tagline: 'Lucky Wheel, Soundboard & Roast',
        badge: 'HOT',
        icon: <Gamepad2 size={18} />,
      },
      {
        id: 'best_posts',
        label: 'Rialo Gems & Alpha',
        tagline: 'Curated high-signal community posts',
        icon: <Gem size={18} />,
      },
      {
        id: 'radar',
        label: 'Mainnet Radar',
        tagline: 'Zero-friction protocol telemetry',
        icon: <Radio size={18} />,
      },
    ],
  },
];

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  user,
  currentUsername,
  onSwitchAccount,
  onLogOut,
}) => {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
      }}
    >
      {/* Blurred Backdrop */}
      <div
        onClick={() => {
          sound.playTap();
          onClose();
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: 'min(330px, 86vw)',
          height: '100%',
          background: 'linear-gradient(180deg, #070D0B 0%, #030706 100%)',
          borderRight: '1.5px solid rgba(169, 221, 211, 0.25)',
          boxShadow: '10px 0 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(169, 221, 211, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid rgba(169, 221, 211, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(169, 221, 211, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#E8E3D5', letterSpacing: '-0.02em' }}>
              Rialo<span style={{ color: '#A9DDD3' }}>Trace</span>
            </span>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(169, 221, 211, 0.15)',
                color: '#A9DDD3',
                border: '1px solid rgba(169, 221, 211, 0.3)',
              }}
            >
              MENU
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#8E9B97',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* User Quick Identity Pill */}
        {currentUsername && (
          <div
            style={{
              padding: '12px 16px',
              margin: '12px 14px 4px 14px',
              background: 'linear-gradient(135deg, rgba(169, 221, 211, 0.12) 0%, rgba(6, 12, 10, 0.8) 100%)',
              border: '1px solid rgba(169, 221, 211, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid #A9DDD3',
                  boxShadow: '0 0 10px rgba(169, 221, 211, 0.4)',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://unavatar.io/x/${currentUsername}`}
                  alt={currentUsername}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png';
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#FFFFFF' }}>
                    @{currentUsername}
                  </span>
                  <ShieldCheck size={13} color="#A9DDD3" />
                </div>
                <div style={{ fontSize: '10.5px', color: '#A9DDD3', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {user?.shards ?? 100} Shards 💎
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onSelectTab('profile');
                onClose();
              }}
              style={{
                background: 'rgba(169, 221, 211, 0.15)',
                border: '1px solid rgba(169, 221, 211, 0.35)',
                borderRadius: '8px',
                padding: '4px 8px',
                color: '#A9DDD3',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Profile
            </button>
          </div>
        )}

        {/* Scrollable Navigation Sections */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {DRAWER_SECTIONS.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#6B7A75',
                  marginBottom: '6px',
                  paddingLeft: '6px',
                }}
              >
                {section.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => {
                  const isActive = activeTab === item.id || (item.id === 'best_posts' && activeTab === 'terminal');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        onSelectTab(item.id);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(169, 221, 211, 0.2) 0%, rgba(169, 221, 211, 0.05) 100%)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: isActive
                          ? '1.5px solid #A9DDD3'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                        color: isActive ? '#FFFFFF' : '#C7D3CF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            color: isActive ? '#A9DDD3' : '#7D8E89',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: isActive ? 800 : 700,
                                color: isActive ? '#FFFFFF' : '#E8E3D5',
                              }}
                            >
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: 900,
                                  background: item.badge === 'HOT' || item.badge === 'LIVE'
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : 'rgba(169, 221, 211, 0.15)',
                                  color: item.badge === 'HOT' || item.badge === 'LIVE' ? '#EF4444' : '#A9DDD3',
                                  border: item.badge === 'HOT' || item.badge === 'LIVE'
                                    ? '1px solid rgba(239, 68, 68, 0.4)'
                                    : '1px solid rgba(169, 221, 211, 0.35)',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: isActive ? '#A9DDD3' : '#73837F',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '1px',
                            }}
                          >
                            {item.tagline}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        size={15}
                        color={isActive ? '#A9DDD3' : '#4E5C58'}
                        style={{ flexShrink: 0, marginLeft: '6px' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid rgba(169, 221, 211, 0.15)',
            background: 'rgba(2, 6, 5, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {onSwitchAccount && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onSwitchAccount();
                onClose();
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#C7D3CF',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Switch Acc
            </button>
          )}

          {onLogOut && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onLogOut();
                onClose();
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                color: '#EF4444',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
