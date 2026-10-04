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
    const tempMsg: ChatMessage = {
      id: tempId,
      sender: effectiveSender,
      avatar: `https://unavatar.io/x/${effectiveSender}`,
      text: trimmedText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
                {/* Live Shard Counter */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: 'rgba(169, 221, 211, 0.1)',
                    border: '1px solid rgba(169, 221, 211, 0.25)',
                    borderRadius: '9999px',
                    color: '#A9DDD3',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                  }}
                  title="Your Shard Balance"
                >
                  <span>💎</span>
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
                placeholder="Broadcast message to everyone..."
                disabled={!activeUsername || isSending}
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
                disabled={!input.trim() || !activeUsername || isSending}
                style={{
                  background: input.trim() && activeUsername && !isSending ? '#A9DDD3' : 'rgba(255, 255, 255, 0.1)',
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
