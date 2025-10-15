import { PauseDuration } from '@/schemas/preferences';
import { SessionSegment, SessionSegmentType } from '@/schemas/session';
import { TimingPreference } from '@/store/types';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';

/**
 * Calculates the total duration of all enabled audio segments (excluding silent and gong)
 */
export function calculateAudioSegmentsDuration(
  segments: Record<SessionSegmentType, SessionSegment>
): number {
  return Object.values(segments).reduce((acc, segment) => {
    if (segment.type !== 'silent' && segment.type !== 'gong' && segment.isEnabled) {
      return (
        acc + getSegmentDisplayDuration(segment.type, segment.selectedAudioIds, segment.durationSec)
      );
    }
    return acc;
  }, 0);
}

/**
 * Calculates the gong duration based on gong preference
 */
export function calculateGongDuration(
  segments: Record<SessionSegmentType, SessionSegment>,
  gongEnabled: boolean,
  gongPreference: 'none' | 'G1' | 'G2'
): number {
  if (!gongEnabled || gongPreference === 'none') return 0;

  // Use the default gong duration from the segment
  const gongSegment = segments.gong;
  return gongSegment ? gongSegment.durationSec : 5; // Default 5 seconds
}

/**
 * Calculates the total pause duration between audio segments
 */
export function calculatePauseDuration(
  segments: Record<SessionSegmentType, SessionSegment>,
  pauseDurationSec: PauseDuration,
  gongEnabled: boolean,
  gongPreference: 'none' | 'G1' | 'G2'
): number {
  if (pauseDurationSec === 0) return 0;

  // Count enabled audio segments (excluding silent)
  const enabledAudioSegments: SessionSegmentType[] = [];

  // Add gong if enabled
  if (gongEnabled && gongPreference !== 'none') {
    enabledAudioSegments.push('gong');
  }

  // Add other enabled audio segments
  const otherAudioSegments: SessionSegmentType[] = [
    'openingChant',
    'openingGuidance',
    'techniqueReminder',
    'metta',
    'closingChant',
  ];

  otherAudioSegments.forEach((type) => {
    const segment = segments[type];
    if (segment && segment.isEnabled) {
      enabledAudioSegments.push(type);
    }
  });

  // Pause occurs between each audio segment, so we need (n-1) pauses
  const pauseCount = Math.max(0, enabledAudioSegments.length - 1);
  return pauseCount * pauseDurationSec;
}

/**
 * Calculates session timing based on user preference
 */
export function calculateSessionTiming(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>,
  timingPreference: TimingPreference,
  pauseDurationSec: PauseDuration = 0,
  gongEnabled: boolean = false,
  gongPreference: 'none' | 'G1' | 'G2' = 'none'
): {
  totalDurationSec: number;
  silentDurationSec: number;
  audioDurationSec: number;
  gongDurationSec: number;
  pauseDurationSec: number;
} {
  const totalDurationSec = totalDurationMinutes * 60;
  const audioDurationSec = calculateAudioSegmentsDuration(segments);
  const gongDurationSec = calculateGongDuration(segments, gongEnabled, gongPreference);
  const pauseDuration = calculatePauseDuration(
    segments,
    pauseDurationSec,
    gongEnabled,
    gongPreference
  );

  if (timingPreference === 'total') {
    // Total session time is fixed, silent time is calculated
    const silentDurationSec = Math.max(
      0,
      totalDurationSec - audioDurationSec - gongDurationSec - pauseDuration
    );
    return {
      totalDurationSec,
      silentDurationSec,
      audioDurationSec,
      gongDurationSec,
      pauseDurationSec: pauseDuration,
    };
  } else {
    // Silent meditation time is fixed, total time is calculated
    const silentDurationSec = totalDurationSec; // This is the desired silent time
    const newTotalDurationSec =
      silentDurationSec + audioDurationSec + gongDurationSec + pauseDuration;
    return {
      totalDurationSec: newTotalDurationSec,
      silentDurationSec,
      audioDurationSec,
      gongDurationSec,
      pauseDurationSec: pauseDuration,
    };
  }
}

/**
 * Gets the effective duration for display purposes
 */
export function getEffectiveDuration(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>,
  timingPreference: TimingPreference,
  pauseDurationSec: PauseDuration = 0,
  gongEnabled: boolean = false,
  gongPreference: 'none' | 'G1' | 'G2' = 'none'
): {
  totalMinutes: number;
  silentMinutes: number;
  audioMinutes: number;
  gongMinutes: number;
  pauseMinutes: number;
  audioDurationSec: number;
  gongDurationSec: number;
  pauseDurationSec: number;
} {
  const timing = calculateSessionTiming(
    totalDurationMinutes,
    segments,
    timingPreference,
    pauseDurationSec,
    gongEnabled,
    gongPreference
  );

  return {
    totalMinutes: Math.round(timing.totalDurationSec / 60),
    silentMinutes: Math.round(timing.silentDurationSec / 60),
    audioMinutes: Math.round(timing.audioDurationSec / 60),
    gongMinutes: Math.round(timing.gongDurationSec / 60),
    pauseMinutes: Math.round(timing.pauseDurationSec / 60),
    // Add exact seconds for all components
    audioDurationSec: timing.audioDurationSec,
    gongDurationSec: timing.gongDurationSec,
    pauseDurationSec: timing.pauseDurationSec,
  };
}

/**
 * Formats duration in a human-readable way
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats duration with exact seconds (e.g., "2m 30s" or "1h 5m 20s")
 */
export function formatDurationWithSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
}
