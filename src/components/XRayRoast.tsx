'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Share2, Copy, Check, RefreshCw, Award, Cpu } from 'lucide-react';
import { sound } from '@/lib/soundFx';

interface PersonaResult {
  handle: string;
  title: string;
  roast: string;
  badgeEmoji: string;
  rarity: 'MYTHIC' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';
  frictionRate: string;
  frictionPct: number;
  finalitySpeed: string;
  speedPct: number;
  shardCapacity: string;
  capacityPct: number;
  degenIndex: string;
  degenPct: number;
  classTag: string;
}

const ROAST_TEMPLATES: Omit<PersonaResult, 'handle'>[] = [
  {
    title: 'Zero-Friction Superconductor Chad',
    badgeEmoji: '⚡',
    rarity: 'MYTHIC',
    frictionRate: '0.0001% (Absolute Zero)',
    frictionPct: 2,
    finalitySpeed: '0.002s (Light-Speed)',
    speedPct: 99,
    shardCapacity: '99.9% (Overclocked)',
    capacityPct: 99.9,
    degenIndex: '100% Superconducting',
    degenPct: 100,
    classTag: 'CLASS 0 // ABSOLUTE ZERO PHENOMENON',
    roast: "Their transactions settle so fast, validators haven't even finished brewing their coffee. Zero friction, zero excuses, pure cold-physics dominance on @RialoHQ.",
  },
  {
    title: 'Quantum Shard Goblin',
    badgeEmoji: '💎',
    rarity: 'LEGENDARY',
    frictionRate: '0.012% (Near Zero)',
    frictionPct: 8,
    finalitySpeed: '0.018s (Instant)',
    speedPct: 94,
    shardCapacity: '97.4% (Max Vault)',
    capacityPct: 97.4,
    degenIndex: '94% Hoarder',
    degenPct: 94,
    classTag: 'CLASS 1 // HIGH-DENSITY VAULT HOARDER',
    roast: "Rumor has it they wake up at 4 AM just to claim 25 Shards. They don't sleep, they don't sell, they just fuse holographic cards and stare at the leaderboard.",
  },
  {
    title: 'Thermal Decay Speculator',
    badgeEmoji: '🔥',
    rarity: 'RARE',
    frictionRate: '4.82% (Warm)',
    frictionPct: 62,
    finalitySpeed: '1.24s (Sub-optimal)',
    speedPct: 45,
    shardCapacity: '42.1% (Leaking)',
    capacityPct: 42.1,
    degenIndex: '88% Degen',
    degenPct: 88,
    classTag: 'CLASS 3 // VOLATILE THERMAL SPIKE',
    roast: "Still asking if Rialo is on Ethereum layer 1 while paying $40 in gas fees. Quick, get them some liquid helium before their portfolio melts from thermal drag!",
  },
  {
    title: 'Finality Speedrunner',
    badgeEmoji: '🏎️',
    rarity: 'EPIC',
    frictionRate: '0.004% (Cryogenic)',
    frictionPct: 5,
    finalitySpeed: '0.005s (Supersonic)',
    speedPct: 98,
    shardCapacity: '89.2% (Turbo)',
    capacityPct: 89.2,
    degenIndex: '96% Speed Demon',
    degenPct: 96,
    classTag: 'CLASS 2 // SUPERSONIC TESTNET PIONEER',
    roast: "Completed all 30 daily missions before the drops even officially tweeted. Even Rialo's testnet nodes had to ask them to slow down.",
  },
  {
    title: 'Paper-Handed Thermal Leaker',
    badgeEmoji: '🧻',
    rarity: 'COMMON',
    frictionRate: '12.4% (Boiling)',
    frictionPct: 92,
    finalitySpeed: '4.50s (Slow)',
    speedPct: 18,
    shardCapacity: '15.0% (Empty)',
    capacityPct: 15,
    degenIndex: '72% Panicker',
    degenPct: 72,
    classTag: 'CLASS 4 // CRITICAL THERMAL LEAKAGE',
    roast: "Sold their Genesis Card for 2 gas tokens and regretted it 3 seconds later. Requires immediate immersion in absolute zero cooling.",
  },
  {
    title: 'Absolute Zero Gigachad',
    badgeEmoji: '❄️',
    rarity: 'MYTHIC',
    frictionRate: '0.0000% (Sub-Kelvin)',
    frictionPct: 1,
    finalitySpeed: '0.001s (Instantaneous)',
    speedPct: 100,
    shardCapacity: '100% (Cryo-Locked)',
    capacityPct: 100,
    degenIndex: '99% Pure Cryo',
    degenPct: 99,
    classTag: 'CLASS 0 // SUB-KELVIN SINGULARITY',
    roast: "Their transactions defy standard thermodynamics. Energy doesn't escape; it just settles with zero friction. Ethereum gas fee victims look at this account and cry in silence.",
  },
  {
    title: 'Liquid Helium Yield Alchemist',
    badgeEmoji: '🧪',
    rarity: 'LEGENDARY',
    frictionRate: '0.008% (Superfluid)',
    frictionPct: 7,
    finalitySpeed: '0.012s (Ultra-Sonic)',
    speedPct: 95,
    shardCapacity: '95.8% (Pressurized)',
    capacityPct: 95.8,
    degenIndex: '92% Chemist',
    degenPct: 92,
    classTag: 'CLASS 1 // SUPERFLUID QUANTUM ENGINEER',
    roast: "Found a way to convert pure testnet latency into liquid yield. Probably has 14 monitors running Rialo trace analysis and dreams in hexadecimal code.",
  },
];

