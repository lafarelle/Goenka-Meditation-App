-- Migration 002: Fix Data Types for Decimal Values
-- Created: 2025-10-21
-- Description: Change INTEGER columns to REAL to support decimal values for session metrics

-- Change stopped_at from INTEGER to REAL to support decimal values
ALTER TABLE meditation_sessions
  ALTER COLUMN stopped_at TYPE REAL;

-- Change actual_duration_sec from INTEGER to REAL for precise duration tracking
ALTER TABLE meditation_sessions
  ALTER COLUMN actual_duration_sec TYPE REAL;

-- Change completion_percentage from INTEGER to REAL for precise percentages
ALTER TABLE meditation_sessions
  ALTER COLUMN completion_percentage TYPE REAL;
