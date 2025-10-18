import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioSessionManager } from './AudioSessionManager';
import { AudioSessionState } from './types';

export function useAudioSession() {
  const [sessionState, setSessionState] = useState<AudioSessionState>({
    isPlaying: false,
    currentSegment: null,
    progress: 0,
    duration: 0,
    remainingTime: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const sessionManagerRef = useRef<AudioSessionManager | null>(null);

  // Initialize session manager
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        console.log('[useAudioSession] Initializing audio session...');
        sessionManagerRef.current = new AudioSessionManager();

        sessionManagerRef.current.setCallbacks({
          onStateChange: (state) => {
            if (isMounted) {
              console.log('[useAudioSession] State changed:', {
                segment: state.currentSegment,
                isPlaying: state.isPlaying,
                progress: state.progress,
              });
              setSessionState(state);
            }
          },
          onSessionComplete: () => {
            console.log('[useAudioSession] Session complete');
            if (isMounted) {
              setSessionState((prev) => ({
                ...prev,
                isPlaying: false,
                currentSegment: null,
                progress: 1,
              }));
            }
          },
          onTimerComplete: () => {
            console.log('[useAudioSession] Timer complete');
            if (isMounted) {
              setIsTimerComplete(true);
            }
          },
          onError: (error) => {
            console.error('[useAudioSession] Error occurred:', error);
            if (isMounted) {
              setError(error);
              setIsLoading(false);
            }
          },
        });

        // Initialize the audio system (preloads audio files)
        console.log('[useAudioSession] Starting audio system initialization...');
        await sessionManagerRef.current.initialize();

        if (isMounted) {
          console.log('[useAudioSession] Audio session initialized successfully');
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('[useAudioSession] Initialization failed:', err);
        if (isMounted) {
          setError(`Failed to initialize audio session: ${err}`);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      console.log('[useAudioSession] Cleaning up audio session');
      sessionManagerRef.current?.cleanup();
    };
  }, []);

  const startSession = useCallback(async () => {
    console.log('[useAudioSession] Starting session...');
    if (!sessionManagerRef.current || !isInitialized) {
      const errorMsg = 'Audio system not initialized yet';
      console.error('[useAudioSession]', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await sessionManagerRef.current.startSession();
      console.log('[useAudioSession] Session started successfully');
    } catch (err) {
      console.error('[useAudioSession] Failed to start session:', err);
      setError(`Failed to start session: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const pauseSession = useCallback(async () => {
    console.log('[useAudioSession] Pausing session...');
    if (!sessionManagerRef.current) return;

    try {
      await sessionManagerRef.current.pause();
      console.log('[useAudioSession] Session paused');
    } catch (err) {
      console.error('[useAudioSession] Failed to pause session:', err);
      setError(`Failed to pause session: ${err}`);
    }
  }, []);

  const resumeSession = useCallback(async () => {
    console.log('[useAudioSession] Resuming session...');
    if (!sessionManagerRef.current) return;

    try {
      await sessionManagerRef.current.resume();
      console.log('[useAudioSession] Session resumed');
    } catch (err) {
      console.error('[useAudioSession] Failed to resume session:', err);
      setError(`Failed to resume session: ${err}`);
    }
  }, []);

  const stopSession = useCallback(async () => {
    console.log('[useAudioSession] Stopping session...');
    if (!sessionManagerRef.current) return;

    try {
      await sessionManagerRef.current.stop();
      console.log('[useAudioSession] Session stopped');
    } catch (err) {
      console.error('[useAudioSession] Failed to stop session:', err);
      setError(`Failed to stop session: ${err}`);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sessionState,
    isLoading,
    error,
    isInitialized,
    isTimerComplete,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearError,
  };
}
