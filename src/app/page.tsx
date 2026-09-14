'use client';

import React, { useState } from 'react';
import { NavigationDock, TabType } from '@/components/NavigationDock';
import { ProofOfWork } from '@/components/ProofOfWork';
import { RialoCards } from '@/components/RialoCards';
import { VersusArena } from '@/components/VersusArena';
import { MainnetRadar } from '@/components/MainnetRadar';
import { RialoGems } from '@/components/RialoGems';
import { TopRialoPosts } from '@/components/TopRialoPosts';
import { RialoLogo } from '@/components/RialoLogo';
import { FollowGate } from '@/components/FollowGate';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('proof');

  return (
    <div className="app-viewport">
      <FollowGate />

      <header className="app-header">
        <div className="brand-link">
          <div className="brand-badge">
            <RialoLogo size={20} />
            <span className="brand-name" style={{ marginLeft: '4px' }}>Trace</span>
            <span className="brand-pill">Network</span>
          </div>
        </div>

        <div className="header-right">
          <a
            href="https://rialo.io"
            target="_blank"
            rel="noopener noreferrer"
            className="rialo-status-chip"
            title="Rialo Network Official"
          >
            <span className="pulse-dot" />
            <span>rialo.io</span>
          </a>
        </div>
      </header>

      <NavigationDock activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      <main className="main-stage">
        {activeTab === 'proof' && <ProofOfWork />}
        {activeTab === 'cards' && <RialoCards />}
        {activeTab === 'versus' && <VersusArena />}
        {activeTab === 'radar' && <MainnetRadar />}
        {activeTab === 'terminal' && <RialoGems />}
        {activeTab === 'best_posts' && <TopRialoPosts />}
      </main>
    </div>
  );
}
