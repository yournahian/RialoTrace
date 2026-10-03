'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Flame, Trophy, Play, RotateCcw, Award, CheckCircle2 } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';

interface SuperconductorRushProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
}

interface ActiveNode {
  id: number;
  spawnTime: number;
  duration: number; // ms until it decays
  type: 'standard' | 'golden';
}

export const SuperconductorRush: React.FC<SuperconductorRushProps> = ({ user, onUserUpdate }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [activeNodes, setActiveNodes] = useState<Map<number, ActiveNode>>(new Map());
  const [nodesHit, setNodesHit] = useState<number>(0);
  const [nodesMissed, setNodesMissed] = useState<number>(0);
  const [highscore, setHighscore] = useState<number>(0);
  const [earnedShards, setEarnedShards] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const spawnerRef = useRef<any>(null);

  // Load highscore
  useEffect(() => {
    if (user?.username) {
      fetch(`/api/arcade?username=${encodeURIComponent(user.username)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.arcadeHighscore) {
            setHighscore(data.arcadeHighscore);
          }
        })
        .catch(console.error);
    }
  }, [user?.username]);

  const startGame = () => {
    sound.playTap();
    setGameState('PLAYING');
    setTimeLeft(30);
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    setNodesHit(0);
    setNodesMissed(0);
    setActiveNodes(new Map());
    setEarnedShards(0);

    // 1-second countdown clock
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawner loop
    spawnerRef.current = setInterval(() => {
      spawnNode();
    }, 450);
  };

  const spawnNode = () => {
    setActiveNodes(prev => {
      const next = new Map(prev);
      const now = Date.now();

      // Clear expired nodes
      Array.from(next.entries()).forEach(([key, node]) => {
        if (now - node.spawnTime > node.duration) {
          next.delete(key);
          setNodesMissed(m => m + 1);
          setCombo(0);
          setMultiplier(1);
        }
      });

      // Max 4 simultaneous nodes
      if (next.size >= 4) return next;

      // Pick random empty slot (0 to 15)
      const available = [];
      for (let i = 0; i < 16; i++) {
        if (!next.has(i)) available.push(i);
      }
      if (available.length === 0) return next;

      const slot = available[Math.floor(Math.random() * available.length)];
      const isGolden = Math.random() < 0.15; // 15% chance golden high-shards node
      next.set(slot, {
        id: slot,
        spawnTime: now,
        duration: isGolden ? 1100 : 1400,
        type: isGolden ? 'golden' : 'standard',
      });

      return next;
    });
  };

  const handleNodeClick = (index: number) => {
    if (gameState !== 'PLAYING') return;

    if (activeNodes.has(index)) {
      const node = activeNodes.get(index)!;
      const basePoints = node.type === 'golden' ? 250 : 100;
      const added = basePoints * multiplier;

      sound.playZap(multiplier);

      setScore(s => s + added);
      setNodesHit(h => h + 1);

      // Increase combo & multiplier
      setCombo(c => {
        const nextCombo = c + 1;
        if (nextCombo >= 20) setMultiplier(8);
        else if (nextCombo >= 12) setMultiplier(4);
        else if (nextCombo >= 5) setMultiplier(2);
        return nextCombo;
      });

      // Remove hit node
      setActiveNodes(prev => {
        const next = new Map(prev);
        next.delete(index);
        return next;
      });
    } else {
      // Clicked dead cell
      sound.playTap();
      setCombo(0);
      setMultiplier(1);
    }
  };

  const endGame = async () => {
    clearInterval(timerRef.current);
    clearInterval(spawnerRef.current);
    setGameState('GAMEOVER');

    sound.playSuccess();

    // Submit score
    if (user?.username) {
      try {
        setIsSubmitting(true);
        const finalAccuracy = nodesHit + nodesMissed > 0 ? Math.round((nodesHit / (nodesHit + nodesMissed)) * 100) : 0;
        const res = await fetch('/api/arcade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ARCADE_SCORE',
            username: user.username,
            score,
            nodesHit,
            efficiency: finalAccuracy,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setEarnedShards(data.earnedShards);
          if (data.highscore) setHighscore(data.highscore);
          if (data.user && onUserUpdate) {
            onUserUpdate(data.user);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnerRef.current);
    };
  }, []);

  const totalAttempts = nodesHit + nodesMissed;
  const accuracy = totalAttempts > 0 ? Math.round((nodesHit / totalAttempts) * 100) : 100;

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
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          <Zap size={14} /> 30-Second Micro Arcade
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0' }}>
          Superconductor <span className="gradient-text-rialo">Rush</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
          Tap zero-friction quantum nodes as they surge. Maintain your combo streak to achieve 8x Hyper-Conductivity and earn daily Shards!
        </p>
      </div>

      {/* Heads Up Display (HUD) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        maxWidth: '560px',
        margin: '0 auto 24px auto',
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Time</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: timeLeft <= 5 ? '#f87171' : '#FFFFFF' }}>{timeLeft}s</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Score</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#A9DDD3' }}>{score}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Multiplier</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: multiplier > 1 ? '#A9DDD3' : '#FFFFFF' }}>{multiplier}x</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Best</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#E8E3D5' }}>{highscore}</div>
        </div>
      </div>

      {/* Game Area / Grid */}
      <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
        {gameState === 'IDLE' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 4, 3, 0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '20px',
            textAlign: 'center',
          }}>
            <Zap size={44} color="#A9DDD3" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 16px rgba(169,221,211,0.6))' }} />
            <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 8px 0', color: '#FFFFFF' }}>Ready to Accelerate?</h3>
            <p style={{ fontSize: '13px', color: '#8E9B97', maxWidth: '280px', marginBottom: '20px' }}>
              Hit as many surging mint and gold nodes as possible in 30s. Don't let them dissipate!
            </p>
            <button
              type="button"
              onClick={startGame}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
                color: '#010101',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 25px rgba(169, 221, 211, 0.5)',
              }}
            >
              <Play size={16} /> START RUN
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 4, 3, 0.94)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease',
          }}>
            <Trophy size={40} color="#A9DDD3" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 6px 0', color: '#FFFFFF' }}>Run Complete!</h3>
            <div style={{ fontSize: '13px', color: '#8E9B97', marginBottom: '16px' }}>
              Finality Efficiency: <strong style={{ color: '#A9DDD3' }}>{accuracy}%</strong> ({nodesHit} hit)
            </div>

            <div style={{
              background: 'rgba(169, 221, 211, 0.1)',
              border: '1px solid rgba(169, 221, 211, 0.4)',
              borderRadius: '16px',
              padding: '12px 20px',
              marginBottom: '20px',
              width: '100%',
              maxWidth: '280px',
            }}>
              <div style={{ fontSize: '11px', color: '#8E9B97' }}>SHARDS EARNED</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#A9DDD3' }}>+{earnedShards} Shards</div>
            </div>

            <button
              type="button"
              onClick={startGame}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #E8E3D5 0%, #c4beaf 100%)',
                color: '#010101',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(232, 227, 213, 0.3)',
              }}
            >
              <RotateCcw size={16} /> PLAY AGAIN
            </button>
          </div>
        )}

        {/* The 4x4 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          padding: '12px',
          background: '#040706',
          border: '1px solid rgba(169, 221, 211, 0.25)',
          borderRadius: '20px',
          boxShadow: 'inset 0 0 25px rgba(0,0,0,0.8)',
        }}>
          {Array.from({ length: 16 }).map((_, idx) => {
            const active = activeNodes.get(idx);
            const isGolden = active?.type === 'golden';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleNodeClick(idx)}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '14px',
                  border: active
                    ? (isGolden ? '2px solid #E8E3D5' : '2px solid #A9DDD3')
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  background: active
                    ? (isGolden ? 'radial-gradient(circle, #332d20 0%, #151410 100%)' : 'radial-gradient(circle, #0e2b24 0%, #030a08 100%)')
                    : 'rgba(255, 255, 255, 0.02)',
                  cursor: active ? 'pointer' : 'default',
                  boxShadow: active
                    ? (isGolden ? '0 0 20px rgba(232, 227, 213, 0.6)' : '0 0 20px rgba(169, 221, 211, 0.6)')
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                }}
              >
                {active && (
                  <Zap
                    size={22}
                    color={isGolden ? '#E8E3D5' : '#A9DDD3'}
                    style={{ animation: 'pulse 0.5s infinite alternate' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
