export type TimingPreference = 'total' | 'silent';
export type GongPreference = 'none' | 'G1' | 'G2';

export interface MeditationPreferences {
  timingPreference: TimingPreference;
  gongPreference: GongPreference;
}

export const DEFAULT_PREFERENCES: MeditationPreferences = {
  timingPreference: 'total', // Default to total session time
  gongPreference: 'none', // Default to no gong
};
