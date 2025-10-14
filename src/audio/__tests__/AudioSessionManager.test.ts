/**
 * Tests for AudioSessionManager
 *
 * These tests verify the critical transition logic and state management
 */

import { AudioSessionManager } from '../AudioSessionManager';

// Mock all dependencies
jest.mock('../AudioPlayer');
jest.mock('../MeditationTimer');
jest.mock('../utils/SegmentPlayer');
jest.mock('../utils/SegmentTransitionManager');
jest.mock('../AudioPreloader', () => ({
  AudioPreloader: {
    preloadAllAudio: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock stores
jest.mock('@/store/sessionStore', () => ({
  useSessionStore: {
    getState: jest.fn(() => ({
      currentSession: null,
    })),
  },
}));

jest.mock('@/store/preferencesStore', () => ({
  usePreferencesStore: {
    getState: jest.fn(() => ({
      gongPreference: 'both',
      pauseDuration: 3,
      timingPreference: 'total',
    })),
  },
}));

describe('AudioSessionManager', () => {
  let manager: AudioSessionManager;
  let mockCallbacks: {
    onStateChange: jest.Mock;
    onSessionComplete: jest.Mock;
    onTimerComplete: jest.Mock;
    onError: jest.Mock;
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock callbacks
    mockCallbacks = {
      onStateChange: jest.fn(),
      onSessionComplete: jest.fn(),
      onTimerComplete: jest.fn(),
      onError: jest.fn(),
    };

    // Create manager instance
    manager = new AudioSessionManager();
    manager.setCallbacks(mockCallbacks);
  });

  afterEach(async () => {
    // Cleanup
    await manager.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const state = manager.getCurrentState();

      expect(state.isPlaying).toBe(false);
      expect(state.currentSegment).toBeNull();
      expect(state.progress).toBe(0);
      expect(state.remainingTime).toBe(0);
    });

    it('should have cleanup method', () => {
      expect(typeof manager.cleanup).toBe('function');
    });
  });

  describe('State Management', () => {
    it('should return current state', () => {
      const state = manager.getCurrentState();

      expect(state).toHaveProperty('isPlaying');
      expect(state).toHaveProperty('currentSegment');
      expect(state).toHaveProperty('progress');
      expect(state).toHaveProperty('duration');
      expect(state).toHaveProperty('remainingTime');
    });

    it('should update state via updateState method', () => {
      // Access private method for testing
      const updateState = (manager as any).updateState.bind(manager);

      updateState({
        isPlaying: true,
        currentSegment: 'beforeSilent',
      });

      expect(mockCallbacks.onStateChange).toHaveBeenCalled();
      const state = manager.getCurrentState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentSegment).toBe('beforeSilent');
    });
  });

  describe('Callbacks', () => {
    it('should set callbacks correctly', () => {
      const newCallbacks = {
        onStateChange: jest.fn(),
        onSessionComplete: jest.fn(),
        onTimerComplete: jest.fn(),
        onError: jest.fn(),
      };

      manager.setCallbacks(newCallbacks);

      // Trigger state change
      const updateState = (manager as any).updateState.bind(manager);
      updateState({ isPlaying: true });

      expect(newCallbacks.onStateChange).toHaveBeenCalled();
    });
  });

  describe('Transition Guards', () => {
    it('should not transition to silent if already in silent segment', async () => {
      // Set current segment to silent
      const updateState = (manager as any).updateState.bind(manager);
      updateState({ currentSegment: 'silent' });

      // Mock segment player
      const mockSegmentPlayer = (manager as any).segmentPlayer;
      mockSegmentPlayer.getIsTransitioning = jest.fn().mockReturnValue(false);
      mockSegmentPlayer.startSilentMeditation = jest.fn();

      // Try to transition to silent
      await (manager as any).transitionToSilent();

      // Should not call startSilentMeditation
      expect(mockSegmentPlayer.startSilentMeditation).not.toHaveBeenCalled();
    });

    it('should not transition if already transitioning', async () => {
      // Set current segment to beforeSilent
      const updateState = (manager as any).updateState.bind(manager);
      updateState({ currentSegment: 'beforeSilent' });

      // Mock segment player as transitioning
      const mockSegmentPlayer = (manager as any).segmentPlayer;
      mockSegmentPlayer.getIsTransitioning = jest.fn().mockReturnValue(true);
      mockSegmentPlayer.startSilentMeditation = jest.fn();

      // Try to transition to silent
      await (manager as any).transitionToSilent();

      // Should not call startSilentMeditation
      expect(mockSegmentPlayer.startSilentMeditation).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in handleAudioFinished', async () => {
      // Set up state
      const updateState = (manager as any).updateState.bind(manager);
      updateState({ currentSegment: 'beforeSilent' });

      // Mock segment player to throw error
      const mockSegmentPlayer = (manager as any).segmentPlayer;
      mockSegmentPlayer.playNextBeforeSilentAudio = jest
        .fn()
        .mockRejectedValue(new Error('Audio load failed'));

      // Set up session
      (manager as any).session = {
        segments: {
          beforeSilent: { audioIds: ['audio1'], duration: 60 },
        },
      };

      // Call handleAudioFinished
      await (manager as any).handleAudioFinished();

      // Should call error callback
      expect(mockCallbacks.onError).toHaveBeenCalled();
      const errorCall = mockCallbacks.onError.mock.calls[0][0];
      expect(errorCall).toContain('Error in handleAudioFinished');
    });

    it('should handle errors in transitionToSilent', async () => {
      // Set up state
      const updateState = (manager as any).updateState.bind(manager);
      updateState({ currentSegment: 'beforeSilent' });

      // Mock segment player to throw error
      const mockSegmentPlayer = (manager as any).segmentPlayer;
      mockSegmentPlayer.getIsTransitioning = jest.fn().mockReturnValue(false);
      mockSegmentPlayer.startSilentMeditation = jest
        .fn()
        .mockRejectedValue(new Error('Silent meditation failed'));

      // Set up session
      (manager as any).session = {
        segments: {
          silent: { duration: 120 },
        },
      };

      // Call transitionToSilent
      await (manager as any).transitionToSilent();

      // Should call error callback
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clear all references on cleanup', async () => {
      // Set up some state
      (manager as any).session = { id: 'test' };

      // Call cleanup
      await manager.cleanup();

      // Check references are cleared
      expect((manager as any).session).toBeNull();
      // Note: isTransitioning is a getter that checks segmentPlayer state
      // so we don't test it directly here
    });

    it('should call cleanup on all sub-components', async () => {
      const mockSegmentPlayer = (manager as any).segmentPlayer;
      mockSegmentPlayer.cleanup = jest.fn();

      const mockAudioPlayer = (manager as any).audioPlayer;
      mockAudioPlayer.cleanup = jest.fn();

      await manager.cleanup();

      expect(mockSegmentPlayer.cleanup).toHaveBeenCalled();
      expect(mockAudioPlayer.cleanup).toHaveBeenCalled();
    });
  });

  describe('Session State', () => {
    it('should track current segment correctly', () => {
      const updateState = (manager as any).updateState.bind(manager);

      updateState({ currentSegment: 'gong' });
      expect(manager.getCurrentState().currentSegment).toBe('gong');

      updateState({ currentSegment: 'beforeSilent' });
      expect(manager.getCurrentState().currentSegment).toBe('beforeSilent');

      updateState({ currentSegment: 'silent' });
      expect(manager.getCurrentState().currentSegment).toBe('silent');

      updateState({ currentSegment: 'afterSilent' });
      expect(manager.getCurrentState().currentSegment).toBe('afterSilent');
    });

    it('should track playing state correctly', () => {
      const updateState = (manager as any).updateState.bind(manager);

      updateState({ isPlaying: true });
      expect(manager.getCurrentState().isPlaying).toBe(true);

      updateState({ isPlaying: false });
      expect(manager.getCurrentState().isPlaying).toBe(false);
    });

    it('should track progress correctly', () => {
      const updateState = (manager as any).updateState.bind(manager);

      updateState({ progress: 0.5 });
      expect(manager.getCurrentState().progress).toBe(0.5);

      updateState({ progress: 1.0 });
      expect(manager.getCurrentState().progress).toBe(1.0);
    });
  });
});
