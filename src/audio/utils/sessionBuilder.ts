import { getGongAudioByPreference } from '@/data/audioData';
import { MeditationSession } from '@/schemas/audio';
import { usePreferencesStore } from '@/store/preferencesStore';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';
import { calculateSessionTiming } from '@/utils/preferences/timingUtils';

/**
 * Builds a MeditationSession from the session store state
 */
export function buildSessionFromStore(sessionStore: any): MeditationSession {
  const { totalDurationMinutes, segments } = sessionStore;
  const preferences = usePreferencesStore.getState().preferences;

  // Use the timing utility to calculate the correct durations
  const timing = calculateSessionTiming(
    totalDurationMinutes,
    segments,
    preferences.timingPreference
  );

  // Check for gong preference
  const gongAudio = getGongAudioByPreference(preferences.gongPreference);
  let gongSegment = null;
  if (gongAudio) {
    gongSegment = {
      audioId: gongAudio.id,
      duration: 5, // 5 seconds for gong
    };
  }

  // Collect before-silent audio (opening chant, guidance, technique reminder)
  const beforeSilentAudioIds: string[] = [];
  let beforeSilentDuration = 0;
  if (segments.openingChant.isEnabled && segments.openingChant.selectedAudioIds.length > 0) {
    beforeSilentAudioIds.push(...segments.openingChant.selectedAudioIds);
    beforeSilentDuration += getSegmentDisplayDuration(
      'openingChant',
      segments.openingChant.selectedAudioIds,
      segments.openingChant.durationSec
    );
  }
  if (segments.openingGuidance.isEnabled && segments.openingGuidance.selectedAudioIds.length > 0) {
    beforeSilentAudioIds.push(...segments.openingGuidance.selectedAudioIds);
    beforeSilentDuration += getSegmentDisplayDuration(
      'openingGuidance',
      segments.openingGuidance.selectedAudioIds,
      segments.openingGuidance.durationSec
    );
  }
  if (
    segments.techniqueReminder.isEnabled &&
    segments.techniqueReminder.selectedAudioIds.length > 0
  ) {
    beforeSilentAudioIds.push(...segments.techniqueReminder.selectedAudioIds);
    beforeSilentDuration += getSegmentDisplayDuration(
      'techniqueReminder',
      segments.techniqueReminder.selectedAudioIds,
      segments.techniqueReminder.durationSec
    );
  }

  // Collect after-silent audio (metta, closing chant)
  const afterSilentAudioIds: string[] = [];
  let afterSilentDuration = 0;
  if (segments.metta.isEnabled && segments.metta.selectedAudioIds.length > 0) {
    afterSilentAudioIds.push(...segments.metta.selectedAudioIds);
    afterSilentDuration += getSegmentDisplayDuration(
      'metta',
      segments.metta.selectedAudioIds,
      segments.metta.durationSec
    );
  }
  if (segments.closingChant.isEnabled && segments.closingChant.selectedAudioIds.length > 0) {
    afterSilentAudioIds.push(...segments.closingChant.selectedAudioIds);
    afterSilentDuration += getSegmentDisplayDuration(
      'closingChant',
      segments.closingChant.selectedAudioIds,
      segments.closingChant.durationSec
    );
  }

  return {
    totalDurationMinutes,
    segments: {
      ...(gongSegment && { gong: gongSegment }),
      beforeSilent: {
        audioIds: beforeSilentAudioIds,
        duration: beforeSilentDuration,
      },
      silent: {
        duration: timing.silentDurationSec,
      },
      afterSilent: {
        audioIds: afterSilentAudioIds,
        duration: afterSilentDuration,
      },
    },
  };
}

/**
 * Calculates the total session duration based on preferences and session configuration
 */
export function calculateTotalSessionDuration(
  session: MeditationSession,
  sessionStore: any
): number {
  if (!session) return 0;

  const preferences = usePreferencesStore.getState().preferences;

  // Use the timing utility to calculate the correct total duration
  const timing = calculateSessionTiming(
    sessionStore.totalDurationMinutes,
    sessionStore.segments,
    preferences.timingPreference,
    preferences.pauseDuration,
    preferences.gongPreference
  );

  // Check for warning condition - if audio + gong + pause >= selected duration
  const nonSilentDurationSec =
    timing.audioDurationSec + timing.gongDurationSec + timing.pauseDurationSec;
  const selectedDurationSec = sessionStore.totalDurationMinutes * 60;
  const showWarning =
    preferences.timingPreference === 'total' && nonSilentDurationSec >= selectedDurationSec;

  // If warning, use the full duration of audio + gong + pause
  if (showWarning) {
    return nonSilentDurationSec;
  }

  return timing.totalDurationSec;
}
