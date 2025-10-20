import { segmentTypeToAudioMap } from '@/data/audioData';
import { PauseDuration } from '@/schemas/preferences';
import { SessionSegment, SessionSegmentType } from '@/schemas/session';
import { parseDurationToSeconds } from './audioDurationUtils';
import { pickRandomAudio } from './audioUtils';

/**
 * Represents a single item in the session timeline
 */
export type TimelineItemType = SessionSegmentType | 'pause' | 'gong';

export interface TimelineItem {
  type: TimelineItemType;
  label: string;
  durationSec: number;
  // Additional metadata for audio segments
  audioId?: string;
  audioName?: string;
  isRandom?: boolean; // Indicates this audio was randomly selected for the session
}

/**
 * Builds the complete session timeline including all audio files, pauses, gong, and silent meditation
 *
 * The timeline is built in this order:
 * 1. Opening Gong (if enabled)
 * 2. Before-silent segments: Opening Chant, Opening Guidance, Technique Reminder (with pauses between individual audio files)
 * 3. Silent Meditation
 * 4. After-silent segments: Metta, Closing Chant (with pauses between individual audio files)
 * 5. Closing Gong (if enabled)
 *
 * @param segments - The session segments configuration
 * @param pauseDurationSec - Duration of pauses between audio files
 * @param gongEnabled - Whether gong is enabled
 * @param gongPreference - The gong preference setting
 * @param getSilentDurationSec - Function to get the silent meditation duration
 * @returns Array of timeline items in playback order
 */
export function buildSessionTimeline(
  segments: Record<SessionSegmentType, SessionSegment>,
  pauseDurationSec: PauseDuration,
  gongEnabled: boolean,
  gongPreference: 'none' | 'G1' | 'G2',
  getSilentDurationSec: () => number
): TimelineItem[] {
  const timeline: TimelineItem[] = [];

  // Define before-silent and after-silent segment types
  const beforeSilentTypes: SessionSegmentType[] = [
    'openingChant',
    'openingGuidance',
    'techniqueReminder',
  ];

  const afterSilentTypes: SessionSegmentType[] = [
    'metta',
    'closingChant',
  ];

  // Track if we need to add a pause before the next item
  let needsPauseBeforeNext = false;

  /**
   * Helper function to add audio segments to the timeline
   */
  const addAudioSegments = (segmentTypes: SessionSegmentType[]) => {
    segmentTypes.forEach((segmentType) => {
      const segment = segments[segmentType];
      if (!segment || !segment.isEnabled) return;

      // Get the audio options for this segment type
      let audioOptions = segmentTypeToAudioMap[segmentType];
      if (!audioOptions) return;

      // Handle random selection
      let selectedAudioItems;
      let isRandomSelection = false;

      if (segment.isRandom) {
        // For technique reminders, filter by techniqueType
        if (segmentType === 'techniqueReminder' && segment.techniqueType) {
          const prefix = segment.techniqueType === 'anapana' ? 'a' : 'v';
          audioOptions = audioOptions.filter((audio) => audio.id.startsWith(prefix));
        }

        // Pick a random audio for the preview
        const randomAudio = pickRandomAudio(audioOptions);
        selectedAudioItems = randomAudio ? [randomAudio] : [];
        isRandomSelection = true;
      } else {
        // Get the selected audio items in order
        selectedAudioItems = segment.selectedAudioIds
          .map((id) => audioOptions.find((audio) => audio.id === id))
          .filter((audio): audio is NonNullable<typeof audio> => audio !== undefined);
      }

      // Add each audio file as a separate timeline item
      selectedAudioItems.forEach((audio) => {
        // Add pause before this audio if needed (not before the very first item)
        if (needsPauseBeforeNext && pauseDurationSec > 0) {
          timeline.push({
            type: 'pause',
            label: 'Pause',
            durationSec: pauseDurationSec,
          });
        }

        // Add the audio item
        const durationSec = parseDurationToSeconds(audio.duration);
        timeline.push({
          type: segmentType,
          label: segment.label || segmentType,
          durationSec,
          audioId: audio.id,
          audioName: audio.name,
          isRandom: isRandomSelection,
        });

        // Mark that we need a pause before the next item
        needsPauseBeforeNext = true;
      });
    });
  };

  // 1. Add opening gong if enabled
  if (gongEnabled && gongPreference !== 'none') {
    const gongSegment = segments.gong;
    const gongDuration = gongSegment ? gongSegment.durationSec : 5;
    timeline.push({
      type: 'gong',
      label: 'Opening Gong',
      durationSec: gongDuration,
    });
    needsPauseBeforeNext = true;
  }

  // 2. Add before-silent segments (Opening Chant, Opening Guidance, Technique Reminder)
  addAudioSegments(beforeSilentTypes);

  // 3. Add silent meditation if there's any duration
  const silentDurationSec = getSilentDurationSec();
  if (silentDurationSec > 0) {
    timeline.push({
      type: 'silent',
      label: 'Silent Meditation',
      durationSec: silentDurationSec,
    });
    needsPauseBeforeNext = false; // No pause after silent meditation
  }

  // 4. Add after-silent segments (Metta, Closing Chant)
  addAudioSegments(afterSilentTypes);

  // 5. Add closing gong if enabled
  if (gongEnabled && gongPreference !== 'none') {
    // Add pause before closing gong if there were previous items
    if (needsPauseBeforeNext && pauseDurationSec > 0) {
      timeline.push({
        type: 'pause',
        label: 'Pause',
        durationSec: pauseDurationSec,
      });
    }

    const gongSegment = segments.gong;
    const gongDuration = gongSegment ? gongSegment.durationSec : 5;
    timeline.push({
      type: 'gong',
      label: 'Closing Gong',
      durationSec: gongDuration,
    });
  }

  return timeline;
}

/**
 * Calculate the total duration of all items in the timeline
 */
export function calculateTimelineTotalDuration(timeline: TimelineItem[]): number {
  return timeline.reduce((acc, item) => acc + item.durationSec, 0);
}

/**
 * Calculate the total pause duration from the timeline
 * Counts all pause items in the timeline
 */
export function calculateTimelinePauseDuration(timeline: TimelineItem[]): number {
  return timeline
    .filter((item) => item.type === 'pause')
    .reduce((acc, item) => acc + item.durationSec, 0);
}

/**
 * Calculate the total gong duration from the timeline
 * Counts all gong items in the timeline
 */
export function calculateTimelineGongDuration(timeline: TimelineItem[]): number {
  return timeline
    .filter((item) => item.type === 'gong')
    .reduce((acc, item) => acc + item.durationSec, 0);
}

/**
 * Calculate the total audio duration from the timeline
 * Counts all non-pause, non-gong, non-silent items
 */
export function calculateTimelineAudioDuration(timeline: TimelineItem[]): number {
  return timeline
    .filter((item) => item.type !== 'pause' && item.type !== 'gong' && item.type !== 'silent')
    .reduce((acc, item) => acc + item.durationSec, 0);
}

/**
 * Get color for a timeline item type
 */
export function getTimelineItemColor(type: TimelineItemType): string {
  if (type === 'openingChant' || type === 'closingChant') return '#DC2626'; // warm red
  if (type === 'openingGuidance') return '#EA580C'; // vibrant orange
  if (type === 'techniqueReminder') return '#F59E0B'; // amber/yellow-orange
  if (type === 'metta') return '#EAB308'; // golden yellow
  if (type === 'silent') return '#F5E6D3'; // warm cream
  if (type === 'gong') return '#16A34A'; // green for gong
  if (type === 'pause') return '#94A3B8'; // slate gray for pause
  return '#EA580C'; // default orange
}
