'use client';

import { LandingPage } from '@/components/LandingPage';

import { sound } from '@/lib/soundFx';

import React, { useState, useEffect } from 'react';
import { NavigationDock, TabType } from '@/components/NavigationDock';
import { BroadcastNoticeBanner } from '@/components/BroadcastNoticeBanner';
import { ProofOfWork } from '@/components/ProofOfWork';
import { RialoCards } from '@/components/RialoCards';
import { DailyMissions } from '@/components/DailyMissions';
import { CardBinder } from '@/components/CardBinder';
import { TradeMarket } from '@/components/TradeMarket';
import { TieredLeaderboard } from '@/components/TieredLeaderboard';
import { VersusArena } from '@/components/VersusArena';
import { MainnetRadar } from '@/components/MainnetRadar';
import { RialoGems } from '@/components/RialoGems';
import { TopRialoPosts } from '@/components/TopRialoPosts';
import { RialoLogo } from '@/components/RialoLogo';
import { FollowGate } from '@/components/FollowGate';
import { UserProfile, CardArchetype } from '@/lib/types';
import Link from 'next/link';
import { ArcadeHub } from '@/components/ArcadeHub';
import { TrophyCabinet } from '@/components/TrophyCabinet';
import { ProfileSection } from '@/components/ProfileSection';
import { OnboardingModal } from '@/components/OnboardingModal';
import { TrollboxChat } from '@/components/TrollboxChat';
import { SoundToggle } from '@/components/SoundToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { MobileNavDrawer } from '@/components/MobileNavDrawer';
import { MobileAppRoot } from '@/components/mobile/MobileAppRoot';
import { User, Menu } from 'lucide-react';

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<TabType>('proof');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rialo_active_tab') as TabType;
      if (saved) {
        setActiveTab(saved);
      }
    }
  }, []);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rialo_active_tab', tab);
    }
  };
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [preselectedTradeCardId, setPreselectedTradeCardId] = useState<string>('');
  const [newlyPulledCards, setNewlyPulledCards] = useState<CardArchetype[] | null>(null);
  const [inspectedCardId, setInspectedCardId] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isFollowGateOpen, setIsFollowGateOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  const fetchUserData = async (uname: string) => {
    if (!uname) return;
    try {
      const res = await fetch(`/api/user?username=${encodeURIComponent(uname)}`);
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeUser = localStorage.getItem('rialo_active_user');
      const savedViewMode = localStorage.getItem('rialo_view_mode') as 'landing' | 'app';
      if (activeUser && activeUser.trim()) {
        setCurrentUsername(activeUser.trim());
        fetchUserData(activeUser.trim());
        setIsOnboardingOpen(false);
        if (savedViewMode === 'landing') {
          setViewMode('landing');
        } else {
          setViewMode('app');
        }
      } else {
        // First-time visitors: showcase the majestic Landing Page!
        setCurrentUsername('');
        setCurrentUser(null);
        setViewMode('landing');
      }
      const savedAvatar = localStorage.getItem('rialo_user_avatar');
      if (savedAvatar) setHeaderAvatarUrl(savedAvatar);
    }
  }, []);

  useEffect(() => {
    if (currentUsername) {
      fetchUserData(currentUsername);
    }
  }, [currentUsername]);

  const handleLogOut = () => {
    sound.playTap();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rialo_active_user');
    }
    setCurrentUsername('');
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingSuccess = (user: UserProfile) => {
    setCurrentUsername(user.username);
    setCurrentUser(user);
    setIsOnboardingOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rialo_active_user', user.username);
      try {
        const existing = JSON.parse(localStorage.getItem('rialo_recommended_handles') || '[]');
        const updated = Array.from(new Set([user.username, ...existing]));
        localStorage.setItem('rialo_recommended_handles', JSON.stringify(updated));
      } catch (e) {}
    }
    fetchUserData(user.username);

    // After entering X handle -> show the screen to follow @yournahin on X!
    setIsFollowGateOpen(true);
  };

  const handleSelectCardForTrade = (cardId: string) => {
    setPreselectedTradeCardId(cardId);
    handleSelectTab('trades');
  };

  const handleInspectCardFromBinder = (cardId: string) => {
    setInspectedCardId(cardId);
    setNewlyPulledCards(null);
    handleSelectTab('cards');
  };

  const handleOpenPackInRialoCards = (pulledCards: CardArchetype[]) => {
    setNewlyPulledCards(pulledCards);
    handleSelectTab('cards');
  };

  if (viewMode === 'landing') {
    return (
      <div className="app-viewport">
        <LandingPage
          currentUsername={currentUsername}
          onLaunchApp={() => {
            setViewMode('app');
            if (typeof window !== 'undefined') {
              localStorage.setItem('rialo_view_mode', 'app');
            }
            if (!currentUsername) {
              setIsOnboardingOpen(true);
            }
          }}
          onExploreSection={(tab) => {
            setViewMode('app');
            if (typeof window !== 'undefined') {
              localStorage.setItem('rialo_view_mode', 'app');
            }
            handleSelectTab(tab as TabType);
            if (!currentUsername) {
              setIsOnboardingOpen(true);
            }
          }}
        />
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onSuccess={handleOnboardingSuccess}
        />
        <FollowGate
          isOpen={isFollowGateOpen}
          onClose={() => setIsFollowGateOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="app-viewport">
      <FollowGate
        isOpen={isFollowGateOpen}
        onClose={() => setIsFollowGateOpen(false)}
      />

      {/* ========================================================
          1. DESKTOP ENGINE ROOT (Active only on PC screens >= 768px)
          100% UNTOUCHED PC EXPERIENCE
          ======================================================== */}
      <div className="desktop-engine-root">
        <header className="app-header">
        <div className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="brand-badge"
            onClick={() => {
              sound.playTap();
              setViewMode('landing');
              if (typeof window !== 'undefined') {
                localStorage.setItem('rialo_view_mode', 'landing');
              }
            }}
            style={{
              padding: '6px 16px',
              gap: '0px',
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            title="View Landing Page"
          >
            <span style={{ fontWeight: 800, fontSize: '19px', color: '#E8E3D5', letterSpacing: '-0.02em' }}>Rialo</span>
            <span style={{ fontWeight: 800, fontSize: '19px', color: '#A9DDD3', letterSpacing: '-0.02em', marginLeft: '1px' }}>Trace</span>
          </div>


        </div>

        <div className="header-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUsername && (
            <NotificationCenter
              currentUsername={currentUsername}
              onSelectTab={handleSelectTab}
            />
          )}
          {currentUsername ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                title="Account Menu & Profile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 14px 4px 6px',
                  background: (activeTab === 'profile' || isProfileMenuOpen)
                    ? 'linear-gradient(135deg, rgba(169, 221, 211, 0.22), rgba(6, 10, 10, 0.95))'
                    : 'rgba(6, 10, 10, 0.92)',
                  border: (activeTab === 'profile' || isProfileMenuOpen)
                    ? '1.5px solid #A9DDD3'
                    : '1px solid rgba(169, 221, 211, 0.35)',
                  borderRadius: '9999px',
                  boxShadow: (activeTab === 'profile' || isProfileMenuOpen)
                    ? '0 0 20px rgba(169, 221, 211, 0.45)'
                    : '0 2px 10px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                }}
              >
                {/* User Avatar with Superconducting Halo */}
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid #A9DDD3',
                    boxShadow: '0 0 10px rgba(169, 221, 211, 0.5)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#040706',
                  }}
                >
                  <img
                    src={`https://unavatar.io/x/${currentUsername}`}
                    alt="Profile Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#A9DDD3', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>@</span>
                  <span style={{
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                  }}>
                    {currentUsername}
                  </span>
                </div>

                {/* Glowing Active Status Pill */}
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#A9DDD3',
                    boxShadow: '0 0 8px #A9DDD3',
                    marginLeft: '2px',
                  }}
                />
              </button>

              {/* Account Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: 'rgba(6, 10, 10, 0.98)',
                    border: '1.5px solid rgba(169, 221, 211, 0.35)',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(169, 221, 211, 0.15)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 9999,
                  }}
                >
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(232, 227, 213, 0.45)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Active Citizen
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>
                      @{currentUsername}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setIsProfileMenuOpen(false);
                      handleSelectTab('profile');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#E8E3D5',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(169, 221, 211, 0.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>👤</span>
                    <span>View Profile & Trophies</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setIsProfileMenuOpen(false);
                      setIsOnboardingOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#E8E3D5',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(169, 221, 211, 0.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>🔄</span>
                    <span>Switch Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setIsProfileMenuOpen(false);
                      setViewMode('landing');
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('rialo_view_mode', 'landing');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#A9DDD3',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(169, 221, 211, 0.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>🪐</span>
                    <span>Return to Landing Page</span>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={handleLogOut}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#FCA5A5',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setIsOnboardingOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                background: '#A9DDD3',
                border: 'none',
                borderRadius: '9999px',
                color: '#010101',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(169, 221, 211, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <span>⚡ Enter X Handle</span>
            </button>
          )}

          <SoundToggle />

          <a
            href="https://rialo.io"
            target="_blank"
            rel="noopener noreferrer"
            className="rialo-status-chip"
            title="rialo.io Official"
          >
            <span className="pulse-dot" />
            <span>rialo.io</span>
          </a>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setIsMobileNavOpen(true);
            }}
            className="mobile-hamburger-btn"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} color="#A9DDD3" />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        onSelectTab={!currentUsername ? () => setIsOnboardingOpen(true) : handleSelectTab}
        user={currentUser}
        currentUsername={currentUsername}
        onSwitchAccount={() => setIsOnboardingOpen(true)}
        onLogOut={handleLogOut}
      />

      <NavigationDock activeTab={activeTab} onSelectTab={!currentUsername ? () => setIsOnboardingOpen(true) : handleSelectTab} />

      <main
        className="main-stage"
        style={{
          filter: !currentUsername ? 'blur(10px) brightness(0.35)' : undefined,
          pointerEvents: !currentUsername ? 'none' : 'auto',
          userSelect: !currentUsername ? 'none' : 'auto',
          transition: 'filter 0.3s ease',
        }}
      >
        {/* Global Notice & Announcement Banner across every main section (persistent until dismissed) */}
        <BroadcastNoticeBanner
          currentUsername={currentUsername}
          currentUser={currentUser}
          onUserUpdate={(u) => setCurrentUser(u)}
        />
        {activeTab === 'proof' && <ProofOfWork currentUsername={currentUsername} />}
        {activeTab === 'missions' && (
          <DailyMissions
            username={currentUsername}
            onUserDataUpdate={(u) => setCurrentUser(u)}
            onOpenPackInRialoCards={handleOpenPackInRialoCards}
            onNavigateToBinder={() => handleSelectTab('binder')}
            onRequireConnect={() => setIsOnboardingOpen(true)}
          />
        )}
        {activeTab === 'binder' && (
          <CardBinder
            user={currentUser}
            onUserUpdate={(u) => setCurrentUser(u)}
            onSelectForTrade={handleSelectCardForTrade}
          />
        )}
        {activeTab === 'trades' && (
          <TradeMarket
            user={currentUser}
            preselectedOfferedCardId={preselectedTradeCardId}
            onUserUpdate={(u) => setCurrentUser(u)}
            onNavigateToBinder={() => handleSelectTab('binder')}
          />
        )}
        {activeTab === 'leaderboard' && (
          <TieredLeaderboard currentUsername={currentUsername} />
        )}
        {activeTab === 'cards' && (
          <RialoCards
            user={currentUser}
            newlyPulledCards={newlyPulledCards}
            onClearNewlyPulledCards={() => setNewlyPulledCards(null)}
            onNavigateToBinder={() => {
              handleSelectTab('binder');
              setNewlyPulledCards(null);
            }}
            onUserUpdate={(u) => setCurrentUser(u)}
          />
        )}
        {activeTab === 'versus' && <VersusArena />}
        {activeTab === 'radar' && <MainnetRadar />}
        {(activeTab === 'best_posts' || activeTab === 'terminal') && <TopRialoPosts currentUsername={currentUsername} />}
        {(activeTab === 'profile' || activeTab === 'trophies') && (
          <ProfileSection user={currentUser} onSelectTab={handleSelectTab} onLogOut={handleLogOut} onSwitchAccount={() => setIsOnboardingOpen(true)} onUserUpdate={(u) => setCurrentUser(u)} />
        )}
        {activeTab === 'arcade' && (
          <ArcadeHub
            user={currentUser}
            onUserUpdate={(u) => setCurrentUser(u)}
            onNavigateToBinder={() => handleSelectTab('binder')}
          />
        )}
      </main>
      </div>

      {/* ========================================================
          2. DEDICATED MOBILE ENGINE ROOT (Active on screens < 768px)
          FRESH, PURPOSE-BUILT, FULLY RESPONSIVE MOBILE EXPERIENCE
          ======================================================== */}
      <div className="mobile-engine-root-wrap">
        <MobileAppRoot
          activeTab={activeTab}
          onSelectTab={!currentUsername ? () => setIsOnboardingOpen(true) : handleSelectTab}
          currentUser={currentUser}
          currentUsername={currentUsername}
          newlyPulledCards={newlyPulledCards}
          onClearNewlyPulledCards={() => setNewlyPulledCards(null)}
          onNavigateToBinder={() => {
            handleSelectTab('binder');
            setNewlyPulledCards(null);
          }}
          onOpenPackInRialoCards={handleOpenPackInRialoCards}
          onSelectCardForTrade={handleSelectCardForTrade}
          onUserUpdate={(u) => setCurrentUser(u)}
          onSwitchAccount={() => setIsOnboardingOpen(true)}
          onLogOut={handleLogOut}
        />
      </div>

      {/* Global Live Community Trollbox & Shard Rain */}
      <TrollboxChat
        user={currentUser}
        currentUsername={currentUsername}
        onUserUpdate={(u) => setCurrentUser(u)}
      />
      {/* Interactive PIN-Protected Onboarding & Account Switcher Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen || !currentUsername}
        isMandatory={!currentUsername}
        onClose={() => {
          if (currentUsername) {
            setIsOnboardingOpen(false);
          }
        }}
        onSuccess={handleOnboardingSuccess}
        initialHandle={currentUsername}
      />
    </div>
  );
}