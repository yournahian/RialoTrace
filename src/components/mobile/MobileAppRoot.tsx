'use client';

import React, { useState } from 'react';
import { TabType } from '../NavigationDock';
import { UserProfile, CardArchetype } from '@/lib/types';
import { MobileHeader } from './MobileHeader';
import { MobileBinderView } from './MobileBinderView';
import { MobileNavDrawer } from '../MobileNavDrawer';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenProfile={() => onSelectTab('profile')}
      />

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
      </main>

      {/* 5. Mobile Drawer Menu */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        user={currentUser}
        currentUsername={currentUsername}
        onSwitchAccount={onSwitchAccount}
        onLogOut={onLogOut}
      />

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
