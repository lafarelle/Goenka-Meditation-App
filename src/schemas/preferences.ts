// Preferences-related schemas and types

export type TimingPreference = 'total' | 'silent';
export type GongPreference = 'none' | 'G1' | 'G2';
export type PauseDuration = 1 | 10 | 30;

export interface MeditationPreferences {
  timingPreference: TimingPreference;
  gongEnabled: boolean; // Whether to play a gong at the beginning of the session
  gongPreference: GongPreference;
  pauseDuration: PauseDuration;
}

export const DEFAULT_PREFERENCES: MeditationPreferences = {
  timingPreference: 'total', // Default to total session time
  gongEnabled: false, // Default to no gong at beginning
  gongPreference: 'G1', // Default gong sound when enabled
  pauseDuration: 1, // Default to 1 second pause between audio segments
};
