import { segmentTypeToAudioMap } from '@/data/audioData';

export class AudioPreloader {
  private static isPreloading = false;
  private static preloadedSources: Map<string, any> = new Map();

  static async preloadAllAudio(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;

    try {
      // For expo-audio, we just cache the audio sources
      // The actual loading happens when creating the player
      for (const audioList of Object.values(segmentTypeToAudioMap)) {
        for (const audio of audioList) {
          this.preloadedSources.set(audio.id, audio.fileUri);
        }
      }
    } catch (error) {
      console.warn('Some audio sources failed to cache:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  static getPreloadedSound(audioId: string): any | null {
    return this.preloadedSources.get(audioId) || null;
  }

  static async cleanup(): Promise<void> {
    // For expo-audio, we just clear the cached sources
    this.preloadedSources.clear();
  }

  static isAudioPreloaded(audioId: string): boolean {
    return this.preloadedSources.has(audioId);
  }
}
