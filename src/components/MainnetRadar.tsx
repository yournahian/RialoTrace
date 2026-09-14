import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, Zap, Layers, Copy, Check, Activity, Sparkles } from 'lucide-react';

export const MainnetRadar: React.FC = () => {
  // Target: September 16, 2026, 12:00:00 UTC
  const targetDate = new Date('2026-09-16T12:00:00Z').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [copiedRpc, setCopiedRpc] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRpc(true);
    setTimeout(() => setCopiedRpc(false), 2000);
  };

  const readinessPercent = 94.6;

  return (
    <div className="feature-view-container">
      {/* Hero Countdown Banner */}
      <div className="radar-hero-box">
        {/* Pulsing Status Pill */}
        <div className="feature-pill-badge">
          <span className="card-wave-dot" />
          <span>Mainnet Genesis Radar • T-Minus</span>
        </div>

        <h2 className="feature-title">
          Rialo Mainnet Launch <span className="gradient-text-cyan">September 16, 2026</span>
        </h2>
        <p className="feature-desc">
          The dawn of high-throughput sub-second settlement for institutional and decentralized commerce.
          Circle USDC native liquidity engine powering the next financial paradigm.
        </p>

        {/* Countdown Clock Grid */}
        <div className="countdown-clock-grid">
          {[
            { label: 'DAYS', val: timeLeft.days },
            { label: 'HOURS', val: timeLeft.hours },
            { label: 'MINUTES', val: timeLeft.minutes },
            { label: 'SECONDS', val: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="countdown-unit-box">
              <div className="countdown-num-digit">
                {String(item.val).padStart(2, '0')}
              </div>
              <div className="countdown-unit-label">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Readiness Progress Bar */}
        <div className="radar-readiness-wrap">
          <div className="radar-readiness-row">
            <span style={{ color: 'var(--arc-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity style={{ width: '14px', height: '14px', color: '#00E5FF' }} />
              Network Genesis Readiness
            </span>
            <span style={{ color: '#00E5FF', fontWeight: '700' }}>{readinessPercent}% Ready</span>
          </div>
          <div className="radar-progress-track">
            <div
              className="radar-progress-bar"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Ecosystem Pillars */}
      <div className="radar-pillars-grid">
        {[
          {
            icon: Zap,
            title: 'Sub-Second Finality',
            desc: 'Deterministic block execution with sub-400ms consensus finality designed for real-time payments.',
            status: 'Audited & Ready',
            color: '#F59E0B',
          },
          {
            icon: ShieldCheck,
            title: 'Circle CCTP v3',
            desc: 'Native Cross-Chain Transfer Protocol v3 connecting Rialo directly with Ethereum, Solana, and Base.',
            status: 'Active on Testnet',
            color: '#00E5FF',
          },
          {
            icon: Layers,
            title: 'Native Gas Abstraction',
            desc: 'Pay gas in native USDC. Zero need for secondary gas volatility or wrapping friction.',
            status: 'Core Standard',
            color: '#38BDF8',
          },
          {
            icon: Radio,
            title: 'Institutional Gateway',
            desc: 'Direct compliance-friendly settlement rails verified by major global market makers.',
            status: 'Live at Genesis',
            color: '#10B981',
          },
        ].map((item, i) => {
          const IconComponent = item.icon;
          return (
            <div key={i} className="pillar-card-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="pillar-top-row">
                  <div className="pillar-icon-wrap">
                    <IconComponent style={{ width: '20px', height: '20px', color: item.color }} />
                  </div>
                  <span className="pillar-status-chip">
                    {item.status}
                  </span>
                </div>
                <h3 className="pillar-title-text">{item.title}</h3>
                <p className="pillar-desc-text">{item.desc}</p>
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--arc-text-dim)' }}>
                <span>Genesis Release</span>
                <span style={{ color: '#00E5FF', fontWeight: '600' }}>v1.0</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network RPC & Developer Info Card */}
      <div className="radar-rpc-card">
        <div className="rpc-header-row">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#00E5FF' }} />
              Rialo Genesis Network Config
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--arc-text-muted)', margin: '4px 0 0 0' }}>
              Configure your EVM wallet or validator nodes for genesis deployment.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard('https://mainnet.arc.network/rpc')}
            className="card-flip-btn"
            style={{ padding: '8px 16px', borderRadius: '10px', color: '#00E5FF', borderColor: 'rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.08)' }}
          >
            {copiedRpc ? <Check style={{ width: '14px', height: '14px', color: '#10B981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
            <span>{copiedRpc ? 'Copied to Clipboard' : 'Copy Genesis RPC'}</span>
          </button>
        </div>

        <div className="rpc-config-grid">
          {[
            { label: 'Network Name', value: 'Rialo Mainnet' },
            { label: 'Chain ID', value: '7923' },
            { label: 'Gas Token', value: 'USDC (Native)' },
            { label: 'Genesis Block Target', value: 'Sept 16, 2026' },
          ].map((cfg, idx) => (
            <div key={idx} className="rpc-tile-box">
              <div className="rpc-tile-label">{cfg.label}</div>
              <div className="rpc-tile-value">{cfg.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};