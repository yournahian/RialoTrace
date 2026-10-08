'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Layers,
  Award,
  Swords,
  TrendingUp,
  Star,
} from 'lucide-react';
// Logo import removed for pure word mark typography
import { sound } from '@/lib/soundFx';

/**
 * STRICT 3-COLOR RIALO PALETTE ENFORCEMENT:
 * 1. #010101 (Obsidian Black) - Primary backgrounds and base containers
 * 2. #A9DDD3 (Rialo Mint) - Accents, primary buttons, borders, highlights, active states
 * 3. #E8E3D5 (Rialo Cream/Bone) - Typography, headings, subtle borders, secondary text
 */

interface LandingPageProps {
  onLaunchApp: () => void;
  onExploreSection?: (tab: string) => void;
  currentUsername?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onExploreSection,
  currentUsername,
}) => {
  // 3D Tilt for Hero Pack
  const heroPackRef = useRef<HTMLDivElement>(null);
  const [packTilt, setPackTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isPackHovered, setIsPackHovered] = useState(false);

  const handleHeroPackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroPackRef.current) return;
    const rect = heroPackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -14;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 14;
    setPackTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleHeroPackLeave = () => {
    setPackTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    setIsPackHovered(false);
  };

  const handleHeroPackEnter = () => {
    setIsPackHovered(true);
    sound.playTap();
  };

  const handleButtonClick = (action?: () => void) => {
    sound.playTap();
    if (action) action();
  };

  // 4 Showcase Packs (Color-Coded by Tier & Rarity)
  const packTiers = [
    {
      id: 'genesis',
      name: 'GENESIS WAVE 1',
      sub: 'DAILY DROP • TIER 0',
      method: 'FREE DAILY CLAIM',
      tag: 'FEATURED',
      packImage: '/packs/pack_genesis.jpg',
      rarity: 'Common to Mythic',
      cardsCount: '3 CARDS',
      desc: 'Contains 3 randomized cards with guaranteed Common or Rare, plus chance for the Mythic Sub-Second Devourer.',
      color: '#A9DDD3',
      colorSecondary: '#22D3EE',
      accentGlow: 'rgba(169, 221, 211, 0.45)',
      bgGlow: 'rgba(169, 221, 211, 0.12)',
      borderNormal: 'rgba(169, 221, 211, 0.32)',
      tagBg: 'rgba(169, 221, 211, 0.12)',
      tagBorder: 'rgba(169, 221, 211, 0.55)',
      tagText: '#A9DDD3',
      foilTint: 'linear-gradient(135deg, rgba(34, 211, 238, 0.55) 0%, rgba(169, 221, 211, 0.3) 50%, rgba(20, 184, 166, 0.55) 100%)',
      sheenTint: 'radial-gradient(circle at 50% 25%, rgba(169, 221, 211, 0.65) 0%, transparent 65%)',
      btnBg: 'rgba(169, 221, 211, 0.1)',
      btnBorder: 'rgba(169, 221, 211, 0.4)',
      btnHoverBg: '#A9DDD3',
      btnHoverText: '#010101',
    },
    {
      id: 'void',
      name: 'VOID CYBERSAMURAI',
      sub: 'MYTHIC EDITION',
      method: 'FORGE SYNTHESIS',
      tag: 'MYTHIC',
      packImage: '/packs/pack_void.jpg',
      rarity: 'Epic & Mythic Pool',
      cardsCount: '4 CARDS',
      desc: 'Synthesized in The Forge using recyclable duplicates. Higher density of executioner and ronin archetypes.',
      color: '#C084FC',
      colorSecondary: '#A855F7',
      accentGlow: 'rgba(168, 85, 247, 0.5)',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
      borderNormal: 'rgba(168, 85, 247, 0.4)',
      tagBg: 'rgba(168, 85, 247, 0.18)',
      tagBorder: 'rgba(192, 132, 252, 0.65)',
      tagText: '#E9D5FF',
      foilTint: 'linear-gradient(135deg, rgba(168, 85, 247, 0.72) 0%, rgba(147, 51, 234, 0.38) 50%, rgba(192, 132, 252, 0.65) 100%)',
      sheenTint: 'radial-gradient(circle at 50% 25%, rgba(216, 180, 254, 0.7) 0%, transparent 65%)',
      btnBg: 'rgba(168, 85, 247, 0.14)',
      btnBorder: 'rgba(192, 132, 252, 0.5)',
      btnHoverBg: '#A855F7',
      btnHoverText: '#FFFFFF',
    },
    {
      id: 'superconductor',
      name: 'SUPERCONDUCTOR',
      sub: 'LEGENDARY APEX',
      method: 'MISSION VAULT',
      tag: 'HIGH VELOCITY',
      packImage: '/packs/pack_superconductor.jpg',
      rarity: 'Legendary Guaranteed',
      cardsCount: '3 CARDS',
      desc: 'Awarded to top engagement streaks and arcade milestones. Infused with zero-friction consensus energy.',
      color: '#FBBF24',
      colorSecondary: '#F59E0B',
      accentGlow: 'rgba(245, 158, 11, 0.5)',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      borderNormal: 'rgba(245, 158, 11, 0.4)',
      tagBg: 'rgba(245, 158, 11, 0.18)',
      tagBorder: 'rgba(251, 191, 36, 0.65)',
      tagText: '#FEF08A',
      foilTint: 'linear-gradient(135deg, rgba(245, 158, 11, 0.75) 0%, rgba(217, 119, 6, 0.38) 50%, rgba(251, 191, 36, 0.65) 100%)',
      sheenTint: 'radial-gradient(circle at 50% 25%, rgba(254, 240, 138, 0.7) 0%, transparent 65%)',
      btnBg: 'rgba(245, 158, 11, 0.14)',
      btnBorder: 'rgba(251, 191, 36, 0.5)',
      btnHoverBg: '#F59E0B',
      btnHoverText: '#010101',
    },
    {
      id: 'zero-friction',
      name: 'ZERO-FRICTION GRAIL',
      sub: 'LIMITED RUN 2026',
      method: 'ARENA GRAIL',
      tag: 'APEX GRAIL',
      packImage: '/packs/pack_apex.jpg',
      rarity: '1-of-1 Mythic Pool',
      cardsCount: '5 CARDS',
      desc: 'The crown jewel of the RialoTrace ecosystem. Unlocks custom holographic animated foil export parameters.',
      color: '#FB7185',
      colorSecondary: '#F43F5E',
      accentGlow: 'rgba(244, 63, 94, 0.55)',
      bgGlow: 'rgba(244, 63, 94, 0.16)',
      borderNormal: 'rgba(244, 63, 94, 0.45)',
      tagBg: 'rgba(244, 63, 94, 0.2)',
      tagBorder: 'rgba(251, 113, 133, 0.7)',
      tagText: '#FFE4E6',
      foilTint: 'linear-gradient(135deg, rgba(244, 63, 94, 0.8) 0%, rgba(225, 29, 72, 0.42) 50%, rgba(251, 113, 133, 0.65) 100%)',
      sheenTint: 'radial-gradient(circle at 50% 25%, rgba(255, 228, 230, 0.75) 0%, transparent 65%)',
      btnBg: 'rgba(244, 63, 94, 0.15)',
      btnBorder: 'rgba(251, 113, 133, 0.55)',
      btnHoverBg: '#F43F5E',
      btnHoverText: '#FFFFFF',
    },
  ];

  // 5 Slabs for "SOMEONE JUST PULLED THIS"
  const recentPulls = [
    {
      title: 'Sub-Second Devourer',
      cardId: 'devourer',
      rarity: 'MYTHIC',
      grade: 'GEM MINT 10',
      image: '/cards/devourer.png',
      edition: 'GENESIS APEX',
      serial: '#0003/1000',
      tiltDeg: -6,
    },
    {
      title: 'Cyber Ronin',
      cardId: 'cyber_ronin',
      rarity: 'LEGENDARY',
      grade: 'PRISTINE 9.5',
      image: '/cards/cyber_ronin.png',
      edition: 'CONSENSUS WARRIOR',
      serial: '#0142/2500',
      tiltDeg: -3,
    },
    {
      title: 'Parallel Sovereign',
      cardId: 'sovereign',
      rarity: 'LEGENDARY',
      grade: 'GEM MINT 10',
      image: '/cards/sovereign.png',
      edition: 'PARALLEL CLUSTER',
      serial: '#0001/0500',
      tiltDeg: 0,
      isFeatured: true,
    },
    {
      title: 'State Architecture',
      cardId: 'architect',
      rarity: 'EPIC',
      grade: 'MINT 9.0',
      image: '/cards/architect.png',
      edition: 'PIPELINE ENGINEER',
      serial: '#0455/5000',
      tiltDeg: 3,
    },
    {
      title: 'Chronomancer',
      cardId: 'chronomancer',
      rarity: 'MYTHIC',
      grade: 'GEM MINT 10',
      image: '/cards/chronomancer.png',
      edition: 'SUB-SECOND TEMPORAL',
      serial: '#0021/1000',
      tiltDeg: 6,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#010101',
        color: '#E8E3D5',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Ambience: Strictly #A9DDD3 & #E8E3D5 subtle glows on #010101 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '650px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(169, 221, 211, 0.12) 0%, rgba(232, 227, 213, 0.04) 45%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(232, 227, 213, 0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.6,
        }}
      />

      {/* ======================================================== */}
      {/* 1. TOP STICKY NAVBAR WITH OFFICIAL RIALO BRAND LOGO     */}
      {/* ======================================================== */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(1, 1, 1, 0.92)',
          borderBottom: '1px solid rgba(169, 221, 211, 0.18)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Rialo Trace Word Mark Only (No Logo) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontWeight: 900,
                fontSize: '22px',
                letterSpacing: '-0.02em',
                color: '#E8E3D5',
              }}
            >
              Rialo<span style={{ color: '#A9DDD3' }}>Trace</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: "'Space Mono', monospace",
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(169, 221, 211, 0.12)',
                border: '1px solid rgba(169, 221, 211, 0.4)',
                color: '#A9DDD3',
                fontWeight: 700,
                letterSpacing: '0.8px',
              }}
            >
              TESTNET
            </span>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(232, 227, 213, 0.7)',
            letterSpacing: '0.5px',
          }}
          className="hidden md:flex"
        >
          <a
            href="#packs"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A9DDD3')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232, 227, 213, 0.7)')}
          >
            PACKS
          </a>
          <a
            href="#pulls"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A9DDD3')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232, 227, 213, 0.7)')}
          >
            SLABS
          </a>
          <a
            href="#pillars"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A9DDD3')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232, 227, 213, 0.7)')}
          >
            TERMINAL
          </a>
          <a
            href="#community"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A9DDD3')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232, 227, 213, 0.7)')}
          >
            SWARM
          </a>
          <a
            href="#reputation"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A9DDD3')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232, 227, 213, 0.7)')}
          >
            PROTOCOL
          </a>
        </div>

        {/* Right Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => handleButtonClick(() => onLaunchApp())}
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              backgroundColor: '#A9DDD3',
              border: '1px solid #A9DDD3',
              color: '#010101',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '18px',
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(169, 221, 211, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(169, 221, 211, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(169, 221, 211, 0.35)';
            }}
          >
            <span>{currentUsername ? `ENTER AS @${currentUsername}` : 'LAUNCH APP'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO SECTION WITH 3D HOLOGRAPHIC BOOSTER PACK        */}
      {/* ======================================================== */}
      <section
        id="hero"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '50px 20px 70px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Top Tag Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '9999px',
            background: 'rgba(169, 221, 211, 0.1)',
            border: '1px solid rgba(169, 221, 211, 0.35)',
            color: '#A9DDD3',
            fontSize: '12px',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            letterSpacing: '1px',
            marginBottom: '24px',
            boxShadow: '0 0 25px rgba(169, 221, 211, 0.15)',
          }}
        >
          <Sparkles size={14} color="#A9DDD3" />
          <span>RIALO NETWORK ZERO-FRICTION COLLECTOR VAULT</span>
        </div>

        {/* Big Impact Headline */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: '0.92',
            letterSpacing: '2px',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            color: '#E8E3D5',
            textShadow: '0 0 40px rgba(232, 227, 213, 0.15)',
          }}
        >
          RIP THE PACK.
          <br />
          <span
            style={{
              color: '#A9DDD3',
              textShadow: '0 0 40px rgba(169, 221, 211, 0.5)',
            }}
          >
            OWN THE PROTOCOL.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            maxWidth: '640px',
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'rgba(232, 227, 213, 0.7)',
            margin: '0 auto 36px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          The sovereign social analytics terminal and gamified digital collector vault for Rialo Network.
          Track creator momentum, rip daily booster packs, and challenge peers in the Versus Arena.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          <button
            type="button"
            onClick={() => handleButtonClick(() => onLaunchApp())}
            style={{
              padding: '14px 38px',
              borderRadius: '9999px',
              backgroundColor: '#A9DDD3',
              border: '1px solid #A9DDD3',
              color: '#010101',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '22px',
              letterSpacing: '1.2px',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(169, 221, 211, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(169, 221, 211, 0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(169, 221, 211, 0.4)';
            }}
          >
            <Zap size={22} color="#010101" />
            <span>RIP FREE GENESIS PACK</span>
            <ArrowRight size={20} />
          </button>

          <button
            type="button"
            onClick={() => {
              handleButtonClick(() => {
                if (onExploreSection) onExploreSection('leaderboard');
                else onLaunchApp();
              });
            }}
            style={{
              padding: '14px 32px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(232, 227, 213, 0.05)',
              border: '1px solid rgba(169, 221, 211, 0.3)',
              color: '#E8E3D5',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '20px',
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(169, 221, 211, 0.12)';
              e.currentTarget.style.borderColor = '#A9DDD3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(232, 227, 213, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(169, 221, 211, 0.3)';
            }}
          >
            <TrendingUp size={18} color="#A9DDD3" />
            <span>EXPLORE LEADERBOARD</span>
          </button>
        </div>

        {/* ====================================================== */}
        {/* HERO 3D PACK DISPLAY (Using the Real 3D Pack Asset)     */}
        {/* ====================================================== */}
        <div
          style={{
            perspective: '1200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            margin: '0 auto',
          }}
        >
          {/* Outer Pulsing Glow */}
          <div
            style={{
              position: 'absolute',
              inset: '-30px',
              background: 'radial-gradient(circle, rgba(169, 221, 211, 0.25) 0%, transparent 70%)',
              filter: 'blur(50px)',
              borderRadius: '50%',
              pointerEvents: 'none',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />

          {/* Interactive 3D Pack Container */}
          <div
            ref={heroPackRef}
            onMouseMove={handleHeroPackMouseMove}
            onMouseEnter={handleHeroPackEnter}
            onMouseLeave={handleHeroPackLeave}
            onClick={() => handleButtonClick(() => onLaunchApp())}
            style={{
              width: '330px',
              height: '450px',
              borderRadius: '20px',
              position: 'relative',
              cursor: 'pointer',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${packTilt.x}deg) rotateY(${packTilt.y}deg) scale(${isPackHovered ? 1.05 : 1})`,
              transition: isPackHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
              boxShadow: isPackHovered
                ? '0 30px 60px rgba(1, 1, 1, 0.95), 0 0 45px rgba(169, 221, 211, 0.5)'
                : '0 20px 45px rgba(1, 1, 1, 0.85), 0 0 30px rgba(169, 221, 211, 0.25)',
              overflow: 'hidden',
              backgroundColor: '#010101',
              border: '1px solid rgba(169, 221, 211, 0.4)',
            }}
          >
            {/* The Real 3D Pack Image Artwork */}
            <img
              src="/packs/rialo_pack_holographic.jpg"
              alt="RialoTrace 3D Booster Pack"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Dynamic Glare Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at ${packTilt.glareX}% ${packTilt.glareY}%, rgba(232, 227, 213, 0.3) 0%, rgba(169, 221, 211, 0.15) 30%, transparent 65%)`,
                mixBlendMode: 'overlay',
              }}
            />
          </div>
        </div>

        {/* Protocol Architecture Features (Strict 3 Colors) */}
        <div
          style={{
            marginTop: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(20px, 3vw, 40px)',
            flexWrap: 'wrap',
            padding: '16px 32px',
            borderRadius: '18px',
            backgroundColor: 'rgba(1, 1, 1, 0.9)',
            border: '1px solid rgba(169, 221, 211, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(1, 1, 1, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="#A9DDD3" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#E8E3D5', letterSpacing: '0.8px' }}>
                SUB-SECOND BFT
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(232, 227, 213, 0.6)' }}>
                INSTANT FINALITY
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(169, 221, 211, 0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#A9DDD3" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#E8E3D5', letterSpacing: '0.8px' }}>
                30 ARCHETYPES
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(232, 227, 213, 0.6)' }}>
                GENESIS COLLECTOR SET
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(169, 221, 211, 0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="#A9DDD3" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#E8E3D5', letterSpacing: '0.8px' }}>
                ANTI-SYBIL VERIFIED
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(232, 227, 213, 0.6)' }}>
                AUTHENTIC CREATOR PROOF
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(169, 221, 211, 0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={18} color="#A9DDD3" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#E8E3D5', letterSpacing: '0.8px' }}>
                ZERO TRANSACTION FRICTION
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(232, 227, 213, 0.6)' }}>
                RIALO NATIVE PROTOCOL
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION: FIND YOUR NEXT PULL (Real Booster Packs)     */}
      {/* ======================================================== */}
      <section
        id="packs"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 24px',
          maxWidth: '1260px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#A9DDD3',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            // PACK EDITIONS & REWARD POOLS
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(38px, 5vw, 64px)',
              letterSpacing: '2px',
              margin: '0 0 12px 0',
              color: '#E8E3D5',
            }}
          >
            FIND YOUR NEXT PULL
          </h2>
          <p
            style={{
              color: 'rgba(232, 227, 213, 0.7)',
              fontSize: '15px',
              maxWidth: '580px',
              margin: '0 auto',
            }}
          >
            Rip packs daily for free or earn advanced editions through The Forge, Daily Missions,
            and Versus Arena triumphs.
          </p>
        </div>

        {/* 4 Packs Grid Featuring Real 3D Pack Artwork */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '24px',
          }}
        >
          {packTiers.map((pack) => (
            <div
              key={pack.id}
              onClick={() => handleButtonClick(() => onLaunchApp())}
              style={{
                borderRadius: '22px',
                background: `linear-gradient(180deg, ${pack.bgGlow} 0%, rgba(6, 9, 8, 0.98) 100%)`,
                border: `1.5px solid ${pack.borderNormal}`,
                padding: '24px 20px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '470px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: `0 15px 35px rgba(0, 0, 0, 0.85), 0 0 20px ${pack.bgGlow}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.95), 0 0 40px ${pack.accentGlow}`;
                e.currentTarget.style.borderColor = pack.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.85), 0 0 20px ${pack.bgGlow}`;
                e.currentTarget.style.borderColor = pack.borderNormal;
              }}
            >
              {/* Atmospheric Ambient Glow Beam at Top */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  height: '140px',
                  background: `radial-gradient(ellipse at center, ${pack.accentGlow} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                  opacity: 0.65,
                }}
              />

              {/* Top Tag & Card Count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontFamily: "'Space Mono', monospace",
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: pack.tagBg,
                    border: `1px solid ${pack.tagBorder}`,
                    color: pack.tagText,
                    fontWeight: 800,
                    letterSpacing: '0.6px',
                    boxShadow: `0 0 14px ${pack.accentGlow}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: pack.color,
                      boxShadow: `0 0 8px ${pack.color}`,
                    }}
                  />
                  {pack.tag}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'Space Mono', monospace",
                    color: 'rgba(232, 227, 213, 0.85)',
                    fontWeight: 700,
                  }}
                >
                  {pack.cardsCount}
                </span>
              </div>

              {/* Real 3D Booster Pack Image Colorized to Rarity & Tier */}
              <div
                style={{
                  margin: '20px auto 16px',
                  width: '148px',
                  height: '218px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: `0 14px 32px rgba(0, 0, 0, 0.88), 0 0 28px ${pack.accentGlow}`,
                  border: `1.5px solid ${pack.borderNormal}`,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  background: '#040706',
                }}
              >
                {/* Base 3D Pack Render */}
                <img
                  src={pack.packImage}
                  alt={pack.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* 1. Color Tint Layer (Tint the metallic foil to match rarity) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: pack.foilTint,
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                  }}
                />

                {/* 2. Holographic Overlay & Depth Vibrancy */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: pack.foilTint,
                    mixBlendMode: 'overlay',
                    opacity: 0.85,
                    pointerEvents: 'none',
                  }}
                />

                {/* 3. Radiant Specular Foil Sheen */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: pack.sheenTint,
                    mixBlendMode: 'screen',
                    opacity: 0.6,
                    pointerEvents: 'none',
                  }}
                />

                {/* Micro Rarity Watermark Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(4, 7, 6, 0.82)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${pack.borderNormal}`,
                    color: pack.color,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '8.5px',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {pack.rarity.toUpperCase()}
                </div>
              </div>

              {/* Bottom Pack Info */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '27px',
                    letterSpacing: '1.2px',
                    color: '#E8E3D5',
                    marginBottom: '3px',
                    textShadow: `0 0 20px ${pack.color}33`,
                  }}
                >
                  {pack.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: pack.color,
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ color: pack.color }}>⚡</span>
                  <span>{pack.method}</span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(232, 227, 213, 0.72)',
                    lineHeight: '1.5',
                    marginBottom: '18px',
                    minHeight: '40px',
                  }}
                >
                  {pack.desc}
                </p>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: '12px',
                    background: pack.btnBg,
                    border: `1.5px solid ${pack.btnBorder}`,
                    color: '#E8E3D5',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '18px',
                    letterSpacing: '1.2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = pack.btnHoverBg;
                    e.currentTarget.style.color = pack.btnHoverText;
                    e.currentTarget.style.borderColor = pack.color;
                    e.currentTarget.style.boxShadow = `0 0 25px ${pack.accentGlow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = pack.btnBg;
                    e.currentTarget.style.color = '#E8E3D5';
                    e.currentTarget.style.borderColor = pack.btnBorder;
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <span>PULL THIS PACK</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION: SOMEONE JUST PULLED THIS (Graded Slabs)      */}
      {/* ======================================================== */}
      <section
        id="pulls"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '90px 24px',
          backgroundColor: '#010101',
          borderTop: '1px solid rgba(169, 221, 211, 0.15)',
          borderBottom: '1px solid rgba(169, 221, 211, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#A9DDD3',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            // VERIFIED ON-CHAIN ARTIFACTS
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(38px, 5vw, 64px)',
              letterSpacing: '2px',
              margin: '0 0 12px 0',
              color: '#E8E3D5',
            }}
          >
            SOMEONE JUST PULLED THIS
          </h2>
          <p
            style={{
              color: 'rgba(232, 227, 213, 0.7)',
              fontSize: '15px',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Verified pulls permanently encapsulated into high-grade digital collector slabs. Every card
            carries cryptographic proof-of-work.
          </p>
        </div>

        {/* Fan-Out / Perspective Cards Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            flexWrap: 'wrap',
            perspective: '1000px',
            maxWidth: '1280px',
            margin: '0 auto',
          }}
        >
          {recentPulls.map((pull, idx) => (
            <div
              key={idx}
              onClick={() => handleButtonClick(() => onLaunchApp())}
              style={{
                width: '230px',
                borderRadius: '18px',
                background: 'rgba(1, 1, 1, 0.95)',
                border: pull.isFeatured
                  ? '2px solid #A9DDD3'
                  : '1px solid rgba(169, 221, 211, 0.25)',
                boxShadow: pull.isFeatured
                  ? '0 20px 45px rgba(169, 221, 211, 0.25)'
                  : '0 15px 35px rgba(1, 1, 1, 0.8)',
                transform: `rotate(${pull.tiltDeg}deg) scale(${pull.isFeatured ? 1.05 : 0.96})`,
                transition: 'all 0.35s ease',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                zIndex: pull.isFeatured ? 10 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1.08) translateY(-10px)';
                e.currentTarget.style.zIndex = '20';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(1, 1, 1, 0.9), 0 0 35px rgba(169, 221, 211, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${pull.tiltDeg}deg) scale(${pull.isFeatured ? 1.05 : 0.96})`;
                e.currentTarget.style.zIndex = pull.isFeatured ? '10' : '1';
                e.currentTarget.style.boxShadow = pull.isFeatured
                  ? '0 20px 45px rgba(169, 221, 211, 0.25)'
                  : '0 15px 35px rgba(1, 1, 1, 0.8)';
              }}
            >
              {/* Graded Slab Label Header (PSA / BGS Aesthetic in #010101, #A9DDD3, #E8E3D5) */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#010101',
                  borderBottom: '1px solid rgba(169, 221, 211, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '8px',
                      color: '#A9DDD3',
                      letterSpacing: '1px',
                    }}
                  >
                    RIALO VAULT
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#E8E3D5',
                    }}
                  >
                    {pull.serial}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#A9DDD3',
                    color: '#010101',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '14px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {pull.grade}
                </div>
              </div>

              {/* Card Artwork Image Container */}
              <div
                style={{
                  height: '210px',
                  width: '100%',
                  position: 'relative',
                  backgroundColor: '#010101',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={pull.image}
                  alt={pull.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 60%, rgba(1, 1, 1, 0.95) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#010101',
                    border: '1px solid #A9DDD3',
                    color: '#A9DDD3',
                    fontSize: '9px',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {pull.rarity}
                </div>
              </div>

              {/* Card Info */}
              <div style={{ padding: '14px 14px 18px' }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '20px',
                    letterSpacing: '1px',
                    color: '#E8E3D5',
                    lineHeight: '1.1',
                    marginBottom: '4px',
                  }}
                >
                  {pull.title}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'rgba(232, 227, 213, 0.65)',
                    fontFamily: "'Space Mono', monospace",
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ color: '#A9DDD3' }}>{pull.edition}</span>
                </div>

                {/* Stars Rating (in #A9DDD3) */}
                <div style={{ display: 'flex', gap: '3px', color: '#A9DDD3' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#A9DDD3" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION: ONE TERMINAL. THREE WAYS TO DOMINATE.         */}
      {/* ======================================================== */}
      <section
        id="pillars"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '100px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#A9DDD3',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            // ARCHITECTURE & UTILITY
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(38px, 5vw, 64px)',
              letterSpacing: '2px',
              margin: '0 0 12px 0',
              color: '#E8E3D5',
            }}
          >
            ONE TERMINAL. THREE WAYS TO DOMINATE.
          </h2>
          <p
            style={{
              color: 'rgba(232, 227, 213, 0.7)',
              fontSize: '15px',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            A high-octane Web3 gaming and social layer built specifically to supercharge the Rialo
            ecosystem.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Pillar 1 */}
          <div
            onClick={() => handleButtonClick(() => (onExploreSection ? onExploreSection('cards') : onLaunchApp()))}
            style={{
              backgroundColor: 'rgba(1, 1, 1, 0.85)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
              borderRadius: '24px',
              padding: '36px 30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = '#A9DDD3';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(169, 221, 211, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(169, 221, 211, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(169, 221, 211, 0.1)',
                border: '1px solid rgba(169, 221, 211, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <Layers size={28} color="#A9DDD3" />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#A9DDD3',
                letterSpacing: '1px',
                marginBottom: '6px',
                fontWeight: 700,
              }}
            >
              01 // PACKS & BINDER
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '30px',
                letterSpacing: '1px',
                color: '#E8E3D5',
                margin: '0 0 14px 0',
              }}
            >
              RIP & COLLECT DIGITAL SLABS
            </h3>
            <p
              style={{
                color: 'rgba(232, 227, 213, 0.7)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              Open daily free booster packs, collect 30+ unique archetype cards, trade with peers on
              the marketplace, and export 4K high-res slabs for Twitter flexing.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#A9DDD3',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '18px',
                letterSpacing: '0.8px',
              }}
            >
              <span>EXPLORE CARD BINDER</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => handleButtonClick(() => (onExploreSection ? onExploreSection('proof') : onLaunchApp()))}
            style={{
              backgroundColor: 'rgba(1, 1, 1, 0.85)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
              borderRadius: '24px',
              padding: '36px 30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = '#A9DDD3';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(169, 221, 211, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(169, 221, 211, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(169, 221, 211, 0.1)',
                border: '1px solid rgba(169, 221, 211, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <TrendingUp size={28} color="#A9DDD3" />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#A9DDD3',
                letterSpacing: '1px',
                marginBottom: '6px',
                fontWeight: 700,
              }}
            >
              02 // ENGAGEMENT ENGINE
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '30px',
                letterSpacing: '1px',
                color: '#E8E3D5',
                margin: '0 0 14px 0',
              }}
            >
              SOCIAL PROOF-OF-WORK
            </h3>
            <p
              style={{
                color: 'rgba(232, 227, 213, 0.7)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              Real-time viral reach auditing, sybil-resistant impression multipliers, and dynamic
              percentile tiers. Earn Shards automatically as your posts surge across X.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#A9DDD3',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '18px',
                letterSpacing: '0.8px',
              }}
            >
              <span>AUDIT YOUR HANDLE</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => handleButtonClick(() => (onExploreSection ? onExploreSection('versus') : onLaunchApp()))}
            style={{
              backgroundColor: 'rgba(1, 1, 1, 0.85)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
              borderRadius: '24px',
              padding: '36px 30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = '#A9DDD3';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(169, 221, 211, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(169, 221, 211, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(169, 221, 211, 0.1)',
                border: '1px solid rgba(169, 221, 211, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <Swords size={28} color="#A9DDD3" />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#A9DDD3',
                letterSpacing: '1px',
                marginBottom: '6px',
                fontWeight: 700,
              }}
            >
              03 // VERSUS ARENA
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '30px',
                letterSpacing: '1px',
                color: '#E8E3D5',
                margin: '0 0 14px 0',
              }}
            >
              CREATOR SHOWDOWN DUELS
            </h3>
            <p
              style={{
                color: 'rgba(232, 227, 213, 0.7)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              Lock horns with rival creators in 1v1 viral duels. High-stakes stat comparisons, live
              chat cheerleading in the Trollbox, and trophy badges to immortalize your wins.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#A9DDD3',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '18px',
                letterSpacing: '0.8px',
              }}
            >
              <span>ENTER THE ARENA</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INFINITE RUNNING MARQUEE TICKER                       */}
      {/* ======================================================== */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#A9DDD3',
          color: '#010101',
          padding: '14px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '22px',
          letterSpacing: '3px',
          boxShadow: '0 0 35px rgba(169, 221, 211, 0.35)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            animation: 'ticker 25s linear infinite',
          }}
        >
          ★ RIALO TRACE ★ SUB-SECOND FINALITY ★ ZERO-FRICTION CONSENSUS ★ RIP THE PACK ★ DOMINATE
          THE ARENA ★ VERIFIED PROOF OF WORK ★ RIALO TRACE ★ SUB-SECOND FINALITY ★ ZERO-FRICTION
          CONSENSUS ★ RIP THE PACK ★ DOMINATE THE ARENA ★
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. SECTION: COMMUNITY PULSE                              */}
      {/* ======================================================== */}
      <section
        id="community"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '100px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#A9DDD3',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            // COMMUNITY PULSE
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(38px, 5vw, 64px)',
              letterSpacing: '2px',
              margin: '0 0 12px 0',
              color: '#E8E3D5',
            }}
          >
            BUILT FOR THE RIALO SWARM
          </h2>
          <p
            style={{
              color: 'rgba(232, 227, 213, 0.7)',
              fontSize: '15px',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Join creators, researchers, and alphas stress-testing Rialo Network every single day.
          </p>
        </div>

        {/* Live Ecosystem Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              padding: '28px 24px',
              borderRadius: '20px',
              backgroundColor: 'rgba(1, 1, 1, 0.85)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles size={20} color="#A9DDD3" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#E8E3D5' }}>
                REALTIME TROLLBOX CHAT
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(232, 227, 213, 0.7)', lineHeight: '1.6', margin: 0 }}>
              Live peer-to-peer chat room powered by Supabase Realtime. Tip Shards, challenge creators to
              Versus battles, and share alpha signals without leaving the terminal.
            </p>
          </div>

          <div
            style={{
              padding: '28px 24px',
              borderRadius: '20px',
              backgroundColor: 'rgba(1, 1, 1, 0.85)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <TrendingUp size={20} color="#A9DDD3" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#E8E3D5' }}>
                DYNAMIC PERCENTILE RANKING
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(232, 227, 213, 0.7)', lineHeight: '1.6', margin: 0 }}>
              Calculates dynamic percentile thresholds from the top creators down to novices. Real-time
              leaderboard refresh ensures transparent, verifiable performance.
            </p>
          </div>

          <div
            style={{
              padding: '28px 24px',
              borderRadius: '20px',
              backgroundColor: 'rgba(1, 1, 1, 0.85)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} color="#A9DDD3" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#E8E3D5' }}>
                CRYO STREAK VAULT
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(232, 227, 213, 0.7)', lineHeight: '1.6', margin: '12px 0 0' }}>
              Maintain daily login and engagement streaks to earn Shards, unlock exclusive titles, and
              synthesize rare cards in The Forge.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. SECTION: YOUR COLLECTION. ALWAYS WITHIN REACH.         */}
      {/* ======================================================== */}
      <section
        id="reputation"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '100px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            alignItems: 'center',
          }}
        >
          {/* Left Pitch */}
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                color: '#A9DDD3',
                letterSpacing: '2px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              // SOVEREIGN COLLECTOR VAULT
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(40px, 6vw, 68px)',
                letterSpacing: '2px',
                margin: '0 0 18px 0',
                color: '#E8E3D5',
                lineHeight: '0.95',
              }}
            >
              YOUR COLLECTION.
              <br />
              <span style={{ color: '#A9DDD3' }}>ALWAYS WITHIN REACH.</span>
            </h2>
            <p
              style={{
                color: 'rgba(232, 227, 213, 0.7)',
                fontSize: '15px',
                lineHeight: '1.7',
                marginBottom: '32px',
              }}
            >
              Every badge, streak, card, and viral score you achieve is bound to your profile.
              Whether you are an aspiring crypto researcher or an established creator,
              RialoTrace immortalizes your journey with zero gas friction.
            </p>
            <button
              type="button"
              onClick={() => handleButtonClick(() => onLaunchApp())}
              style={{
                padding: '14px 34px',
                borderRadius: '9999px',
                backgroundColor: '#A9DDD3',
                color: '#010101',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '20px',
                letterSpacing: '1px',
                cursor: 'pointer',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 0 30px rgba(169, 221, 211, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 0 45px rgba(169, 221, 211, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(169, 221, 211, 0.35)';
              }}
            >
              <span>ACCESS YOUR VAULT</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Right 3 Stacked Feature Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(1, 1, 1, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '18px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(169, 221, 211, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={24} color="#A9DDD3" />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    letterSpacing: '1px',
                    color: '#E8E3D5',
                    margin: '0 0 6px 0',
                  }}
                >
                  100% COMMUNITY VERIFIED
                </h4>
                <p style={{ color: 'rgba(232, 227, 213, 0.65)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                  Sybil-resistant ranking prevents bot manipulation. Only authentic community engagement
                  fuels your progress.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(1, 1, 1, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '18px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(169, 221, 211, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={24} color="#A9DDD3" />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    letterSpacing: '1px',
                    color: '#E8E3D5',
                    margin: '0 0 6px 0',
                  }}
                >
                  ZERO-FRICTION SUB-SECOND SPEED
                </h4>
                <p style={{ color: 'rgba(232, 227, 213, 0.65)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                  Claims and trades execute with sub-second finality. No waiting, no unpredictable gas
                  fees.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(1, 1, 1, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '18px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(169, 221, 211, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Award size={24} color="#A9DDD3" />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    letterSpacing: '1px',
                    color: '#E8E3D5',
                    margin: '0 0 6px 0',
                  }}
                >
                  HIGH-RES 4K EXPORT STUDIO
                </h4>
                <p style={{ color: 'rgba(232, 227, 213, 0.65)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                  Generate and download crystal-clear collector cards featuring your custom signature
                  script and serial number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. DRAMATIC FINAL CTA: YOUR NEXT PULL IS WAITING          */}
      {/* ======================================================== */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '120px 24px 100px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(169, 221, 211, 0.18) 0%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#A9DDD3',
              letterSpacing: '3px',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            ▼ TEAR THE SEAL ▼
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(48px, 7vw, 84px)',
              letterSpacing: '2px',
              margin: '0 0 16px 0',
              lineHeight: '0.95',
              color: '#E8E3D5',
              textShadow: '0 0 40px rgba(169, 221, 211, 0.35)',
            }}
          >
            YOUR NEXT PULL
            <br />
            <span style={{ color: '#A9DDD3' }}>IS WAITING.</span>
          </h2>

          <p
            style={{
              color: 'rgba(232, 227, 213, 0.7)',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 auto 36px',
            }}
          >
            Connect your X handle in 5 seconds and open your daily 3-card Genesis Booster Pack right
            now on Rialo Network.
          </p>

          <button
            type="button"
            onClick={() => handleButtonClick(() => onLaunchApp())}
            style={{
              padding: '18px 48px',
              borderRadius: '9999px',
              backgroundColor: '#A9DDD3',
              border: '2px solid rgba(232, 227, 213, 0.5)',
              color: '#010101',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '26px',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              boxShadow: '0 0 45px rgba(169, 221, 211, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 0 65px rgba(169, 221, 211, 0.75)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 45px rgba(169, 221, 211, 0.5)';
            }}
          >
            <Sparkles size={26} color="#010101" />
            <span>ENTER RIALOTRACE TERMINAL</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. LUXURY DARK FOOTER WITH OFFICIAL RIALO LOGO          */}
      {/* ======================================================== */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#010101',
          borderTop: '1px solid rgba(169, 221, 211, 0.18)',
          padding: '60px 24px 40px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '40px',
            marginBottom: '50px',
          }}
        >
          {/* Brand Info - Word Mark Only (No Logo) */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ marginBottom: '14px' }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '24px',
                  letterSpacing: '-0.02em',
                  color: '#E8E3D5',
                }}
              >
                Rialo<span style={{ color: '#A9DDD3' }}>Trace</span>
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(232, 227, 213, 0.65)',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              The sovereign social analytics terminal and gamified digital collector layer for Rialo
              Network. Engineered for sub-second finality and zero transaction friction.
            </p>
            <div
              style={{
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#F87171',
                letterSpacing: '0.5px',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              <span style={{ fontSize: '12px' }}>⚠️</span> NOT AFFILIATED WITH RIALO.IO
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: '#A9DDD3',
                  fontWeight: 700,
                  marginBottom: '14px',
                  letterSpacing: '1px',
                }}
              >
                TERMINAL
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onLaunchApp();
                  }}
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Leaderboards
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onExploreSection) onExploreSection('versus');
                    else onLaunchApp();
                  }}
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Versus Arena
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onExploreSection) onExploreSection('cards');
                    else onLaunchApp();
                  }}
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Pack Opening
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onExploreSection) onExploreSection('arcade');
                    else onLaunchApp();
                  }}
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Quantum Arcade
                </a>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: '#A9DDD3',
                  fontWeight: 700,
                  marginBottom: '14px',
                  letterSpacing: '1px',
                }}
              >
                OFFICIAL RIALO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <a
                  href="https://www.rialo.io/brand-assets"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Brand Assets ↗
                </a>
                <a
                  href="https://rialo.io"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Rialo.io ↗
                </a>
                <a
                  href="https://x.com/rialonetwork"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Twitter / X ↗
                </a>
                <a
                  href="https://docs.rialo.io"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(232, 227, 213, 0.75)', textDecoration: 'none' }}
                >
                  Documentation ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            paddingTop: '24px',
            borderTop: '1px solid rgba(232, 227, 213, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '12px',
            color: 'rgba(232, 227, 213, 0.5)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div>© 2026 RIALOTRACE. ALL RIGHTS RESERVED.</div>
            <span style={{ color: 'rgba(232, 227, 213, 0.25)' }}>•</span>
            <div style={{ color: '#F87171', fontWeight: 700, letterSpacing: '0.3px' }}>
              NOT AFFILIATED WITH RIALO.IO
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A9DDD3' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#A9DDD3',
                boxShadow: '0 0 8px #A9DDD3',
              }}
            />
            <span>RIALO TESTNET CONNECTED</span>
          </div>
        </div>

        {/* Legal Disclaimer Sub-bar */}
        <div
          style={{
            maxWidth: '1240px',
            margin: '16px auto 0',
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(232, 227, 213, 0.45)',
            lineHeight: '1.6',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Disclaimer: RialoTrace is an independent community analytics tool and is not affiliated with, officially endorsed by, or sponsored by rialo.io or Subzero Labs.
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
};
