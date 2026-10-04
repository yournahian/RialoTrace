import React, { useState, useEffect, useRef } from 'react';
import { Swords, Crown, Share2, Sparkles, Zap, ShieldAlert, Award } from 'lucide-react';
import { TierBadge } from './TierBadge';

const POPULAR_MATCHUPS = [
  { p1: 'yournahian', p2: 'itachee_x', label: 'yournahian vs itachee_x' },
  { p1: 'RialoHQ', p2: 'Subzero_Labs', label: 'RialoHQ vs Subzero_Labs' },
  { p1: 'itachee_x', p2: 'RialoHQ', label: 'itachee_x vs RialoHQ' },
];

const BATTLE_STEPS = [
  '⚔️ INITIATING RIALO CREATOR CLASH...',
  '⚡ BENCHMARKING RIALO TRANSACTION VELOCITY & TPS...',
  '🔥 AUDITING ON-CHAIN PROOF-OF-WORK & VIRALITY...',
  '👑 TALLYING FINALITY CONSENSUS...',
];

export const VersusArena: React.FC = () => {
  // Handles
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  // Battle Phase
  const [battleStage, setBattleStage] = useState<'idle' | 'battling' | 'revealed'>('idle');
  const [battleStepIndex, setBattleStepIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(false);

  // User Data
  const [user1Data, setUser1Data] = useState<any>(null);
  const [user2Data, setUser2Data] = useState<any>(null);

  // Animated Numbers for Reveal Counter
  const [displayImps1, setDisplayImps1] = useState(0);
  const [displayImps2, setDisplayImps2] = useState(0);
  const [displayPosts1, setDisplayPosts1] = useState(0);
  const [displayPosts2, setDisplayPosts2] = useState(0);

  // Ticker and Cypher Interval Refs
  const cypherIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countAnimationRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (cypherIntervalRef.current) clearInterval(cypherIntervalRef.current);
      if (countAnimationRef.current) clearInterval(countAnimationRef.current);
    };
  }, []);

  const startRollingNumbers = () => {
    if (cypherIntervalRef.current) clearInterval(cypherIntervalRef.current);
    cypherIntervalRef.current = setInterval(() => {
      setDisplayImps1(Math.floor(Math.random() * 850000) + 10000);
      setDisplayImps2(Math.floor(Math.random() * 850000) + 10000);
      setDisplayPosts1(Math.floor(Math.random() * 120) + 5);
      setDisplayPosts2(Math.floor(Math.random() * 120) + 5);
    }, 75);
  };

  const stopRollingAndCountUp = (targetImps1: number, targetImps2: number, targetPosts1: number, targetPosts2: number) => {
    if (cypherIntervalRef.current) {
      clearInterval(cypherIntervalRef.current);
      cypherIntervalRef.current = null;
    }

    // Smooth count-up animation over 1.2 seconds
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    if (countAnimationRef.current) clearInterval(countAnimationRef.current);
    countAnimationRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min(1, currentStep / steps);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setDisplayImps1(Math.round(targetImps1 * ease));
      setDisplayImps2(Math.round(targetImps2 * ease));
      setDisplayPosts1(Math.round(targetPosts1 * ease));
      setDisplayPosts2(Math.round(targetPosts2 * ease));

      if (currentStep >= steps) {
        if (countAnimationRef.current) clearInterval(countAnimationRef.current);
        setDisplayImps1(targetImps1);
        setDisplayImps2(targetImps2);
        setDisplayPosts1(targetPosts1);
        setDisplayPosts2(targetPosts2);
      }
    }, stepTime);
  };

  const fetchVersusData = async (h1: string, h2: string) => {
    const clean1 = h1.replace('@', '').trim();
    const clean2 = h2.replace('@', '').trim();
    if (!clean1 || !clean2) return;

    // Start Battle Mode
    setBattleStage('battling');
    setBattleStepIndex(0);
    startRollingNumbers();

    // Step progression timer
    const stepTimer1 = setTimeout(() => setBattleStepIndex(1), 700);
    const stepTimer2 = setTimeout(() => setBattleStepIndex(2), 1400);
    const stepTimer3 = setTimeout(() => setBattleStepIndex(3), 2100);

    const startTime = Date.now();

    try {
      let j1: any = null;
      let j2: any = null;

      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/impressions?handle=${encodeURIComponent(clean1)}`),
          fetch(`/api/impressions?handle=${encodeURIComponent(clean2)}`),
        ]);
        if (res1 && res1.ok) j1 = await res1.json();
        if (res2 && res2.ok) j2 = await res2.json();
      } catch (fetchErr) {
        console.warn('Versus impressions fetch error:', fetchErr);
      }

      // Compute deterministic fallback metrics if live count is unavailable
      const getSeed = (str: string) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
          h = (h << 5) - h + str.charCodeAt(i);
          h |= 0;
        }
        return Math.abs(h);
      };

      const seed1 = getSeed(clean1.toLowerCase());
      const seed2 = getSeed(clean2.toLowerCase());

      const finalImpsVal1 = typeof j1?.total_impressions === 'number' ? j1.total_impressions : 0;

      const finalImpsVal2 = typeof j2?.total_impressions === 'number' ? j2.total_impressions : 0;

      const finalPostsVal1 = typeof j1?.post_count === 'number' ? j1.post_count : 0;

      const finalPostsVal2 = typeof j2?.post_count === 'number' ? j2.post_count : 0;

      const parsed1 = {
        user: {
          handle: j1?.username || clean1,
          name: j1?.profile?.name || clean1,
          profile_image_url:
            j1?.profile?.avatar || `https://unavatar.io/x/${clean1}`,
        },
        totalImpressions: finalImpsVal1,
        totalPosts: finalPostsVal1,
      };

      const parsed2 = {
        user: {
          handle: j2?.username || clean2,
          name: j2?.profile?.name || clean2,
          profile_image_url:
            j2?.profile?.avatar || `https://unavatar.io/x/${clean2}`,
        },
        totalImpressions: finalImpsVal2,
        totalPosts: finalPostsVal2,
      };

      // Guarantee battle animation displays thrillingly for at least 2.6s
      const elapsed = Date.now() - startTime;
      const minDuration = 2600;
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
      }

      setUser1Data(parsed1);
      setUser2Data(parsed2);

      // Trigger Victory Shockwave Burst
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 850);

      // Transition to Revealed State & Start Number Counting
      setBattleStage('revealed');
      stopRollingAndCountUp(
        parsed1.totalImpressions,
        parsed2.totalImpressions,
        parsed1.totalPosts,
        parsed2.totalPosts
      );
    } catch (e) {
      console.error(e);
      setBattleStage('idle');
      if (cypherIntervalRef.current) clearInterval(cypherIntervalRef.current);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
    }
  };

  const handleFightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input1.trim() && input2.trim() && battleStage !== 'battling') {
      fetchVersusData(input1, input2);
    }
  };

  const handleSelectPreset = (p1: string, p2: string) => {
    setInput1(p1);
    setInput2(p2);
    fetchVersusData(p1, p2);
  };

  const finalImps1 = user1Data?.totalImpressions || 0;
  const finalImps2 = user2Data?.totalImpressions || 0;
  const totalImps = finalImps1 + finalImps2;

  const p1Percent = totalImps > 0 ? Math.round((finalImps1 / totalImps) * 100) : 50;
  const p2Percent = 100 - p1Percent;

  const winner =
    battleStage === 'revealed'
      ? finalImps1 > finalImps2
        ? 1
        : finalImps2 > finalImps1
        ? 2
        : 0
      : 0;

  const handleShareVersus = () => {
    if (!user1Data || !user2Data) return;
    const text = encodeURIComponent(
      `⚔️ RIALO VERSUS SHOWDOWN ⚔️\n\n@${user1Data.user.handle} (${finalImps1.toLocaleString()} imps) VS @${user2Data.user.handle} (${finalImps2.toLocaleString()} imps)\n\n${
        winner === 1
          ? `👑 Winner: @${user1Data.user.handle}`
          : winner === 2
          ? `👑 Winner: @${user2Data.user.handle}`
          : '🤝 Tied Battle'
      }\n\nCheck real-time Rialo creator head-to-head on @RialoTrace:`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="feature-view-container animate-fade-in" style={{ position: 'relative' }}>
      {/* Visual Shockwave Flash Burst on Victory */}
      {showFlash && <div className="battle-flash-overlay" />}

      {/* Title Header */}
      <div className="feature-header-wrap">
        <div
          className="feature-pill-badge"
          style={{
            color: '#A9DDD3',
            borderColor: 'rgba(169,221,211,0.3)',
            background: 'rgba(169,221,211,0.08)',
          }}
        >
          <Swords style={{ width: '14px', height: '14px' }} />
          <span>Live Creator Showdown • Sub-Second Finality</span>
        </div>
        <h2 className="feature-title">
          Rialo <span className="gradient-text-rialo">Versus</span> Arena
        </h2>
        <p className="feature-desc">
          Compare any two Twitter creators or ecosystem leads side-by-side. Enter any usernames below
          to trigger a live on-chain battle simulation and crown the winner.
        </p>

        {/* Dual Input Controls with Enter Submit */}
        <form onSubmit={handleFightSubmit} className="versus-controls-bar">
          <div className="feature-input-wrap">
            <span className="feature-input-prefix" style={{ color: '#A9DDD3' }}>
              @
            </span>
            <input
              type="text"
              value={input1}
              disabled={battleStage === 'battling'}
              onChange={(e) => setInput1(e.target.value)}
              placeholder="Enter first handle"
              className="feature-text-input"
              style={{ borderColor: 'rgba(169, 221, 211,0.35)' }}
            />
          </div>

          <div className={`versus-vs-icon ${battleStage === 'battling' ? 'is-battling' : ''}`}>
            <Swords style={{ width: '16px', height: '16px' }} />
          </div>

          <div className="feature-input-wrap">
            <span className="feature-input-prefix" style={{ color: '#E8E3D5' }}>
              @
            </span>
            <input
              type="text"
              value={input2}
              disabled={battleStage === 'battling'}
              onChange={(e) => setInput2(e.target.value)}
              placeholder="Enter second handle"
              className="feature-text-input"
              style={{ borderColor: 'rgba(232,227,213,0.35)' }}
            />
          </div>

          <button
            type="submit"
            disabled={battleStage === 'battling' || !input1.trim() || !input2.trim()}
            className="feature-submit-btn"
            style={{
              background:
                battleStage === 'battling'
                  ? 'rgba(169, 221, 211, 0.25)'
                  : !input1.trim() || !input2.trim()
                  ? 'rgba(169, 221, 211, 0.08)'
                  : 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
              color:
                battleStage === 'battling'
                  ? '#A9DDD3'
                  : !input1.trim() || !input2.trim()
                  ? '#E8E3D5'
                  : '#010101',
              border:
                battleStage === 'battling'
                  ? '1px solid rgba(169, 221, 211, 0.4)'
                  : !input1.trim() || !input2.trim()
                  ? '1px solid rgba(169, 221, 211, 0.35)'
                  : '1px solid #A9DDD3',
              cursor:
                battleStage === 'battling' || !input1.trim() || !input2.trim()
                  ? 'not-allowed'
                  : 'pointer',
              minWidth: '160px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              boxShadow:
                battleStage !== 'battling' && input1.trim() && input2.trim()
                  ? '0 0 25px rgba(169, 221, 211, 0.5)'
                  : '0 2px 10px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            {battleStage === 'battling' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Swords style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                <span>Battling...</span>
              </span>
            ) : !input1.trim() || !input2.trim() ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Swords style={{ width: '15px', height: '15px', color: '#A9DDD3', opacity: 0.9 }} />
                <span>Enter 2 Handles</span>
              </span>
            ) : battleStage === 'revealed' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Swords style={{ width: '16px', height: '16px' }} />
                <span>Rematch Battle!</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Swords style={{ width: '16px', height: '16px' }} />
                <span>Start Battle!</span>
              </span>
            )}
          </button>
        </form>

        {/* Live Battle Ticker during Battling */}
        {battleStage === 'battling' && (
          <div className="battle-ticker-banner" style={{ marginTop: '6px' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#A9DDD3' }} />
            <span>{BATTLE_STEPS[battleStepIndex]}</span>
          </div>
        )}

        {/* Victor Announcement Banner on Reveal */}
        {battleStage === 'revealed' && (
          <div
            className="battle-ticker-banner"
            style={{
              marginTop: '6px',
              borderColor: winner === 1 ? '#A9DDD3' : winner === 2 ? '#E8E3D5' : '#A9DDD3',
              color: '#FFFFFF',
              background:
                winner === 1
                  ? 'rgba(169, 221, 211, 0.12)'
                  : winner === 2
                  ? 'rgba(249, 115, 22, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
            }}
          >
            <Crown style={{ width: '16px', height: '16px', color: '#A9DDD3' }} />
            <span>
              {winner === 1
                ? `👑 @${user1Data?.user?.handle} CLAIMS THE RIALO ARENA CROWN!`
                : winner === 2
                ? `👑 @${user2Data?.user?.handle} CLAIMS THE RIALO ARENA CROWN!`
                : '🤝 TIED MATCHUP — PERFECT FINALITY EQUILIBRIUM!'}
            </span>
          </div>
        )}

        {/* Quick Matchup Presets */}
        <div className="monad-chips-row" style={{ marginTop: '4px' }}>
          <span className="chips-label">Quick Battles:</span>
          {POPULAR_MATCHUPS.map((m, i) => (
            <button
              key={i}
              type="button"
              disabled={battleStage === 'battling'}
              onClick={() => handleSelectPreset(m.p1, m.p2)}
              className="monad-chip-btn"
            >
              @{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Showdown Ring Cards */}
      <div className="versus-showdown-grid">
        {/* Center VS circle on desktop */}
        <div className={`versus-center-badge ${battleStage === 'battling' ? 'is-battling' : ''}`}>
          VS
        </div>

        {/* Challenger 1 Card */}
        <div
          className={`versus-card-shell ${
            battleStage === 'battling'
              ? 'is-battling-cyan'
              : battleStage === 'revealed'
              ? winner === 1
                ? 'winner-cyan victor-celebrate-cyan'
                : 'loser-dim'
              : ''
          }`}
        >
          {battleStage === 'revealed' && winner === 1 && (
            <div className="versus-victor-pill cyan">
              <Crown style={{ width: '13px', height: '13px' }} />
              <span>VICTOR • MOST IMPRESSIONS</span>
            </div>
          )}

          <div className="versus-profile-header">
            <div
              className="versus-profile-avatar"
              style={{
                borderColor: 'rgba(169, 221, 211,0.4)',
                color: '#A9DDD3',
                boxShadow: battleStage === 'battling' ? '0 0 25px rgba(169, 221, 211,0.6)' : 'none',
              }}
            >
              {user1Data?.user?.profile_image_url ? (
                <img
                  src={user1Data.user.profile_image_url}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : user1Data?.user?.handle ? (
                user1Data.user.handle.slice(0, 2).toUpperCase()
              ) : input1.trim() ? (
                input1.replace('@', '').trim().slice(0, 2).toUpperCase()
              ) : (
                '?'
              )}
            </div>
            <div className="versus-profile-meta">
              <h3 className="versus-handle-heading">
                {user1Data?.user?.handle
                  ? `@${user1Data.user.handle}`
                  : input1.trim()
                  ? `@${input1.replace('@', '').trim()}`
                  : 'Challenger #1'}
              </h3>
              <p className="versus-name-sub">
                {battleStage === 'battling'
                  ? '⚡ Auditing live Rialo metrics...'
                  : user1Data?.user?.name
                  ? user1Data.user.name
                  : battleStage === 'revealed'
                  ? 'Contender'
                  : input1.trim()
                  ? 'Ready for battle'
                  : 'Enter handle above'}
              </p>
              {battleStage === 'revealed' && (
                <div style={{ marginTop: '4px' }}>
                  <TierBadge impressions={finalImps1} />
                </div>
              )}
            </div>
          </div>

          {/* Metric Stats */}
          <div className="versus-metrics-grid">
            <div className="versus-metric-box">
              <div className="versus-metric-label">Total Impressions</div>
              <div
                className="versus-metric-value cyan"
                style={{
                  textShadow: battleStage === 'battling' ? '0 0 15px #A9DDD3' : 'none',
                }}
              >
                {battleStage === 'idle'
                  ? '—'
                  : displayImps1.toLocaleString()}
              </div>
            </div>
            <div className="versus-metric-box">
              <div className="versus-metric-label">Rialo Posts</div>
              <div
                className="versus-metric-value"
                style={{
                  textShadow: battleStage === 'battling' ? '0 0 15px rgba(255,255,255,0.6)' : 'none',
                }}
              >
                {battleStage === 'idle'
                  ? '—'
                  : displayPosts1.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Dominance Bar */}
          <div className="versus-bar-wrap">
            <div className="versus-bar-labels">
              <span style={{ color: '#A9DDD3' }}>Impression Share</span>
              <span style={{ color: '#A9DDD3' }}>
                {battleStage === 'revealed' ? `${p1Percent}%` : battleStage === 'battling' ? '50%' : '—'}
              </span>
            </div>
            <div className="versus-bar-track">
              <div
                className="versus-bar-fill"
                style={{
                  width: battleStage === 'revealed' ? `${p1Percent}%` : '50%',
                  background: '#A9DDD3',
                  boxShadow: battleStage === 'revealed' && winner === 1 ? '0 0 15px #A9DDD3' : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Challenger 2 Card */}
        <div
          className={`versus-card-shell ${
            battleStage === 'battling'
              ? 'is-battling-silk'
              : battleStage === 'revealed'
              ? winner === 2
                ? 'winner-silk victor-celebrate-silk'
                : 'loser-dim'
              : ''
          }`}
        >
          {battleStage === 'revealed' && winner === 2 && (
            <div className="versus-victor-pill silk">
              <Crown style={{ width: '13px', height: '13px' }} />
              <span>VICTOR • MOST IMPRESSIONS</span>
            </div>
          )}

          <div className="versus-profile-header">
            <div
              className="versus-profile-avatar"
              style={{
                borderColor: 'rgba(232,227,213,0.4)',
                color: '#E8E3D5',
                boxShadow: battleStage === 'battling' ? '0 0 25px rgba(232,227,213,0.6)' : 'none',
              }}
            >
              {user2Data?.user?.profile_image_url ? (
                <img
                  src={user2Data.user.profile_image_url}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : user2Data?.user?.handle ? (
                user2Data.user.handle.slice(0, 2).toUpperCase()
              ) : input2.trim() ? (
                input2.replace('@', '').trim().slice(0, 2).toUpperCase()
              ) : (
                '?'
              )}
            </div>
            <div className="versus-profile-meta">
              <h3 className="versus-handle-heading">
                {user2Data?.user?.handle
                  ? `@${user2Data.user.handle}`
                  : input2.trim()
                  ? `@${input2.replace('@', '').trim()}`
                  : 'Challenger #2'}
              </h3>
              <p className="versus-name-sub">
                {battleStage === 'battling'
                  ? '⚡ Auditing live Rialo metrics...'
                  : user2Data?.user?.name
                  ? user2Data.user.name
                  : battleStage === 'revealed'
                  ? 'Contender'
                  : input2.trim()
                  ? 'Ready for battle'
                  : 'Enter handle above'}
              </p>
              {battleStage === 'revealed' && (
                <div style={{ marginTop: '4px' }}>
                  <TierBadge impressions={finalImps2} />
                </div>
              )}
            </div>
          </div>

          {/* Metric Stats */}
          <div className="versus-metrics-grid">
            <div className="versus-metric-box">
              <div className="versus-metric-label">Total Impressions</div>
              <div
                className="versus-metric-value silk"
                style={{
                  textShadow: battleStage === 'battling' ? '0 0 15px #E8E3D5' : 'none',
                }}
              >
                {battleStage === 'idle'
                  ? '—'
                  : displayImps2.toLocaleString()}
              </div>
            </div>
            <div className="versus-metric-box">
              <div className="versus-metric-label">Rialo Posts</div>
              <div
                className="versus-metric-value"
                style={{
                  textShadow: battleStage === 'battling' ? '0 0 15px rgba(255,255,255,0.6)' : 'none',
                }}
              >
                {battleStage === 'idle'
                  ? '—'
                  : displayPosts2.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Dominance Bar */}
          <div className="versus-bar-wrap">
            <div className="versus-bar-labels">
              <span style={{ color: '#E8E3D5' }}>Impression Share</span>
              <span style={{ color: '#E8E3D5' }}>
                {battleStage === 'revealed' ? `${p2Percent}%` : battleStage === 'battling' ? '50%' : '—'}
              </span>
            </div>
            <div className="versus-bar-track">
              <div
                className="versus-bar-fill"
                style={{
                  width: battleStage === 'revealed' ? `${p2Percent}%` : '50%',
                  background: '#E8E3D5',
                  boxShadow: battleStage === 'revealed' && winner === 2 ? '0 0 15px #E8E3D5' : 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share Showdown Footer */}
      {battleStage === 'revealed' && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
          <button
            onClick={handleShareVersus}
            className="card-action-btn-primary"
            style={{
              width: 'auto',
              padding: '0 28px',
              height: '40px',
              borderRadius: '14px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Share2 style={{ width: '16px', height: '16px' }} />
            <span>Broadcast Showdown to X</span>
          </button>
        </div>
      )}
    </div>
  );
};
