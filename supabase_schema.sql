-- ==============================================================================
-- RIALO TRACE - COMPLETE SUPABASE DATABASE SCHEMA
-- Run this complete script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/liubwlefoojtxsqogghb/sql/new
-- ==============================================================================

-- 1. MISSIONS TABLE
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    day_number INTEGER NOT NULL,
    scheduled_date TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT DEFAULT '',
    type TEXT NOT NULL,
    action_label TEXT,
    screenshot_requirement TEXT DEFAULT 'none',
    quiz_question TEXT,
    quiz_options JSONB,
    quiz_answer TEXT,
    quiz_explanation TEXT,
    quiz_questions JSONB,
    reward_packs INTEGER DEFAULT 1,
    reward_shards INTEGER DEFAULT 25,
    reward_card_id TEXT,
    reward_card_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    pin_hash TEXT,
    address TEXT,
    inventory JSONB DEFAULT '{}'::jsonb,
    unique_cards_count INTEGER DEFAULT 0,
    total_cards_count INTEGER DEFAULT 0,
    shards INTEGER DEFAULT 100,
    lifetime_points INTEGER DEFAULT 100,
    completed_missions JSONB DEFAULT '[]'::jsonb,
    completed_missions_history JSONB DEFAULT '[]'::jsonb,
    pending_gifts JSONB DEFAULT '[]'::jsonb,
    streak_days INTEGER DEFAULT 1,
    last_claim_date TEXT,
    favorite_cards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRADES TABLE
CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    offered_by TEXT NOT NULL,
    offered_card_id TEXT NOT NULL,
    requested_card_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY,
    broadcast_type TEXT,
    notice_severity TEXT,
    achievement_id TEXT,
    title TEXT NOT NULL,
    "desc" TEXT,
    icon TEXT,
    tier TEXT,
    recipient TEXT,
    shards_reward INTEGER DEFAULT 0,
    message TEXT,
    mission_category TEXT,
    target_count INTEGER,
    completed_by JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GIFT LOGS TABLE
