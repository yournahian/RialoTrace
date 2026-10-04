'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Search, Sparkles, Share2, Copy, Check, RefreshCw, Upload, Palette, Edit3, Download, Image as ImageIcon } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { exportPersonaCardPNG } from './PersonaCardCanvasExporter';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface CardData {
  handle: string;
  title: string;
  rarity: 'MYTHIC' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';
  finalitySpeed: string;
  frictionRate: string;
  imageUrl: string;        // url or base64
  useCustomImage: boolean; // false = unavatar, true = uploaded
}

type Rarity = CardData['rarity'];

/* ─────────────────────────────────────────────
   AUTO-GEN TEMPLATES
───────────────────────────────────────────── */
const TEMPLATES: Omit<CardData, 'handle' | 'imageUrl' | 'useCustomImage'>[] = [
  { title: 'Zero-Friction Superconductor Chad', rarity: 'MYTHIC',     finalitySpeed: '0.002s (Light-Speed)',  frictionRate: '0.0001% (Absolute Zero)' },
  { title: 'Quantum Shard Goblin',              rarity: 'LEGENDARY',  finalitySpeed: '0.018s (Instant)',      frictionRate: '0.012% (Near Zero)'      },
  { title: 'Finality Speedrunner',              rarity: 'EPIC',       finalitySpeed: '0.005s (Supersonic)',   frictionRate: '0.004% (Cryogenic)'      },
  { title: 'Thermal Decay Speculator',          rarity: 'RARE',       finalitySpeed: '1.24s (Sub-optimal)',   frictionRate: '4.82% (Warm)'            },
  { title: 'Paper-Handed Thermal Leaker',       rarity: 'COMMON',     finalitySpeed: '4.50s (Slow)',          frictionRate: '12.4% (Boiling)'         },
  { title: 'Cryogenic Vault Architect',         rarity: 'LEGENDARY',  finalitySpeed: '0.009s (Near Light)',   frictionRate: '0.003% (Cryo-Level)'     },
  { title: 'Degen Supernova Pilgrim',           rarity: 'EPIC',       finalitySpeed: '0.033s (Turbo)',        frictionRate: '0.9% (Optimized)'        },
  { title: 'Genesis Protocol Ghost',            rarity: 'MYTHIC',     finalitySpeed: '0.001s (Quantum)',      frictionRate: '0.0000% (Absolute)'      },
];

function autoGenCard(handle: string): CardData {
  const hash = handle.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const template = TEMPLATES[hash % TEMPLATES.length];
  return {
    ...template,
    handle,
    imageUrl: `https://unavatar.io/x/${handle}`,
    useCustomImage: false,
  };
}

/* ─────────────────────────────────────────────
   RARITY THEME
───────────────────────────────────────────── */
function rarityTheme(rarity: Rarity) {
  switch (rarity) {
    case 'MYTHIC':    return { color: '#FF85E1', glow: 'rgba(255,133,225,0.45)', border: '#FF85E1', stars: 5 };
    case 'LEGENDARY': return { color: '#F59E0B', glow: 'rgba(245,158,11,0.45)',  border: '#F59E0B', stars: 4 };
    case 'EPIC':      return { color: '#A855F7', glow: 'rgba(168,85,247,0.45)',  border: '#A855F7', stars: 3 };
    case 'RARE':      return { color: '#A9DDD3', glow: 'rgba(169,221,211,0.45)', border: '#A9DDD3', stars: 2 };
    default:          return { color: '#94A3B8', glow: 'rgba(148,163,184,0.35)', border: '#94A3B8', stars: 1 };
  }
}

