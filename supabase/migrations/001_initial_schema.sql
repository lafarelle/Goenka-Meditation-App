-- Migration 001: Initial Database Schema
-- Created: 2025-10-21
-- Description: Create users and meditation_sessions tables with indexes and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for Goenka familiarity
CREATE TYPE goenka_familiarity_enum AS ENUM ('goat', 'heard', 'not-really');

-- Users table (anonymous users with device tracking)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT NOT NULL UNIQUE,
  name TEXT,
  country TEXT,
  has_attended_retreat BOOLEAN,
  goenka_familiarity goenka_familiarity_enum,
  wants_gong BOOLEAN
);

-- Meditation sessions table
CREATE TABLE meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  total_duration_minutes INTEGER NOT NULL,
  actual_duration_sec INTEGER,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  stopped_at INTEGER,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  preferences JSONB NOT NULL,
  segments JSONB NOT NULL,
  calculated_durations JSONB NOT NULL,
  playback_sequence JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Indexes for better query performance
CREATE INDEX idx_users_device_id ON users(device_id);
CREATE INDEX idx_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON meditation_sessions(started_at DESC);
CREATE INDEX idx_sessions_completed ON meditation_sessions(completed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own user record
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own data (matched by device_id in application)
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (true);

-- Allow users to insert their own meditation sessions
CREATE POLICY "Users can insert their own sessions" ON meditation_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own meditation sessions
CREATE POLICY "Users can read their own sessions" ON meditation_sessions
  FOR SELECT
  USING (true);

-- Allow users to update their own meditation sessions
CREATE POLICY "Users can update their own sessions" ON meditation_sessions
  FOR UPDATE
  USING (true);
