'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, CloudRain, X, Sparkles, Zap, Heart } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';

interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

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
  const [fallingShards, setFallingShards] = useState<FallingShard[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.username) return;

    sound.playTap();
    // Track sent message count for mission verification
    if (typeof window !== 'undefined' && user?.username) {
      const cleanUser = user.username.replace('@', '').toLowerCase();
      const currentSent = parseInt(localStorage.getItem(`rialo_trollbox_sent_${cleanUser}`) || '0') + 1;
      localStorage.setItem(`rialo_trollbox_sent_${cleanUser}`, String(currentSent));
      window.dispatchEvent(new CustomEvent('rialo_trollbox_msg_sent', { detail: { count: currentSent } }));
    }
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: user.username,
      avatar: 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
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
      {/* Falling Rain Shards Animation */}
      {fallingShards.map((s) => (
        <div
          key={s.id}
          onClick={() => handleCatchShard(s.id)}
          style={{
            position: 'fixed',
            top: '-50px',
            left: `${s.x}px`,
            zIndex: 999999,
            cursor: 'pointer',
            fontSize: '28px',
            animation: `fall ${6 / s.speed}s linear forwards`,
            filter: 'drop-shadow(0 0 12px #A9DDD3)',
          }}
          title="Click to Catch +5 Free Shards!"
        >
          💎
        </div>
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0.9; }
        }
      `}</style>

      {/* Floating Toggle Pill Button on Bottom-Right */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 90 }}>
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setIsOpen(true);
            }}
            style={{
              padding: '12px 20px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(8, 16, 14, 0.95) 0%, rgba(4, 8, 7, 0.98) 100%)',
              border: '1.5px solid #A9DDD3',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(169, 221, 211, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <MessageSquare size={16} color="#A9DDD3" />
            <span>Live Trollbox</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#A9DDD3',
                boxShadow: '0 0 8px #A9DDD3',
              }}
            />
          </button>
        )}

        {/* Chat Drawer Window */}
        {isOpen && (
          <div
            style={{
              width: '360px',
              height: '480px',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(10, 16, 14, 0.98) 0%, rgba(4, 7, 6, 0.99) 100%)',
              border: '1.5px solid rgba(169, 221, 211, 0.4)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(169, 221, 211, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideUp 0.25s ease',
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(169, 221, 211, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#A9DDD3',
                    boxShadow: '0 0 8px #A9DDD3',
                  }}
                />
                <span style={{ fontWeight: 900, fontSize: '14px', color: '#E8E3D5' }}>Community <span className="gradient-text-rialo">Trollbox</span></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={triggerShardRain}
                  title="Make It Rain 🌧️ (Costs 25 Shards)"
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(169, 221, 211, 0.16)',
                    border: '1px solid rgba(169, 221, 211, 0.4)',
                    color: '#A9DDD3',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CloudRain size={13} />
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
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 800, fontSize: '11px', color: m.isSystem ? '#A9DDD3' : '#E8E3D5' }}>
                      @{m.sender}
                    </span>
                    <span style={{ fontSize: '9px', color: '#667773', fontFamily: 'var(--font-mono)' }}>{m.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#D4DDD9', lineHeight: 1.35 }}>{m.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '10px 14px',
                borderTop: '1px solid rgba(169, 221, 211, 0.15)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(0,0,0,0.5)',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Broadcast to community..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(169, 221, 211, 0.25)',
                  borderRadius: '9999px',
                  padding: '8px 14px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#A9DDD3',
                  border: 'none',
                  color: '#010101',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
