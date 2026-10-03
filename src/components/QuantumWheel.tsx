"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw, Zap, Gift, CheckCircle2, AlertCircle, X, BookOpen } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile, CardArchetype } from '@/lib/types';

interface QuantumWheelProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
  onNavigateToBinder?: () => void;
}

const SECTORS = [
  { label: '+15', sublabel: 'SHARDS', color: '#061411', textColor: '#A9DDD3', type: 'shards', amount: 15 },
  { label: '+30', sublabel: 'SHARDS', color: '#141613', textColor: '#E8E3D5', type: 'shards', amount: 30 },
  { label: '🎴 CARD', sublabel: 'GENESIS', color: '#09221c', textColor: '#A9DDD3', type: 'card', amount: 1 },
  { label: '+50', sublabel: 'SHARDS', color: '#161916', textColor: '#E8E3D5', type: 'shards', amount: 50 },
  { label: '+20', sublabel: 'SHARDS', color: '#081a15', textColor: '#A9DDD3', type: 'shards', amount: 20 },
  { label: '+100', sublabel: 'SHARDS', color: '#181b18', textColor: '#E8E3D5', type: 'shards', amount: 100 },
  { label: '+25', sublabel: 'SHARDS', color: '#071e18', textColor: '#A9DDD3', type: 'shards', amount: 25 },
  { label: '💎 250', sublabel: 'JACKPOT', color: '#14332a', textColor: '#FFFFFF', type: 'shards', amount: 250 },
];

