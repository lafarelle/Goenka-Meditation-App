import {
  CalculatedDurations,
  HistoryFilter,
  HistoryPreferences,
  HistorySegmentConfig,
  HistorySession,
  HistoryStats,
  PlaybackEvent,
  calculateCompletionPercentage,
  createHistorySession,
  getSessionDate,
  isSessionOnDate,
} from '@/schemas/history';
import { SessionSegmentType } from '@/schemas/session';
import { scheduleMeditationReminders } from '@/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { syncSession } from '@/services/supabase';

type HistoryState = {
  // Data
  history: HistorySession[];
  currentSessionId: string | null; // Track the currently active session

  // Session lifecycle methods
  startSession: (
    totalDurationMinutes: number,
    preferences: HistoryPreferences,
    segments: Partial<Record<SessionSegmentType, HistorySegmentConfig>>,
    calculatedDurations: CalculatedDurations
  ) => string; // Returns session ID

  addPlaybackEvent: (sessionId: string, event: PlaybackEvent) => void;

  completeSession: (sessionId: string, actualDurationSec: number) => void;

  stopSession: (sessionId: string, stoppedAtSec: number, actualDurationSec: number) => void;

  // Query methods
  getSessionById: (sessionId: string) => HistorySession | undefined;
  getRecentSessions: (limit?: number) => HistorySession[];
  getFilteredSessions: (filter: HistoryFilter) => HistorySession[];

  // Analytics methods
  getStats: () => HistoryStats;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getTotalMinutes: () => number;
  getCompletedSessionsCount: () => number;
  getCompletionRate: () => number;

  // Utility methods
  clearHistory: () => void;
  deleteSession: (sessionId: string) => void;
};

