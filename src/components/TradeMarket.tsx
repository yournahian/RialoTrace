'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, CardArchetype, TradeOffer, CardRarity } from '@/lib/types';
import { ALL_30_CARDS, RIALO_30_ARCHETYPES } from '@/lib/cardsData';
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Search,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  Flame,
  CheckCircle2,
  ExternalLink,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { sound } from '@/lib/soundFx';

interface EnrichedTradeOffer extends TradeOffer {
  offeredCard?: CardArchetype | null;
  requestedCard?: CardArchetype | null;
}

interface TradeMarketProps {
  user: UserProfile | null;
  preselectedOfferedCardId?: string;
  onUserUpdate: (updated: UserProfile) => void;
  onNavigateToBinder?: () => void;
}

interface CelebrationData {
  givenCard: CardArchetype;
  receivedCard: CardArchetype;
  traderName: string;
  pointsEarned: number;
}

export const TradeMarket: React.FC<TradeMarketProps> = ({
  user,
  preselectedOfferedCardId,
  onUserUpdate,
  onNavigateToBinder,
}) => {
  const [trades, setTrades] = useState<EnrichedTradeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedOfferCardId, setSelectedOfferCardId] = useState<string>(preselectedOfferedCardId || '');
  const [selectedRequestCardId, setSelectedRequestCardId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Search & Filter state for Premium Marketplace Vibe
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'CAN_ACCEPT' | 'MY_TRADES'>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');

  // Epic Trade Completed Celebration Modal State
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

  // 3D Coverflow Carousel Modal State
  const [tradeStep, setTradeStep] = useState<'give' | 'want'>('give');
  const [giveCarouselIndex, setGiveCarouselIndex] = useState(0);
  const [wantCarouselIndex, setWantCarouselIndex] = useState(0);

  const inventory = user?.inventory || {};

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/trades');
      const data = await res.json();
      if (data.success) {
        setTrades(data.trades || []);
      }
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (preselectedOfferedCardId) {
      setSelectedOfferCardId(preselectedOfferedCardId);
      setIsPostModalOpen(true);
      setTradeStep('want');
    }
  }, [preselectedOfferedCardId]);

  // Active listings created by current user
  const activeListingsByMe = useMemo(() => {
    return trades.filter(
      (t) => user && t.offeredBy.toLowerCase() === user.username.toLowerCase() && t.status === 'OPEN'
    );
  }, [trades, user]);

  // Set of card IDs already requested in open offers by current user (Anti-Spam)
  const alreadyRequestedCardIds = useMemo(() => {
    return new Set(activeListingsByMe.map((t) => t.requestedCardId));
  }, [activeListingsByMe]);

  // STRICT DUPLICATE VALIDATION:
  // User can ONLY trade cards where they have at least 2 copies,
  // minus any copies already locked in active open trade listings!
  const duplicateCards = useMemo(() => {
    return ALL_30_CARDS.filter((c) => {
      const totalCopies = inventory[c.id] || 0;
      const listedCopies = activeListingsByMe.filter((t) => t.offeredCardId === c.id).length;
      return totalCopies > 1 && (totalCopies - 1) > listedCopies;
    });
  }, [inventory, activeListingsByMe]);

  const cardsToGive = duplicateCards;

  // Selected card objects for preview
  const selectedOfferCard = selectedOfferCardId ? RIALO_30_ARCHETYPES[selectedOfferCardId] : null;
  const selectedRequestCard = selectedRequestCardId ? RIALO_30_ARCHETYPES[selectedRequestCardId] : null;

  // Create Trade Offer
  const handleCreateTrade = async () => {
    if (!user || !selectedOfferCardId || !selectedRequestCardId) return;

    if (selectedOfferCardId === selectedRequestCardId) {
      showToast('⚠️ Cannot offer and request the exact same card!');
      return;
    }

    if (alreadyRequestedCardIds.has(selectedRequestCardId)) {
      showToast('⚠️ You already have an active trade offer requesting this card!');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          offeredCardId: selectedOfferCardId,
          requestedCardId: selectedRequestCardId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        setIsPostModalOpen(false);
        setSelectedOfferCardId('');
        setSelectedRequestCardId('');
        showToast('✓ Trade offer published to marketplace!');
        fetchTrades();
      } else {
        showToast(`❌ ${data.error || 'Failed to create trade'}`);
      }
    } catch (err: any) {
      showToast('❌ Network error creating trade');
    } finally {
      setActionLoading(false);
    }
  };

  // Accept Trade with EPIC ANIMATION MODAL
  const handleAcceptTrade = async (tradeId: string) => {
    if (!user) {
      showToast('Please connect your X profile first to trade');
      return;
    }

    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) return;

    if ((inventory[trade.requestedCardId] || 0) <= 1) {
      showToast('🔒 You must own at least 2 copies of this card to trade it! Single copy protected for your album.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/trades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId,
          username: user.username,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.buyer) onUserUpdate(data.buyer);
        fetchTrades();

        // Trigger Epic Celebration Animation Modal
        const given = RIALO_30_ARCHETYPES[trade.requestedCardId];
        const received = RIALO_30_ARCHETYPES[trade.offeredCardId];
        if (given && received) {
          sound.playSuccess();
          setCelebrationData({
            givenCard: given,
            receivedCard: received,
            traderName: trade.offeredBy,
            pointsEarned: 25,
          });
        }
      } else {
        showToast(`❌ ${data.error || 'Trade execution failed'}`);
      }
    } catch (err) {
      showToast('❌ Network error accepting trade');
    } finally {
      setActionLoading(false);
    }
  };

  // Delist / Cancel Offer
  const handleDelistTrade = async (tradeId: string) => {
    if (!user) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/trades?id=${encodeURIComponent(tradeId)}&username=${encodeURIComponent(user.username)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        sound.playTap();
        showToast('✓ Trade offer delisted and card returned to your binder!');
        fetchTrades();
      } else {
        showToast(`❌ ${data.error || 'Failed to delist offer'}`);
      }
    } catch (err) {
      showToast('❌ Network error while delisting');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & Searched Trades
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const isMyTrade = user && user.username.toLowerCase() === t.offeredBy.toLowerCase();
      const canAccept = user && (inventory[t.requestedCardId] || 0) >= 2 && !isMyTrade;
      const offeredCard = t.offeredCard || RIALO_30_ARCHETYPES[t.offeredCardId];
      const requestedCard = t.requestedCard || RIALO_30_ARCHETYPES[t.requestedCardId];

      // Tab filter
      if (selectedTab === 'CAN_ACCEPT' && !canAccept) return false;
      if (selectedTab === 'MY_TRADES' && !isMyTrade) return false;

      // Rarity filter
      if (selectedRarity !== 'ALL') {
        const matchOffered = offeredCard?.rarity === selectedRarity;
        const matchRequested = requestedCard?.rarity === selectedRarity;
        if (!matchOffered && !matchRequested) return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTrader = t.offeredBy.toLowerCase().includes(q);
        const matchOfferedName = (offeredCard?.title || t.offeredCardId).toLowerCase().includes(q);
        const matchRequestedName = (requestedCard?.title || t.requestedCardId).toLowerCase().includes(q);
        const matchRarity = (offeredCard?.rarity || '').toLowerCase().includes(q) || (requestedCard?.rarity || '').toLowerCase().includes(q);
        if (!matchTrader && !matchOfferedName && !matchRequestedName && !matchRarity) return false;
      }

      return true;
    });
  }, [trades, user, inventory, selectedTab, selectedRarity, searchQuery]);

  const fulfillableCount = useMemo(() => {
    return trades.filter((t) => {
      const isMyTrade = user && user.username.toLowerCase() === t.offeredBy.toLowerCase();
      return user && (inventory[t.requestedCardId] || 0) >= 2 && !isMyTrade;
    }).length;
  }, [trades, user, inventory]);

  return (
    <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', padding: '10px 0 70px 0', boxSizing: 'border-box' }}>
      {/* Superconducting Keyframes & Styles */}
      <style>{`
        @keyframes celebrationBeam {
          0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
          50% { transform: rotate(180deg) scale(1.15); opacity: 0.9; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
        }
        @keyframes cardPop {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes pulseOrb {
          0% { transform: scale(1); box-shadow: 0 0 20px #A9DDD3; }
          50% { transform: scale(1.1); box-shadow: 0 0 40px #A9DDD3, 0 0 60px rgba(169,221,211,0.5); }
          100% { transform: scale(1); box-shadow: 0 0 20px #A9DDD3; }
        }
        .trade-row-glow {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .trade-row-glow:hover {
          transform: translateY(-2px);
          border-color: rgba(169, 221, 211, 0.4) !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(169, 221, 211, 0.12) !important;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(6, 10, 10, 0.96)',
            border: '1px solid #A9DDD3',
            borderRadius: '9999px',
            padding: '10px 24px',
            color: '#E8E3D5',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(169, 221, 211, 0.3)',
            zIndex: 99999,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* ========================================================
          TOP HERO & MARKETPLACE ANALYTICS TICKER
          ======================================================== */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: '36px 24px 30px',
          marginBottom: '28px',
          background: 'radial-gradient(ellipse 90% 70% at 50% -20%, rgba(169, 221, 211, 0.18) 0%, rgba(1, 1, 1, 0.95) 70%)',
          borderRadius: '28px',
          border: '1px solid rgba(169, 221, 211, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(169, 221, 211, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              background: 'rgba(169, 221, 211, 0.1)',
              border: '1px solid rgba(169, 221, 211, 0.35)',
              borderRadius: '9999px',
              color: '#A9DDD3',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <ArrowLeftRight size={13} />
            <span>P2P CARD TRADING MARKETPLACE</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: '36px',
            fontWeight: 900,
            color: '#E8E3D5',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            margin: '0 0 8px 0',
          }}
        >
          Exchange Cards with <span className="gradient-text-rialo">Community</span>
        </h1>
        <p
          style={{
            color: 'rgba(232, 227, 213, 0.7)',
            fontSize: '14px',
            maxWidth: '640px',
            margin: '0 auto 20px auto',
            lineHeight: '1.6',
          }}
        >
          Swap duplicate Season 1 cards gaslessly to complete your 30/30 collector album.
          Earn +25 whitelist points per confirmed atomic trade!
        </p>

        {/* Live Marketplace Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ padding: '7px 16px', borderRadius: '9999px', background: 'rgba(9, 9, 9, 0.85)', border: '1px solid rgba(169, 221, 211, 0.2)', fontSize: '12px', fontWeight: 700, color: '#E8E3D5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#A9DDD3', fontWeight: 900 }}>📊 {trades.length}</span> Open Offers
          </div>
          <div style={{ padding: '7px 16px', borderRadius: '9999px', background: 'rgba(9, 9, 9, 0.85)', border: '1px solid rgba(169, 221, 211, 0.2)', fontSize: '12px', fontWeight: 700, color: '#E8E3D5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#A9DDD3', fontWeight: 900 }}>⚡ 0 Gas</span> Sub-Second Atomic Swap
          </div>
          <div style={{ padding: '7px 16px', borderRadius: '9999px', background: 'rgba(9, 9, 9, 0.85)', border: '1px solid rgba(169, 221, 211, 0.2)', fontSize: '12px', fontWeight: 700, color: '#E8E3D5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#A9DDD3', fontWeight: 900 }}>💎 +25 Points</span> Per Confirmed Trade
          </div>
          <div style={{ padding: '7px 16px', borderRadius: '9999px', background: 'rgba(9, 9, 9, 0.85)', border: '1px solid rgba(169, 221, 211, 0.2)', fontSize: '12px', fontWeight: 700, color: '#E8E3D5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#10B981', fontWeight: 900 }}>🛡️ Anti-Spam</span> Duplicate Protection
          </div>
        </div>
      </div>

      {/* ========================================================
          MARKETPLACE CONTROLS: SEARCH BAR, TABS & CREATE BUTTON
          ======================================================== */}
      <div
        style={{
          background: 'rgba(9, 9, 9, 0.9)',
          border: '1px solid rgba(169, 221, 211, 0.22)',
          borderRadius: '22px',
          padding: '20px',
          marginBottom: '22px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A9DDD3' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by card name, rarity (e.g. Mythic, Epic), or trader @handle..."
              style={{
                width: '100%',
                padding: '12px 36px 12px 38px',
                borderRadius: '12px',
                background: 'rgba(2, 4, 4, 0.95)',
                border: '1px solid rgba(169, 221, 211, 0.3)',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(232, 227, 213, 0.5)',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action Buttons: Refresh & Create Trade Offer */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={fetchTrades}
              style={{
                padding: '11px 16px',
                background: 'rgba(6, 10, 10, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.3)',
                borderRadius: '12px',
                color: '#E8E3D5',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              title="Refresh Marketplace"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                if (cardsToGive.length === 0) {
                  showToast('🔒 No available duplicate cards! You need at least 2 copies of a card to create a trade offer.');
                  return;
                }
                setIsPostModalOpen(true);
                setTradeStep('give');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                background: '#A9DDD3',
                border: 'none',
                borderRadius: '12px',
                color: '#010101',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(169, 221, 211, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={16} />
              <span>Create Trade Offer</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Rarity Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
          {/* View Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Listings (${trades.length})` },
              { id: 'CAN_ACCEPT', label: `✨ Matches My Cards (${fulfillableCount})` },
              { id: 'MY_TRADES', label: `📋 My Active Offers (${activeListingsByMe.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedTab === tab.id ? 'rgba(169, 221, 211, 0.18)' : 'rgba(232, 227, 213, 0.04)',
                  border: selectedTab === tab.id ? '1px solid #A9DDD3' : '1px solid rgba(232, 227, 213, 0.08)',
                  color: selectedTab === tab.id ? '#A9DDD3' : 'rgba(232, 227, 213, 0.6)',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.45)' }}>Rarity:</span>
            {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRarity(r)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedRarity === r ? 'rgba(169, 221, 211, 0.2)' : 'transparent',
                  border: selectedRarity === r ? '1px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: selectedRarity === r ? '#A9DDD3' : 'rgba(232, 227, 213, 0.5)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duplicate Card Warning Banner if user has 0 tradable duplicates */}
      {user && duplicateCards.length === 0 && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#FDE68A',
            fontSize: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#FFFFFF' }}>Single Copy Protection Active:</strong> You currently have no available duplicate cards in your digital binder.
            You must own at least 2 copies of a warrior card to list it for P2P trade, ensuring you never trade away your only collector copy.
          </div>
        </div>
      )}

      {/* ========================================================
          TRADES MARKETPLACE LISTINGS
          ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#A9DDD3', fontSize: '14px' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <div>Synchronizing P2P orderbook on rialo.io...</div>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              background: 'rgba(6, 10, 10, 0.6)',
              borderRadius: '22px',
              border: '1px dashed rgba(169, 221, 211, 0.2)',
              color: 'rgba(232, 227, 213, 0.6)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎴</div>
            <h4 style={{ fontSize: '16px', color: '#E8E3D5', margin: '0 0 6px' }}>
              {searchQuery ? 'No trade offers match your search criteria' : 'No open trade offers found'}
            </h4>
            <p style={{ fontSize: '12px', maxWidth: '400px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
              {searchQuery
                ? 'Try clearing your search query or switching to All Listings to see available swaps.'
                : 'Be the first to list a duplicate warrior card or check back soon as community members open packs.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedRarity('ALL'); setSelectedTab('ALL'); }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(169, 221, 211, 0.15)',
                  border: '1px solid #A9DDD3',
                  color: '#A9DDD3',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          filteredTrades.map((t) => {
            const isMyTrade = user && user.username.toLowerCase() === t.offeredBy.toLowerCase();
            const canAccept = user && (inventory[t.requestedCardId] || 0) >= 2 && !isMyTrade;
            const offeredCard = t.offeredCard || RIALO_30_ARCHETYPES[t.offeredCardId];
            const requestedCard = t.requestedCard || RIALO_30_ARCHETYPES[t.requestedCardId];

            return (
              <div
                key={t.id}
                className="trade-row-glow"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  background: isMyTrade ? 'rgba(20, 16, 8, 0.85)' : canAccept ? 'rgba(6, 18, 16, 0.85)' : 'rgba(6, 10, 10, 0.85)',
                  border: isMyTrade
                    ? '1.5px solid rgba(245, 158, 11, 0.4)'
                    : canAccept
                    ? '1.5px solid rgba(169, 221, 211, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  gap: '18px',
                  boxShadow: isMyTrade
                    ? '0 8px 25px rgba(245, 158, 11, 0.1)'
                    : canAccept
                    ? '0 8px 25px rgba(169, 221, 211, 0.12)'
                    : '0 8px 25px rgba(0, 0, 0, 0.6)',
                }}
              >
                {/* Offering Card Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
                  <div style={{ position: 'relative', width: '58px', height: '78px', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${offeredCard?.glowColor || '#6366F1'}`, flexShrink: 0, boxShadow: `0 0 15px ${offeredCard?.glowColor || '#6366F1'}40` }}>
                    <img
                      src={offeredCard?.image || '/cards/pioneer.png'}
                      alt={offeredCard?.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    {/* Trader Handle & Live Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <img
                        src={`https://unavatar.io/x/${t.offeredBy}`}
                        alt={t.offeredBy}
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #A9DDD3' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://pbs.twimg.com/profile_images/1990106346264666112/pbBiIRET_400x400.png'; }}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>
                        @{t.offeredBy}
                      </span>
                      {isMyTrade && (
                        <span style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', margin: '1px 0' }}>
                      {offeredCard?.title || t.offeredCardId}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: offeredCard?.glowColor || '#A9DDD3', padding: '2px 6px', borderRadius: '4px', background: `${offeredCard?.glowColor || '#A9DDD3'}18` }}>
                        {offeredCard?.badgeEmoji} {offeredCard?.rarity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Animated Center Swap Icon */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(169, 221, 211, 0.1)',
                      border: '1.5px solid rgba(169, 221, 211, 0.35)',
                      color: '#A9DDD3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 15px rgba(169, 221, 211, 0.2)',
                    }}
                  >
                    <ArrowLeftRight size={18} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(232, 227, 213, 0.4)', fontWeight: 800 }}>SWAP</span>
                </div>

                {/* Requested Card Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
                  <div style={{ position: 'relative', width: '58px', height: '78px', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${requestedCard?.glowColor || '#6366F1'}`, flexShrink: 0, boxShadow: `0 0 15px ${requestedCard?.glowColor || '#6366F1'}40` }}>
                    <img
                      src={requestedCard?.image || '/cards/pioneer.png'}
                      alt={requestedCard?.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(232, 227, 213, 0.5)', letterSpacing: '0.05em' }}>
                      Seeking in Return:
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', margin: '1px 0' }}>
                      {requestedCard?.title || t.requestedCardId}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: requestedCard?.glowColor || '#A9DDD3', padding: '2px 6px', borderRadius: '4px', background: `${requestedCard?.glowColor || '#A9DDD3'}18` }}>
                        {requestedCard?.badgeEmoji} {requestedCard?.rarity}
                      </span>
                      {user && (inventory[t.requestedCardId] || 0) >= 2 ? (
                        <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 800 }}>
                          ✓ Duplicate ready (x{inventory[t.requestedCardId]})
                        </span>
                      ) : user && (inventory[t.requestedCardId] || 0) === 1 ? (
                        <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 800 }}>
                          🔒 1 owned (Duplicate needed)
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'rgba(232, 227, 213, 0.4)' }}>
                          0 owned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Column: Delist vs Accept vs Need Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isMyTrade ? (
                    <button
                      type="button"
                      onClick={() => handleDelistTrade(t.id)}
                      disabled={actionLoading}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#FCA5A5',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                      title="Cancel this listing and restore card to binder"
                    >
                      <Trash2 size={14} />
                      <span>Delist Offer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAcceptTrade(t.id)}
                      disabled={!canAccept || actionLoading}
                      style={{
                        padding: '10px 22px',
                        fontSize: '12px',
                        fontWeight: 900,
                        background: canAccept ? '#A9DDD3' : 'rgba(255, 255, 255, 0.05)',
                        color: canAccept ? '#010101' : 'rgba(232, 227, 213, 0.35)',
                        border: canAccept ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        cursor: canAccept ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        boxShadow: canAccept ? '0 0 20px rgba(169, 221, 211, 0.4)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {canAccept ? (
                        <>
                          <Zap size={14} />
                          <span>Accept Trade</span>
                        </>
                      ) : (inventory[t.requestedCardId] || 0) === 1 ? (
                        <span>Duplicate Needed</span>
                      ) : (
                        <span>Need Card to Trade</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          EPIC TRADE COMPLETED CELEBRATION MODAL ANIMATION
          ========================================================================= */}
      {celebrationData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(1, 2, 4, 0.94)',
            backdropFilter: 'blur(25px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Ambient Rotating Light Ray */}
          <div
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(169, 221, 211, 0.25) 0%, transparent 70%)',
              animation: 'celebrationBeam 12s linear infinite',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '640px',
              background: 'rgba(6, 10, 10, 0.98)',
              border: '2px solid #A9DDD3',
              borderRadius: '28px',
              padding: '36px 30px',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 60px rgba(169, 221, 211, 0.35)',
              textAlign: 'center',
              color: '#E8E3D5',
              animation: 'cardPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Top Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 18px',
                borderRadius: '9999px',
                background: 'rgba(169, 221, 211, 0.15)',
                border: '1px solid #A9DDD3',
                color: '#A9DDD3',
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              <Sparkles size={14} />
              <span>ATOMIC P2P TRADE SETTLED</span>
            </div>

            <h2
              style={{
                fontSize: '30px',
                fontWeight: 900,
                margin: '0 0 6px 0',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              Trade Executed <span className="gradient-text-rialo">Successfully!</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.7)', margin: '0 0 24px 0' }}>
              Instant zero-gas settlement with <strong style={{ color: '#A9DDD3' }}>@{celebrationData.traderName}</strong>. Cards updated in both digital binders!
            </p>

            {/* Showdown Side-by-Side Card Display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '28px',
                flexWrap: 'wrap',
              }}
            >
              {/* Card Given */}
              <div style={{ textAlign: 'center', width: '160px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#EF4444', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '3px 8px', borderRadius: '6px', marginBottom: '8px', display: 'inline-block' }}>
                  −1 GIVEN
                </div>
                <div
                  style={{
                    width: '140px',
                    height: '190px',
                    margin: '0 auto 10px auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `2px solid ${celebrationData.givenCard.glowColor}`,
                    boxShadow: `0 8px 25px ${celebrationData.givenCard.glowColor}50`,
                  }}
                >
                  <img
                    src={celebrationData.givenCard.image}
                    alt={celebrationData.givenCard.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                  {celebrationData.givenCard.title}
                </div>
                <div style={{ fontSize: '11px', color: celebrationData.givenCard.glowColor, fontWeight: 800 }}>
                  {celebrationData.givenCard.badgeEmoji} {celebrationData.givenCard.rarity}
                </div>
              </div>

              {/* Center Vortex Energy Orb */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #A9DDD3 0%, #010101 80%)',
                    color: '#010101',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulseOrb 2s infinite ease-in-out',
                  }}
                >
                  <ArrowLeftRight size={24} />
                </div>
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#010101',
                    fontSize: '11px',
                    fontWeight: 900,
                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  +25 POINTS
                </div>
              </div>

              {/* Card Acquired */}
              <div style={{ textAlign: 'center', width: '160px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '3px 8px', borderRadius: '6px', marginBottom: '8px', display: 'inline-block' }}>
                  +1 ACQUIRED ✨
                </div>
                <div
                  style={{
                    width: '140px',
                    height: '190px',
                    margin: '0 auto 10px auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `2.5px solid ${celebrationData.receivedCard.glowColor}`,
                    boxShadow: `0 0 35px ${celebrationData.receivedCard.glowColor}, 0 0 20px #A9DDD3`,
                  }}
                >
                  <img
                    src={celebrationData.receivedCard.image}
                    alt={celebrationData.receivedCard.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#A9DDD3' }}>
                  {celebrationData.receivedCard.title}
                </div>
                <div style={{ fontSize: '11px', color: celebrationData.receivedCard.glowColor, fontWeight: 900 }}>
                  {celebrationData.receivedCard.badgeEmoji} {celebrationData.receivedCard.rarity}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {onNavigateToBinder && (
                <button
                  type="button"
                  onClick={() => {
                    setCelebrationData(null);
                    onNavigateToBinder();
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    background: 'rgba(169, 221, 211, 0.15)',
                    border: '1.5px solid #A9DDD3',
                    color: '#A9DDD3',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Layers size={16} />
                  <span>Inspect in Digital Binder</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCelebrationData(null)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '14px',
                  background: '#A9DDD3',
                  border: 'none',
                  color: '#010101',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(169, 221, 211, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Continue Trading</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE P2P TRADE OFFER MODAL WITH 3D COVERFLOW CAROUSEL SELECTION
          ========================================================================= */}
      {isPostModalOpen && (
        <div
          className="carousel-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPostModalOpen(false);
          }}
        >
          <div className="carousel-modal-container" style={{ maxWidth: '1020px' }}>
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="carousel-close-btn"
              title="Close Modal"
            >
              <X style={{ width: '22px', height: '22px' }} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(169, 221, 211, 0.15)',
                  border: '1px solid rgba(169, 221, 211, 0.35)',
                  color: 'var(--arc-cyan)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                <ArrowLeftRight size={14} /> P2P Card Trading • 3D Coverflow Selection
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
                Create P2P Trade Offer
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--rialo-text-muted)', margin: 0 }}>
                Select an unlisted duplicate card from your binder and specify the warrior you desire in exchange.
              </p>
            </div>

            {/* Top Trade Summary Match Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '18px',
                padding: '10px 18px',
                marginBottom: '16px',
                width: '100%',
                maxWidth: '740px',
              }}
            >
              {/* Offering Card Pill */}
              <div
                onClick={() => setTradeStep('give')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  border: tradeStep === 'give' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: tradeStep === 'give' ? 'rgba(169, 221, 211, 0.15)' : 'rgba(6, 10, 10, 0.8)',
                  flex: 1,
                  transition: 'all 0.2s',
                }}
              >
                {selectedOfferCard ? (
                  <>
                    <img
                      src={selectedOfferCard.image}
                      alt={selectedOfferCard.title}
                      style={{ width: '36px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid ' + selectedOfferCard.glowColor }}
                    />
                    <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                      <div style={{ fontSize: '10px', color: 'var(--arc-cyan)', fontWeight: 800, letterSpacing: '0.05em' }}>
                        1. CARD YOU GIVE
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedOfferCard.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#F97316', fontWeight: 800 }}>
                        x{inventory[selectedOfferCard.id]} total (duplicate)
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'left', padding: '6px 0' }}>
                    <div style={{ fontSize: '10px', color: 'var(--arc-cyan)', fontWeight: 800 }}>1. CARD YOU GIVE</div>
                    <div style={{ fontSize: '12px', color: 'var(--rialo-text-dim)', fontWeight: 700 }}>Click to select duplicate ➔</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '8px', background: 'rgba(169, 221, 211, 0.15)', borderRadius: '50%', color: 'var(--arc-cyan)' }}>
                <ArrowLeftRight size={18} />
              </div>

              {/* Requesting Card Pill */}
              <div
                onClick={() => setTradeStep('want')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  border: tradeStep === 'want' ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: tradeStep === 'want' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 10, 10, 0.8)',
                  flex: 1,
                  transition: 'all 0.2s',
                }}
              >
                {selectedRequestCard ? (
                  <>
                    <img
                      src={selectedRequestCard.image}
                      alt={selectedRequestCard.title}
                      style={{ width: '36px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid ' + selectedRequestCard.glowColor }}
                    />
                    <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                      <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 800, letterSpacing: '0.05em' }}>
                        2. CARD YOU WANT
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedRequestCard.title}
                      </div>
                      <div style={{ fontSize: '10px', color: selectedRequestCard.glowColor, fontWeight: 800 }}>
                        {selectedRequestCard.rarity}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'left', padding: '6px 0' }}>
                    <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 800 }}>2. CARD YOU WANT</div>
                    <div style={{ fontSize: '12px', color: 'var(--rialo-text-dim)', fontWeight: 700 }}>Click to select target card ➔</div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================
                CAROUSEL 1: CARD YOU GIVE (STRICT DUPLICATES ONLY)
                ======================================================== */}
            {tradeStep === 'give' && (
              <div style={{ width: '100%' }}>
                {cardsToGive.length === 0 ? (
                  <div
                    style={{
                      height: '380px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '24px',
                      border: '1px dashed rgba(255, 255, 255, 0.15)',
                      padding: '24px',
                      textAlign: 'center',
                      color: 'var(--rialo-text-dim)',
                    }}
                  >
                    <AlertCircle size={40} color="#F59E0B" style={{ marginBottom: '12px' }} />
                    <h4 style={{ margin: '0 0 6px', color: '#FFFFFF', fontSize: '16px' }}>No Available Duplicate Cards</h4>
                    <p style={{ margin: 0, fontSize: '12px', maxWidth: '420px', lineHeight: 1.5 }}>
                      You need at least 2 copies of a warrior card to list it for P2P trading. Open daily mystery packs in Daily Quests to earn more duplicates!
                    </p>
                  </div>
                ) : (
                  <div className="carousel-3d-stage" style={{ height: '430px' }}>
                    {cardsToGive.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setGiveCarouselIndex(
                            (prev) => (prev - 1 + cardsToGive.length) % cardsToGive.length
                          )
                        }
                        className="carousel-nav-btn prev"
                        title="Previous Duplicate"
                      >
                        <ChevronLeft style={{ width: '28px', height: '28px' }} />
                      </button>
                    )}

                    <div className="carousel-track">
                      {cardsToGive.map((arch, idx) => {
                        const offset = idx - giveCarouselIndex;
                        const absOffset = Math.abs(offset);
                        const isVisible = absOffset <= 2;

                        if (!isVisible) return null;

                        const translateX = offset * 210;
                        const translateZ = -absOffset * 150;
                        const rotateY = offset * -25;
                        const scale = 1 - absOffset * 0.12;
                        const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.4;
                        const zIndex = 10 - absOffset;

                        const count = inventory[arch.id] || 0;
                        const isSelected = selectedOfferCardId === arch.id;

                        return (
                          <div
                            key={arch.id}
                            onClick={() => {
                              setGiveCarouselIndex(idx);
                              setSelectedOfferCardId(arch.id);
                            }}
                            className={'carousel-card-item ' + (idx === giveCarouselIndex ? 'active' : '')}
                            style={{
                              transform: 'translateX(' + translateX + 'px) translateZ(' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')',
                              opacity,
                              zIndex,
                              borderColor: isSelected ? '#A9DDD3' : arch.glowColor,
                              boxShadow: isSelected
                                ? '0 0 45px #A9DDD3, 0 0 20px ' + arch.glowColor
                                : idx === giveCarouselIndex
                                ? '0 0 35px ' + arch.glowColor + '60'
                                : undefined,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '10px', fontWeight: 900, color: arch.glowColor }}>
                                {arch.badgeEmoji} {arch.rarity}
                              </span>
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, #EF4444, #F97316)',
                                  color: '#FFFFFF',
                                  fontSize: '10px',
                                  fontWeight: 900,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                                }}
                              >
                                🔥 DUPLICATE (x{count})
                              </span>
                            </div>

                            <div style={{ width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', margin: '8px 0', border: '1.5px solid ' + arch.glowColor + '40' }}>
                              <img
                                src={arch.image}
                                alt={arch.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#040814' }}>{arch.title}</div>
                              <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {arch.lore}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOfferCardId(arch.id);
                                setTradeStep('want');
                              }}
                              style={{
                                marginTop: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: 'none',
                                background: isSelected ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #A9DDD3, #2563EB)',
                                color: isSelected ? '#FFFFFF' : '#040814',
                                fontSize: '11px',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              {isSelected ? (
                                <>
                                  <Check size={14} /> Selected to Give
                                </>
                              ) : (
                                <>
                                  <span>Select This Duplicate</span> ➔
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {cardsToGive.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setGiveCarouselIndex(
                            (prev) => (prev + 1) % cardsToGive.length
                          )
                        }
                        className="carousel-nav-btn next"
                        title="Next Duplicate"
                      >
                        <ChevronRight style={{ width: '28px', height: '28px' }} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                CAROUSEL 2: CARD YOU WANT (WITH ANTI-SPAM RESTRICTION)
                ======================================================== */}
            {tradeStep === 'want' && (
              <div style={{ width: '100%' }}>
                <div className="carousel-3d-stage" style={{ height: '430px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setWantCarouselIndex(
                        (prev) => (prev - 1 + ALL_30_CARDS.length) % ALL_30_CARDS.length
                      )
                    }
                    className="carousel-nav-btn prev"
                    title="Previous Card"
                  >
                    <ChevronLeft style={{ width: '28px', height: '28px' }} />
                  </button>

                  <div className="carousel-track">
                    {ALL_30_CARDS.map((arch, idx) => {
                      const offset = idx - wantCarouselIndex;
                      const absOffset = Math.abs(offset);
                      const isVisible = absOffset <= 2;

                      if (!isVisible) return null;

                      const translateX = offset * 210;
                      const translateZ = -absOffset * 150;
                      const rotateY = offset * -25;
                      const scale = 1 - absOffset * 0.12;
                      const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.4;
                      const zIndex = 10 - absOffset;

                      const ownedCount = inventory[arch.id] || 0;
                      const isMissing = ownedCount === 0;
                      const isSelected = selectedRequestCardId === arch.id;
                      const isSameAsOffered = selectedOfferCardId === arch.id;
                      const isAlreadyRequested = alreadyRequestedCardIds.has(arch.id);

                      return (
                        <div
                          key={arch.id}
                          onClick={() => {
                            if (isSameAsOffered) {
                              showToast('Cannot request the same card you are offering!');
                              return;
                            }
                            if (isAlreadyRequested) {
                              showToast('You already have an active trade offer requesting this card!');
                              return;
                            }
                            setWantCarouselIndex(idx);
                            setSelectedRequestCardId(arch.id);
                          }}
                          className={'carousel-card-item ' + (idx === wantCarouselIndex ? 'active' : '')}
                          style={{
                            transform: 'translateX(' + translateX + 'px) translateZ(' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')',
                            opacity: isAlreadyRequested || isSameAsOffered ? 0.4 : opacity,
                            zIndex,
                            borderColor: isSelected ? '#10B981' : arch.glowColor,
                            boxShadow: isSelected
                              ? '0 0 45px #10B981, 0 0 20px ' + arch.glowColor
                              : idx === wantCarouselIndex
                              ? '0 0 35px ' + arch.glowColor + '60'
                              : undefined,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: arch.glowColor }}>
                              {arch.badgeEmoji} {arch.rarity}
                            </span>
                            {isAlreadyRequested ? (
                              <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#FCA5A5', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px' }}>
                                ⚠️ ALREADY REQUESTED
                              </span>
                            ) : isSameAsOffered ? (
                              <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px' }}>
                                CANNOT SWAP SAME
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: isMissing ? 'rgba(169, 221, 211, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                                  border: '1px solid ' + (isMissing ? 'rgba(169, 221, 211, 0.5)' : 'rgba(16, 185, 129, 0.5)'),
                                  color: isMissing ? '#A9DDD3' : '#10B981',
                                  fontSize: '9px',
                                  fontWeight: 900,
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                }}
                              >
                                {isMissing ? '✦ MISSING (NEED)' : '✓ OWNED (x' + ownedCount + ')'}
                              </span>
                            )}
                          </div>

                          <div style={{ width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', margin: '8px 0', border: '1.5px solid ' + arch.glowColor + '40' }}>
                            <img
                              src={arch.image}
                              alt={arch.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#040814' }}>{arch.title}</div>
                            <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {arch.lore}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isSameAsOffered || isAlreadyRequested}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSameAsOffered) {
                                showToast('Cannot request the same card you are offering!');
                                return;
                              }
                              if (isAlreadyRequested) {
                                showToast('You already have an active trade offer requesting this card!');
                                return;
                              }
                              setSelectedRequestCardId(arch.id);
                            }}
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: 'none',
                              background: isSelected
                                ? 'linear-gradient(135deg, #10B981, #059669)'
                                : isAlreadyRequested || isSameAsOffered
                                ? 'rgba(100, 116, 139, 0.2)'
                                : 'linear-gradient(135deg, #059669, #0d9488)',
                              color: isAlreadyRequested || isSameAsOffered ? '#94A3B8' : '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 900,
                              cursor: isAlreadyRequested || isSameAsOffered ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check size={14} /> Selected to Receive
                              </>
                            ) : isAlreadyRequested ? (
                              'Already in Active Request'
                            ) : (
                              'Select This Card to Receive'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setWantCarouselIndex(
                        (prev) => (prev + 1) % ALL_30_CARDS.length
                      )
                    }
                    className="carousel-nav-btn next"
                    title="Next Card"
                  >
                    <ChevronRight style={{ width: '28px', height: '28px' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Confirmation Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                maxWidth: '740px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--rialo-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#A9DDD3" />
                <span>Zero Gas Fee • Gasless P2P Swap • +25 Whitelist Points</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {tradeStep === 'want' && (
                  <button
                    type="button"
                    onClick={() => setTradeStep('give')}
                    style={{
                      padding: '10px 18px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCreateTrade}
                  disabled={!selectedOfferCardId || !selectedRequestCardId || actionLoading}
                  style={{
                    padding: '10px 24px',
                    background: selectedOfferCardId && selectedRequestCardId
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '12px',
                    color: selectedOfferCardId && selectedRequestCardId ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: selectedOfferCardId && selectedRequestCardId ? 'pointer' : 'not-allowed',
                    boxShadow: selectedOfferCardId && selectedRequestCardId ? '0 4px 18px rgba(16, 185, 129, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus size={16} />
                  <span>{actionLoading ? 'Publishing...' : 'Publish Trade Offer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
