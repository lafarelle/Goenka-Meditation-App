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
 * Note: Closing gong is ALWAYS present (regardless of gongEnabled)
 *       Opening gong is only present if gongEnabled is true
 *       So duration is either 1x (closing only) or 2x (opening + closing)
 */
export function calculateGongDuration(
  segments: Record<SessionSegmentType, SessionSegment>,
  gongEnabled: boolean,
  gongPreference: 'none' | 'G1' | 'G2'
): number {
  if (gongPreference === 'none') return 0;

  // Use the default gong duration from the segment
  const gongSegment = segments.gong;
  const singleGongDuration = gongSegment ? gongSegment.durationSec : 5; // Default 5 seconds

  // Closing gong is always present, opening gong only if gongEnabled
  return gongEnabled ? singleGongDuration * 2 : singleGongDuration;
}

/**
 * Calculates the total pause duration between audio segments
 *
 * Pause logic matches sessionTimelineBuilder.ts:
 * - With gong: [Opening Gong] -> [Pause] -> [Before-silent audio with pauses] -> [Silent] -> [After-silent audio with pauses] -> [Pause] -> [Closing Gong]
 * - Without gong: [Before-silent audio with pauses] -> [Silent] -> [After-silent audio with pauses]
 *
 * Key insight: Silent meditation BREAKS the pause chain (needsPauseBeforeNext = false in timeline builder)
 * So we calculate pauses separately for before-silent and after-silent segments
 */
export function calculatePauseDuration(
  segments: Record<SessionSegmentType, SessionSegment>,
  pauseDurationSec: PauseDuration,
  gongEnabled: boolean,
  gongPreference: 'none' | 'G1' | 'G2'
): number {
  // Separate before-silent and after-silent segments
  const beforeSilentTypes: SessionSegmentType[] = [
    'openingChant',
    'openingGuidance',
    'techniqueReminder',
  ];

  const afterSilentTypes: SessionSegmentType[] = ['metta', 'closingChant'];

  const beforeSilentCount = beforeSilentTypes.filter((type) => {
    const segment = segments[type];
    return segment && segment.isEnabled;
  }).length;

  const afterSilentCount = afterSilentTypes.filter((type) => {
    const segment = segments[type];
    return segment && segment.isEnabled;
  }).length;

  // Calculate pause count based on whether opening gong is enabled
  // Note: Closing gong is ALWAYS present (if gongPreference !== 'none')
  let pauseCount = 0;

  if (gongEnabled && gongPreference !== 'none') {
    // With OPENING gong enabled (closing gong always present):
    // - 1 pause after opening gong (if there are any before-silent segments)
    // - (beforeSilentCount - 1) pauses between before-silent segments
    // - (afterSilentCount - 1) pauses between after-silent segments
    // - 1 pause before closing gong (if there are any after-silent segments)

    if (beforeSilentCount > 0) {
      pauseCount += 1; // pause after opening gong
      pauseCount += Math.max(0, beforeSilentCount - 1); // pauses between before-silent items
    }

    if (afterSilentCount > 0) {
      pauseCount += Math.max(0, afterSilentCount - 1); // pauses between after-silent items
      pauseCount += 1; // pause before closing gong
    }
  } else if (gongPreference !== 'none') {
    // Without OPENING gong (but closing gong IS present):
    // - (beforeSilentCount - 1) pauses between before-silent segments
    // - (afterSilentCount - 1) pauses between after-silent segments
    // - 1 pause before closing gong (if there are any after-silent segments OR before-silent segments)

    pauseCount = Math.max(0, beforeSilentCount - 1) + Math.max(0, afterSilentCount - 1);

    // Add pause before closing gong if there are any audio segments
    if (beforeSilentCount > 0 || afterSilentCount > 0) {
      pauseCount += 1;
    }
  } else {
    // No gongs at all (gongPreference === 'none'):
    // - (beforeSilentCount - 1) pauses between before-silent segments
    // - (afterSilentCount - 1) pauses between after-silent segments

    pauseCount = Math.max(0, beforeSilentCount - 1) + Math.max(0, afterSilentCount - 1);
  }

  return pauseCount * pauseDurationSec;
}

/**
 * Calculates session timing based on user preference
 */
export function calculateSessionTiming(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>,
  timingPreference: TimingPreference,
  pauseDurationSec: PauseDuration = 10,
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
  pauseDurationSec: PauseDuration = 10,
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
