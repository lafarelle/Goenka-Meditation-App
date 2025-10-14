import { getGongAudioByPreference } from '@/data/audioData';
import { AudioSessionState, MeditationSession } from '@/schemas/audio';
import { usePreferencesStore } from '@/store/preferencesStore';
import { AudioPlayer } from '../AudioPlayer';
import { getAudioFile } from './audioFileResolver';

/**
 * Manages playback of individual session segments
 */
export class SegmentPlayer {
  private audioPlayer: AudioPlayer;
  private session: MeditationSession | null = null;
  private currentAudioIndex = 0;
  private isEndGongPlaying = false;
  private silentPauseTimer: ReturnType<typeof setTimeout> | null = null;
  private isTransitioning = false;

  // Callbacks
  private onAudioStarted?: (audioStartTime: number) => void;
  private onStateUpdate?: (updates: Partial<AudioSessionState>) => void;
  private onSegmentComplete?: () => void;

  constructor(
    audioPlayer: AudioPlayer,
    callbacks: {
      onAudioStarted?: (audioStartTime: number) => void;
      onStateUpdate?: (updates: Partial<AudioSessionState>) => void;
      onSegmentComplete?: () => void;
    }
  ) {
    this.audioPlayer = audioPlayer;
    this.onAudioStarted = callbacks.onAudioStarted;
    this.onStateUpdate = callbacks.onStateUpdate;
    this.onSegmentComplete = callbacks.onSegmentComplete;
  }

  setSession(session: MeditationSession): void {
    this.session = session;
  }

  getCurrentAudioIndex(): number {
    return this.currentAudioIndex;
  }

  isEndGong(): boolean {
    return this.isEndGongPlaying;
  }

  getIsTransitioning(): boolean {
    return this.isTransitioning;
  }

  setIsTransitioning(value: boolean): void {
    this.isTransitioning = value;
  }

  async playGong(getElapsedSeconds: () => number): Promise<void> {
    if (!this.session?.segments.gong) {
      console.warn('[SegmentPlayer] No gong segment configured');
      return;
    }

    this.isEndGongPlaying = false; // Reset flag for start gong
    this.onStateUpdate?.({
      currentSegment: 'gong',
      isPlaying: true,
    });

    const gongAudioId = this.session.segments.gong.audioId;
    const audioFile = getAudioFile(gongAudioId);

    if (audioFile) {
      try {
        // Track when this audio starts
        this.onAudioStarted?.(getElapsedSeconds());

        await this.audioPlayer.loadAudio(gongAudioId, audioFile);
        await this.audioPlayer.play();
      } catch (error) {
        console.error('[SegmentPlayer] Error playing gong:', error);
        throw error;
      }
    } else {
      console.error('[SegmentPlayer] Gong audio file not found:', gongAudioId);
    }
  }

  async playBeforeSilentAudio(
    currentSegment: string | null,
    getElapsedSeconds: () => number
  ): Promise<void> {
    if (!this.session || this.session.segments.beforeSilent.audioIds.length === 0) {
      console.log('[SegmentPlayer] No beforeSilent audio configured, skipping');
      return;
    }

    // Prevent multiple calls to this method
    if (currentSegment === 'beforeSilent' || this.isTransitioning) {
      console.log('[SegmentPlayer] Already in beforeSilent or transitioning, skipping');
      return;
    }

    console.log('[SegmentPlayer] Starting beforeSilent audio playback');

    // Update state immediately to prevent multiple calls
    this.onStateUpdate?.({
      currentSegment: 'beforeSilent',
      isPlaying: true,
    });

    // Reset audio index for before-silent segment
    this.currentAudioIndex = 0;

    // Play the first audio file
    const firstAudioId = this.session.segments.beforeSilent.audioIds[0];
    const audioFile = getAudioFile(firstAudioId);

    if (audioFile) {
      try {
        // Track when this audio starts
        this.onAudioStarted?.(getElapsedSeconds());

        await this.audioPlayer.loadAudio(firstAudioId, audioFile);
        await this.audioPlayer.play();
      } catch (error) {
        console.error('[SegmentPlayer] Error playing beforeSilent audio:', error);
        throw error;
      }
    } else {
      console.error('[SegmentPlayer] BeforeSilent audio file not found:', firstAudioId);
    }
  }

  async playNextBeforeSilentAudio(getElapsedSeconds: () => number): Promise<boolean> {
    if (!this.session) return false;

    this.currentAudioIndex++;
    const audioIds = this.session.segments.beforeSilent.audioIds;

    if (this.currentAudioIndex < audioIds.length) {
      console.log(
        `[SegmentPlayer] Playing next beforeSilent audio (${this.currentAudioIndex + 1}/${audioIds.length})`
      );

      try {
        // Add silent pause before next audio
        await this.playSilentPause();
        // Play next audio
        const nextAudioId = audioIds[this.currentAudioIndex];
        const audioFile = getAudioFile(nextAudioId);

        if (audioFile) {
          // Track when this audio starts
          this.onAudioStarted?.(getElapsedSeconds());

          await this.audioPlayer.loadAudio(nextAudioId, audioFile);
          await this.audioPlayer.play();
          return true;
        } else {
          console.error('[SegmentPlayer] Audio file not found:', nextAudioId);
        }
      } catch (error) {
        console.error('[SegmentPlayer] Error playing next beforeSilent audio:', error);
        throw error;
      }
    }

    console.log('[SegmentPlayer] No more beforeSilent audio to play');
    return false;
  }

