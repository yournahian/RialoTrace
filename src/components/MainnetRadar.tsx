import React, { useState } from 'react';
import {
  Radio,
  ShieldCheck,
  Zap,
  Layers,
  Copy,
  Check,
  Activity,
  Sparkles,
  ExternalLink,
  BookOpen,
  Terminal,
  Cpu,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

const RIALO_ARTICLES = [
  {
    id: '001',
    title: 'Reactive Transactions: A Model for Native Automation on Rialo',
    date: 'Apr 2026',
    tag: 'Native Automation',
    desc: 'Current blockchain applications rely on a fragile tower of offchain automation to function. Rialo introduces native reactive state machine automation.',
    url: 'https://www.rialo.io/posts/reactive-transactions-a-model-for-native-automation-on-rialo',
  },
  {
    id: '002',
    title: 'Rialo Foundations II: Supermodularity and Blockchain Integration',
    date: 'Apr 2026',
    tag: 'Supermodularity',
    desc: '"Modular vs. monolithic" has been one of crypto\'s defining debates. Rialo replaces this framing with supermodularity and total system welfare.',
    url: 'https://www.rialo.io/posts/rialo-foundations-ii-supermodularity',
  },
  {
    id: '003',
    title: 'Supermodularity and System Welfare: The Economics of Integration',
    date: 'Apr 2026',
    tag: 'Protocol Economics',
    desc: 'Supermodularity serves as a formal guide for determining what components to natively integrate to maximize economic efficiency and user surplus.',
    url: 'https://www.rialo.io/posts/supermodularity-and-system-welfare-the-economics-of-integration',
  },
  {
    id: '004',
    title: 'Rethinking Protocol Upgrades with Gauss',
    date: 'Apr 2026',
    tag: 'Consensus & SMR',
    desc: 'State machine replication (SMR) underpins distributed systems. Gauss introduces zero-downtime hot upgrades and verifiable state continuity.',
    url: 'https://www.rialo.io/posts/rethinking-protocol-upgrades-with-gauss',
  },
  {
    id: '005',
    title: 'Building Native Privacy for Real-World Blockchain Adoption',
    date: 'Jan 2026',
    tag: 'Institutional Privacy',
    desc: 'Public blockchains need open settlement, but institutions need confidentiality. Rialo delivers configurable native privacy for real-world finance.',
    url: 'https://www.rialo.io/posts/building-native-privacy-for-real-world-blockchain-adoption',
  },
  {
    id: '006',
    title: 'Building Blocks of Threshold Cryptography: Distributed Key Generation',
    date: 'Apr 2026',
    tag: 'Cryptography',
    desc: 'Threshold cryptography enables decentralized collective control without giving any single participant unilateral authority.',
    url: 'https://www.rialo.io/posts/understanding-distributed-key-generation',
  },
  {
    id: '007',
    title: 'Stake for Service: A Better Way to Pay on Rialo',
    date: 'Dec 2025',
    tag: 'Gasless Economics',
    desc: 'Eliminating the awkward split between capital and consumption. Stake-for-Service enables predictable compute allocation without gas token friction.',
    url: 'https://www.rialo.io/posts/stake-for-service',
  },
  {
    id: '008',
    title: 'Making the Agent Economy Simple and Safe with Rialo',
    date: 'Dec 2025',
    tag: 'AI Agent Infrastructure',
    desc: 'Autonomous AI systems need decentralized execution rails with configurable privacy to transact securely at scale.',
    url: 'https://www.rialo.io/posts/making-the-agent-economy-simple-and-safe-with-rialo',
  },
  {
    id: '009',
    title: 'Rialo Makes Real World Assets Real',
    date: 'Dec 2025',
    tag: 'RWAs & Institutional',
    desc: 'Solving the throughput, privacy, and compliance bottlenecks that have historically prevented real-world assets from scaling on-chain.',
    url: 'https://www.rialo.io/posts/rialo-makes-real-world-assets-real',
  },
];

const BACKERS = [
  'Coinbase',
  'Pantera Capital',
  'Susquehanna',
  'Mysten Labs',
  'Edge Capital',
  'Mirana',
  'Nasdaq',
  'CBOE',
  'NYSE',
  'Predicate',
  'DoubleZero',
  'M0',
  'Keplr',
];

export const MainnetRadar: React.FC = () => {
  const [copiedRpc, setCopiedRpc] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRpc(true);
    setTimeout(() => setCopiedRpc(false), 2000);
  };

  return (
    <div className="feature-view-container animate-fade-in">
      {/* Hero Status Banner: Launch Coming Soon & Active Playground */}
      <div className="radar-hero-box">
        {/* Pulsing Status Pill */}
        <div className="feature-pill-badge" style={{ borderColor: 'rgba(169, 221, 211, 0.4)', color: '#A9DDD3' }}>
          <span className="card-wave-dot" style={{ background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
          <span>CURRENT PHASE: ACTIVE PLAYGROUND TESTNET (playground.rialo.io)</span>
        </div>

        <h2 className="feature-title">
          Rialo Mainnet Launch <span className="gradient-text-amber">Coming Soon</span>
        </h2>
        <p className="feature-desc">
          Rialo is the high-throughput network with configurable privacy built for real-world finance and intelligent systems.
          Mainnet launch date has not yet been published — the network is currently live in active developer playground testnet.
        </p>

        {/* Roadmap Stages Bar (Playground itself is Testnet) */}
        <div className="roadmap-stages-grid">
          {[
            {
              stage: 'PHASE 01',
              title: 'Research & SMR',
              status: 'Completed',
              color: '#10B981',
              active: false,
              icon: '✅',
            },
            {
              stage: 'PHASE 02',
              title: 'Playground Testnet',
              status: 'Live Now (Online)',
              color: '#A9DDD3',
              active: true,
              icon: '🟢',
            },
            {
              stage: 'PHASE 03',
              title: 'Public Mainnet',
              status: 'Coming Soon',
              color: '#60A5FA',
              active: false,
              icon: '⏳',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`roadmap-stage-card ${item.active ? 'stage-active' : ''}`}
            >
              <div className="stage-top-row">
                <span className="stage-num">{item.stage}</span>
                <span className="stage-icon">{item.icon}</span>
              </div>
              <div className="stage-title">{item.title}</div>
              <div className="stage-status" style={{ color: item.color }}>
                {item.status}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Developer Action CTAs */}
        <div className="playground-cta-bar">
          <a
            href="https://playground.rialo.io"
            target="_blank"
            rel="noopener noreferrer"
            className="monad-claim-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #A9DDD3, #2563EB)',
              color: '#010101',
              fontWeight: 800,
            }}
          >
            <Terminal style={{ width: '16px', height: '16px' }} />
            <span>Enter Developer Playground</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>

          <a
            href="https://learn.rialo.io"
            target="_blank"
            rel="noopener noreferrer"
            className="choose-yours-btn"
            style={{ textDecoration: 'none' }}
          >
            <BookOpen style={{ width: '16px', height: '16px' }} />
            <span>Learn Architecture</span>
          </a>

          <a
            href="https://rialo.io/posts/subzero-labs-cboe-innovation-spotlight"
            target="_blank"
            rel="noopener noreferrer"
            className="choose-yours-btn"
            style={{ textDecoration: 'none', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#F59E0B' }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span>CBOE Innovation Spotlight</span>
          </a>
        </div>
      </div>

      {/* 4 Core Architectural Pillars from rialo.io */}
      <div className="radar-pillars-grid">
        {[
          {
            icon: Zap,
            title: 'Reactive Transactions',
            desc: 'Native state machine automation without relying on external off-chain bots, keepers, or cron triggers.',
            status: 'Core Architecture',
            color: '#A9DDD3',
          },
          {
            icon: Cpu,
            title: 'Supermodularity Engine',
            desc: 'Next-generation system welfare integration: maximizing throughput and economic efficiency for decentralized applications.',
            status: 'Gauss Consensus',
            color: '#00E5FF',
          },
          {
            icon: Lock,
            title: 'Configurable Native Privacy',
            desc: 'Threshold cryptography and distributed key generation engineered for institutional compliance and real-world assets.',
            status: 'Native Privacy Layer',
            color: '#F59E0B',
          },
          {
            icon: TrendingUp,
            title: 'Stake for Service',
            desc: 'Gasless compute allocation: stake tokens to secure bandwidth and predictable execution without volatile gas spikes.',
            status: 'Economic Model',
            color: '#10B981',
          },
        ].map((item, i) => {
          const IconComponent = item.icon;
          return (
            <div key={i} className="pillar-card-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="pillar-top-row">
                  <div className="pillar-icon-wrap" style={{ background: 'rgba(169, 221, 211, 0.08)' }}>
                    <IconComponent style={{ width: '20px', height: '20px', color: item.color }} />
                  </div>
                  <span className="pillar-status-chip">
                    {item.status}
                  </span>
                </div>
                <h3 className="pillar-title-text">{item.title}</h3>
                <p className="pillar-desc-text">{item.desc}</p>
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--arc-text-dim)' }}>
                <span>Infrastructure Standard</span>
                <span style={{ color: '#A9DDD3', fontWeight: '600' }}>Subzero L1</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network RPC & Playground Config */}
      <div className="radar-rpc-card">
        <div className="rpc-header-row">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Terminal style={{ width: '16px', height: '16px', color: '#A9DDD3' }} />
              Rialo Playground Config
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--arc-text-muted)', margin: '4px 0 0 0' }}>
              Connect your developer toolchain to the active Rialo Playground environment.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard('https://rpc.playground.rialo.io')}
            className="card-flip-btn"
            style={{ padding: '8px 16px', borderRadius: '10px', color: '#A9DDD3', borderColor: 'rgba(169,221,211,0.3)', background: 'rgba(169,221,211,0.08)' }}
          >
            {copiedRpc ? <Check style={{ width: '14px', height: '14px', color: '#10B981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
            <span>{copiedRpc ? 'Copied to Clipboard' : 'Copy Playground RPC'}</span>
          </button>
        </div>

        <div className="rpc-config-grid">
          {[
            { label: 'Network Name', value: 'Rialo Playground' },
            { label: 'Current Phase', value: 'Active Playground (Devnet)' },
            { label: 'Mainnet Status', value: 'Coming Soon' },
            { label: 'Execution Model', value: 'Reactive Transactions' },
          ].map((cfg, idx) => (
            <div key={idx} className="rpc-tile-box">
              <div className="rpc-tile-label">{cfg.label}</div>
              <div className="rpc-tile-value" style={{ color: '#E8E3D5' }}>{cfg.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Articles & Research Publications from rialo.io */}
      <div className="rialo-articles-section">
        <div className="section-header-articles">
          <div>
            <div className="feature-pill-badge" style={{ borderColor: 'rgba(169,221,211,0.3)', color: '#A9DDD3' }}>
              <BookOpen style={{ width: '14px', height: '14px' }} />
              <span>OFFICIAL PUBLICATIONS FROM RIALO.IO</span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#FFFFFF', margin: '8px 0 4px 0' }}>
              Technical Research & Architecture
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--arc-text-muted)', margin: 0 }}>
              Deep dive into reactive smart contracts, supermodular economics, Gauss consensus, and institutional privacy.
            </p>
          </div>
          <a
            href="https://www.rialo.io#docs"
            target="_blank"
            rel="noopener noreferrer"
            className="choose-yours-btn"
            style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '12px' }}
          >
            <span>View All Docs on rialo.io</span>
            <ArrowUpRight style={{ width: '14px', height: '14px' }} />
          </a>
        </div>

        <div className="articles-cards-grid">
          {RIALO_ARTICLES.map((art) => (
            <a
              key={art.id}
              href={art.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rialo-article-card"
            >
              <div className="article-header-row">
                <span className="article-number">#{art.id}</span>
                <span className="article-tag">{art.tag}</span>
                <span className="article-date">{art.date}</span>
              </div>
              <h4 className="article-title">{art.title}</h4>
              <p className="article-snippet">{art.desc}</p>
              <div className="article-footer-row">
                <span className="read-label">Read on rialo.io</span>
                <ArrowUpRight style={{ width: '14px', height: '14px', color: '#A9DDD3' }} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Institutional Backers & Strategic Partners Marquee */}
      <div className="radar-rpc-card" style={{ marginTop: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--arc-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Investors & Strategic Ecosystem Partners (via rialo.io)
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {BACKERS.map((name, i) => (
            <span
              key={i}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(232, 227, 213, 0.1)',
                color: '#E8E3D5',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
