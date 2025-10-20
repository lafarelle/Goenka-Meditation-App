import { SavedSession } from '@/schemas/savedSession';
import { SessionSegment, SessionSegmentType } from '@/schemas/session';

/**
 * Loads a saved session into the current session store
 * @param session - The saved session to load
 * @param sessionStore - The session store methods
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
    setSegmentIsRandom: (type: SessionSegmentType, isRandom: boolean) => void;
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

    // Set random flag
    if (segment.isRandom !== undefined) {
      sessionStore.setSegmentIsRandom(segmentType, segment.isRandom);
    }

    // Set technique type for technique reminder
    if (segmentType === 'techniqueReminder' && segment.techniqueType) {
      sessionStore.setSegmentTechniqueType(segmentType, segment.techniqueType);
    }
  });
}

/**
 * Creates a deep copy of session segments to avoid reference issues
 * @param segments - The segments to copy
 * @returns A deep copy of the segments
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
      isRandom: segment.isRandom, // Preserve random flag
    };
  });

  return segmentsCopy;
}

/**
 * Validates if a session name is valid
 * @param name - The session name to validate
 * @returns True if the name is valid, false otherwise
 */
export function isValidSessionName(name: string | undefined): boolean {
  return Boolean(name && name.trim() && name.trim().length > 0);
}

/**
 * Formats session duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatSessionDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Formats date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
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
 * @param useCount - Number of times the session has been used
 * @returns Formatted usage text
 */
export function getSessionUsageText(useCount: number): string {
  if (useCount === 0) return '';
  return `Used ${useCount} time${useCount !== 1 ? 's' : ''}`;
}
