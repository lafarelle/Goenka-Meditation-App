import { AudioSessionState, MeditationSession } from '@/schemas/audio';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { AudioPlayer } from './AudioPlayer';
import { AudioPreloader } from './AudioPreloader';
import { MeditationTimer } from './MeditationTimer';
import { HistoryTracker } from './utils/HistoryTracker';
import { SegmentPlayer } from './utils/SegmentPlayer';
import { SegmentTransitionManager } from './utils/SegmentTransitionManager';
import { buildSessionFromStore, calculateTotalSessionDuration } from './utils/sessionBuilder';

export class AudioSessionManager {
  private audioPlayer: AudioPlayer;
  private sessionTimer: MeditationTimer;
  private sessionState: AudioSessionState;
  private session: MeditationSession | null = null;
  private callbacks: {
    onStateChange?: (state: AudioSessionState) => void;
    onSessionComplete?: () => void;
    onTimerComplete?: () => void;
    onError?: (error: string) => void;
  } = {};
  private isInitialized = false;
  private totalSessionDuration = 0;
  private currentAudioStartTime = 0;

  // Utility modules
  private historyTracker: HistoryTracker;
  private segmentPlayer: SegmentPlayer;
  private transitionManager: SegmentTransitionManager;

  constructor() {
    this.sessionState = {
      isPlaying: false,
      currentSegment: null,
      progress: 0,
      duration: 0,
      remainingTime: 0,
    };

    this.audioPlayer = new AudioPlayer({
      onPlaybackFinished: () => this.handleAudioFinished(),
      onProgressUpdate: (progress) => this.updateProgress(progress),
      onError: (error) => this.handleError(error),
    });

    this.sessionTimer = new MeditationTimer({
      onTick: (remainingSeconds) => this.updateSessionTimer(remainingSeconds),
      onComplete: () => this.handleSessionComplete(),
      onError: (error) => this.handleError(error),
    });

    // Initialize utility modules
    this.historyTracker = new HistoryTracker();

    this.segmentPlayer = new SegmentPlayer(this.audioPlayer, {
      onAudioStarted: (audioStartTime) => {
        this.currentAudioStartTime = audioStartTime;
      },
      onStateUpdate: (updates) => this.updateState(updates),
      onSegmentComplete: () => this.handleSessionComplete(),
    });

    this.transitionManager = new SegmentTransitionManager({
      onTransitionToBeforeSilent: () => this.transitionToBeforeSilent(),
      onTransitionToSilent: () => this.transitionToSilent(),
      onTransitionToAfterSilent: () => this.transitionToAfterSilent(),
      onSessionComplete: () => this.handleSessionComplete(),
    });
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: AudioSessionState) => void;
    onSessionComplete?: () => void;
    onTimerComplete?: () => void;
    onError?: (error: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await AudioPreloader.preloadAllAudio();
      this.isInitialized = true;
    } catch (error) {
      this.handleError(`Failed to initialize audio system: ${error}`);
    }
  }

  async startSession(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const sessionStore = useSessionStore.getState();
      const preferencesStore = usePreferencesStore.getState();
      this.session = buildSessionFromStore(sessionStore);

      this.totalSessionDuration = calculateTotalSessionDuration(this.session, sessionStore);

      this.historyTracker.createHistoryEntry(
        sessionStore,
        preferencesStore,
        this.totalSessionDuration
      );

      this.segmentPlayer.setSession(this.session);
      this.transitionManager.setSession(this.session);

      this.sessionTimer.start(this.totalSessionDuration);

      if (this.session.segments.gong) {
        await this.segmentPlayer.playGong(() => this.historyTracker.getElapsedSeconds());
      } else {
        await this.segmentPlayer.playBeforeSilentAudio(
          this.sessionState.currentSegment,
          () => this.historyTracker.getElapsedSeconds()
        );
      }
    } catch (error) {
      this.handleError(`Failed to start session: ${error}`);
    }
  }

  private async handleAudioFinished(): Promise<void> {
    if (!this.session) return;

    const currentSegment = this.sessionState.currentSegment;

    // Record the playback event for the audio that just finished
    this.historyTracker.recordCurrentAudioPlayback(
      this.session,
      currentSegment,
      this.segmentPlayer.getCurrentAudioIndex(),
      this.currentAudioStartTime,
      true
    );

    if (currentSegment === 'gong') {
      if (this.segmentPlayer.isEndGong()) {
        this.finalizeSession();
      } else {
        await this.segmentPlayer.playSilentPause();
        await this.segmentPlayer.playBeforeSilentAudio(
          this.sessionState.currentSegment,
          () => this.historyTracker.getElapsedSeconds()
        );
      }
    } else if (currentSegment === 'beforeSilent') {
      const hasMore = await this.segmentPlayer.playNextBeforeSilentAudio(() =>
        this.historyTracker.getElapsedSeconds()
      );
      if (!hasMore) {
        await this.segmentPlayer.playSilentPause();
        await this.segmentPlayer.startSilentMeditation(
          this.sessionState.currentSegment,
          () => this.historyTracker.getElapsedSeconds()
        );
      }
    } else if (currentSegment === 'afterSilent') {
      const hasMore = await this.segmentPlayer.playNextAfterSilentAudio(() =>
        this.historyTracker.getElapsedSeconds()
      );
      if (!hasMore) {
        await this.segmentPlayer.playSilentPause();
        await this.handleSessionComplete();
      }
    } else if (currentSegment === 'gong' && this.segmentPlayer.isEndGong()) {
      this.finalizeSession();
    }
  }

  private async handleSessionComplete(): Promise<void> {
    this.callbacks.onTimerComplete?.();
    await this.segmentPlayer.playEndGong(() => this.historyTracker.getElapsedSeconds());
  }

  private updateProgress(progress: number): void {
    const remainingTime = this.calculateTotalRemainingTime();
    this.updateState({
      progress,
      remainingTime,
    });
  }

  private updateSessionTimer(remainingSeconds: number): void {
    if (!this.session) return;

    const totalDuration = this.totalSessionDuration;
    const elapsed = totalDuration - remainingSeconds;
    const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

    this.updateState({
      remainingTime: remainingSeconds,
      progress: Math.min(progress, 1),
    });

    this.transitionManager.checkSegmentTransition(
      elapsed,
      this.sessionState.currentSegment,
      this.segmentPlayer.getIsTransitioning()
    );
  }

  private calculateTotalRemainingTime(): number {
    return this.sessionTimer.getRemainingSeconds();
  }

  private updateState(updates: Partial<AudioSessionState>): void {
    this.sessionState = { ...this.sessionState, ...updates };

    if (updates.remainingTime === undefined) {
      this.sessionState.remainingTime = this.calculateTotalRemainingTime();
    }

    this.callbacks.onStateChange?.(this.sessionState);
  }

  private handleError(error: string): void {
    this.callbacks.onError?.(error);
  }

  private async transitionToBeforeSilent(): Promise<void> {
    if (
      this.sessionState.currentSegment === 'beforeSilent' ||
      this.segmentPlayer.getIsTransitioning()
    )
      return;
    this.segmentPlayer.setIsTransitioning(true);
    try {
      await this.segmentPlayer.playBeforeSilentAudio(
        this.sessionState.currentSegment,
        () => this.historyTracker.getElapsedSeconds()
      );
    } finally {
      this.segmentPlayer.setIsTransitioning(false);
    }
  }

  private async transitionToSilent(): Promise<void> {
    if (
      this.sessionState.currentSegment === 'silent' ||
      this.segmentPlayer.getIsTransitioning()
    )
      return;
    this.segmentPlayer.setIsTransitioning(true);
    try {
      await this.segmentPlayer.startSilentMeditation(
        this.sessionState.currentSegment,
        () => this.historyTracker.getElapsedSeconds()
      );
    } finally {
      this.segmentPlayer.setIsTransitioning(false);
    }
  }

  private async transitionToAfterSilent(): Promise<void> {
    if (
      this.sessionState.currentSegment === 'afterSilent' ||
      this.segmentPlayer.getIsTransitioning()
    )
      return;
    console.log('Transitioning to after-silent audio...');
    this.segmentPlayer.setIsTransitioning(true);

    this.historyTracker.recordCurrentAudioPlayback(
      this.session,
      this.sessionState.currentSegment,
      this.segmentPlayer.getCurrentAudioIndex(),
      this.currentAudioStartTime,
      true
    );

    this.updateState({
      currentSegment: 'afterSilent',
      isPlaying: true,
    });

    try {
      await this.segmentPlayer.playAfterSilentAudio(
        this.sessionState.currentSegment,
        () => this.historyTracker.getElapsedSeconds()
      );
    } finally {
      this.segmentPlayer.setIsTransitioning(false);
      console.log('Transition to after-silent completed');
    }
  }

  private finalizeSession(): void {
    this.historyTracker.recordCurrentAudioPlayback(
      this.session,
      this.sessionState.currentSegment,
      this.segmentPlayer.getCurrentAudioIndex(),
      this.currentAudioStartTime,
      true
    );

    this.historyTracker.completeSession();

    this.updateState({
      currentSegment: null,
      isPlaying: false,
      progress: 1,
    });
    this.callbacks.onSessionComplete?.();
  }

  async pause(): Promise<void> {
    this.sessionTimer.pause();
    this.segmentPlayer.clearSilentPauseTimer();

    if (this.sessionState.currentSegment !== 'silent') {
      await this.audioPlayer.pause();
    }

    this.updateState({ isPlaying: false });
  }

  async resume(): Promise<void> {
    this.sessionTimer.resume();

    if (this.sessionState.currentSegment !== 'silent') {
      await this.audioPlayer.play();
    }

    this.updateState({ isPlaying: true });
  }

  async stop(): Promise<void> {
    this.historyTracker.recordCurrentAudioPlayback(
      this.session,
      this.sessionState.currentSegment,
      this.segmentPlayer.getCurrentAudioIndex(),
      this.currentAudioStartTime,
      false
    );

    this.historyTracker.stopSession();

    this.sessionTimer.stop();
    await this.audioPlayer.stop();
    this.segmentPlayer.clearSilentPauseTimer();
    this.updateState({
      currentSegment: null,
      isPlaying: false,
      progress: 0,
      remainingTime: 0,
    });
  }

  getCurrentState(): AudioSessionState {
    return { ...this.sessionState };
  }

  async cleanup(): Promise<void> {
    this.sessionTimer.stop();
    await this.audioPlayer.cleanup();
    this.segmentPlayer.clearSilentPauseTimer();
    await AudioPreloader.cleanup();
  }
}

