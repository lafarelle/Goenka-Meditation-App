import { useSessionStore } from '@/store/sessionStore';
import { getSegmentDisplayDuration } from './audioDurationUtils';

/**
 * Calculates the total duration of a meditation session including all audio segments and pauses
 */
export function calculateTotalSessionDuration(
  totalDurationMinutes: number,
  segments: Record<string, any>
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
 * Gets the total session duration from the session store
 */
export function getSessionTotalDuration(): number {
  const sessionStore = useSessionStore.getState();
  return calculateTotalSessionDuration(sessionStore.totalDurationMinutes, sessionStore.segments);
}
