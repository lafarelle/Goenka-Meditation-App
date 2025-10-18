import {
  closingChantAudios,
  guidanceAudios,
  mettaAudios,
  openingChantAudios,
  techniqueAudios,
} from '@/data/audioData';
import React, { createContext, useRef } from 'react';
import { AudioSelectionDrawer, AudioSelectionDrawerRef } from './AudioSelectionDrawer';
import { TechniqueReminderDrawer, TechniqueReminderDrawerRef } from './TechniqueReminderDrawer';

interface AudioSelectionContextType {
  openingChantDrawerRef: React.RefObject<AudioSelectionDrawerRef | null>;
  openingGuidanceDrawerRef: React.RefObject<AudioSelectionDrawerRef | null>;
  techniqueReminderDrawerRef: React.RefObject<TechniqueReminderDrawerRef | null>;
  mettaDrawerRef: React.RefObject<AudioSelectionDrawerRef | null>;
  closingChantDrawerRef: React.RefObject<AudioSelectionDrawerRef | null>;
}

export const AudioSelectionContext = createContext<AudioSelectionContextType | null>(null);

export function AudioSelectionProvider({ children }: { children: React.ReactNode }) {
  const openingChantDrawerRef = useRef<AudioSelectionDrawerRef>(null);
  const openingGuidanceDrawerRef = useRef<AudioSelectionDrawerRef>(null);
  const techniqueReminderDrawerRef = useRef<TechniqueReminderDrawerRef>(null);
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
      <TechniqueReminderDrawer
        ref={techniqueReminderDrawerRef}
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
