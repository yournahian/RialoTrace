'use client';

import React, { useState, useEffect } from 'react';
import { RialoLogo } from './RialoLogo';
import { X } from 'lucide-react';
import { sound } from '@/lib/soundFx';

export const FollowGate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'prompt' | 'detecting' | 'unlocked'>('prompt');

  useEffect(() => {
    // Check if user already dismissed or unlocked the gate
    const dismissed = localStorage.getItem('rialo_follow_gate_dismissed');
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    sound.playTap();
    localStorage.setItem('rialo_follow_gate_dismissed', 'true');
    setIsOpen(false);
  };

  const handleFollowClick = (url: string = 'https://x.com/yournahin') => {
    sound.playTap();
    window.open(url, '_blank', 'noopener,noreferrer');
    setStep('detecting');
    setTimeout(() => {
      setStep('unlocked');
      localStorage.setItem('rialo_follow_gate_dismissed', 'true');
    }, 2800);
  };

  const handleEnter = () => {
    sound.playSuccess();
    localStorage.setItem('rialo_follow_gate_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(1, 1, 1, 0.94)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid var(--rialo-border-glow, rgba(169, 221, 211, 0.3))',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(169, 221, 211, 0.15)',
          textAlign: 'center',
          color: '#ffffff',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss and remember"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#A9DDD3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>

        <div
          style={{
            height: '90px',
            background: 'linear-gradient(135deg, #010101 0%, #0d8270 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid var(--rialo-border, rgba(255,255,255,0.1))',
          }}
        >
          <div style={{ background: 'rgba(1, 1, 1, 0.7)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid var(--rialo-border, rgba(255,255,255,0.1))', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RialoLogo size={18} />
            <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono, monospace)', color: '#A9DDD3' }}>
              ACCESS GATE
            </span>
          </div>
        </div>

        <div style={{ padding: '0 24px 28px 24px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #010101',
              background: '#222',
              margin: '-34px auto 14px auto',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png"
              alt="yournahin avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://unavatar.io/x/yournahin';
              }}
            />
          </div>

          {step === 'prompt' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
                Follow @yournahin on X
              </h2>
              <p style={{ color: 'var(--rialo-text-muted, #8E9B97)', fontSize: '13px', marginTop: '6px', lineHeight: '1.45' }}>
                Follow the builder behind RialoTrace on X to unlock access to Rialo engagement analytics.
              </p>

              <button
                type="button"
                onClick={() => handleFollowClick('https://x.com/yournahin')}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  background: '#A9DDD3',
                  color: '#010101',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 20px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(169, 221, 211, 0.3)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Follow @yournahin to Continue</span>
              </button>

              <div style={{ marginTop: '12px' }}>
                <a
                  href="https://x.com/RialoHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: 'var(--rialo-text-muted, #8E9B97)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Also follow @RialoHQ on X</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </>
          )}

          {step === 'detecting' && (
            <div style={{ padding: '16px 0' }}>
              <div className="loading-dots" style={{ height: '40px' }}>
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', color: '#A9DDD3', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
                Detecting whether you followed...
              </p>
              <p style={{ fontSize: '12px', color: 'var(--rialo-text-muted, #8E9B97)', marginTop: '4px' }}>
                Verifying connection to @yournahin on X
              </p>
            </div>
          )}

          {step === 'unlocked' && (
            <div style={{ padding: '12px 0 6px 0' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', lineHeight: '1.4', marginBottom: '16px' }}>
                Welcome to RialoTrace! Gate unlocked.
              </p>

              <button
                type="button"
                onClick={handleEnter}
                style={{
                  width: '100%',
                  background: '#A9DDD3',
                  color: '#010101',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '13px 20px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(169, 221, 211, 0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                Continue to RialoTrace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
