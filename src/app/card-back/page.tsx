"use client";

import React, { useEffect, useState, useRef } from 'react';
import { exportRialoCardBackPNG } from '@/components/RialoCardCanvasExporter';
import { Download, Check, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CardBackExportPage() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [savedServer, setSavedServer] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function generate() {
      const blob = await exportRialoCardBackPNG();
      if (blob) {
        const url = URL.createObjectURL(blob);
        setImgUrl(url);

        // Convert to base64 and save to server /public/rialo-card-back.png
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            await fetch('/api/save-card-back', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64Data: reader.result }),
            });
            setSavedServer(true);
          } catch (e) {
            console.error('Failed to sync card back to public:', e);
          }
        };
        reader.readAsDataURL(blob);
      }
    }
    generate();
  }, []);

  const handleDownload = () => {
    if (!imgUrl) return;
    setDownloading(true);
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = 'rialo-card-back.png';
    a.click();
    setTimeout(() => setDownloading(false), 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040814',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#A9DDD3',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            <ArrowLeft size={16} /> Back to Rialo Trace
          </Link>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 10px',
            borderRadius: '9999px',
          }}>
            <Sparkles size={12} /> {savedServer ? 'SYNCED TO PUBLIC' : '2X RETINA HD'}
          </div>
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          margin: 0,
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}>
          Rialo Genesis Card Back
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#8E9B97',
          textAlign: 'center',
          margin: 0,
          maxWidth: '380px',
        }}>
          High-resolution 2x Retina PNG with official SVG logo, custom radial glow, and Genesis Wave 1 authenticity branding.
        </p>

        {/* Card Back Preview */}
        <div style={{
          width: '320px',
          height: '502px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(169, 221, 211, 0.35)',
          border: '2px solid rgba(169, 221, 211, 0.7)',
          background: '#010204',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {imgUrl ? (
            <img src={imgUrl} alt="Rialo Card Back" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#A9DDD3', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Generating 2x Canvas...</div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={!imgUrl}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '14px 24px',
            borderRadius: '14px',
            background: '#A9DDD3',
            color: '#010101',
            border: 'none',
            fontSize: '14px',
            fontWeight: 900,
            cursor: imgUrl ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 0 25px rgba(169, 221, 211, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          {downloading ? <Check size={18} /> : <Download size={18} />}
          {downloading ? 'Downloading...' : 'Download Card Back PNG'}
        </button>
      </div>
    </div>
  );
}
