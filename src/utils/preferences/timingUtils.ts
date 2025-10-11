import { SessionSegment, SessionSegmentType } from '@/store/sessionStore';
import { TimingPreference } from '@/store/types';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';

/**
 * Calculates the total duration of all enabled audio segments (excluding silent)
 */
export function calculateAudioSegmentsDuration(
  segments: Record<SessionSegmentType, SessionSegment>
): number {
  return Object.values(segments).reduce((acc, segment) => {
    if (segment.type !== 'silent' && segment.isEnabled) {
      return (
        acc + getSegmentDisplayDuration(segment.type, segment.selectedAudioIds, segment.durationSec)
      );
    }
    return acc;
  }, 0);
}

/**
 * Calculates session timing based on user preference
 */
export function calculateSessionTiming(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>,
  timingPreference: TimingPreference
): {
  totalDurationSec: number;
  silentDurationSec: number;
  audioDurationSec: number;
} {
  const totalDurationSec = totalDurationMinutes * 60;
  const audioDurationSec = calculateAudioSegmentsDuration(segments);

  if (timingPreference === 'total') {
    // Total session time is fixed, silent time is calculated
    const silentDurationSec = Math.max(0, totalDurationSec - audioDurationSec);
    return {
      totalDurationSec,
      silentDurationSec,
      audioDurationSec,
    };
  } else {
    // Silent meditation time is fixed, total time is calculated
    const silentDurationSec = totalDurationSec; // This is the desired silent time
    const newTotalDurationSec = silentDurationSec + audioDurationSec;
    return {
      totalDurationSec: newTotalDurationSec,
      silentDurationSec,
      audioDurationSec,
    };
  }
}

/**
 * Gets the effective duration for display purposes
 */
export function getEffectiveDuration(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>,
  timingPreference: TimingPreference
): {
  totalMinutes: number;
  silentMinutes: number;
  audioMinutes: number;
} {
  const timing = calculateSessionTiming(totalDurationMinutes, segments, timingPreference);

  return {
    totalMinutes: Math.round(timing.totalDurationSec / 60),
    silentMinutes: Math.round(timing.silentDurationSec / 60),
    audioMinutes: Math.round(timing.audioDurationSec / 60),
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
