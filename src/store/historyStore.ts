import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SessionSegment, SessionSegmentType } from "./sessionStore";

export type HistorySession = {
  id: string;
  timestamp: string;
  totalDuration: number;
  actualDuration?: number; // How long the user actually meditated
  segments: Partial<Record<SessionSegmentType, SessionSegment>>;
  completed: boolean; // Whether the session was completed or stopped early
  completionPercentage: number; // Percentage of session completed (0-100)
  startedAt: string;
  endedAt?: string;
};

type HistoryState = {
  history: HistorySession[];
  addSessionToHistory: (
    totalDuration: number,
    segments: HistorySession["segments"]
  ) => string; // Return session ID for tracking
  updateSessionCompletion: (
    sessionId: string,
    completed: boolean,
    actualDuration: number,
    completionPercentage: number
  ) => void;
  clearHistory: () => void;
  getSessionById: (sessionId: string) => HistorySession | undefined;
  getCurrentStreak: () => number;
  getTotalMinutes: () => number;
  getCompletedSessionsCount: () => number;
};

export const useHistoryStore = create(
  persist<HistoryState>(
    (set, get) => ({
      history: [],

      addSessionToHistory: (totalDuration, segments) => {
        const sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const newEntry: HistorySession = {
          id: sessionId,
          timestamp: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          totalDuration,
          segments,
          completed: false,
          completionPercentage: 0,
        };
        const updated = [newEntry, ...get().history].slice(0, 50); // keep last 50
        set({ history: updated });
        return sessionId;
      },

      updateSessionCompletion: (
        sessionId,
        completed,
        actualDuration,
        completionPercentage
      ) => {
        set((state) => ({
          history: state.history.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  completed,
                  actualDuration,
                  completionPercentage,
                  endedAt: new Date().toISOString(),
                }
              : session
          ),
        }));
      },

      getSessionById: (sessionId) => {
        return get().history.find((session) => session.id === sessionId);
      },

      getCurrentStreak: () => {
        const { history } = get();
        const sortedHistory = [...history].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const session of sortedHistory) {
          const sessionDate = new Date(session.timestamp);
          sessionDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor(
            (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === streak && session.completed) {
            streak++;
          } else if (daysDiff > streak) {
            break;
          }
        }

        return streak;
      },

      getTotalMinutes: () => {
        return get()
          .history.filter((session) => session.completed)
          .reduce((total, session) => total + (session.actualDuration || 0), 0);
      },

      getCompletedSessionsCount: () => {
        return get().history.filter((session) => session.completed).length;
      },

      clearHistory: () => set({ history: [] }),
    }),
    { name: "session-history", storage: createJSONStorage(() => AsyncStorage) }
  )
);
