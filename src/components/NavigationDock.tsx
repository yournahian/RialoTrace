import { sound } from '@/lib/soundFx';
import React from 'react';

export type TabType =
  | 'proof'
  | 'missions'
  | 'binder'
  | 'trades'
  | 'leaderboard'
  | 'cards'
  | 'versus'
  | 'radar'
  | 'terminal'
  | 'best_posts'
  | 'arcade'
  | 'trophies'
  | 'profile';

interface NavigationDockProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const NAV_ITEMS: Array<{
  id: TabType;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}> = [
  {
    id: 'proof',
    label: 'Rialo Proof of Work',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.53 3h3.2l-7 8 8.23 10.75h-6.44l-5.05-6.6-5.78 6.6H1.5l7.49-8.56L1.1 3h6.6l4.56 6.03zm-1.12 16.9h1.77L7.68 4.98H5.78z" />
      </svg>
    ),
  },
  {
    id: 'missions',
    label: 'Daily Tasks & Gacha Pack',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'binder',
    label: 'Digital Collector Album (30 Cards)',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: 'trades',
    label: 'P2P Trading Market',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: '10-Tier Whitelist Leaderboard',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
        <path d="M18 14.66V17c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-2.34" />
        <path d="M14 14.66V22" />
        <path d="M10 22v-4" />
        <path d="M12 2a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
      </svg>
    ),
  },
  {
    id: 'versus',
    label: 'Versus Arena',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.5 17.5 5 5" />
        <path d="m22 22-5-5" />
        <path d="M8.5 8.5 3.5 3.5" />
        <path d="M2 2l5 5" />
        <path d="m14 10 4-4a3 3 0 0 0-4-4l-4 4" />
        <path d="m6 18 4 4a3 3 0 0 0 4-4l-4-4" />
      </svg>
    ),
  },
  {
    id: 'radar',
    label: 'Mainnet Radar',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'arcade',
    label: 'Quantum Arcade & Fun Zone (Play & Earn)',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
      </svg>
    ),
  },
  {
    id: 'best_posts',
    label: 'Rialo Gems & Best Posts',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M11 3 8 9l4 12 4-12-3-6" />
        <path d="M2 9h20" />
      </svg>
    ),
  }
];

export const NavigationDock: React.FC<NavigationDockProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav className="nav-dock" aria-label="Main Navigation">
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'best_posts' && activeTab === 'terminal') ;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => { sound.playTap(); onSelectTab(item.id); }}
                className={`dock-btn ${isActive ? 'active' : ''}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="dock-icon">{item.icon(isActive)}</span>
                <span className="tooltip">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
