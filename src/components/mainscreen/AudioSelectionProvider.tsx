import {
  closingChantAudios,
  guidanceAudios,
  mettaAudios,
  openingChantAudios,
  techniqueAudios,
} from '@/data/audioData';
import React, { createContext, useRef } from 'react';
import { AudioSelectionDrawer, AudioSelectionDrawerRef } from './AudioSelectionDrawer';

interface AudioSelectionContextType {
  openingChantDrawerRef: React.RefObject<AudioSelectionDrawerRef>;
  openingGuidanceDrawerRef: React.RefObject<AudioSelectionDrawerRef>;
  techniqueReminderDrawerRef: React.RefObject<AudioSelectionDrawerRef>;
  mettaDrawerRef: React.RefObject<AudioSelectionDrawerRef>;
  closingChantDrawerRef: React.RefObject<AudioSelectionDrawerRef>;
}

export const AudioSelectionContext = createContext<AudioSelectionContextType | null>(null);

export function AudioSelectionProvider({ children }: { children: React.ReactNode }) {
  const openingChantDrawerRef = useRef<AudioSelectionDrawerRef>(null);
  const openingGuidanceDrawerRef = useRef<AudioSelectionDrawerRef>(null);
  const techniqueReminderDrawerRef = useRef<AudioSelectionDrawerRef>(null);
  const mettaDrawerRef = useRef<AudioSelectionDrawerRef>(null);
  const closingChantDrawerRef = useRef<AudioSelectionDrawerRef>(null);

  const contextValue: AudioSelectionContextType = {
    openingChantDrawerRef,
    openingGuidanceDrawerRef,
    techniqueReminderDrawerRef,
    mettaDrawerRef,
    closingChantDrawerRef,
  };

  return (
    <AudioSelectionContext.Provider value={contextValue}>
      {children}

      {/* Render all drawers at the top level */}
      <AudioSelectionDrawer
        ref={openingChantDrawerRef}
        segmentType="openingChant"
        title="Select Opening Chant"
        audioOptions={openingChantAudios}
      />
      <AudioSelectionDrawer
        ref={openingGuidanceDrawerRef}
        segmentType="openingGuidance"
        title="Select Opening Guidance"
        audioOptions={guidanceAudios}
      />
      <AudioSelectionDrawer
        ref={techniqueReminderDrawerRef}
        segmentType="techniqueReminder"
        title="Select Technique Reminder"
        audioOptions={techniqueAudios}
      />
      <AudioSelectionDrawer
        ref={mettaDrawerRef}
        segmentType="metta"
        title="Select Mettā Practice"
        audioOptions={mettaAudios}
      />
      <AudioSelectionDrawer
        ref={closingChantDrawerRef}
        segmentType="closingChant"
        title="Select Closing Chant"
        audioOptions={closingChantAudios}
      />
    </AudioSelectionContext.Provider>
  );
}
