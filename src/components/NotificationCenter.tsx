"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Radio, Gift, ArrowRight, X, Sparkles, CheckCircle2, MessageSquare, Repeat } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { BroadcastEvent, GiftCardLog, TradeOffer } from '@/lib/types';

export interface NotificationItem {
  id: string;
  type: 'broadcast' | 'mission' | 'gift' | 'trade';
  title: string;
  message: string;
  time: string;
  icon: string;
  read: boolean;
  actionTab?: string;
  actionText?: string;
  data?: any;
}

interface NotificationCenterProps {
  currentUsername: string;
  onSelectTab: (tab: any) => void;
  onOpenTrollbox?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUsername,
  onSelectTab,
  onOpenTrollbox,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'missions' | 'trades' | 'gifts'>('all');
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  // Load read status from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`rialo_read_notifs_${currentUsername}`);
        if (saved) setReadIds(JSON.parse(saved));
      } catch (_) {}
    }
  }, [currentUsername]);

  const saveReadStatus = (newRead: Record<string, boolean>) => {
    setReadIds(newRead);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`rialo_read_notifs_${currentUsername}`, JSON.stringify(newRead));
    }
  };

  // Fetch broadcasts, gifts, and trades to synthesize notifications
  const fetchNotifications = async () => {
    try {
      const items: NotificationItem[] = [];
      const userHandle = currentUsername.toLowerCase().replace('@', '').trim();

      // 1. Fetch Broadcasts
      const bRes = await fetch('/api/admin/broadcast');
      const bData = await bRes.json();
      if (bData.success && Array.isArray(bData.broadcasts)) {
        bData.broadcasts.forEach((b: BroadcastEvent) => {
          const rec = (b.recipient || '').toLowerCase().replace('@', '').trim();
          if (rec === 'all' || rec === 'all players' || rec === userHandle) {
            const isMission = b.broadcastType === 'mission';
            const isNotice = b.broadcastType === 'system_notice';
            let notifTitle = `🏆 Protocol Achievement: ${b.title}`;
            let actionText = 'Inspect in Trophy Cabinet';
            if (isMission) {
              notifTitle = `🎯 New Mission: ${b.title}`;
              actionText = 'View & Complete Mission';
            } else if (isNotice) {
              const prefix = b.noticeSeverity === 'announcement' ? '📢 Announcement'
                : b.noticeSeverity === 'update' ? '🚀 Platform Update'
                : b.noticeSeverity === 'feature_guide' ? '📖 Guide'
                : b.noticeSeverity === 'event' ? '🎁 Event'
                : b.noticeSeverity === 'maintenance' ? '⚠️ Maintenance'
                : '📢 Notice';
              notifTitle = `${prefix}: ${b.title}`;
              actionText = 'Read Notice in Profile';
            }

            items.push({
              id: 'notif-' + b.id,
              type: isMission ? 'mission' : 'broadcast',
              title: notifTitle,
              message: b.message ? `"${b.message}"${b.shardsReward > 0 ? ` (+${b.shardsReward} Shards Drop)` : ''}` : b.desc,
              time: formatRelativeTime(b.createdAt),
              icon: b.icon || (isMission ? '🎯' : isNotice ? '📢' : '🏆'),
              read: false,
              actionTab: 'profile',
              actionText: actionText,
              data: b,
            });
          }
        });
      }

      // 2. Fetch User Gift Logs
      try {
        const gRes = await fetch(`/api/admin/gift-card?key=rialo-admin-2026&limit=30`);
        const gData = await gRes.json();
        const logs = gData.giftLogs || gData.logs || [];
        if (Array.isArray(logs)) {
          logs.forEach((g: GiftCardLog) => {
            if (g.username.toLowerCase().replace('@', '') === userHandle) {
              const isClaimed = Boolean(g.claimed);
              items.push({
                id: 'notif-gift-' + g.id,
                type: 'gift',
                title: isClaimed ? `✅ Card Gift Revealed: ${g.cardTitle}` : `🎁 Card Gift Airdrop: ${g.quantity}x ${g.cardTitle}`,
                message: isClaimed
                  ? `Claimed and revealed ${g.quantity}x ${g.cardTitle} (${g.cardRarity}) into your Season 1 Binder.`
                  : `You received ${g.quantity > 1 ? `${g.quantity} cards` : 'a card'} gift for your contribution on "${g.reason || 'Platform Contribution'}". Open Daily Tasks to reveal!`,
                time: formatRelativeTime(g.timestamp),
                icon: isClaimed ? '✅' : '🎁',
                read: isClaimed,
                actionTab: isClaimed ? 'binder' : 'missions',
                actionText: isClaimed ? 'View in Binder' : 'Claim & Reveal in Missions ➔',
                data: g,
              });
            }
          });
        }
      } catch (_) {}

      // 3. Static Welcome System Notification
      items.push({
        id: 'notif-sys-welcome',
        type: 'broadcast',
        title: '⚡ Welcome to RialoTrace Testnet Wave 1',
        message: 'Your cryptographic identity is active. Daily tasks, P2P card binder, and The Forge are online.',
        time: 'Active',
        icon: '⚡',
        read: false,
        actionTab: 'proof',
        actionText: 'Open Daily Quests',
      });

      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUsername]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return 'Recent';
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch (_) {
      return 'Recent';
    }
  };

  const unreadCount = notifications.filter((n) => !readIds[n.id]).length;

  const handleMarkAllRead = () => {
    sound.playTap();
    const newRead: Record<string, boolean> = { ...readIds };
    notifications.forEach((n) => {
      newRead[n.id] = true;
    });
    saveReadStatus(newRead);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    sound.playTap();
    saveReadStatus({ ...readIds, [item.id]: true });
    if (item.actionTab) {
      onSelectTab(item.actionTab);
    }
    setIsOpen(false);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'missions') return n.type === 'mission';
    if (activeFilter === 'trades') return n.type === 'trade';
    if (activeFilter === 'gifts') return n.type === 'gift';
    return true;
  });

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          sound.playTap();
          setIsOpen(!isOpen);
        }}
        title="Protocol Notifications & Broadcasts"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: isOpen ? 'rgba(169, 221, 211, 0.2)' : 'rgba(6, 10, 10, 0.92)',
          border: isOpen ? '1.5px solid #A9DDD3' : '1px solid rgba(169, 221, 211, 0.35)',
          color: isOpen ? '#A9DDD3' : '#E8E3D5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen ? '0 0 15px rgba(169, 221, 211, 0.4)' : '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9999px',
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop to prevent off-screen or stuck state */}
      {isOpen && (
        <div
          className="notification-mobile-backdrop"
          onClick={() => {
            sound.playTap();
            setIsOpen(false);
          }}
        />
      )}

      {/* Floating Dropdown Panel (Desktop anchored / Mobile fixed centered) */}
      {isOpen && (
        <div
          className="notification-dropdown-panel"
          style={{
            background: 'rgba(6, 10, 14, 0.98)',
            border: '1.5px solid rgba(169, 221, 211, 0.35)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(169, 221, 211, 0.15)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#A9DDD3" />
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#FFFFFF' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background: 'rgba(169, 221, 211, 0.15)',
                    color: '#A9DDD3',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(169, 221, 211, 0.3)',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8E9B97',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px',
                }}
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'missions', label: '🎯 Missions' },
              { id: 'gifts', label: '🎁 Gifts' },
              { id: 'trades', label: '🔄 Trades' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setActiveFilter(f.id as any);
                }}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: activeFilter === f.id ? '#A9DDD3' : 'rgba(255,255,255,0.04)',
                  color: activeFilter === f.id ? '#010101' : '#8E9B97',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '10px' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#8E9B97' }}>
                <Sparkles size={24} color="#A9DDD3" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#E8E3D5' }}>All Caught Up!</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>No unread protocol notifications found.</div>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isRead = !!readIds[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      marginBottom: '8px',
                      background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(169, 221, 211, 0.08)',
                      border: isRead ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(169, 221, 211, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'rgba(169, 221, 211, 0.15)',
                        border: '1px solid rgba(169, 221, 211, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: isRead ? '#E8E3D5' : '#FFFFFF' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '10px', color: '#8E9B97', fontFamily: 'var(--font-mono)' }}>
                          {item.time}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '11px',
                          color: 'rgba(232, 227, 213, 0.75)',
                          margin: '4px 0 6px',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.message}
                      </p>

                      {item.actionText && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#A9DDD3',
                          }}
                        >
                          {item.actionText} <ArrowRight size={10} />
                        </div>
                      )}
                    </div>

                    {!isRead && (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#A9DDD3',
                          boxShadow: '0 0 6px #A9DDD3',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
