'use client';

import React, { useState } from 'react';

interface RialoPost {
  id: string;
  screen_name: string;
  created_at: string;
  views: number;
  likes: number;
  reposts: number;
  replies: number;
  text: string;
  author_name: string;
  author_avatar: string;
  author_verified?: boolean;
  url: string;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const SAMPLE_HANDLES = ['RialoHQ', 'yournahian', 'VitalikButerin'];

export const TopRialoPosts: React.FC = () => {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<RialoPost[]>([]);
  const [searchedUser, setSearchedUser] = useState('');

  const fetchTopPosts = async (targetHandle: string) => {
    const clean = targetHandle.trim().replace(/^@/, '');
    if (!clean) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/impressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: clean }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to fetch posts');
        return;
      }

      const allPosts: RialoPost[] = data.posts || [];
      const sorted = allPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
      setPosts(sorted);
      setSearchedUser(data.profile?.screen_name || clean);
      if (sorted.length === 0) {
        setError(`No Rialo posts detected for @${clean}. Try another handle.`);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load Rialo posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTopPosts(handle);
  };

  return (
    <div style={{ width: '100%', maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#ffffff', fontSize: '28px', fontWeight: '700' }}>
          🌟 Best Posts About Rialo
        </h2>
        <p style={{ color: 'var(--rialo-text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Discover the highest-impact tweets and community discussions for rialo.io.
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-form" style={{ marginBottom: '14px' }}>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter an X username (e.g. RialoHQ)"
          className="pow-input"
        />
        {handle.trim() && (
          <button type="submit" className="submit-btn" aria-label="Search Top Posts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </button>
        )}
      </form>

      {posts.length === 0 && !loading && (
        <div className="sample-handles" style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', color: 'var(--rialo-text-muted)', fontWeight: '600', marginRight: '4px' }}>
            Quick Try:
          </span>
          {SAMPLE_HANDLES.map((h) => (
            <button
              key={h}
              type="button"
              className="sample-chip"
              onClick={() => {
                setHandle(h);
                fetchTopPosts(h);
              }}
            >
              @{h}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
          <div className="loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      )}

      {error && <p style={{ color: '#f87171', textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>{error}</p>}

      {!loading && posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.slice(0, 8).map((post, idx) => (
            <div
              key={post.id || idx}
              style={{
                background: 'rgba(12, 12, 12, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: idx === 0 ? '1px solid var(--rialo-border-glow)' : '1px solid var(--rialo-border)',
                padding: '20px',
                boxShadow: idx === 0 ? '0 12px 32px var(--rialo-glow)' : '0 8px 24px rgba(0,0,0,0.4)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', background: '#222' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#ffffff' }}>{post.author_name}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--rialo-text-dim)' }}>@{post.screen_name}</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--rialo-text)', lineHeight: '1.5', whiteSpace: 'pre-line', marginBottom: '14px' }}>
                {post.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--rialo-border)', paddingTop: '12px', fontSize: '12px', color: 'var(--rialo-text-dim)' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: 'var(--rialo-accent)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>👁️ {post.views.toLocaleString()} views</span>
                  <span>❤️ {post.likes} likes</span>
                  <span>💬 {post.replies} replies</span>
                </div>
                <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rialo-accent)', fontWeight: '700', textDecoration: 'none' }}>
                  Open on X →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
