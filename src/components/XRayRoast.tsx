'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Share2, Copy, Check, RefreshCw, Zap, ShieldAlert, Award } from 'lucide-react';
import { sound } from '@/lib/soundFx';

interface PersonaResult {
  handle: string;
  title: string;
  roast: string;
  badgeEmoji: string;
  rarity: string;
  frictionRate: string;
  finalitySpeed: string;
  shardCapacity: string;
  degenIndex: string;
}

const ROAST_TEMPLATES = [
  {
    title: 'Zero-Friction Superconductor Chad',
    badgeEmoji: '⚡',
    rarity: 'MYTHIC',
    frictionRate: '0.0001% (Absolute Zero)',
    finalitySpeed: '0.002s (Light-Speed)',
    shardCapacity: '99.9% (Overclocked)',
    degenIndex: '100% Superconducting',
    roast: "Their transactions settle so fast, validators haven't even finished brewing their coffee. Zero friction, zero excuses, pure cold-physics dominance on @RialoHQ.",
  },
  {
    title: 'Quantum Shard Goblin',
    badgeEmoji: '💎',
    rarity: 'LEGENDARY',
    frictionRate: '0.012% (Near Zero)',
    finalitySpeed: '0.018s (Instant)',
    shardCapacity: '97.4% (Max Vault)',
    degenIndex: '94% Hoarder',
    roast: "Rumor has it they wake up at 4 AM just to claim 25 Shards. They don't sleep, they don't sell, they just fuse holographic cards and stare at the leaderboard.",
  },
  {
    title: 'Thermal Decay Speculator',
    badgeEmoji: '🔥',
    rarity: 'RARE',
    frictionRate: '4.82% (Warm)',
    finalitySpeed: '1.24s (Sub-optimal)',
    shardCapacity: '42.1% (Leaking)',
    degenIndex: '88% Degen',
    roast: "Still asking if Rialo is on Ethereum layer 1 while paying $40 in gas fees. Quick, get them some liquid helium before their portfolio melts from thermal drag!",
  },
  {
    title: 'Finality Speedrunner',
    badgeEmoji: '🏎️',
    rarity: 'EPIC',
    frictionRate: '0.004% (Cryogenic)',
    finalitySpeed: '0.005s (Supersonic)',
    shardCapacity: '89.2% (Turbo)',
    degenIndex: '96% Speed Demon',
    roast: "Completed all 30 daily missions before the drops even officially tweeted. Even Rialo's testnet nodes had to ask them to slow down.",
  },
  {
    title: 'Paper-Handed Thermal Leaker',
    badgeEmoji: '🧻',
    rarity: 'COMMON',
    frictionRate: '12.4% (Boiling)',
    finalitySpeed: '4.50s (Slow)',
    shardCapacity: '15.0% (Empty)',
    degenIndex: '72% Panicker',
    roast: "Sold their Genesis Card for 2 gas tokens and regretted it 3 seconds later. Requires immediate immersion in absolute zero cooling.",
  },
];

