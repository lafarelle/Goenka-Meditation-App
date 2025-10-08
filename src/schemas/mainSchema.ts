import { SessionSegmentType } from "@/store/sessionStore";

// ---- Audio Interfaces ----
export interface AudioItem {
  id: string;
  name: string;
  duration: string; // Format: "mm:ss"
  description: string;
  fileUri: any | undefined; // React Native audio resource or undefined
  isGoenkaVoice?: boolean;
}

export interface ChantOption {
  name: string;
  duration?: number; // duration in minutes
  isGoenkaVoice?: boolean;
}

export interface GuidanceOption {
  name: string;
  duration?: number; // duration in minutes
  isGoenkaVoice?: boolean;
}

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
