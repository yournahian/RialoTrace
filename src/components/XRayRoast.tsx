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
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      color: '#FFFFFF',
      position: 'relative',
    }}>
      {/* Header - Unified Centered Architecture */}
      <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative', zIndex: 2 }}>
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
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '4px',
        }}>
          <Sparkles size={13} /> Viral Community Diagnostic
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 4px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Rialo X-Ray & <span className="gradient-text-rialo">Persona Roast</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '13px', maxWidth: '540px', margin: '0 auto', lineHeight: '1.45' }}>
          Scan any X handle or wallet to generate their official Web3 Holographic Persona Card with physics telemetry and witty roast.
        </p>
      </div>

      {/* Input Box - Compact Centered */}
      <div style={{
        maxWidth: '440px',
        margin: '0 auto 10px auto',
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
        <div style={{ display: 'flex', alignItems: 'center', color: '#A9DDD3', fontWeight: '900', fontSize: '15px', fontFamily: 'var(--font-mono)' }}>
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
            fontWeight: '900',
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', position: 'relative', zIndex: 2 }}>
        {presetHandles.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setHandle(preset);
              sound.playTap();
            }}
            style={{
              padding: '3px 10px',
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

      {/* Persona Result Card Container - PC 100% Zoom 2-Column Responsive Layout */}
      {result && !isScanning && (
        <div
          style={{
            perspective: '1200px',
            width: '100%',
            position: 'relative',
            zIndex: 3,
          }}
        >
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
              borderRadius: '22px',
              padding: '18px 20px',
              background: `
                radial-gradient(
                  circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,
                  ${theme.glow} 0%,
                  rgba(10, 18, 15, 0.95) 45%,
                  rgba(2, 6, 5, 0.99) 100%
                )
              `,
              border: `2px solid ${theme.border}`,
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.95),
                0 0 35px ${theme.glow},
                inset 0 0 20px rgba(169, 221, 211, 0.08)
              `,
              overflow: 'hidden',
            }}
          >
            {/* Holographic Iridescent Light Sheen Foil Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '22px',
                pointerEvents: 'none',
                opacity: isHovered ? 0.35 : 0.15,
                background: `linear-gradient(${115 + mousePos.x * 50}deg, transparent 20%, rgba(169,221,211,0.5) 40%, rgba(255,182,255,0.4) 60%, rgba(0,240,255,0.5) 80%, transparent 100%)`,
                mixBlendMode: 'screen',
                transition: 'opacity 0.3s ease',
              }}
            />

            {/* Cyberpunk Neon Corner Brackets */}
            <div style={{ position: 'absolute', top: '8px', left: '8px', width: '10px', height: '10px', borderTop: `2px solid ${theme.color}`, borderLeft: `2px solid ${theme.color}`, pointerEvents: 'none', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', borderTop: `2px solid ${theme.color}`, borderRight: `2px solid ${theme.color}`, pointerEvents: 'none', opacity: 0.8 }} />
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '10px', height: '10px', borderBottom: `2px solid ${theme.color}`, borderLeft: `2px solid ${theme.color}`, pointerEvents: 'none', opacity: 0.8 }} />
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '10px', height: '10px', borderBottom: `2px solid ${theme.color}`, borderRight: `2px solid ${theme.color}`, pointerEvents: 'none', opacity: 0.8 }} />

            {/* 2-Column Responsive Grid on Desktop */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                gap: '18px',
                alignItems: 'center',
              }}
            >
              {/* Left Column: Specimen Identity + Center Pedestal + Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {/* Header row: Avatar + Handle + Rarity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', width: '42px', height: '42px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          inset: '-3px',
                          borderRadius: '50%',
                          background: `conic-gradient(from 0deg, ${theme.color}, transparent 60%, ${theme.color})`,
                          animation: 'pulseHalo 4s linear infinite',
                          opacity: 0.7,
                        }}
                      />
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: `2px solid #FFFFFF`,
                          background: '#040706',
                          boxShadow: `0 0 12px ${theme.glow}`,
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
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '9px', color: '#A9DDD3', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                        SPECIMEN SCAN
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>@{result.handle}</span>
                        <span style={{ fontSize: '12px', color: '#A9DDD3' }}>⚡</span>
                      </div>
                    </div>
                  </div>

                  {/* Rarity Badge */}
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: theme.badgeBg,
                      border: `1.5px solid ${theme.badgeBorder}`,
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '900',
                      letterSpacing: '1px',
                      boxShadow: `0 0 12px ${theme.glow}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Award size={12} color={theme.color} />
                    <span>{result.rarity}</span>
                  </div>
                </div>

                {/* Persona Center Pedestal: Floating Badge & Title */}
                <div style={{
                  padding: '12px 10px',
                  background: 'radial-gradient(ellipse at center, rgba(169, 221, 211, 0.08) 0%, transparent 70%)',
                  position: 'relative',
                  width: '100%',
                  marginBottom: '10px',
                }}>
                  {/* Concentric Hologram Rings */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: `1px dashed ${theme.color}`,
                      opacity: 0.35,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Floating Hologram Icon */}
                  <div
                    style={{
                      fontSize: '44px',
                      margin: '0 auto 6px auto',
                      display: 'inline-block',
                      animation: 'floatBadge 3s ease-in-out infinite',
                      filter: `drop-shadow(0 0 18px ${theme.glow})`,
                      userSelect: 'none',
                    }}
                  >
                    {result.badgeEmoji}
                  </div>

                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '900',
                      color: '#FFFFFF',
                      margin: '0 0 4px 0',
                      letterSpacing: '-0.02em',
                      textShadow: `0 0 20px ${theme.glow}`,
                      lineHeight: 1.2,
                    }}
                  >
                    {result.title}
                  </h3>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(169, 221, 211, 0.25)',
                      color: '#A9DDD3',
                      fontSize: '9.5px',
                      fontWeight: '800',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <Cpu size={10} />
                    <span>{result.classTag}</span>
                  </div>
                </div>

                {/* Action Buttons in Left Column */}
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    type="button"
                    onClick={handleShareToX}
                    style={{
                      flex: 1,
                      padding: '9px 14px',
                      background: 'linear-gradient(135deg, #A9DDD3 0%, #00F0FF 100%)',
                      color: '#010101',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 0 16px rgba(169, 221, 211, 0.4)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Share2 size={14} /> SHARE TO X
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      padding: '9px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <Check size={14} color="#A9DDD3" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: 4 HUD Telemetry Pods + Roasted Verdict Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 4 HUD Telemetry Pods Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                  }}
                >
                  {/* Pod 1: Thermal Friction */}
                  <div className="persona-hud-pod" style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '9px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        ⚡ Friction
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        color: result.frictionPct > 50 ? '#EF4444' : '#10B981',
                        background: result.frictionPct > 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                      }}>
                        {result.frictionPct > 50 ? 'WARM' : 'COLD'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#FFFFFF', marginBottom: '5px' }}>
                      {result.frictionRate}
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${result.frictionPct}%`,
                          background: result.frictionPct > 50 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'linear-gradient(90deg, #A9DDD3, #10B981)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Pod 2: Finality Speed */}
                  <div className="persona-hud-pod" style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '9px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        ⏱️ Finality
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#00F0FF', background: 'rgba(0, 240, 255, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                        SPEED
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#00F0FF', marginBottom: '5px' }}>
                      {result.finalitySpeed}
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.speedPct}%`, background: 'linear-gradient(90deg, #00F0FF, #A9DDD3)' }} />
                    </div>
                  </div>

                  {/* Pod 3: Shard Capacity */}
                  <div className="persona-hud-pod" style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '9px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        💎 Shards
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#A9DDD3', background: 'rgba(169, 221, 211, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                        VAULT
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#A9DDD3', marginBottom: '5px' }}>
                      {result.shardCapacity}
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.capacityPct}%`, background: 'linear-gradient(90deg, #A9DDD3, #E8E3D5)' }} />
                    </div>
                  </div>

                  {/* Pod 4: Degen Purity */}
                  <div className="persona-hud-pod" style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '9px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        🧪 Degen
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#EC4899', background: 'rgba(236, 72, 153, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                        PURITY
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#FFFFFF', marginBottom: '5px' }}>
                      {result.degenIndex}
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.degenPct}%`, background: 'linear-gradient(90deg, #A855F7, #EC4899)' }} />
                    </div>
                  </div>
                </div>

                {/* Roasted Verdict Cyber Terminal Box */}
                <div
                  style={{
                    background: 'rgba(2, 6, 5, 0.85)',
                    border: '1.5px solid rgba(169, 221, 211, 0.22)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444' }} />
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B' }} />
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#8E9B97', marginLeft: '4px' }}>
                        AI_DIAGNOSTIC_VERDICT.log
                      </span>
                    </div>
                    <span style={{ fontSize: '8.5px', color: '#10B981', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      [ONLINE]
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '12.5px',
                      fontStyle: 'italic',
                      color: '#E8E3D5',
                      lineHeight: '1.5',
                      margin: '0 0 8px 0',
                    }}
                  >
                    &ldquo;{result.roast}&rdquo;
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: '#8E9B97' }}>
                      RIALO ZERO-FRICTION PROTOCOL AUTHENTICATED
                    </span>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', opacity: 0.6 }}>
                      <span style={{ width: '2px', height: '8px', background: '#A9DDD3' }} />
                      <span style={{ width: '1px', height: '8px', background: '#A9DDD3' }} />
                      <span style={{ width: '3px', height: '8px', background: '#A9DDD3' }} />
                      <span style={{ width: '1px', height: '8px', background: '#A9DDD3' }} />
                      <span style={{ width: '2px', height: '8px', background: '#A9DDD3' }} />
                      <span style={{ width: '3px', height: '8px', background: '#A9DDD3' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
