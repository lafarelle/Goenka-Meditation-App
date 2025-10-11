import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PREFERENCES, MeditationPreferences, TimingPreference } from './types';

type PreferencesState = {
  preferences: MeditationPreferences;
  setTimingPreference: (preference: TimingPreference) => void;
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
