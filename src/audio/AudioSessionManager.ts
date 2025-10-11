import { segmentTypeToAudioMap } from '@/data/audioData';
import { useSessionStore } from '@/store/sessionStore';
import { AudioPlayer } from './AudioPlayer';
import { AudioPreloader } from './AudioPreloader';
import { MeditationTimer } from './MeditationTimer';
import { AudioSessionState, MeditationSession } from './types';

export class AudioSessionManager {
  private audioPlayer: AudioPlayer;
  private meditationTimer: MeditationTimer;
  private sessionState: AudioSessionState;
  private session: MeditationSession | null = null;
  private callbacks: {
    onStateChange?: (state: AudioSessionState) => void;
    onSessionComplete?: () => void;
    onError?: (error: string) => void;
  } = {};
  private isInitialized = false;

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

    this.meditationTimer = new MeditationTimer({
      onTick: (remainingSeconds) => this.updateTimer(remainingSeconds),
      onComplete: () => this.handleTimerComplete(),
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

      // Start with before-silent audio
      await this.playBeforeSilentAudio();
    } catch (error) {
      this.handleError(`Failed to start session: ${error}`);
    }
  }

  private buildSessionFromStore(store: any): MeditationSession {
    const { totalDurationMinutes, segments } = store;

    // Collect before-silent audio (opening chant, guidance, technique reminder)
    const beforeSilentAudioIds: string[] = [];
    let beforeSilentDuration = 0;

    if (segments.openingChant.isEnabled && segments.openingChant.selectedAudioIds.length > 0) {
      beforeSilentAudioIds.push(...segments.openingChant.selectedAudioIds);
      beforeSilentDuration += segments.openingChant.durationSec;
    }

    if (
      segments.openingGuidance.isEnabled &&
      segments.openingGuidance.selectedAudioIds.length > 0
    ) {
      beforeSilentAudioIds.push(...segments.openingGuidance.selectedAudioIds);
      beforeSilentDuration += segments.openingGuidance.durationSec;
    }

    if (
      segments.techniqueReminder.isEnabled &&
      segments.techniqueReminder.selectedAudioIds.length > 0
    ) {
      beforeSilentAudioIds.push(...segments.techniqueReminder.selectedAudioIds);
      beforeSilentDuration += segments.techniqueReminder.durationSec;
    }

    // Collect after-silent audio (metta, closing chant)
    const afterSilentAudioIds: string[] = [];
    let afterSilentDuration = 0;

    if (segments.metta.isEnabled && segments.metta.selectedAudioIds.length > 0) {
      afterSilentAudioIds.push(...segments.metta.selectedAudioIds);
      afterSilentDuration += segments.metta.durationSec;
    }

    if (segments.closingChant.isEnabled && segments.closingChant.selectedAudioIds.length > 0) {
      afterSilentAudioIds.push(...segments.closingChant.selectedAudioIds);
      afterSilentDuration += segments.closingChant.durationSec;
    }

    // Calculate silent duration
    const totalDurationSec = totalDurationMinutes * 60;
    const silentDuration = totalDurationSec - beforeSilentDuration - afterSilentDuration;

    return {
      totalDurationMinutes,
      segments: {
        beforeSilent: {
          audioIds: beforeSilentAudioIds,
          duration: beforeSilentDuration,
        },
        silent: {
          duration: Math.max(0, silentDuration),
        },
        afterSilent: {
          audioIds: afterSilentAudioIds,
          duration: afterSilentDuration,
        },
      },
    };
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

    if (currentSegment === 'beforeSilent') {
      // Check if there are more before-silent audios to play
      const remainingAudios = this.session.segments.beforeSilent.audioIds.slice(1);

      if (remainingAudios.length > 0) {
        // Play next audio
        const nextAudioId = remainingAudios[0];
        const audioFile = this.getAudioFile(nextAudioId);

        if (audioFile) {
          await this.audioPlayer.loadAudio(nextAudioId, audioFile);
          await this.audioPlayer.play();
          return;
        }
      }

      // All before-silent audio finished, start silent meditation
      await this.startSilentMeditation();
    } else if (currentSegment === 'afterSilent') {
      // Check if there are more after-silent audios to play
      const remainingAudios = this.session.segments.afterSilent.audioIds.slice(1);

      if (remainingAudios.length > 0) {
        // Play next audio
        const nextAudioId = remainingAudios[0];
        const audioFile = this.getAudioFile(nextAudioId);

        if (audioFile) {
          await this.audioPlayer.loadAudio(nextAudioId, audioFile);
          await this.audioPlayer.play();
          return;
        }
      }

      // All audio finished, session complete
      this.handleSessionComplete();
    }
  }

  private async startSilentMeditation(): Promise<void> {
    if (!this.session) return;

    this.updateState({
      currentSegment: 'silent',
      isPlaying: false,
    });

    // Start the silent meditation timer
    this.meditationTimer.start(this.session.segments.silent.duration);
  }

  private async handleTimerComplete(): Promise<void> {
    if (!this.session || this.session.segments.afterSilent.audioIds.length === 0) {
      // No after-silent audio, session complete
      this.handleSessionComplete();
      return;
    }

    // Start after-silent audio
    await this.playAfterSilentAudio();
  }

  private async playAfterSilentAudio(): Promise<void> {
    if (!this.session) return;

    this.updateState({
      currentSegment: 'afterSilent',
      isPlaying: true,
    });

    // Play the first after-silent audio file
    const firstAudioId = this.session.segments.afterSilent.audioIds[0];
    const audioFile = this.getAudioFile(firstAudioId);

    if (audioFile) {
      await this.audioPlayer.loadAudio(firstAudioId, audioFile);
      await this.audioPlayer.play();
    } else {
      // If no valid audio, session complete
      this.handleSessionComplete();
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
    this.updateState({
      progress,
    });
  }

  private updateTimer(remainingSeconds: number): void {
    if (!this.session) return;

    const totalSilentDuration = this.session.segments.silent.duration;
    const elapsed = totalSilentDuration - remainingSeconds;
    const progress = totalSilentDuration > 0 ? elapsed / totalSilentDuration : 0;

    this.updateState({
      remainingTime: remainingSeconds,
      progress: Math.min(progress, 1),
    });
  }

  private updateState(updates: Partial<AudioSessionState>): void {
    this.sessionState = { ...this.sessionState, ...updates };
    this.callbacks.onStateChange?.(this.sessionState);
  }

  private handleError(error: string): void {
    this.callbacks.onError?.(error);
  }

  private handleSessionComplete(): void {
    this.updateState({
      currentSegment: null,
      isPlaying: false,
      progress: 1,
    });
    this.callbacks.onSessionComplete?.();
  }

  // Public methods for controlling the session
  async pause(): Promise<void> {
    if (this.sessionState.currentSegment === 'silent') {
      this.meditationTimer.pause();
    } else {
      await this.audioPlayer.pause();
    }
  }

  async resume(): Promise<void> {
    if (this.sessionState.currentSegment === 'silent') {
      this.meditationTimer.resume();
    } else {
      await this.audioPlayer.play();
    }
  }

  async stop(): Promise<void> {
    this.meditationTimer.stop();
    await this.audioPlayer.stop();
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
    this.meditationTimer.stop();
    await this.audioPlayer.cleanup();
    await AudioPreloader.cleanup();
  }
}
