import { segmentTypeToAudioMap } from '@/data/audioData';
import { AudioItem } from '@/schemas/mainSchema';

/**
 * Parse duration string in format "mm:ss" to seconds
 */
export function parseDurationToSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
}

/**
 * Get the total duration in seconds for a list of audio items
 */
export function getTotalAudioDuration(audioItems: AudioItem[]): number {
  return audioItems.reduce((total, item) => {
    return total + parseDurationToSeconds(item.duration);
  }, 0);
}

/**
 * Get the actual duration in seconds for a segment based on selected audio IDs
 */
export function getSegmentActualDuration(segmentType: string, selectedAudioIds: string[]): number {
  if (selectedAudioIds.length === 0) {
    return 0;
  }

  const audioOptions = segmentTypeToAudioMap[segmentType as keyof typeof segmentTypeToAudioMap];
  if (!audioOptions) {
    return 0;
  }

  const selectedAudios = selectedAudioIds
    .map((id) => audioOptions.find((audio) => audio.id === id))
    .filter(Boolean) as AudioItem[];

  return getTotalAudioDuration(selectedAudios);
}

/**
 * Get the actual duration for a segment, falling back to the default duration if no audio is selected
 */
export function getSegmentDisplayDuration(
  segmentType: string,
  selectedAudioIds: string[],
  defaultDurationSec: number
): number {
  const actualDuration = getSegmentActualDuration(segmentType, selectedAudioIds);

  // If no audio is selected or actual duration is 0, use the default duration
  if (actualDuration === 0) {
    return defaultDurationSec;
  }

  return actualDuration;
}