CREATE TABLE IF NOT EXISTS gift_logs (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    card_id TEXT NOT NULL,
    card_title TEXT,
    card_rarity TEXT,
    card_image TEXT,
    quantity INTEGER DEFAULT 1,
    reason TEXT,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SEASONS TABLE
CREATE TABLE IF NOT EXISTS seasons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    theme TEXT,
    start_date TEXT,
    end_date TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KV STORE TABLE (For arcade wheel cooldowns, high scores, global keys)
CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TROLLBOX MESSAGES TABLE (Realtime Global Community Chat)
CREATE TABLE IF NOT EXISTS trollbox_messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    avatar TEXT,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trollbox_messages DISABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- Disabling RLS allows the server-side Supabase client (using anon key)
-- to freely SELECT, INSERT, UPDATE, and DELETE across all required tables.
-- ==============================================================================

-- OPTIONAL REWARD CARD UPGRADE (run if table already exists)
ALTER TABLE missions ADD COLUMN IF NOT EXISTS reward_card_id TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS reward_card_count INTEGER DEFAULT 1;

ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE gift_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store DISABLE ROW LEVEL SECURITY;
ALTER TABLE trollbox_messages DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- INITIAL SEED: SEASON 1
-- ==============================================================================
INSERT INTO seasons (id, name, theme, start_date, end_date, is_active)
VALUES ('season-1', 'Season 1: Genesis', '30 Genesis Protocol Warriors', '2026-10-03', '2026-11-02', true)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

-- ==============================================================================
-- INITIAL SEED: 30 GENESIS MISSIONS
-- ==============================================================================
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-1', 1, '2026-10-03', 'Day 1: Follow @RialoHQ official announcements', 'Stay connected with the core engineering updates on X.', 'https://x.com/RialoHQ', 'twitter_follow', 'Follow on X', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-2', 2, '2026-10-04', 'Day 2: Retweet Rialo Parallel Consensus Thread', 'Amplify the testnet consensus announcement across the community.', 'https://x.com/RialoHQ', 'twitter_retweet', 'Retweet Post', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-3', 3, '2026-10-05', 'Day 3: Daily Web3 Quiz: Superconductivity & Finality', 'Answer today''s technical quiz on Rialo''s cold-physics architecture.', '', 'quiz', 'Take Web3 Quiz', 'none', 'What core physical phenomenon inspires Rialo''s frictionless execution?', '["Superconductivity & Superfluidity","Proof of Authority Centralization","Manual Sharding","Delayed Finality"]', 'Superconductivity & Superfluidity', NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-4', 4, '2026-10-06', 'Day 4: Join Rialo Discord Validator Enclave', 'Verify your role in the official Rialo discord guild.', 'https://discord.gg/RialoProtocol', 'discord_join', 'Join Discord', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-5', 5, '2026-10-07', 'Day 5: Explore Rialo Interactive Developer Docs', 'Review smart contract deployment guides on the official docs portal.', 'https://docs.rialo.io', 'custom_url', 'Read Docs', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-6', 6, '2026-10-08', 'Day 6: Like the Genesis 30-Card Archetype Reveal', 'Support the digital collector card series unveiling on X.', 'https://x.com/RialoHQ', 'twitter_like', 'Like Tweet', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-7', 7, '2026-10-09', 'Day 7: Follow @RialoHQ official announcements', 'Stay connected with the core engineering updates on X.', 'https://x.com/RialoHQ', 'twitter_follow', 'Follow on X', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-8', 8, '2026-10-10', 'Day 8: Retweet Rialo Parallel Consensus Thread', 'Amplify the testnet consensus announcement across the community.', 'https://x.com/RialoHQ', 'twitter_retweet', 'Retweet Post', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-9', 9, '2026-10-11', 'Day 9: Daily Web3 Quiz: Superconductivity & Finality', 'Answer today''s technical quiz on Rialo''s cold-physics architecture.', '', 'quiz', 'Take Web3 Quiz', 'none', 'What core physical phenomenon inspires Rialo''s frictionless execution?', '["Superconductivity & Superfluidity","Proof of Authority Centralization","Manual Sharding","Delayed Finality"]', 'Superconductivity & Superfluidity', NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-10', 10, '2026-10-12', 'Day 10: Join Rialo Discord Validator Enclave', 'Verify your role in the official Rialo discord guild.', 'https://discord.gg/RialoProtocol', 'discord_join', 'Join Discord', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-11', 11, '2026-10-13', 'Day 11: Explore Rialo Interactive Developer Docs', 'Review smart contract deployment guides on the official docs portal.', 'https://docs.rialo.io', 'custom_url', 'Read Docs', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-12', 12, '2026-10-14', 'Day 12: Like the Genesis 30-Card Archetype Reveal', 'Support the digital collector card series unveiling on X.', 'https://x.com/RialoHQ', 'twitter_like', 'Like Tweet', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-13', 13, '2026-10-15', 'Day 13: Follow @RialoHQ official announcements', 'Stay connected with the core engineering updates on X.', 'https://x.com/RialoHQ', 'twitter_follow', 'Follow on X', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-14', 14, '2026-10-16', 'Day 14: Retweet Rialo Parallel Consensus Thread', 'Amplify the testnet consensus announcement across the community.', 'https://x.com/RialoHQ', 'twitter_retweet', 'Retweet Post', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-15', 15, '2026-10-17', 'Day 15: Daily Web3 Quiz: Superconductivity & Finality', 'Answer today''s technical quiz on Rialo''s cold-physics architecture.', '', 'quiz', 'Take Web3 Quiz', 'none', 'What core physical phenomenon inspires Rialo''s frictionless execution?', '["Superconductivity & Superfluidity","Proof of Authority Centralization","Manual Sharding","Delayed Finality"]', 'Superconductivity & Superfluidity', NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-16', 16, '2026-10-18', 'Day 16: Join Rialo Discord Validator Enclave', 'Verify your role in the official Rialo discord guild.', 'https://discord.gg/RialoProtocol', 'discord_join', 'Join Discord', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-17', 17, '2026-10-19', 'Day 17: Explore Rialo Interactive Developer Docs', 'Review smart contract deployment guides on the official docs portal.', 'https://docs.rialo.io', 'custom_url', 'Read Docs', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-18', 18, '2026-10-20', 'Day 18: Like the Genesis 30-Card Archetype Reveal', 'Support the digital collector card series unveiling on X.', 'https://x.com/RialoHQ', 'twitter_like', 'Like Tweet', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-19', 19, '2026-10-21', 'Day 19: Follow @RialoHQ official announcements', 'Stay connected with the core engineering updates on X.', 'https://x.com/RialoHQ', 'twitter_follow', 'Follow on X', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-20', 20, '2026-10-22', 'Day 20: Retweet Rialo Parallel Consensus Thread', 'Amplify the testnet consensus announcement across the community.', 'https://x.com/RialoHQ', 'twitter_retweet', 'Retweet Post', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-21', 21, '2026-10-23', 'Day 21: Daily Web3 Quiz: Superconductivity & Finality', 'Answer today''s technical quiz on Rialo''s cold-physics architecture.', '', 'quiz', 'Take Web3 Quiz', 'none', 'What core physical phenomenon inspires Rialo''s frictionless execution?', '["Superconductivity & Superfluidity","Proof of Authority Centralization","Manual Sharding","Delayed Finality"]', 'Superconductivity & Superfluidity', NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-22', 22, '2026-10-24', 'Day 22: Join Rialo Discord Validator Enclave', 'Verify your role in the official Rialo discord guild.', 'https://discord.gg/RialoProtocol', 'discord_join', 'Join Discord', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-23', 23, '2026-10-25', 'Day 23: Explore Rialo Interactive Developer Docs', 'Review smart contract deployment guides on the official docs portal.', 'https://docs.rialo.io', 'custom_url', 'Read Docs', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-24', 24, '2026-10-26', 'Day 24: Like the Genesis 30-Card Archetype Reveal', 'Support the digital collector card series unveiling on X.', 'https://x.com/RialoHQ', 'twitter_like', 'Like Tweet', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-25', 25, '2026-10-27', 'Day 25: Follow @RialoHQ official announcements', 'Stay connected with the core engineering updates on X.', 'https://x.com/RialoHQ', 'twitter_follow', 'Follow on X', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-26', 26, '2026-10-28', 'Day 26: Retweet Rialo Parallel Consensus Thread', 'Amplify the testnet consensus announcement across the community.', 'https://x.com/RialoHQ', 'twitter_retweet', 'Retweet Post', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-27', 27, '2026-10-29', 'Day 27: Daily Web3 Quiz: Superconductivity & Finality', 'Answer today''s technical quiz on Rialo''s cold-physics architecture.', '', 'quiz', 'Take Web3 Quiz', 'none', 'What core physical phenomenon inspires Rialo''s frictionless execution?', '["Superconductivity & Superfluidity","Proof of Authority Centralization","Manual Sharding","Delayed Finality"]', 'Superconductivity & Superfluidity', NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-28', 28, '2026-10-30', 'Day 28: Join Rialo Discord Validator Enclave', 'Verify your role in the official Rialo discord guild.', 'https://discord.gg/RialoProtocol', 'discord_join', 'Join Discord', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-29', 29, '2026-10-31', 'Day 29: Explore Rialo Interactive Developer Docs', 'Review smart contract deployment guides on the official docs portal.', 'https://docs.rialo.io', 'custom_url', 'Read Docs', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-day-30', 30, '2026-11-01', 'Day 30: Like the Genesis 30-Card Archetype Reveal', 'Support the digital collector card series unveiling on X.', 'https://x.com/RialoHQ', 'twitter_like', 'Like Tweet', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-1791049869137', 31, '2026-11-02', 'Follow the Founder', 'Genesis Mission 1', 'https://x.com/yournahin', 'twitter_follow', 'Follow on X', 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, day_number, scheduled_date, title, description, link, type, action_label, screenshot_requirement, quiz_question, quiz_options, quiz_answer, quiz_explanation, quiz_questions, reward_packs, reward_shards, is_active) VALUES ('m-test-vercel-1', 32, '2026-11-03', 'Day 1 Test: 30-Day Mission Scheduler Verifier', 'Verifying mission appears in Complete Daily Missions seamlessly', 'https://x.com/RialoHQ', 'twitter_follow', NULL, 'none', NULL, NULL, NULL, NULL, NULL, 1, 25, true) ON CONFLICT (id) DO NOTHING;
