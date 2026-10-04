'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { RialoLogo, RialoIcon } from './RialoLogo';
import { ALL_30_CARDS } from '@/lib/cardsData';
import { CardArchetype, UserProfile } from '@/lib/types';
import { playScratchSound, playCardRevealSound, playPackOpenSound } from '@/lib/sounds';

interface RialoCardsProps {
  user?: UserProfile | null;
  newlyPulledCards?: CardArchetype[] | null;
  onClearNewlyPulledCards?: () => void;
  onNavigateToBinder?: () => void;
  onUserUpdate?: (user: UserProfile) => void;
}

export const RialoCards: React.FC<RialoCardsProps> = ({
  user,
  newlyPulledCards,
  onClearNewlyPulledCards,
  onNavigateToBinder,
}) => {
  // Card flip & Animation states
  const [isFlipped, setIsFlipped] = useState(false);
  const [openingStage, setOpeningStage] = useState<'idle' | 'charging' | 'spinning' | 'revealed'>('idle');
  const [showFlash, setShowFlash] = useState(false);

  // 3-Card Pack Reveal Flow
  const [packIndex, setPackIndex] = useState(0);
  const [revealedPulledIds, setRevealedPulledIds] = useState<string[]>([]);

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  useEffect(() => {
    if (newlyPulledCards && newlyPulledCards.length > 0) {
      setPackIndex(0);
      setRevealedPulledIds([]);
      setIsFlipped(false);
      setOpeningStage('idle');
      playPackOpenSound();
    }
  }, [newlyPulledCards]);

  const packCards = newlyPulledCards && newlyPulledCards.length > 0 ? newlyPulledCards : null;
  const currentPackCard: CardArchetype | undefined = packCards ? packCards[packIndex] : undefined;

  const isCurrentCardRevealed = currentPackCard
    ? revealedPulledIds.includes(currentPackCard.id)
    : false;

  const allPackCardsRevealed = packCards
    ? packCards.every((c) => revealedPulledIds.includes(c.id))
    : false;

  // Ultra-Cool Cinematic 3D Card Reveal Sequence
  const triggerOpeningSequence = () => {
    if (openingStage === 'charging' || openingStage === 'spinning') return;
    if (!currentPackCard) return;

    setIsFlipped(false);
    setOpeningStage('charging');
    playScratchSound();

    // Stage 1: Charging vibration (550ms)
    setTimeout(() => {
      setOpeningStage('spinning');

      // Stage 2: Mid-spin flip to FRONT face + supernova (at 525ms - halfway through 1050ms spin)
      setTimeout(() => {
        setIsFlipped(true); // flip to FRONT (revealed)
        setShowFlash(true);
        playCardRevealSound(currentPackCard.rarity);
      }, 525);

      // Stage 3: Slam into place
      setTimeout(() => {
        setOpeningStage('revealed');
        setRevealedPulledIds((prev) => {
          if (!prev.includes(currentPackCard.id)) return [...prev, currentPackCard.id];
          return prev;
        });
        setTimeout(() => setShowFlash(false), 700);
        setTimeout(() => setOpeningStage('idle'), 600);
      }, 1050);
    }, 550);
  };

  const handleNextPackCard = () => {
    if (!packCards) return;
    if (packIndex < packCards.length - 1) {
      const nextIdx = packIndex + 1;
      setPackIndex(nextIdx);
      const nextCard = packCards[nextIdx];
      setIsFlipped(revealedPulledIds.includes(nextCard.id));
      setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    }
  };

  const handlePrevPackCard = () => {
    if (!packCards) return;
    if (packIndex > 0) {
      const prevIdx = packIndex - 1;
      setPackIndex(prevIdx);
      const prevCard = packCards[prevIdx];
      setIsFlipped(revealedPulledIds.includes(prevCard.id));
      setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || openingStage !== 'idle') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -14;
    const rotateY = ((x - rect.width / 2) / rect.width) * 14;
    setTilt({ x: rotateX, y: rotateY, glareX: (x / rect.width) * 100, glareY: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });

  const getAnimClass = () => {
    if (openingStage === 'charging') return 'card-is-charging';
    if (openingStage === 'spinning') return 'card-is-spinning';
    if (openingStage === 'revealed') return 'card-just-revealed';
    return '';
  };

  // No pack available screen
  if (!packCards || packCards.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '560px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 24px', borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10B981', fontSize: '13px', fontWeight: 800, marginBottom: '20px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
          }}>
            <CheckCircle2 size={18} />
            <span>All Today's 3 Cards Already Claimed & Opened</span>
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0' }}>
            Daily Gacha Sequence <span className="gradient-text-rialo">Complete</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--rialo-text-muted)', lineHeight: '1.6', margin: '0 0 32px 0' }}>
            Your next daily 3-card pack unlocks tomorrow at 00:00 UTC. Check your Digital Collector Album to inspect your cards.
          </p>
          <button type="button" onClick={() => { if (onNavigateToBinder) onNavigateToBinder(); }}
            className="monad-claim-button"
            style={{ padding: '0 32px', height: '52px', fontSize: '15px', boxShadow: '0 0 35px rgba(169, 221, 211, 0.6)', background: 'linear-gradient(135deg, #A9DDD3, #2563EB)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} />
            <span>Open Digital Collector Album</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const card = currentPackCard!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 20px 40px', width: '100%' }}>
      {/* Supernova Shockwave Blast Overlay */}
      {showFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(169, 221, 211,0.85) 35%, rgba(168,85,247,0.6) 65%, transparent 85%)',
          animation: 'supernovaShockwave 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
        }} />
      )}

      {/* Step Indicator */}
      <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 28px', borderRadius: '9999px',
          background: 'rgba(6, 10, 10, 0.9)', border: '1px solid rgba(169, 221, 211, 0.3)',
          boxShadow: '0 0 25px rgba(169, 221, 211, 0.2)', marginBottom: '12px',
        }}>
          <span style={{ color: 'var(--arc-cyan)', fontSize: '13px', fontWeight: 900, letterSpacing: '0.08em' }}>
            ⚡ DAILY PACK DROP: CARD {packIndex + 1} OF {packCards.length} ⚡
          </span>
        </div>

        {/* Dot Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {packCards.map((pc, idx) => {
            const isDone = revealedPulledIds.includes(pc.id);
            const isCurrent = idx === packIndex;
            return (
              <div key={pc.id} style={{
                width: isCurrent ? '28px' : '10px', height: '10px', borderRadius: '9999px',
                background: isDone ? '#10B981' : isCurrent ? 'var(--arc-cyan)' : 'rgba(255,255,255,0.15)',
                boxShadow: isCurrent ? '0 0 12px var(--arc-cyan)' : 'none',
                transition: 'all 0.3s ease',
              }} />
            );
          })}
        </div>
      </div>

      {/* Card Stage with Navigation Arrows */}
      <div className="pack-opening-stage" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', position: 'relative' }}>
        {/* Left Arrow (Prev Revealed Card) */}
        <button
          type="button"
          onClick={handlePrevPackCard}
          disabled={packIndex === 0}
          title="Previous card"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: packIndex === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(169, 221, 211, 0.12)',
            border: packIndex === 0 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(169, 221, 211, 0.4)',
            color: packIndex === 0 ? 'rgba(255,255,255,0.2)' : '#A9DDD3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: packIndex === 0 ? 'not-allowed' : 'pointer',
            boxShadow: packIndex === 0 ? 'none' : '0 0 20px rgba(169, 221, 211,0.25)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* 3D Card */}
        <div className="monad-perspective-wrapper" style={{ flexShrink: 0 }}>
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              if (openingStage === 'charging' || openingStage === 'spinning') return;
              if (!isCurrentCardRevealed) {
                triggerOpeningSequence();
              } else {
                setIsFlipped(prev => !prev);
              }
            }}
            className={`monad-card-3d ${getAnimClass()}`}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 0 : 180)}deg)`,  // isFlipped=false→BACK, true→FRONT
              transition: openingStage === 'idle' ? 'transform 0.15s ease-out' : 'none',
            }}
          >
            {/* Holo Glare */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '28px', zIndex: 10, pointerEvents: 'none',
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.4) 0%, rgba(169, 221, 211,0.15) 40%, transparent 65%)`,
            }} />

            {/* Flash burst on reveal */}
            {showFlash && <div className="card-flash-burst" />}

            {/* CARD FRONT */}
            <div className="monad-card-face monad-card-front">
              {/* Top nameplate */}
              <div className="monad-card-nameplate">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RialoLogo size={14} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.06em' }}>
                    WAVE 1 • GENESIS
                  </span>
                </div>
                <div style={{
                  padding: '3px 10px', borderRadius: '9999px',
                  background: card.glowColor + '20', border: `1px solid ${card.glowColor}`,
                  fontSize: '11px', fontWeight: 800, color: card.glowColor,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {card.badgeEmoji} {card.rarity}
                </div>
              </div>

              {/* Art */}
              <div className="monad-art-frame">
                <img src={card.image} alt={card.title} className="monad-art-image" />
              </div>

              {/* Trait / lore block */}
              <div className="monad-trait-card">
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: card.glowColor + '20', border: `1.5px solid ${card.glowColor}60`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 12px ${card.glowColor}40`,
                }}>
                  <span style={{ fontSize: '22px' }}>{card.badgeEmoji}</span>
                </div>
                <div className="monad-trait-content">
                  <div className="monad-trait-title">{card.title}</div>
                  <p className="monad-trait-lore">{card.lore}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="monad-card-footer">
                <span className="monad-footer-brand">rialo.io</span>
                <div className="monad-wave-badge" style={{ background: card.glowColor, color: '#040814' }}>
                  CARD {packIndex + 1}/3
                </div>
              </div>
            </div>

            {/* CARD BACK */}
            <div className="monad-card-face monad-card-back"
              style={{ border: '2px solid rgba(169, 221, 211,0.7)', boxShadow: '0 0 50px rgba(169, 221, 211,0.5)' }}>
              <div className="monad-back-header">
                <span>RIALO CARDS</span>
                <span>CARD {packIndex + 1} / 3</span>
              </div>
              <div className="monad-back-center-logo">
                <div className="monad-back-emblem"><RialoIcon size={56} color="#A9DDD3" /></div>
                <div className="monad-back-title">rialo.io</div>
                <div className="monad-back-subtitle">GENESIS WAVE 1</div>
              </div>
              <div className="monad-back-cta">
                <Sparkles style={{ width: '16px', height: '16px', color: '#A9DDD3' }} />
                <span>
                  {openingStage === 'charging' ? '⚡ CHARGING ENERGY...'
                    : openingStage === 'spinning' ? '🌀 REVEALING WARRIOR...'
                    : `CLICK TO REVEAL CARD ${packIndex + 1} OF 3`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Arrow (Next Revealed Card) */}
        <button
          type="button"
          onClick={handleNextPackCard}
          disabled={packIndex === packCards.length - 1}
          title="Next card"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: packIndex === packCards.length - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(169, 221, 211, 0.12)',
            border: packIndex === packCards.length - 1 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(169, 221, 211, 0.4)',
            color: packIndex === packCards.length - 1 ? 'rgba(255,255,255,0.2)' : '#A9DDD3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: packIndex === packCards.length - 1 ? 'not-allowed' : 'pointer',
            boxShadow: packIndex === packCards.length - 1 ? 'none' : '0 0 20px rgba(169, 221, 211,0.25)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '480px' }}>
        {!isCurrentCardRevealed ? (
          <button
            type="button"
            onClick={triggerOpeningSequence}
            disabled={openingStage !== 'idle'}
            className="monad-claim-button"
            style={{
              background: 'linear-gradient(135deg, #A9DDD3, #2563EB)',
              boxShadow: '0 0 35px rgba(169, 221, 211, 0.7)',
              height: '54px', padding: '0 36px', fontSize: '16px',
              letterSpacing: '0.04em',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              width: '100%', justifyContent: 'center',
            }}
          >
            <Sparkles size={20} />
            <span>⚡ REVEAL CARD {packIndex + 1} OF {packCards.length} ⚡</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', width: '100%' }}>
            {packIndex < packCards.length - 1 && (
              <button
                type="button"
                onClick={handleNextPackCard}
                className="monad-claim-button"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
                  height: '48px', padding: '0 28px', fontSize: '14px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span>Next Card ({packIndex + 2}/{packCards.length})</span>
                <ArrowRight size={18} />
              </button>
            )}

            

            {allPackCardsRevealed && (
              <button
                type="button"
                onClick={() => {
                  if (onClearNewlyPulledCards) onClearNewlyPulledCards();
                  if (onNavigateToBinder) onNavigateToBinder();
                }}
                className="monad-claim-button"
                style={{
                  background: 'linear-gradient(135deg, #A9DDD3, #7C3AED)',
                  boxShadow: '0 0 35px rgba(124, 58, 237, 0.6)',
                  height: '48px', padding: '0 28px', fontSize: '14px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
              >
                <Layers size={18} />
                <span>Open Digital Collector Album ➔</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
