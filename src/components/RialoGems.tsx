'use client';

import React, { useEffect, useState } from 'react';

interface GemContributor {
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  bio: string;
  followers: number;
  following: number;
  joined: string;
  rialo_score: string;
  verified: boolean;
}

function formatStatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export const RialoGems: React.FC = () => {
  const [gems, setGems] = useState<GemContributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gems')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.projects) {
          setGems(data.projects);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '480px', height: 'calc(100dvh - 170px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#ffffff', fontSize: '26px', fontWeight: '700' }}>
          💎 Rialo Gems
        </h2>
        <p style={{ color: 'var(--rialo-text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Top ecosystem voices, builders, and researchers on Rialo Network.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div className="loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      ) : (
        <div className="scrollbar-hide" style={{ overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
          {gems.map((gem) => (
            <div
              key={gem.handle}
              style={{
                background: 'rgba(12, 12, 12, 0.88)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--rialo-border)',
                marginBottom: '14px',
              }}
            >
              <div style={{ height: '52px', background: 'linear-gradient(135deg, #111111, #0d8270)', borderBottom: '1px solid var(--rialo-border)' }} />
              <div style={{ padding: '0 18px 18px 18px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-26px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid #010101', overflow: 'hidden', background: '#222' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gem.avatar} alt={gem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <a
                    href={`https://x.com/${gem.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--rialo-accent)',
                      color: '#010101',
                      textDecoration: 'none',
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    Follow
                  </a>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>{gem.name}</span>
                    <span style={{ marginLeft: 'auto', background: 'var(--rialo-accent-dim)', color: 'var(--rialo-accent)', fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '9999px' }}>
                      Rialo Rank {gem.rialo_score}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--rialo-text-dim)' }}>@{gem.handle}</p>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--rialo-text)', marginTop: '8px', lineHeight: '1.45' }}>
                  {gem.bio}
                </p>

                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--rialo-text-muted)' }}>
                  <span><strong style={{ color: '#ffffff' }}>{formatStatNumber(gem.following)}</strong> Following</span>
                  <span><strong style={{ color: '#ffffff' }}>{formatStatNumber(gem.followers)}</strong> Followers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
