'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, CloudRain, X, Sparkles, Zap, Heart, Radio } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile, ChatMessage } from '@/lib/types';

interface FallingShard {
  id: number;
  x: number;
  speed: number;
}

export const TrollboxChat: React.FC<{ user: UserProfile | null; onUserUpdate?: (u: UserProfile) => void }> = ({
  user,
  onUserUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Protocol Bot',
      text: '⚡ Zero-Friction Testnet Wave 1 is active. 30 daily missions loaded.',
      time: '16:20',
      isSystem: true,
    },
    {
      id: '2',
      sender: 'Community Beacon',
      text: '💬 Live Trollbox Channel is online. Share alpha, trade offers, and chat with fellow questers.',
      time: '12:01',
      isSystem: true,
    },
  ]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [fallingShards, setFallingShards] = useState<FallingShard[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync messages globally from /api/trollbox
  const fetchGlobalMessages = async () => {
    try {
      const res = await fetch('/api/trollbox');
      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to sync global trollbox:', err);
    }
  };

  useEffect(() => {
    fetchGlobalMessages();
    const intervalTime = isOpen ? 2500 : 6000;
    const interval = setInterval(fetchGlobalMessages, intervalTime);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.username || isSending) return;

    const trimmedText = input.trim();
    setInput('');
    sound.playTap();

    // Track sent message count for mission verification & profile achievements
    if (typeof window !== 'undefined' && user?.username) {
      const cleanUser = user.username.replace('@', '').toLowerCase();
      const currentSent = parseInt(localStorage.getItem(`rialo_trollbox_sent_${cleanUser}`) || '0') + 1;
      localStorage.setItem(`rialo_trollbox_sent_${cleanUser}`, String(currentSent));
      window.dispatchEvent(new CustomEvent('rialo_trollbox_msg_sent', { detail: { count: currentSent } }));
    }

    const tempId = 'temp-' + Date.now();
    const tempMsg: ChatMessage = {
      id: tempId,
      sender: user.username,
      avatar: `https://unavatar.io/x/${user.username}`,
      text: trimmedText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, tempMsg]);

    try {
      setIsSending(true);
      const res = await fetch('/api/trollbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: user.username,
          text: trimmedText,
          avatar: `https://unavatar.io/x/${user.username}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
      }
    } catch (err) {
      console.error('Failed to broadcast global message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const triggerShardRain = async () => {
    if (!user?.username) return;
    if ((user.shards || 0) < 25) {
      alert('You need at least 25 Shards to trigger a Community Shard Rain!');
      return;
    }

    sound.playRainChime();

    try {
      const res = await fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SHARD_RAIN', username: user.username }),
      });
      const data = await res.json();
      if (data.success && data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
    } catch (e) {
      console.error(e);
    }

    // Broadcast Shard Rain globally to Trollbox so everyone sees it!
    fetch('/api/trollbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'SHARD RAIN 🌧️',
        avatar: 'https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg',
        text: `🌊 @${user.username} made it rain! Free shards are falling on screen! Click them to catch!`,
        isSystem: true,
      }),
    }).catch(() => {});

    // Spawn 14 falling shards on screen
    const newShards = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * (window.innerWidth - 60) + 20,
      speed: Math.random() * 2 + 3,
    }));
    setFallingShards(newShards);

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'SHARD RAIN 🌧️',
        text: `🌊 @${user.username} made it rain! Free shards are falling on screen! Click them to catch!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      },
    ]);

    setTimeout(() => {
      setFallingShards([]);
    }, 9000);
  };

  const handleCatchShard = (id: number) => {
    sound.playPickup();
    setFallingShards((prev) => prev.filter((s) => s.id !== id));

    if (user?.username) {
      fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CATCH_RAIN_SHARD', username: user.username }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user && onUserUpdate) onUserUpdate(data.user);
        })
        .catch(console.error);
    }
  };

  return (
    <>
      {/* Falling Shards Overlay when Rain is triggered */}
      {fallingShards.map((s) => (
        <div
          key={s.id}
          onClick={() => handleCatchShard(s.id)}
          style={{
            position: 'fixed',
            top: 0,
            left: `${s.x}px`,
            zIndex: 999999,
            cursor: 'pointer',
            fontSize: '28px',
            animation: `shardFall 4s linear infinite`,
            userSelect: 'none',
            filter: 'drop-shadow(0 0 10px #A9DDD3)',
          }}
        >
          💎
        </div>
      ))}

      {/* Floating Trollbox Launcher Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
        }}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setIsOpen(true);
            }}
            title="Open Community Live Trollbox"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(14, 22, 20, 0.95) 0%, rgba(6, 12, 10, 0.98) 100%)',
              border: '1.5px solid #A9DDD3',
              borderRadius: '9999px',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(169, 221, 211, 0.35)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(169, 221, 211, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(169, 221, 211, 0.35)';
            }}
          >
            <div style={{ position: 'relative' }}>
              <MessageSquare size={18} color="#A9DDD3" />
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.02em', color: '#E8E3D5' }}>
              Live Trollbox
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                background: 'rgba(169, 221, 211, 0.15)',
                color: '#A9DDD3',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid rgba(169, 221, 211, 0.4)',
              }}
            >
              GLOBAL
            </span>
          </button>
        )}

        {/* Expanded Trollbox Modal Box */}
        {isOpen && (
          <div
            style={{
              width: '360px',
              height: '520px',
              background: 'linear-gradient(180deg, rgba(8, 14, 12, 0.98) 0%, rgba(2, 6, 5, 0.99) 100%)',
              border: '1.5px solid rgba(169, 221, 211, 0.4)',
              borderRadius: '24px',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(169, 221, 211, 0.25)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'trollboxPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Trollbox Header */}
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid rgba(169, 221, 211, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(169, 221, 211, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'rgba(169, 221, 211, 0.15)',
                    border: '1px solid rgba(169, 221, 211, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MessageSquare size={16} color="#A9DDD3" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 900, fontSize: '14px', color: '#E8E3D5' }}>
                      Community <span className="gradient-text-rialo">Trollbox</span>
                    </span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10B981',
                        boxShadow: '0 0 8px #10B981',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#8E9B97', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Global Realtime Feed</span>
                    <span>•</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>Live Sync</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Shard Rain Button */}
                <button
                  type="button"
                  onClick={triggerShardRain}
                  title="Make it rain shards for all players! (Costs 25 Shards)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.5)',
                    borderRadius: '9999px',
                    color: '#00F0FF',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <CloudRain size={12} />
                  <span>Rain</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setIsOpen(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8E9B97',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: m.isSystem ? 'rgba(169, 221, 211, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: m.isSystem ? '1px solid rgba(169, 221, 211, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '14px',
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!m.isSystem && (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '1px solid #A9DDD3',
                            flexShrink: 0,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.avatar || `https://unavatar.io/x/${m.sender}`}
                            alt={m.sender}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png';
                            }}
                          />
                        </div>
                      )}
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '11px',
                          color: m.isSystem ? '#A9DDD3' : '#E8E3D5',
                        }}
                      >
                        {m.isSystem ? m.sender : `@${m.sender}`}
                      </span>
                    </div>
                    <span style={{ fontSize: '9px', color: '#667773', fontFamily: 'var(--font-mono)' }}>
                      {m.time}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#D4DDD9', lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {m.text}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '12px 14px',
                borderTop: '1px solid rgba(169, 221, 211, 0.15)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(0,0,0,0.6)',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                placeholder={user?.username ? 'Broadcast message to everyone...' : 'Enter X handle to chat...'}
                disabled={!user?.username || isSending}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(169, 221, 211, 0.25)',
                  borderRadius: '12px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || !user?.username || isSending}
                style={{
                  background: input.trim() && user?.username && !isSending ? '#A9DDD3' : 'rgba(255, 255, 255, 0.1)',
                  color: '#010101',
                  border: 'none',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && user?.username && !isSending ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={15} color={input.trim() && user?.username && !isSending ? '#010101' : '#666'} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
