export type TimingPreference = 'total' | 'silent';

export interface MeditationPreferences {
  timingPreference: TimingPreference;
}

export const DEFAULT_PREFERENCES: MeditationPreferences = {
  timingPreference: 'total', // Default to total session time
};
