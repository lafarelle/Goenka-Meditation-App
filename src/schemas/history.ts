// History-related schemas and types

import { GongPreference, PauseDuration, TimingPreference } from './preferences';
import { SessionSegmentType, TechniqueType } from './session';

/**
 * Represents a single audio playback event in the session
 */
export interface PlaybackEvent {
  segmentType: SessionSegmentType | 'gong';
  audioId?: string; // undefined for silent segments
  startedAt: number; // Seconds from session start
  duration: number; // Actual duration played in seconds
  completed: boolean; // Whether this audio finished playing or was interrupted
}

/**
 * Snapshot of segment configuration at the time of the session
 */
export interface HistorySegmentConfig {
  isEnabled: boolean;
  durationSec: number;
  selectedAudioIds: string[]; // In playback order
  techniqueType?: TechniqueType; // For technique reminder segment
  fileUri?: string; // For chants that use fileUri
}

/**
 * Snapshot of user preferences at the time of the session
 */
export interface HistoryPreferences {
  timingPreference: TimingPreference;
  gongPreference: GongPreference;
  pauseDuration: PauseDuration;
}

/**
 * Calculated durations for analytics
 */
export interface CalculatedDurations {
  totalSessionSec: number; // Total planned session duration
  silentMeditationSec: number; // Planned silent meditation duration
  audioSegmentsSec: number; // Total duration of all audio segments
  actualDurationSec?: number; // Actual time spent (if session ended)
}

/**
 * Complete history entry for a meditation session
 */
export interface HistorySession {
  // Identity
  id: string;
  startedAt: string; // ISO timestamp
  endedAt?: string; // ISO timestamp (undefined if still running)

  // Completion tracking
  completed: boolean; // Whether the full session was completed
  stoppedAt?: number; // Seconds into session when stopped (if not completed)
  completionPercentage: number; // 0-100, how much of the session was completed

  // Session configuration snapshot
  totalDurationMinutes: number;

  // Preferences snapshot (at time of session)
  preferences: HistoryPreferences;

  // Segment configuration (what was enabled and selected)
  segments: Partial<Record<SessionSegmentType, HistorySegmentConfig>>;

  // Calculated durations (for analytics)
  calculatedDurations: CalculatedDurations;

  // Actual playback (what actually played)
  playbackSequence: PlaybackEvent[];
}

/**
 * Statistics derived from history
 */
export interface HistoryStats {
  totalSessions: number;
  completedSessions: number;
  totalMinutesMeditated: number;
  currentStreak: number; // Days in a row with at least one session
  longestStreak: number;
  averageSessionDuration: number; // In minutes
  completionRate: number; // Percentage (0-100)
  favoriteAudioIds: string[]; // Most frequently used audio IDs
  preferredSessionLength: number; // Most common session duration in minutes
}

/**
 * Filter options for querying history
 */
export interface HistoryFilter {
  startDate?: Date;
  endDate?: Date;
  completedOnly?: boolean;
  minDuration?: number; // In minutes
  maxDuration?: number; // In minutes
  segmentType?: SessionSegmentType;
}

/**
 * Helper to create a new history session entry
 */
export function createHistorySession(
  totalDurationMinutes: number,
  preferences: HistoryPreferences,
  segments: Partial<Record<SessionSegmentType, HistorySegmentConfig>>,
  calculatedDurations: CalculatedDurations
): HistorySession {
  const now = new Date().toISOString();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  return {
    id: sessionId,
    startedAt: now,
    endedAt: undefined,
    completed: false,
    stoppedAt: undefined,
    completionPercentage: 0,
    totalDurationMinutes,
    preferences,
    segments,
    calculatedDurations,
    playbackSequence: [],
  };
}

/**
 * Helper to create a playback event
 */
export function createPlaybackEvent(
  segmentType: SessionSegmentType | 'gong',
  startedAt: number,
  duration: number,
  audioId?: string,
  completed: boolean = true
): PlaybackEvent {
  return {
    segmentType,
    audioId,
    startedAt,
    duration,
    completed,
  };
}

/**
 * Calculate completion percentage based on actual vs planned duration
 */
export function calculateCompletionPercentage(
  actualDurationSec: number,
  plannedDurationSec: number
): number {
  if (plannedDurationSec === 0) return 0;
  return Math.min(100, Math.round((actualDurationSec / plannedDurationSec) * 100));
}

/**
 * Check if a session was completed on a specific date
 */
export function isSessionOnDate(session: HistorySession, date: Date): boolean {
  const sessionDate = new Date(session.startedAt);
  return (
    sessionDate.getFullYear() === date.getFullYear() &&
    sessionDate.getMonth() === date.getMonth() &&
    sessionDate.getDate() === date.getDate()
  );
}

/**
 * Get the date (without time) from a session
 */
export function getSessionDate(session: HistorySession): Date {
  const date = new Date(session.startedAt);
  date.setHours(0, 0, 0, 0);
  return date;
}
