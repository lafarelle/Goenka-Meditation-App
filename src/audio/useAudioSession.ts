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
  const sessionManagerRef = useRef<AudioSessionManager | null>(null);

  // Initialize session manager
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        sessionManagerRef.current = new AudioSessionManager();

        sessionManagerRef.current.setCallbacks({
          onStateChange: (state) => {
            if (isMounted) {
              setSessionState(state);
            }
          },
          onSessionComplete: () => {
            if (isMounted) {
              setSessionState((prev) => ({
                ...prev,
                isPlaying: false,
                currentSegment: null,
                progress: 1,
              }));
            }
          },
          onError: (error) => {
            if (isMounted) {
              setError(error);
              setIsLoading(false);
            }
          },
        });

        // Initialize the audio system (preloads audio files)
        await sessionManagerRef.current.initialize();

        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to initialize audio session: ${err}`);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      sessionManagerRef.current?.cleanup();
    };
  }, []);

  const startSession = useCallback(async () => {
    if (!sessionManagerRef.current || !isInitialized) {
      setError('Audio system not initialized yet');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await sessionManagerRef.current.startSession();
    } catch (err) {
      setError(`Failed to start session: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const pauseSession = useCallback(async () => {
    if (!sessionManagerRef.current) return;

    try {
      await sessionManagerRef.current.pause();
    } catch (err) {
      setError(`Failed to pause session: ${err}`);
    }
  }, []);

  const resumeSession = useCallback(async () => {
    if (!sessionManagerRef.current) return;

    try {
      await sessionManagerRef.current.resume();
    } catch (err) {
      setError(`Failed to resume session: ${err}`);
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (!sessionManagerRef.current) return;

    try {
      await sessionManagerRef.current.stop();
    } catch (err) {
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
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearError,
  };
}
