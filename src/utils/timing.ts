// Comprehensive timing utilities for meditation sessions

import { SessionSegment, SessionSegmentType } from '@/schemas/session';
import { getSegmentDisplayDuration } from './audioDurationUtils';

export interface SessionTiming {
  totalDurationSec: number;
  audioDurationSec: number;
  silentDurationSec: number;
  gongDurationSec: number;
  pauseDurationSec: number;
}

/**
 * Calculates session timing based on user preferences and segments
 */
export function calculateSessionTiming(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>,
  timingPreference: 'total' | 'silent'
): SessionTiming {
  const totalDurationSec = totalDurationMinutes * 60;
  
  // Calculate total audio duration from all enabled segments
  let audioDurationSec = 0;
  let gongDurationSec = 0;
  
  Object.entries(segments).forEach(([type, segment]) => {
    if (segment.isEnabled && type !== 'silent') {
      const segmentDuration = getSegmentDisplayDuration(
        type,
        segment.selectedAudioIds,
        segment.durationSec
      );
      
      if (type === 'gong') {
        gongDurationSec += segmentDuration;
      } else {
        audioDurationSec += segmentDuration;
      }
    }
  });

  // Calculate pause duration (10 seconds between segments)
  const pauseDurationSec = calculatePauseDuration(segments);
  
  // Calculate silent meditation duration
  let silentDurationSec: number;
  
  if (timingPreference === 'total') {
    // Silent duration = total - audio - gong - pauses
    silentDurationSec = Math.max(0, totalDurationSec - audioDurationSec - gongDurationSec - pauseDurationSec);
  } else {
    // Silent duration is the specified total, audio duration is calculated from remaining time
    silentDurationSec = totalDurationSec;
    audioDurationSec = Math.max(0, audioDurationSec); // Keep original audio duration
  }

  return {
    totalDurationSec,
    audioDurationSec,
    silentDurationSec,
    gongDurationSec,
    pauseDurationSec,
  };
}

/**
 * Calculates the total pause duration between segments
 */
export function calculatePauseDuration(segments: Record<SessionSegmentType, SessionSegment>): number {
  const pauseDuration = 10; // 10 seconds per pause
  let pauseCount = 0;

  // Count enabled segments
  const enabledSegments = Object.values(segments).filter(segment => 
    segment.isEnabled && segment.type !== 'silent'
  );

  // Pauses between segments (n-1 pauses for n segments)
  if (enabledSegments.length > 1) {
    pauseCount += enabledSegments.length - 1;
  }

  // Additional pauses for gong (start and end)
  if (segments.gong?.isEnabled) {
    pauseCount += 2; // Start and end gong pauses
  }

  return pauseCount * pauseDuration;
}

/**
 * Calculates the total session duration including all components
 */
export function calculateTotalSessionDuration(
  totalDurationMinutes: number,
  segments: Record<SessionSegmentType, SessionSegment>
): number {
  const totalDurationSec = totalDurationMinutes * 60;

  // Calculate duration of all enabled audio segments
  let audioDuration = 0;

  // Opening chant
  if (segments.openingChant?.isEnabled && segments.openingChant?.selectedAudioIds?.length > 0) {
    audioDuration += getSegmentDisplayDuration(
      'openingChant',
      segments.openingChant.selectedAudioIds,
      segments.openingChant.durationSec
    );
  }

  // Opening guidance
  if (
    segments.openingGuidance?.isEnabled &&
    segments.openingGuidance?.selectedAudioIds?.length > 0
  ) {
    audioDuration += getSegmentDisplayDuration(
      'openingGuidance',
      segments.openingGuidance.selectedAudioIds,
      segments.openingGuidance.durationSec
    );
  }

  // Technique reminder
  if (
    segments.techniqueReminder?.isEnabled &&
    segments.techniqueReminder?.selectedAudioIds?.length > 0
  ) {
    audioDuration += getSegmentDisplayDuration(
      'techniqueReminder',
      segments.techniqueReminder.selectedAudioIds,
      segments.techniqueReminder.durationSec
    );
  }

  // Metta
  if (segments.metta?.isEnabled && segments.metta?.selectedAudioIds?.length > 0) {
    audioDuration += getSegmentDisplayDuration(
      'metta',
      segments.metta.selectedAudioIds,
      segments.metta.durationSec
    );
  }

  // Closing chant
  if (segments.closingChant?.isEnabled && segments.closingChant?.selectedAudioIds?.length > 0) {
    audioDuration += getSegmentDisplayDuration(
      'closingChant',
      segments.closingChant.selectedAudioIds,
      segments.closingChant.durationSec
    );
  }

  // Add gong durations (start and end gongs)
  const gongDuration = 5; // 5 seconds per gong
  const totalGongDuration = segments.gong?.isEnabled ? gongDuration * 2 : 0; // Start and end gongs

  // Add silent pauses between segments (10 seconds each)
  const silentPauseDuration = 10;
  const numberOfPauses = Math.max(
    0,
    (segments.openingChant?.isEnabled ? 1 : 0) +
      (segments.openingGuidance?.isEnabled ? 1 : 0) +
      (segments.techniqueReminder?.isEnabled ? 1 : 0) +
      (segments.metta?.isEnabled ? 1 : 0) +
      (segments.closingChant?.isEnabled ? 1 : 0) +
      (segments.gong?.isEnabled ? 2 : 0) -
      1 // -1 because we don't need pause after last segment
  );
  const totalPauseDuration = numberOfPauses * silentPauseDuration;

  // Silent meditation duration
  const silentMeditationDuration = Math.max(
    0,
    totalDurationSec - audioDuration - totalGongDuration - totalPauseDuration
  );

  return audioDuration + totalGongDuration + totalPauseDuration + silentMeditationDuration;
}

/**
 * Formats time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats session duration for display
 */
export function formatSessionDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
