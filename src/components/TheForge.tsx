"use client";

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Plus, Check, ArrowRight, ShieldAlert, Award, Eye, X, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile, CardArchetype } from '@/lib/types';
import { ALL_30_CARDS } from '@/lib/cardsData';

interface TheForgeProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
  onNavigateToAlbum?: () => void;
}

export const TheForge: React.FC<TheForgeProps> = ({ user, onUserUpdate, onNavigateToAlbum }) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isForging, setIsForging] = useState<boolean>(false);
  const [forgedCard, setForgedCard] = useState<CardArchetype | null>(null);
  const [showForgeModal, setShowForgeModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgePhaseText, setForgePhaseText] = useState<string>('Compressing Quantum Lattice...');
  const [ignitionTimer, setIgnitionTimer] = useState<number>(0);

  // Cards owned by user & Strict Duplicate Protection
  const inventory = user?.inventory || {};
  const ownedList = ALL_30_CARDS.filter(c => (inventory[c.id] || 0) > 0);
  const duplicateCardsList = ALL_30_CARDS.filter(c => (inventory[c.id] || 0) >= 2);
  const totalAvailableDuplicates = ALL_30_CARDS.reduce((sum, c) => sum + Math.max(0, (inventory[c.id] || 0) - 1), 0);

  // Count how many copies of each card are selected
  const selectedCountMap: Record<string, number> = {};
  for (const id of selectedCards) {
    selectedCountMap[id] = (selectedCountMap[id] || 0) + 1;
  }

  const handleSelectCard = (cardId: string) => {
    sound.playTap();
    setErrorMsg(null);

    const currentSelected = selectedCountMap[cardId] || 0;
    const owned = inventory[cardId] || 0;
    const availableDuplicates = Math.max(0, owned - 1);

    if (availableDuplicates <= 0) {
      setErrorMsg('🔒 Single Copy Protected: You only have 1 copy of this card. The Forge strictly requires duplicate copies so your collection remains complete!');
      return;
    }

    if (currentSelected >= availableDuplicates) {
      setErrorMsg('You have already selected all available duplicate copies of this card.');
      return;
    }

    if (selectedCards.length < 3) {
      setSelectedCards(prev => [...prev, cardId]);
    }
  };

  const handleRemoveSelected = (index: number) => {
    sound.playTap();
    setErrorMsg(null);
    setSelectedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleFuse = async () => {
    if (selectedCards.length !== 3 || !user?.username || isForging) return;
    setErrorMsg(null);

    if ((user.shards || 0) < 35) {
      setErrorMsg('Insufficient Shards. The Forge requires 35 Shards to ignite.');
      return;
    }

    sound.playForge();
    setIsForging(true);
    setForgePhaseText('⚡ Igniting Cryogenic Laser Chamber...');

    // Dynamic phase transitions
    setTimeout(() => {
      setForgePhaseText('🔥 Compressing 3 Warrior Cores (-35 Shards)...');
    }, 700);

    setTimeout(() => {
      setForgePhaseText('🌟 Quantum Transmutation Singularity Forming...');
    }, 1500);

    try {
      const res = await fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FUSE_CARDS',
          username: user.username,
          cardIds: selectedCards,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Fusion failed');
        setIsForging(false);
        return;
      }

      setTimeout(() => {
        setIsForging(false);
        setForgedCard(data.forgedCard);
        setShowForgeModal(true);
        setSelectedCards([]);
        sound.playJackpot();
        if (typeof window !== 'undefined') {
          const clean = (user.username || '').toLowerCase().replace('@', '');
          const cur = parseInt(localStorage.getItem(`rialo_forged_count_${clean}`) || '0') + 1;
          localStorage.setItem(`rialo_forged_count_${clean}`, String(cur));
          if (data.forgedCard?.rarity && ['RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].includes(data.forgedCard.rarity.toUpperCase())) {
            localStorage.setItem(`rialo_forged_high_yield_${clean}`, 'true');
          }
          if (data.forgedCard?.rarity?.toUpperCase() === 'MYTHIC') {
            localStorage.setItem(`rialo_forged_mythic_${clean}`, 'true');
          }
          window.dispatchEvent(new Event('rialo_forge_activity'));
        }
        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      }, 2400);

    } catch (e: any) {
      setErrorMsg(e.message || 'Network error');
      setIsForging(false);
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'MYTHIC':
        return { color: '#EC4899', aura: 'rgba(236, 72, 153, 0.65)', border: '#EC4899', tagBg: 'rgba(236, 72, 153, 0.2)' };
      case 'LEGENDARY':
        return { color: '#F59E0B', aura: 'rgba(245, 158, 11, 0.65)', border: '#F59E0B', tagBg: 'rgba(245, 158, 11, 0.2)' };
      case 'EPIC':
        return { color: '#10B981', aura: 'rgba(16, 185, 129, 0.65)', border: '#10B981', tagBg: 'rgba(16, 185, 129, 0.2)' };
      case 'RARE':
      default:
        return { color: '#3B82F6', aura: 'rgba(59, 130, 246, 0.65)', border: '#3B82F6', tagBg: 'rgba(59, 130, 246, 0.2)' };
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 12, 11, 0.95) 0%, rgba(2, 4, 3, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.22)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      position: 'relative',
    }}>
      {/* CSS Keyframes for Epic Animations */}
      <style>{`
        @keyframes forgeRaysRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes forgeModalPop {
          0% { transform: scale(0.35) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.04) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes forgePulseSlot {
          0%, 100% { box-shadow: 0 0 15px rgba(169, 221, 211, 0.3); border-color: rgba(169, 221, 211, 0.4); }
          50% { box-shadow: 0 0 35px rgba(16, 185, 129, 0.8); border-color: #10B981; }
        }
        @keyframes singularitySpin {
          0% { transform: rotate(0deg) scale(0.9); }
          50% { transform: rotate(180deg) scale(1.15); filter: drop-shadow(0 0 25px #10B981); }
          100% { transform: rotate(360deg) scale(0.9); }
        }
        @keyframes floatSparks {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 1; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.8; }
        }
      `}</style>

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
          <Flame size={14} /> Alchemy & Card Synthesis
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0' }}>
          The <span className="gradient-text-rialo">Superconducting Forge</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '14px', maxWidth: '540px', margin: '0 auto' }}>
          Melt down 3 duplicate cards + 35 Shards inside the cryogenic chamber to synthesize higher-tier Rare, Epic, Legendary, or Mythic warriors!
        </p>
      </div>

      {errorMsg && (
        <div style={{
          maxWidth: '460px',
          margin: '0 auto 16px auto',
          padding: '10px 16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#f87171',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Crucible Center Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 0',
        position: 'relative',
      }}>
        {/* Forging Plasma Animation Overlay */}
        {isForging && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(169, 221, 211, 0.15) 50%, transparent 70%)',
            zIndex: 15,
            animation: 'singularitySpin 1.8s infinite linear',
            pointerEvents: 'none',
          }} />
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 5,
        }}>
          {[0, 1, 2].map((slotIdx) => {
            const cardId = selectedCards[slotIdx];
            const card = cardId ? ALL_30_CARDS.find(c => c.id === cardId) : null;

            return (
              <div
                key={slotIdx}
                onClick={() => card && !isForging && handleRemoveSelected(slotIdx)}
                style={{
                  width: '110px',
                  height: '150px',
                  borderRadius: '16px',
                  border: card
                    ? (isForging ? '2.5px solid #10B981' : '2px solid #A9DDD3')
                    : '2px dashed rgba(169, 221, 211, 0.25)',
                  background: card ? 'rgba(169, 221, 211, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: card && !isForging ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'all 0.2s',
                  boxShadow: card
                    ? (isForging ? '0 0 25px rgba(16, 185, 129, 0.8)' : '0 0 15px rgba(169, 221, 211, 0.3)')
                    : 'none',
                  animation: isForging && card ? 'forgePulseSlot 1.2s infinite ease-in-out' : 'none',
                }}
                title={card ? 'Click to remove' : 'Select a card from below'}
              >
                {card ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.65) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '6px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          background: 'rgba(0,0,0,0.75)',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          color: card.glowColor || '#A9DDD3',
                          border: `1px solid ${card.glowColor || '#A9DDD3'}60`,
                        }}>
                          {card.badgeEmoji} {card.rarity}
                        </span>
                        {!isForging && (
                          <span style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 900,
                          }}>×</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                        {card.title}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#667773' }}>
                    <Plus size={22} style={{ margin: '0 auto 4px auto', opacity: 0.7 }} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>Slot {slotIdx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status Text during Forging */}
        {isForging && (
          <div style={{
            marginTop: '16px',
            color: '#10B981',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s',
          }}>
            <Sparkles size={16} className="animate-spin" />
            <span>{forgePhaseText}</span>
          </div>
        )}

        {/* Forge Action Button */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            type="button"
            disabled={selectedCards.length !== 3 || isForging}
            onClick={handleFuse}
            style={{
              padding: '14px 38px',
              background: selectedCards.length === 3
                ? (isForging ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)')
                : 'rgba(255, 255, 255, 0.06)',
              color: selectedCards.length === 3 ? '#010101' : '#666666',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: '900',
              cursor: selectedCards.length === 3 && !isForging ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: selectedCards.length === 3 ? '0 0 25px rgba(169, 221, 211, 0.45)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Flame size={18} />
            <span>{isForging ? 'Synthesizing...' : 'IGNITE FORGE (35 Shards)'}</span>
          </button>
        </div>
      </div>

      {/* Last Forged Review Card Banner (in-page review) */}
      {forgedCard && !isForging && (
        <div style={{
          maxWidth: '540px',
          margin: '20px auto',
          padding: '18px 22px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(6, 12, 10, 0.95) 100%)',
          border: '1.5px solid #10B981',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 0 35px rgba(16, 185, 129, 0.25)',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{
            width: '74px',
            height: '96px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1.5px solid ${getRarityGlow(forgedCard.rarity).border}`,
            flexShrink: 0,
            boxShadow: `0 0 15px ${getRarityGlow(forgedCard.rarity).aura}`,
          }}>
            <img src={forgedCard.image} alt={forgedCard.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, textTransform: 'uppercase' }}>
                ✓ Last Transmuted Warrior
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                background: getRarityGlow(forgedCard.rarity).tagBg,
                color: getRarityGlow(forgedCard.rarity).color,
              }}>
                {forgedCard.rarity}
              </span>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px' }}>
              {forgedCard.title}
            </div>

            <p style={{
              fontSize: '11px',
              color: '#8E9B97',
              margin: '0 0 10px 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {forgedCard.lore}
            </p>

            <button
              type="button"
              onClick={() => setShowForgeModal(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10B981',
                color: '#34D399',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Eye size={13} /> Re-Open 3D Card Review
            </button>
          </div>
        </div>
      )}

      {/* Inventory Selector Drawer */}
      <div style={{ marginTop: '28px', borderTop: '1px solid rgba(169, 221, 211, 0.15)', paddingTop: '20px' }}>
        {totalAvailableDuplicates < 3 && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            color: '#FDE68A',
            fontSize: '12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <ShieldAlert size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#FFFFFF' }}>Duplicate Card Requirement:</strong> The Forge requires at least 3 duplicate cards to ignite.
              You currently have <strong style={{ color: '#F59E0B' }}>{totalAvailableDuplicates} duplicate card{totalAvailableDuplicates === 1 ? '' : 's'}</strong> available.
              Single collection copies are locked and protected to preserve your binder collection!
            </div>
          </div>
        )}

        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#E8E3D5', marginBottom: '4px', textAlign: 'center' }}>
          Select From Your Duplicate Cards ({totalAvailableDuplicates} Duplicates Available Across {duplicateCardsList.length} Archetypes)
        </h4>
        <p style={{ fontSize: '11px', color: '#8E9B97', textAlign: 'center', margin: '0 0 16px 0' }}>
          Single collection copies are permanently protected for your binder album. Only duplicate cards can be transmuted!
        </p>

        {ownedList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#667773', fontSize: '13px', padding: '20px 0' }}>
            You don't have any cards in your inventory yet. Complete Daily Quests or spin the Lucky Wheel to get cards!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))',
            gap: '12px',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '6px',
            paddingBottom: '10px',
          }}>
            {ownedList.map((card) => {
              const ownedCount = inventory[card.id] || 0;
              const availableDuplicates = Math.max(0, ownedCount - 1);
              const selectedCount = selectedCountMap[card.id] || 0;
              const remaining = availableDuplicates - selectedCount;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectCard(card.id)}
                  disabled={remaining <= 0 || selectedCards.length >= 3 || isForging}
                  style={{
                    position: 'relative',
                    padding: 0,
                    borderRadius: '14px',
                    border: selectedCount > 0
                      ? '2px solid #A9DDD3'
                      : `1.5px solid ${card.glowColor ? card.glowColor + '40' : 'rgba(255,255,255,0.1)'}`,
                    background: '#070B12',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: remaining > 0 && selectedCards.length < 3 && !isForging ? 'pointer' : 'not-allowed',
                    opacity: remaining <= 0 ? 0.35 : 1,
                    transition: 'all 0.15s ease',
                    boxShadow: selectedCount > 0 ? '0 0 16px rgba(169, 221, 211, 0.35)' : 'none',
                    textAlign: 'left',
                  }}
                >
                  {/* Card Thumbnail Image */}
                  <div style={{ width: '100%', height: '110px', position: 'relative' }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Badge Pill in corner */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'rgba(0,0,0,0.75)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 800,
                      color: card.glowColor || '#A9DDD3',
                      border: `1px solid ${card.glowColor || '#A9DDD3'}60`,
                    }}>
                      {card.badgeEmoji} {card.rarity}
                    </div>

                    {/* Duplicate Quantity Counter & Lock */}
                    <div style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      background: remaining > 0 ? '#A9DDD3' : availableDuplicates > 0 ? '#F59E0B' : 'rgba(239, 68, 68, 0.85)',
                      color: remaining > 0 ? '#010101' : '#FFFFFF',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      {remaining > 0 ? `${remaining} Dup` : availableDuplicates > 0 ? 'Selected' : '🔒 Protected'}
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ padding: '8px', background: 'rgba(6,10,10,0.95)' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {card.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          EPIC FULL-SCREEN TRANSMUTATION & CARD REVIEW MODAL
          ======================================================== */}
      {showForgeModal && forgedCard && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(2, 6, 5, 0.94)',
          backdropFilter: 'blur(24px)',
          padding: '20px',
          overflow: 'hidden',
        }}>
          {/* Rotating Cosmic Light Rays in Background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '800px',
            height: '800px',
            background: `conic-gradient(from 0deg, transparent 0deg, ${getRarityGlow(forgedCard.rarity).aura} 45deg, transparent 90deg, ${getRarityGlow(forgedCard.rarity).aura} 135deg, transparent 180deg, ${getRarityGlow(forgedCard.rarity).aura} 225deg, transparent 270deg, ${getRarityGlow(forgedCard.rarity).aura} 315deg, transparent 360deg)`,
            borderRadius: '50%',
            opacity: 0.35,
            animation: 'forgeRaysRotate 20s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* Modal Container */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '460px',
            width: '100%',
            background: 'linear-gradient(180deg, rgba(8, 20, 16, 0.98) 0%, rgba(3, 8, 6, 0.99) 100%)',
            border: `2px solid ${getRarityGlow(forgedCard.rarity).border}`,
            borderRadius: '28px',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.9), 0 0 50px ${getRarityGlow(forgedCard.rarity).aura}`,
            animation: 'forgeModalPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setShowForgeModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#E8E3D5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>

            {/* Header Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#34D399',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '12px',
            }}>
              <Flame size={14} /> FUSION SUCCESSFUL • QUANTUM TRANSMUTATION
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
            }}>
              Genesis Warrior <span className="gradient-text-rialo">Synthesized!</span>
            </h2>

            {/* Large Holographic Card Frame */}
            <div style={{
              width: '220px',
              height: '290px',
              margin: '0 auto 16px auto',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              border: `2.5px solid ${getRarityGlow(forgedCard.rarity).border}`,
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 30px ${getRarityGlow(forgedCard.rarity).aura}`,
              transform: 'perspective(600px) rotateY(0deg)',
              transition: 'transform 0.3s ease',
            }}>
              <img
                src={forgedCard.image}
                alt={forgedCard.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Rarity Pill Overlay */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.85)',
                border: `1px solid ${getRarityGlow(forgedCard.rarity).border}`,
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 900,
                color: getRarityGlow(forgedCard.rarity).color,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>{forgedCard.badgeEmoji}</span>
                <span>{forgedCard.rarity}</span>
              </div>

              {/* Bottom Holographic Label */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '12px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
              }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                  {forgedCard.title}
                </div>
              </div>
            </div>

            {/* Technical Lore Review Plaque */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '16px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#A9DDD3', textTransform: 'uppercase', marginBottom: '4px' }}>
                PROTOCOL SPECIFICATION & LORE
              </div>
              <p style={{ fontSize: '12px', color: '#D1D5DB', margin: 0, lineHeight: '1.45' }}>
                "{forgedCard.lore}"
              </p>
            </div>

            {/* Review Stats Summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '10px 14px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>In Your Binder</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#10B981' }}>
                  Now {(user?.inventory?.[forgedCard.id] || 1)}x Copies
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <div>
                <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Points Reward</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#FBBF24' }}>
                  +150 Whitelist Pts
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {onNavigateToAlbum && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgeModal(false);
                    onNavigateToAlbum();
                  }}
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
                    border: 'none',
                    color: '#010101',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(169, 221, 211, 0.4)',
                  }}
                >
                  <BookOpen size={16} /> View in Digital Binder
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowForgeModal(false)}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#E8E3D5',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Flame size={15} color="#10B981" /> Forge Another Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
