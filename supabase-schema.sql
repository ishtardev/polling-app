// Supabase schema for Polling Web App
// Run these SQL statements in Supabase SQL editor

-- Users are managed by Supabase Auth

-- Polls table
CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id),
  question text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Options table
CREATE TABLE options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  text text NOT NULL
);

-- Votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES options(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES auth.users(id), -- nullable for anonymous
  voter_ip text, -- for anonymous vote tracking
  created_at timestamptz DEFAULT now(),
  UNIQUE (poll_id, voter_id), -- prevent multiple votes by user
  UNIQUE (poll_id, voter_ip) -- prevent multiple votes by IP
);
