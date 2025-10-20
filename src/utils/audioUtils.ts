import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { AudioItem } from '@/schemas/audio';

dayjs.extend(duration);

export function formatDurationMinutes(minutes?: number): string {
  if (!minutes) return '0:00';
  return dayjs.duration(minutes, 'minutes').format('m:ss');
}

export function formatDurationSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseDurationToSeconds(duration: string): number {
  const [mins, secs] = duration.split(':').map(Number);
  return mins * 60 + secs;
}

/**
 * Formats time in MM:SS format
 * @param seconds - Number of seconds to format
 * @returns Formatted string in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Picks a random audio item from the provided array
 * @param audioOptions - Array of audio items to choose from
 * @returns A randomly selected audio item, or undefined if array is empty
 */
export function pickRandomAudio(audioOptions: AudioItem[]): AudioItem | undefined {
  if (!audioOptions || audioOptions.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * audioOptions.length);
  return audioOptions[randomIndex];
}