  async playAfterSilentAudio(
    currentSegment: string | null,
    getElapsedSeconds: () => number
  ): Promise<void> {
    if (!this.session) return;

    console.log(
      'playAfterSilentAudio called, currentSegment:',
      currentSegment,
      'isTransitioning:',
      this.isTransitioning
    );

    // Check if there are any after-silent audio files
    if (
      !this.session.segments.afterSilent.audioIds ||
      this.session.segments.afterSilent.audioIds.length === 0
    ) {
      console.log('No after-silent audio files, completing session');
      this.onSegmentComplete?.();
      return;
    }

    console.log(
      'Playing after-silent audio, audioIds:',
      this.session.segments.afterSilent.audioIds
    );

    // Add silent pause before after-silent audio
    await this.playSilentPause();

    // Reset audio index for after-silent segment
    this.currentAudioIndex = 0;

    // Play the first after-silent audio file
    const firstAudioId = this.session.segments.afterSilent.audioIds[0];
    const audioFile = getAudioFile(firstAudioId);

    console.log('First audio ID:', firstAudioId, 'Audio file:', audioFile);

    if (audioFile) {
      console.log('Loading and playing audio...');

      // Track when this audio starts
      this.onAudioStarted?.(getElapsedSeconds());

      await this.audioPlayer.loadAudio(firstAudioId, audioFile);
      await this.audioPlayer.play();
    } else {
      console.log('No valid audio file, completing session');
      this.onSegmentComplete?.();
    }
  }

  async playNextAfterSilentAudio(getElapsedSeconds: () => number): Promise<boolean> {
    if (!this.session) return false;

    this.currentAudioIndex++;
    const audioIds = this.session.segments.afterSilent.audioIds;

    if (this.currentAudioIndex < audioIds.length) {
      // Add silent pause before next audio
      await this.playSilentPause();
      // Play next audio
      const nextAudioId = audioIds[this.currentAudioIndex];
      const audioFile = getAudioFile(nextAudioId);

      if (audioFile) {
        // Track when this audio starts
        this.onAudioStarted?.(getElapsedSeconds());

        await this.audioPlayer.loadAudio(nextAudioId, audioFile);
        await this.audioPlayer.play();
        return true;
      }
    }

    return false;
  }

  async startSilentMeditation(
    currentSegment: string | null,
    getElapsedSeconds: () => number
  ): Promise<void> {
    if (!this.session) return;

    // Prevent multiple calls to this method
    if (currentSegment === 'silent' || this.isTransitioning) return;

    // Track when silent meditation starts
    this.onAudioStarted?.(getElapsedSeconds());

    this.onStateUpdate?.({
      currentSegment: 'silent',
      isPlaying: true, // Keep playing state true during silent meditation
    });

    // Silent meditation is now handled by the main session timer
    // No need to start a separate timer
  }

  async playEndGong(getElapsedSeconds: () => number): Promise<void> {
    if (!this.session) return;

    this.isEndGongPlaying = true;
    this.onStateUpdate?.({
      currentSegment: 'gong',
      isPlaying: true,
    });

    const preferences = usePreferencesStore.getState().preferences;
    let gongAudio = getGongAudioByPreference(preferences.gongPreference);

    // If no gong was selected for the beginning, use G1 as default for the end
    if (!gongAudio) {
      gongAudio = getGongAudioByPreference('G1');
    }

    if (gongAudio) {
      const audioFile = getAudioFile(gongAudio.id);
      if (audioFile) {
        // Track when this audio starts
        this.onAudioStarted?.(getElapsedSeconds());

        await this.audioPlayer.loadAudio(gongAudio.id, audioFile);
        await this.audioPlayer.play();
        return;
      }
    }

    // If no valid gong audio, complete session
    this.onSegmentComplete?.();
  }

  async playSilentPause(durationSeconds?: number): Promise<void> {
    // Use user's pause duration preference if not specified
    const pauseDuration =
      durationSeconds ?? usePreferencesStore.getState().preferences.pauseDuration;

    console.log(`[SegmentPlayer] Starting silent pause (${pauseDuration}s)`);

    return new Promise((resolve) => {
      // Clear any existing timer first
      this.clearSilentPauseTimer();

      // Don't change the playing state during silent pauses
      // The session timer continues running, so isPlaying should remain true
      this.silentPauseTimer = setTimeout(() => {
        console.log('[SegmentPlayer] Silent pause completed');
        this.silentPauseTimer = null;
        resolve();
      }, pauseDuration * 1000);
    });
  }

  clearSilentPauseTimer(): void {
    if (this.silentPauseTimer) {
      console.log('[SegmentPlayer] Clearing silent pause timer');
      clearTimeout(this.silentPauseTimer);
      this.silentPauseTimer = null;
    }
  }

  /**
   * Cleanup resources to prevent memory leaks
   */
  cleanup(): void {
    this.clearSilentPauseTimer();
    this.session = null;
    this.currentAudioIndex = 0;
    this.isEndGongPlaying = false;
    this.isTransitioning = false;
  }
}
