// Comprehensive session utilities

import { SavedSession } from '@/schemas/savedSession';
import { SessionSegment, SessionSegmentType } from '@/schemas/session';

/**
 * Loads a saved session into the current session store
 */
export function loadSessionIntoStore(
  session: SavedSession,
  sessionStore: {
    setTotalDurationMinutes: (minutes: number) => void;
    setSegmentEnabled: (type: SessionSegmentType, isEnabled: boolean) => void;
    setSegmentDuration: (type: SessionSegmentType, durationSec: number) => void;
    setSegmentAudioIds: (type: SessionSegmentType, audioIds: string[]) => void;
    setSegmentTechniqueType: (
      type: SessionSegmentType,
      techniqueType: 'anapana' | 'vipassana'
    ) => void;
  }
): void {
  // Load session parameters
  sessionStore.setTotalDurationMinutes(session.totalDuration);

  // Load all segment configurations
  Object.entries(session.segments).forEach(([type, segment]) => {
    const segmentType = type as SessionSegmentType;

    // Set enabled state
    sessionStore.setSegmentEnabled(segmentType, segment.isEnabled);

    // Set duration
    sessionStore.setSegmentDuration(segmentType, segment.durationSec);

    // Set audio selections
    sessionStore.setSegmentAudioIds(segmentType, segment.selectedAudioIds);

    // Set technique type for technique reminder
    if (segmentType === 'techniqueReminder' && segment.techniqueType) {
      sessionStore.setSegmentTechniqueType(segmentType, segment.techniqueType);
    }
  });
}

/**
 * Creates a deep copy of session segments to avoid reference issues
 */
export function createSegmentsCopy(
  segments: Record<SessionSegmentType, SessionSegment>
): Record<SessionSegmentType, SessionSegment> {
  const segmentsCopy: Record<SessionSegmentType, SessionSegment> = {} as Record<
    SessionSegmentType,
    SessionSegment
  >;

  Object.entries(segments).forEach(([type, segment]) => {
    const segmentType = type as SessionSegmentType;
    segmentsCopy[segmentType] = {
      ...segment,
      selectedAudioIds: [...segment.selectedAudioIds], // Create a new array
    };
  });

  return segmentsCopy;
}

/**
 * Validates if a session name is valid
 */
export function isValidSessionName(name: string | undefined): boolean {
  return Boolean(name && name.trim() && name.trim().length > 0);
}

/**
 * Formats date for display
 */
export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Gets session usage text
 */
export function getSessionUsageText(useCount: number): string {
  if (useCount === 0) return '';
  return `Used ${useCount} time${useCount !== 1 ? 's' : ''}`;
}
