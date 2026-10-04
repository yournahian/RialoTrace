'use client';

import React from 'react';
import { TabType } from '../NavigationDock';
import { sound } from '@/lib/soundFx';
import {
  Zap,
  Flame,
  Layers,
  Repeat,
  Gamepad2,
  Trophy,
} from 'lucide-react';

interface MobileTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'proof',
    label: 'PoW',
    icon: (active) => <Zap size={18} color={active ? '#A9DDD3' : '#6B7A75'} />,
  },
  {
    id: 'missions',
    label: 'Quests',
    icon: (active) => <Flame size={18} color={active ? '#A9DDD3' : '#6B7A75'} />,
  },
  {
    id: 'binder',
    label: 'Binder',
    icon: (active) => <Layers size={18} color={active ? '#A9DDD3' : '#6B7A75'} />,
  },
  {
    id: 'trades',
    label: 'P2P',
    icon: (active) => <Repeat size={18} color={active ? '#A9DDD3' : '#6B7A75'} />,
  },
  {
    id: 'arcade',
    label: 'Arcade',
    icon: (active) => <Gamepad2 size={18} color={active ? '#A9DDD3' : '#6B7A75'} />,
  },
];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(5, 9, 8, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(169, 221, 211, 0.18)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxSizing: 'border-box',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.playTap();
              onSelectTab(tab.id);
            }}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 0',
              outline: 'none',
            }}
          >
            {/* Glowing top line for active tab */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '2px',
                  background: '#A9DDD3',
                  borderRadius: '2px',
                  boxShadow: '0 0 10px #A9DDD3',
                }}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tab.icon(isActive)}
            </div>

            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#A9DDD3' : '#6B7A75',
                letterSpacing: '0.02em',
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
