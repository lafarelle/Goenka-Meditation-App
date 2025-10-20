// Session-related schemas and types

export type SessionSegmentType =
  | 'openingChant'
  | 'openingGuidance'
  | 'techniqueReminder'
  | 'metta'
  | 'closingChant'
  | 'gong'
  | 'silent';

export type TechniqueType = 'anapana' | 'vipassana';

export interface SessionSegment {
  type: SessionSegmentType;
  durationSec: number;
  label?: string;
  fileUri?: string; // for chants
  // Add an enabled flag, true by default for most, false for silent initially
  isEnabled: boolean;
  // For technique reminder segment
  techniqueType?: TechniqueType;
  selectedAudioIds: string[]; // Array of selected audio IDs in playback order
  isRandom?: boolean; // If true, pick random audio from available options at session start
}

export interface SessionAudioSegment {
  type: SessionSegmentType | 'gong';
  label: string;
  audioUri?: any; // React Native audio resource
  silenceDurationSec?: number;
  durationSec: number;
  startTimeSec: number;
  endTimeSec: number;
}

export interface GeneratedSession {
  totalDurationSec: number;
  audioSegments: SessionAudioSegment[];
}

/**
 * Creates a new session segment with default values
 */
export function createSessionSegment(type: SessionSegmentType): SessionSegment {
  const baseSegment: Omit<SessionSegment, 'type'> = {
    durationSec: 0,
    isEnabled: false,
    selectedAudioIds: [],
  };

  switch (type) {
    case 'openingChant':
      return {
        ...baseSegment,
        type,
        durationSec: 120,
        label: 'Opening Chant',
        fileUri: undefined,
      };
    case 'openingGuidance':
      return {
        ...baseSegment,
        type,
        durationSec: 60,
        label: 'Opening Guidance',
      };
    case 'techniqueReminder':
      return {
        ...baseSegment,
        type,
        durationSec: 60,
        label: 'Technique Reminder',
        techniqueType: 'anapana',
      };
    case 'metta':
      return {
        ...baseSegment,
        type,
        durationSec: 300,
        label: 'Mettā Practice',
      };
    case 'closingChant':
      return {
        ...baseSegment,
        type,
        durationSec: 120,
        label: 'Closing Chant',
        fileUri: undefined,
      };
    case 'gong':
      return {
        ...baseSegment,
        type,
        durationSec: 5,
        label: 'Gong',
      };
    case 'silent':
      return {
        ...baseSegment,
        type,
        durationSec: 0,
        label: 'Silent Meditation',
        isEnabled: true, // Silent meditation is enabled by default
      };
    default:
      return {
        ...baseSegment,
        type,
        label: type,
      };
  }
}

/**
 * Creates initial segments configuration - all disabled except silent meditation
 */
export function createInitialSegments(): Record<SessionSegmentType, SessionSegment> {
  const segmentTypes: SessionSegmentType[] = [
    'openingChant',
    'openingGuidance',
    'techniqueReminder',
    'metta',
    'closingChant',
    'gong',
    'silent',
  ];

  return segmentTypes.reduce(
    (segments, type) => {
      segments[type] = createSessionSegment(type);
      return segments;
    },
    {} as Record<SessionSegmentType, SessionSegment>
  );
}
