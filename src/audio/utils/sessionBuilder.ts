import { getGongAudioByPreference, segmentTypeToAudioMap } from '@/data/audioData';
import { MeditationSession } from '@/schemas/audio';
import { usePreferencesStore } from '@/store/preferencesStore';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';
import { calculateSessionTiming } from '@/utils/preferences/timingUtils';
import { pickRandomAudio } from '@/utils/audioUtils';
import { SessionSegmentType } from '@/schemas/session';

/**
 * Helper function to get audio IDs for a segment, handling random selection
 */
function getSegmentAudioIds(
  segmentType: SessionSegmentType,
  selectedAudioIds: string[],
  isRandom?: boolean,
  techniqueType?: 'anapana' | 'vipassana'
): string[] {
  // If random flag is set, pick a random audio from available options
  if (isRandom) {
    let availableAudios = segmentTypeToAudioMap[segmentType];

    // For technique reminders, filter by techniqueType (anapana starts with 'a', vipassana with 'v')
    if (segmentType === 'techniqueReminder' && techniqueType) {
      const prefix = techniqueType === 'anapana' ? 'a' : 'v';
      availableAudios = availableAudios.filter((audio) => audio.id.startsWith(prefix));
    }

    if (availableAudios && availableAudios.length > 0) {
      const randomAudio = pickRandomAudio(availableAudios);
      return randomAudio ? [randomAudio.id] : [];
    }
    return [];
  }

  // Otherwise, use the selected audio IDs
  return selectedAudioIds;
}

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
    preferences.timingPreference,
    preferences.pauseDuration,
    preferences.gongEnabled,
    preferences.gongPreference
  );

  // Check for gong preference - only add if enabled
  let gongSegment = null;
  if (preferences.gongEnabled) {
    const gongAudio = getGongAudioByPreference(preferences.gongPreference);
    if (gongAudio) {
      gongSegment = {
        audioId: gongAudio.id,
        duration: 5, // 5 seconds for gong
      };
    }
  }

  // Collect before-silent audio (opening chant, guidance, technique reminder)
  const beforeSilentAudioIds: string[] = [];
  let beforeSilentDuration = 0;
  if (segments.openingChant.isEnabled) {
    const audioIds = getSegmentAudioIds(
      'openingChant',
      segments.openingChant.selectedAudioIds,
      segments.openingChant.isRandom
    );
    if (audioIds.length > 0) {
      beforeSilentAudioIds.push(...audioIds);
      beforeSilentDuration += getSegmentDisplayDuration(
        'openingChant',
        audioIds,
        segments.openingChant.durationSec
      );
    }
  }
  if (segments.openingGuidance.isEnabled) {
    const audioIds = getSegmentAudioIds(
      'openingGuidance',
      segments.openingGuidance.selectedAudioIds,
      segments.openingGuidance.isRandom
    );
    if (audioIds.length > 0) {
      beforeSilentAudioIds.push(...audioIds);
      beforeSilentDuration += getSegmentDisplayDuration(
        'openingGuidance',
        audioIds,
        segments.openingGuidance.durationSec
      );
    }
  }
  if (segments.techniqueReminder.isEnabled) {
    const audioIds = getSegmentAudioIds(
      'techniqueReminder',
      segments.techniqueReminder.selectedAudioIds,
      segments.techniqueReminder.isRandom,
      segments.techniqueReminder.techniqueType
    );
    if (audioIds.length > 0) {
      beforeSilentAudioIds.push(...audioIds);
      beforeSilentDuration += getSegmentDisplayDuration(
        'techniqueReminder',
        audioIds,
        segments.techniqueReminder.durationSec
      );
    }
  }

  // Collect after-silent audio (metta, closing chant)
  const afterSilentAudioIds: string[] = [];
  let afterSilentDuration = 0;
  if (segments.metta.isEnabled) {
    const audioIds = getSegmentAudioIds(
      'metta',
      segments.metta.selectedAudioIds,
      segments.metta.isRandom
    );
    if (audioIds.length > 0) {
      afterSilentAudioIds.push(...audioIds);
      afterSilentDuration += getSegmentDisplayDuration(
        'metta',
        audioIds,
        segments.metta.durationSec
      );
    }
  }
  if (segments.closingChant.isEnabled) {
    const audioIds = getSegmentAudioIds(
      'closingChant',
      segments.closingChant.selectedAudioIds,
      segments.closingChant.isRandom
    );
    if (audioIds.length > 0) {
      afterSilentAudioIds.push(...audioIds);
      afterSilentDuration += getSegmentDisplayDuration(
        'closingChant',
        audioIds,
        segments.closingChant.durationSec
      );
    }
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
    preferences.gongEnabled,
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
