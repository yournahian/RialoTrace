'use strict';
import React from 'react';

export type TabType = 'proof' | 'cards' | 'versus' | 'radar' | 'terminal' | 'best_posts';

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
    id: 'cards',
    label: 'Rialo Cards (Collectibles)',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="m12 11 2 4H10l2-4Z" />
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
    id: 'terminal',
    label: 'Rialo Gems (Top Voices)',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    ),
  },
  {
    id: 'best_posts',
    label: 'Best Posts About Rialo',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export const NavigationDock: React.FC<NavigationDockProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav className="nav-dock" aria-label="Main Navigation">
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`dock-btn ${isActive ? 'active' : ''}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon(isActive)}
                <span className="tooltip">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
