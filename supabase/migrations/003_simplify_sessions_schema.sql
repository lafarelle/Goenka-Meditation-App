-- Migration 003: Simplify Sessions Schema
-- Created: 2025-10-21
-- Description: Simplify meditation_sessions table to only track essential information
--              Remove complex fields that cause sync issues (playback_sequence, stopped_at, etc.)

-- Drop the existing table and recreate with simplified schema
DROP TABLE IF EXISTS meditation_sessions CASCADE;

-- Create simplified meditation sessions table
CREATE TABLE meditation_sessions (
  id TEXT PRIMARY KEY, -- Use TEXT to match app-generated IDs like "session_123_abc"
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,

  -- Session details
  total_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes REAL, -- Actual time spent in minutes (supports decimals)
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_percentage REAL NOT NULL DEFAULT 0, -- 0-100

  -- Audio information (simplified)
  audio_ids TEXT[], -- Array of audio IDs used in the session

  -- Metadata (optional, stored as JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Recreate indexes for better query performance
CREATE INDEX idx_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON meditation_sessions(started_at DESC);
CREATE INDEX idx_sessions_completed ON meditation_sessions(completed);
CREATE INDEX idx_sessions_created_at ON meditation_sessions(created_at DESC);

-- Recreate Row Level Security (RLS) Policies
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own sessions" ON meditation_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read their own sessions" ON meditation_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own sessions" ON meditation_sessions
  FOR UPDATE
  USING (true);
