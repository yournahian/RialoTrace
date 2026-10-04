'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Square, Sparkles, Disc, Music } from 'lucide-react';
import { sound } from '@/lib/soundFx';

interface SoundPad {
  id: number;
  label: string;
  category: 'beat' | 'bass' | 'synth' | 'fx';
  color: string;
  action: () => void;
}

export const CyberSoundboard: React.FC = () => {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const loopIntervalRef = useRef<any>(null);

  const pads: SoundPad[] = [
    // ROW 1: DRUMS
    { id: 1, label: 'KICK 808', category: 'beat', color: '#A9DDD3', action: () => sound.playKick() },
    { id: 2, label: 'CRISP SNARE', category: 'beat', color: '#A9DDD3', action: () => sound.playSnare() },
    { id: 3, label: 'CYBER HI-HAT', category: 'beat', color: '#A9DDD3', action: () => sound.playHiHat() },
    { id: 4, label: 'CRYOGENIC CHIME', category: 'fx', color: '#E8E3D5', action: () => sound.playSuccess() },

    // ROW 2: BASS
    { id: 5, label: 'SUB 45Hz', category: 'bass', color: '#76c0b2', action: () => sound.play808(45) },
    { id: 6, label: 'SUB 55Hz', category: 'bass', color: '#76c0b2', action: () => sound.play808(55) },
    { id: 7, label: 'SUB 65Hz', category: 'bass', color: '#76c0b2', action: () => sound.play808(65) },
    { id: 8, label: 'SUB 85Hz', category: 'bass', color: '#76c0b2', action: () => sound.play808(85) },

    // ROW 3: SYNTH & LASER
    { id: 9, label: 'MEISSNER ZAP', category: 'synth', color: '#E8E3D5', action: () => sound.playZap(1) },
    { id: 10, label: 'WARP LASER', category: 'synth', color: '#E8E3D5', action: () => sound.playLaser(880) },
    { id: 11, label: 'HYPER ZAP', category: 'synth', color: '#E8E3D5', action: () => sound.playZap(2) },
    { id: 12, label: 'SHARD ORB', category: 'fx', color: '#A9DDD3', action: () => sound.playPickup() },

    // ROW 4: FX & DROPS
    { id: 13, label: 'ANVIL FORGE', category: 'fx', color: '#76c0b2', action: () => sound.playForge() },
    { id: 14, label: 'RAIN CHIME', category: 'fx', color: '#76c0b2', action: () => sound.playRainChime() },
    { id: 15, label: 'JACKPOT FANFARE', category: 'fx', color: '#E8E3D5', action: () => sound.playJackpot() },
    { id: 16, label: 'CRASH DROP', category: 'fx', color: '#A9DDD3', action: () => sound.playCrash() },
  ];

  const handlePadPress = (pad: SoundPad) => {
    setActivePad(pad.id);
    pad.action();
    if (typeof window !== 'undefined') {
      const clean = (localStorage.getItem('rialo_active_user') || '').toLowerCase().replace('@', '');
      localStorage.setItem(`rialo_dj_pad_used_${clean}`, 'true');
      window.dispatchEvent(new Event('rialo_arcade_activity'));
    }
    setTimeout(() => setActivePad(null), 150);
  };

  const toggleLoop = () => {
    sound.playTap();
    if (isLooping) {
      clearInterval(loopIntervalRef.current);
      setIsLooping(false);
    } else {
      setIsLooping(true);
      if (typeof window !== 'undefined') {
        const clean = (localStorage.getItem('rialo_active_user') || '').toLowerCase().replace('@', '');
        localStorage.setItem(`rialo_arpeggiator_loop_used_${clean}`, 'true');
        window.dispatchEvent(new Event('rialo_arcade_activity'));
      }
      let step = 0;
      loopIntervalRef.current = setInterval(() => {
        if (step % 4 === 0) sound.playKick();
        if (step % 4 === 2) sound.playSnare();
        if (step % 2 === 1) sound.playHiHat();
        if (step % 8 === 0) sound.play808(55);
        step++;
      }, 250); // 120 BPM groove
    }
  };

  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    };
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 14, 12, 0.95) 0%, rgba(2, 5, 4, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.25)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      position: 'relative',
    }}>
      {/* Title - Unified Centered Architecture */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          background: 'rgba(169, 221, 211, 0.08)',
          border: '1px solid rgba(169, 221, 211, 0.3)',
          borderRadius: '9999px',
          color: '#A9DDD3',
          fontSize: '11px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px',
        }}>
          <Music size={13} /> Cyberpunk DJ Station
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0' }}>
          Rialo DJ Soundboard & <span className="gradient-text-rialo">Beat Pad</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '13px', margin: '0 auto 12px auto', maxWidth: '520px' }}>
          Tap the 16 MPC pads to drop cryogenic bass, sub-zero beats, and laser zaps.
        </p>

        {/* Loop Sequencer Toggle */}
        <button
          type="button"
          onClick={toggleLoop}
          style={{
            padding: '10px 22px',
            borderRadius: '9999px',
            border: isLooping ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.15)',
            background: isLooping ? 'rgba(169, 221, 211, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: isLooping ? '#A9DDD3' : '#FFFFFF',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isLooping ? '0 0 20px rgba(169, 221, 211, 0.4)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {isLooping ? <Square size={14} fill="#A9DDD3" /> : <Play size={14} fill="#FFFFFF" />}
          <span>{isLooping ? 'STOP 120 BPM BEAT' : 'PLAY 120 BPM GROOVE'}</span>
        </button>
      </div>

      {/* 4x4 MPC Drum Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        maxWidth: '680px',
        margin: '0 auto',
      }}>
        {pads.map((pad) => {
          const isPressed = activePad === pad.id;

          return (
            <button
              key={pad.id}
              type="button"
              onClick={() => handlePadPress(pad)}
              style={{
                aspectRatio: '1.2 / 1',
                borderRadius: '16px',
                border: isPressed ? `2px solid ${pad.color}` : '1.5px solid rgba(169, 221, 211, 0.2)',
                background: isPressed
                  ? `radial-gradient(circle, ${pad.color}40 0%, #061a15 100%)`
                  : 'linear-gradient(145deg, rgba(16, 26, 23, 0.85) 0%, rgba(4, 8, 7, 0.95) 100%)',
                color: isPressed ? '#FFFFFF' : pad.color,
                boxShadow: isPressed
                  ? `0 0 25px ${pad.color}80, inset 0 0 15px ${pad.color}40`
                  : '0 8px 20px rgba(0,0,0,0.6)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 6px',
                transform: isPressed ? 'scale(0.96)' : 'scale(1)',
                transition: 'transform 0.08s, box-shadow 0.08s',
                outline: 'none',
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isPressed ? '#FFFFFF' : pad.color,
                boxShadow: `0 0 8px ${pad.color}`,
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                textAlign: 'center',
                letterSpacing: '0.4px',
              }}>
                {pad.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
