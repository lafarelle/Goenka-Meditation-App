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
  }

  resetTransitions(): void {
    this.attemptedTransitions.clear();
  }

  /**
   * Check if we need to transition to the next segment based on elapsed time
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
      preferences.timingPreference
    );

    // Calculate transition points using centralized timing
    const gongDuration = segments.gong ? 5 : 0;
    const beforeSilentDuration = segments.beforeSilent.duration;
    const silentDuration = segments.silent.duration;
    const afterSilentDuration = segments.afterSilent.duration;

    // Use pause duration from timing utility
    const pauseDuration = timing.pauseDurationSec / this.getPauseCount();
    const gongPause = segments.gong ? pauseDuration : 0;
    const beforeSilentPauses =
      Math.max(0, segments.beforeSilent.audioIds.length - 1) * pauseDuration;
    const beforeSilentEndPause = segments.beforeSilent.audioIds.length > 0 ? pauseDuration : 0;
    const silentEndPause =
      segments.silent.duration > 0 && segments.afterSilent.audioIds.length > 0 ? pauseDuration : 0;
    const afterSilentPauses = Math.max(0, segments.afterSilent.audioIds.length - 1) * pauseDuration;
    const afterSilentEndPause =
      segments.afterSilent.audioIds.length > 0 && segments.gong ? pauseDuration : 0;

    const beforeSilentEnd =
      gongDuration + gongPause + beforeSilentDuration + beforeSilentPauses + beforeSilentEndPause;
    const silentEnd = beforeSilentEnd + silentDuration + silentEndPause;
    const afterSilentEnd =
      silentEnd + afterSilentDuration + afterSilentPauses + afterSilentEndPause;

    // Transition logic based on elapsed time
    if (
      currentSegment === 'gong' &&
      elapsedSeconds >= beforeSilentEnd &&
      !this.attemptedTransitions.has('gong->beforeSilent')
    ) {
      console.log('Transitioning from gong to beforeSilent');
      this.attemptedTransitions.add('gong->beforeSilent');
      this.onTransitionToBeforeSilent?.();
    } else if (
      currentSegment === 'beforeSilent' &&
      elapsedSeconds >= beforeSilentEnd &&
      !this.attemptedTransitions.has('beforeSilent->silent')
    ) {
      console.log('Transitioning from beforeSilent to silent');
      this.attemptedTransitions.add('beforeSilent->silent');
      this.onTransitionToSilent?.();
    } else if (
      currentSegment === 'silent' &&
      elapsedSeconds >= silentEnd &&
      !this.attemptedTransitions.has('silent->afterSilent')
    ) {
      console.log(
        'Transitioning from silent to afterSilent, elapsed:',
        elapsedSeconds,
        'silentEnd:',
        silentEnd
      );
      this.attemptedTransitions.add('silent->afterSilent');
      this.onTransitionToAfterSilent?.();
    } else if (
      currentSegment === 'afterSilent' &&
      elapsedSeconds >= afterSilentEnd &&
      !this.attemptedTransitions.has('afterSilent->complete')
    ) {
      console.log('Transitioning from afterSilent to complete');
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

