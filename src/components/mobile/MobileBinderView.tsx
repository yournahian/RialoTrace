'use client';

import React, { useState, useRef } from 'react';
import { ALL_30_CARDS } from '@/lib/cardsData';
import { UserProfile, CardArchetype } from '@/lib/types';
import { RialoLogo, RialoIcon } from '../RialoLogo';
import { exportRialoCardPNG, exportRialoCardBackPNG } from '../RialoCardCanvasExporter';
import { sound } from '@/lib/soundFx';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Share2,
} from 'lucide-react';

interface MobileBinderViewProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
  onSelectForTrade?: (cardId: string) => void;
}

export const MobileBinderView: React.FC<MobileBinderViewProps> = ({
  user,
  onUserUpdate,
  onSelectForTrade,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'owned' | 'missing'>('all');
  const [coverflowIndex, setCoverflowIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Touch Swipe Gesture State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const inventory = user?.inventory || {};
  const uniqueCount = Object.keys(inventory).filter((k) => (inventory[k] || 0) > 0).length;

  const filteredCards = ALL_30_CARDS.filter((card) => {
    const qty = inventory[card.id] || 0;
    if (filterMode === 'owned') return qty > 0;
    if (filterMode === 'missing') return qty === 0;
    return true;
  });

  const activeCards = filteredCards.length > 0 ? filteredCards : ALL_30_CARDS;
  const safeIndex = Math.min(coverflowIndex, activeCards.length - 1);
  const activeCard: CardArchetype = activeCards[safeIndex] || ALL_30_CARDS[0];
  const countOwned = inventory[activeCard.id] || 0;
  const isOwned = countOwned > 0;

  const handlePrev = () => {
    sound.playTap();
    setIsFlipped(false);
    setCoverflowIndex((prev) => (prev > 0 ? prev - 1 : activeCards.length - 1));
  };

  const handleNext = () => {
    sound.playTap();
    setIsFlipped(false);
    setCoverflowIndex((prev) => (prev < activeCards.length - 1 ? prev + 1 : 0));
  };

  // Touch gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 35;
    const isRightSwipe = distance < -35;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Download Handler
  const handleDownloadPNG = async () => {
    if (!activeCard) return;
    setIsDownloading(true);
    sound.playTap();
    try {
      if (isFlipped) {
        const blob = await exportRialoCardBackPNG();
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rialo-card-back-${activeCard.id}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const handle = user?.username || 'collector';
        const blob = await exportRialoCardPNG({
          handle,
          name: handle,
          avatar: `https://unavatar.io/x/${handle}`,
          cardImage: activeCard.image,
          archetypeId: activeCard.id,
          archetypeTitle: activeCard.title,
          archetypeLore: activeCard.lore,
          rarity: activeCard.rarity,
          badgeEmoji: activeCard.badgeEmoji,
          impressions: 14500,
          wave: 'WAVE 1 • GENESIS',
          glowColor: activeCard.glowColor,
        });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rialo-card-${activeCard.id}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Link Handler
  const handleCopyLink = () => {
    sound.playTap();
    if (typeof window !== 'undefined' && activeCard) {
      navigator.clipboard.writeText(`${window.location.origin}?card=${activeCard.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Share on X
  const handleShareX = () => {
    sound.playTap();
    if (!activeCard) return;
    const text = `I'm inspecting the ${activeCard.title} (${activeCard.rarity}) card on RialoTrace Genesis Wave 1 on @RialoHQ! Check it out:`;
    const url = typeof window !== 'undefined' ? `${window.location.origin}?card=${activeCard.id}` : 'https://rialo.io';
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        padding: '0 4px',
      }}
    >
      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: '8px', width: '100%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(169, 221, 211, 0.1)',
            border: '1px solid rgba(169, 221, 211, 0.25)',
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#A9DDD3',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '4px',
          }}
        >
          <Sparkles size={11} /> 3D Coverflow Swapper • {uniqueCount}/30 Collected
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
          {[
            { id: 'all', label: `All (${ALL_30_CARDS.length})` },
            { id: 'owned', label: `Owned (${uniqueCount})` },
            { id: 'missing', label: `Missing (${30 - uniqueCount})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                sound.playTap();
                setFilterMode(f.id as any);
                setCoverflowIndex(0);
              }}
              style={{
                padding: '3px 9px',
                borderRadius: '9999px',
                background: filterMode === f.id ? 'rgba(169, 221, 211, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: filterMode === f.id ? '1px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.08)',
                color: filterMode === f.id ? '#A9DDD3' : '#8E9B97',
                fontSize: '10.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==============================================================
          TRUE MULTI-CARD 3D COVERFLOW STAGE WITH FLUID 3D ANIMATION
          ============================================================== */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          perspective: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          userSelect: 'none',
          marginTop: '6px',
        }}
      >
        {/* Navigation Left Chevron */}
        <button
          type="button"
          onClick={handlePrev}
          title="Previous card"
          style={{
            position: 'absolute',
            left: '6px',
            zIndex: 35,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(6, 12, 10, 0.88)',
            border: '1.5px solid rgba(169, 221, 211, 0.4)',
            color: '#A9DDD3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0,0,0,0.8), 0 0 10px rgba(169, 221, 211, 0.2)',
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* 3D Track */}
        <div
          style={{
            position: 'relative',
            width: '240px',
            height: '360px',
            transformStyle: 'preserve-3d',
          }}
        >
          {activeCards.map((arch, idx) => {
            const offset = idx - safeIndex;
            const absOffset = Math.abs(offset);
            const isVisible = absOffset <= 2;

            if (!isVisible) return null;

            // Responsive 3D Coverflow Transformation Math
            const translateX = offset * 115;
            const translateZ = -absOffset * 85;
            const rotateY = offset * -28;
            const scale = 1 - absOffset * 0.14;
            const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.72 : 0.32;
            const zIndex = 15 - absOffset;
            const isActive = absOffset === 0;

            const ownedQty = inventory[arch.id] || 0;
            const isArchOwned = ownedQty > 0;

            return (
              <div
                key={arch.id}
                onClick={() => {
                  sound.playTap();
                  if (!isActive) {
                    setCoverflowIndex(idx);
                    setIsFlipped(false);
                  } else {
                    setIsFlipped((prev) => !prev);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '240px',
                  height: '360px',
                  borderRadius: '20px',
                  transformStyle: 'preserve-3d',
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${isActive && isFlipped ? 180 : rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s',
                  boxShadow: isActive
                    ? `0 15px 35px rgba(0, 0, 0, 0.85), 0 0 25px ${arch.glowColor}40`
                    : `0 8px 20px rgba(0, 0, 0, 0.6)`,
                  cursor: 'pointer',
                }}
              >
                {/* Front Face */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    background: 'linear-gradient(160deg, #FFFFFF 0%, #F8FAFC 60%, #F1F5F9 100%)',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    border: `2px solid ${isActive ? '#A9DDD3' : arch.glowColor}`,
                  }}
                >
                  {/* Top Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RialoLogo size={12} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 800, color: '#0F172A' }}>
                        GENESIS
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        background: arch.glowColor + '20',
                        border: `1px solid ${arch.glowColor}`,
                        fontSize: '9px',
                        fontWeight: 800,
                        color: arch.glowColor,
                      }}
                    >
                      {arch.badgeEmoji} {arch.rarity}
                    </span>
                  </div>

                  {/* Artwork Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '52%',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      margin: '6px 0',
                      border: `1px solid ${arch.glowColor}50`,
                      background: '#040814',
                    }}
                  >
                    <img
                      src={arch.image}
                      alt={arch.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Title & Lore */}
                  <div style={{ minHeight: '0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#040814', lineHeight: 1.2 }}>
                      {arch.title}
                    </div>
                    <p
                      style={{
                        fontSize: '9.5px',
                        color: '#64748B',
                        margin: '2px 0 0 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.25,
                      }}
                    >
                      {arch.lore}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                      paddingTop: '4px',
                    }}
                  >
                    <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#94A3B8' }}>rialo.io</span>
                    <span
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 800,
                        color: isArchOwned ? '#10B981' : '#F59E0B',
                      }}
                    >
                      {isArchOwned ? `Owned (x${ownedQty})` : 'Uncollected'}
                    </span>
                  </div>
                </div>

                {/* Back Face (Flip) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'radial-gradient(circle at center, #0F172A 0%, #030608 100%)',
                    border: '2px solid rgba(169, 221, 211, 0.7)',
                    boxShadow: '0 0 30px rgba(169, 221, 211, 0.4)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    color: '#FFFFFF',
                  }}
                >
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#A9DDD3', fontWeight: 800 }}>
                    <span>RIALO CARDS</span>
                    <span>GENESIS</span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RialoIcon size={42} color="#A9DDD3" />
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>rialo.io</div>
                    <div style={{ fontSize: '9px', color: '#A9DDD3', letterSpacing: '0.08em', fontWeight: 800 }}>GENESIS WAVE 1</div>
                  </div>

                  <div style={{ fontSize: '9px', color: '#8E9B97', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={10} color="#A9DDD3" /> Tap to flip to front
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Right Chevron */}
        <button
          type="button"
          onClick={handleNext}
          title="Next card"
          style={{
            position: 'absolute',
            right: '6px',
            zIndex: 35,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(6, 12, 10, 0.88)',
            border: '1.5px solid rgba(169, 221, 211, 0.4)',
            color: '#A9DDD3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0,0,0,0.8), 0 0 10px rgba(169, 221, 211, 0.2)',
          }}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Card Index & Counter Indicator */}
      <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: 700, color: '#8E9B97', fontFamily: 'var(--font-mono)' }}>
        CARD {safeIndex + 1} OF {activeCards.length} • {activeCard.title}
      </div>

      {/* Compact Download, Copy, Share Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
          width: 'min(280px, 80vw)',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          style={{
            flex: 1,
            padding: '9px 10px',
            borderRadius: '10px',
            background: '#A9DDD3',
            color: '#010101',
            border: 'none',
            fontSize: '11.5px',
            fontWeight: 900,
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 0 12px rgba(169, 221, 211, 0.3)',
          }}
        >
          <Download size={13} />
          <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(169, 221, 211, 0.3)',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {copiedLink ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
          <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          type="button"
          onClick={handleShareX}
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            background: 'rgba(29, 155, 240, 0.15)',
            border: '1px solid rgba(29, 155, 240, 0.4)',
            color: '#1D9BF0',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Share to X"
        >
          <Share2 size={13} />
        </button>
      </div>
    </div>
  );
};
