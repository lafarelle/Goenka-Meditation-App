import { MeditationSession } from '@/schemas/audio';
import { HistorySegmentConfig, createPlaybackEvent } from '@/schemas/history';
import { SessionSegmentType } from '@/schemas/session';
import { useHistoryStore } from '@/store/historyStore';
import { useSessionStore } from '@/store/sessionStore';
import { calculateSessionTiming } from '@/utils/preferences/timingUtils';

/**
 * Manages history tracking for meditation sessions
 */
export class HistoryTracker {
  private currentHistorySessionId: string | null = null;
  private sessionStartTime = 0;

  /**
   * Create a history entry for a new session
   */
  createHistoryEntry(
    sessionStore: any,
    preferencesStore: any,
    totalSessionDuration: number
  ): string {
    const { totalDurationMinutes, segments } = sessionStore;
    const { preferences } = preferencesStore;

    // Convert session segments to history segment config
    const historySegments: Partial<Record<SessionSegmentType, HistorySegmentConfig>> = {};

    Object.keys(segments).forEach((key) => {
      const segmentType = key as SessionSegmentType;
      const segment = segments[segmentType];

      historySegments[segmentType] = {
        isEnabled: segment.isEnabled,
        durationSec: segment.durationSec,
        selectedAudioIds: segment.selectedAudioIds || [],
        techniqueType: segment.techniqueType,
        fileUri: segment.fileUri,
      };
    });

    // Calculate durations
    const timing = calculateSessionTiming(
      totalDurationMinutes,
      segments,
      preferences.timingPreference,
      preferences.pauseDuration,
      preferences.gongPreference
    );

    const calculatedDurations = {
      totalSessionSec: totalSessionDuration,
      silentMeditationSec: timing.silentDurationSec,
      audioSegmentsSec: timing.audioDurationSec,
    };

    // Create history entry
    const historyStore = useHistoryStore.getState();
    const sessionId = historyStore.startSession(
      totalDurationMinutes,
      {
        timingPreference: preferences.timingPreference,
        gongPreference: preferences.gongPreference,
        pauseDuration: preferences.pauseDuration,
      },
      historySegments,
      calculatedDurations
    );

    this.currentHistorySessionId = sessionId;
    this.sessionStartTime = Date.now();

    return sessionId;
  }

  /**
   * Record a playback event in history
   */
  recordPlaybackEvent(
    segmentType: SessionSegmentType | 'gong',
    audioId: string | undefined,
    startTime: number,
    durationSec: number,
    completed: boolean = true
  ): void {
    if (!this.currentHistorySessionId) return;

    const event = createPlaybackEvent(segmentType, startTime, durationSec, audioId, completed);

    const historyStore = useHistoryStore.getState();
    historyStore.addPlaybackEvent(this.currentHistorySessionId, event);
  }

  /**
   * Record the playback of the current audio
   */
  recordCurrentAudioPlayback(
    session: MeditationSession | null,
    currentSegment: string | null,
    currentAudioIndex: number,
    currentAudioStartTime: number,
    completed: boolean
  ): void {
    if (!session || !this.currentHistorySessionId || !currentSegment) return;

    // Get the current audio ID based on segment
    let audioId: string | undefined;
    let segmentType: SessionSegmentType | 'gong' = currentSegment as any;

    if (currentSegment === 'gong') {
      audioId = session.segments.gong?.audioId;
    } else if (currentSegment === 'beforeSilent') {
      const audioIds = session.segments.beforeSilent.audioIds;
      audioId = audioIds[currentAudioIndex];
      // Determine the actual segment type (openingChant, openingGuidance, or techniqueReminder)
      segmentType = this.getSegmentTypeForBeforeSilentAudio(currentAudioIndex);
    } else if (currentSegment === 'afterSilent') {
      const audioIds = session.segments.afterSilent.audioIds;
      audioId = audioIds[currentAudioIndex];
      // Determine the actual segment type (metta or closingChant)
      segmentType = this.getSegmentTypeForAfterSilentAudio(currentAudioIndex);
    } else if (currentSegment === 'silent') {
      // Silent meditation - no audio ID
      audioId = undefined;
      segmentType = 'silent';
    }

    if (audioId || segmentType === 'silent') {
      const durationSec = this.getElapsedSeconds() - currentAudioStartTime;
      this.recordPlaybackEvent(segmentType, audioId, currentAudioStartTime, durationSec, completed);
    }
  }

  /**
   * Determine which segment type a before-silent audio belongs to
   */
  private getSegmentTypeForBeforeSilentAudio(audioIndex: number): SessionSegmentType {
    const sessionStore = useSessionStore.getState();
    const { segments } = sessionStore;

    let currentIndex = 0;

    // Check opening chant
    if (segments.openingChant.isEnabled && segments.openingChant.selectedAudioIds.length > 0) {
      const count = segments.openingChant.selectedAudioIds.length;
      if (audioIndex < currentIndex + count) return 'openingChant';
      currentIndex += count;
    }

    // Check opening guidance
    if (
      segments.openingGuidance.isEnabled &&
      segments.openingGuidance.selectedAudioIds.length > 0
    ) {
      const count = segments.openingGuidance.selectedAudioIds.length;
      if (audioIndex < currentIndex + count) return 'openingGuidance';
      currentIndex += count;
    }

    // Must be technique reminder
    return 'techniqueReminder';
  }

  /**
   * Determine which segment type an after-silent audio belongs to
   */
  private getSegmentTypeForAfterSilentAudio(audioIndex: number): SessionSegmentType {
    const sessionStore = useSessionStore.getState();
    const { segments } = sessionStore;

    let currentIndex = 0;

    // Check metta
    if (segments.metta.isEnabled && segments.metta.selectedAudioIds.length > 0) {
      const count = segments.metta.selectedAudioIds.length;
      if (audioIndex < currentIndex + count) return 'metta';
      currentIndex += count;
    }

    // Must be closing chant
    return 'closingChant';
  }

  /**
   * Get elapsed time in seconds since session start
   */
  getElapsedSeconds(): number {
    return (Date.now() - this.sessionStartTime) / 1000;
  }

  /**
   * Complete the current session
   */
  completeSession(): void {
    if (!this.currentHistorySessionId) return;

    const actualDurationSec = this.getElapsedSeconds();
    const historyStore = useHistoryStore.getState();
    historyStore.completeSession(this.currentHistorySessionId, actualDurationSec);
    this.currentHistorySessionId = null;
  }

  /**
   * Stop the current session early
   */
  stopSession(): void {
    if (!this.currentHistorySessionId) return;

    const actualDurationSec = this.getElapsedSeconds();
    const stoppedAtSec = actualDurationSec;
    const historyStore = useHistoryStore.getState();
    historyStore.stopSession(this.currentHistorySessionId, stoppedAtSec, actualDurationSec);
    this.currentHistorySessionId = null;
  }

  /**
   * Get the current history session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentHistorySessionId;
  }
}
