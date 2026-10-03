'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardArchetype } from '@/lib/types';
import { Sparkles, X, Share2, Check } from 'lucide-react';

interface GachaScratchPackProps {
  cards: CardArchetype[];
  onClose: () => void;
  username: string;
}

interface ScratchCardItemProps {
  card: CardArchetype;
}

const ScratchCardItem: React.FC<ScratchCardItemProps> = ({ card }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, 'rgba(71, 85, 105, 0.95)');
    grad.addColorStop(0.3, 'rgba(203, 213, 225, 0.98)');
    grad.addColorStop(0.5, 'rgba(148, 163, 184, 0.95)');
    grad.addColorStop(0.7, 'rgba(226, 232, 240, 0.98)');
    grad.addColorStop(1, 'rgba(51, 65, 85, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '11px monospace';
    ctx.fillText('✦ MYSTERY WARRIOR ✦', canvas.width / 2, canvas.height / 2 + 12);
  }, []);

  const handleScratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imgData.data.length; i += 4 * 16) {
      if (imgData.data[i] === 0) transparentPixels++;
    }
    const sampleTotal = imgData.data.length / (4 * 16);
    if (transparentPixels / sampleTotal > 0.45) {
      setIsRevealed(true);
    }
  };

  return (
    <div
      className="scratch-card-frame"
      style={{
        borderColor: isRevealed ? card.glowColor : '#334155',
        boxShadow: isRevealed
          ? `0 0 35px ${card.glowColor}50, 0 16px 40px rgba(0,0,0,0.9)`
          : '0 16px 40px rgba(0,0,0,0.9)',
        background: '#090d16',
      }}
    >
      {/* Background Warrior Image */}
      <img
        src={card.image}
        alt={card.title}
      />
      <div className="scratch-card-gradient" />

      {/* Top Rarity Badge */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: '6px',
            backgroundColor: `${card.glowColor}25`,
            color: card.glowColor,
            border: `1px solid ${card.glowColor}60`,
            backdropFilter: 'blur(8px)',
          }}
        >
          {card.rarity}
        </span>
        <span style={{ fontSize: '14px' }}>{card.badgeEmoji}</span>
      </div>

      {/* Bottom Info */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          {card.title}
        </h4>
        <p style={{ color: 'var(--rialo-text-muted)', fontSize: '11px', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.lore}
        </p>
      </div>

      {/* Scratch Canvas */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={240}
          height={340}
          className="scratch-canvas"
          onMouseDown={() => (isDrawing.current = true)}
          onMouseUp={() => (isDrawing.current = false)}
          onMouseLeave={() => (isDrawing.current = false)}
          onMouseMove={(e) => {
            if (isDrawing.current) handleScratch(e.clientX, e.clientY);
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              handleScratch(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={(e) => handleScratch(e.clientX, e.clientY)}
        />
      )}

      {/* Quick Reveal button for convenience */}
      {!isRevealed && (
        <button
          type="button"
          onClick={() => setIsRevealed(true)}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            padding: '4px 10px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Instant Reveal
        </button>
      )}
    </div>
  );
};

export const GachaScratchPack: React.FC<GachaScratchPackProps> = ({
  cards,
  onClose,
  username,
}) => {
  const highestRarity = cards.some((c) => c.rarity === 'MYTHIC')
    ? 'MYTHIC'
    : cards.some((c) => c.rarity === 'LEGENDARY')
    ? 'LEGENDARY'
    : cards.some((c) => c.rarity === 'EPIC')
    ? 'EPIC'
    : 'RARE';

  // Using official RialoHQ X handle
  const shareText = encodeURIComponent(
    `Just pulled 3 cards in @RialoHQ Season 1 Genesis TCG! 🎴✨ Highest pull: ${highestRarity} ${cards[0]?.title}! Who wants to trade? #RialoTrace`
  );

  return (
    <div className="gacha-modal-overlay">
      <div className="gacha-modal-box">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            padding: '8px',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '9999px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#C084FC',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={14} /> Season 1 Daily Gacha Pack
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0', letterSpacing: '-0.02em' }}>
            Scratch & Reveal Your 3 Cards!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--rialo-text-muted)', margin: 0 }}>
            Scratch each mystery warrior to add it to your permanent Season 1 Binder.
          </p>
        </div>

        {/* Cards Row */}
        <div className="scratch-cards-row">
          {cards.map((card, idx) => (
            <ScratchCardItem key={`${card.id}-${idx}`} card={card} />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '20px', width: '100%' }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              borderRadius: '14px',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            <Share2 size={16} /> Flex Pull on X (@RialoHQ)
          </a>

          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Check size={16} /> Add to My Binder
          </button>
        </div>
      </div>
    </div>
  );
};
