'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, CloudRain, X, Sparkles, Zap, Heart, Radio } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile, ChatMessage } from '@/lib/types';

interface FallingShard {
  id: number;
  x: number;
  speed: number;
  delay: number;
  size: number;
}

interface TrollboxChatProps {
  user: UserProfile | null;
  currentUsername?: string;
  onUserUpdate?: (u: UserProfile) => void;
}


function formatMessageLocalTime(m: ChatMessage): string {
  if (m.createdAt) {
    try {
      const d = new Date(m.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {}
  }
  return m.time || '';
}

export const TrollboxChat: React.FC<TrollboxChatProps> = ({
  user,
  currentUsername,
  onUserUpdate,
}) => {
  const activeUsername = (
    user?.username ||
    currentUsername ||
    (typeof window !== 'undefined' ? localStorage.getItem('rialo_active_user') || '' : '')
  ).replace(/^@/, '').trim();
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
  const [caughtToast, setCaughtToast] = useState<{ id: number; x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingMessagesRef = useRef<Map<string, ChatMessage>>(new Map());
  const isInitialLoadRef = useRef(true);
  const processedRainIdsRef = useRef<Set<string>>(new Set());

  // Trigger falling diamond rain across the screen
  const spawnRain = () => {
    sound.playRainChime();
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const newShards: FallingShard[] = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: Math.random() * (screenW - 100) + 30,
      speed: Math.random() * 1.8 + 3.2,
      delay: Math.random() * 2.5,
      size: Math.floor(Math.random() * 12) + 28,
    }));
    setFallingShards(newShards);
    setTimeout(() => {
      setFallingShards([]);
    }, 10000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync messages globally from /api/trollbox without dropping pending local messages
  const fetchGlobalMessages = async () => {
    try {
      const res = await fetch('/api/trollbox');
      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(() => {
          const serverMessages: ChatMessage[] = data.messages;
          const serverIds = new Set(serverMessages.map((m) => m.id));
          const serverSignatures = new Set(
            serverMessages.map((m) => `${m.sender.toLowerCase().trim()}:${m.text.trim()}`)
          );

          // Clean up pending messages that have now been confirmed by the server
          pendingMessagesRef.current.forEach((pendingMsg, id) => {
            if (
              serverIds.has(id) ||
              serverSignatures.has(`${pendingMsg.sender.toLowerCase().trim()}:${pendingMsg.text.trim()}`)
            ) {
              pendingMessagesRef.current.delete(id);
            }
          });

          // Keep any optimistic messages that the server hasn't saved or returned yet
          const stillPending = Array.from(pendingMessagesRef.current.values());
          const combined = [...serverMessages];
          stillPending.forEach((p) => {
            if (!serverIds.has(p.id)) {
              combined.push(p);
            }
          });

          // Check for incoming global rain events across the community!
          const rainMessages = serverMessages.filter(
            (m) => m.sender === 'SHARD RAIN 🌧️' || (m.isSystem && m.text && m.text.includes('made it rain'))
          );

          if (isInitialLoadRef.current) {
            // First load: record existing rain messages so old history doesn't replay
            rainMessages.forEach((rm) => processedRainIdsRef.current.add(rm.id));
            isInitialLoadRef.current = false;
          } else {
            // On live polling updates: if new rain message arrives AND Trollbox is open -> RAIN!
            rainMessages.forEach((rm) => {
              if (!processedRainIdsRef.current.has(rm.id)) {
                processedRainIdsRef.current.add(rm.id);
                // "jade sudu trollbox open thakbe rain sudu tader sreen ei porbe"
                if (isOpen) {
                  spawnRain();
                }
              }
            });
          }

          return combined;
        });
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
    // If trollbox is closed, stop/clear any falling shards
    if (!isOpen && fallingShards.length > 0) {
      setFallingShards([]);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveSender = activeUsername;
    if (!input.trim() || !effectiveSender || isSending) return;

    const trimmedText = input.trim();
    setInput('');
    sound.playTap();

    // Track sent message count for mission verification & profile achievements
    if (typeof window !== 'undefined') {
      const cleanUser = effectiveSender.toLowerCase();
      const currentSent = parseInt(localStorage.getItem(`rialo_trollbox_sent_${cleanUser}`) || '0') + 1;
      localStorage.setItem(`rialo_trollbox_sent_${cleanUser}`, String(currentSent));
      window.dispatchEvent(new CustomEvent('rialo_trollbox_msg_sent', { detail: { count: currentSent } }));
    }

    const tempId = 'temp-' + Date.now();
    const now = new Date();
    const tempMsg: ChatMessage = {
      id: tempId,
      sender: effectiveSender,
      avatar: `https://unavatar.io/x/${effectiveSender}`,
      text: trimmedText,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString(),
    };

    // Optimistic UI update - save to pending ref so polls never wipe it out!
    pendingMessagesRef.current.set(tempId, tempMsg);
    setMessages((prev) => [...prev, tempMsg]);

    try {
      setIsSending(true);
      const res = await fetch('/api/trollbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: effectiveSender,
          text: trimmedText,
          avatar: `https://unavatar.io/x/${effectiveSender}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        pendingMessagesRef.current.delete(tempId);
        setMessages((prev) => {
          const alreadyExists = prev.some((m) => m.id === data.message.id);
          if (alreadyExists) {
            return prev.filter((m) => m.id !== tempId);
          }
          return prev.map((m) => (m.id === tempId ? data.message : m));
        });
      }
    } catch (err) {
      console.error('Failed to broadcast global message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const triggerShardRain = async () => {
    const sender = activeUsername;
    if (!sender) return;
    if ((user?.shards || 0) < 25) {
      alert('You need at least 25 Shards to trigger a Community Shard Rain!');
      return;
    }

    // Optimistically deduct 25 shards immediately so UI reflects it
    if (user && onUserUpdate) {
      onUserUpdate({
        ...user,
        shards: Math.max(0, (user.shards || 0) - 25),
      });
    }

    // Spawn rain on sender screen immediately if Trollbox is open
    if (isOpen) {
      spawnRain();
    }

    try {
      const res = await fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SHARD_RAIN', username: sender }),
      });
      const data = await res.json();
      if (data.success && data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
    } catch (e) {
      console.error(e);
    }

    // Broadcast Shard Rain globally to Trollbox so other users with Trollbox open get rain!
    try {
      const bcastRes = await fetch('/api/trollbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'SHARD RAIN 🌧️',
          avatar: 'https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg',
          text: `🌊 @${sender} made it rain! Free shards are falling on screen! Click them to catch!`,
          isSystem: true,
        }),
      });
      const bcastData = await bcastRes.json();
      if (bcastData.success && bcastData.message) {
        processedRainIdsRef.current.add(bcastData.message.id);
      }
    } catch (e) {}
  };

  const handleCatchShard = (id: number, e?: React.PointerEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      setCaughtToast({ id, x: e.clientX, y: e.clientY });
      setTimeout(() => setCaughtToast(null), 1200);
    }

    sound.playPickup();
    setFallingShards((prev) => prev.filter((s) => s.id !== id));

    const catcher = activeUsername;
    if (catcher) {
      // Immediate optimistic update: +15 Shards to local user state so header & badge update instantly!
      if (user && onUserUpdate) {
        onUserUpdate({
          ...user,
          shards: (user.shards || 0) + 15,
          lifetimePoints: (user.lifetimePoints || 0) + 15,
        });
      }

      fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CATCH_RAIN_SHARD', username: catcher }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user && onUserUpdate) {
            onUserUpdate(data.user);
          }
        })
        .catch(console.error);
    }
  };

  return (
    <>
      {/* Falling Shards Overlay - ONLY rendered when Trollbox is OPEN! */}
      {isOpen && fallingShards.map((s) => (
        <div
          key={s.id}
          onPointerDown={(e) => handleCatchShard(s.id, e)}
          className="shard-falling-item"
          style={{
            left: `${s.x}px`,
            fontSize: `${s.size}px`,
            animation: `shardFall ${s.speed}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${s.delay}s forwards`,
          }}
          title="Click to catch +15 free shards!"
        >
          💎
        </div>
      ))}
      {isOpen && caughtToast && (
        <div
          style={{
            position: 'fixed',
            left: `${caughtToast.x}px`,
            top: `${caughtToast.y - 20}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999999,
            background: 'rgba(8, 12, 10, 0.95)',
            border: '1.5px solid #A9DDD3',
            color: '#A9DDD3',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 0 20px rgba(169, 221, 211, 0.5)',
            pointerEvents: 'none',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          +15 SHARDS! 💎
        </div>
      )}

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
              width: '390px',
              maxWidth: 'calc(100vw - 28px)',
              height: '550px',
              maxHeight: 'calc(100vh - 100px)',
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
                padding: '13px 16px',
                borderBottom: '1px solid rgba(169, 221, 211, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(169, 221, 211, 0.04)',
                gap: '8px',
              }}
            >
              {/* Left Title & Live Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
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
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={16} color="#A9DDD3" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 900, fontSize: '13.5px', color: '#E8E3D5', letterSpacing: '-0.01em' }}>
                      Community <span className="gradient-text-rialo">Trollbox</span>
                    </span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10B981',
                        boxShadow: '0 0 8px #10B981',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#8E9B97', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginTop: '1px' }}>
                    <span>Global Realtime Feed</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>Live Sync</span>
                  </div>
                </div>
              </div>

              {/* Right Action Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {/* Live Shard Counter */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    background: 'rgba(169, 221, 211, 0.1)',
                    border: '1px solid rgba(169, 221, 211, 0.28)',
                    borderRadius: '9999px',
                    color: '#A9DDD3',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                  }}
                  title="Your Shard Balance"
                >
                  <span style={{ fontSize: '11px' }}>💎</span>
                  <span>{user?.shards ?? 100}</span>
                </div>

                {/* Shard Rain Button */}
                <button
                  type="button"
                  onClick={triggerShardRain}
                  title="Make it rain shards for all players! (Costs 25 Shards)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 9px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.5)',
                    borderRadius: '9999px',
                    color: '#00F0FF',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <CloudRain size={12} />
                  <span>Rain</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setIsOpen(false);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#8E9B97',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.color = '#EF4444';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#8E9B97';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  title="Close Trollbox"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Messages Body with Sleek Custom Scrollbar */}
            <div
              className="trollbox-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {messages.map((m) => {
                const isRain = m.sender === 'SHARD RAIN 🌧️' || (m.isSystem && m.text && m.text.includes('made it rain'));
                const isSelf = Boolean(activeUsername && m.sender.toLowerCase().trim() === activeUsername.toLowerCase().trim());

                return (
                  <div
                    key={m.id}
                    style={{
                      background: isRain
                        ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.09) 0%, rgba(168, 85, 247, 0.14) 100%)'
                        : isSelf
                        ? 'linear-gradient(135deg, rgba(169, 221, 211, 0.09) 0%, rgba(169, 221, 211, 0.03) 100%)'
                        : m.isSystem
                        ? 'rgba(169, 221, 211, 0.06)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isRain
                        ? '1px solid rgba(0, 240, 255, 0.38)'
                        : isSelf
                        ? '1px solid rgba(169, 221, 211, 0.28)'
                        : m.isSystem
                        ? '1px solid rgba(169, 221, 211, 0.22)'
                        : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '13px',
                      padding: '9px 12px',
                      boxShadow: isRain ? '0 4px 16px rgba(0, 240, 255, 0.08)' : 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        {isRain ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '13px' }}>🌧️</span>
                            <span style={{ fontWeight: 900, fontSize: '11px', color: '#00F0FF', letterSpacing: '0.04em' }}>
                              SHARD RAIN
                            </span>
                          </div>
                        ) : !m.isSystem ? (
                          <>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: isSelf ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.2)',
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
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: '11.5px',
                                color: isSelf ? '#A9DDD3' : '#E8E3D5',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              @{m.sender}
                            </span>
                            {isSelf && (
                              <span
                                style={{
                                  fontSize: '8.5px',
                                  fontWeight: 900,
                                  background: '#A9DDD3',
                                  color: '#010101',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  lineHeight: 1.2,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                YOU
                              </span>
                            )}
                          </>
                        ) : (
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '11px',
                              color: '#A9DDD3',
                            }}
                          >
                            {m.sender}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '9.5px', color: '#7E8B87', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                        {formatMessageLocalTime(m)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: isRain ? '#E0F2FE' : '#D4DDD9',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.text}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '10px 12px',
                borderTop: '1px solid rgba(169, 221, 211, 0.15)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(2, 6, 5, 0.95)',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                placeholder="Broadcast message to everyone..."
                disabled={!activeUsername || isSending}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(169, 221, 211, 0.25)',
                  borderRadius: '12px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#A9DDD3';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(169, 221, 211, 0.25)';
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || !activeUsername || isSending}
                style={{
                  background: input.trim() && activeUsername && !isSending
                    ? 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: '#010101',
                  border: 'none',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && activeUsername && !isSending ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: input.trim() && activeUsername && !isSending ? '0 0 12px rgba(169, 221, 211, 0.4)' : 'none',
                }}
              >
                <Send size={15} color={input.trim() && activeUsername && !isSending ? '#010101' : '#667773'} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
