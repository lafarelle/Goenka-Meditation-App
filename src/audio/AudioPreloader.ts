import { Asset } from 'expo-asset';
import { segmentTypeToAudioMap } from '@/data/audioData';

export class AudioPreloader {
  private static isPreloading = false;
  private static preloadedModules: Map<string, number> = new Map();

  static async preloadAllAudio(): Promise<void> {
    if (this.isPreloading) {
      console.log('[AudioPreloader] Preloading already in progress');
      return;
    }

    this.isPreloading = true;
    console.log('[AudioPreloader] Starting audio preload...');

    try {
      const promises: Promise<void>[] = [];
      let successCount = 0;
      let failureCount = 0;

      // Preload all audio files using expo-asset
      // This ensures assets are available on the device
      for (const audioList of Object.values(segmentTypeToAudioMap)) {
        for (const audio of audioList) {
          const promise = (async () => {
            try {
              // Convert require() module to Asset to trigger download
              console.log(`[AudioPreloader] Preloading: ${audio.id}`);
              const asset = Asset.fromModule(audio.fileUri);
              await asset.downloadAsync();
              // Store the original module number, not the asset
              this.preloadedModules.set(audio.id, audio.fileUri);
              successCount++;
              console.log(`[AudioPreloader] Successfully preloaded: ${audio.id}`);
            } catch (error) {
              failureCount++;
              console.warn(`[AudioPreloader] Failed to preload audio ${audio.id}: ${error}`);
            }
          })();
          promises.push(promise);
        }
      }

      await Promise.all(promises);
      console.log(
        `[AudioPreloader] Preload complete. Success: ${successCount}, Failed: ${failureCount}`
      );
    } catch (error) {
      console.error('[AudioPreloader] Preload error:', error);
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
