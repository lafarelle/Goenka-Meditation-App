import { HistorySession } from '@/schemas/history';
import { SessionSegmentType } from '@/schemas/session';

/**
 * Loads a history session into the current session store
 * @param historySession - The history session to load
 * @param sessionStore - The session store methods
 */
export function loadHistorySessionIntoStore(
  historySession: HistorySession,
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
  sessionStore.setTotalDurationMinutes(historySession.totalDurationMinutes);

  // Load all segment configurations from history
  Object.entries(historySession.segments).forEach(([type, segment]) => {
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
 * Formats history session duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatHistoryDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Formats date for display (relative or absolute)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatHistoryDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Formats total meditation time
 * @param minutes - Total minutes meditated
 * @returns Formatted time string
 */
export function formatTotalMeditationTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${days} days`;
}
