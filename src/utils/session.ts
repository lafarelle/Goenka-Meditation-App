// Comprehensive session utilities

import { SessionSegment, SessionSegmentType } from '@/schemas/session';

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
      isRandom: segment.isRandom, // Preserve random flag
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
