'use client';

import React from 'react';
import { Bell, User } from 'lucide-react';
import { sound } from '@/lib/soundFx';
import { UserProfile } from '@/lib/types';

interface MobileHeaderProps {
  user: UserProfile | null;
  currentUsername: string;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  currentUsername,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenProfile,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: '52px',
        background: 'rgba(6, 10, 9, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(169, 221, 211, 0.18)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Word Mark Only (No Logo Icon) */}
      <div
        onClick={() => {
          sound.playTap();
          onOpenProfile();
        }}
        style={{
          display: 'flex',
          alignItems: 'baseline',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontWeight: 900, fontSize: '18px', color: '#E8E3D5', letterSpacing: '-0.02em' }}>
          Rialo<span style={{ color: '#A9DDD3' }}>Trace</span>
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Shards Balance Pill */}
        {currentUsername && (
          <div
            onClick={() => {
              sound.playTap();
              onOpenProfile();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '9999px',
              background: 'rgba(169, 221, 211, 0.1)',
              border: '1px solid rgba(169, 221, 211, 0.3)',
              color: '#A9DDD3',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
            }}
          >
            <span>💎</span>
            <span>{user?.shards ?? 100}</span>
          </div>
        )}

        {/* Notification Bell Button */}
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onOpenNotifications();
          }}
          title="Notifications"
          style={{
            position: 'relative',
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(169, 221, 211, 0.25)',
            color: '#E8E3D5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Bell size={16} color="#A9DDD3" />
          {unreadNotifsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '15px',
                height: '15px',
                borderRadius: '9999px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
              }}
            >
              {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar / Icon */}
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onOpenProfile();
          }}
          title="My Profile"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(169, 221, 211, 0.14)',
            border: '1.5px solid #A9DDD3',
            color: '#A9DDD3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 0 10px rgba(169, 221, 211, 0.25)',
          }}
        >
          {currentUsername ? (
            <img
              src={`https://unavatar.io/x/${currentUsername}`}
              alt={currentUsername}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <User size={16} />
          )}
        </button>
      </div>
    </header>
  );
};
