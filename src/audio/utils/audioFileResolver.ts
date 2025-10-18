import { Asset } from 'expo-asset';
import { segmentTypeToAudioMap } from '@/data/audioData';

/**
 * Resolves an audio ID to its Asset
 * @param audioId The ID of the audio file to resolve
 * @returns The Asset or null if not found
 */
export function getAudioFile(audioId: string): Asset | null {
  // Find the audio file in the segmentTypeToAudioMap
  for (const audioList of Object.values(segmentTypeToAudioMap)) {
    for (const audio of audioList) {
      if (audio.id === audioId) {
        // Convert require() module to Asset
        return Asset.fromModule(audio.fileUri);
      }
    }
  }
  return null;
}
