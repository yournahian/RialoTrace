import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, Sparkles, RefreshCw, Copy, Check, Palette, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { exportRialoCardPNG } from './RialoCardCanvasExporter';
import { RialoLogo, RialoIcon } from './RialoLogo';

export interface CardArchetype {
  id: string;
  title: string;
  lore: string;
  rarity: 'MYTHIC' | 'LEGENDARY' | 'EPIC' | 'RARE';
  glowColor: string;
  image: string;
  badgeEmoji: string;
  iconBg: string;
}

// 10 100% Original Rialo Archetypes with high-res anime cyberpunk illustrations
export const RIALO_ARCHETYPES: Record<string, CardArchetype> = {
  pioneer: {
    id: 'pioneer',
    title: 'Genesis Pioneer',
    lore: 'Bridged liquidity on Genesis Block #1 and never bridged back. Holds unshakable conviction in the Economic OS.',
    rarity: 'MYTHIC',
    glowColor: '#00E5FF',
    image: '/cards/pioneer.png',
    badgeEmoji: '🚀',
    iconBg: '#00E5FF',
  },
  architect: {
    id: 'architect',
    title: 'Economic Architect',
    lore: 'Deploys composable financial primitives directly to Rialo testnet. Sub-second finality is their native language.',
    rarity: 'LEGENDARY',
    glowColor: '#F59E0B',
    image: '/cards/architect.png',
    badgeEmoji: '⚙️',
    iconBg: '#F59E0B',
  },
  usdc_titan: {
    id: 'usdc_titan',
    title: 'USDC Liquidity Titan',
    lore: 'Trades exclusively on native Circle USDC settlement rails. Zero synthetic wrapped tokens, pure capital efficiency.',
    rarity: 'MYTHIC',
    glowColor: '#8B5CF6',
    image: '/cards/usdc_titan.png',
    badgeEmoji: '💎',
    iconBg: '#8B5CF6',
  },
  finalizer: {
    id: 'finalizer',
    title: 'Sub-Second Finalizer',
    lore: 'Settles state transitions in under 400ms. Executes opinions before other L1s can even calculate gas fees.',
    rarity: 'LEGENDARY',
    glowColor: '#EF4444',
    image: '/cards/finalizer.png',
    badgeEmoji: '⚡',
    iconBg: '#EF4444',
  },
  navigator: {
    id: 'navigator',
    title: 'CCTP Navigator',
    lore: 'Teleports multi-chain liquidity across Ethereum, Solana, and Rialo with zero slippage via native CCTP conduits.',
    rarity: 'EPIC',
    glowColor: '#EC4899',
    image: '/cards/navigator.png',
    badgeEmoji: '🌐',
    iconBg: '#EC4899',
  },
  sentinel: {
    id: 'sentinel',
    title: 'Deterministic Sentinel',
    lore: 'Protects the timeline with verifiable metrics and TPS charts. Believes in fast, sub-second deterministic settlement.',
    rarity: 'RARE',
    glowColor: '#10B981',
    image: '/cards/sentinel.png',
    badgeEmoji: '🛡️',
    iconBg: '#10B981',
  },
  vanguard: {
    id: 'vanguard',
    title: 'Gasless Vanguard',
    lore: 'Executes transactions sponsored entirely by paymasters. Never once held gas tokens, floating frictionless on Rialo.',
    rarity: 'EPIC',
    glowColor: '#F97316',
    image: '/cards/vanguard.png',
    badgeEmoji: '🔥',
    iconBg: '#F97316',
  },
  sovereign: {
    id: 'sovereign',
    title: 'Consensus Sovereign',
    lore: 'Validates every epoch with mathematically proven finality. The supreme judge of sub-second state agreement.',
    rarity: 'MYTHIC',
    glowColor: '#EAB308',
    image: '/cards/sovereign.png',
    badgeEmoji: '👑',
    iconBg: '#EAB308',
  },
  arbitrageur: {
    id: 'arbitrageur',
    title: 'Quantum Arbitrageur',
    lore: 'Extracts zero-risk multi-chain spread between Rialo and external L1s before mempools even serialize.',
    rarity: 'LEGENDARY',
    glowColor: '#06B6D4',
    image: '/cards/arbitrageur.png',
    badgeEmoji: '🌀',
    iconBg: '#06B6D4',
  },
  devourer: {
    id: 'devourer',
    title: 'Testnet Devourer',
    lore: 'Claimed every faucet drop, broke 14 testnet nodes, and stress-tested Rialo to 40,000 TPS just for fun.',
    rarity: 'RARE',
    glowColor: '#84CC16',
    image: '/cards/devourer.png',
    badgeEmoji: '🌟',
    iconBg: '#84CC16',
  },
};

