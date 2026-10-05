'use client';

import React, { useState, useEffect } from 'react';
import { Radio, X, CheckCircle2, MessageSquare, Gift, Sparkles, CheckCheck } from 'lucide-react';
import { BroadcastEvent, UserProfile } from '@/lib/types';
import { sound } from '@/lib/soundFx';

interface BroadcastNoticeBannerProps {
  currentUsername: string;
  currentUser: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
}

export const BroadcastNoticeBanner: React.FC<BroadcastNoticeBannerProps> = ({
  currentUsername,
  currentUser,
  onUserUpdate,
}) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastEvent[]>([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<Record<string, boolean>>({});
  const [sessionClosed, setSessionClosed] = useState<boolean>(false);
  const [trollboxSentCount, setTrollboxSentCount] = useState<number>(0);
  const [claimedMissionIds, setClaimedMissionIds] = useState<Record<string, boolean>>({});
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string>('');

  const userHandle = (currentUsername || '').toLowerCase().replace('@', '').trim();

  // 1. Initialize dismissed state from localStorage cache
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('rialo_dismissed_broadcasts') || '{}');
        if (saved && typeof saved === 'object') {
          setDismissedBroadcasts((prev) => ({ ...prev, ...saved }));
        }
      } catch (e) {
        console.error('Failed to load dismissed broadcasts:', e);
      }
    }
  }, []);

  // 2. Automatically sync dismissed state from database (Supabase currentUser & broadcasts)
  // Even if cache is 100% wiped, this restores already dismissed/completed records!
  useEffect(() => {
    if (!userHandle) return;

    setDismissedBroadcasts((prev) => {
      let changed = false;
      const updated = { ...prev };

      // A. If broadcast.completedBy in database contains userHandle, it's ALREADY completed/read
      broadcasts.forEach((b) => {
        const completedUsers = (b.completedBy || []).map((u) => u.toLowerCase().replace('@', '').trim());
        if (completedUsers.includes(userHandle)) {
          if (!updated[b.id]) {
            updated[b.id] = true;
            changed = true;
          }
        }
      });

      // B. If currentUser.completedMissions has b.id or dismissed marker, it's ALREADY dismissed
      currentUser?.completedMissions?.forEach((mId) => {
        const cleanId = mId.replace('dismissed_', '').replace('dismissed_bcast_', '');
        if (!updated[cleanId]) {
          updated[cleanId] = true;
          changed = true;
        }
      });

      if (changed && typeof window !== 'undefined') {
        try {
          localStorage.setItem('rialo_dismissed_broadcasts', JSON.stringify(updated));
        } catch (_) {}
      }

      return changed ? updated : prev;
    });
  }, [broadcasts, currentUser, userHandle]);

  // 3. Fetch active broadcasts from API and refresh periodically
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/broadcast');
      const data = await res.json();
      if (data.success && Array.isArray(data.broadcasts)) {
        setBroadcasts(data.broadcasts);
      }
    } catch (err) {
      console.error('Failed to fetch broadcast announcements:', err);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 20000); // 20s live sync
    return () => clearInterval(interval);
  }, []);

  // 4. Track trollbox messages for mission verification
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUsername) {
      const cleanUser = currentUsername.toLowerCase().replace('@', '').trim();
      const count = parseInt(localStorage.getItem(`rialo_trollbox_sent_${cleanUser}`) || '0');
      setTrollboxSentCount(count);

      const handleMsgSent = (e: any) => {
        if (e.detail?.count !== undefined) {
          setTrollboxSentCount(e.detail.count);
        }
      };
      window.addEventListener('rialo_trollbox_msg_sent', handleMsgSent);
      return () => window.removeEventListener('rialo_trollbox_msg_sent', handleMsgSent);
    }
  }, [currentUsername]);

  // 5. Check if an announcement was already dismissed or completed
  const isAlreadyDismissed = (b: BroadcastEvent) => {
    // Check locally dismissed
    if (dismissedBroadcasts[b.id]) return true;

    // Check if user already claimed/completed it on server
    if (userHandle) {
      const completedUsers = (b.completedBy || []).map((u) => u.toLowerCase().replace('@', '').trim());
      if (completedUsers.includes(userHandle)) return true;
    }

    // Check if user has this mission/dismissal in profile
    if (
      currentUser?.completedMissions?.includes(b.id) ||
      currentUser?.completedMissions?.includes(`dismissed_${b.id}`)
    ) {
      return true;
    }

    // Check if already claimed in current session
    if (claimedMissionIds[b.id]) return true;

    return false;
  };

  // 6. Handle dismiss with permanent local persistence AND server database sync!
  const handleDismiss = async (broadcastId: string, dismissAll = false) => {
    sound.playTap();
    // Close the banner for this session so the user is never barraged with sequential popups!
    setSessionClosed(true);

    const idsToDismiss = dismissAll
      ? eligibleBroadcasts.map((b) => b.id)
      : [broadcastId];

    // Local state & localStorage update
    setDismissedBroadcasts((prev) => {
      const updated = { ...prev };
      idsToDismiss.forEach((id) => {
        updated[id] = true;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rialo_dismissed_broadcasts', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save dismissed broadcast to localStorage:', e);
        }
      }
      return updated;
    });

    // Server-side persistent sync to database so cache clear never resets it
    if (userHandle && idsToDismiss.length > 0) {
      try {
        const res = await fetch('/api/user/dismiss-broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userHandle,
            broadcastIds: idsToDismiss,
          }),
        });
        const data = await res.json();
        if (data.success && data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      } catch (err) {
        console.error('Failed to persist dismissal to database:', err);
      }
    }
  };

  // 7. Claim reward for mission or rewarded broadcast
  const handleClaimReward = async (broadcast: BroadcastEvent) => {
    sound.playTap();
    setIsClaiming(true);
    try {
      const username = currentUsername || '';
      const res = await fetch('/api/missions/verify-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          broadcastId: broadcast.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playJackpot();
        setClaimedMissionIds((prev) => ({ ...prev, [broadcast.id]: true }));
        setClaimSuccessMsg(data.message || `✓ Reward claimed! +${broadcast.shardsReward} Shards added to vault!`);
        setTimeout(() => setClaimSuccessMsg(''), 5000);
        if (data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      } else {
        alert(data.error || 'Failed to claim reward.');
      }
    } catch (err) {
      console.error('Broadcast reward claim error:', err);
      alert('Network error while claiming broadcast reward.');
    } finally {
      setIsClaiming(false);
    }
  };

  // 8. Find eligible broadcasts matching recipient and not already dismissed/completed
  const eligibleBroadcasts = broadcasts.filter((b) => {
    if (isAlreadyDismissed(b)) return false;
    const rec = (b.recipient || '').toLowerCase().replace('@', '').trim();
    return rec === 'all' || rec === 'all players' || rec === userHandle;
  });

  // If user closed the banner or there are no unread announcements, don't show anything
  if (sessionClosed || eligibleBroadcasts.length === 0) return null;

  const activeBroadcast = eligibleBroadcasts[0];

  // Determine styling theme based on notice type & severity
  const isMaintenance = activeBroadcast.broadcastType === 'system_notice' && activeBroadcast.noticeSeverity === 'maintenance';
  const isEvent = activeBroadcast.broadcastType === 'system_notice' && activeBroadcast.noticeSeverity === 'event';
  const isUpdate = activeBroadcast.broadcastType === 'system_notice' && (activeBroadcast.noticeSeverity === 'update' || activeBroadcast.noticeSeverity === 'feature_guide');
  const isMission = activeBroadcast.broadcastType === 'mission';

  let borderColor = '#A9DDD3';
  let badgeColor = '#A9DDD3';
  let badgeTextColor = '#010101';
  let badgeLabel = '📢 OFFICIAL ANNOUNCEMENT';

  if (isMission) {
    borderColor = '#A9DDD3';
    badgeLabel = '🎯 PROTOCOL MISSION';
  } else if (activeBroadcast.broadcastType === 'achievement') {
    borderColor = '#F59E0B';
    badgeColor = '#F59E0B';
    badgeLabel = '🏆 PROTOCOL ACHIEVEMENT';
  } else if (isMaintenance) {
    borderColor = '#F59E0B';
    badgeColor = '#F59E0B';
    badgeLabel = '⚠️ SYSTEM MAINTENANCE';
  } else if (isEvent) {
    borderColor = '#E879F9';
    badgeColor = '#E879F9';
    badgeLabel = '🎁 COMMUNITY EVENT';
  } else if (isUpdate) {
    borderColor = '#38BDF8';
    badgeColor = '#38BDF8';
    badgeLabel = activeBroadcast.noticeSeverity === 'feature_guide' ? '📖 NEW FEATURE GUIDE' : '🚀 PLATFORM UPDATE';
  }

  const isCompletedOrClaimed = Boolean(
    (userHandle && activeBroadcast.completedBy?.map((u) => u.toLowerCase()).includes(userHandle)) ||
    claimedMissionIds[activeBroadcast.id]
  );

  return (
    <div
      style={{
        maxWidth: '1160px',
        margin: '0 auto 20px auto',
        padding: '0 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: isMaintenance
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(6, 12, 16, 0.98) 100%)'
            : isEvent
            ? 'linear-gradient(135deg, rgba(232, 121, 249, 0.14) 0%, rgba(6, 12, 16, 0.98) 100%)'
            : isUpdate
            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.14) 0%, rgba(6, 12, 16, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(169, 221, 211, 0.14) 0%, rgba(6, 12, 16, 0.98) 100%)',
          border: `1.5px solid ${borderColor}`,
          borderRadius: '20px',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: `0 12px 36px rgba(0, 0, 0, 0.7), 0 0 24px ${borderColor}25`,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Success Claim Toast */}
        {claimSuccessMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10B981',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#A7F3D0',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{claimSuccessMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px', flexWrap: 'wrap' }}>
            {/* Visual Icon Badge */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${borderColor} 0%, rgba(255, 255, 255, 0.2) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: `0 0 16px ${borderColor}50`,
                flexShrink: 0,
              }}
            >
              {activeBroadcast.icon || (isMission ? '🎯' : '📢')}
            </div>

            <div style={{ flex: 1 }}>
              {/* Header Badges Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '0.06em',
                    background: badgeColor,
                    color: badgeTextColor,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Radio size={12} className="animate-pulse" /> {badgeLabel}
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Target: {activeBroadcast.recipient}
                </span>

                {activeBroadcast.tier && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      color: '#FBBF24',
                      background: 'rgba(251, 191, 36, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {activeBroadcast.tier}
                  </span>
                )}

                {/* Counter if multiple notices exist */}
                {eligibleBroadcasts.length > 1 && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#A9DDD3',
                      background: 'rgba(169, 221, 211, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(169, 221, 211, 0.25)',
                    }}
                  >
                    1 of {eligibleBroadcasts.length} notices
                  </span>
                )}

                {isCompletedOrClaimed && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      color: '#010101',
                      background: '#10B981',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                    }}
                  >
                    <CheckCircle2 size={12} /> COMPLETED & CLAIMED
                  </span>
                )}
              </div>

              {/* Title & Shards */}
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#E8E3D5', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>{activeBroadcast.title}</span>
                {activeBroadcast.shardsReward > 0 && (
                  <span style={{ color: '#A9DDD3', fontSize: '13px', fontWeight: 800 }}>
                    (+{activeBroadcast.shardsReward} Shards Reward)
                  </span>
                )}
              </div>

              {/* Description / Summary */}
              {activeBroadcast.desc && (
                <div style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.75)', marginTop: '2px', lineHeight: 1.4 }}>
                  {isMission ? `Criteria: ${activeBroadcast.desc}` : activeBroadcast.desc}
                </div>
              )}

              {/* Announcement Message Quote */}
              {activeBroadcast.message && (
                <div style={{ fontSize: '12px', color: '#A9DDD3', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{activeBroadcast.message}"
                </div>
              )}
            </div>
          </div>

          {/* Right Action Area: Claim Reward Button + Dismiss All + Permanent Dismiss (X) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Optional Claim Button if reward available and not claimed */}
            {activeBroadcast.shardsReward > 0 && !isCompletedOrClaimed && (
              <button
                type="button"
                disabled={isClaiming}
                onClick={() => handleClaimReward(activeBroadcast)}
                style={{
                  padding: '8px 18px',
                  background: 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                  color: '#010101',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: isClaiming ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 15px rgba(169, 221, 211, 0.4)',
                  transition: 'all 0.2s',
                }}
              >
                <Gift size={14} />
                <span>{isClaiming ? 'Claiming...' : `Claim +${activeBroadcast.shardsReward} Shards`}</span>
              </button>
            )}

            {/* Dismiss All Button if multiple unread notices exist */}
            {eligibleBroadcasts.length > 1 && (
              <button
                type="button"
                onClick={() => handleDismiss(activeBroadcast.id, true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#8E9B97',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.color = '#EF4444';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#8E9B97';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                title="Dismiss all current notices"
              >
                <CheckCheck size={13} />
                <span>Dismiss All</span>
              </button>
            )}

            {/* Permanent Dismiss Cross Icon */}
            <button
              type="button"
              onClick={() => handleDismiss(activeBroadcast.id, false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#8E9B97',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#EF4444';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#8E9B97';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              title="Dismiss announcement (permanently saved to your account)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Interactive Mission Verification Bar (Rendered ONLY if it is a Mission!) */}
        {isMission && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(169, 221, 211, 0.2)',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
              marginTop: '4px',
            }}
          >
            {/* Progress Tracker */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={13} />
                  {activeBroadcast.missionCategory === 'trollbox'
                    ? `Trollbox Messages: ${trollboxSentCount} / ${activeBroadcast.targetCount || 10}`
                    : `Mission Progress: ${isCompletedOrClaimed ? 1 : 0} / 1 Completed`}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8E9B97' }}>
                  {activeBroadcast.missionCategory === 'trollbox'
                    ? `${Math.min(100, Math.round((trollboxSentCount / (activeBroadcast.targetCount || 10)) * 100))}%`
                    : 'Live Verifier'}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #A9DDD3, #6EBBAE)',
                    width: `${
                      activeBroadcast.missionCategory === 'trollbox'
                        ? Math.min(100, (trollboxSentCount / (activeBroadcast.targetCount || 10)) * 100)
                        : isCompletedOrClaimed ? 100 : 0
                    }%`,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Action Verify / Completed Status */}
            <div>
              {isCompletedOrClaimed ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    color: '#A7F3D0',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  <CheckCircle2 size={13} color="#10B981" />
                  <span>Verified & Shards Credited</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isClaiming || (activeBroadcast.missionCategory === 'trollbox' && trollboxSentCount < (activeBroadcast.targetCount || 10))}
                  onClick={() => handleClaimReward(activeBroadcast)}
                  style={{
                    padding: '8px 18px',
                    background:
                      activeBroadcast.missionCategory === 'trollbox' && trollboxSentCount < (activeBroadcast.targetCount || 10)
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                    color:
                      activeBroadcast.missionCategory === 'trollbox' && trollboxSentCount < (activeBroadcast.targetCount || 10)
                        ? '#8E9B97'
                        : '#010101',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor:
                      activeBroadcast.missionCategory === 'trollbox' && trollboxSentCount < (activeBroadcast.targetCount || 10)
                        ? 'not-allowed'
                        : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow:
                      activeBroadcast.missionCategory === 'trollbox' && trollboxSentCount >= (activeBroadcast.targetCount || 10)
                        ? '0 0 15px rgba(169, 221, 211, 0.4)'
                        : 'none',
                  }}
                >
                  <Sparkles size={14} />
                  <span>
                    {activeBroadcast.missionCategory === 'trollbox' && trollboxSentCount < (activeBroadcast.targetCount || 10)
                      ? `Send ${Math.max(0, (activeBroadcast.targetCount || 10) - trollboxSentCount)} More in Chat`
                      : 'Verify & Claim Reward'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
