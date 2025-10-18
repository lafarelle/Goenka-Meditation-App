import { Asset } from 'expo-asset';
import { segmentTypeToAudioMap } from '@/data/audioData';

/**
 * AudioPreloader - Manages efficient audio file preloading and caching
 *
 * PERFORMANCE OPTIMIZATION NOTES:
 * - Preloading happens ONCE during app startup (in AnimatedSplashScreen)
 * - All audio files (stored locally) are downloaded to device cache during preload
 * - Cached modules are stored in memory via Map for instant access
 * - This approach ensures smooth playback without stuttering during meditation sessions
 *
 * MEMORY CONSIDERATIONS:
 * - Audio files are preloaded into the device's file system cache (not RAM)
 * - The preloadedModules Map only stores module references (~100 bytes per entry)
 * - Actual audio data is not duplicated in memory
 * - For typical meditation apps (10-20 audio files), impact is minimal
 *
 * APP PERFORMANCE:
 * - ✅ Prevents duplicate preloading via isPreloadComplete flag
 * - ✅ Uses Promise.all() for concurrent loading (faster than sequential)
 * - ✅ Preloads during splash screen (4 seconds), so not blocking user interaction
 * - ✅ AudioSessionManager checks completion before redundant preload
 */
export class AudioPreloader {
  private static isPreloading = false;
  private static isPreloadComplete = false;
  private static preloadedModules: Map<string, number> = new Map();

  static async preloadAllAudio(): Promise<void> {
    // Skip if already preloaded or currently preloading
    if (this.isPreloadComplete || this.isPreloading) {
      console.log('[AudioPreloader] Audio already preloaded or preloading in progress');
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
      this.isPreloadComplete = true;
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

  static isPreloadingComplete(): boolean {
    return this.isPreloadComplete;
  }
}