const ARCHETYPES_LIST = Object.values(RIALO_ARCHETYPES);

export const RialoCards: React.FC = () => {
  // Free input field by default: empty string
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('pioneer');
  // Starts with card back showing (unrevealed pack)
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [openingStage, setOpeningStage] = useState<'idle' | 'charging' | 'spinning' | 'revealed'>('idle');
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 3D Carousel Customizer State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  // Smooth card flip handler
  const toggleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (openingStage === 'charging' || openingStage === 'spinning') return;
    setIsFlipping(true);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    setIsFlipped((prev) => !prev);
    setTimeout(() => {
      setIsFlipping(false);
    }, 700);
  };

  // Keyboard navigation for 3D carousel
  useEffect(() => {
    if (!isCustomizerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCarouselIndex((prev) => (prev - 1 + ARCHETYPES_LIST.length) % ARCHETYPES_LIST.length);
      } else if (e.key === 'ArrowRight') {
        setCarouselIndex((prev) => (prev + 1) % ARCHETYPES_LIST.length);
      } else if (e.key === 'Escape') {
        setIsCustomizerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCustomizerOpen]);

  // Opening / Reveal Animation Trigger
  const triggerOpeningSequence = (targetArchetypeId?: string) => {
    if (targetArchetypeId) setSelectedArchetypeId(targetArchetypeId);
    setIsFlipped(false);
    setOpeningStage('charging');

    // Stage 1: Card charges up and vibrates with glowing aura (550ms)
    setTimeout(() => {
      setOpeningStage('spinning');

      // Stage 2: In the middle of 3D rotation, switch face to front and trigger flash
      setTimeout(() => {
        setIsFlipped(true);
        setShowFlash(true);
      }, 450);

      // Stage 3: Snap into place face-up with bounce
      setTimeout(() => {
        setOpeningStage('revealed');
        setHasRevealed(true);
        setTimeout(() => setShowFlash(false), 700);

        // Reset stage to idle after reveal so it completely frees transform and allows smooth 3D flipping!
        setTimeout(() => {
          setOpeningStage('idle');
        }, 600);
      }, 900);
    }, 550);
  };

  const fetchUserCard = async (targetHandle: string) => {
    const clean = targetHandle.replace('@', '').trim();
    if (!clean) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/impressions?handle=${encodeURIComponent(clean)}`);
      const json = await res.json();
      let assignedArchetype = 'navigator';

      if (json && json.ok) {
        setUserData({
          user: {
            handle: json.username || clean,
            name: json.profile?.name || clean,
            profile_image_url: json.profile?.avatar || '',
          },
          totalImpressions: json.total_impressions || 0,
          totalPosts: json.post_count || 0,
          tweets: json.posts || [],
        });

        // Smart assignment according to engagement metrics
        const imps = json.total_impressions || 0;
        if (clean.toLowerCase() === 'yournahian') {
          assignedArchetype = 'pioneer';
        } else if (imps > 100000) {
          assignedArchetype = 'usdc_titan';
        } else if (imps > 50000) {
          assignedArchetype = 'sovereign';
        } else if (imps > 25000) {
          assignedArchetype = 'architect';
        } else if (imps > 10000) {
          assignedArchetype = 'finalizer';
        } else if (imps > 5000) {
          assignedArchetype = 'vanguard';
        } else if (imps > 2000) {
          assignedArchetype = 'arbitrageur';
        } else if (imps > 500) {
          assignedArchetype = 'devourer';
        } else {
          const pool = ['navigator', 'sentinel', 'vanguard', 'pioneer'];
          assignedArchetype = pool[Math.floor(Math.random() * pool.length)];
        }
      } else {
        setUserData({
          user: { handle: clean, name: clean, profile_image_url: '' },
          totalImpressions: 0,
          totalPosts: 0,
          tweets: [],
        });
        const allIds = Object.keys(RIALO_ARCHETYPES);
        assignedArchetype = allIds[Math.floor(Math.random() * allIds.length)];
      }

      triggerOpeningSequence(assignedArchetype);
    } catch (e) {
      console.error(e);
      const allIds = Object.keys(RIALO_ARCHETYPES);
      triggerOpeningSequence(allIds[Math.floor(Math.random() * allIds.length)]);
    } finally {
      setLoading(false);
    }
  };

  const archetype = RIALO_ARCHETYPES[selectedArchetypeId] || RIALO_ARCHETYPES.pioneer;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (openingStage === 'charging' || openingStage === 'spinning') return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleCardClick = () => {
    if (openingStage === 'charging' || openingStage === 'spinning') return;
    if (!hasRevealed) {
      if (!userData) {
        const allIds = Object.keys(RIALO_ARCHETYPES);
        const randId = allIds[Math.floor(Math.random() * allIds.length)];
        triggerOpeningSequence(randId);
      } else {
        triggerOpeningSequence();
      }
    } else {
      toggleFlip();
    }
  };

  const handleDownload = async () => {
    const handleToUse = userData?.user?.handle || (inputVal.trim() ? inputVal.trim() : 'creator');
    setDownloading(true);
    try {
      const blob = await exportRialoCardPNG({
        handle: handleToUse,
        name: userData?.user?.name || handleToUse,
        avatar: userData?.user?.profile_image_url || '',
        cardImage: archetype.image,
        archetypeId: archetype.id,
        archetypeTitle: archetype.title,
        archetypeLore: archetype.lore,
        rarity: archetype.rarity,
        impressions: userData?.totalImpressions || 0,
        wave: 'WAVE 1 • MAINNET',
        glowColor: archetype.glowColor,
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${handleToUse}-rialo-card.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareX = () => {
    const handleToUse = userData?.user?.handle || (inputVal.trim() ? inputVal.trim() : 'creator');
    const text = encodeURIComponent(
      `I forged my official @RialoHQ Collectible Card: ${archetype.badgeEmoji} ${archetype.title} (${archetype.rarity})!\n\n⚡ Total Rialo Impressions: ${(userData?.totalImpressions || 0).toLocaleString()}\n🌊 Wave 1 Genesis\n\nForge your Rialo Card on @RialoTrace:`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const displayHandle = userData?.user?.handle || (inputVal.trim() ? inputVal.trim() : 'yournahian');

  const getAnimationClass = () => {
    if (openingStage === 'charging') return 'card-is-charging';
    if (openingStage === 'spinning') return 'card-is-spinning';
    if (openingStage === 'revealed') return 'card-just-revealed';
    if (isFlipping) return 'is-flipping-transition';
    return '';
  };

  const handleEquipFromCarousel = (arch: CardArchetype) => {
    setSelectedArchetypeId(arch.id);
    setIsCustomizerOpen(false);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 600);
  };

  return (
    <div className="monad-style-stage animate-fade-in">
      {/* Top Search Bar (Clean, no chips above) */}
      <div className="monad-search-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputVal.trim()) fetchUserCard(inputVal.trim());
          }}
          className="monad-search-form"
        >
          <div className="monad-input-pill">
            <span className="monad-input-prefix">@</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter your X username to forge card"
              className="monad-input-field"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="monad-btn-generate"
          >
            {loading ? 'Forging...' : '⚡ Forge & Reveal Card'}
          </button>
        </form>
      </div>

      {/* Main 3D Card Stage */}
      <div className="monad-stage-center">
        {/* Card and Action Side Buttons Wrapper */}
        <div className="monad-card-and-actions">
          {/* Ambient Spotlight Beams (Rialo Mystery Stage) */}
          <div className={`card-spotlight-backdrop ${openingStage === 'charging' ? 'charging' : ''}`}>
            <div className="card-beam" />
            <div className="card-beam" />
            <div className="card-beam" />
            <div className="card-beam" />
            <div className="card-beam" />
            <div className="card-beam" />
          </div>

          {/* Flash burst overlay on reveal */}
          {showFlash && <div className="card-flash-burst" />}

          {/* Card Canvas with 3D Perspective */}
          <div
            className="monad-perspective-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={cardRef}
              onClick={handleCardClick}
              className={`monad-card-3d ${getAnimationClass()}`}
              style={{
                transform: openingStage === 'spinning' || openingStage === 'charging'
                  ? undefined
                  : `rotateX(${tilt.x}deg) rotateY(${isFlipped ? tilt.y : 180 - tilt.y}deg)`,
                boxShadow: isFlipped
                  ? `0 0 55px ${archetype.glowColor}66, 0 0 110px ${archetype.glowColor}33`
                  : '0 0 50px rgba(0, 229, 255, 0.5), 0 0 100px rgba(99, 102, 241, 0.3)',
              }}
            >
              {/* CARD FRONT (Original Arc Aesthetics) */}
              <div
                className="monad-card-face monad-card-front"
                style={{
                  border: `2px solid ${archetype.glowColor}`,
                }}
              >
                {/* Holographic dynamic sheen */}
                <div
                  className="monad-holographic-sheen"
                  style={{
                    background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`,
                  }}
                />

                {/* Top Nameplate Box with User's X Avatar / DP */}
                <div className="monad-card-nameplate">
                  <div className="monad-nameplate-user">
                    {userData?.user?.profile_image_url ? (
                      <img
                        src={userData.user.profile_image_url}
                        alt={displayHandle}
                        className="monad-user-dp"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="monad-user-dp-placeholder"
                        style={{
                          background: `linear-gradient(135deg, ${archetype.glowColor}, #3B82F6)`,
                        }}
                      >
                        {displayHandle.replace('@', '').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="monad-nameplate-text">
                      @{displayHandle}
                    </span>
                  </div>
                  <div
                    className="monad-nameplate-star"
                    style={{ color: archetype.glowColor }}
                  >
                    ✦
                  </div>
                </div>

                {/* Character Artwork Frame */}
                <div className="monad-art-frame">
                  <img
                    src={archetype.image}
                    alt={archetype.title}
                    className="monad-art-image"
                  />
                </div>

                {/* Trait Box (Original Arc Archetype) */}
                <div className="monad-trait-card">
                  <div
                    className="monad-trait-icon-box"
                    style={{ background: archetype.iconBg }}
                  >
                    <span className="monad-trait-icon">{archetype.badgeEmoji}</span>
                  </div>
                  <div className="monad-trait-content">
                    <div className="monad-trait-title">
                      {archetype.title}
                    </div>
                    <p className="monad-trait-lore">
                      {archetype.lore}
                    </p>
                  </div>
                </div>

                {/* Bottom Footer: Brand & Wave Stamp */}
                <div className="monad-card-footer">
                  <span className="monad-footer-brand">Rialo Cards</span>
                  <div className="monad-wave-badge">
                    <span>WAVE 1</span>
                  </div>
                </div>
              </div>

              {/* CARD BACK (Unrevealed Official Holographic Back) */}
              <div
                className="monad-card-face monad-card-back"
                style={{
                  border: '2px solid rgba(0, 229, 255, 0.7)',
                  boxShadow: '0 0 50px rgba(0, 229, 255, 0.5)',
                }}
              >
                <div className="monad-back-header">
                  <span>RIALO CARDS</span>
                  <span>SERIES 1</span>
                </div>

                <div className="monad-back-center-logo">
                  <div className="monad-back-emblem">
                    <RialoIcon size={52} color="#A9DDD3" />
                  </div>
                  <div className="monad-back-title">rialo.io</div>
                  <div className="monad-back-subtitle">GENESIS WAVE 1</div>
                </div>

                <div className="monad-back-cta">
                  <Sparkles style={{ width: '16px', height: '16px', color: '#00E5FF' }} />
                  <span>{openingStage === 'charging' ? 'CHARGING ENERGY...' : 'CLICK TO REVEAL CARD'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Buttons Beside Card (Utility controls only: Flip, Download, Copy) */}
          <div className="monad-floating-actions">
            {/* Flip Card (Front / Back toggle) */}
            <button
              type="button"
              onClick={toggleFlip}
              title={isFlipped ? 'Flip to Card Back' : 'Flip to Card Front'}
              className={`monad-action-circle ${!isFlipped ? 'active-flip' : ''}`}
            >
              <RefreshCw
                style={{
                  width: '18px',
                  height: '18px',
                  transform: !isFlipped ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.4s ease',
                }}
              />
            </button>

            {/* Download Card PNG */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download Card PNG"
              className="monad-action-circle"
            >
              <Download style={{ width: '18px', height: '18px' }} />
            </button>

            {/* Copy Card Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Card Link"
              className="monad-action-circle"
            >
              {copiedLink ? <Check style={{ width: '18px', height: '18px', color: '#10B981' }} /> : <Copy style={{ width: '18px', height: '18px' }} />}
            </button>
          </div>
        </div>

        {/* Big Rialo Cards Title & Footer Banner */}
        <div className="monad-banner-footer">
          {!hasRevealed && (
            <div className="unrevealed-badge">
              <Sparkles style={{ width: '14px', height: '14px' }} />
              <span>GENESIS RIALO PACK • UNREVEALED</span>
            </div>
          )}

          <h1 className="monad-huge-title">RIALO CARDS</h1>
          <div className="monad-wave-divider">
            <span className="divider-line" />
            <span className="divider-text">WAVE 1 — GENESIS</span>
            <span className="divider-line" />
          </div>
          <p className="monad-quote-text">
            &ldquo;Forged on sub-second finality for the Rialo Community&rdquo;
          </p>
          <div className="monad-signed-in">
            Forged for <span className="signed-handle">@{displayHandle || 'yournahian'}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {!hasRevealed ? (
              <button
                type="button"
                onClick={() => triggerOpeningSequence()}
                className="monad-claim-button"
                style={{
                  boxShadow: '0 0 35px rgba(0, 229, 255, 0.7)',
                  background: 'linear-gradient(135deg, #00E5FF, #2563EB)',
                  color: '#040814',
                  fontWeight: 900,
                }}
              >
                ⚡ Open & Reveal Card ⚡
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleShareX}
                  className="monad-claim-button"
                  style={{
                    boxShadow: `0 0 35px ${archetype.glowColor}88`,
                    background: `linear-gradient(135deg, ${archetype.glowColor}, #2563EB)`,
                  }}
                >
                  Claim & Share to X
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const idx = ARCHETYPES_LIST.findIndex((a) => a.id === selectedArchetypeId);
                    setCarouselIndex(idx >= 0 ? idx : 0);
                    setIsCustomizerOpen(true);
                  }}
                  className="choose-yours-btn"
                >
                  <Palette style={{ width: '16px', height: '16px' }} />
                  <span>Choose Yours</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerOpeningSequence()}
                  className="replay-reveal-btn"
                >
                  <Sparkles style={{ width: '15px', height: '15px', color: '#00E5FF' }} />
                  <span>Replay Animation</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3D Card Carousel Customizer Modal (Facebook Reel 3D Carousel Inspiration) */}
      {isCustomizerOpen && (
        <div
          className="carousel-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCustomizerOpen(false);
          }}
        >
          <div className="carousel-modal-container">
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="carousel-close-btn"
              title="Close Customizer"
            >
              <X style={{ width: '22px', height: '22px' }} />
            </button>

            <div className="carousel-header">
              <h2 className="carousel-title">CHOOSE YOURS</h2>
              <div className="carousel-subtitle">
                3D ARCHETYPE CAROUSEL // 10 GENESIS RIALO WARRIORS
              </div>
            </div>

            {/* 3D Carousel Stage */}
            <div className="carousel-3d-stage">
              <button
                type="button"
                onClick={() =>
                  setCarouselIndex((prev) => (prev - 1 + ARCHETYPES_LIST.length) % ARCHETYPES_LIST.length)
                }
                className="carousel-nav-btn prev"
                title="Previous Archetype"
              >
                <ChevronLeft style={{ width: '28px', height: '28px' }} />
              </button>

              <div className="carousel-track">
                {ARCHETYPES_LIST.map((arch, idx) => {
                  const offset = idx - carouselIndex;
                  const absOffset = Math.abs(offset);
                  const isVisible = absOffset <= 2;

                  if (!isVisible) return null;

                  const translateX = offset * 240;
                  const translateZ = absOffset === 0 ? 90 : -130 * absOffset;
                  const rotateY = offset * -28;
                  const scale = absOffset === 0 ? 1.05 : 0.82;
                  const opacity = absOffset === 0 ? 1 : Math.max(0.35, 1 - absOffset * 0.35);

                  return (
                    <div
                      key={arch.id}
                      onClick={() => setCarouselIndex(idx)}
                      className={`carousel-card-item ${absOffset === 0 ? 'active' : ''}`}
                      style={{
                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        opacity,
                        zIndex: 20 - absOffset,
                        borderColor: absOffset === 0 ? arch.glowColor : 'rgba(255,255,255,0.15)',
                        boxShadow: absOffset === 0
                          ? `0 0 50px ${arch.glowColor}88, 0 0 100px ${arch.glowColor}44`
                          : '0 10px 30px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Nameplate */}
                      <div className="monad-card-nameplate" style={{ height: '36px', padding: '0 12px' }}>
                        <div className="monad-nameplate-user">
                          {userData?.user?.profile_image_url ? (
                            <img
                              src={userData.user.profile_image_url}
                              alt={displayHandle}
                              className="monad-user-dp"
                              style={{ width: '22px', height: '22px' }}
                            />
                          ) : (
                            <div
                              className="monad-user-dp-placeholder"
                              style={{ width: '22px', height: '22px', fontSize: '11px', background: arch.glowColor }}
                            >
                              {displayHandle.replace('@', '').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="monad-nameplate-text" style={{ fontSize: '13px' }}>
                            @{displayHandle}
                          </span>
                        </div>
                        <div className="monad-nameplate-star" style={{ color: arch.glowColor, fontSize: '14px' }}>
                          ✦
                        </div>
                      </div>

                      {/* Art */}
                      <div className="monad-art-frame" style={{ height: '200px', margin: '4px 0' }}>
                        <img
                          src={arch.image}
                          alt={arch.title}
                          className="monad-art-image"
                        />
                      </div>

                      {/* Trait Box */}
                      <div className="monad-trait-card" style={{ minHeight: '80px', padding: '8px 10px' }}>
                        <div
                          className="monad-trait-icon-box"
                          style={{ width: '40px', height: '40px', background: arch.iconBg }}
                        >
                          <span className="monad-trait-icon" style={{ fontSize: '20px' }}>{arch.badgeEmoji}</span>
                        </div>
                        <div className="monad-trait-content">
                          <div className="monad-trait-title" style={{ fontSize: '13px' }}>
                            {arch.title}
                          </div>
                          <p className="monad-trait-lore" style={{ fontSize: '10px', lineHeight: 1.3 }}>
                            {arch.lore}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="monad-card-footer" style={{ padding: '0 4px' }}>
                        <span className="monad-footer-brand" style={{ fontSize: '10px' }}>Rialo Cards</span>
                        <div
                          className="monad-wave-badge"
                          style={{ background: arch.glowColor, color: '#040814', fontWeight: 900 }}
                        >
                          <span>{arch.rarity}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => (prev + 1) % ARCHETYPES_LIST.length)}
                className="carousel-nav-btn next"
                title="Next Archetype"
              >
                <ChevronRight style={{ width: '28px', height: '28px' }} />
              </button>
            </div>

            {/* Carousel Bottom Control Bar */}
            <div className="carousel-bottom-bar">
              {/* Dots */}
              <div className="carousel-dots">
                {ARCHETYPES_LIST.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    onClick={() => setCarouselIndex(dotIdx)}
                    className={`carousel-dot ${dotIdx === carouselIndex ? 'active' : ''}`}
                  />
                ))}
              </div>

              {/* Equip Button */}
              <button
                type="button"
                onClick={() => handleEquipFromCarousel(ARCHETYPES_LIST[carouselIndex])}
                className="carousel-equip-btn"
                style={{
                  background: `linear-gradient(135deg, ${ARCHETYPES_LIST[carouselIndex].glowColor}, #3B82F6)`,
                  boxShadow: `0 0 35px ${ARCHETYPES_LIST[carouselIndex].glowColor}99`,
                }}
              >
                <span>{ARCHETYPES_LIST[carouselIndex].badgeEmoji}</span>
                <span>Equip {ARCHETYPES_LIST[carouselIndex].title}</span>
                <Sparkles style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