export const useHistoryStore = create(
  persist<HistoryState>(
    (set, get) => ({
      history: [],
      currentSessionId: null,

      // Start a new session and add it to history
      startSession: (totalDurationMinutes, preferences, segments, calculatedDurations) => {
        const newSession = createHistorySession(
          totalDurationMinutes,
          preferences,
          segments,
          calculatedDurations
        );

        set((state) => ({
          history: [newSession, ...state.history].slice(0, 100), // Keep last 100 sessions
          currentSessionId: newSession.id,
        }));

        return newSession.id;
      },

      // Add a playback event to a session
      addPlaybackEvent: (sessionId, event) => {
        set((state) => ({
          history: state.history.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  playbackSequence: [...session.playbackSequence, event],
                }
              : session
          ),
        }));
      },

      // Mark a session as completed
      completeSession: (sessionId, actualDurationSec) => {
        const now = new Date().toISOString();
        set((state) => ({
          history: state.history.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  completed: true,
                  endedAt: now,
                  completionPercentage: 100,
                  calculatedDurations: {
                    ...session.calculatedDurations,
                    actualDurationSec,
                  },
                }
              : session
          ),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));

        // Sync completed session to Supabase
        const completedSession = get().history.find((s) => s.id === sessionId);
        if (completedSession) {
          syncSession(completedSession).catch((error) => {
            console.error('Failed to sync session to Supabase:', error);
          });
        }

        // Schedule meditation reminders after successful completion
        scheduleMeditationReminders().catch((error) => {
          console.error('Failed to schedule meditation reminders:', error);
        });
      },

      // Mark a session as stopped early
      stopSession: (sessionId, stoppedAtSec, actualDurationSec) => {
        const now = new Date().toISOString();
        const session = get().history.find((s) => s.id === sessionId);
        if (!session) return;

        const completionPercentage = calculateCompletionPercentage(
          actualDurationSec,
          session.calculatedDurations.totalSessionSec
        );

        set((state) => ({
          history: state.history.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  completed: false,
                  endedAt: now,
                  stoppedAt: stoppedAtSec,
                  completionPercentage,
                  calculatedDurations: {
                    ...s.calculatedDurations,
                    actualDurationSec,
                  },
                }
              : s
          ),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));

        // Sync stopped session to Supabase
        const stoppedSession = get().history.find((s) => s.id === sessionId);
        if (stoppedSession) {
          syncSession(stoppedSession).catch((error) => {
            console.error('Failed to sync session to Supabase:', error);
          });
        }
      },

      // Get a specific session by ID
      getSessionById: (sessionId) => {
        return get().history.find((session) => session.id === sessionId);
      },

      // Get recent sessions
      getRecentSessions: (limit = 10) => {
        return get().history.slice(0, limit);
      },

      // Get filtered sessions
      getFilteredSessions: (filter) => {
        let filtered = get().history;

        if (filter.startDate) {
          filtered = filtered.filter((s) => new Date(s.startedAt) >= filter.startDate!);
        }

        if (filter.endDate) {
          filtered = filtered.filter((s) => new Date(s.startedAt) <= filter.endDate!);
        }

        if (filter.completedOnly) {
          filtered = filtered.filter((s) => s.completed);
        }

        if (filter.minDuration !== undefined) {
          filtered = filtered.filter((s) => s.totalDurationMinutes >= filter.minDuration!);
        }

        if (filter.maxDuration !== undefined) {
          filtered = filtered.filter((s) => s.totalDurationMinutes <= filter.maxDuration!);
        }

        if (filter.segmentType) {
          filtered = filtered.filter((s) => s.segments[filter.segmentType!]?.isEnabled);
        }

        return filtered;
      },

      // Get comprehensive statistics
      getStats: () => {
        const { history } = get();
        const completedSessions = history.filter((s) => s.completed);

        const totalMinutes = completedSessions.reduce(
          (sum, s) => sum + (s.calculatedDurations.actualDurationSec || 0) / 60,
          0
        );

        const averageSessionDuration =
          completedSessions.length > 0 ? totalMinutes / completedSessions.length : 0;

        const completionRate =
          history.length > 0 ? (completedSessions.length / history.length) * 100 : 0;

        // Calculate favorite audio IDs
        const audioIdCounts: Record<string, number> = {};
        history.forEach((session) => {
          session.playbackSequence.forEach((event) => {
            if (event.audioId) {
              audioIdCounts[event.audioId] = (audioIdCounts[event.audioId] || 0) + 1;
            }
          });
        });

        const favoriteAudioIds = Object.entries(audioIdCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id]) => id);

        // Calculate preferred session length
        const durationCounts: Record<number, number> = {};
        history.forEach((session) => {
          const duration = session.totalDurationMinutes;
          durationCounts[duration] = (durationCounts[duration] || 0) + 1;
        });

        const preferredSessionLength =
          Object.entries(durationCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 20;

        return {
          totalSessions: history.length,
          completedSessions: completedSessions.length,
          totalMinutesMeditated: Math.round(totalMinutes),
          currentStreak: get().getCurrentStreak(),
          longestStreak: get().getLongestStreak(),
          averageSessionDuration: Math.round(averageSessionDuration),
          completionRate: Math.round(completionRate),
          favoriteAudioIds,
          preferredSessionLength: Number(preferredSessionLength),
        };
      },

      // Calculate current streak (consecutive days with completed sessions)
      getCurrentStreak: () => {
        const { history } = get();
        const completedSessions = history.filter((s) => s.completed);

        if (completedSessions.length === 0) return 0;

        // Sort by date descending
        const sortedSessions = [...completedSessions].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDate = new Date(today);

        // Check if there's a session today or yesterday (to allow for streak continuation)
        const mostRecentSessionDate = getSessionDate(sortedSessions[0]);
        const daysSinceLastSession = Math.floor(
          (today.getTime() - mostRecentSessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastSession > 1) {
          return 0; // Streak is broken
        }

        // Start from today or yesterday
        if (daysSinceLastSession === 1) {
          currentDate.setDate(currentDate.getDate() - 1);
        }

        // Count consecutive days
        for (const session of sortedSessions) {
          if (isSessionOnDate(session, currentDate)) {
            // Found a session on this date, continue checking
            continue;
          } else {
            // Check if this session is on the previous day
            const prevDate = new Date(currentDate);
            prevDate.setDate(prevDate.getDate() - 1);

            if (isSessionOnDate(session, prevDate)) {
              streak++;
              currentDate = prevDate;
            } else {
              // Gap in streak
              break;
            }
          }
        }

        // Add 1 for the current/most recent day
        if (streak > 0 || daysSinceLastSession === 0) {
          streak++;
        }

        return streak;
      },

      // Calculate longest streak ever
      getLongestStreak: () => {
        const { history } = get();
        const completedSessions = history.filter((s) => s.completed);

        if (completedSessions.length === 0) return 0;

        // Get unique dates with sessions
        const sessionDates = completedSessions
          .map((s) => getSessionDate(s).getTime())
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort((a, b) => a - b);

        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sessionDates.length; i++) {
          const daysDiff = (sessionDates[i] - sessionDates[i - 1]) / (1000 * 60 * 60 * 24);

          if (daysDiff === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }

        return longestStreak;
      },

      // Get total minutes meditated (completed sessions only)
      getTotalMinutes: () => {
        return Math.round(
          get()
            .history.filter((s) => s.completed)
            .reduce((sum, s) => sum + (s.calculatedDurations.actualDurationSec || 0) / 60, 0)
        );
      },

      // Get count of completed sessions
      getCompletedSessionsCount: () => {
        return get().history.filter((s) => s.completed).length;
      },

      // Get completion rate percentage
      getCompletionRate: () => {
        const { history } = get();
        if (history.length === 0) return 0;

        const completedCount = history.filter((s) => s.completed).length;
        return Math.round((completedCount / history.length) * 100);
      },

      // Clear all history
      clearHistory: () => set({ history: [], currentSessionId: null }),

      // Delete a specific session
      deleteSession: (sessionId) => {
        set((state) => ({
          history: state.history.filter((s) => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));
      },
    }),
    { name: 'session-history', storage: createJSONStorage(() => AsyncStorage) }
  )
);
