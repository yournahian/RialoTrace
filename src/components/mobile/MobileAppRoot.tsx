'use client';

import React, { useState } from 'react';
import { TabType } from '../NavigationDock';
import { UserProfile, CardArchetype } from '@/lib/types';
import { MobileHeader } from './MobileHeader';
import { MobileBinderView } from './MobileBinderView';
import { MobileQuickTabs } from './MobileQuickTabs';
import { MobileNotificationsSheet } from './MobileNotificationsSheet';

// Tab Components
import { ProofOfWork } from '../ProofOfWork';
import { DailyMissions } from '../DailyMissions';
import { CardBinder } from '../CardBinder';
import { TradeMarket } from '../TradeMarket';
import { TieredLeaderboard } from '../TieredLeaderboard';
import { VersusArena } from '../VersusArena';
import { MainnetRadar } from '../MainnetRadar';
import { ArcadeHub } from '../ArcadeHub';
import { TopRialoPosts } from '../TopRialoPosts';
import { ProfileSection } from '../ProfileSection';
import { RialoCards } from '../RialoCards';
import { BroadcastNoticeBanner } from '../BroadcastNoticeBanner';

interface MobileAppRootProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: UserProfile | null;
  currentUsername: string;
  newlyPulledCards: CardArchetype[] | null;
  onClearNewlyPulledCards: () => void;
  onNavigateToBinder: () => void;
  onOpenPackInRialoCards: (cards: CardArchetype[]) => void;
  onSelectCardForTrade: (cardId: string) => void;
  onUserUpdate: (user: UserProfile) => void;
  onSwitchAccount: () => void;
  onLogOut: () => void;
}

export const MobileAppRoot: React.FC<MobileAppRootProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  currentUsername,
  newlyPulledCards,
  onClearNewlyPulledCards,
  onNavigateToBinder,
  onOpenPackInRialoCards,
  onSelectCardForTrade,
  onUserUpdate,
  onSwitchAccount,
  onLogOut,
}) => {
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  return (
    <div
      className="mobile-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: '#040706',
        color: '#FFFFFF',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Mobile Top Sticky Header */}
      <MobileHeader
        user={currentUser}
        currentUsername={currentUsername}
        unreadNotifsCount={0}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenProfile={() => onSelectTab('profile')}
      />

      {/* 2. Top Quick-Tab Scroller (Instant 1-Tap Switching) */}
      <MobileQuickTabs activeTab={activeTab} onSelectTab={onSelectTab} />

      {/* 2. Global Persistent Notice Banner */}
      <BroadcastNoticeBanner
        currentUsername={currentUsername}
        currentUser={currentUser}
        onUserUpdate={onUserUpdate}
      />

      {/* 3. Main Stage Container for Active Tab */}
      <main
        style={{
          flex: 1,
          padding: '12px 10px 40px 10px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
        }}
      >
        {activeTab === 'proof' && <ProofOfWork currentUsername={currentUsername} />}

        {activeTab === 'missions' && (
          <DailyMissions
            username={currentUsername}
            onUserDataUpdate={onUserUpdate}
            onOpenPackInRialoCards={onOpenPackInRialoCards}
            onNavigateToBinder={onNavigateToBinder}
            onRequireConnect={onSwitchAccount}
          />
        )}

        {activeTab === 'binder' && (
          <MobileBinderView
            user={currentUser}
            onUserUpdate={onUserUpdate}
            onSelectForTrade={onSelectCardForTrade}
          />
        )}

        {activeTab === 'trades' && (
          <TradeMarket
            user={currentUser}
            onUserUpdate={onUserUpdate}
            onNavigateToBinder={onNavigateToBinder}
          />
        )}

        {activeTab === 'leaderboard' && (
          <TieredLeaderboard currentUsername={currentUsername} />
        )}

        {activeTab === 'cards' && (
          <RialoCards
            user={currentUser}
            newlyPulledCards={newlyPulledCards}
            onClearNewlyPulledCards={onClearNewlyPulledCards}
            onNavigateToBinder={onNavigateToBinder}
            onUserUpdate={onUserUpdate}
          />
        )}

        {activeTab === 'versus' && <VersusArena />}

        {activeTab === 'radar' && <MainnetRadar />}

        {(activeTab === 'best_posts' || activeTab === 'terminal') && (
          <TopRialoPosts currentUsername={currentUsername} />
        )}

        {(activeTab === 'profile' || activeTab === 'trophies') && (
          <ProfileSection
            user={currentUser}
            onSelectTab={onSelectTab}
            onLogOut={onLogOut}
            onSwitchAccount={onSwitchAccount}
            onUserUpdate={onUserUpdate}
          />
        )}

        {activeTab === 'arcade' && (
          <ArcadeHub
            user={currentUser}
            onUserUpdate={onUserUpdate}
            onNavigateToBinder={onNavigateToBinder}
          />
        )}

        {/* Mobile Footer Disclaimer */}
        <footer
          style={{
            marginTop: '40px',
            marginBottom: '70px',
            padding: '20px 14px',
            borderTop: '1px solid rgba(169, 221, 211, 0.1)',
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(232, 227, 213, 0.45)',
            fontFamily: "'Space Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>© 2026 RIALOTRACE</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#F87171', fontWeight: 700 }}>NOT AFFILIATED WITH RIALO.IO</span>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(232, 227, 213, 0.35)', lineHeight: '1.4' }}>
            Independent community terminal. Not affiliated with rialo.io or Subzero Labs.
          </div>
        </footer>
      </main>



      {/* 6. Mobile Notifications Bottom Sheet */}
      <MobileNotificationsSheet
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        currentUsername={currentUsername}
        onSelectTab={onSelectTab}
      />
    </div>
  );
};
