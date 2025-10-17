import { MeditationSession } from '@/schemas/audio';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { calculateSessionTiming } from '@/utils/preferences/timingUtils';

/**
 * Manages transitions between session segments based on elapsed time
 */
export class SegmentTransitionManager {
  private session: MeditationSession | null = null;
  private attemptedTransitions = new Set<string>();

  // Callbacks for transitions
  private onTransitionToBeforeSilent?: () => Promise<void>;
  private onTransitionToSilent?: () => Promise<void>;
  private onTransitionToAfterSilent?: () => Promise<void>;
  private onSessionComplete?: () => Promise<void>;

  constructor(callbacks: {
    onTransitionToBeforeSilent?: () => Promise<void>;
    onTransitionToSilent?: () => Promise<void>;
    onTransitionToAfterSilent?: () => Promise<void>;
    onSessionComplete?: () => Promise<void>;
  }) {
    this.onTransitionToBeforeSilent = callbacks.onTransitionToBeforeSilent;
    this.onTransitionToSilent = callbacks.onTransitionToSilent;
    this.onTransitionToAfterSilent = callbacks.onTransitionToAfterSilent;
    this.onSessionComplete = callbacks.onSessionComplete;
  }

  setSession(session: MeditationSession): void {
    this.session = session;
    // Reset transitions when a new session starts
    this.resetTransitions();
  }

  resetTransitions(): void {
    this.attemptedTransitions.clear();
  }

  /**
   * Mark a transition as complete to prevent time-based fallback from triggering
   * This is called by event-driven transitions to disable the fallback mechanism
   */
  markTransitionComplete(transitionKey: string): void {
    this.attemptedTransitions.add(transitionKey);
  }

  /**
   * Check if we need to transition to the next segment based on elapsed time
   * This is a FALLBACK mechanism - event-driven transitions should handle most cases
   */
  checkSegmentTransition(
    elapsedSeconds: number,
    currentSegment: string | null,
    isTransitioning: boolean
  ): void {
    if (!this.session) return;

    // Prevent transitions if we're already transitioning
    if (isTransitioning) {
      return;
    }

    const { segments } = this.session;

    // Use centralized timing calculation
    const preferences = usePreferencesStore.getState().preferences;
    const sessionStore = useSessionStore.getState();
    const timing = calculateSessionTiming(
      sessionStore.totalDurationMinutes,
      sessionStore.segments,
      preferences.timingPreference,
      preferences.pauseDuration,
      preferences.gongEnabled,
      preferences.gongPreference
    );

    // Calculate transition points using centralized timing
    const gongDuration = segments.gong ? 5 : 0;
    const beforeSilentDuration = segments.beforeSilent.duration;
    const silentDuration = segments.silent.duration;
    const afterSilentDuration = segments.afterSilent.duration;

    // Calculate individual pause duration
    const pauseCount = this.getPauseCount();
    const individualPauseDuration = pauseCount > 0 ? timing.pauseDurationSec / pauseCount : 0;

    const gongPause = segments.gong ? individualPauseDuration : 0;
    const beforeSilentPauses =
      Math.max(0, segments.beforeSilent.audioIds.length - 1) * individualPauseDuration;
    const beforeSilentEndPause =
      segments.beforeSilent.audioIds.length > 0 ? individualPauseDuration : 0;
    const silentEndPause =
      segments.silent.duration > 0 && segments.afterSilent.audioIds.length > 0
        ? individualPauseDuration
        : 0;
    const afterSilentPauses =
      Math.max(0, segments.afterSilent.audioIds.length - 1) * individualPauseDuration;
    const afterSilentEndPause =
      segments.afterSilent.audioIds.length > 0 && segments.gong ? individualPauseDuration : 0;

    const beforeSilentEnd =
      gongDuration + gongPause + beforeSilentDuration + beforeSilentPauses + beforeSilentEndPause;
    const silentEnd = beforeSilentEnd + silentDuration + silentEndPause;
    const afterSilentEnd =
      silentEnd + afterSilentDuration + afterSilentPauses + afterSilentEndPause;

    // Transition logic based on elapsed time (FALLBACK ONLY)
    if (
      currentSegment === 'gong' &&
      elapsedSeconds >= beforeSilentEnd &&
      !this.attemptedTransitions.has('gong->beforeSilent')
    ) {
      this.attemptedTransitions.add('gong->beforeSilent');
      this.onTransitionToBeforeSilent?.();
    } else if (
      currentSegment === 'beforeSilent' &&
      elapsedSeconds >= beforeSilentEnd &&
      !this.attemptedTransitions.has('beforeSilent->silent')
    ) {
      this.attemptedTransitions.add('beforeSilent->silent');
      this.onTransitionToSilent?.();
    } else if (
      currentSegment === 'silent' &&
      elapsedSeconds >= silentEnd &&
      !this.attemptedTransitions.has('silent->afterSilent')
    ) {
      this.attemptedTransitions.add('silent->afterSilent');
      this.onTransitionToAfterSilent?.();
    } else if (
      currentSegment === 'afterSilent' &&
      elapsedSeconds >= afterSilentEnd &&
      !this.attemptedTransitions.has('afterSilent->complete')
    ) {
      this.attemptedTransitions.add('afterSilent->complete');
      this.onSessionComplete?.();
    }
  }

  /**
   * Calculate the number of pauses in the session
   */
  private getPauseCount(): number {
    if (!this.session) return 0;

    const { segments } = this.session;
    let pauseCount = 0;

    // Pause after gong (if present)
    if (segments.gong) pauseCount++;

    // Pauses between before-silent audio files
    if (segments.beforeSilent.audioIds.length > 1) {
      pauseCount += segments.beforeSilent.audioIds.length - 1;
    }

    // Pause before silent meditation (if there's before-silent audio)
    if (segments.beforeSilent.audioIds.length > 0) pauseCount++;

    // Pause before after-silent audio (if there's silent meditation)
    if (segments.silent.duration > 0 && segments.afterSilent.audioIds.length > 0) pauseCount++;

    // Pauses between after-silent audio files
    if (segments.afterSilent.audioIds.length > 1) {
      pauseCount += segments.afterSilent.audioIds.length - 1;
    }

    // Pause before end gong (if there's after-silent audio)
    if (segments.afterSilent.audioIds.length > 0 && segments.gong) pauseCount++;

    return pauseCount;
  }
}
