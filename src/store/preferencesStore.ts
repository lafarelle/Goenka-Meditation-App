import {
  DEFAULT_PREFERENCES,
  GongPreference,
  MeditationPreferences,
  PauseDuration,
  TimingPreference,
} from '@/schemas/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type PreferencesState = {
  preferences: MeditationPreferences;
  setTimingPreference: (preference: TimingPreference) => void;
  setGongEnabled: (enabled: boolean) => void;
  setGongPreference: (preference: GongPreference) => void;
  setPauseDuration: (duration: PauseDuration) => void;
  resetPreferences: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,

      setTimingPreference: (preference) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            timingPreference: preference,
          },
        })),

      setGongEnabled: (enabled) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            gongEnabled: enabled,
          },
        })),

      setGongPreference: (preference) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            gongPreference: preference,
          },
        })),

      setPauseDuration: (duration) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            pauseDuration: duration,
          },
        })),

      resetPreferences: () =>
        set({
          preferences: DEFAULT_PREFERENCES,
        }),
    }),
    {
      name: 'meditation-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
