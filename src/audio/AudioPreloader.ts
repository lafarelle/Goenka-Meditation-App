import { Asset } from 'expo-asset';
import { segmentTypeToAudioMap } from '@/data/audioData';

export class AudioPreloader {
  private static isPreloading = false;
  private static preloadedAssets: Map<string, Asset> = new Map();

  static async preloadAllAudio(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;

    try {
      const promises: Promise<void>[] = [];

      // Preload all audio files using expo-asset
      for (const audioList of Object.values(segmentTypeToAudioMap)) {
        for (const audio of audioList) {
          const promise = (async () => {
            try {
              // Convert require() module to Asset
              const asset = Asset.fromModule(audio.fileUri);
              await asset.downloadAsync();
              this.preloadedAssets.set(audio.id, asset);
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

  static getPreloadedSound(audioId: string): Asset | null {
    return this.preloadedAssets.get(audioId) || null;
  }

  static async cleanup(): Promise<void> {
    // Clear the cached assets
    this.preloadedAssets.clear();
  }

  static isAudioPreloaded(audioId: string): boolean {
    return this.preloadedAssets.has(audioId);
  }
}
