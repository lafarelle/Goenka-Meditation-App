import { setAudioModeAsync } from 'expo-audio';

/**
 * Configures the audio session for proper audio playback on iOS and Android
 * This fixes the silent audio issue by properly setting up audio mode on iOS
 * and audio focus handling on Android
 */
export class AudioSessionConfig {
  private static isInitialized = false;

  /**
   * Initialize and configure the audio session
   * Must be called before any audio playback
   */
  static async initializeAudioSession(): Promise<void> {
    if (this.isInitialized) {
      console.log('[AudioSessionConfig] Audio session already initialized');
      return;
    }

    try {
      await this.configureAudioSession();
      this.isInitialized = true;
      console.log('[AudioSessionConfig] Audio session initialized successfully');
    } catch (error) {
      console.error('[AudioSessionConfig] Failed to initialize audio session:', error);
      throw error;
    }
  }

  /**
   * Configure audio session for both iOS and Android
   * - playsInSilentMode: true - plays audio even when device is on silent (iOS)
   * - shouldPlayInBackground: true - allows audio to continue when app goes to background
   * - interruptionModeAndroid: 'duckOthers' - reduces volume of other audio on Android
   * - interruptionMode: 'mixWithOthers' - allows mixing with other audio sources
   */
  private static async configureAudioSession(): Promise<void> {
    try {
      console.log('[AudioSessionConfig] Configuring audio session...');

      await setAudioModeAsync({
        // iOS: Play audio even when device has silent/mute switch on
        playsInSilentMode: true,
        // Allow audio to continue playing when app goes to background
        shouldPlayInBackground: true,
        // Android: Reduce volume of other audio when this app plays
        interruptionModeAndroid: 'duckOthers',
        // iOS: Mix this app's audio with other audio sources instead of muting them
        interruptionMode: 'mixWithOthers',
      });

      console.log('[AudioSessionConfig] Audio session configured successfully');
    } catch (error) {
      console.error('[AudioSessionConfig] Audio session configuration failed:', error);
      throw error;
    }
  }

  /**
   * Reset audio session to default state
   */
  static async resetAudioSession(): Promise<void> {
    try {
      await setAudioModeAsync({
        playsInSilentMode: false,
        shouldPlayInBackground: false,
        interruptionModeAndroid: 'doNotMix',
        interruptionMode: 'doNotMix',
      });

      this.isInitialized = false;
      console.log('[AudioSessionConfig] Audio session reset to default');
    } catch (error) {
      console.error('[AudioSessionConfig] Failed to reset audio session:', error);
    }
  }

  /**
   * Check if audio session is initialized
   */
  static isAudioSessionInitialized(): boolean {
    return this.isInitialized;
  }
}
