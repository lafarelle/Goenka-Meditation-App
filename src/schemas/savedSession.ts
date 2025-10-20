// Saved session schemas and types

export interface SavedSession {
  id: string;
  name: string;
  totalDuration: number; // in minutes
  segments: Record<
    string,
    {
      isEnabled: boolean;
      durationSec: number;
      selectedAudioIds: string[];
      techniqueType?: 'anapana' | 'vipassana';
      isRandom?: boolean;
    }
  >;
  createdAt: string; // ISO date string
  lastUsedAt?: string; // ISO date string
  useCount: number;
}
