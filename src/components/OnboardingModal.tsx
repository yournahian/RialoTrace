'use client';

import React, { useState } from 'react';
import { X, Lock, KeyRound, Sparkles, CheckCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialHandle?: string;
  isMandatory?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialHandle = '',
  isMandatory = false,
}) => {
  const [handle, setHandle] = useState(initialHandle.replace('@', ''));
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'HANDLE' | 'ENTER_PIN' | 'CREATE_PIN'>('HANDLE');
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Step 1: Check if handle exists
  const handleCheckHandle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = handle.trim().replace(/^@/, '').toLowerCase();
    if (!clean) {
      setError('Please enter your X (Twitter) handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECK_USER', username: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Unable to verify handle');
        return;
      }

      setIsExisting(data.exists);
      if (data.exists && data.hasPin) {
        setStep('ENTER_PIN');
      } else {
        // New user or existing user without PIN
        setStep('CREATE_PIN');
      }
      sound.playTap();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  // Step 2A: Sign Up / Set PIN
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handle.trim().replace(/^@/, '').toLowerCase();
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIGN_UP', username: clean, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed');
        return;
      }

      sound.playSuccess();
      localStorage.setItem('rialo_active_user', clean);
      try {
        const existing = JSON.parse(localStorage.getItem('rialo_recommended_handles') || '[]');
        const updated = Array.from(new Set([clean, ...existing]));
        localStorage.setItem('rialo_recommended_handles', JSON.stringify(updated));
      } catch (err) {}
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error during registration');
    } finally {
      setLoading(false);
    }
  };

  // Step 2B: Sign In with PIN
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handle.trim().replace(/^@/, '').toLowerCase();
    if (pin.length < 4) {
      setError('Please enter your complete 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIGN_IN', username: clean, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Incorrect PIN. Please try again.');
        sound.playTap();
        return;
      }

      sound.playSuccess();
      localStorage.setItem('rialo_active_user', clean);
      try {
        const existing = JSON.parse(localStorage.getItem('rialo_recommended_handles') || '[]');
        const updated = Array.from(new Set([clean, ...existing]));
        localStorage.setItem('rialo_recommended_handles', JSON.stringify(updated));
      } catch (err) {}
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const cleanHandle = handle.trim().replace(/^@/, '');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(1, 1, 1, 0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(8, 12, 12, 0.98)',
          border: '1.5px solid rgba(169, 221, 211, 0.35)',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 45px rgba(169, 221, 211, 0.15)',
          position: 'relative',
          color: '#E8E3D5',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button - hidden when mandatory */}
        {!isMandatory && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(232, 227, 213, 0.06)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
              color: '#A9DDD3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}

        {/* STEP 1: ENTER HANDLE */}
        {step === 'HANDLE' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {isMandatory ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    background: 'rgba(169, 221, 211, 0.12)',
                    border: '1px solid rgba(169, 221, 211, 0.35)',
                    color: '#A9DDD3',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    marginBottom: '14px',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>ACCESS REQUIRED • ENTER HANDLE TO ACCESS</span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '12px',
                    borderRadius: '50%',
                    background: 'rgba(169, 221, 211, 0.12)',
                    border: '1px solid rgba(169, 221, 211, 0.3)',
                    color: '#A9DDD3',
                    marginBottom: '12px',
                  }}
                >
                  <User size={28} />
                </div>
              )}
              <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
                Enter Your <span className="gradient-text-rialo">X Handle</span>
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.65)', margin: 0, lineHeight: '1.5' }}>
                {isMandatory
                  ? 'Please enter your Twitter/X handle to unlock RialoTrace daily quests, collector cards, and live analytics.'
                  : 'Enter your Twitter/X handle to claim daily card packs, participate in P2P trades, and climb whitelist tiers.'}
              </p>
            </div>

            <form onSubmit={handleCheckHandle}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#A9DDD3', fontWeight: 800 }}>
                  @
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="your_x_handle"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 38px',
                    borderRadius: '14px',
                    background: 'rgba(2, 4, 4, 0.9)',
                    border: '1px solid rgba(169, 221, 211, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              {error && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#A9DDD3',
                  border: 'none',
                  color: '#010101',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(169, 221, 211, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span>{loading ? 'Checking Account...' : 'Continue'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.45)' }}>
                🔒 Public handle only • No password or Twitter authorization needed
              </span>
            </div>
          </div>
        )}

        {/* STEP 2A: NEW USER - CREATE PIN */}
        {step === 'CREATE_PIN' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {/* Avatar Preview */}
              <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 12px auto' }}>
                <img
                  src={`https://unavatar.io/x/${cleanHandle}`}
                  alt={cleanHandle}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #A9DDD3', boxShadow: '0 0 20px rgba(169, 221, 211, 0.4)' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png'; }}
                />
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#10B981', borderRadius: '50%', width: '16px', height: '16px', border: '2px solid #010101' }} />
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '9999px', background: 'rgba(169, 221, 211, 0.15)', color: '#A9DDD3', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>
                <Sparkles size={12} /> NEW EXPLORER DETECTED
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0', fontFamily: 'var(--font-display)' }}>
                Set Your Security PIN
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.65)', margin: 0 }}>
                Choose a 4-digit PIN to secure your card collection for @{cleanHandle}.
              </p>
            </div>

            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#A9DDD3', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Choose 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(2, 4, 4, 0.9)',
                    border: '1px solid rgba(169, 221, 211, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '22px',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#A9DDD3', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Confirm 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(2, 4, 4, 0.9)',
                    border: '1px solid rgba(169, 221, 211, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '22px',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              {error && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#A9DDD3',
                  border: 'none',
                  color: '#010101',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(169, 221, 211, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <ShieldCheck size={16} />
                <span>{loading ? 'Securing Profile...' : 'Create Profile & Claim Starter Pack'}</span>
              </button>
            </form>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setStep('HANDLE'); setPin(''); setConfirmPin(''); setError(''); }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(232, 227, 213, 0.5)', fontSize: '12px', cursor: 'pointer' }}
              >
                ← Change handle
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: RETURNING USER - ENTER PIN */}
        {step === 'ENTER_PIN' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {/* Avatar Preview */}
              <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 12px auto' }}>
                <img
                  src={`https://unavatar.io/x/${cleanHandle}`}
                  alt={cleanHandle}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #A9DDD3', boxShadow: '0 0 20px rgba(169, 221, 211, 0.4)' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png'; }}
                />
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#10B981', borderRadius: '50%', width: '16px', height: '16px', border: '2px solid #010101' }} />
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '9999px', background: 'rgba(169, 221, 211, 0.15)', color: '#A9DDD3', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>
                <CheckCircle size={12} /> RETURNING PROTOCOL CITIZEN
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0', fontFamily: 'var(--font-display)' }}>
                Welcome Back, @{cleanHandle}!
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.65)', margin: 0 }}>
                Enter your 4-digit security PIN to unlock your cards and daily rewards.
              </p>
            </div>

            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#A9DDD3', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'center' }}>
                  Enter 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'rgba(2, 4, 4, 0.9)',
                    border: '1px solid rgba(169, 221, 211, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '24px',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              {error && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#A9DDD3',
                  border: 'none',
                  color: '#010101',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(169, 221, 211, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <Lock size={16} />
                <span>{loading ? 'Unlocking...' : 'Unlock Profile'}</span>
              </button>
            </form>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setStep('HANDLE'); setPin(''); setError(''); }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(232, 227, 213, 0.5)', fontSize: '12px', cursor: 'pointer' }}
              >
                ← Switch Account / Change handle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
