'use client';

import React, { useState } from 'react';
import { Zap, Sparkles, Search, Gamepad2, Rocket, Music } from 'lucide-react';
import { QuantumWheel } from './QuantumWheel';
import { SuperconductorRush } from './SuperconductorRush';
import { ZeroFrictionGlide } from './ZeroFrictionGlide';
import { XRayRoast } from './XRayRoast';
import { CyberSoundboard } from './CyberSoundboard';
import { UserProfile } from '@/lib/types';
import { sound } from '@/lib/soundFx';

interface ArcadeHubProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
  onNavigateToBinder?: () => void;
}

type ArcadeSubTab = 'wheel' | 'glide' | 'rush' | 'roast' | 'soundboard';

export const ArcadeHub: React.FC<ArcadeHubProps> = ({ user, onUserUpdate, onNavigateToBinder }) => {
  const [activeSubTab, setActiveSubTab] = useState<ArcadeSubTab>('wheel');

  const handleSwitchTab = (tab: ArcadeSubTab) => {
    sound.playTap();
    setActiveSubTab(tab);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      {/* Top Banner / Lounge Intro */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(169, 221, 211, 0.12) 0%, rgba(4, 8, 7, 0.95) 100%)',
        border: '1px solid rgba(169, 221, 211, 0.28)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'radial-gradient(circle, #102621 0%, #030806 100%)',
            border: '1px solid #A9DDD3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(169, 221, 211, 0.3)',
          }}>
            <Gamepad2 size={28} color="#A9DDD3" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#E8E3D5', margin: 0 }}>
                Quantum Arcade & <span className="gradient-text-rialo">Fun Zone</span>
              </h1>
              <span style={{
                background: 'rgba(169, 221, 211, 0.18)',
                color: '#A9DDD3',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid rgba(169, 221, 211, 0.35)',
              }}>
                PLAY TO EARN
              </span>
            </div>
            <p style={{ color: '#8E9B97', fontSize: '13px', margin: '4px 0 0 0' }}>
              High-action micro-games, endless runner, daily lucky wheel, cyberpunk DJ beats, and viral X roasts.
            </p>
          </div>
        </div>

        {/* User Balance Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(169, 221, 211, 0.25)',
          borderRadius: '16px',
          padding: '10px 18px',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Your Shards</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#A9DDD3' }}>{user?.shards || 0} Shards</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Cards Owned</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#E8E3D5' }}>{user?.totalCardsCount || 0} Cards</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        <button
          type="button"
          onClick={() => handleSwitchTab('wheel')}
          style={{
            padding: '12px 20px',
            borderRadius: '9999px',
            border: activeSubTab === 'wheel' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'wheel' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'wheel' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
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
            padding: '12px 20px',
            borderRadius: '9999px',
            border: activeSubTab === 'glide' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'glide' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'glide' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
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
            padding: '12px 20px',
            borderRadius: '9999px',
            border: activeSubTab === 'rush' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'rush' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'rush' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
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
            padding: '12px 20px',
            borderRadius: '9999px',
            border: activeSubTab === 'soundboard' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'soundboard' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'soundboard' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
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

        <button
          type="button"
          onClick={() => handleSwitchTab('roast')}
          style={{
            padding: '12px 20px',
            borderRadius: '9999px',
            border: activeSubTab === 'roast' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: activeSubTab === 'roast' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: activeSubTab === 'roast' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'roast' ? '0 0 16px rgba(169, 221, 211, 0.25)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Search size={16} /> 🔮 X-Ray Persona Roast
        </button>
      </div>

      {/* Active Tab Component */}
      <div>
        {activeSubTab === 'wheel' && <QuantumWheel user={user} onUserUpdate={onUserUpdate} onNavigateToBinder={onNavigateToBinder} />}
        {activeSubTab === 'glide' && <ZeroFrictionGlide user={user} onUserUpdate={onUserUpdate} />}
        {activeSubTab === 'rush' && <SuperconductorRush user={user} onUserUpdate={onUserUpdate} />}
        {activeSubTab === 'soundboard' && <CyberSoundboard />}
        {activeSubTab === 'roast' && <XRayRoast initialHandle={user?.username || ''} />}
      </div>
    </div>
  );
};