const RARITY_THEMES: Record<string, {
  color: string;
  glow: string;
  border: string;
  badgeBg: string;
  badgeBorder: string;
}> = {
  MYTHIC: {
    color: '#FF2A6D',
    glow: 'rgba(255, 42, 109, 0.45)',
    border: 'rgba(255, 42, 109, 0.65)',
    badgeBg: 'linear-gradient(135deg, rgba(255, 42, 109, 0.25) 0%, rgba(5, 217, 232, 0.2) 100%)',
    badgeBorder: '#FF2A6D',
  },
  LEGENDARY: {
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'rgba(245, 158, 11, 0.65)',
    badgeBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(251, 191, 36, 0.15) 100%)',
    badgeBorder: '#F59E0B',
  },
  EPIC: {
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.4)',
    border: 'rgba(168, 85, 247, 0.65)',
    badgeBg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.15) 100%)',
    badgeBorder: '#A855F7',
  },
  RARE: {
    color: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.4)',
    border: 'rgba(0, 240, 255, 0.65)',
    badgeBg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)',
    badgeBorder: '#00F0FF',
  },
  COMMON: {
    color: '#A9DDD3',
    glow: 'rgba(169, 221, 211, 0.3)',
    border: 'rgba(169, 221, 211, 0.45)',
    badgeBg: 'rgba(169, 221, 211, 0.12)',
    badgeBorder: '#A9DDD3',
  },
};

