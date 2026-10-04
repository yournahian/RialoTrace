'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Zap, Shield, Sparkles } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';

interface ZeroFrictionGlideProps {
  user: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
}

export const ZeroFrictionGlide: React.FC<ZeroFrictionGlideProps> = ({ user, onUserUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [shardsCollected, setShardsCollected] = useState<number>(0);
  const [earnedShards, setEarnedShards] = useState<number>(0);
  const [highscore, setHighscore] = useState<number>(0);

  const gameLoopRef = useRef<number | null>(null);

  // Load highscore
  useEffect(() => {
    if (user?.username) {
      fetch(`/api/arcade?username=${encodeURIComponent(user.username)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.glideHighscore) {
            setHighscore(data.glideHighscore);
          }
        })
        .catch(console.error);
    }
  }, [user?.username]);

  const startGame = () => {
    sound.playTap();
    setGameState('PLAYING');
    setScore(0);
    setShardsCollected(0);
    setEarnedShards(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game variables
    let playerY = canvas.height / 2;
    let velocityY = 0;
    const gravity = 0.32;
    const jumpThrust = -6.8;
    const playerRadius = 14;

    interface Obstacle {
      x: number;
      topHeight: number;
      bottomHeight: number;
      width: number;
      passed: boolean;
      hasShard: boolean;
      shardCollected: boolean;
    }

    let obstacles: Obstacle[] = [];
    let frame = 0;
    let currentScore = 0;
    let currentShards = 0;
    let isDead = false;

    const handleJump = () => {
      if (isDead) return;
      velocityY = jumpThrust;
      sound.playJump();
    };

    // Attach jump listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.onpointerdown = (e) => {
      e.preventDefault();
      handleJump();
    };

    const loop = () => {
      frame++;
      currentScore = Math.floor(frame / 6);
      setScore(currentScore);

      // Physics
      velocityY += gravity;
      playerY += velocityY;

      // Floor / Ceiling check
      if (playerY - playerRadius < 0) {
        playerY = playerRadius;
        velocityY = 0;
      }
      if (playerY + playerRadius > canvas.height) {
        endGame(currentScore, currentShards);
        return;
      }

      // Spawn obstacles every 95 frames
      if (frame % 95 === 0) {
        const gap = 125;
        const minH = 40;
        const maxH = canvas.height - gap - minH;
        const topH = Math.floor(Math.random() * (maxH - minH)) + minH;
        const bottomH = canvas.height - topH - gap;

        obstacles.push({
          x: canvas.width,
          topHeight: topH,
          bottomHeight: bottomH,
          width: 44,
          passed: false,
          hasShard: Math.random() < 0.65, // 65% chance floating shard
          shardCollected: false,
        });
      }

      // Update obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= 3.2; // Speed

        // Collision Check (Circle vs Rect)
        const pX = 80; // Player fixed X
        // Top rect
        if (
          pX + playerRadius > obs.x &&
          pX - playerRadius < obs.x + obs.width &&
          playerY - playerRadius < obs.topHeight
        ) {
          endGame(currentScore, currentShards);
          return;
        }
        // Bottom rect
        if (
          pX + playerRadius > obs.x &&
          pX - playerRadius < obs.x + obs.width &&
          playerY + playerRadius > canvas.height - obs.bottomHeight
        ) {
          endGame(currentScore, currentShards);
          return;
        }

        // Shard pickup check
        if (obs.hasShard && !obs.shardCollected) {
          const shardX = obs.x + obs.width / 2;
          const shardY = obs.topHeight + 62;
          const dist = Math.hypot(pX - shardX, playerY - shardY);
          if (dist < playerRadius + 14) {
            obs.shardCollected = true;
            currentShards++;
            setShardsCollected(currentShards);
            sound.playPickup();
          }
        }

        // Remove offscreen
        if (obs.x + obs.width < -10) {
          obstacles.splice(i, 1);
        }
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Grid Effect
      ctx.strokeStyle = 'rgba(169, 221, 211, 0.04)';
      ctx.lineWidth = 1;
      const gridOffset = (frame * 1.5) % 30;
      for (let x = -gridOffset; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Obstacles (Cryogenic Pillars)
      obstacles.forEach(obs => {
        // Top pillar
        const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        topGrad.addColorStop(0, '#061310');
        topGrad.addColorStop(1, '#0e241f');
        ctx.fillStyle = topGrad;
        ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
        ctx.strokeStyle = '#A9DDD3';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, 0, obs.width, obs.topHeight);

        // Bottom pillar
        const botGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        botGrad.addColorStop(0, '#061310');
        botGrad.addColorStop(1, '#0e241f');
        ctx.fillStyle = botGrad;
        ctx.fillRect(obs.x, canvas.height - obs.bottomHeight, obs.width, obs.bottomHeight);
        ctx.strokeRect(obs.x, canvas.height - obs.bottomHeight, obs.width, obs.bottomHeight);

        // Floating Shard Orb
        if (obs.hasShard && !obs.shardCollected) {
          const sX = obs.x + obs.width / 2;
          const sY = obs.topHeight + 62 + Math.sin(frame * 0.1) * 5;
          ctx.save();
          ctx.shadowColor = '#A9DDD3';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#A9DDD3';
          ctx.beginPath();
          ctx.arc(sX, sY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw Player: Levitating Meissner Sphere
      ctx.save();
      ctx.shadowColor = '#A9DDD3';
      ctx.shadowBlur = 18;
      const playerGrad = ctx.createRadialGradient(80, playerY, 2, 80, playerY, playerRadius);
      playerGrad.addColorStop(0, '#FFFFFF');
      playerGrad.addColorStop(0.6, '#A9DDD3');
      playerGrad.addColorStop(1, '#0b352b');
      ctx.fillStyle = playerGrad;
      ctx.beginPath();
      ctx.arc(80, playerY, playerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Particle Trail
      for (let p = 1; p <= 3; p++) {
        ctx.fillStyle = `rgba(169, 221, 211, ${0.4 / p})`;
        ctx.beginPath();
        ctx.arc(80 - p * 10, playerY + Math.sin(frame * 0.2 + p) * 3, playerRadius / (p + 1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    const endGame = (finalScore: number, finalShards: number) => {
      isDead = true;
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      sound.playCrash();
      setGameState('GAMEOVER');

      // Submit score to backend
      if (user?.username) {
        fetch('/api/arcade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'GLIDE_SCORE',
            username: user.username,
            distance: finalScore,
            shardsCollected: finalShards,
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setEarnedShards(data.earnedShards);
              if (data.highscore) setHighscore(data.highscore);
              if (typeof window !== 'undefined') {
                const clean = (user?.username || '').toLowerCase().replace('@', '');
                const cur = parseInt(localStorage.getItem(`rialo_glide_highscore_${clean}`) || '0');
                if (finalScore > cur) {
                  localStorage.setItem(`rialo_glide_highscore_${clean}`, String(finalScore));
                }
                window.dispatchEvent(new Event('rialo_arcade_activity'));
              }
              if (data.user && onUserUpdate) onUserUpdate(data.user);
            }
          })
          .catch(console.error);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

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
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
          marginBottom: '8px',
        }}>
          <Zap size={14} /> Endless Arcade Runner
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0' }}>
          Zero-Friction <span className="gradient-text-rialo">Glide</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
          Pilot a levitating Meissner particle through cryogenic magnetic pillars. Collect floating Shards and set the all-time distance record!
        </p>
      </div>

      {/* HUD Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        maxWidth: '500px',
        margin: '0 auto 20px auto',
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Distance</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF' }}>{score}m</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Shards Caught</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#A9DDD3' }}>+{shardsCollected}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(169,221,211,0.18)', borderRadius: '16px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#8E9B97', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>All-Time Best</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#E8E3D5' }}>{highscore}m</div>
        </div>
      </div>

      {/* Canvas Game Arena */}
      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
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
            <Sparkles size={40} color="#A9DDD3" style={{ marginBottom: '14px', filter: 'drop-shadow(0 0 16px rgba(169,221,211,0.6))' }} />
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 6px 0' }}>Engage Meissner Levitation</h3>
            <p style={{ fontSize: '13px', color: '#8E9B97', maxWidth: '320px', marginBottom: '20px' }}>
              Tap screen or press <strong>Spacebar / Up Arrow</strong> to pulse upward. Glide through gates and harvest Shards!
            </p>
            <button
              type="button"
              onClick={startGame}
              style={{
                padding: '12px 32px',
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
              <Play size={16} /> LAUNCH GLIDE
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
            <Trophy size={40} color="#A9DDD3" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 4px 0' }}>Flight Terminated</h3>
            <div style={{ fontSize: '13px', color: '#8E9B97', marginBottom: '16px' }}>
              Distance Traveled: <strong style={{ color: '#E8E3D5' }}>{score}m</strong>
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
              <div style={{ fontSize: '11px', color: '#8E9B97' }}>SHARDS DEPOSITED</div>
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
              <RotateCcw size={16} /> GLIDE AGAIN
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={640}
          height={340}
          style={{
            width: '100%',
            height: 'auto',
            background: '#020605',
            borderRadius: '20px',
            border: '1.5px solid rgba(169, 221, 211, 0.35)',
            boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.9)',
            display: 'block',
            cursor: 'pointer',
          }}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#667773' }}>
        Tip: Tap or press <strong>Spacebar</strong> to thrust upwards. Zero friction carries your momentum forward!
      </div>
    </div>
  );
};
