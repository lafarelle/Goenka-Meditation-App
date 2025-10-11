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
    id: 'oc1',
    name: 'Traditional Opening Chant',
    duration: '2:21', // Real duration: 141 seconds
    description: "Goenka's traditional opening chant",
    fileUri: audioFiles.openingChants.OC1,
  },
];

// Opening Guidance Audios
export const guidanceAudios: AudioItem[] = [
  {
    id: 'ew1',
    name: 'Entering Words 1',
    duration: '0:09', // Real duration: 9 seconds
    description: 'Basic meditation instructions',
    fileUri: audioFiles.openingGuidance.EW1,
  },
  {
    id: 'ew2',
    name: 'Entering Words 2',
    duration: '0:17', // Real duration: 17 seconds
    description: 'Advanced meditation guidance',
    fileUri: audioFiles.openingGuidance.EW2,
  },
];

// Technique Reminder Audios - Anapana and Vipassana
export const techniqueAudios: AudioItem[] = [
  // Anapana reminders
  {
    id: 'a1',
    name: 'Anapana 1',
    duration: '1:32', // Real duration: 92 seconds
    description: 'Basic breath awareness technique',
    fileUri: audioFiles.anapana.A1,
  },
  {
    id: 'a2',
    name: 'Anapana 2',
    duration: '1:39', // Real duration: 99 seconds
    description: 'Advanced breath awareness technique',
    fileUri: audioFiles.anapana.A2,
  },
  // Vipassana reminders
  {
    id: 'v1',
    name: 'Vipassana 1',
    duration: '0:20', // Real duration: 20 seconds
    description: 'Basic body scanning technique',
    fileUri: audioFiles.vipassana.V1,
  },
  {
    id: 'v2',
    name: 'Vipassana 2',
    duration: '0:19', // Real duration: 19 seconds
    description: 'Intermediate body scanning',
    fileUri: audioFiles.vipassana.V2,
  },
  {
    id: 'v3',
    name: 'Vipassana 3',
    duration: '0:08', // Real duration: 8 seconds
    description: 'Advanced body scanning',
    fileUri: audioFiles.vipassana.V3,
  },
  {
    id: 'v4',
    name: 'Vipassana 4',
    duration: '0:18', // Real duration: 18 seconds
    description: 'Full body awareness practice',
    fileUri: audioFiles.vipassana.V4,
  },
  {
    id: 'v5',
    name: 'Vipassana 5',
    duration: '1:18', // Real duration: 78 seconds
    description: 'Deep body scanning technique',
    fileUri: audioFiles.vipassana.V5,
  },
  {
    id: 'v6',
    name: 'Vipassana 6',
    duration: '0:17', // Real duration: 17 seconds
    description: 'Master level body scanning',
    fileUri: audioFiles.vipassana.V6,
  },
];

// Metta Practice Audios
export const mettaAudios: AudioItem[] = [
  {
    id: 'm1',
    name: 'Metta Practice',
    duration: '1:33', // Real duration: 93 seconds
    description: 'Loving-kindness meditation practice',
    fileUri: audioFiles.metta.M1,
  },
];

// Closing Chant Audios
export const closingChantAudios: AudioItem[] = [
  {
    id: 'cc1',
    name: 'Closing Chant 1',
    duration: '3:05', // Real duration: 185 seconds
    description: 'Traditional closing chant with metta',
    fileUri: audioFiles.closingChant.CC1,
  },
  {
    id: 'cc2',
    name: 'Closing Chant 2',
    duration: '4:14', // Real duration: 254 seconds
    description: 'Extended closing chant',
    fileUri: audioFiles.closingChant.CC2,
  },
];

// Gong Audios
export const gongAudios: AudioItem[] = [
  {
    id: 'g1',
    name: 'Gong 1',
    duration: '0:05', // Real duration: 5 seconds
    description: 'Traditional meditation gong',
    fileUri: audioFiles.gongs.G1,
  },
  {
    id: 'g2',
    name: 'Gong 2',
    duration: '0:05', // Real duration: 5 seconds
    description: 'Alternative meditation gong',
    fileUri: audioFiles.gongs.G2,
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

// Helper function to get gong audio by preference
export function getGongAudioByPreference(preference: 'none' | 'G1' | 'G2'): AudioItem | null {
  if (preference === 'none') return null;

  const gongId = preference.toLowerCase(); // 'G1' -> 'g1', 'G2' -> 'g2'
  return gongAudios.find((gong) => gong.id === gongId) || null;
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
  gong: gongAudios,
  silent: [],
};
