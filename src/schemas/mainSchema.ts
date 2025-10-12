import { SessionSegmentType } from "./session";
import { AudioItem } from "./audio";

// ---- Configuration Types ----
export const defaultConfiguration = {
  openingChant: "None",
  openingGuidance: "None",
  techniqueReminder: "None",
  mettaPractice: 0, // Duration in minutes
  closingChant: "None",
};

export type ConfigurationType = typeof defaultConfiguration;

// ---- Segment Map Type ----
export type SegmentTypeToAudioMap = Record<SessionSegmentType, AudioItem[]>;
