// Preferences-related schemas and types

export type TimingPreference = 'total' | 'silent';
export type GongPreference = 'none' | 'G1' | 'G2';
export type PauseDuration = 0 | 1 | 2 | 3 | 5 | 10;

export interface MeditationPreferences {
  timingPreference: TimingPreference;
  gongPreference: GongPreference;
  pauseDuration: PauseDuration;
}

export const DEFAULT_PREFERENCES: MeditationPreferences = {
  timingPreference: 'total', // Default to total session time
  gongPreference: 'none', // Default to no gong
  pauseDuration: 2, // Default to 2 seconds pause between audio segments
};
