import { createAudioPlayer, AudioPlayer as ExpoAudioPlayer } from 'expo-audio';
import { AudioPreloader } from './AudioPreloader';
import { AudioPlayerCallbacks } from './types';

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
      // Clean up previous player
      if (this.player) {
        this.player = null;
      }

      this.currentAudioId = audioId;

      // Try to get preloaded source first, then fallback to provided source
      let source = audioSource;
      if (!source) {
        const preloadedSource = AudioPreloader.getPreloadedSound(audioId);
        if (preloadedSource) {
          source = preloadedSource;
        } else {
          throw new Error(`No audio source provided for ${audioId}`);
        }
      }

      const finalSource = typeof source === 'string' ? { uri: source } : source;

      this.player = createAudioPlayer(finalSource, {
        updateInterval: 250,
      });

      // Set up status listener
      this.player.addListener('playbackStatusUpdate', (status) => {
        if (status.isLoaded) {
          const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
          this.callbacks.onProgressUpdate?.(progress);

          if (status.didJustFinish) {
            this.isPlaying = false;
            this.callbacks.onPlaybackFinished?.();
          }
        }
      });
    } catch (error) {
      this.callbacks.onError?.(`Failed to load audio: ${error}`);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.player) {
      this.callbacks.onError?.('No audio loaded');
      return;
    }

    try {
      this.player.play();
      this.isPlaying = true;
    } catch (error) {
      this.callbacks.onError?.(`Failed to play audio: ${error}`);
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.player || !this.isPlaying) return;

    try {
      this.player.pause();
      this.isPlaying = false;
    } catch (error) {
      this.callbacks.onError?.(`Failed to pause audio: ${error}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.player) return;

    try {
      this.player.pause();
      this.player.seekTo(0);
      this.isPlaying = false;
    } catch (error) {
      this.callbacks.onError?.(`Failed to stop audio: ${error}`);
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
        this.player.pause();
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
