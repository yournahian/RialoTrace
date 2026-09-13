'use client';

import React, { useState } from 'react';
import { generateProofOfWorkPNG } from './CardCanvasExporter';
import { RialoLogo } from './RialoLogo';

interface ProfileData {
  name: string;
  screen_name: string;
  avatar: string;
  verified: boolean;
  followers: number;
}

interface RialoPost {
  id: string;
  screen_name: string;
  created_at: string;
  views: number;
  likes: number;
  reposts: number;
  replies: number;
  text: string;
  url: string;
}

interface ImpressionsResponse {
  ok: boolean;
  profile: ProfileData;
  project: string;
  total_impressions: number;
  post_count: number;
  series: Array<{ t: string; v: number }>;
  posts?: RialoPost[];
  error?: string;
}

const SAMPLE_HANDLES = ['RialoHQ', 'PanteraCapital', 'yournahian'];

export const ProofOfWork: React.FC = () => {
  const [handleInput, setHandleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ImpressionsResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchImpressions = async (usernameToFetch: string) => {
    const trimmed = usernameToFetch.trim().replace(/^@/, '');
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/impressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Failed to fetch Rialo metrics. Please try again.');
        return;
      }

      setData(json);
    } catch (err) {
      console.error(err);
      setError('Unable to reach server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImpressions(handleInput);
  };

  const handleDownloadPNG = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const blob = await generateProofOfWorkPNG({
        name: data.profile.name,
        handle: data.profile.screen_name,
        avatar: data.profile.avatar,
        impressions: data.total_impressions,
        postCount: data.post_count,
        series: data.series,
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.profile.screen_name}-rialo-proof.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = data
    ? encodeURIComponent(
        `I generated ${data.total_impressions.toLocaleString()} impressions contributing to @RialoHQ Network! ⚡️\n\nVerify your Rialo Proof-of-Work: #RialoNetwork #BuildOnRialo`
      )
    : '';

  const renderSparkline = () => {
    if (!data || !data.series || data.series.length < 2) return null;

    const width = 440;
    const height = 90;
    const padding = 2;
    const values = data.series.map((p) => p.v);
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = data.series.map((p, i) => {
      const x = padding + (i / (data.series.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p.v - min) / range) * (height - padding * 2 - 10) - 6;
      return [x, y] as [number, number];
    });

    const pathD = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ');

    const areaD = `${pathD} L ${width - padding} ${height} L ${padding} ${height} Z`;
    const [lastX, lastY] = points[points.length - 1];

    return (
      <div className="sparkline-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="rialo-spark-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d8270" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0d8270" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#rialo-spark-grad)" />
          <path
            d={pathD}
            fill="none"
            stroke="#0d8270"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastY} r="4" fill="#0d8270" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  const formatDateMonthYear = (dStr?: string) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const bestPost = data?.posts && data.posts.length > 0
    ? [...data.posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    : null;

  return (
    <div className="pow-box">
      {!data && !loading && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', color: '#ffffff' }}>
              Rialo Proof of Work
            </h1>
            <p style={{ color: 'var(--rialo-text-muted)', fontSize: '14px', marginTop: '6px' }}>
              Measure and showcase your social contributions to Rialo Network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              autoFocus
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="Enter your X username"
              className="pow-input"
            />
            {handleInput.trim() && (
              <button type="submit" className="submit-btn" aria-label="Calculate Proof of Work">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </button>
            )}
          </form>

          {error && (
            <p style={{ color: '#f87171', marginTop: '12px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <div className="sample-handles">
            <span style={{ fontSize: '11px', color: 'var(--rialo-text-muted)', fontWeight: '600', marginRight: '4px' }}>
              Quick Try:
            </span>
            {SAMPLE_HANDLES.map((h) => (
              <button
                key={h}
                type="button"
                className="sample-chip"
                onClick={() => {
                  setHandleInput(h);
                  fetchImpressions(h);
                }}
              >
                @{h}
              </button>
            ))}
          </div>
        </>
      )}

      {loading && (
        <div
          style={{
            background: 'rgba(12, 12, 12, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--rialo-border)',
            borderRadius: '24px',
            padding: '40px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <RialoLogo size={32} />
          </div>
          <div className="loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--rialo-text-muted)', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
            Auditing Rialo Network onchain & social proof...
          </p>
        </div>
      )}

      {data && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="proof-card">
            <div className="proof-card-header">
              <div className="user-profile-meta">
                <div className="avatar-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.profile.avatar}
                    alt={data.profile.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="user-names">
                  <div className="user-display-name">
                    <span>{data.profile.name}</span>
                    {data.profile.verified && (
                      <svg viewBox="0 0 24 24" fill="#1D9BF0" className="verified-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                  </div>
                  <div className="user-handle">@{data.profile.screen_name}</div>
                </div>
              </div>

              <div className="rialo-target-tag">
                <span>RialoHQ</span>
              </div>
            </div>

            <div className="proof-stat-body">
              <div className="impressions-big-num">
                {data.total_impressions.toLocaleString()}
              </div>
              <div className="impressions-caption">
                Impressions generated for RialoHQ
              </div>
            </div>

            {renderSparkline()}

            {data.total_impressions === 0 && (
              <div style={{
                margin: '16px 0',
                padding: '16px',
                background: 'rgba(169, 221, 211, 0.05)',
                border: '1px dashed rgba(169, 221, 211, 0.3)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--rialo-accent)', marginBottom: '4px' }}>
                  No Rialo contributions indexed yet
                </div>
                <div style={{ fontSize: '12px', color: 'var(--rialo-text-muted)', lineHeight: '1.4' }}>
                  Tweet mentioning <strong style={{ color: 'var(--rialo-text)' }}>@RialoHQ</strong> or <strong style={{ color: 'var(--rialo-text)' }}>#rialo</strong> on X to start earning indexed Proof of Work!
                </div>
              </div>
            )}

            <div className="proof-date-footer">
              <span>
                {data.series && data.series.length > 0 ? `${formatDateMonthYear(data.series[0]?.t)} – ${formatDateMonthYear(data.series[data.series.length - 1]?.t)}` : 'Rialo Index'}
              </span>
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={downloading}
                className="download-icon-btn"
                title="Download Badge PNG"
                aria-label="Download Badge PNG"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>

            <div className="proof-actions">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card-action-btn share"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share to X
              </a>

              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={downloading}
                className="card-action-btn download"
              >
                {downloading ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download Card</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setData(null);
                  setHandleInput('');
                }}
                className="card-action-btn retry"
                title="Audit another username"
                aria-label="Audit another username"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>
          </div>

          {bestPost && (
            <div
              style={{
                background: 'rgba(12, 12, 12, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid var(--rialo-border-glow)',
                padding: '18px 20px',
                boxShadow: '0 10px 30px var(--rialo-glow)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: 'var(--rialo-accent-dim)',
                      border: '1px solid rgba(169, 221, 211, 0.35)',
                      color: 'var(--rialo-accent)',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    🏆 Best Post About Rialo
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--rialo-accent)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                    👁️ {bestPost.views.toLocaleString()} views
                  </span>
                </div>

                <a
                  href={bestPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--rialo-accent)',
                    fontSize: '12px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View on X</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="12" height="12">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--rialo-text)', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                {bestPost.text}
              </p>

              <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '11px', color: 'var(--rialo-text-dim)' }}>
                <span>❤️ {bestPost.likes} likes</span>
                <span>💬 {bestPost.replies} replies</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