/* ─────────────────────────────────────────────
   INLINE EDIT FIELD
───────────────────────────────────────────── */
const EditField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  monospace?: boolean;
}> = ({ label, value, onChange, monospace }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
      {label}
    </label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(169,221,211,0.2)',
        borderRadius: '8px',
        padding: '7px 10px',
        color: '#E8E3D5',
        fontSize: '12px',
        fontFamily: monospace ? 'var(--font-mono)' : 'var(--font-main)',
        fontWeight: 700,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(169,221,211,0.5)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(169,221,211,0.2)'; }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const PersonaCardStudio: React.FC = () => {
  const [handle, setHandle]           = useState('');
  const [isScanning, setIsScanning]   = useState(false);
  const [card, setCard]               = useState<CardData | null>(null);
  const [editMode, setEditMode]       = useState(false);
  const [isHovered, setIsHovered]     = useState(false);
  const [mousePos, setMousePos]       = useState({ x: 0.5, y: 0.5 });
  
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying]         = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<'IMAGE' | 'TEXT' | null>(null);

  const cardRef                       = useRef<HTMLDivElement>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  /* 3-D tilt */
  const rotateX = isHovered ? (mousePos.y - 0.5) * -14 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 14  : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }, []);

  /* ── Scan / Generate ── */
  const handleScan = () => {
    const h = handle.replace(/^@/, '').trim();
    if (!h) return;
    sound.playTap();
    setIsScanning(true);
    setCard(null);
    setEditMode(false);
    setTimeout(() => {
      setCard(autoGenCard(h));
      setIsScanning(false);
      sound.playSuccess?.();
    }, 1800);
  };

  /* ── Reshuffle ── */
  const handleReshuffle = () => {
    if (!card) return;
    sound.playTap();
    setIsScanning(true);
    setCard(null);
    setTimeout(() => {
      const hash = card.handle.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now();
      const template = TEMPLATES[hash % TEMPLATES.length];
      setCard({ ...template, handle: card.handle, imageUrl: card.imageUrl, useCustomImage: card.useCustomImage });
      setIsScanning(false);
    }, 900);
  };

  /* ── Image upload ── */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !card) return;
    sound.playTap();
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setCard(prev => prev ? { ...prev, imageUrl: ev.target!.result as string, useCustomImage: true } : prev);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Reset to X avatar ── */
  const resetToXAvatar = () => {
    if (!card) return;
    setCard(prev => prev ? { ...prev, imageUrl: `https://unavatar.io/x/${prev.handle}`, useCustomImage: false } : prev);
  };

  /* ── Download PNG Card ── */
  const handleDownload = async () => {
    if (!card || downloading) return;
    sound.playTap();
    setDownloading(true);
    try {
      const blob = await exportPersonaCardPNG(card);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${card.handle}-rialo-persona-card.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        sound.playSuccess?.();
      }
    } catch (e) {
      console.error('Failed to export card PNG', e);
    } finally {
      setDownloading(false);
    }
  };

  /* ── Copy Card Image to Clipboard ── */
  const handleCopyImage = async () => {
    if (!card || copying) return;
    sound.playTap();
    setCopying(true);
    try {
      const blob = await exportPersonaCardPNG(card);
      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedStatus('IMAGE');
          sound.playSuccess?.();
          setTimeout(() => setCopiedStatus(null), 2500);
          return;
        } catch (clipErr) {
          console.warn('Clipboard image write restricted, falling back to text', clipErr);
        }
      }
      // Fallback if browser blocks image clipboard write
      await navigator.clipboard.writeText(`@${card.handle} — "${card.title}" [${card.rarity}] on #RialoTrace`);
      setCopiedStatus('TEXT');
      setTimeout(() => setCopiedStatus(null), 2500);
    } catch (e) {
      console.error('Failed to copy card image', e);
    } finally {
      setCopying(false);
    }
  };

  /* ── Share (Native File Share or Auto-Download + Tweet) ── */
  const handleShare = async () => {
    if (!card) return;
    sound.playTap();
    try {
      const blob = await exportPersonaCardPNG(card);
      if (blob) {
        const file = new File([blob], `${card.handle}-rialo-persona.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${card.title} - Rialo Persona Card`,
            text: `Just forged my official Rialo Persona Card! ⚡ Zero friction, light-speed finality on #RialoTrace @RialoHQ`,
          });
          return;
        }
        // Fallback: auto download card so user has it ready to attach to tweet
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${card.handle}-rialo-persona-card.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('Share intent error', e);
    }
    const txt = `Just forged my official Rialo Persona Card! 🎴\n\n"${card.title}" [${card.rarity}]\n⚡ Finality: ${card.finalitySpeed}\n🧊 Friction: ${card.frictionRate}\n\nForge yours on #RialoTrace #ZeroFriction @RialoHQ`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}`, '_blank', 'noopener,noreferrer');
  };

  const theme = card ? rarityTheme(card.rarity) : rarityTheme('COMMON');

  /* ─────────── RENDER ─────────── */
  return (
    <div
      style={{
        borderRadius: '24px',
        padding: '32px 24px',
        border: '1px solid rgba(169, 221, 211, 0.22)',
        background: 'linear-gradient(145deg, rgba(10,16,14,0.95) 0%, rgba(4,7,6,0.98) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: '#A9DDD3', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>
          <Palette size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          AUTO-GEN + FULL CUSTOMIZATION
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#E8E3D5', margin: 0, letterSpacing: '-0.02em' }}>
          🎴 Persona Card Studio
        </h2>
        <p style={{ fontSize: '12px', color: '#8E9B97', marginTop: '6px', lineHeight: 1.5 }}>
          Enter any X handle → AI generates your card → download, copy image, or edit everything
        </p>
      </div>

      {/* ── Handle Input ── */}
      <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '440px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A9DDD3', fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, pointerEvents: 'none', zIndex: 2 }}>@</span>
          <input
            value={handle}
            onChange={e => setHandle(e.target.value.replace(/^@/, ''))}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="yourhandle"
            style={{
              width: '100%', padding: '10px 12px 10px 28px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(169,221,211,0.25)',
              borderRadius: '12px', color: '#E8E3D5',
              fontSize: '14px', fontWeight: 700,
              fontFamily: 'var(--font-mono)', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(169,221,211,0.6)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(169,221,211,0.25)'; }}
          />
        </div>
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning || !handle.trim()}
          style={{
            padding: '10px 18px',
            background: handle.trim() ? 'linear-gradient(135deg, #A9DDD3 0%, #00F0FF 100%)' : 'rgba(255,255,255,0.06)',
            color: handle.trim() ? '#010101' : '#8E9B97',
            border: 'none', borderRadius: '12px',
            fontSize: '13px', fontWeight: 900, cursor: handle.trim() ? 'pointer' : 'not-allowed',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            boxShadow: handle.trim() ? '0 0 16px rgba(169,221,211,0.35)' : 'none',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {isScanning ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={14} />}
          {isScanning ? 'Scanning...' : 'Generate'}
        </button>
      </div>

      {/* ── Scanning Animation ── */}
      {isScanning && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>
            SCANNING @{handle.replace(/^@/, '')}...
          </div>
          <div style={{ fontSize: '11px', color: '#8E9B97', marginTop: '6px' }}>
            Calculating persona archetype & card stats
          </div>
        </div>
      )}

      {/* ── CARD + EDIT PANEL ── */}
      {card && !isScanning && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {/* ── THE CARD ── */}
          <div style={{ perspective: '1200px', width: '100%', maxWidth: '360px', margin: '0 auto', position: 'relative', zIndex: 3 }}>
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0.5, y: 0.5 }); }}
              style={{
                transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease',
                transformStyle: 'preserve-3d',
                position: 'relative', width: '100%', height: '500px',
                borderRadius: '22px', overflow: 'hidden',
                boxShadow: `0 30px 80px rgba(0,0,0,0.95), 0 0 40px ${theme.glow}, inset 0 0 0 2px ${theme.color}`,
                fontFamily: "'Inter', sans-serif", cursor: 'default',
              }}
            >
              {/* BG diagonal */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(145deg, ${theme.color}55 0%, ${theme.color}22 38%, #0A0D0C 38%, #070A09 100%)`, zIndex: 0 }} />
              {/* Grid texture */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)`, zIndex: 1, pointerEvents: 'none' }} />
              {/* Holo foil */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '22px', pointerEvents: 'none', opacity: isHovered ? 0.35 : 0.12, background: `linear-gradient(${120 + mousePos.x * 60}deg, transparent 20%, ${theme.color}80 35%, rgba(169,221,211,0.55) 50%, rgba(200,180,255,0.45) 65%, transparent 100%)`, mixBlendMode: 'screen', transition: 'opacity 0.3s ease', zIndex: 2 }} />
              {/* Hazard stripes */}
              <div style={{ position: 'absolute', bottom: '54px', left: 0, width: '100%', height: '36px', background: `repeating-linear-gradient(-55deg, transparent, transparent 10px, rgba(229,195,101,0.18) 10px, rgba(229,195,101,0.18) 20px)`, zIndex: 3, pointerEvents: 'none' }} />

              {/* LEFT: vertical RIALO text */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, background: 'rgba(0,0,0,0.55)', borderRight: '1px solid rgba(229,195,101,0.25)' }}>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: "'Bebas Neue','Impact','Arial Black',sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '4px', color: theme.color, textShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}`, textTransform: 'uppercase', lineHeight: 1, userSelect: 'none', whiteSpace: 'nowrap' }}>
                  RIALO
                </span>
              </div>

              {/* RIGHT: vertical date tag */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, background: `${theme.color}18`, borderLeft: '1px solid rgba(229,195,101,0.25)' }}>
                <span style={{ writingMode: 'vertical-rl', fontFamily: "'Space Mono',monospace", fontSize: '8px', fontWeight: 700, letterSpacing: '2px', color: `${theme.color}BB`, textTransform: 'uppercase', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  OCT 2026 • RIALO PROTOCOL
                </span>
              </div>

              {/* TOP header strip */}
              <div style={{ position: 'absolute', top: 0, left: '44px', right: '36px', height: '40px', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'rgba(0,0,0,0.60)', borderBottom: '1px solid rgba(229,195,101,0.2)' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '2.5px', color: 'rgba(229,195,101,0.8)', textTransform: 'uppercase' }}>
                  SPECIMEN // 2026 EDITION
                </span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', fontWeight: 700, color: theme.color, letterSpacing: '1px' }}>
                  {card.rarity}
                </span>
              </div>

              {/* HERO PFP fills upper area */}
              <div style={{ position: 'absolute', top: '40px', left: '44px', right: '36px', bottom: '190px', zIndex: 4, overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt={card.handle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.handle)}&background=0A0D0C&color=E5C365&size=400&bold=true`; }}
                />
                {/* bottom fade */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent 0%, rgba(7,10,9,0.95) 100%)', pointerEvents: 'none' }} />
              </div>

              {/* SIGNATURE */}
              <div style={{ position: 'absolute', top: '42px', left: '50%', transform: 'translateX(-40%) rotate(-7deg)', zIndex: 7, fontFamily: "'Caveat','Dancing Script',cursive", fontSize: '28px', fontWeight: 700, color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(229,195,101,0.6)', whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none' }}>
                @{card.handle}
              </div>

              {/* BOTTOM info block */}
              <div style={{ position: 'absolute', bottom: '54px', left: '44px', right: '36px', padding: '14px 16px 10px', zIndex: 6, display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(7,10,9,0.85)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontFamily: "'Bebas Neue','Impact','Arial Black',sans-serif", fontSize: '26px', fontWeight: 900, letterSpacing: '2px', color: '#FFFFFF', textTransform: 'uppercase', lineHeight: 1.0, textShadow: `0 0 20px ${theme.glow}` }}>
                  {card.title}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', fontWeight: 700, color: theme.color, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.9 }}>
                  {card.finalitySpeed} &nbsp;•&nbsp; FRICTION {card.frictionRate}
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ fontSize: '14px', color: i < theme.stars ? '#F59E0B' : 'rgba(255,255,255,0.15)', textShadow: i < theme.stars ? '0 0 8px rgba(245,158,11,0.8)' : 'none' }}>★</span>
                  ))}
                </div>
              </div>

              {/* FOOTER IN-CARD ACTIONS */}
              <div style={{ position: 'absolute', bottom: 0, left: '44px', right: '36px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', zIndex: 5, background: 'rgba(0,0,0,0.75)', borderTop: '1px solid rgba(229,195,101,0.2)' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '7.5px', letterSpacing: '1px', color: 'rgba(229,195,101,0.5)', textTransform: 'uppercase' }}>
                  WWW.RIALO.IO
                </span>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    title="Download HD PNG Card"
                    style={{
                      padding: '5px 9px',
                      background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.glow} 100%)`,
                      color: '#010101',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '8.5px',
                      fontWeight: 900,
                      cursor: downloading ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      letterSpacing: '0.5px',
                      boxShadow: `0 0 10px ${theme.glow}`,
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    <Download size={9} /> {downloading ? 'SAVING...' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyImage}
                    disabled={copying}
                    title="Copy Card Image to Clipboard"
                    style={{
                      padding: '5px 9px',
                      background: copiedStatus ? 'rgba(169, 221, 211, 0.25)' : 'rgba(255,255,255,0.07)',
                      border: copiedStatus ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.18)',
                      color: copiedStatus ? '#A9DDD3' : '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '8.5px',
                      fontWeight: 700,
                      cursor: copying ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    {copiedStatus ? <Check size={9} color="#A9DDD3" /> : <Copy size={9} />}
                    {copiedStatus === 'IMAGE' ? 'COPIED!' : copiedStatus === 'TEXT' ? 'TEXT' : 'COPY'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Share Card"
                    style={{
                      padding: '5px 9px',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '8.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    <Share2 size={9} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── PRIMARY PROMINENT ACTION CONTROLS ── */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '440px' }}>
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #A9DDD3 0%, #00F0FF 100%)',
                color: '#010101',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: downloading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 16px rgba(169,221,211,0.3)',
                transition: 'all 0.2s',
              }}
            >
              <Download size={14} />
              {downloading ? 'Generating PNG...' : 'Download Card (PNG)'}
            </button>

            {/* Copy Card Image Button */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={copying}
              style={{
                padding: '9px 16px',
                background: copiedStatus ? 'rgba(169,221,211,0.2)' : 'rgba(255,255,255,0.05)',
                border: copiedStatus ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.15)',
                color: copiedStatus ? '#A9DDD3' : '#E8E3D5',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: copying ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {copiedStatus ? <Check size={14} color="#A9DDD3" /> : <Copy size={14} />}
              {copiedStatus === 'IMAGE' ? 'Image Copied! (Ready to paste)' : copiedStatus === 'TEXT' ? 'Link Copied!' : 'Copy Card Image'}
            </button>

            {/* Share to X */}
            <button
              type="button"
              onClick={handleShare}
              style={{
                padding: '9px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#E8E3D5',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Share2 size={14} /> Share to X
            </button>

            {/* Reshuffle Archetype */}
            <button
              type="button"
              onClick={handleReshuffle}
              style={{
                padding: '9px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#8E9B97',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={13} /> Reshuffle
            </button>

            {/* Edit Card Button */}
            <button
              type="button"
              onClick={() => { setEditMode(v => !v); sound.playTap(); }}
              style={{
                padding: '9px 16px',
                background: editMode ? 'rgba(169,221,211,0.15)' : 'rgba(255,255,255,0.05)',
                border: editMode ? '1px solid rgba(169,221,211,0.4)' : '1px solid rgba(255,255,255,0.15)',
                color: editMode ? '#A9DDD3' : '#E8E3D5',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Edit3 size={13} /> {editMode ? 'Hide Editor' : 'Edit Card'}
            </button>
          </div>

          {/* ── EDIT PANEL ── */}
          {editMode && (
            <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#A9DDD3', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={12} /> Card Editor
              </div>

              {/* Title */}
              <EditField label="Card Title" value={card.title} onChange={v => setCard(prev => prev ? { ...prev, title: v } : prev)} />

              {/* Rarity selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Rarity</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(['MYTHIC','LEGENDARY','EPIC','RARE','COMMON'] as Rarity[]).map(r => {
                    const t = rarityTheme(r);
                    return (
                      <button key={r} type="button" onClick={() => setCard(prev => prev ? { ...prev, rarity: r } : prev)} style={{ padding: '5px 12px', borderRadius: '9999px', border: card.rarity === r ? `1.5px solid ${t.color}` : '1px solid rgba(255,255,255,0.1)', background: card.rarity === r ? `${t.color}22` : 'rgba(255,255,255,0.03)', color: card.rarity === r ? t.color : '#8E9B97', fontSize: '10px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.2s', boxShadow: card.rarity === r ? `0 0 10px ${t.glow}` : 'none' }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Finality speed */}
              <EditField label="Finality Speed" value={card.finalitySpeed} onChange={v => setCard(prev => prev ? { ...prev, finalitySpeed: v } : prev)} monospace />

              {/* Friction rate */}
              <EditField label="Friction Rate" value={card.frictionRate} onChange={v => setCard(prev => prev ? { ...prev, frictionRate: v } : prev)} monospace />

              {/* Image section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Card Image</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '7px 14px', background: 'rgba(169,221,211,0.1)', border: '1px solid rgba(169,221,211,0.3)', color: '#A9DDD3', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Upload size={12} /> Upload Image
                  </button>
                  {card.useCustomImage && (
                    <button type="button" onClick={resetToXAvatar} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#8E9B97', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      Use X Avatar
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
