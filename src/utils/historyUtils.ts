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
 * Formats time for display
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export function formatHistoryTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Gets completion status text
 * @param session - History session
 * @returns Formatted completion text
 */
export function getCompletionText(session: HistorySession): string {
  if (session.completed) {
    return 'Completed';
  } else {
    return `${session.completionPercentage}% completed`;
  }
}

/**
 * Gets completion color class
 * @param session - History session
 * @returns Tailwind color class
 */
export function getCompletionColor(session: HistorySession): string {
  if (session.completed) {
    return 'text-green-600';
  } else if (session.completionPercentage >= 75) {
    return 'text-amber-600';
  } else if (session.completionPercentage >= 50) {
    return 'text-orange-600';
  } else {
    return 'text-red-600';
  }
}

/**
 * Gets completion icon name
 * @param session - History session
 * @returns Ionicons icon name
 */
export function getCompletionIcon(session: HistorySession): 'checkmark-circle' | 'close-circle' {
  if (session.completed) {
    return 'checkmark-circle';
  } else {
    return 'close-circle';
  }
}

/**
 * Formats streak text
 * @param streak - Number of consecutive days
 * @returns Formatted streak text
 */
export function formatStreakText(streak: number): string {
  if (streak === 0) return 'No current streak';
  if (streak === 1) return '1 day streak';
  return `${streak} day streak`;
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

/**
 * Gets enabled segments from history session
 * @param session - History session
 * @returns Array of enabled segment names
 */
export function getEnabledSegments(session: HistorySession): string[] {
  const segmentNames: Record<SessionSegmentType, string> = {
    gong: 'Gong',
    openingChant: 'Opening Chant',
    openingGuidance: 'Opening Guidance',
    techniqueReminder: 'Technique',
    silent: 'Silent',
    metta: 'Metta',
    closingChant: 'Closing Chant',
  };

  return Object.entries(session.segments)
    .filter(([_, segment]) => segment.isEnabled)
    .map(([type, _]) => segmentNames[type as SessionSegmentType])
    .filter(Boolean);
}

/**
 * Formats completion rate
 * @param rate - Completion rate (0-1)
 * @returns Formatted percentage string
 */
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
