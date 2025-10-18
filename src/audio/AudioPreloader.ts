import { Asset } from 'expo-asset';
import { segmentTypeToAudioMap } from '@/data/audioData';

export class AudioPreloader {
  private static isPreloading = false;
  private static preloadedModules: Map<string, number> = new Map();

  static async preloadAllAudio(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;

    try {
      const promises: Promise<void>[] = [];

      // Preload all audio files using expo-asset
      // This ensures assets are available on the device
      for (const audioList of Object.values(segmentTypeToAudioMap)) {
        for (const audio of audioList) {
          const promise = (async () => {
            try {
              // Convert require() module to Asset to trigger download
              const asset = Asset.fromModule(audio.fileUri);
              await asset.downloadAsync();
              // Store the original module number, not the asset
              this.preloadedModules.set(audio.id, audio.fileUri);
            } catch (error) {
              // Audio preload failed silently
            }
          })();
          promises.push(promise);
        }
      }

      await Promise.all(promises);
    } catch (error) {
      // Some audio sources failed to cache
    } finally {
      this.isPreloading = false;
    }
  }

  static getPreloadedSound(audioId: string): number | null {
    return this.preloadedModules.get(audioId) || null;
  }

  static async cleanup(): Promise<void> {
    // Clear the cached module references
    this.preloadedModules.clear();
  }

  static isAudioPreloaded(audioId: string): boolean {
    return this.preloadedModules.has(audioId);
  }
}
