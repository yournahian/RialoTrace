'use client';

import React, { useState } from 'react';
import { Zap, Sparkles, Search, Gamepad2, Rocket, Music } from 'lucide-react';
import { QuantumWheel } from './QuantumWheel';
import { SuperconductorRush } from './SuperconductorRush';
import { ZeroFrictionGlide } from './ZeroFrictionGlide';
import { CyberSoundboard } from './CyberSoundboard';
import { UserProfile } from '@/lib/types';
import { sound } from '@/lib/soundFx';

interface ArcadeHubProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
  onNavigateToBinder?: () => void;
}

type ArcadeSubTab = 'wheel' | 'glide' | 'rush' | 'soundboard';

export const ArcadeHub: React.FC<ArcadeHubProps> = ({ user, onUserUpdate, onNavigateToBinder }) => {
  const [activeSubTab, setActiveSubTab] = useState<ArcadeSubTab>('wheel');

  const handleSwitchTab = (tab: ArcadeSubTab) => {
    sound.playTap();
    setActiveSubTab(tab);
  };

  return (
    <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', padding: '10px 0 70px 0', boxSizing: 'border-box' }}>
      {/* Top Banner - Unified Centered Architecture */}
      <div className="tcg-header" style={{ marginBottom: '10px', paddingBottom: '8px' }}>
        <div className="tcg-eyebrow">
          <Gamepad2 size={13} /> PLAY TO EARN // ARCADE ZONE
        </div>
        <h1 className="tcg-title">
          Quantum Arcade & <span className="gradient-text-rialo">Fun Zone</span>
        </h1>
        <p className="tcg-subtitle">
          High-action micro-games, endless runner, daily lucky wheel, cyberpunk DJ beats, and viral X roasts.
        </p>

        {/* User Balance Badge - Centered */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(169, 221, 211, 0.25)',
          borderRadius: '9999px',
          padding: '4px 16px',
          marginTop: '4px',
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#A9DDD3', fontWeight: 800 }}>
            💎 {user?.shards || 0} Shards
          </span>
          <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#E8E3D5', fontWeight: 800 }}>
            🎴 {user?.totalCardsCount || 0} Cards Owned
          </span>
        </div>
      </div>

      {/* Sub-Navigation Pills - Centered & Compact */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '10px',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          onClick={() => handleSwitchTab('wheel')}
          style={{
            padding: '7px 15px',
            borderRadius: '9999px',
            border: activeSubTab === 'wheel' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'wheel' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'wheel' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'wheel' ? '0 0 16px rgba(169, 221, 211, 0.25)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Sparkles size={16} /> 🎰 Quantum Lucky Wheel
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab('glide')}
          style={{
            padding: '7px 15px',
            borderRadius: '9999px',
            border: activeSubTab === 'glide' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'glide' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'glide' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'glide' ? '0 0 16px rgba(169, 221, 211, 0.25)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Rocket size={16} /> 🚀 Zero-Friction Glide
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab('rush')}
          style={{
            padding: '7px 15px',
            borderRadius: '9999px',
            border: activeSubTab === 'rush' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'rush' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'rush' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'rush' ? '0 0 16px rgba(169, 221, 211, 0.25)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Zap size={16} /> ⚡ Superconductor Rush (30s)
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab('soundboard')}
          style={{
            padding: '7px 15px',
            borderRadius: '9999px',
            border: activeSubTab === 'soundboard' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'soundboard' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'soundboard' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'soundboard' ? '0 0 16px rgba(169, 221, 211, 0.25)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Music size={16} /> 🎹 Cyber DJ Soundboard
        </button>

      </div>

      {/* Active Tab Component */}
      <div>
        {activeSubTab === 'wheel' && <QuantumWheel user={user} onUserUpdate={onUserUpdate} onNavigateToBinder={onNavigateToBinder} />}
        {activeSubTab === 'glide' && <ZeroFrictionGlide user={user} onUserUpdate={onUserUpdate} />}
        {activeSubTab === 'rush' && <SuperconductorRush user={user} onUserUpdate={onUserUpdate} />}
        {activeSubTab === 'soundboard' && <CyberSoundboard />}
      </div>
    </div>
  );
};