export const QuantumWheel: React.FC<QuantumWheelProps> = ({ user, onUserUpdate, onNavigateToBinder }) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isFreeAvailable, setIsFreeAvailable] = useState<boolean>(true);
  const [wonPrize, setWonPrize] = useState<any | null>(null);
  const [wonBonusCard, setWonBonusCard] = useState<CardArchetype | null>(null);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const tickIntervalRef = useRef<any>(null);

  const fetchWheelStatus = async () => {
    if (!user?.username) return;
    try {
      const res = await fetch(`/api/arcade?username=${encodeURIComponent(user.username)}`);
      const data = await res.json();
      if (data.success) {
        setIsFreeAvailable(data.isFreeSpinAvailable);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWheelStatus();
  }, [user?.username]);

  const handleSpin = async (isPaid: boolean = false) => {
    if (!user?.username || isSpinning) return;
    setErrorMsg(null);
    setWonPrize(null);
    setWonBonusCard(null);

    sound.playTap();

    try {
      setIsSpinning(true);
      const res = await fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SPIN_WHEEL',
          username: user.username,
          isPaid,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Failed to spin');
        setIsSpinning(false);
        return;
      }

      // Calculate rotation so that the chosen sector aligns with top needle (270 deg in SVG circle)
      const prizeIndex = data.prizeIndex;
      const sliceDeg = 360 / SECTORS.length;
      // Center of sector in standard coords:
      const sectorCenterDeg = prizeIndex * sliceDeg + sliceDeg / 2;
      // Needle is at top (270 degrees in SVG coordinates)
      const targetDeg = (360 - sectorCenterDeg + 270) % 360;
      const totalSpins = 6;
      const currentMod = rotation % 360;
      const diff = ((targetDeg - currentMod) + 360) % 360;
      const nextRotation = rotation + totalSpins * 360 + diff;

      // Play ticking audio
      let tickCount = 0;
      const totalTicks = 28;
      tickIntervalRef.current = setInterval(() => {
        sound.playWheelTick();
        tickCount++;
        if (tickCount >= totalTicks) {
          clearInterval(tickIntervalRef.current);
        }
      }, 140);

      setRotation(nextRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setWonPrize(data.prize);

        // If a card was pulled, trigger the epic Card Received celebration modal!
        if (data.bonusCard) {
          setWonBonusCard(data.bonusCard);
          setShowCardModal(true);
          sound.playJackpot();
        } else if (data.prize?.amount >= 100) {
          sound.playJackpot();
        } else {
          sound.playSuccess();
        }

        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
        setIsFreeAvailable(false);
      }, 4200);

    } catch (e: any) {
      setErrorMsg(e.message || 'Network error');
      setIsSpinning(false);
    }
  };

  const sliceAngle = 360 / SECTORS.length;

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 12, 11, 0.95) 0%, rgba(2, 4, 3, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.22)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes wheelRaysRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes wheelCardPop {
          0% { transform: scale(0.35) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.04) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>

      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(169, 221, 211, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
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
          <Sparkles size={14} /> Quantum Rotary Engine
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 8px 0', color: '#E8E3D5' }}>
          Daily Quantum <span className="gradient-text-rialo">Shard Wheel</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
          Harness absolute zero superconductivity for daily rewards. 1 free spin every 24 hours or fuel the accelerator with 25 Shards.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          maxWidth: '400px',
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
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wheel Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '16px 0',
      }}>
        {/* Top Pointer Needle */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          zIndex: 30,
          width: '0',
          height: '0',
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '24px solid #A9DDD3',
          filter: 'drop-shadow(0 4px 8px rgba(169, 221, 211, 0.8))',
        }} />

        {/* Outer Glowing Bezel */}
        <div style={{
          width: '330px',
          height: '330px',
          borderRadius: '50%',
          border: '3px solid rgba(169, 221, 211, 0.4)',
          boxShadow: '0 0 35px rgba(169, 221, 211, 0.25), inset 0 0 30px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030605',
        }}>
          {/* Rotating Wheel Container */}
          <div
            style={{
              width: '316px',
              height: '316px',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.2s cubic-bezier(0.12, 0.95, 0.22, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }}>
              {SECTORS.map((sector, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = (i + 1) * sliceAngle;
                const midAngle = startAngle + sliceAngle / 2;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 150 + 150 * Math.cos(startRad);
                const y1 = 150 + 150 * Math.sin(startRad);
                const x2 = 150 + 150 * Math.cos(endRad);
                const y2 = 150 + 150 * Math.sin(endRad);

                const d = `M 150,150 L ${x1},${y1} A 150,150 0 0,1 ${x2},${y2} Z`;

                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill={sector.color}
                      stroke="rgba(169, 221, 211, 0.25)"
                      strokeWidth="1.5"
                    />
                    <g transform={`rotate(${midAngle} 150 150)`}>
                      <text
                        x="240"
                        y="146"
                        fill={sector.textColor}
                        fontSize="12.5"
                        fontWeight="900"
                        fontFamily="var(--font-mono, monospace)"
                        textAnchor="middle"
                        letterSpacing="-0.5px"
                      >
                        {sector.label}
                      </text>
                      <text
                        x="240"
                        y="160"
                        fill={sector.textColor}
                        opacity="0.75"
                        fontSize="7.5"
                        fontWeight="800"
                        fontFamily="var(--font-mono, monospace)"
                        textAnchor="middle"
                        letterSpacing="0.8px"
                      >
                        {sector.sublabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub */}
          <div style={{
            position: 'absolute',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #0e201b 0%, #020403 100%)',
            border: '2px solid #A9DDD3',
            boxShadow: '0 0 20px rgba(169, 221, 211, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}>
            <Zap size={22} color="#A9DDD3" />
          </div>
        </div>
      </div>

      {/* Prize Won Banner (for shards) */}
      {wonPrize && !isSpinning && !wonBonusCard && (
        <div style={{
          maxWidth: '460px',
          margin: '16px auto 0 auto',
          padding: '16px 20px',
          background: 'rgba(169, 221, 211, 0.12)',
          border: '1px solid rgba(169, 221, 211, 0.5)',
          borderRadius: '16px',
          textAlign: 'center',
          animation: 'fadeIn 0.4s ease',
          boxShadow: '0 0 25px rgba(169, 221, 211, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#A9DDD3', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
            <CheckCircle2 size={16} /> REWARD CLAIMED
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF' }}>
            You Won: <span style={{ color: '#A9DDD3' }}>{wonPrize.label}</span>!
          </div>
          <div style={{ fontSize: '12px', color: '#A5B5B0', marginTop: '4px' }}>
            Shards instantly deposited to your profile balance.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '14px',
        marginTop: '24px',
        flexWrap: 'wrap',
      }}>
        {isFreeAvailable ? (
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => handleSpin(false)}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
              color: '#010101',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: '900',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(169, 221, 211, 0.4)',
              transition: 'all 0.2s',
              opacity: isSpinning ? 0.7 : 1,
            }}
          >
            <Sparkles size={18} />
            <span>{isSpinning ? 'Decelerating...' : 'SPIN DAILY (FREE)'}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isSpinning || (user?.shards || 0) < 25}
            onClick={() => handleSpin(true)}
            style={{
              padding: '14px 32px',
              background: (user?.shards || 0) >= 25
                ? 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              color: (user?.shards || 0) >= 25 ? '#010101' : '#666666',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: '900',
              cursor: isSpinning || (user?.shards || 0) < 25 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: (user?.shards || 0) >= 25 ? '0 0 25px rgba(169, 221, 211, 0.4)' : 'none',
              transition: 'all 0.2s',
              opacity: isSpinning ? 0.7 : 1,
            }}
          >
            <Zap size={18} />
            <span>{isSpinning ? 'Accelerating...' : 'SPIN AGAIN (25 Shards)'}</span>
          </button>
        )}
      </div>

      {/* ========================================================
          EPIC FULL-SCREEN CARD PULLED CELEBRATION MODAL
          ======================================================== */}
      {showCardModal && wonBonusCard && (
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
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(169, 221, 211, 0.4) 45deg, transparent 90deg, rgba(169, 221, 211, 0.4) 135deg, transparent 180deg, rgba(169, 221, 211, 0.4) 225deg, transparent 270deg, rgba(169, 221, 211, 0.4) 315deg, transparent 360deg)`,
            borderRadius: '50%',
            opacity: 0.35,
            animation: 'wheelRaysRotate 20s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* Modal Container */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '460px',
            width: '100%',
            background: 'linear-gradient(180deg, rgba(8, 20, 16, 0.98) 0%, rgba(3, 8, 6, 0.99) 100%)',
            border: '2px solid #A9DDD3',
            borderRadius: '28px',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(169, 221, 211, 0.45)',
            animation: 'wheelCardPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setShowCardModal(false)}
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
              background: 'rgba(169, 221, 211, 0.15)',
              border: '1px solid #A9DDD3',
              color: '#A9DDD3',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '12px',
            }}>
              <Sparkles size={14} /> QUANTUM WHEEL JACKPOT • CARD UNLOCKED!
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
            }}>
              Warrior Card <span className="gradient-text-rialo">Manifested!</span>
            </h2>

            {/* Large Holographic Card Frame */}
            <div style={{
              width: '220px',
              height: '290px',
              margin: '0 auto 16px auto',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              border: `2.5px solid ${wonBonusCard.glowColor || '#A9DDD3'}`,
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 30px ${wonBonusCard.glowColor || '#A9DDD3'}60`,
            }}>
              <img
                src={wonBonusCard.image}
                alt={wonBonusCard.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Rarity Pill Overlay */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.85)',
                border: `1px solid ${wonBonusCard.glowColor || '#A9DDD3'}`,
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 900,
                color: wonBonusCard.glowColor || '#A9DDD3',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>{wonBonusCard.badgeEmoji}</span>
                <span>{wonBonusCard.rarity}</span>
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
                  {wonBonusCard.title}
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
                ARCHETYPE PROFILE & LORE
              </div>
              <p style={{ fontSize: '12px', color: '#D1D5DB', margin: 0, lineHeight: '1.45' }}>
                "{wonBonusCard.lore}"
              </p>
            </div>

            {/* Review Status Summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '10px 14px',
              background: 'rgba(169, 221, 211, 0.1)',
              border: '1px solid rgba(169, 221, 211, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Inventory Status</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#A9DDD3' }}>
                  ✓ In Your Binder (x{(user?.inventory?.[wonBonusCard.id] || 1)})
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <div>
                <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase' }}>Points Reward</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#FBBF24' }}>
                  +50 Whitelist Pts
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {onNavigateToBinder && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCardModal(false);
                    onNavigateToBinder();
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
                onClick={() => setShowCardModal(false)}
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
                <Sparkles size={15} color="#A9DDD3" /> Collect & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
