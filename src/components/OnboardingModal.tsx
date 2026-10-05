'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  User,
  AlertCircle,
  Check,
  RotateCcw,
  Users,
} from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';
import { XProfile } from '@/lib/twitterVerify';

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
  const [step, setStep] = useState<'HANDLE' | 'CONFIRM_PROFILE' | 'ENTER_PIN' | 'CREATE_PIN'>('HANDLE');
  const [xProfile, setXProfile] = useState<XProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSec, setLockoutSec] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const interval = setInterval(() => {
      setLockoutSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSec]);

  if (!isOpen) return null;

  // Step 1: Live Verification on X
  const handleCheckHandle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutSec > 0) return;

    const clean = handle.trim().replace(/^@/, '').toLowerCase();
    if (!clean) {
      setError('Please enter your X (Twitter) handle');
      return;
    }

    if (!/^[a-zA-Z0-9_]{1,15}$/.test(clean)) {
      setError('Invalid handle format. X handles are 1-15 letters, numbers, or underscores.');
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
        sound.playTap();
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutSec(15);
          setError('Too many invalid attempts. Security cooldown active for 15 seconds.');
        } else {
          setError(
            data.error ||
              `Account @${clean} was not found on X (Twitter). Please enter an active, public handle.`
          );
        }
        return;
      }

      // Valid account found on X
      setFailedAttempts(0);
      if (data.xProfile) {
        setXProfile(data.xProfile);
      } else {
        setXProfile({
          name: clean,
          screenName: clean,
          avatar: `https://unavatar.io/x/${clean}`,
          followers: 0,
          bio: '',
          verified: false,
        });
      }

      if (data.exists && data.hasPin) {
        // Returning user with configured PIN
        setStep('ENTER_PIN');
      } else {
        // New user or unconfigured PIN -> Prompt live profile preview & confirmation!
        setStep('CONFIRM_PROFILE');
      }
      sound.playTap();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User Confirms Profile ("Is this you?")
  const handleConfirmIdentity = () => {
    sound.playTap();
    setStep('CREATE_PIN');
  };

  const handleRejectIdentity = () => {
    sound.playTap();
    setStep('HANDLE');
    setXProfile(null);
    setError('');
  };

  // Step 3A: Sign Up / Set PIN
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
      if (xProfile?.avatar) {
        localStorage.setItem('rialo_user_avatar', xProfile.avatar);
      }
      if (xProfile?.name) {
        localStorage.setItem('rialo_user_name', xProfile.name);
      }

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

  // Step 3B: Sign In with PIN
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
      if (xProfile?.avatar) {
        localStorage.setItem('rialo_user_avatar', xProfile.avatar);
      }
      if (xProfile?.name) {
        localStorage.setItem('rialo_user_name', xProfile.name);
      }

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

  const cleanHandle = handle.trim().replace(/^@/, '').toLowerCase();
  const displayAvatar =
    xProfile?.avatar || `https://unavatar.io/x/${cleanHandle}`;
  const displayName = xProfile?.name || cleanHandle;

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
          maxWidth: '450px',
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

        {/* ========================================================
            STEP 1: ENTER HANDLE (LIVE X VALIDATION)
            ======================================================== */}
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
                  <span>ACCESS REQUIRED • VERIFIED X IDENTITY</span>
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
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  margin: '0 0 6px 0',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Enter Your <span className="gradient-text-rialo">X Handle</span>
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(232, 227, 213, 0.65)',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                Connect your authentic X account to claim daily card drops, participate in P2P trades,
                and earn whitelist points.
              </p>
            </div>

            <form onSubmit={handleCheckHandle}>
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#A9DDD3',
                    fontWeight: 800,
                    fontSize: '16px',
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="your_x_handle"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 38px',
                    borderRadius: '14px',
                    background: 'rgba(2, 4, 4, 0.9)',
                    border: error
                      ? '1.5px solid rgba(239, 68, 68, 0.6)'
                      : '1px solid rgba(169, 221, 211, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-mono)',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              {/* Error Message with Warning Icon */}
              {error && (
                <div
                  style={{
                    marginBottom: '14px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#FCA5A5',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
                  <div>
                    <span style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                      Verification Failed
                    </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || lockoutSec > 0 || !handle.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background:
                    loading || lockoutSec > 0 || !handle.trim()
                      ? 'rgba(169, 221, 211, 0.25)'
                      : '#A9DDD3',
                  border: 'none',
                  color:
                    loading || lockoutSec > 0 || !handle.trim()
                      ? 'rgba(232, 227, 213, 0.5)'
                      : '#010101',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: loading || lockoutSec > 0 || !handle.trim() ? 'not-allowed' : 'pointer',
                  boxShadow:
                    loading || lockoutSec > 0 || !handle.trim()
                      ? 'none'
                      : '0 0 25px rgba(169, 221, 211, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span>
                  {loading
                    ? 'Verifying on X...'
                    : lockoutSec > 0
                    ? `Cooldown (${lockoutSec}s)...`
                    : 'Verify on X'}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.45)' }}>
                🔒 Realtime verification • No password or private authorization required
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: CONFIRM PROFILE PREVIEW ("IS THIS YOU?")
            ======================================================== */}
        {step === 'CONFIRM_PROFILE' && xProfile && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(169, 221, 211, 0.15)',
                  border: '1px solid rgba(169, 221, 211, 0.4)',
                  color: '#A9DDD3',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={13} />
                <span>FOUND ON X • CONFIRM IDENTITY</span>
              </div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  margin: '0 0 4px 0',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Is This Your <span className="gradient-text-rialo">Profile</span>?
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.65)', margin: 0 }}>
                Please confirm that this is your real public X account before setting your security PIN.
              </p>
            </div>

            {/* Live X Profile Card */}
            <div
              style={{
                borderRadius: '18px',
                padding: '20px',
                background: 'radial-gradient(circle at 50% 0%, rgba(169, 221, 211, 0.12) 0%, rgba(3, 6, 6, 0.95) 100%)',
                border: '1.5px solid rgba(169, 221, 211, 0.35)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(169, 221, 211, 0.1)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {/* Avatar with Glow and Verified Badge */}
              <div
                style={{
                  position: 'relative',
                  width: '76px',
                  height: '76px',
                  margin: '0 auto 12px auto',
                }}
              >
                <img
                  src={displayAvatar}
                  alt={xProfile.screenName}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2.5px solid #A9DDD3',
                    boxShadow: '0 0 25px rgba(169, 221, 211, 0.45)',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(xProfile.name)}&background=0A0D0C&color=A9DDD3&size=200&bold=true`;
                  }}
                />
                {xProfile.verified && (
                  <div
                    title="Verified on X"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: '#1D9BF0',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #080C0C',
                      boxShadow: '0 0 10px rgba(29, 155, 240, 0.6)',
                    }}
                  >
                    <Check size={13} color="#FFFFFF" strokeWidth={3.5} />
                  </div>
                )}
              </div>

              {/* Name & Handle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {xProfile.name}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#A9DDD3', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                @{xProfile.screenName}
              </div>

              {/* Followers Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(169, 221, 211, 0.12)', border: '1px solid rgba(169, 221, 211, 0.25)', fontSize: '11px', color: '#A9DDD3', fontWeight: 700 }}>
                <Users size={12} />
                <span>{xProfile.followers.toLocaleString()} Followers</span>
              </div>

              {/* Bio Snippet (if available) */}
              {xProfile.bio && (
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(232, 227, 213, 0.7)',
                    margin: '12px 0 0 0',
                    lineHeight: '1.45',
                    fontStyle: 'italic',
                    background: 'rgba(232, 227, 213, 0.03)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(232, 227, 213, 0.06)',
                  }}
                >
                  "{xProfile.bio.length > 100 ? xProfile.bio.slice(0, 100) + '...' : xProfile.bio}"
                </p>
              )}
            </div>

            {/* Confirmation Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleConfirmIdentity}
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
                  boxShadow: '0 0 25px rgba(169, 221, 211, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <Check size={17} strokeWidth={3} />
                <span>Yes, this is me! Continue</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={handleRejectIdentity}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(232, 227, 213, 0.05)',
                  border: '1px solid rgba(232, 227, 213, 0.15)',
                  color: 'rgba(232, 227, 213, 0.7)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <RotateCcw size={14} />
                <span>No, not me (change handle)</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3A: NEW USER - SET SECURITY PIN
            ======================================================== */}
        {step === 'CREATE_PIN' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {/* Confirmed Profile Mini Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px 5px 6px',
                  borderRadius: '9999px',
                  background: 'rgba(169, 221, 211, 0.12)',
                  border: '1px solid rgba(169, 221, 211, 0.35)',
                  marginBottom: '12px',
                }}
              >
                <img
                  src={displayAvatar}
                  alt={cleanHandle}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid #A9DDD3',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0A0D0C&color=A9DDD3`;
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>
                  @{cleanHandle}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.6)' }}>
                  ({displayName})
                </span>
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  margin: '0 0 4px 0',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Set Your Security PIN
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.65)', margin: 0 }}>
                Choose a 4-digit PIN to secure your cards, trades, and rewards for @{cleanHandle}.
              </p>
            </div>

            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#A9DDD3',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                  }}
                >
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
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#A9DDD3',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                  }}
                >
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
                <div
                  style={{
                    marginBottom: '14px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    fontSize: '12px',
                  }}
                >
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
                onClick={() => {
                  setStep('HANDLE');
                  setPin('');
                  setConfirmPin('');
                  setError('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(232, 227, 213, 0.5)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ← Change handle
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3B: RETURNING USER - ENTER PIN
            ======================================================== */}
        {step === 'ENTER_PIN' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {/* Confirmed Avatar Preview */}
              <div
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  margin: '0 auto 12px auto',
                }}
              >
                <img
                  src={displayAvatar}
                  alt={cleanHandle}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #A9DDD3',
                    boxShadow: '0 0 20px rgba(169, 221, 211, 0.4)',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0A0D0C&color=A9DDD3`;
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    background: '#10B981',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #010101',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(169, 221, 211, 0.15)',
                  color: '#A9DDD3',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '6px',
                }}
              >
                <CheckCircle size={12} /> RETURNING PROTOCOL CITIZEN
              </div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  margin: '0 0 4px 0',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Welcome Back, {displayName}!
              </h2>
              <div
                style={{
                  fontSize: '13px',
                  color: '#A9DDD3',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '4px',
                }}
              >
                @{cleanHandle}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.65)', margin: 0 }}>
                Enter your 4-digit security PIN to unlock your card binder and daily quests.
              </p>
            </div>

            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#A9DDD3',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
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
                <div
                  style={{
                    marginBottom: '14px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    fontSize: '12px',
                  }}
                >
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
                onClick={() => {
                  setStep('HANDLE');
                  setPin('');
                  setError('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(232, 227, 213, 0.5)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
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
