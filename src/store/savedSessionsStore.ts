import { createSegmentsCopy } from '@/utils/session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SessionSegment, SessionSegmentType } from '@/schemas/session';
import { SavedSession } from '@/schemas/savedSession';

type SavedSessionsState = {
  saved: SavedSession[];
  saveSession: (
    name: string,
    totalDuration: number,
    segments: Record<SessionSegmentType, SessionSegment>
  ) => void;
  deleteSession: (id: string) => void;
  updateSessionUsage: (id: string) => void;
  getSessionById: (id: string) => SavedSession | undefined;
  getRecentlyUsedSessions: (limit?: number) => SavedSession[];
  getMostUsedSessions: (limit?: number) => SavedSession[];
};

export const useSavedSessionsStore = create(
  persist<SavedSessionsState>(
    (set, get) => ({
      saved: [],

      saveSession: (name, totalDuration, segments) => {
        const segmentsCopy = createSegmentsCopy(segments);

        const newSession: SavedSession = {
          id: `saved_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          totalDuration,
          segments: segmentsCopy,
          createdAt: new Date().toISOString(),
          useCount: 0,
        };
        set({ saved: [...get().saved, newSession] });
      },

      deleteSession: (id) =>
        set((state) => ({
          saved: state.saved.filter((s) => s.id !== id),
        })),

      updateSessionUsage: (id) =>
        set((state) => ({
          saved: state.saved.map((session) =>
            session.id === id
              ? {
                  ...session,
                  useCount: session.useCount + 1,
                  lastUsed: new Date().toISOString(),
                }
              : session
          ),
        })),

      getSessionById: (id) => {
        return get().saved.find((session) => session.id === id);
      },

      getRecentlyUsedSessions: (limit = 5) => {
        return [...get().saved]
          .filter((session) => session.lastUsed)
          .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
          .slice(0, limit);
      },

      getMostUsedSessions: (limit = 5) => {
        return [...get().saved].sort((a, b) => b.useCount - a.useCount).slice(0, limit);
      },
    }),
    {
      name: 'saved-sessions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
