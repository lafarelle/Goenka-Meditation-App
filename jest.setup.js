/* eslint-env jest */
// Jest setup file for mocking native modules

// Mock expo-audio
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    replace: jest.fn().mockResolvedValue(undefined),
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 1,
    isLooping: false,
    playbackRate: 1,
    shouldCorrectPitch: true,
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  })),
  AudioPlayer: jest.fn(),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
  })),
  useAudioPlayerStatus: jest.fn(() => ({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'test-app',
    },
  },
}));

// Silence console warnings during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // Uncomment to suppress console.warn during tests
  // warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};