export const XRayRoast: React.FC<{ initialHandle?: string }> = ({ initialHandle = '' }) => {
  const [handle, setHandle] = useState<string>(initialHandle);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<PersonaResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [presetHandles, setPresetHandles] = useState<string[]>(['RialoHQ', 'itachee_x', 'yournahian', 'VitalikButerin', 'elonmusk']);

  // 3D Tilt & Holographic Interactive Sheen
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('rialo_recommended_handles') || '[]');
        const active = localStorage.getItem('rialo_active_user') || '';
        const combined = Array.from(new Set([active, ...stored, 'RialoHQ', 'itachee_x', 'yournahian', 'VitalikButerin', 'elonmusk'])).filter(Boolean).slice(0, 7);
        setPresetHandles(combined);
      } catch (e) {}
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const generatePersona = (rawHandle: string): PersonaResult => {
    const clean = rawHandle.trim().replace(/^@/, '') || 'degen';
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
    }, 1200);
  };

  const handleShareToX = () => {
    sound.playTap();
    if (!result) return;
    const tweetText = `Just diagnosed @${result.handle} on the @RialoHQ Zero-Friction X-Ray! 🔬⚡\n\nTitle: ${result.badgeEmoji} ${result.title} [${result.rarity}]\nFriction: ${result.frictionRate}\n\n"${result.roast}"\n\nDiagnose your on-chain physics on #RialoTrace!`;
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

  const theme = result ? RARITY_THEMES[result.rarity] || RARITY_THEMES.COMMON : RARITY_THEMES.COMMON;
  const rotateX = isHovered ? (mousePos.y - 0.5) * -10 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 10 : 0;

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 12, 11, 0.95) 0%, rgba(2, 4, 3, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.22)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Header - Unified Centered Architecture */}
      <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          background: 'rgba(169, 221, 211, 0.08)',
          border: '1px solid rgba(169, 221, 211, 0.3)',
          borderRadius: '9999px',
          color: '#A9DDD3',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '6px',
        }}>
          <Sparkles size={13} /> Viral Community Diagnostic
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Rialo X-Ray & <span className="gradient-text-rialo">Persona Roast</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '13.5px', maxWidth: '540px', margin: '0 auto', lineHeight: '1.45' }}>
          Scan any X handle or wallet to generate their official Web3 Holographic Persona Card with physics telemetry and witty roast.
        </p>
      </div>

      {/* Input Box - Compact Centered */}
      <div style={{
        maxWidth: '440px',
        margin: '0 auto 12px auto',
        display: 'flex',
        gap: '6px',
        background: '#040706',
        border: '1.5px solid rgba(169, 221, 211, 0.35)',
        borderRadius: '9999px',
        padding: '4px 6px 4px 14px',
        boxShadow: '0 0 20px rgba(0,0,0,0.6)',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#A9DDD3', fontWeight: 900, fontSize: '15px', fontFamily: 'var(--font-mono)' }}>
          @
        </div>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter X handle (e.g. 0xnahin, yournahian)..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '13px',
            fontFamily: 'var(--font-mono, monospace)',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <button
          type="button"
          disabled={isScanning || !handle.trim()}
          onClick={handleScan}
          style={{
            padding: '7px 18px',
            background: isScanning || !handle.trim() ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #A9DDD3 0%, #00F0FF 100%)',
            color: '#010101',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 900,
            cursor: isScanning || !handle.trim() ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: isScanning || !handle.trim() ? 'none' : '0 0 15px rgba(169, 221, 211, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          {isScanning ? <RefreshCw size={13} style={{ animation: 'spin 1s infinite linear' }} /> : <Search size={13} />}
          <span>{isScanning ? 'SCANNING...' : 'SCAN'}</span>
        </button>
      </div>

      {/* Preset Chips - Compact */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        {presetHandles.map((preset) => (
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
              background: handle.toLowerCase() === preset.toLowerCase() ? 'rgba(169,221,211,0.2)' : 'rgba(255,255,255,0.03)',
              border: handle.toLowerCase() === preset.toLowerCase() ? '1.5px solid #A9DDD3' : '1px solid rgba(255,255,255,0.08)',
              color: handle.toLowerCase() === preset.toLowerCase() ? '#A9DDD3' : '#8E9B97',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            @{preset}
          </button>
        ))}
      </div>

      {/* Scanning Radar Progress Animation */}
      {isScanning && (
        <div
          style={{
            maxWidth: '380px',
            margin: '20px auto',
            padding: '30px 20px',
            background: 'rgba(2, 6, 5, 0.9)',
            border: '1.5px solid rgba(169, 221, 211, 0.4)',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 0 35px rgba(169, 221, 211, 0.25)',
          }}
        >
          <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 16px auto' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(169, 221, 211, 0.3)',
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(169, 221, 211, 0.2) 0%, transparent 70%)',
                border: '2px solid #A9DDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={24} color="#A9DDD3" style={{ animation: 'pulse 1s infinite' }} />
            </div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>
            DIAGNOSING @{handle.replace(/^@/, '')}...
          </div>
          <div style={{ fontSize: '11px', color: '#8E9B97', marginTop: '6px' }}>
            Auditing on-chain friction telemetry & calculating roast velocity
          </div>
        </div>
      )}

      {/* Authentic Pokémon Card (Portrait TCG Layout with PFP in the Center) */}
      {result && !isScanning && (
        <div
          style={{
            perspective: '1200px',
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 3,
          }}
        >
          {/* ===================== GRAPHIC STREETWEAR TRADING CARD ===================== */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setMousePos({ x: 0.5, y: 0.5 });
            }}
            style={{
              transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease',
              transformStyle: 'preserve-3d',
              position: 'relative',
              width: '100%',
              height: '500px',
              borderRadius: '22px',
              overflow: 'hidden',
              boxShadow: `
                0 30px 80px rgba(0, 0, 0, 0.95),
                0 0 40px ${theme.glow},
                inset 0 0 0 2px ${theme.color}
              `,
              fontFamily: "'Inter', sans-serif",
              cursor: 'default',
            }}
          >
            {/* === BACKGROUND: Diagonal color blocks (gold + dark) === */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(145deg, #E5C365 0%, #D4A813 38%, #0A0D0C 38%, #070A09 100%)',
                zIndex: 0,
              }}
            />

            {/* Dark carbon texture overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.06) 2px,
                    rgba(0,0,0,0.06) 4px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.04) 2px,
                    rgba(0,0,0,0.04) 4px
                  )
                `,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />

            {/* Holographic iridescent sheen foil */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '22px',
                pointerEvents: 'none',
                opacity: isHovered ? 0.35 : 0.12,
                background: `linear-gradient(${120 + mousePos.x * 60}deg, transparent 20%, rgba(229,195,101,0.5) 35%, rgba(169,221,211,0.55) 50%, rgba(200,180,255,0.45) 65%, transparent 100%)`,
                mixBlendMode: 'screen',
                transition: 'opacity 0.3s ease',
                zIndex: 2,
              }}
            />

            {/* === DIAGONAL ACCENT STRIPE (gold to dark separator) === */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '48px',
                right: '48px',
                height: '100%',
                background: 'linear-gradient(145deg, rgba(229,195,101,0.15) 0%, transparent 45%)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />

            {/* === HAZARD / ACCENT STRIPES (bottom-left corner, like the reference) === */}
            <div
              style={{
                position: 'absolute',
                bottom: '54px',
                left: 0,
                width: '100%',
                height: '36px',
                background: `repeating-linear-gradient(
                  -55deg,
                  transparent,
                  transparent 10px,
                  rgba(229,195,101,0.22) 10px,
                  rgba(229,195,101,0.22) 20px
                )`,
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />

            {/* === LEFT EDGE: VERTICAL BIG TEXT === */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                background: 'rgba(0,0,0,0.55)',
                borderRight: '1px solid rgba(229,195,101,0.25)',
              }}
            >
              <span
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                  fontSize: '36px',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  color: theme.color,
                  textShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}`,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                RIALO
              </span>
            </div>

            {/* === RIGHT EDGE: VERTICAL DATE/CLASS TAG === */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                background: 'rgba(229,195,101,0.10)',
                borderLeft: '1px solid rgba(229,195,101,0.25)',
              }}
            >
              <span
                style={{
                  writingMode: 'vertical-rl',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'rgba(229,195,101,0.75)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                OCT 2026 • RIALO PROTOCOL
              </span>
            </div>

            {/* === TOP HEADER STRIP === */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '44px',
                right: '36px',
                height: '40px',
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px',
                background: 'rgba(0,0,0,0.60)',
                borderBottom: '1px solid rgba(229,195,101,0.2)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  color: 'rgba(229,195,101,0.8)',
                  textTransform: 'uppercase',
                }}
              >
                SPECIMEN // 2026 EDITION
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9px',
                  fontWeight: 700,
                  color: theme.color,
                  letterSpacing: '1px',
                }}
              >
                {result.rarity}
              </span>
            </div>

            {/* === HERO PFP: fills top of card from header to info block === */}
            <div
              style={{
                position: 'absolute',
                top: '40px',          /* sits flush below the header strip */
                left: '44px',         /* inside left RIALO bar */
                right: '36px',        /* inside right tag bar */
                bottom: '190px',      /* stops at top of info block */
                zIndex: 4,
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://unavatar.io/x/${result.handle}`}
                alt={result.handle}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                }}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.handle)}&background=0A0D0C&color=E5C365&size=400&bold=true`;
                }}
              />
              {/* Fade gradient at the bottom of PFP so it bleeds into the info block */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '80px',
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(7,10,9,0.95) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* === SIGNATURE (Cursive handle overlay) === */}
            <div
              style={{
                position: 'absolute',
                top: '42px',
                left: '50%',
                transform: 'translateX(-40%) rotate(-7deg)',
                zIndex: 7,
                fontFamily: "'Caveat', 'Dancing Script', cursive",
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(229,195,101,0.6)',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              @{result.handle}
            </div>

            {/* === BOTTOM INFO BLOCK === */}
            <div
              style={{
                position: 'absolute',
                bottom: '54px',
                left: '44px',
                right: '36px',
                padding: '14px 16px 10px',
                zIndex: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(7,10,9,0.85)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Title big bold */}
              <div
                style={{
                  fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                  fontSize: '28px',
                  fontWeight: 900,
                  letterSpacing: '2px',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  lineHeight: 1.0,
                  textShadow: `0 0 20px ${theme.glow}`,
                }}
              >
                {result.title}
              </div>

              {/* One-line stat pill */}
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: theme.color,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  opacity: 0.9,
                }}
              >
                {result.finalitySpeed} &nbsp;•&nbsp; FRICTION {result.frictionRate}
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '14px',
                      color: i < (result.rarity === 'MYTHIC' ? 5 : result.rarity === 'LEGENDARY' ? 4 : 3) ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                      textShadow: i < 4 ? '0 0 8px rgba(245,158,11,0.8)' : 'none',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* === FOOTER WATERMARK === */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '44px',
                right: '36px',
                height: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                zIndex: 5,
                background: 'rgba(0,0,0,0.7)',
                borderTop: '1px solid rgba(229,195,101,0.2)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '7.5px',
                  letterSpacing: '1.5px',
                  color: 'rgba(229,195,101,0.5)',
                  textTransform: 'uppercase',
                }}
              >
                WWW.RIALO.IO • ZERO-FRICTION PROTOCOL
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Share button */}
                <button
                  type="button"
                  onClick={handleShareToX}
                  style={{
                    padding: '6px 14px',
                    background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.glow.replace('rgba', 'rgb').replace(', 0.', ', 1')} 100%)`,
                    color: '#010101',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    letterSpacing: '0.5px',
                    boxShadow: `0 0 12px ${theme.glow}`,
                    transition: 'all 0.2s',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  <Share2 size={10} /> SHARE
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {copied ? <Check size={10} color="#A9DDD3" /> : <Copy size={10} />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
