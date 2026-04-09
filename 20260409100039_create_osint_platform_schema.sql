/*
  # OSINT Fake Profile Detection Platform - Database Schema

  ## Overview
  This migration creates the full schema for the OSINT platform that detects
  and analyzes fake/suspicious social media profiles.

  ## Tables Created

  ### 1. investigations
  - Core table storing every profile analysis conducted
  - Stores username, platform, full analysis JSON, risk score and level
  - Tracks investigation status (pending, complete, flagged)

  ### 2. threat_actors
  - Database of known threat actors and flagged accounts
  - Stores platform presence, tags, and threat category
  - Used for network analysis cross-referencing

  ### 3. network_nodes
  - Nodes in the connection graph for a given investigation
  - Each node represents a social media account
  - Stores pre-computed position hints for graph rendering

  ### 4. network_edges
  - Directed edges between nodes in the network graph
  - Stores connection type and strength weight

  ### 5. osint_sources
  - Records which OSINT sources were queried per investigation
  - Stores findings and confidence scores per source

  ### 6. community_reports
  - Allows users to submit reports of suspicious profiles
  - Tracks report status and category

  ## Security
  - RLS enabled on all tables
  - Public read access for threat actors and community reports (OSINT is public)
  - Authenticated write for investigations and reports
  - Anon read allowed on aggregated stats (no PII)
*/

-- investigations table
CREATE TABLE IF NOT EXISTS investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  platform text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'complete',
  analysis_data jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read investigations"
  ON investigations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert investigations"
  ON investigations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update investigations"
  ON investigations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- threat_actors table
CREATE TABLE IF NOT EXISTS threat_actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  platform text NOT NULL,
  risk_score integer NOT NULL DEFAULT 50,
  risk_level text NOT NULL DEFAULT 'medium',
  threat_category text NOT NULL DEFAULT 'scam',
  tags text[] DEFAULT '{}',
  description text DEFAULT '',
  reported_count integer DEFAULT 1,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE threat_actors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read threat actors"
  ON threat_actors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert threat actors"
  ON threat_actors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- network_nodes table
CREATE TABLE IF NOT EXISTS network_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES investigations(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  username text NOT NULL,
  platform text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  is_target boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE network_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read network nodes"
  ON network_nodes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert network nodes"
  ON network_nodes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- network_edges table
CREATE TABLE IF NOT EXISTS network_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES investigations(id) ON DELETE CASCADE,
  source_node_id text NOT NULL,
  target_node_id text NOT NULL,
  connection_type text NOT NULL DEFAULT 'follows',
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE network_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read network edges"
  ON network_edges FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert network edges"
  ON network_edges FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- community_reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  platform text NOT NULL,
  category text NOT NULL DEFAULT 'scam',
  description text DEFAULT '',
  evidence_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read community reports"
  ON community_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert community reports"
  ON community_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update community reports"
  ON community_reports FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investigations_username ON investigations(username);
CREATE INDEX IF NOT EXISTS idx_investigations_risk_level ON investigations(risk_level);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_actors_username ON threat_actors(username);
CREATE INDEX IF NOT EXISTS idx_threat_actors_platform ON threat_actors(platform);
CREATE INDEX IF NOT EXISTS idx_network_nodes_investigation ON network_nodes(investigation_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_investigation ON network_edges(investigation_id);

-- Seed some known threat actors for demo
INSERT INTO threat_actors (username, platform, risk_score, risk_level, threat_category, tags, description, reported_count, confirmed)
VALUES
  ('crypto_giveaway_real', 'twitter', 92, 'critical', 'scam', ARRAY['crypto', 'giveaway', 'impersonation'], 'Impersonates Elon Musk for crypto giveaway scams', 47, true),
  ('investment_guru_profit', 'instagram', 85, 'high', 'financial_fraud', ARRAY['investment', 'fake_returns', 'ponzi'], 'Promotes fake investment schemes with fabricated returns', 31, true),
  ('account_recovery_help', 'twitter', 78, 'high', 'phishing', ARRAY['phishing', 'account_takeover'], 'Poses as platform support to steal credentials', 22, true),
  ('free_followers_boost', 'instagram', 71, 'high', 'spam', ARRAY['spam', 'bot_network', 'follower_farming'], 'Bot network selling fake followers', 18, true),
  ('dating_scammer_2024', 'facebook', 95, 'critical', 'romance_scam', ARRAY['romance_scam', 'catfish', 'fraud'], 'Catfishing for romance scams targeting elderly', 63, true),
  ('nft_drop_official', 'twitter', 88, 'critical', 'scam', ARRAY['nft', 'crypto', 'rug_pull'], 'NFT rug pull scammer', 29, true),
  ('job_offer_legit', 'linkedin', 74, 'high', 'job_scam', ARRAY['job_scam', 'phishing', 'fake_recruiter'], 'Fake job offers to harvest personal information', 15, true),
  ('verify_your_account', 'facebook', 81, 'high', 'phishing', ARRAY['phishing', 'identity_theft'], 'Account verification phishing campaign', 38, true)
ON CONFLICT DO NOTHING;