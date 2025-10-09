import { AudioItem, SegmentTypeToAudioMap } from '@/schemas/mainSchema';

// Audio file references using require() for React Native
const audioFiles = {
  openingChants: {
    OC1: require('../../assets/audio/opening-chants/OC1.mp3'),
  },
  openingGuidance: {
    EW1: require('../../assets/audio/opening-guidance/EW1.mp3'),
    EW2: require('../../assets/audio/opening-guidance/EW2.mp3'),
  },
  anapana: {
    A1: require('../../assets/audio/technique-reminders/anapana/A1.mp3'),
    A2: require('../../assets/audio/technique-reminders/anapana/A2.mp3'),
  },
  vipassana: {
    V1: require('../../assets/audio/technique-reminders/vipassana/V1.mp3'),
    V2: require('../../assets/audio/technique-reminders/vipassana/V2.mp3'),
    V3: require('../../assets/audio/technique-reminders/vipassana/V3.mp3'),
    V4: require('../../assets/audio/technique-reminders/vipassana/V4.mp3'),
    V5: require('../../assets/audio/technique-reminders/vipassana/V5.mp3'),
    V6: require('../../assets/audio/technique-reminders/vipassana/V6.mp3'),
  },
  metta: {
    M1: require('../../assets/audio/metta/M1.mp3'),
  },
  closingChant: {
    CC1: require('../../assets/audio/closing-chants/CC1.mp3'),
    CC2: require('../../assets/audio/closing-chants/CC2.mp3'),
  },
  gongs: {
    G1: require('../../assets/audio/gongs/G1.mp3'),
    G2: require('../../assets/audio/gongs/G2.mp3'),
  },
};

// Opening Chant Audios
export const openingChantAudios: AudioItem[] = [
  {
    id: 'none',
    name: 'None',
    duration: '0:00',
    description: 'No opening chant',
    fileUri: undefined,
  },
  {
    id: 'oc1',
    name: 'Traditional Opening Chant',
    duration: '2:00', // Estimated duration, adjust as needed
    description: "Goenka's traditional opening chant",
    fileUri: audioFiles.openingChants.OC1,
    isGoenkaVoice: true,
  },
];

// Opening Guidance Audios
export const guidanceAudios: AudioItem[] = [
  {
    id: 'none',
    name: 'None',
    duration: '0:00',
    description: 'No opening guidance',
    fileUri: undefined,
  },
  {
    id: 'ew1',
    name: 'Guidance - Beginning',
    duration: '1:00', // Estimated duration
    description: 'Initial guidance for meditation',
    fileUri: audioFiles.openingGuidance.EW1,
    isGoenkaVoice: true,
  },
  {
    id: 'ew2',
    name: 'Guidance - Advanced',
    duration: '1:30', // Estimated duration
    description: 'Advanced meditation guidance',
    fileUri: audioFiles.openingGuidance.EW2,
    isGoenkaVoice: true,
  },
];

// Technique Reminder Audios - Anapana and Vipassana
export const techniqueAudios: AudioItem[] = [
  {
    id: 'none',
    name: 'None',
    duration: '0:00',
    description: 'No technique reminder',
    fileUri: undefined,
  },
  // Anapana reminders
  {
    id: 'a1',
    name: 'Anapana Reminder 1',
    duration: '1:00',
    description: 'Mindfulness of breathing - Version 1',
    fileUri: audioFiles.anapana.A1,
    isGoenkaVoice: true,
  },
  {
    id: 'a2',
    name: 'Anapana Reminder 2',
    duration: '1:00',
    description: 'Mindfulness of breathing - Version 2',
    fileUri: audioFiles.anapana.A2,
    isGoenkaVoice: true,
  },
  // Vipassana reminders
  {
    id: 'v1',
    name: 'Vipassana Reminder 1',
    duration: '1:00',
    description: 'Insight meditation - Version 1',
    fileUri: audioFiles.vipassana.V1,
    isGoenkaVoice: true,
  },
  {
    id: 'v2',
    name: 'Vipassana Reminder 2',
    duration: '1:00',
    description: 'Insight meditation - Version 2',
    fileUri: audioFiles.vipassana.V2,
    isGoenkaVoice: true,
  },
  {
    id: 'v3',
    name: 'Vipassana Reminder 3',
    duration: '1:00',
    description: 'Insight meditation - Version 3',
    fileUri: audioFiles.vipassana.V3,
    isGoenkaVoice: true,
  },
  {
    id: 'v4',
    name: 'Vipassana Reminder 4',
    duration: '1:00',
    description: 'Insight meditation - Version 4',
    fileUri: audioFiles.vipassana.V4,
    isGoenkaVoice: true,
  },
  {
    id: 'v5',
    name: 'Vipassana Reminder 5',
    duration: '1:00',
    description: 'Insight meditation - Version 5',
    fileUri: audioFiles.vipassana.V5,
    isGoenkaVoice: true,
  },
  {
    id: 'v6',
    name: 'Vipassana Reminder 6',
    duration: '1:00',
    description: 'Insight meditation - Version 6',
    fileUri: audioFiles.vipassana.V6,
    isGoenkaVoice: true,
  },
];

// Metta Practice Audios
export const mettaAudios: AudioItem[] = [
  {
    id: 'none',
    name: 'None',
    duration: '0:00',
    description: 'No metta practice',
    fileUri: undefined,
  },
  {
    id: 'm1',
    name: 'Traditional Mettā',
    duration: '5:00', // Estimated duration
    description: 'Classic loving-kindness practice',
    fileUri: audioFiles.metta.M1,
    isGoenkaVoice: true,
  },
];

// Closing Chant Audios
export const closingChantAudios: AudioItem[] = [
  {
    id: 'none',
    name: 'None',
    duration: '0:00',
    description: 'No closing chant',
    fileUri: undefined,
  },
  {
    id: 'cc1',
    name: 'Closing Chant - Short',
    duration: '2:30', // Estimated duration
    description: 'Traditional short closing chant',
    fileUri: audioFiles.closingChant.CC1,
    isGoenkaVoice: true,
  },
  {
    id: 'cc2',
    name: 'Closing Chant - Extended',
    duration: '3:30', // Estimated duration
    description: 'Extended closing chant',
    fileUri: audioFiles.closingChant.CC2,
    isGoenkaVoice: true,
  },
];

// Helper function to get random audio file for technique types
export function getRandomTechniqueAudio(techniqueType: 'anapana' | 'vipassana') {
  if (techniqueType === 'anapana') {
    const anapanaFiles = Object.values(audioFiles.anapana);
    const randomIndex = Math.floor(Math.random() * anapanaFiles.length);
    return anapanaFiles[randomIndex];
  } else {
    const vipassanaFiles = Object.values(audioFiles.vipassana);
    const randomIndex = Math.floor(Math.random() * vipassanaFiles.length);
    return vipassanaFiles[randomIndex];
  }
}

// Helper function to get random gong sound for session start
export function getRandomGongAudio() {
  const gongFiles = Object.values(audioFiles.gongs);
  const randomIndex = Math.floor(Math.random() * gongFiles.length);
  return gongFiles[randomIndex];
}

// Segment Map
export const segmentTypeToAudioMap: SegmentTypeToAudioMap = {
  openingChant: openingChantAudios,
  openingGuidance: guidanceAudios,
  techniqueReminder: techniqueAudios,
  metta: mettaAudios,
  closingChant: closingChantAudios,
  silent: [],
};
