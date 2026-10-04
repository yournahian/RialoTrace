import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CardArchetype, UserProfile } from '@/lib/types';
import { ALL_30_CARDS } from '@/lib/cardsData';
import { TheForge } from './TheForge';
import { PersonaCardStudio } from './PersonaCardStudio';
import { Palette } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { exportRialoCardPNG, exportRialoCardBackPNG } from './RialoCardCanvasExporter';
import { RialoLogo, RialoIcon } from './RialoLogo';
import {
  Flame, Sparkles, X, Download, Copy, Check, Share2, ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface CardBinderProps {
  user: UserProfile | null;
  onUserUpdate: (updated: UserProfile) => void;
  onSelectForTrade?: (cardId: string) => void;
}

export const CardBinder: React.FC<CardBinderProps> = ({ user, onUserUpdate, onSelectForTrade }) => {
  const [mounted, setMounted] = useState(false);
  const [binderMode, setBinderMode] = useState<'album' | 'forge' | 'studio'>('album');
  const [albumViewMode, setAlbumViewMode] = useState<'grid' | 'coverflow'>('grid');
  const [coverflowIndex, setCoverflowIndex] = useState<number>(0);
  const [selectedToBurn, setSelectedToBurn] = useState<string[]>([]);
  const [isRecycleModalOpen, setIsRecycleModalOpen] = useState(false);
  const [recycling, setRecycling] = useState(false);
  const [recycledReward, setRecycledReward] = useState<CardArchetype | null>(null);

  // In-place 3D Card Inspection Modal
  const [inspectedCardId, setInspectedCardId] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inventory = user?.inventory || {};
  const uniqueCount = Object.keys(inventory).filter((k) => (inventory[k] || 0) > 0).length;
  const progressPercent = Math.round((uniqueCount / 30) * 100);

  // All owned card IDs for prev/next navigation
  const ownedCardIds = ALL_30_CARDS.filter(c => (inventory[c.id] || 0) > 0).map(c => c.id);

  const duplicateCards: { card: CardArchetype; count: number }[] = [];
  ALL_30_CARDS.forEach((card) => {
    const qty = inventory[card.id] || 0;
    if (qty > 1) duplicateCards.push({ card, count: qty - 1 });
  });

  const inspectedCard = inspectedCardId ? ALL_30_CARDS.find(c => c.id === inspectedCardId) ?? null : null;
  const countOwned = inspectedCardId ? (inventory[inspectedCardId] || 0) : 0;

  // Next/Prev navigation across available/owned cards, or across all 30 cards
  const navCardList = (ownedCardIds.length > 1 && inspectedCardId && ownedCardIds.includes(inspectedCardId))
    ? ownedCardIds
    : ALL_30_CARDS.map(c => c.id);

  const currentNavIndex = inspectedCardId ? navCardList.indexOf(inspectedCardId) : -1;
  const canGoPrev = currentNavIndex > 0;
  const canGoNext = currentNavIndex >= 0 && currentNavIndex < navCardList.length - 1;

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (inspectedCardId || isRecycleModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [inspectedCardId, isRecycleModalOpen]);

  // Keyboard navigation (Left/Right arrow keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inspectedCardId) return;
      if (e.key === 'ArrowLeft' && canGoPrev) {
        openCard(navCardList[currentNavIndex - 1]);
      } else if (e.key === 'ArrowRight' && canGoNext) {
        openCard(navCardList[currentNavIndex + 1]);
      } else if (e.key === 'Escape') {
        setInspectedCardId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedCardId, canGoPrev, canGoNext, currentNavIndex, navCardList]);

  const handleToggleSelectBurn = (cardId: string) => {
    if (selectedToBurn.includes(cardId)) {
      setSelectedToBurn((prev) => prev.filter((id) => id !== cardId));
    } else if (selectedToBurn.length < 3) {
      setSelectedToBurn((prev) => [...prev, cardId]);
    }
  };

  const handleExecuteRecycle = async () => {
    if (selectedToBurn.length !== 3 || !user) return;
    try {
      setRecycling(true);
      const res = await fetch('/api/inventory/recycle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, cardIdsToBurn: selectedToBurn }),
      });
      const data = await res.json();
      if (data.success) { onUserUpdate(data.user); setRecycledReward(data.newCard); setSelectedToBurn([]); }
      else alert(data.error || 'Recycle failed');
    } catch (err) { console.error(err); }
    finally { setRecycling(false); }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({
      x: ((y - rect.height / 2) / rect.height) * -12,
      y: ((x - rect.width / 2) / rect.width) * 12,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });

  const openCard = (cardId: string) => {
    setIsCardFlipped(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    setInspectedCardId(cardId);
  };


  const handleDownloadBackPNG = async () => {
    setIsDownloading(true);
    try {
      const blob = await exportRialoCardBackPNG();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rialo-card-back.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!inspectedCard) return;
    setIsDownloading(true);
    try {
      const handle = user?.username || 'collector';
      const blob = await exportRialoCardPNG({
        handle, name: handle, avatar: `https://unavatar.io/x/${handle}`,
        cardImage: inspectedCard.image, archetypeId: inspectedCard.id,
        archetypeTitle: inspectedCard.title, archetypeLore: inspectedCard.lore,
        rarity: inspectedCard.rarity, badgeEmoji: inspectedCard.badgeEmoji,
        impressions: 14500, wave: 'WAVE 1 • GENESIS',
        glowColor: inspectedCard.glowColor,
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `rialo-card-${inspectedCard.id}.png`; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) { console.error(err); }
    finally { setIsDownloading(false); }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && inspectedCard) {
      navigator.clipboard.writeText(`${window.location.origin}?card=${inspectedCard.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareX = () => {
    if (!inspectedCard) return;
    const text = `I just unlocked the ${inspectedCard.title} (${inspectedCard.rarity}) card on RialoTrace! Genesis Wave 1 is live on @RialoHQ. Collect & forge your deck:`;
    const url = typeof window !== 'undefined' ? `${window.location.origin}?card=${inspectedCard.id}` : 'https://rialo.io';
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="tcg-container">
      {/* Mode Switcher: Album vs The Forge - Centered & Compact */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '14px',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          onClick={() => { sound.playTap(); setBinderMode('album'); }}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: binderMode === 'album' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: binderMode === 'album' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: binderMode === 'album' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: binderMode === 'album' ? '0 0 16px rgba(169, 221, 211, 0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={16} /> 🎴 Digital Collector Album (30 Cards)
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setBinderMode('forge'); }}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: binderMode === 'forge' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: binderMode === 'forge' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: binderMode === 'forge' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: binderMode === 'forge' ? '0 0 16px rgba(169, 221, 211, 0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Flame size={16} color="#A9DDD3" /> 🧪 The Forge (Fusion)
        </button>

        <button
          type="button"
          onClick={() => { sound.playTap(); setBinderMode('studio'); }}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: binderMode === 'studio' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
            background: binderMode === 'studio' ? 'rgba(169, 221, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            color: binderMode === 'studio' ? '#A9DDD3' : '#8E9B97',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: binderMode === 'studio' ? '0 0 16px rgba(169, 221, 211, 0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={16} color="#A9DDD3" /> 🎴 Persona Card Studio
        </button>
      </div>

      {binderMode === 'forge' ? (
        <TheForge user={user} onUserUpdate={onUserUpdate} onNavigateToAlbum={() => setBinderMode('album')} />
      ) : binderMode === 'studio' ? (
        <PersonaCardStudio />
      ) : (
        <>
          {/* Top Header - Unified Centered Architecture */}
      <div className="tcg-header" style={{ marginBottom: '12px', paddingBottom: '10px' }}>
        <div className="tcg-eyebrow">
          <Sparkles size={13} /> DIGITAL COLLECTOR ALBUM • SEASON 1: GENESIS
        </div>
        <h2 className="tcg-title">
          Season 1 <span className="gradient-text-rialo">Card Binder</span> ({uniqueCount}/30 Collected)
        </h2>
        <p className="tcg-subtitle">
          Click any card to inspect full 3D interactive hologram, download high-res PNG, or fuse duplicates in The Forge.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => { sound.playTap(); setBinderMode('forge'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 16px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
              color: '#010101',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 10px rgba(169, 221, 211, 0.3)',
            }}
          >
            <Flame size={14} /> Open The Forge (Card Fusion)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="binder-progress-box">
        <div className="binder-progress-label">
          <span>Completion Rate</span>
          <span style={{ color: 'var(--arc-cyan)' }}>{progressPercent}% (30 Cards Total)</span>
        </div>
        <div className="binder-progress-bar">
          <div className="binder-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Album View Switcher: Grid View vs 3D Coverflow Swapping Mode */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        padding: '0 4px',
      }}>
        <div style={{ fontSize: '13px', color: '#8E9B97', fontWeight: 700 }}>
          {albumViewMode === 'coverflow' ? (
            <span style={{ color: '#A9DDD3', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> 3D Coverflow Mode: Use Arrows or Click Cards to Swap ({coverflowIndex + 1}/30)
            </span>
          ) : (
            <span>Showing All 30 Season 1 Quantum Archetypes</span>
          )}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px',
          borderRadius: '9999px',
          border: '1px solid rgba(169, 221, 211, 0.25)',
        }}>
          <button
            type="button"
            onClick={() => { sound.playTap(); setAlbumViewMode('grid'); }}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: albumViewMode === 'grid' ? '#A9DDD3' : 'transparent',
              color: albumViewMode === 'grid' ? '#010101' : '#E8E3D5',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>⊞ Grid View</span>
          </button>
          <button
            type="button"
            onClick={() => { sound.playTap(); setAlbumViewMode('coverflow'); }}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: albumViewMode === 'coverflow' ? '#A9DDD3' : 'transparent',
              color: albumViewMode === 'coverflow' ? '#010101' : '#E8E3D5',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: albumViewMode === 'coverflow' ? '0 0 15px rgba(169, 221, 211, 0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <span>🎴 3D Coverflow Swapper</span>
          </button>
        </div>
      </div>

      {albumViewMode === 'coverflow' ? (
        /* 3D Coverflow Swapping Stage */
        <div style={{ width: '100%', marginBottom: '40px' }}>
          <div className="carousel-3d-stage" style={{ height: '480px' }}>
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setCoverflowIndex((prev) => (prev - 1 + ALL_30_CARDS.length) % ALL_30_CARDS.length);
              }}
              className="carousel-nav-btn prev"
              title="Previous Card (Left Arrow)"
            >
              <ChevronLeft style={{ width: '28px', height: '28px' }} />
            </button>

            <div className="carousel-track">
              {ALL_30_CARDS.map((arch, idx) => {
                const offset = idx - coverflowIndex;
                const absOffset = Math.abs(offset);
                const isVisible = absOffset <= 2;

                if (!isVisible) return null;

                const translateX = offset * 220;
                const translateZ = -absOffset * 150;
                const rotateY = offset * -25;
                const scale = 1 - absOffset * 0.12;
                const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.4;
                const zIndex = 10 - absOffset;

                const ownedCount = inventory[arch.id] || 0;
                const isMissing = ownedCount === 0;
                const isActive = idx === coverflowIndex;

                return (
                  <div
                    key={arch.id}
                    onClick={() => {
                      if (!isActive) {
                        sound.playTap();
                        setCoverflowIndex(idx);
                      } else {
                        openCard(arch.id);
                      }
                    }}
                    className={'carousel-card-item ' + (isActive ? 'active' : '')}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      borderColor: isActive ? '#A9DDD3' : arch.glowColor,
                      boxShadow: isActive
                        ? `0 0 45px rgba(169, 221, 211, 0.5), 0 0 25px ${arch.glowColor}80`
                        : `0 0 20px ${arch.glowColor}40`,
                    }}
                  >
                    {/* Header Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: arch.glowColor }}>
                        {arch.badgeEmoji} {arch.rarity}
                      </span>
                      <span
                        style={{
                          background: isMissing ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.18)',
                          border: '1px solid ' + (isMissing ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)'),
                          color: isMissing ? '#F87171' : '#10B981',
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {isMissing ? 'MISSING' : `OWNED (x${ownedCount})`}
                      </span>
                    </div>

                    {/* Card Art Image */}
                    <div style={{
                      width: '100%',
                      height: '240px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      margin: '10px 0',
                      border: `1.5px solid ${arch.glowColor}50`,
                      background: '#040814',
                    }}>
                      <img
                        src={arch.image}
                        alt={arch.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Card Info */}
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#040814', marginBottom: '4px' }}>
                        {arch.title}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#475569',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {arch.lore}
                      </div>
                    </div>

                    {/* Inspect Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCard(arch.id);
                      }}
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        padding: '9px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #040814, #0f172a)',
                        color: '#A9DDD3',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <Sparkles size={13} /> Inspect 3D Hologram
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setCoverflowIndex((prev) => (prev + 1) % ALL_30_CARDS.length);
              }}
              className="carousel-nav-btn next"
              title="Next Card (Right Arrow)"
            >
              <ChevronRight style={{ width: '28px', height: '28px' }} />
            </button>
          </div>
        </div>
      ) : (
      /* 30 Cards Grid */
      <div className="binder-grid">
        {ALL_30_CARDS.map((card) => {
          const count = inventory[card.id] || 0;
          const isOwned = count > 0;
          return (
            <div key={card.id}
              onClick={() => openCard(card.id)}
              title="Click to inspect full 3D card"
              className={`binder-card ${isOwned ? 'owned' : 'locked'}`}
              style={{
                borderColor: isOwned ? card.glowColor : 'rgba(255,255,255,0.08)',
                boxShadow: isOwned ? `0 8px 24px rgba(0,0,0,0.6), 0 0 15px ${card.glowColor}25` : 'none',
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
              {count > 1 && <span className="binder-duplicate-badge">x{count}</span>}
              <div className="binder-img-wrap">
                <img src={card.image} alt={card.title} loading="lazy" />
              </div>
              <div className="binder-card-meta">
                <span style={{ color: card.glowColor }}>{card.rarity}</span>
                <span>{card.badgeEmoji}</span>
              </div>
              <h4 className="binder-card-title">{card.title}</h4>
              {isOwned && count > 1 && onSelectForTrade && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onSelectForTrade(card.id); }}
                  className="binder-trade-btn">
                  Trade Duplicate
                </button>
              )}
            </div>
          );
        })}
      </div>
      )}
      </>
      )}

      {/* ============================================================
          IN-PLACE 3D CARD INSPECTION MODAL (RENDERED VIA PORTAL TO BODY)
          Guarantees 100% viewport centering without parent container clipping
          ============================================================ */}
      {mounted && inspectedCard && createPortal(
        <div
          onClick={() => setInspectedCardId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={() => setInspectedCardId(null)}
            aria-label="Close modal"
            style={{
              position: 'fixed',
              top: '24px',
              right: '28px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              transition: 'all 0.2s',
            }}
          >
            <X size={22} />
          </button>

          {/* Left Arrow Navigation on Screen Edge */}
          {canGoPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playTap();
                openCard(navCardList[currentNavIndex - 1]);
              }}
              title="Previous Card (Left Arrow)"
              style={{
                position: 'fixed',
                left: '28px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(10, 16, 30, 0.95)',
                border: '1.5px solid rgba(169, 221, 211, 0.7)',
                color: '#A9DDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 90,
                boxShadow: '0 0 25px rgba(169, 221, 211, 0.45)',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={30} />
            </button>
          )}

          {/* Right Arrow Navigation on Screen Edge */}
          {canGoNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playTap();
                openCard(navCardList[currentNavIndex + 1]);
              }}
              title="Next Card (Right Arrow)"
              style={{
                position: 'fixed',
                right: '28px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(10, 16, 30, 0.95)',
                border: '1.5px solid rgba(169, 221, 211, 0.7)',
                color: '#A9DDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 90,
                boxShadow: '0 0 25px rgba(169, 221, 211, 0.45)',
                transition: 'all 0.2s',
              }}
            >
              <ChevronRight size={30} />
            </button>
          )}

          {/* 3D Coverflow Stage for the ENTIRE CARD + DESCRIPTION SECTION */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1280px',
              height: '620px',
              perspective: '1400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '840px',
                height: '560px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Visible Units in 3D Coverflow: offset = -1 (left), 0 (center), 1 (right) */}
              {[-1, 0, 1].map((offset) => {
                const targetIdx = currentNavIndex + offset;
                if (targetIdx < 0 || targetIdx >= navCardList.length) return null;
                const cardId = navCardList[targetIdx];
                const card = ALL_30_CARDS.find((c) => c.id === cardId);
                if (!card) return null;

                const isActive = offset === 0;
                const cardOwnedCount = inventory[card.id] || 0;

                // 3D Coverflow Transform for the ENTIRE CARD + DESCRIPTION UNIT
                const translateX = offset * 540;
                const translateZ = isActive ? 0 : -320;
                const rotateY = offset * -28;
                const scale = isActive ? 1 : 0.72;
                const opacity = isActive ? 1 : 0.35;
                const zIndex = isActive ? 30 : 15;

                return (
                  <div
                    key={`coverflow-unit-${card.id}`}
                    onClick={() => {
                      if (!isActive) {
                        sound.playTap();
                        openCard(card.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '840px',
                      height: '560px',
                      borderRadius: '28px',
                      background: 'linear-gradient(135deg, rgba(8, 12, 20, 0.98), rgba(16, 24, 38, 0.98))',
                      border: `1.5px solid ${card.glowColor}${isActive ? '80' : '35'}`,
                      boxShadow: isActive
                        ? `0 30px 80px rgba(0, 0, 0, 0.95), 0 0 60px ${card.glowColor}35`
                        : `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${card.glowColor}15`,
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s, filter 0.5s, box-shadow 0.5s',
                      opacity,
                      filter: isActive ? 'none' : 'brightness(0.65)',
                      zIndex,
                      cursor: isActive ? 'default' : 'pointer',
                      padding: '32px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '36px',
                      userSelect: 'none',
                    }}
                  >
                    {/* LEFT HALF: 3D Holographic Card Artwork */}
                    <div style={{ flexShrink: 0, width: '310px', height: '490px' }}>
                      {isActive ? (
                        <div className="monad-perspective-wrapper" style={{ width: '100%', height: '100%' }}>
                          <div
                            ref={cardRef}
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            title="Click card to flip front/back"
                            className="monad-card-3d"
                            style={{
                              width: '310px',
                              height: '490px',
                              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isCardFlipped ? 180 : 0)}deg)`,
                              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                              cursor: 'pointer',
                            }}
                          >
                            {/* Holo Glare */}
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '28px',
                                zIndex: 10,
                                pointerEvents: 'none',
                                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, rgba(169, 221, 211,0.2) 40%, transparent 65%)`,
                              }}
                            />

                            {/* FRONT */}
                            <div className="monad-card-face monad-card-front">
                              <div className="monad-card-nameplate">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <RialoLogo size={14} />
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.06em' }}>
                                    WAVE 1 • GENESIS
                                  </span>
                                </div>
                                <div style={{
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  background: card.glowColor + '20',
                                  border: `1px solid ${card.glowColor}`,
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: card.glowColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}>
                                  {card.badgeEmoji} {card.rarity}
                                </div>
                              </div>

                              <div className="monad-art-frame">
                                <img src={card.image} alt={card.title} className="monad-art-image" />
                              </div>

                              <div className="monad-trait-card">
                                <div style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '12px',
                                  flexShrink: 0,
                                  background: card.glowColor + '20',
                                  border: `1.5px solid ${card.glowColor}60`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: `0 0 12px ${card.glowColor}40`,
                                }}>
                                  <span style={{ fontSize: '20px' }}>{card.badgeEmoji}</span>
                                </div>
                                <div className="monad-trait-content">
                                  <div className="monad-trait-title">{card.title}</div>
                                  <p className="monad-trait-lore">{card.lore}</p>
                                </div>
                              </div>

                              <div className="monad-card-footer">
                                <span className="monad-footer-brand">rialo.io</span>
                                <div className="monad-wave-badge" style={{ background: card.glowColor, color: '#040814' }}>
                                  {card.badgeEmoji} {card.rarity}
                                </div>
                              </div>
                            </div>

                            {/* BACK */}
                            <div
                              className="monad-card-face monad-card-back"
                              style={{ border: '2px solid rgba(169, 221, 211,0.7)', boxShadow: '0 0 50px rgba(169, 221, 211,0.5)' }}
                            >
                              <div className="monad-back-header">
                                <span>RIALO CARDS</span>
                                <span>GENESIS</span>
                              </div>
                              <div className="monad-back-center-logo">
                                <div className="monad-back-emblem"><RialoIcon size={56} color="#A9DDD3" /></div>
                                <div className="monad-back-title">rialo.io</div>
                                <div className="monad-back-subtitle">GENESIS WAVE 1</div>
                              </div>
                              <div className="monad-back-cta">
                                <Sparkles style={{ width: '16px', height: '16px', color: '#A9DDD3' }} />
                                <span>Click card to flip to front</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Flanking Card in 3D Perspective */
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '26px',
                            background: 'linear-gradient(160deg, #FFFFFF 0%, #F8FAFC 60%, #F1F5F9 100%)',
                            padding: '14px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                              WAVE 1 • GENESIS
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '9999px',
                              background: `${card.glowColor}20`,
                              border: `1px solid ${card.glowColor}`,
                              color: card.glowColor,
                            }}>
                              {card.badgeEmoji} {card.rarity}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '280px', borderRadius: '16px', overflow: 'hidden', margin: '8px 0', border: `1.5px solid ${card.glowColor}40` }}>
                            <img src={card.image} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: '#040814' }}>{card.title}</div>
                            <div style={{ fontSize: '10px', color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.lore}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT HALF: Complete Description & Action Buttons */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Counter & Hint */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#8E9B97', fontWeight: 700, letterSpacing: '0.05em' }}>
                          CARD {targetIdx + 1} OF {navCardList.length}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.4)', fontFamily: 'var(--font-mono)' }}>
                          Use ← → arrows to switch
                        </span>
                      </div>

                      {/* Rarity & Title */}
                      <div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: card.glowColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: '4px',
                        }}>
                          <Sparkles size={12} /> {card.badgeEmoji} {card.rarity} CARD
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                          {card.title}
                        </h2>
                      </div>

                      {/* Lore Quote */}
                      <p style={{
                        fontSize: '13px',
                        color: 'rgba(232, 227, 213, 0.8)',
                        lineHeight: 1.6,
                        margin: 0,
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        borderLeft: `3px solid ${card.glowColor}`,
                      }}>
                        {card.lore}
                      </p>

                      {/* Stats Grid: Ownership & Mint Access */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '10px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase' }}>OWNERSHIP</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: cardOwnedCount > 0 ? '#10B981' : '#F87171', marginTop: '2px' }}>
                            {cardOwnedCount > 0 ? `Owned (x${cardOwnedCount})` : 'Uncollected'}
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '10px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase' }}>MINT ACCESS</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                            Tier 1 Guaranteed
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCardFlipped) {
                                handleDownloadBackPNG();
                              } else {
                                handleDownloadPNG();
                              }
                            }}
                            disabled={!isActive || isDownloading}
                            style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '12px',
                              background: '#A9DDD3',
                              color: '#010101',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 900,
                              cursor: isActive && !isDownloading ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 0 15px rgba(169, 221, 211, 0.3)',
                            }}
                          >
                            <Download size={15} /> {isDownloading ? 'Generating...' : isCardFlipped ? 'Download Card Back (PNG)' : 'Download Card Front (PNG)'}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink();
                            }}
                            disabled={!isActive}
                            style={{
                              padding: '12px 18px',
                              borderRadius: '12px',
                              background: 'rgba(255,255,255,0.06)',
                              color: '#FFFFFF',
                              border: '1px solid rgba(255,255,255,0.15)',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: isActive ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Copy size={15} /> {copiedLink ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareX();
                          }}
                          disabled={!isActive}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1D9BF0, #0c80d0)',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 900,
                            cursor: isActive ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 0 15px rgba(29, 155, 240, 0.3)',
                          }}
                        >
                          <Share2 size={15} /> Share Card to X
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================
          BURN / RECYCLE MODAL (RENDERED VIA PORTAL TO BODY)
          Guarantees 100% viewport centering without parent container clipping
          ============================================================ */}
      {mounted && isRecycleModalOpen && createPortal(
        <div
          onClick={() => setIsRecycleModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(135deg, rgba(10,16,29,0.98), rgba(20,30,50,0.96))',
              border: '1.5px solid rgba(220,38,38,0.4)',
              borderRadius: '28px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 50px rgba(220,38,38,0.25)',
              padding: '36px 32px',
              margin: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={() => setIsRecycleModalOpen(false)}
              aria-label="Close forge modal"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: '#F87171',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                <Flame size={14} /> Alchemy Forge
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, margin: '4px 0', color: '#FFFFFF' }}>
                Burn 3 Duplicates ➔ Reroll 1 Mystery Card
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--rialo-text-muted)', margin: 0 }}>
                Select exactly 3 duplicate cards to forge into a brand new card.
              </p>
            </div>

            {recycledReward ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '180px',
                  height: '250px',
                  margin: '0 auto 16px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: `2px solid ${recycledReward.glowColor}`,
                  boxShadow: `0 0 35px ${recycledReward.glowColor}50`,
                }}>
                  <img src={recycledReward.image} alt={recycledReward.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px' }}>
                  Pulled: {recycledReward.title}!
                </h4>
                <p style={{ fontSize: '13px', color: recycledReward.glowColor, fontWeight: 800, margin: '0 0 20px' }}>
                  {recycledReward.badgeEmoji} {recycledReward.rarity}
                </p>
                <button
                  type="button"
                  onClick={() => setRecycledReward(null)}
                  className="admin-btn-primary"
                  style={{ background: 'linear-gradient(135deg, #A9DDD3, #2563EB)', padding: '10px 24px' }}
                >
                  Forge More Cards
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '280px', overflowY: 'auto', padding: '4px 0' }}>
                  {duplicateCards.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', width: '100%', color: 'var(--rialo-text-dim)', fontSize: '13px' }}>
                      No duplicate cards yet. Complete more daily quests!
                    </div>
                  ) : duplicateCards.map(({ card, count }) => {
                    const isSelected = selectedToBurn.includes(card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => handleToggleSelectBurn(card.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isSelected ? 'rgba(220,38,38,0.25)' : 'rgba(15,23,42,0.8)',
                          border: isSelected ? '2px solid #EF4444' : '1px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          flex: '1 1 240px',
                          transition: 'all 0.15s',
                        }}
                      >
                        <img src={card.image} alt={card.title} style={{ width: '42px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {card.title}
                          </div>
                          <div style={{ fontSize: '11px', color: card.glowColor, fontWeight: 800 }}>{card.rarity}</div>
                          <div style={{ fontSize: '11px', color: 'var(--rialo-text-dim)' }}>Duplicates: {count}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--rialo-text-muted)' }}>
                    Selected: <strong style={{ color: selectedToBurn.length === 3 ? '#10B981' : '#F59E0B' }}>{selectedToBurn.length}/3</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleExecuteRecycle}
                    disabled={selectedToBurn.length !== 3 || recycling}
                    style={{
                      padding: '12px 28px',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: selectedToBurn.length === 3 ? '#EF4444' : 'rgba(255,255,255,0.1)',
                      color: selectedToBurn.length === 3 ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: selectedToBurn.length === 3 ? 'pointer' : 'not-allowed',
                      boxShadow: selectedToBurn.length === 3 ? '0 0 20px rgba(239,68,68,0.4)' : 'none',
                    }}
                  >
                    {recycling ? 'Forging...' : 'Burn & Reroll 1 Card'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
