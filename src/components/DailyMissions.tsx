'use client';

import { CryoStreakVault } from './CryoStreakVault';

import React, { useState, useEffect } from 'react';
import { Mission, UserProfile, CardArchetype, PendingGiftItem } from '@/lib/types';
import { ALL_30_CARDS } from '@/lib/cardsData';
import { Lock, CheckCircle2, Circle, ExternalLink, Gift, Sparkles, Flame, Coins, Calendar, Check, Camera, X, HelpCircle, Upload, Trash2 } from 'lucide-react';
import { playPackOpenSound, playCardRevealSound } from '@/lib/sounds';

interface DailyMissionsProps {
  username: string;
  onUserDataUpdate?: (user: UserProfile) => void;
  onOpenPackInRialoCards?: (pulledCards: CardArchetype[]) => void;
}

function getLocalClientDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({
  username,
  onUserDataUpdate,
  onOpenPackInRialoCards,
}) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [activeQuizMission, setActiveQuizMission] = useState<Mission | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>('');
  const [quizError, setQuizError] = useState<string>('');
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [activeProofMission, setActiveProofMission] = useState<Mission | null>(null);
  const [proofImageBase64, setProofImageBase64] = useState<string>('');
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [todayDate, setTodayDate] = useState('');
  const [claimingGiftId, setClaimingGiftId] = useState<string | null>(null);

  const handleClaimGift = async (giftItem: PendingGiftItem) => {
    try {
      setClaimingGiftId(giftItem.id);
      const res = await fetch('/api/user/claim-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, giftId: giftItem.id }),
      });
      const data = await res.json();
      if (data.success && data.cards && data.cards.length > 0) {
        // Play energetic card pack open audio chime
        playPackOpenSound();

        // Update user state so inventory and points are credited
        if (data.user) {
          setUser(data.user);
          if (onUserDataUpdate) onUserDataUpdate(data.user);
        }

        // Trigger 3D card reveal sequence in RialoCards!
        if (onOpenPackInRialoCards) {
          onOpenPackInRialoCards(data.cards);
        }
      } else {
        alert(data.error || 'Failed to claim card gift');
      }
    } catch (err) {
      console.error('Failed to claim gift:', err);
      alert('Network error while claiming card gift');
    } finally {
      setClaimingGiftId(null);
    }
  };

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const clientDate = getLocalClientDate();
      const res = await fetch(`/api/missions?username=${encodeURIComponent(username)}&date=${encodeURIComponent(clientDate)}`);
      const data = await res.json();
      if (data.success) {
        setMissions(data.missions || []);
        setCompletedIds(data.completedMissions || []);
        setTodayDate(data.today || '');
      }
    } catch (err) {
      console.error('Failed to load missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/user?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        if (onUserDataUpdate) onUserDataUpdate(data.user);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  useEffect(() => {
    if (username) {
      fetchMissions();
      fetchUser();
      const interval = setInterval(() => {
        fetchUser();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [username]);

  const handleCompleteMission = async (m: Mission) => {
    if (completedIds.includes(m.id)) return;

    // If quiz type, open quiz modal for interactive answering!
    if (m.type === 'quiz' && (m.quizQuestion || m.quizOptions)) {
      setActiveQuizMission(m);
      setQuizQuestionIndex(0);
      setSelectedQuizOption('');
      setQuizError('');
      setQuizSuccess(false);
      return;
    }

    // Open task link if available
    if (m.link) {
      window.open(m.link, '_blank');
    }

    // If mission requires screenshot proof (optional or mandatory), open upload proof modal!
    if (m.screenshotRequirement === 'mandatory' || m.screenshotRequirement === 'optional') {
      setActiveProofMission(m);
      setProofImageBase64('');
      return;
    }

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, missionId: m.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedIds((prev) => [...prev, m.id]);
        setUser(data.user);
        if (onUserDataUpdate) onUserDataUpdate(data.user);
      }
    } catch (err) {
      console.error('Failed to complete mission:', err);
    }
  };

  const handleSubmitQuizAnswer = async () => {
    if (!activeQuizMission || !selectedQuizOption) return;

    const qList = (activeQuizMission.quizQuestions && activeQuizMission.quizQuestions.length > 0)
      ? activeQuizMission.quizQuestions
      : [{
          question: activeQuizMission.quizQuestion || activeQuizMission.title,
          options: activeQuizMission.quizOptions || [activeQuizMission.quizAnswer || 'Correct Answer', 'Option B', 'Option C', 'Option D'],
          answer: activeQuizMission.quizAnswer || 'Correct Answer',
          explanation: activeQuizMission.quizExplanation
        }];

    const currentQ = qList[quizQuestionIndex] || qList[0];
    const correctAns = (currentQ.answer || '').trim().toLowerCase();
    const chosen = selectedQuizOption.trim().toLowerCase();

    if (chosen !== correctAns) {
      setQuizError('Incorrect answer. Review the question and try another option!');
      return;
    }

    // If there are more questions in this quiz set, proceed to next!
    if (quizQuestionIndex < qList.length - 1) {
      setQuizError('');
      setSelectedQuizOption('');
      setQuizQuestionIndex((prev) => prev + 1);
      return;
    }

    // All questions in set completed!
    setQuizSuccess(true);
    setQuizError('');

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, missionId: activeQuizMission.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedIds((prev) => [...prev, activeQuizMission.id]);
        setUser(data.user);
        if (onUserDataUpdate) onUserDataUpdate(data.user);
        setTimeout(() => {
          setActiveQuizMission(null);
        }, 1400);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadScreenshotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Image size exceeds 8MB. Please select a smaller screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProofImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (isSkip: boolean = false) => {
    if (!activeProofMission) return;

    if (!isSkip && activeProofMission.screenshotRequirement === 'mandatory' && !proofImageBase64) {
      alert('Screenshot proof (SS) is mandatory for this mission before claiming shards.');
      return;
    }

    try {
      setUploadingProof(true);
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          missionId: activeProofMission.id,
          proofScreenshot: proofImageBase64 || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedIds((prev) => [...prev, activeProofMission.id]);
        setUser(data.user);
        if (onUserDataUpdate) onUserDataUpdate(data.user);
        setActiveProofMission(null);
        setProofImageBase64('');
      } else {
        alert(data.error || 'Failed to submit proof');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleClaimPack = async () => {
    if (user?.lastClaimDate === todayDate) {
      alert('You have already claimed today\'s 3-card pack! New missions and packs unlock daily at 00:00 UTC.');
      return;
    }

    try {
      setClaiming(true);
      const res = await fetch('/api/pack/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success && data.cards) {
        // Play energetic pack-opening audio chime!
        playPackOpenSound();

        setUser(data.user);
        if (onUserDataUpdate) onUserDataUpdate(data.user);

        // Directly navigate to RIALO CARDS to reveal the cards with 3D animation and sound!
        if (onOpenPackInRialoCards) {
          onOpenPackInRialoCards(data.cards);
        }
      } else {
        alert(data.error || 'Failed to claim pack');
      }
    } catch (err) {
      console.error('Failed to claim pack:', err);
    } finally {
      setClaiming(false);
    }
  };

  const allCompleted = missions.length > 0 && missions.every((m) => completedIds.includes(m.id));
  const isAlreadyClaimedToday = Boolean(todayDate && user?.lastClaimDate === todayDate);

  return (
    <div className="tcg-container">
      <CryoStreakVault user={user} onUserUpdate={(u) => { setUser(u); if (onUserDataUpdate) onUserDataUpdate(u); }} />

      {/* Top Banner */}
      <div className="tcg-header">
        <div>
          <div className="tcg-eyebrow">
            <Calendar size={14} /> Season 1 Daily Tasks • {todayDate || 'Today'}
          </div>
          <h2 className="tcg-title">
            Complete Daily Tasks ➔ <span className="gradient-text-rialo">Unlock 3 Cards</span>
          </h2>
          <p className="tcg-subtitle">
            Tasks reset daily at 00:00 UTC. Collect all 30 Season 1 Genesis warriors to secure your Guaranteed Free Mint!
          </p>
        </div>

        {/* User Stats Pill */}
        {user && (
          <div className="tcg-stats-pill">
            <div className="tcg-stat-item tcg-stat-shards">
              <Coins size={16} />
              <span>{user.shards} Shards</span>
            </div>
            <div className="tcg-stat-divider" />
            <div className="tcg-stat-item tcg-stat-streak">
              <Flame size={16} />
              <span>{user.streakDays}d Streak</span>
            </div>
          </div>
        )}
      </div>

            {/* Admin Gifted Cards / Airdrop Pending Reveal Box */}
      {user?.pendingGifts && user.pendingGifts.length > 0 && (
        <div style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(0, 240, 255, 0.12) 50%, rgba(245, 158, 11, 0.15) 100%)',
          border: '1.5px solid rgba(0, 240, 255, 0.45)',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.14), inset 0 0 24px rgba(139, 92, 246, 0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #8B5CF6, #00F0FF, #F59E0B)',
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '22px',
                padding: '6px 10px',
                background: 'rgba(0, 240, 255, 0.2)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                🎁
              </span>
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Sparkles size={13} color="#00F0FF" />
                  Admin Protocol Airdrop Received
                </div>
                <h3 style={{
                  margin: '2px 0 0 0',
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                }}>
                  You Have {user.pendingGifts.length} Unrevealed Card Gift{user.pendingGifts.length > 1 ? 's' : ''}!
                </h3>
              </div>
            </div>

            <div style={{
              fontSize: '11px',
              color: '#A9DDD3',
              background: 'rgba(12, 16, 16, 0.7)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(169, 221, 211, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
              Awaiting 3D Card Reveal
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user.pendingGifts.map((gift) => {
              let rColor = '#10B981';
              if (gift.cardRarity === 'MYTHIC') rColor = '#EC4899';
              if (gift.cardRarity === 'LEGENDARY') rColor = '#F59E0B';
              if (gift.cardRarity === 'EPIC') rColor = '#8B5CF6';
              if (gift.cardRarity === 'RARE') rColor = '#3B82F6';

              const isClaimingThis = claimingGiftId === gift.id;

              return (
                <div
                  key={gift.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'rgba(8, 12, 12, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#050707',
                      border: `1.5px solid ${rColor}`,
                      boxShadow: `0 0 14px ${rColor}50`,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <img
                        src={gift.cardImage}
                        alt={gift.cardTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                          {gift.cardTitle}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: `${rColor}20`,
                          color: rColor,
                          border: `1px solid ${rColor}40`,
                        }}>
                          {gift.cardRarity}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#00F0FF',
                          background: 'rgba(0, 240, 255, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}>
                          {gift.quantity}x Card{gift.quantity > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px' }}>
                        You received {gift.quantity > 1 ? `${gift.quantity} cards` : 'a card'} gift for your contribution on: <strong style={{ color: '#FCD34D' }}>"{gift.reason || 'Ecosystem Support'}"</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isClaimingThis}
                    onClick={() => handleClaimGift(gift)}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #00F0FF 0%, #3B82F6 100%)',
                      color: '#050707',
                      border: 'none',
                      cursor: isClaimingThis ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 18px rgba(0, 240, 255, 0.4)',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isClaimingThis) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }}
                  >
                    <Sparkles size={16} />
                    {isClaimingThis ? 'Opening 3D Reveal...' : `Reveal ${gift.quantity > 1 ? `${gift.quantity} Cards` : 'Card'} (3D)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missions List */}
      <div className="mission-list">
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--rialo-text-dim)', fontSize: '14px' }}>
            Loading today's scheduled missions...
          </div>
        ) : missions.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--rialo-text-muted)', fontSize: '14px' }}>
            No missions scheduled for today yet. Check back soon or ask Admin to schedule in /admin!
          </div>
        ) : (
          missions.map((m) => {
            const isDone = completedIds.includes(m.id);
            return (
              <div
                key={m.id}
                className={`mission-card ${isDone ? 'done' : ''}`}
              >
                <div className="mission-card-left">
                  <div className="mission-check-icon">
                    {isDone ? (
                      <CheckCircle2 size={22} color="#10B981" />
                    ) : (
                      <Circle size={22} color="var(--rialo-text-dim)" />
                    )}
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isDone ? 'var(--rialo-text-dim)' : '#FFFFFF',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {m.title}
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--rialo-text-muted)' }}>
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="mission-right">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="mission-reward-badge">
                      +{m.rewardShards} Shards
                    </span>
                    {m.screenshotRequirement === 'mandatory' && (
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Camera size={10} /> SS Required
                      </span>
                    )}
                    {m.screenshotRequirement === 'optional' && (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#A9DDD3', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Camera size={10} /> SS Optional
                      </span>
                    )}
                  </div>
                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteMission(m)}
                      className="mission-btn"
                    >
                      <span>{m.actionLabel || (m.type === 'quiz' ? 'Take Quiz' : 'Start')}</span>
                      {m.link && <ExternalLink size={12} />}
                    </button>
                  ) : (
                    <span className="mission-done-badge">
                      Done
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Claim Button Footer */}
      <div className="claim-footer">
        <div style={{ fontSize: '13px', color: 'var(--rialo-text-muted)' }}>
          {isAlreadyClaimedToday ? (
            <span style={{ color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} /> Today's 3-card daily pack claimed & locked! Next drop unlocks tomorrow at 00:00 UTC.
            </span>
          ) : allCompleted ? (
            <span style={{ color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> All today's tasks complete! Ready to forge and scratch your pack.
            </span>
          ) : (
            <span>Complete today's tasks above to unlock the daily 3-card gacha pack.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleClaimPack}
          disabled={claiming || !allCompleted || isAlreadyClaimedToday}
          className={`claim-pack-btn ${allCompleted && !isAlreadyClaimedToday && !claiming ? 'ready' : 'disabled'}`}
          style={isAlreadyClaimedToday ? {
            opacity: 0.5,
            cursor: 'not-allowed',
            filter: 'grayscale(50%)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'none',
          } : undefined}
          title={isAlreadyClaimedToday ? "You have already revealed today's cards. Resets daily at 00:00 UTC." : undefined}
        >
          {isAlreadyClaimedToday ? <Lock size={18} /> : <Gift size={18} />}
          <span>
            {claiming
              ? 'Forging Pack...'
              : isAlreadyClaimedToday
              ? "Today's Pack Claimed (Locked until 00:00 UTC)"
              : 'Claim & Scratch 3-Card Pack'}
          </span>
        </button>
      </div>
      {/* INTERACTIVE WEB3 QUIZ MODAL */}
      {activeQuizMission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(1, 1, 1, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#060A0A',
              border: '1.5px solid rgba(169, 221, 211, 0.45)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(169, 221, 211, 0.25)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveQuizMission(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rialo-text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(169, 221, 211, 0.12)', border: '1px solid rgba(169, 221, 211, 0.3)', borderRadius: '9999px', color: '#A9DDD3', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '14px' }}>
              <HelpCircle size={14} />
              <span>Daily Web3 Quiz • +{activeQuizMission.rewardShards} Shards</span>
            </div>

            {(() => {
              const qList = (activeQuizMission.quizQuestions && activeQuizMission.quizQuestions.length > 0)
                ? activeQuizMission.quizQuestions
                : [{
                    question: activeQuizMission.quizQuestion || activeQuizMission.title,
                    options: activeQuizMission.quizOptions || [activeQuizMission.quizAnswer || 'Correct Answer', 'Option B', 'Option C', 'Option D'],
                    answer: activeQuizMission.quizAnswer || 'Correct Answer',
                    explanation: activeQuizMission.quizExplanation
                  }];
              const currentQ = qList[quizQuestionIndex] || qList[0];
              const totalQ = qList.length;

              return (
                <>
                  {totalQ > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>
                        Question {quizQuestionIndex + 1} of {totalQ}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {qList.map((_, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '24px',
                              height: '4px',
                              borderRadius: '2px',
                              background: idx === quizQuestionIndex ? '#A9DDD3' : idx < quizQuestionIndex ? 'rgba(169, 221, 211, 0.6)' : 'rgba(255, 255, 255, 0.15)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#E8E3D5', margin: '0 0 8px 0', lineHeight: '1.35' }}>
                    {currentQ.question}
                  </h3>

                  {activeQuizMission.description && (
                    <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.65)', margin: '0 0 16px 0' }}>
                      {activeQuizMission.description}
                    </p>
                  )}

                  {/* Quiz Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                    {currentQ.options.map((opt, i) => {
                const isSelected = selectedQuizOption === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!quizSuccess) {
                        setSelectedQuizOption(opt);
                        setQuizError('');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isSelected ? 'rgba(169, 221, 211, 0.16)' : 'rgba(12, 16, 16, 0.8)',
                      border: isSelected ? '1.5px solid #A9DDD3' : '1px solid rgba(169, 221, 211, 0.2)',
                      borderRadius: '12px',
                      color: isSelected ? '#A9DDD3' : '#E8E3D5',
                      fontSize: '13px',
                      fontWeight: isSelected ? 800 : 600,
                      textAlign: 'left',
                      cursor: quizSuccess ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check size={16} color="#A9DDD3" />}
                  </button>
                );
              })}
            </div>
                </>
              );
            })()}

            {quizError && (
              <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 700, margin: '14px 0 0 0' }}>
                {quizError}
              </p>
            )}

            {quizSuccess && (
              <p style={{ color: '#10B981', fontSize: '13px', fontWeight: 800, margin: '14px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Correct! Shards added to your profile!
              </p>
            )}

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveQuizMission(null)}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(232, 227, 213, 0.2)',
                  borderRadius: '10px',
                  color: 'rgba(232, 227, 213, 0.7)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Close
              </button>

              <button
                type="button"
                disabled={!selectedQuizOption || quizSuccess}
                onClick={handleSubmitQuizAnswer}
                style={{
                  padding: '10px 24px',
                  background: !selectedQuizOption || quizSuccess ? 'rgba(169, 221, 211, 0.3)' : 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#010101',
                  cursor: !selectedQuizOption || quizSuccess ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 900,
                  boxShadow: selectedQuizOption ? '0 0 20px rgba(169, 221, 211, 0.4)' : 'none',
                }}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SCREENSHOT PROOF VERIFICATION MODAL */}
      {activeProofMission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(1, 1, 1, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#060A0A',
              border: activeProofMission.screenshotRequirement === 'mandatory' ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1.5px solid rgba(169, 221, 211, 0.45)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(169, 221, 211, 0.2)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveProofMission(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rialo-text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: activeProofMission.screenshotRequirement === 'mandatory' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(169, 221, 211, 0.12)', border: activeProofMission.screenshotRequirement === 'mandatory' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(169, 221, 211, 0.3)', borderRadius: '9999px', color: activeProofMission.screenshotRequirement === 'mandatory' ? '#EF4444' : '#A9DDD3', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '14px' }}>
              <Camera size={14} />
              <span>{activeProofMission.screenshotRequirement === 'mandatory' ? '🔒 Screenshot Proof Mandatory' : '✨ Screenshot Proof Optional'}</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#E8E3D5', margin: '0 0 8px 0', lineHeight: '1.35' }}>
              {activeProofMission.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.65)', margin: '0 0 20px 0' }}>
              {activeProofMission.description || 'Upload a screenshot showing your completed task on X, Discord, or the Rialo dApp.'}
            </p>

            {/* Upload Zone */}
            <div
              style={{
                border: '2px dashed rgba(169, 221, 211, 0.35)',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                background: 'rgba(12, 16, 16, 0.8)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {!proofImageBase64 ? (
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadScreenshotFile}
                    style={{ display: 'none' }}
                  />
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(169, 221, 211, 0.1)', border: '1px solid rgba(169, 221, 211, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A9DDD3' }}>
                    <Upload size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#E8E3D5' }}>Click to upload task screenshot</span>
                    <p style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.5)', margin: '4px 0 0 0' }}>Supports PNG, JPG, or WebP (Max 8MB)</p>
                  </div>
                </label>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img
                    src={proofImageBase64}
                    alt="Proof Preview"
                    style={{ maxHeight: '200px', width: 'auto', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain', margin: '0 auto', display: 'block', border: '1px solid rgba(169, 221, 211, 0.4)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setProofImageBase64('')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                      cursor: 'pointer',
                    }}
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                  <p style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, marginTop: '8px' }}>
                    ✓ Screenshot attached and ready to submit
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveProofMission(null)}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(232, 227, 213, 0.2)',
                  borderRadius: '10px',
                  color: 'rgba(232, 227, 213, 0.7)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>

              {activeProofMission.screenshotRequirement === 'optional' && (
                <button
                  type="button"
                  onClick={() => handleSubmitProof(true)}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#E8E3D5',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Skip & Complete
                </button>
              )}

              <button
                type="button"
                disabled={uploadingProof || (activeProofMission.screenshotRequirement === 'mandatory' && !proofImageBase64)}
                onClick={() => handleSubmitProof(false)}
                style={{
                  padding: '10px 24px',
                  background: (activeProofMission.screenshotRequirement === 'mandatory' && !proofImageBase64) || uploadingProof
                    ? 'rgba(169, 221, 211, 0.25)'
                    : 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#010101',
                  cursor: (activeProofMission.screenshotRequirement === 'mandatory' && !proofImageBase64) || uploadingProof
                    ? 'not-allowed'
                    : 'pointer',
                  fontSize: '13px',
                  fontWeight: 900,
                  boxShadow: proofImageBase64 ? '0 0 20px rgba(169, 221, 211, 0.45)' : 'none',
                }}
              >
                {uploadingProof ? 'Submitting...' : 'Submit Screenshot & Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
