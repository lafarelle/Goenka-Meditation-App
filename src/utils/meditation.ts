// Comprehensive meditation utilities

import { getRandomGongAudio, getRandomTechniqueAudio } from '@/data/audioData';
import { SessionSegment, SessionSegmentType } from '@/schemas/session';
import { calculateSessionTiming } from './timing';

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
 * Generates a complete meditation session with audio segments and silence
 */
export function generateMeditationSession(
  segments: Record<SessionSegmentType, SessionSegment>,
  totalDurationMinutes: number,
  timingPreference: 'total' | 'silent' = 'total'
): GeneratedSession {
  // Calculate timing based on user preference
  const { totalDurationSec, silentDurationSec } = calculateSessionTiming(
    totalDurationMinutes,
    segments,
    timingPreference
  );

  const orderedSegmentTypes: SessionSegmentType[] = [
    'openingChant',
    'openingGuidance',
    'techniqueReminder',
    'silent',
    'metta',
    'closingChant',
  ];

  const audioSegments: SessionAudioSegment[] = [];
  let currentTimeSec = 0;

  // Add opening gong (always included, duration approximately 3 seconds)
  const gongDurationSec = 3;
  audioSegments.push({
    type: 'gong',
    label: 'Opening Gong',
    audioUri: getRandomGongAudio(),
    durationSec: gongDurationSec,
    startTimeSec: currentTimeSec,
    endTimeSec: currentTimeSec + gongDurationSec,
  });
  currentTimeSec += gongDurationSec;

  // Use the calculated silent duration from timing preference
  const finalSilentDurationSec = Math.max(0, silentDurationSec - gongDurationSec);

  // Process each segment in order
  for (const segmentType of orderedSegmentTypes) {
    const segment = segments[segmentType];

    if (segmentType === 'silent') {
      // Add silent meditation segment if there's time for it
      if (finalSilentDurationSec > 0) {
        audioSegments.push({
          type: 'silent',
          label: 'Silent Meditation',
          silenceDurationSec: finalSilentDurationSec,
          durationSec: finalSilentDurationSec,
          startTimeSec: currentTimeSec,
          endTimeSec: currentTimeSec + finalSilentDurationSec,
        });
        currentTimeSec += finalSilentDurationSec;
      }
    } else if (segment.isEnabled) {
      // Add audio segment
      let audioUri = segment.fileUri;

      // For technique reminder, get random audio based on technique type
      if (segmentType === 'techniqueReminder' && segment.techniqueType) {
        audioUri = getRandomTechniqueAudio(segment.techniqueType);
      }

      audioSegments.push({
        type: segmentType,
        label: segment.label || segmentType,
        audioUri: audioUri,
        durationSec: segment.durationSec,
        startTimeSec: currentTimeSec,
        endTimeSec: currentTimeSec + segment.durationSec,
      });
      currentTimeSec += segment.durationSec;
    }
  }

  return {
    totalDurationSec: totalDurationSec,
    audioSegments,
  };
}

/**
 * Gets the current session segment based on elapsed time
 */
export function getCurrentSegment(
  session: GeneratedSession,
  elapsedTimeSec: number
): SessionAudioSegment | null {
  return (
    session.audioSegments.find(
      (segment) => elapsedTimeSec >= segment.startTimeSec && elapsedTimeSec < segment.endTimeSec
    ) || null
  );
}

/**
 * Gets the next upcoming segment
 */
export function getNextSegment(
  session: GeneratedSession,
  elapsedTimeSec: number
): SessionAudioSegment | null {
  return session.audioSegments.find((segment) => segment.startTimeSec > elapsedTimeSec) || null;
}

/**
 * Calculates progress percentage
 */
export function calculateProgress(session: GeneratedSession, elapsedTimeSec: number): number {
  return Math.min(100, (elapsedTimeSec / session.totalDurationSec) * 100);
}
