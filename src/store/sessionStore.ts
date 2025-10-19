import {
  createInitialSegments,
  SessionSegment,
  SessionSegmentType,
  TechniqueType,
} from '@/schemas/session';
import { AudioItem } from '@/schemas/audio';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';
import { calculateSessionTiming } from '@/utils/preferences/timingUtils';
import { pickRandomAudio } from '@/utils/audioUtils';
import { create } from 'zustand';
import { usePreferencesStore } from './preferencesStore';

interface SessionState {
  totalDurationMinutes: number; // in minutes
  segments: Record<SessionSegmentType, SessionSegment>;
  setSegmentEnabled: (type: SessionSegmentType, isEnabled: boolean) => void;
  setSegmentDuration: (type: SessionSegmentType, durationSec: number) => void;
  setSegmentFileUri: (type: SessionSegmentType, fileUri: string | undefined) => void;
  setSegmentAudioIds: (type: SessionSegmentType, audioIds: string[]) => void;
  toggleAudioInSegment: (type: SessionSegmentType, audioId: string) => void;
  setSegmentTechniqueType: (type: SessionSegmentType, techniqueType: TechniqueType) => void;
  setSegmentAudioToRandom: (type: SessionSegmentType, audioOptions: AudioItem[]) => void;
  setTotalDurationMinutes: (minutes: number) => void;
  resetSession: () => void;
  getActiveSegmentsDurationSec: () => number;
  getSilentDurationSec: () => number;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  totalDurationMinutes: 20,
  segments: createInitialSegments(), // Initialize with default segments

  setSegmentEnabled: (type, isEnabled) =>
    set((state) => ({
      segments: {
        ...state.segments,
        [type]: { ...state.segments[type], isEnabled },
      },
    })),

  setSegmentDuration: (type, durationSec) =>
    set((state) => ({
      segments: {
        ...state.segments,
        [type]: { ...state.segments[type], durationSec },
      },
    })),

  setSegmentFileUri: (type, fileUri) =>
    set((state) => {
      if (type === 'openingChant' || type === 'closingChant') {
        return {
          segments: {
            ...state.segments,
            [type]: { ...state.segments[type], fileUri },
          },
        };
      }
      return state; // Do nothing if not a chant segment
    }),

  setSegmentAudioIds: (type, audioIds) =>
    set((state) => ({
      segments: {
        ...state.segments,
        [type]: { ...state.segments[type], selectedAudioIds: audioIds },
      },
    })),

  toggleAudioInSegment: (type, audioId) =>
    set((state) => {
      const currentIds = state.segments[type].selectedAudioIds;
      const index = currentIds.indexOf(audioId);

      let newIds: string[];
      if (index > -1) {
        // Remove if already selected
        newIds = currentIds.filter((id) => id !== audioId);
      } else {
        // Add to end of array
        newIds = [...currentIds, audioId];
      }

      return {
        segments: {
          ...state.segments,
          [type]: { ...state.segments[type], selectedAudioIds: newIds },
        },
      };
    }),

  setSegmentTechniqueType: (type, techniqueType) =>
    set((state) => {
      if (type === 'techniqueReminder') {
        return {
          segments: {
            ...state.segments,
            [type]: { ...state.segments[type], techniqueType },
          },
        };
      }
      return state; // Do nothing if not a technique segment
    }),

  setSegmentAudioToRandom: (type, audioOptions) =>
    set((state) => {
      const randomAudio = pickRandomAudio(audioOptions);
      if (randomAudio) {
        return {
          segments: {
            ...state.segments,
            [type]: { ...state.segments[type], selectedAudioIds: [randomAudio.id] },
          },
        };
      }
      return state; // Do nothing if no random audio was selected
    }),

  setTotalDurationMinutes: (minutes) => set({ totalDurationMinutes: minutes }),

  resetSession: () =>
    set({
      totalDurationMinutes: 20,
      segments: createInitialSegments(), // Reset to fresh initial segments
    }),

  // Helper to get total duration of all *enabled* segments (excluding silent)
  getActiveSegmentsDurationSec: () => {
    const { segments } = get();
    return Object.values(segments).reduce((acc, segment) => {
      if (segment.type !== 'silent' && segment.isEnabled) {
        return (
          acc +
          getSegmentDisplayDuration(segment.type, segment.selectedAudioIds, segment.durationSec)
        );
      }
      return acc;
    }, 0);
  },

  // Calculate silent duration based on total and other active segments
  getSilentDurationSec: () => {
    const { totalDurationMinutes, segments } = get();
    const preferences = usePreferencesStore.getState().preferences;

    const { silentDurationSec } = calculateSessionTiming(
      totalDurationMinutes,
      segments,
      preferences.timingPreference,
      preferences.pauseDuration,
      preferences.gongEnabled,
      preferences.gongPreference
    );

    return silentDurationSec;
  },
}));
