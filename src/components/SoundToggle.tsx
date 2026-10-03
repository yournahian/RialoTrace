'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/soundFx';

export const SoundToggle: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    setEnabled(sound.isEnabled());
  }, []);

  const handleToggle = () => {
    const next = sound.toggle();
    setEnabled(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={enabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: enabled ? 'rgba(169, 221, 211, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        border: enabled ? '1px solid rgba(169, 221, 211, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '9999px',
        color: enabled ? '#A9DDD3' : '#888888',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: '700',
        fontFamily: 'var(--font-mono, monospace)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: enabled ? '0 0 12px rgba(169, 221, 211, 0.2)' : 'none',
      }}
    >
      {enabled ? <Volume2 size={13} color="#A9DDD3" /> : <VolumeX size={13} color="#888888" />}
      <span>{enabled ? 'FX ON' : 'FX OFF'}</span>
    </button>
  );
};
