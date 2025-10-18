import { createAudioPlayer, AudioPlayer as ExpoAudioPlayer } from 'expo-audio';
import { AudioPlayerCallbacks } from './types';
import { AudioSessionConfig } from './AudioSessionConfig';

export class AudioPlayer {
  private player: ExpoAudioPlayer | null = null;
  private callbacks: AudioPlayerCallbacks = {};
  private isPlaying = false;
  private currentAudioId: string | null = null;

  constructor(callbacks: AudioPlayerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  async loadAudio(audioId: string, audioSource?: any): Promise<void> {
    try {
      // Ensure audio session is configured before loading audio
      if (!AudioSessionConfig.isAudioSessionInitialized()) {
        console.log('[AudioPlayer] Initializing audio session before loading audio');
        await AudioSessionConfig.initializeAudioSession();
      }

      // Clean up previous player
      if (this.player) {
        console.log('[AudioPlayer] Cleaning up previous audio player');
        this.player = null;
      }

      this.currentAudioId = audioId;

      // Use the audioSource directly if provided (should be a module number from require())
      if (!audioSource) {
        const errorMsg = `No audio source provided for ${audioId}`;
        console.error('[AudioPlayer]', errorMsg);
        throw new Error(errorMsg);
      }

      console.log(`[AudioPlayer] Loading audio: ${audioId}`);

      // For bundled assets, audioSource is a module number from require()
      // Pass it directly to createAudioPlayer - expo-audio handles module numbers correctly
      this.player = createAudioPlayer(audioSource, {
        updateInterval: 250,
      });

      // Set up status listener
      this.player.addListener('playbackStatusUpdate', (status) => {
        if (status.isLoaded) {
          const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
          this.callbacks.onProgressUpdate?.(progress);

          if (status.didJustFinish) {
            this.isPlaying = false;
            console.log(`[AudioPlayer] Playback finished: ${this.currentAudioId}`);
            this.callbacks.onPlaybackFinished?.();
          }
        }
      });

      console.log(`[AudioPlayer] Audio loaded successfully: ${audioId}`);
    } catch (error) {
      const errorMsg = `Failed to load audio: ${error}`;
      console.error('[AudioPlayer]', errorMsg);
      this.callbacks.onError?.(errorMsg);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.player) {
      const errorMsg = 'No audio loaded';
      console.error('[AudioPlayer]', errorMsg);
      this.callbacks.onError?.(errorMsg);
      return;
    }

    try {
      console.log(`[AudioPlayer] Playing audio: ${this.currentAudioId}`);
      await this.player.play();
      this.isPlaying = true;
    } catch (error) {
      const errorMsg = `Failed to play audio: ${error}`;
      console.error('[AudioPlayer]', errorMsg);
      this.callbacks.onError?.(errorMsg);
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.player) return;

    try {
      console.log(`[AudioPlayer] Pausing audio: ${this.currentAudioId}`);
      await this.player.pause();
      this.isPlaying = false;
    } catch (error) {
      const errorMsg = `Failed to pause audio: ${error}`;
      console.error('[AudioPlayer]', errorMsg);
      this.callbacks.onError?.(errorMsg);
    }
  }

  async stop(): Promise<void> {
    if (!this.player) return;

    try {
      console.log(`[AudioPlayer] Stopping audio: ${this.currentAudioId}`);
      await this.player.pause();
      await this.player.seekTo(0);
      this.isPlaying = false;
    } catch (error) {
      const errorMsg = `Failed to stop audio: ${error}`;
      console.error('[AudioPlayer]', errorMsg);
      this.callbacks.onError?.(errorMsg);
    }
  }

  async setPosition(milliseconds: number): Promise<void> {
    if (!this.player) return;

    try {
      this.player.seekTo(milliseconds);
    } catch (error) {
      this.callbacks.onError?.(`Failed to set position: ${error}`);
    }
  }

  async getDuration(): Promise<number> {
    if (!this.player) return 0;

    try {
      const status = this.player.currentStatus;
      return status.isLoaded ? status.duration * 1000 : 0; // Convert to milliseconds
    } catch (error) {
      this.callbacks.onError?.(`Failed to get duration: ${error}`);
      return 0;
    }
  }

  async getCurrentPosition(): Promise<number> {
    if (!this.player) return 0;

    try {
      const status = this.player.currentStatus;
      return status.isLoaded ? status.currentTime * 1000 : 0; // Convert to milliseconds
    } catch (error) {
      this.callbacks.onError?.(`Failed to get position: ${error}`);
      return 0;
    }
  }

  async cleanup(): Promise<void> {
    if (this.player) {
      try {
        await this.player.pause();
        this.player = null;
      } catch (error) {
        this.callbacks.onError?.(`Failed to cleanup audio: ${error}`);
      }
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentAudioId(): string | null {
    return this.currentAudioId;
  }
}
