'use client';

import React, { useState, useEffect } from 'react';
import { RialoLogo } from './RialoLogo';

export const FollowGate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'prompt' | 'detecting' | 'unlocked'>('prompt');

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('rialotrace_follow_unlocked');
    if (!isUnlocked) {
      setIsOpen(true);
    }
  }, []);

  const handleFollowClick = () => {
    window.open('https://x.com/yournahian', '_blank', 'noopener,noreferrer');
    setStep('detecting');
    setTimeout(() => {
      setStep('unlocked');
    }, 3500);
  };

  const handleEnter = () => {
    sessionStorage.setItem('rialotrace_follow_unlocked', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(1, 1, 1, 0.92)',
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
          border: '1px solid var(--rialo-border-glow)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px var(--rialo-glow)',
          textAlign: 'center',
          color: '#ffffff',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            height: '90px',
            background: 'linear-gradient(135deg, #010101 0%, #0d8270 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid var(--rialo-border)',
          }}
        >
          <div style={{ background: 'rgba(1, 1, 1, 0.7)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid var(--rialo-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RialoLogo size={18} />
            <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--rialo-accent)' }}>
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
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://pbs.twimg.com/profile_images/1966521996080209920/MbtcGvTv_400x400.jpg"
              alt="yournahian avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {step === 'prompt' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
                Follow @yournahian on X
              </h2>
              <p style={{ color: 'var(--rialo-text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Follow the builder behind RialoTrace on X to unlock access to Rialo engagement analytics.
              </p>

              <button
                type="button"
                onClick={handleFollowClick}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  background: 'var(--rialo-accent)',
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
                  boxShadow: '0 6px 20px var(--rialo-accent-dim)',
                }}
              >
                <span>Follow @yournahian to Continue</span>
              </button>
            </>
          )}

          {step === 'detecting' && (
            <div style={{ padding: '16px 0' }}>
              <div className="loading-dots" style={{ height: '40px' }}>
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--rialo-accent)', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
                Detecting whether you followed...
              </p>
            </div>
          )}

          {step === 'unlocked' && (
            <div style={{ padding: '12px 0 6px 0' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', lineHeight: '1.4', marginBottom: '16px' }}>
                I don&apos;t know if you followed, but there you go.
              </p>

              <button
                type="button"
                onClick={handleEnter}
                style={{
                  width: '100%',
                  background: 'var(--rialo-accent)',
                  color: '#010101',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '13px 20px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px var(--rialo-accent-dim)',
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