export const XRayRoast: React.FC<{ initialHandle?: string }> = ({ initialHandle = '' }) => {
  const [handle, setHandle] = useState<string>(initialHandle);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<PersonaResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const generatePersona = (rawHandle: string) => {
    const clean = rawHandle.trim().replace(/^@/, '') || 'degen';
    // Deterministic hash based on handle
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    const templateIndex = Math.abs(hash) % ROAST_TEMPLATES.length;
    const template = ROAST_TEMPLATES[templateIndex];

    return {
      handle: clean,
      ...template,
    };
  };

  const handleScan = () => {
    sound.playScanner();
    setIsScanning(true);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const persona = generatePersona(handle);
      setResult(persona);
      sound.playSuccess();
    }, 1400);
  };

  const handleShareToX = () => {
    sound.playTap();
    if (!result) return;
    const tweetText = `Just scanned @${result.handle} on the @RialoHQ X-Ray Engine! 🔬\n\nTitle: ${result.badgeEmoji} ${result.title} [${result.rarity}]\nFriction: ${result.frictionRate}\n\n"${result.roast}"\n\nCheck your zero-friction rating on #RialoTrace!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    sound.playTap();
    if (!result) return;
    navigator.clipboard.writeText(
      `[Rialo X-Ray Persona] @${result.handle} -> ${result.badgeEmoji} ${result.title} (${result.rarity}): "${result.roast}"`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 12, 11, 0.95) 0%, rgba(2, 4, 3, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.22)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(169, 221, 211, 0.08)',
          border: '1px solid rgba(169, 221, 211, 0.3)',
          borderRadius: '9999px',
          color: '#A9DDD3',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px',
        }}>
          <Sparkles size={14} /> Viral Community Diagnostic
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0' }}>
          Rialo X-Ray & <span className="gradient-text-rialo">Persona Roast</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
          Scan any X (Twitter) handle or wallet to generate their official Web3 Rialo Persona Card with diagnostic stats and witty roast. Ready to share directly to X!
        </p>
      </div>

      {/* Input Box */}
      <div style={{
        maxWidth: '480px',
        margin: '0 auto 24px auto',
        display: 'flex',
        gap: '8px',
        background: '#040706',
        border: '1px solid rgba(169, 221, 211, 0.35)',
        borderRadius: '9999px',
        padding: '6px 8px 6px 16px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#A9DDD3', fontWeight: '800', fontSize: '15px' }}>
          @
        </div>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter X handle (e.g. yournahian, RialoHQ, itachee_x)..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'var(--font-mono, monospace)',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <button
          type="button"
          disabled={isScanning || !handle.trim()}
          onClick={handleScan}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
            color: '#010101',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '900',
            cursor: isScanning || !handle.trim() ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 15px rgba(169, 221, 211, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          {isScanning ? <RefreshCw size={14} style={{ animation: 'spin 1s infinite linear' }} /> : <Search size={14} />}
          <span>{isScanning ? 'Diagnosing...' : 'SCAN'}</span>
        </button>
      </div>

      {/* Preset Chips */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['yournahian', 'RialoHQ', 'VitalikButerin', 'elonmusk', 'satoshi'].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setHandle(preset);
              sound.playTap();
            }}
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: handle.toLowerCase() === preset.toLowerCase() ? 'rgba(169,221,211,0.18)' : 'rgba(255,255,255,0.03)',
              border: handle.toLowerCase() === preset.toLowerCase() ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.08)',
              color: handle.toLowerCase() === preset.toLowerCase() ? '#A9DDD3' : '#8E9B97',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            @{preset}
          </button>
        ))}
      </div>

      {/* Persona Result Card */}
      {result && !isScanning && (
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          background: 'radial-gradient(circle, rgba(14, 25, 22, 0.95) 0%, rgba(4, 7, 6, 0.98) 100%)',
          border: '2px solid rgba(169, 221, 211, 0.4)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 0 35px rgba(169, 221, 211, 0.25)',
          animation: 'fadeIn 0.3s ease',
          position: 'relative',
        }}>
          {/* Card Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(169, 221, 211, 0.15)', paddingBottom: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #A9DDD3',
                  boxShadow: '0 0 12px rgba(169, 221, 211, 0.4)',
                  flexShrink: 0,
                  background: '#040706',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    result.handle.toLowerCase() === 'yournahin' || result.handle.toLowerCase() === 'yournahian'
                      ? 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png'
                      : `https://unavatar.io/x/${result.handle}`
                  }
                  alt={result.handle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png';
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8E9B97', fontFamily: 'var(--font-mono)' }}>PROFILE SCAN</span>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0 0 0' }}>
                  @{result.handle}
                </h3>
              </div>
            </div>
            <div style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(169, 221, 211, 0.12)',
              border: '1px solid #A9DDD3',
              color: '#A9DDD3',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '1px',
            }}>
              {result.rarity}
            </div>
          </div>

          {/* Persona Title & Icon */}
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '6px' }}>{result.badgeEmoji}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#E8E3D5' }}>{result.title}</div>
          </div>

          {/* Diagnostic Meters Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(169, 221, 211, 0.15)',
            borderRadius: '16px',
            padding: '14px',
            margin: '16px 0',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Thermal Friction</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#A9DDD3' }}>{result.frictionRate}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Finality Speed</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#E8E3D5' }}>{result.finalitySpeed}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Shard Capacity</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#A9DDD3' }}>{result.shardCapacity}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Degen Purity</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>{result.degenIndex}</div>
            </div>
          </div>

          {/* Roast Paragraph */}
          <div style={{
            padding: '14px',
            background: 'rgba(169, 221, 211, 0.05)',
            borderLeft: '3px solid #A9DDD3',
            borderRadius: '0 12px 12px 0',
            fontSize: '13px',
            fontStyle: 'italic',
            color: '#E8E3D5',
            lineHeight: '1.5',
            marginBottom: '20px',
          }}>
            "{result.roast}"
          </div>

          {/* Share & Copy Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleShareToX}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
                color: '#010101',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(169, 221, 211, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <Share2 size={16} /> SHARE TO X
            </button>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={16} color="#A9DDD3" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
