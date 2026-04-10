-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table (one per day per user)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  transcript TEXT,
  summary TEXT,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 100),
  mood_keywords TEXT[] DEFAULT '{}',
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- NOTE: UNIQUE(user_id, date) removed in 002 to allow multiple sessions per day
);

-- Fact types enum
CREATE TYPE fact_type AS ENUM ('event', 'emotion', 'person', 'theme', 'insight');

-- Fact status enum
CREATE TYPE fact_status AS ENUM ('active', 'followed_up', 'expired');

-- Facts table (AI memory)
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type fact_type NOT NULL,
  content TEXT NOT NULL,
  reference_date DATE,
  tags TEXT[] DEFAULT '{}',
  status fact_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for key queries
CREATE INDEX idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX idx_facts_user_reference_date ON facts(user_id, reference_date) WHERE status = 'active';
CREATE INDEX idx_facts_user_tags ON facts USING GIN(tags) WHERE status = 'active';
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
