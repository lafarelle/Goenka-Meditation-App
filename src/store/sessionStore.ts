import { create } from "zustand";

export type SessionSegmentType =
  | "openingChant"
  | "openingGuidance"
  | "techniqueReminder"
  | "metta"
  | "closingChant"
  | "silent";

export type TechniqueType = "anapana" | "vipassana";

export interface SessionSegment {
  type: SessionSegmentType;
  durationSec: number;
  label?: string;
  fileUri?: string; // for chants
  // Add an enabled flag, true by default for most, false for silent initially
  isEnabled: boolean;
  // For technique reminder segment
  techniqueType?: TechniqueType;
  selectedAudioId?: string; // Track selected audio ID for all segments
  // Optional: add color if it's tied to the segment type and not just UI
  // color?: string;
}

// Define initial segments configuration - ALL DISABLED by default for silent-only sessions
export const initialSegments: Record<SessionSegmentType, SessionSegment> = {
  openingChant: {
    type: "openingChant",
    durationSec: 120,
    label: "Opening Chant",
    fileUri: undefined,
    isEnabled: false, // Changed to false
    selectedAudioId: undefined,
  },
  openingGuidance: {
    type: "openingGuidance",
    durationSec: 60,
    label: "Opening Guidance",
    isEnabled: false, // Changed to false
    selectedAudioId: undefined,
  },
  techniqueReminder: {
    type: "techniqueReminder",
    durationSec: 60,
    label: "Technique Reminder",
    isEnabled: false, // Changed to false
    techniqueType: "anapana", // Default technique
    selectedAudioId: undefined,
  },
  metta: {
    type: "metta",
    durationSec: 300,
    label: "Mettā Practice",
    isEnabled: false, // Changed to false
    selectedAudioId: undefined,
  },
  closingChant: {
    type: "closingChant",
    durationSec: 120,
    label: "Closing Chant",
    fileUri: undefined,
    isEnabled: false, // Changed to false
    selectedAudioId: undefined,
  },
  silent: {
    type: "silent",
    durationSec: 0,
    label: "Silent Meditation",
    isEnabled: true, // This remains enabled for silent-only sessions
  }, // durationSec will be calculated
};

interface SessionState {
  totalDurationMinutes: number; // in minutes
  segments: Record<SessionSegmentType, SessionSegment>;
  setSegmentEnabled: (type: SessionSegmentType, isEnabled: boolean) => void;
  setSegmentDuration: (type: SessionSegmentType, durationSec: number) => void;
  setSegmentFileUri: (
    type: SessionSegmentType,
    fileUri: string | undefined
  ) => void;
  setSegmentAudioId: (
    type: SessionSegmentType,
    audioId: string | undefined
  ) => void;
  setSegmentTechniqueType: (
    type: SessionSegmentType,
    techniqueType: TechniqueType
  ) => void;
  setTotalDurationMinutes: (minutes: number) => void;
  resetSession: () => void;
  getActiveSegmentsDurationSec: () => number;
  getSilentDurationSec: () => number;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  totalDurationMinutes: 20,
  segments: { ...initialSegments }, // Initialize with a copy of default segments

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
      if (type === "openingChant" || type === "closingChant") {
        return {
          segments: {
            ...state.segments,
            [type]: { ...state.segments[type], fileUri },
          },
        };
      }
      return state; // Do nothing if not a chant segment
    }),

  setSegmentAudioId: (type, audioId) =>
    set((state) => ({
      segments: {
        ...state.segments,
        [type]: { ...state.segments[type], selectedAudioId: audioId },
      },
    })),

  setSegmentTechniqueType: (type, techniqueType) =>
    set((state) => {
      if (type === "techniqueReminder") {
        return {
          segments: {
            ...state.segments,
            [type]: { ...state.segments[type], techniqueType },
          },
        };
      }
      return state; // Do nothing if not a technique segment
    }),

  setTotalDurationMinutes: (minutes) => set({ totalDurationMinutes: minutes }),

  resetSession: () =>
    set({
      totalDurationMinutes: 20,
      segments: { ...initialSegments }, // Reset to a fresh copy of initial segments
    }),

  // Helper to get total duration of all *enabled* segments (excluding silent)
  getActiveSegmentsDurationSec: () => {
    const { segments } = get();
    return Object.values(segments).reduce((acc, segment) => {
      if (segment.type !== "silent" && segment.isEnabled) {
        return acc + segment.durationSec;
      }
      return acc;
    }, 0);
  },

  // Calculate silent duration based on total and other active segments
  getSilentDurationSec: () => {
    const { totalDurationMinutes } = get();
    const activeSegmentsTotalSec = get().getActiveSegmentsDurationSec();
    const totalDurationSec = totalDurationMinutes * 60;
    const silentDuration = totalDurationSec - activeSegmentsTotalSec;
    // Ensure silent duration is not negative
    return Math.max(0, silentDuration);
  },
}));
