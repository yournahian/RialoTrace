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
  ExternalLink,
} from 'lucide-react';
import { RialoIcon } from './RialoLogo';
import { sound } from '@/lib/soundFx';

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

  // 4 Authentic Showcase Packs with Real 3D Pack Art
  const packTiers = [
    {
      id: 'genesis',
      name: 'GENESIS WAVE 1',
      sub: 'DAILY DROP • TIER 0',
      method: 'FREE DAILY CLAIM',
      tag: 'FEATURED',
      color: '#00F5FF',
      packImage: '/packs/pack_genesis.jpg',
      accentBg: 'linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(6,16,14,0.95) 100%)',
      borderColor: 'rgba(0,245,255,0.35)',
      glow: '0 0 35px rgba(0,245,255,0.25)',
      rarity: 'Common to Mythic',
      cardsCount: '3 CARDS',
      desc: 'Contains 3 randomized cards with guaranteed Common or Rare, plus chance for the Mythic Sub-Second Devourer.',
    },
    {
      id: 'void',
      name: 'VOID CYBERSAMURAI',
      sub: 'MYTHIC EDITION',
      method: 'FORGE SYNTHESIS',
      tag: 'MYTHIC',
      color: '#A855F7',
      packImage: '/packs/pack_void.jpg',
      accentBg: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(10,8,18,0.95) 100%)',
      borderColor: 'rgba(168,85,247,0.35)',
      glow: '0 0 35px rgba(168,85,247,0.25)',
      rarity: 'Epic & Mythic Pool',
      cardsCount: '4 CARDS',
      desc: 'Synthesized in The Forge using recyclable duplicates. Higher density of executioner and ronin archetypes.',
    },
    {
      id: 'superconductor',
      name: 'SUPERCONDUCTOR',
      sub: 'LEGENDARY APEX',
      method: 'MISSION VAULT',
      tag: 'HIGH VELOCITY',
      color: '#F59E0B',
      packImage: '/packs/pack_superconductor.jpg',
      accentBg: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(18,12,6,0.95) 100%)',
      borderColor: 'rgba(245,158,11,0.35)',
      glow: '0 0 35px rgba(245,158,11,0.25)',
      rarity: 'Legendary Guaranteed',
      cardsCount: '3 CARDS',
      desc: 'Awarded to top engagement streaks and arcade milestones. Infused with zero-friction consensus energy.',
    },
    {
      id: 'zero-friction',
      name: 'ZERO-FRICTION GRAIL',
      sub: 'LIMITED RUN 2026',
      method: 'ARENA GRAIL',
      tag: 'APEX GRAIL',
      color: '#10B981',
      packImage: '/packs/pack_apex.jpg',
      accentBg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,16,12,0.95) 100%)',
      borderColor: 'rgba(16,185,129,0.35)',
      glow: '0 0 35px rgba(16,185,129,0.25)',
      rarity: '1-of-1 Mythic Pool',
      cardsCount: '5 CARDS',
      desc: 'The crown jewel of the RialoTrace ecosystem. Unlocks custom holographic animated foil export parameters.',
    },
  ];

  // 5 Slabs for "SOMEONE JUST PULLED THIS"
  const recentPulls = [
    {
      title: 'Sub-Second Devourer',
      cardId: 'devourer',
      rarity: 'MYTHIC',
      grade: 'GEM MINT 10',
      color: '#EC4899',
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
      color: '#F59E0B',
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
      color: '#F59E0B',
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
      color: '#10B981',
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
      color: '#A855F7',
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
        backgroundColor: '#040706',
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Ambience: Subtle Warm Twilight & Neon Glows */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '650px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 245, 255, 0.12) 0%, rgba(16, 185, 129, 0.06) 45%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
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
          backgroundColor: 'rgba(4, 7, 6, 0.88)',
          borderBottom: '1px solid rgba(169, 221, 211, 0.14)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Official Rialo Brand Kit Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(6, 16, 14, 0.95)',
              border: '1.5px solid rgba(0, 245, 255, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
            }}
          >
            <RialoIcon size={24} color="#00F5FF" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontWeight: 900,
                fontSize: '22px',
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              Rialo<span style={{ color: '#00F5FF' }}>Trace</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: "'Space Mono', monospace",
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(0, 245, 255, 0.12)',
                border: '1px solid rgba(0, 245, 255, 0.35)',
                color: '#00F5FF',
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
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.5px',
          }}
          className="hidden md:flex"
        >
          <a
            href="#packs"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00F5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            PACKS
          </a>
          <a
            href="#pulls"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00F5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            SLABS
          </a>
          <a
            href="#pillars"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00F5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            TERMINAL
          </a>
          <a
            href="#community"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00F5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            SWARM
          </a>
          <a
            href="#reputation"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00F5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
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
              background: 'linear-gradient(135deg, #00F5FF 0%, #0284C7 100%)',
              border: '1px solid rgba(0, 245, 255, 0.6)',
              color: '#040706',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '18px',
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(0, 245, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 245, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 245, 255, 0.4)';
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
            background: 'rgba(0, 245, 255, 0.1)',
            border: '1px solid rgba(0, 245, 255, 0.35)',
            color: '#00F5FF',
            fontSize: '12px',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            letterSpacing: '1px',
            marginBottom: '24px',
            boxShadow: '0 0 25px rgba(0, 245, 255, 0.15)',
          }}
        >
          <Sparkles size={14} />
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
            background: 'linear-gradient(180deg, #FFFFFF 30%, #E2E8F0 70%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.2)',
          }}
        >
          RIP THE PACK.
          <br />
          <span
            style={{
              background: 'linear-gradient(180deg, #A7F3D0 0%, #00F5FF 50%, #0284C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(0, 245, 255, 0.5))',
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
            color: 'rgba(255, 255, 255, 0.65)',
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
              background: 'linear-gradient(135deg, #00F5FF 0%, #0284C7 100%)',
              border: '1px solid rgba(0, 245, 255, 0.8)',
              color: '#040706',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '22px',
              letterSpacing: '1.2px',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(0, 245, 255, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 245, 255, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 245, 255, 0.45)';
            }}
          >
            <Zap size={22} color="#040706" />
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
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
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
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = '#00F5FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <TrendingUp size={18} color="#00F5FF" />
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
              background: 'radial-gradient(circle, rgba(0, 245, 255, 0.3) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%)',
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
                ? '0 30px 60px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 245, 255, 0.6)'
                : '0 20px 45px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 245, 255, 0.3)',
              overflow: 'hidden',
              backgroundColor: '#040706',
              border: '1px solid rgba(0, 245, 255, 0.4)',
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
                background: `radial-gradient(circle at ${packTilt.glareX}% ${packTilt.glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(0, 245, 255, 0.2) 25%, transparent 60%)`,
                mixBlendMode: 'overlay',
              }}
            />
          </div>
        </div>

        {/* Protocol Architecture Features (Real Values, No Dummy Stats) */}
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
            backgroundColor: 'rgba(10, 16, 14, 0.85)',
            border: '1px solid rgba(169, 221, 211, 0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="#00F5FF" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#FFFFFF', letterSpacing: '0.8px' }}>
                SUB-SECOND BFT
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.55)' }}>
                INSTANT FINALITY
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#10B981" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#FFFFFF', letterSpacing: '0.8px' }}>
                30 ARCHETYPES
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.55)' }}>
                GENESIS COLLECTOR SET
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="#F59E0B" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#FFFFFF', letterSpacing: '0.8px' }}>
                ANTI-SYBIL VERIFIED
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.55)' }}>
                AUTHENTIC CREATOR PROOF
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={18} color="#A855F7" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#FFFFFF', letterSpacing: '0.8px' }}>
                ZERO TRANSACTION FRICTION
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.55)' }}>
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
              color: '#00F5FF',
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
              color: '#FFFFFF',
            }}
          >
            FIND YOUR NEXT PULL
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
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
                background: pack.accentBg,
                border: `1px solid ${pack.borderColor}`,
                padding: '24px 20px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '460px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.8), ${pack.glow}`;
                e.currentTarget.style.borderColor = pack.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.borderColor = pack.borderColor;
              }}
            >
              {/* Top Tag & Card Count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: "'Space Mono', monospace",
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.6)',
                    border: `1px solid ${pack.borderColor}`,
                    color: pack.color,
                    fontWeight: 700,
                  }}
                >
                  {pack.tag}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'Space Mono', monospace",
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {pack.cardsCount}
                </span>
              </div>

              {/* Real 3D Booster Pack Image in Center */}
              <div
                style={{
                  margin: '20px auto 16px',
                  width: '140px',
                  height: '210px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: `0 12px 30px rgba(0,0,0,0.7), 0 0 20px ${pack.color}40`,
                  border: `1.5px solid ${pack.color}80`,
                  position: 'relative',
                  transition: 'transform 0.3s ease',
                }}
              >
                <img
                  src={pack.packImage}
                  alt={pack.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Bottom Pack Info */}
              <div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '26px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    marginBottom: '4px',
                  }}
                >
                  {pack.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: pack.color,
                    fontWeight: 700,
                    marginBottom: '10px',
                  }}
                >
                  {pack.method}
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.65)',
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
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${pack.borderColor}`,
                    color: '#FFFFFF',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '18px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = pack.color;
                    e.currentTarget.style.color = '#040706';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#FFFFFF';
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
          backgroundColor: '#030504',
          borderTop: '1px solid rgba(169, 221, 211, 0.1)',
          borderBottom: '1px solid rgba(169, 221, 211, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#00F5FF',
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
              color: '#FFFFFF',
            }}
          >
            SOMEONE JUST PULLED THIS
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
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
                background: 'rgba(10, 16, 14, 0.95)',
                border: pull.isFeatured
                  ? '2px solid #F59E0B'
                  : '1px solid rgba(169, 221, 211, 0.2)',
                boxShadow: pull.isFeatured
                  ? '0 20px 45px rgba(245, 158, 11, 0.35)'
                  : '0 15px 35px rgba(0, 0, 0, 0.7)',
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
                e.currentTarget.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.9), 0 0 35px ${pull.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${pull.tiltDeg}deg) scale(${pull.isFeatured ? 1.05 : 0.96})`;
                e.currentTarget.style.zIndex = pull.isFeatured ? '10' : '1';
                e.currentTarget.style.boxShadow = pull.isFeatured
                  ? '0 20px 45px rgba(245, 158, 11, 0.35)'
                  : '0 15px 35px rgba(0, 0, 0, 0.7)';
              }}
            >
              {/* Graded Slab Label Header (PSA / BGS Aesthetic) */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#121A18',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
                      color: '#00F5FF',
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
                      color: '#FFFFFF',
                    }}
                  >
                    {pull.serial}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: pull.color,
                    color: '#040706',
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
                  backgroundColor: '#050807',
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
                    background: 'linear-gradient(180deg, transparent 60%, rgba(10, 16, 14, 0.95) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(4, 7, 6, 0.85)',
                    border: `1px solid ${pull.color}`,
                    color: pull.color,
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
                    color: '#FFFFFF',
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
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: "'Space Mono', monospace",
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ color: '#00F5FF' }}>{pull.edition}</span>
                </div>

                {/* Stars Rating */}
                <div style={{ display: 'flex', gap: '3px', color: '#F59E0B' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" />
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
              color: '#10B981',
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
              color: '#FFFFFF',
            }}
          >
            ONE TERMINAL. THREE WAYS TO DOMINATE.
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
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
              backgroundColor: 'rgba(10, 16, 14, 0.7)',
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
              e.currentTarget.style.borderColor = '#00F5FF';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 245, 255, 0.2)';
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
                backgroundColor: 'rgba(0, 245, 255, 0.15)',
                border: '1px solid rgba(0, 245, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <Layers size={28} color="#00F5FF" />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#00F5FF',
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
                color: '#FFFFFF',
                margin: '0 0 14px 0',
              }}
            >
              RIP & COLLECT DIGITAL SLABS
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
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
                color: '#00F5FF',
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
              backgroundColor: 'rgba(10, 16, 14, 0.7)',
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
              e.currentTarget.style.borderColor = '#F59E0B';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.2)';
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
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <TrendingUp size={28} color="#F59E0B" />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#F59E0B',
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
                color: '#FFFFFF',
                margin: '0 0 14px 0',
              }}
            >
              SOCIAL PROOF-OF-WORK
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
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
                color: '#F59E0B',
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
              backgroundColor: 'rgba(10, 16, 14, 0.7)',
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
              e.currentTarget.style.borderColor = '#10B981';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.2)';
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(169, 221, 211, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <Swords size={28} color="#10B981" />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#10B981',
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
                color: '#FFFFFF',
                margin: '0 0 14px 0',
              }}
            >
              CREATOR SHOWDOWN DUELS
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
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
                color: '#10B981',
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
          backgroundColor: '#00F5FF',
          color: '#040706',
          padding: '14px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '22px',
          letterSpacing: '3px',
          boxShadow: '0 0 35px rgba(0, 245, 255, 0.4)',
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
              color: '#00F5FF',
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
              color: '#FFFFFF',
            }}
          >
            BUILT FOR THE RIALO SWARM
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
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
              backgroundColor: 'rgba(10, 16, 14, 0.85)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <RialoIcon size={20} color="#00F5FF" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#FFFFFF' }}>
                REALTIME TROLLBOX CHAT
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: 0 }}>
              Live peer-to-peer chat room powered by Supabase Realtime. Tip Shards, challenge creators to
              Versus battles, and share alpha signals without leaving the terminal.
            </p>
          </div>

          <div
            style={{
              padding: '28px 24px',
              borderRadius: '20px',
              backgroundColor: 'rgba(10, 16, 14, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <TrendingUp size={20} color="#F59E0B" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#FFFFFF' }}>
                DYNAMIC PERCENTILE RANKING
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: 0 }}>
              Calculates dynamic percentile thresholds from the top creators down to novices. Real-time
              leaderboard refresh ensures transparent, verifiable performance.
            </p>
          </div>

          <div
            style={{
              padding: '28px 24px',
              borderRadius: '20px',
              backgroundColor: 'rgba(10, 16, 14, 0.85)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} color="#10B981" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#FFFFFF' }}>
                CRYO STREAK VAULT
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: '12px 0 0' }}>
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
                color: '#F59E0B',
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
                color: '#FFFFFF',
                lineHeight: '0.95',
              }}
            >
              YOUR COLLECTION.
              <br />
              <span style={{ color: '#00F5FF' }}>ALWAYS WITHIN REACH.</span>
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
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
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#040706',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '20px',
                letterSpacing: '1px',
                cursor: 'pointer',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 0 45px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.4)';
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
                backgroundColor: 'rgba(10, 16, 14, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.15)',
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
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={24} color="#10B981" />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    margin: '0 0 6px 0',
                  }}
                >
                  100% COMMUNITY VERIFIED
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                  Sybil-resistant ranking prevents bot manipulation. Only authentic community engagement
                  fuels your progress.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(10, 16, 14, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.15)',
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
                  backgroundColor: 'rgba(0, 245, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={24} color="#00F5FF" />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    margin: '0 0 6px 0',
                  }}
                >
                  ZERO-FRICTION SUB-SECOND SPEED
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                  Claims and trades execute with sub-second finality. No waiting, no unpredictable gas
                  fees.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(10, 16, 14, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.15)',
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
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Award size={24} color="#F59E0B" />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    margin: '0 0 6px 0',
                  }}
                >
                  HIGH-RES 4K EXPORT STUDIO
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
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
            background: 'radial-gradient(circle, rgba(0, 245, 255, 0.2) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
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
              color: '#00F5FF',
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
              color: '#FFFFFF',
              textShadow: '0 0 40px rgba(0, 245, 255, 0.4)',
            }}
          >
            YOUR NEXT PULL
            <br />
            <span style={{ color: '#00F5FF' }}>IS WAITING.</span>
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
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
              background: 'linear-gradient(135deg, #00F5FF 0%, #0284C7 50%, #0369A1 100%)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#040706',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '26px',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              boxShadow: '0 0 50px rgba(0, 245, 255, 0.6), inset 0 2px 8px rgba(255,255,255,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 0 75px rgba(0, 245, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 50px rgba(0, 245, 255, 0.6)';
            }}
          >
            <Sparkles size={26} color="#040706" />
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
          backgroundColor: '#020403',
          borderTop: '1px solid rgba(169, 221, 211, 0.12)',
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
          {/* Brand Info with Official Rialo Glyph */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(6, 16, 14, 0.95)',
                  border: '1.5px solid rgba(0, 245, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0, 245, 255, 0.25)',
                }}
              >
                <RialoIcon size={22} color="#00F5FF" />
              </div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '22px',
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                }}
              >
                Rialo<span style={{ color: '#00F5FF' }}>Trace</span>
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              The sovereign social analytics terminal and gamified digital collector layer for Rialo
              Network. Engineered for sub-second finality and zero transaction friction.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: '#00F5FF',
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
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
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
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
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
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
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
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
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
                  color: '#F59E0B',
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
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                >
                  Brand Assets ↗
                </a>
                <a
                  href="https://rialo.io"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                >
                  Rialo.io ↗
                </a>
                <a
                  href="https://x.com/rialonetwork"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                >
                  Twitter / X ↗
                </a>
                <a
                  href="https://docs.rialo.io"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
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
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <div>© 2026 RIALOTRACE. ALL RIGHTS RESERVED.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span>RIALO TESTNET CONNECTED</span>
          </div>
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
