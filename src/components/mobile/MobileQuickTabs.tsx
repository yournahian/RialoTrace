'use client';

import React, { useRef, useEffect } from 'react';
import { TabType } from '../NavigationDock';
import { sound } from '@/lib/soundFx';
import {
  Zap,
  Target,
  Layers,
  Repeat,
  Trophy,
  Gamepad2,
  Swords,
  Radio,
  Gem,
  User,
} from 'lucide-react';

interface MobileQuickTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'proof', label: 'PoW', icon: <Zap size={13} /> },
  { id: 'missions', label: 'Quests', icon: <Target size={13} /> },
  { id: 'binder', label: 'Binder', icon: <Layers size={13} /> },
  { id: 'trades', label: 'P2P', icon: <Repeat size={13} /> },
  { id: 'leaderboard', label: 'Ranks', icon: <Trophy size={13} /> },
  { id: 'arcade', label: 'Arcade', icon: <Gamepad2 size={13} /> },
  { id: 'versus', label: 'Versus', icon: <Swords size={13} /> },
  { id: 'radar', label: 'Radar', icon: <Radio size={13} /> },
  { id: 'best_posts', label: 'Gems', icon: <Gem size={13} /> },
  { id: 'profile', label: 'Profile', icon: <User size={13} /> },
];

export const MobileQuickTabs: React.FC<MobileQuickTabsProps> = ({ activeTab, onSelectTab }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        background: 'rgba(5, 9, 8, 0.95)',
        borderBottom: '1px solid rgba(169, 221, 211, 0.12)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: 'sticky',
        top: '52px',
        zIndex: 40,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-active={isActive ? 'true' : 'false'}
            type="button"
            onClick={() => {
              sound.playTap();
              onSelectTab(tab.id);
            }}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '9999px',
              background: isActive
                ? 'linear-gradient(135deg, rgba(169, 221, 211, 0.25) 0%, rgba(169, 221, 211, 0.1) 100%)'
                : 'rgba(255, 255, 255, 0.04)',
              border: isActive ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.08)',
              color: isActive ? '#A9DDD3' : '#8E9B97',
              fontSize: '11.5px',
              fontWeight: isActive ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 0 12px rgba(169, 221, 211, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
