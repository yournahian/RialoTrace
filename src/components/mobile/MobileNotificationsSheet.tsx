'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Sparkles, Check, Gift, ArrowRight } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { NotificationItem } from '../NotificationCenter';
import { BroadcastEvent, GiftCardLog } from '@/lib/types';

interface MobileNotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onSelectTab: (tab: any) => void;
}

export const MobileNotificationsSheet: React.FC<MobileNotificationsSheetProps> = ({
  isOpen,
  onClose,
  currentUsername,
  onSelectTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'missions' | 'gifts'>('all');

  const fetchNotifs = async () => {
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
            items.push({
              id: 'notif-' + b.id,
              type: isMission ? 'mission' : 'broadcast',
              title: isMission ? `🎯 Mission: ${b.title}` : `📢 Notice: ${b.title}`,
              message: b.message || b.desc || '',
              time: 'Recent',
              icon: isMission ? '🎯' : '📢',
              read: false,
              actionTab: isMission ? 'missions' : 'profile',
              actionText: isMission ? 'View Mission' : 'Read Notice',
            });
          }
        });
      }

      // 2. Fetch Gifts
      try {
        const gRes = await fetch(`/api/admin/gift-card?key=rialo-admin-2026&limit=20`);
        const gData = await gRes.json();
        const logs = gData.giftLogs || gData.logs || [];
        if (Array.isArray(logs)) {
          logs.forEach((g: GiftCardLog) => {
            if (g.username.toLowerCase().replace('@', '') === userHandle) {
              const isClaimed = Boolean(g.claimed);
              items.push({
                id: 'notif-gift-' + g.id,
                type: 'gift',
                title: isClaimed ? `✅ Card Revealed: ${g.cardTitle}` : `🎁 Card Gift: ${g.quantity}x ${g.cardTitle}`,
                message: `Reward on "${g.reason || 'Platform Contribution'}".`,
                time: 'Recent',
                icon: isClaimed ? '✅' : '🎁',
                read: isClaimed,
                actionTab: isClaimed ? 'binder' : 'missions',
                actionText: isClaimed ? 'Open Binder' : 'Claim in Quests',
              });
            }
          });
        }
      } catch (_) {}

      // 3. Welcome
      items.push({
        id: 'notif-welcome',
        type: 'broadcast',
        title: '⚡ RialoTrace Wave 1 Active',
        message: 'Cryptographic identity online. Daily quests, card binder, and forge are live.',
        time: 'Active',
        icon: '⚡',
        read: false,
        actionTab: 'proof',
        actionText: 'Open PoW',
      });

      setNotifications(items);
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) fetchNotifs();
  }, [isOpen, currentUsername]);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'missions') return n.type === 'mission';
    if (activeFilter === 'gifts') return n.type === 'gift';
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Blurred Backdrop */}
      <div
        onClick={() => {
          sound.playTap();
          onClose();
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Sheet Content Box */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxHeight: '82vh',
          background: 'linear-gradient(180deg, #091210 0%, #030706 100%)',
          borderTop: '1.5px solid rgba(169, 221, 211, 0.35)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(169, 221, 211, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Pull Handle */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.25)',
            margin: '10px auto 4px auto',
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(169, 221, 211, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={17} color="#A9DDD3" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              Notifications
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#8E9B97',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            overflowX: 'auto',
          }}
        >
          {(['all', 'missions', 'gifts'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                sound.playTap();
                setActiveFilter(f);
              }}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                background: activeFilter === f ? 'rgba(169, 221, 211, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: activeFilter === f ? '1px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeFilter === f ? '#A9DDD3' : '#8E9B97',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div
          style={{
            padding: '12px 14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: 'calc(82vh - 120px)',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#6B7A75', fontSize: '13px' }}>
              No notifications in this category
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  sound.playTap();
                  if (item.actionTab) {
                    onSelectTab(item.actionTab);
                    onClose();
                  }
                }}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(169, 221, 211, 0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: '10px', color: '#6B7A75', fontFamily: 'var(--font-mono)' }}>
                    {item.time}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#9BAAA6', lineHeight: 1.4 }}>
                  {item.message}
                </div>
                {item.actionText && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#A9DDD3',
                      fontWeight: 800,
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight size={12} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
