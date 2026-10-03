'use client';

import React, { useState, useRef } from 'react';
import { Palette, Download, Share2, Upload, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { sound } from '@/lib/soundFx';

const PRESET_MEMES = [
  { name: 'Giga-Validator', url: 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png', emoji: '⚡' },
  { name: 'Superconductor Pepe', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', emoji: '🐸' },
  { name: 'Zero-Friction Doge', url: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&q=80', emoji: '🚀' },
  { name: 'Quantum Empress', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80', emoji: '👑' },
];

export const CardCreatorStudio: React.FC = () => {
  const [title, setTitle] = useState('Apex Superconductor');
  const [archetype, setArchetype] = useState('Genesis Protocol');
  const [lore, setLore] = useState('Bending electromagnetic friction to absolute zero. Transactions finalize before light can cross the room.');
  const [rarity, setRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'>('MYTHIC');
  const [imageUrl, setImageUrl] = useState(PRESET_MEMES[0].url);
  const [emoji, setEmoji] = useState('⚡');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playTap();
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImageUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getRarityColor = () => {
    switch (rarity) {
      case 'MYTHIC': return '#FFE082';
      case 'LEGENDARY': return '#E8E3D5';
      case 'EPIC': return '#D8B4FE';
      case 'RARE': return '#A9DDD3';
      default: return '#94A3B8';
    }
  };

  const handleShareToX = () => {
    sound.playTap();
    const tweetText = `I just designed an official custom card on @RialoHQ Trace Studio! 🎴\n\n"${title}" [${rarity}]\n"${lore}"\n\nForge yours on #RialoTrace #ZeroFriction!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    sound.playSuccess();
    // Canvas render & download
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark background
    ctx.fillStyle = '#020605';
    ctx.fillRect(0, 0, 600, 800);

    // Glowing border
    ctx.strokeStyle = getRarityColor();
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 760);

    // Title text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title, 40, 80);

    // Rarity tag
    ctx.fillStyle = getRarityColor();
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${rarity} TIER`, 440, 80);

    // Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 40, 110, 520, 480);

      // Lore box
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(40, 610, 520, 140);
      ctx.fillStyle = '#E8E3D5';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText(lore.slice(0, 55), 60, 660);
      if (lore.length > 55) ctx.fillText(lore.slice(55, 110), 60, 690);

      const link = document.createElement('a');
      link.download = `rialo-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = imageUrl;
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(8, 14, 12, 0.95) 0%, rgba(2, 5, 4, 0.98) 100%)',
      border: '1px solid rgba(169, 221, 211, 0.25)',
      borderRadius: '24px',
      padding: '32px 24px',
      color: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      marginBottom: '28px',
    }}>
      {/* Title */}
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
          <Palette size={14} /> Creative Studio & Meme Forge
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#E8E3D5', margin: '0 0 6px 0' }}>
          Custom Card & <span className="gradient-text-rialo">Meme Creator</span>
        </h2>
        <p style={{ color: '#8E9B97', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
          Design, forge, and download your own official holographic Rialo Trading Cards. Share your custom card directly to X!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Editor Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase' }}>Card Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(169,221,211,0.3)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '14px',
                marginTop: '6px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase' }}>Rarity Tier</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { sound.playTap(); setRarity(r); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: rarity === r ? '1.5px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)',
                    background: rarity === r ? 'rgba(169, 221, 211, 0.16)' : 'rgba(255,255,255,0.03)',
                    color: rarity === r ? '#A9DDD3' : '#8E9B97',
                    fontWeight: 800,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase' }}>Custom Lore Quote</label>
            <textarea
              rows={3}
              value={lore}
              onChange={(e) => setLore(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(169,221,211,0.3)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '13px',
                marginTop: '6px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#8E9B97', fontWeight: 800, textTransform: 'uppercase' }}>Image Source</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '10px' }}>
              {PRESET_MEMES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => { sound.playTap(); setImageUrl(preset.url); setEmoji(preset.emoji); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: imageUrl === preset.url ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)',
                    background: imageUrl === preset.url ? 'rgba(169, 221, 211, 0.12)' : 'rgba(255,255,255,0.03)',
                    color: imageUrl === preset.url ? '#A9DDD3' : '#8E9B97',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {preset.emoji} {preset.name}
                </button>
              ))}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed rgba(169,221,211,0.4)',
                borderRadius: '12px',
                color: '#A9DDD3',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Upload size={14} /> Upload Custom Photo or Meme PNG
            </button>
          </div>
        </div>

        {/* Live Holographic Card Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            className="binder-card owned"
            style={{
              width: '280px',
              height: '420px',
              borderRadius: '24px',
              border: `2px solid ${getRarityColor()}`,
              boxShadow: `0 16px 40px rgba(0,0,0,0.85), 0 0 30px ${getRarityColor()}40`,
              position: 'relative',
              overflow: 'hidden',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(155deg, rgba(16, 26, 23, 0.95) 0%, rgba(4, 8, 7, 0.98) 100%)',
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#8E9B97' }}>RIALO • STUDIO</span>
              <span style={{ fontSize: '10px', fontWeight: 900, color: getRarityColor() }}>{rarity}</span>
            </div>

            {/* Image */}
            <div style={{
              width: '100%',
              height: '210px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#010101',
              margin: '10px 0',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>{emoji}</span>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {title}
                </h4>
              </div>
              <p style={{ fontSize: '11px', color: '#8E9B97', fontStyle: 'italic', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                "{lore}"
              </p>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '280px' }}>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: '12px 14px',
                background: 'linear-gradient(135deg, #A9DDD3 0%, #76c0b2 100%)',
                color: '#010101',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 0 15px rgba(169, 221, 211, 0.4)',
              }}
            >
              <Download size={14} /> DOWNLOAD
            </button>

            <button
              type="button"
              onClick={handleShareToX}
              style={{
                flex: 1,
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Share2 size={14} /> SHARE TO X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
