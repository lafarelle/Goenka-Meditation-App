// Audio-related schemas and types

export interface AudioSessionState {
  isPlaying: boolean;
  currentSegment: string | null;
  progress: number; // 0-1
  duration: number; // in seconds
  remainingTime: number; // in seconds
}

export interface MeditationSession {
  totalDurationMinutes: number;
  segments: {
    gong?: {
      audioId: string;
      duration: number;
    };
    beforeSilent: {
      audioIds: string[];
      duration: number;
    };
    silent: {
      duration: number;
    };
    afterSilent: {
      audioIds: string[];
      duration: number;
    };
  };
}

export interface AudioPlayerCallbacks {
  onPlaybackFinished?: () => void;
  onProgressUpdate?: (progress: number) => void;
  onError?: (error: string) => void;
}

export interface AudioItem {
  id: string;
  name: string;
  duration: string; // Format: "mm:ss"
  description: string;
  fileUri: any | undefined; // React Native audio resource or undefined
}

export interface ChantOption {
  name: string;
  duration?: number; // duration in minutes
}

export interface GuidanceOption {
  name: string;
  duration?: number; // duration in minutes
}
