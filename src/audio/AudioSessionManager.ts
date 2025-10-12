import { getGongAudioByPreference, segmentTypeToAudioMap } from '@/data/audioData';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { calculateSessionTiming } from '@/utils/preferences';
import { AudioPlayer } from './AudioPlayer';
import { AudioPreloader } from './AudioPreloader';
import { MeditationTimer } from './MeditationTimer';
import { AudioSessionState, MeditationSession } from './types';

export class AudioSessionManager {
  private audioPlayer: AudioPlayer;
  private sessionTimer: MeditationTimer;
  private sessionState: AudioSessionState;
  private session: MeditationSession | null = null;
  private callbacks: {
    onStateChange?: (state: AudioSessionState) => void;
    onSessionComplete?: () => void;
    onError?: (error: string) => void;
  } = {};
  private isInitialized = false;
  private currentAudioIndex = 0; // Track current audio index in the current segment
  private isEndGongPlaying = false; // Track if we're playing the end gong
  private silentPauseTimer: ReturnType<typeof setTimeout> | null = null; // Timer for silent pauses
  private totalSessionDuration = 0; // Total session duration in seconds
  private sessionStartTime = 0; // When the session started

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
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: AudioSessionState) => void;
    onSessionComplete?: () => void;
    onError?: (error: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Preload all audio files for better performance
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
      // Get session configuration from store
      const sessionStore = useSessionStore.getState();
      this.session = this.buildSessionFromStore(sessionStore);

      // Calculate total session duration based on preferences
      this.totalSessionDuration = this.calculateTotalSessionDuration();
      this.sessionStartTime = Date.now();

      // Start the main session timer
      this.sessionTimer.start(this.totalSessionDuration);

      // Start with gong if configured
      if (this.session.segments.gong) {
        await this.playGong();
      } else {
        // Start with before-silent audio
        await this.playBeforeSilentAudio();
      }
    } catch (error) {
      this.handleError(`Failed to start session: ${error}`);
    }
  }

  private calculateTotalSessionDuration(): number {
    if (!this.session) return 0;

    const preferences = usePreferencesStore.getState().preferences;
    const sessionStore = useSessionStore.getState();

    // Use the timing utility to calculate the correct total duration
    const timing = calculateSessionTiming(
      sessionStore.totalDurationMinutes,
      sessionStore.segments,
      preferences.timingPreference
    );

    // Add silent pauses between audio segments
    const pauseDuration = this.calculateSilentPauseDuration();

    return timing.totalDurationSec + pauseDuration;
  }

  private calculateSilentPauseDuration(): number {
    if (!this.session) return 0;

    const { segments } = this.session;
    const pauseDuration = 10; // 10 seconds per pause

    // Count the number of pauses needed
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

    return pauseCount * pauseDuration;
  }

  private buildSessionFromStore(store: any): MeditationSession {
    const { totalDurationMinutes, segments } = store;
    const preferences = usePreferencesStore.getState().preferences;

    // Use the timing utility to calculate the correct durations
    const timing = calculateSessionTiming(
      totalDurationMinutes,
      segments,
      preferences.timingPreference
    );

    // Check for gong preference
    const gongAudio = getGongAudioByPreference(preferences.gongPreference);
    let gongSegment = null;
    if (gongAudio) {
      gongSegment = {
        audioId: gongAudio.id,
        duration: 5, // 5 seconds for gong
      };
    }

    // Collect before-silent audio (opening chant, guidance, technique reminder)
    const beforeSilentAudioIds: string[] = [];
    if (segments.openingChant.isEnabled && segments.openingChant.selectedAudioIds.length > 0) {
      beforeSilentAudioIds.push(...segments.openingChant.selectedAudioIds);
    }
    if (
      segments.openingGuidance.isEnabled &&
      segments.openingGuidance.selectedAudioIds.length > 0
    ) {
      beforeSilentAudioIds.push(...segments.openingGuidance.selectedAudioIds);
    }
    if (
      segments.techniqueReminder.isEnabled &&
      segments.techniqueReminder.selectedAudioIds.length > 0
    ) {
      beforeSilentAudioIds.push(...segments.techniqueReminder.selectedAudioIds);
    }

    // Collect after-silent audio (metta, closing chant)
    const afterSilentAudioIds: string[] = [];
    if (segments.metta.isEnabled && segments.metta.selectedAudioIds.length > 0) {
      afterSilentAudioIds.push(...segments.metta.selectedAudioIds);
    }
    if (segments.closingChant.isEnabled && segments.closingChant.selectedAudioIds.length > 0) {
      afterSilentAudioIds.push(...segments.closingChant.selectedAudioIds);
    }

    return {
      totalDurationMinutes,
      segments: {
        ...(gongSegment && { gong: gongSegment }),
        beforeSilent: {
          audioIds: beforeSilentAudioIds,
          duration: timing.audioDurationSec / 2, // Half of audio time for before-silent
        },
        silent: {
          duration: timing.silentDurationSec,
        },
        afterSilent: {
          audioIds: afterSilentAudioIds,
          duration: timing.audioDurationSec / 2, // Half of audio time for after-silent
        },
      },
    };
  }

  private async playGong(): Promise<void> {
    if (!this.session?.segments.gong) return;

    this.isEndGongPlaying = false; // Reset flag for start gong
    this.updateState({
      currentSegment: 'gong',
      isPlaying: true,
    });

    const gongAudioId = this.session.segments.gong.audioId;
    const audioFile = this.getAudioFile(gongAudioId);

    if (audioFile) {
      await this.audioPlayer.loadAudio(gongAudioId, audioFile);
      await this.audioPlayer.play();
    } else {
      // If no valid gong audio, skip to before-silent audio
      await this.playBeforeSilentAudio();
    }
  }

  private async playBeforeSilentAudio(): Promise<void> {
    if (!this.session || this.session.segments.beforeSilent.audioIds.length === 0) {
      // No before-silent audio, go directly to silent meditation
      await this.startSilentMeditation();
      return;
    }

    this.updateState({
      currentSegment: 'beforeSilent',
      isPlaying: true,
    });

    // Reset audio index for before-silent segment
    this.currentAudioIndex = 0;

    // Play the first audio file
    const firstAudioId = this.session.segments.beforeSilent.audioIds[0];
    const audioFile = this.getAudioFile(firstAudioId);

    if (audioFile) {
      await this.audioPlayer.loadAudio(firstAudioId, audioFile);
      await this.audioPlayer.play();
    } else {
      // If no valid audio, skip to silent meditation
      await this.startSilentMeditation();
    }
  }

  private async handleAudioFinished(): Promise<void> {
    if (!this.session) return;

    const currentSegment = this.sessionState.currentSegment;

    if (currentSegment === 'gong') {
      // Gong finished, add silent pause then move to before-silent audio
      await this.playSilentPause();
      await this.playBeforeSilentAudio();
    } else if (currentSegment === 'beforeSilent') {
      // Move to next audio in before-silent segment
      this.currentAudioIndex++;
      const audioIds = this.session.segments.beforeSilent.audioIds;

      if (this.currentAudioIndex < audioIds.length) {
        // Add silent pause before next audio
        await this.playSilentPause();
        // Play next audio
        const nextAudioId = audioIds[this.currentAudioIndex];
        const audioFile = this.getAudioFile(nextAudioId);

        if (audioFile) {
          await this.audioPlayer.loadAudio(nextAudioId, audioFile);
          await this.audioPlayer.play();
          return;
        }
      }

      // All before-silent audio finished, add silent pause then start silent meditation
      await this.playSilentPause();
      await this.startSilentMeditation();
    } else if (currentSegment === 'afterSilent') {
      // Move to next audio in after-silent segment
      this.currentAudioIndex++;
      const audioIds = this.session.segments.afterSilent.audioIds;

      if (this.currentAudioIndex < audioIds.length) {
        // Add silent pause before next audio
        await this.playSilentPause();
        // Play next audio
        const nextAudioId = audioIds[this.currentAudioIndex];
        const audioFile = this.getAudioFile(nextAudioId);

        if (audioFile) {
          await this.audioPlayer.loadAudio(nextAudioId, audioFile);
          await this.audioPlayer.play();
          return;
        }
      }

      // All audio finished, add silent pause then check for end gong
      await this.playSilentPause();
      await this.handleSessionComplete();
    } else if (currentSegment === 'gong' && this.isEndGong()) {
      // End gong finished, finalize session
      this.finalizeSession();
    }
  }

  private async startSilentMeditation(): Promise<void> {
    if (!this.session) return;

    this.updateState({
      currentSegment: 'silent',
      isPlaying: true, // Keep playing state true during silent meditation
    });

    // Silent meditation is now handled by the main session timer
    // No need to start a separate timer
  }

  private async handleSessionComplete(): Promise<void> {
    // Check if we should play end gong
    const preferences = usePreferencesStore.getState().preferences;
    if (preferences.gongPreference !== 'none') {
      await this.playEndGong();
    } else {
      this.finalizeSession();
    }
  }

  private async playAfterSilentAudio(): Promise<void> {
    if (!this.session) return;

    // Add silent pause before after-silent audio
    await this.playSilentPause();

    this.updateState({
      currentSegment: 'afterSilent',
      isPlaying: true,
    });

    // Reset audio index for after-silent segment
    this.currentAudioIndex = 0;

    // Play the first after-silent audio file
    const firstAudioId = this.session.segments.afterSilent.audioIds[0];
    const audioFile = this.getAudioFile(firstAudioId);

    if (audioFile) {
      await this.audioPlayer.loadAudio(firstAudioId, audioFile);
      await this.audioPlayer.play();
    } else {
      // If no valid audio, session complete
      await this.handleSessionComplete();
    }
  }

  private getAudioFile(audioId: string): any | null {
    // Find the audio file in the segmentTypeToAudioMap
    for (const audioList of Object.values(segmentTypeToAudioMap)) {
      for (const audio of audioList) {
        if (audio.id === audioId) {
          return audio.fileUri;
        }
      }
    }
    return null;
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

    // Check if we need to transition to the next segment
    this.checkSegmentTransition(elapsed);
  }

  private checkSegmentTransition(elapsedSeconds: number): void {
    if (!this.session) return;

    const { segments } = this.session;
    const currentSegment = this.sessionState.currentSegment;

    // Calculate transition points including pauses
    const gongDuration = segments.gong ? 5 : 0;
    const beforeSilentDuration = segments.beforeSilent.duration;
    const silentDuration = segments.silent.duration;
    const afterSilentDuration = segments.afterSilent.duration;

    // Calculate pause durations
    const pauseDuration = 10; // 10 seconds per pause
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
    if (currentSegment === 'gong' && elapsedSeconds >= beforeSilentEnd) {
      this.transitionToBeforeSilent();
    } else if (currentSegment === 'beforeSilent' && elapsedSeconds >= beforeSilentEnd) {
      this.transitionToSilent();
    } else if (currentSegment === 'silent' && elapsedSeconds >= silentEnd) {
      this.transitionToAfterSilent();
    } else if (currentSegment === 'afterSilent' && elapsedSeconds >= afterSilentEnd) {
      this.handleSessionComplete();
    }
  }

  private async transitionToBeforeSilent(): Promise<void> {
    await this.playBeforeSilentAudio();
  }

  private async transitionToSilent(): Promise<void> {
    await this.startSilentMeditation();
  }

  private async transitionToAfterSilent(): Promise<void> {
    await this.playAfterSilentAudio();
  }

  private calculateTotalRemainingTime(): number {
    if (!this.session) return 0;

    // Always use the session timer for remaining time
    return this.sessionTimer.getRemainingSeconds();
  }

  private updateState(updates: Partial<AudioSessionState>): void {
    this.sessionState = { ...this.sessionState, ...updates };

    // Always ensure remainingTime is calculated if not provided
    if (updates.remainingTime === undefined) {
      this.sessionState.remainingTime = this.calculateTotalRemainingTime();
    }

    this.callbacks.onStateChange?.(this.sessionState);
  }

  private handleError(error: string): void {
    this.callbacks.onError?.(error);
  }

  private async playEndGong(): Promise<void> {
    if (!this.session) return;

    this.isEndGongPlaying = true;
    this.updateState({
      currentSegment: 'gong',
      isPlaying: true,
    });

    const preferences = usePreferencesStore.getState().preferences;
    const gongAudio = getGongAudioByPreference(preferences.gongPreference);

    if (gongAudio) {
      const audioFile = this.getAudioFile(gongAudio.id);
      if (audioFile) {
        await this.audioPlayer.loadAudio(gongAudio.id, audioFile);
        await this.audioPlayer.play();
        return;
      }
    }

    // If no valid gong audio, finalize session
    this.finalizeSession();
  }

  private isEndGong(): boolean {
    return this.isEndGongPlaying;
  }

  private async playSilentPause(durationSeconds: number = 10): Promise<void> {
    return new Promise((resolve) => {
      // Don't change the playing state during silent pauses
      // The session timer continues running, so isPlaying should remain true
      this.silentPauseTimer = setTimeout(() => {
        this.silentPauseTimer = null;
        resolve();
      }, durationSeconds * 1000);
    });
  }

  private finalizeSession(): void {
    this.isEndGongPlaying = false;
    this.updateState({
      currentSegment: null,
      isPlaying: false,
      progress: 1,
    });
    this.callbacks.onSessionComplete?.();
  }

  // Public methods for controlling the session
  async pause(): Promise<void> {
    // Pause the main session timer
    this.sessionTimer.pause();

    // Pause silent pause timer if active
    if (this.silentPauseTimer) {
      clearTimeout(this.silentPauseTimer);
      this.silentPauseTimer = null;
    }

    // Pause audio if playing
    if (this.sessionState.currentSegment !== 'silent') {
      await this.audioPlayer.pause();
    }

    this.updateState({ isPlaying: false });
  }

  async resume(): Promise<void> {
    // Resume the main session timer
    this.sessionTimer.resume();

    // Resume audio if not in silent meditation
    if (this.sessionState.currentSegment !== 'silent') {
      await this.audioPlayer.play();
    }

    this.updateState({ isPlaying: true });
  }

  async stop(): Promise<void> {
    this.sessionTimer.stop();
    await this.audioPlayer.stop();
    if (this.silentPauseTimer) {
      clearTimeout(this.silentPauseTimer);
      this.silentPauseTimer = null;
    }
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
    if (this.silentPauseTimer) {
      clearTimeout(this.silentPauseTimer);
      this.silentPauseTimer = null;
    }
    await AudioPreloader.cleanup();
  }
}
