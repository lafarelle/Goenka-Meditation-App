import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

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
