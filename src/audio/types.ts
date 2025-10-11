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
