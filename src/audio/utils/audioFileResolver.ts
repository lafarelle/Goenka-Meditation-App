import { segmentTypeToAudioMap } from '@/data/audioData';

/**
 * Resolves an audio ID to its module number (for bundled assets)
 * @param audioId The ID of the audio file to resolve
 * @returns The module number (from require()) or null if not found
 */
export function getAudioFile(audioId: string): number | null {
  // Find the audio file in the segmentTypeToAudioMap
  for (const audioList of Object.values(segmentTypeToAudioMap)) {
    for (const audio of audioList) {
      if (audio.id === audioId) {
        // Return the module number directly (not converted to Asset)
        return audio.fileUri;
      }
    }
  }
  return null;
}
