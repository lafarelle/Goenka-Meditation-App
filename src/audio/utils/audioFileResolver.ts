import { segmentTypeToAudioMap } from '@/data/audioData';

/**
 * Resolves an audio ID to its file URI
 * @param audioId The ID of the audio file to resolve
 * @returns The file URI or null if not found
 */
export function getAudioFile(audioId: string): any | null {
  // Find the audio file in the segmentTypeToAudioMap
  for (const audioList of Object.values(segmentTypeToAudioMap)) {
    for (const audio of audioList) {
      if (audio.id === audioId) {
        return audio.fileUri;
      }
    }
  }
  return null;
}
