import { getGongAudioByPreference, segmentTypeToAudioMap } from '@/data/audioData';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';
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
  private currentAudioIndex = 0; // Track current audio index in the current segment
  private isEndGongPlaying = false; // Track if we're playing the end gong
  private silentPauseTimer: ReturnType<typeof setTimeout> | null = null; // Timer for silent pauses

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

  private buildSessionFromStore(store: any): MeditationSession {
    const { totalDurationMinutes, segments } = store;
    const preferences = usePreferencesStore.getState().preferences;

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
    let beforeSilentDuration = 0;

    if (segments.openingChant.isEnabled && segments.openingChant.selectedAudioIds.length > 0) {
      beforeSilentAudioIds.push(...segments.openingChant.selectedAudioIds);
      beforeSilentDuration += getSegmentDisplayDuration(
        'openingChant',
        segments.openingChant.selectedAudioIds,
        segments.openingChant.durationSec
      );
    }

    if (
      segments.openingGuidance.isEnabled &&
      segments.openingGuidance.selectedAudioIds.length > 0
    ) {
      beforeSilentAudioIds.push(...segments.openingGuidance.selectedAudioIds);
      beforeSilentDuration += getSegmentDisplayDuration(
        'openingGuidance',
        segments.openingGuidance.selectedAudioIds,
        segments.openingGuidance.durationSec
      );
    }

    if (
      segments.techniqueReminder.isEnabled &&
      segments.techniqueReminder.selectedAudioIds.length > 0
    ) {
      beforeSilentAudioIds.push(...segments.techniqueReminder.selectedAudioIds);
      beforeSilentDuration += getSegmentDisplayDuration(
        'techniqueReminder',
        segments.techniqueReminder.selectedAudioIds,
        segments.techniqueReminder.durationSec
      );
    }

    // Collect after-silent audio (metta, closing chant)
    const afterSilentAudioIds: string[] = [];
    let afterSilentDuration = 0;

    if (segments.metta.isEnabled && segments.metta.selectedAudioIds.length > 0) {
      afterSilentAudioIds.push(...segments.metta.selectedAudioIds);
      afterSilentDuration += getSegmentDisplayDuration(
        'metta',
        segments.metta.selectedAudioIds,
        segments.metta.durationSec
      );
    }

    if (segments.closingChant.isEnabled && segments.closingChant.selectedAudioIds.length > 0) {
      afterSilentAudioIds.push(...segments.closingChant.selectedAudioIds);
      afterSilentDuration += getSegmentDisplayDuration(
        'closingChant',
        segments.closingChant.selectedAudioIds,
        segments.closingChant.durationSec
      );
    }

    // Calculate silent duration
    const totalDurationSec = totalDurationMinutes * 60;
    const silentDuration = totalDurationSec - beforeSilentDuration - afterSilentDuration;

    return {
      totalDurationMinutes,
      segments: {
        ...(gongSegment && { gong: gongSegment }),
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

  private async handleSessionComplete(): Promise<void> {
    // Check if we should play end gong
    const preferences = usePreferencesStore.getState().preferences;
    if (preferences.gongPreference !== 'none') {
      await this.playEndGong();
    } else {
      this.finalizeSession();
    }
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
      this.updateState({
        currentSegment: 'silent',
        isPlaying: false,
      });

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
    if (this.sessionState.currentSegment === 'silent') {
      if (this.silentPauseTimer) {
        // Pause silent pause timer
        clearTimeout(this.silentPauseTimer);
        this.silentPauseTimer = null;
      } else {
        this.meditationTimer.pause();
      }
    } else {
      await this.audioPlayer.pause();
    }
  }

  async resume(): Promise<void> {
    if (this.sessionState.currentSegment === 'silent') {
      if (this.silentPauseTimer) {
        // Resume silent pause timer (restart it)
        await this.playSilentPause();
      } else {
        this.meditationTimer.resume();
      }
    } else {
      await this.audioPlayer.play();
    }
  }

  async stop(): Promise<void> {
    this.meditationTimer.stop();
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
    this.meditationTimer.stop();
    await this.audioPlayer.cleanup();
    if (this.silentPauseTimer) {
      clearTimeout(this.silentPauseTimer);
      this.silentPauseTimer = null;
    }
    await AudioPreloader.cleanup();
  }
}
