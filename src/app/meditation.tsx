import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { useAudioSession } from '@/audio/useAudioSession';
import { heavyHaptic, mediumHaptic } from '@/utils/haptics';
import { getSessionTotalDuration } from '@/utils/meditationTimer';
import { formatTime } from '@/utils/timing';

export default function Meditation() {
  const {
    sessionState,
    error,
    isInitialized,
    isTimerComplete,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearError,
  } = useAudioSession();

  const hasShownCongrats = useRef(false);

  // Initialize total duration (for reference, but we use sessionState.remainingTime)
  useEffect(() => {
    getSessionTotalDuration();
    // Total duration is calculated by the session manager
  }, []);

  // Auto-start session when component mounts and audio is initialized
  useEffect(() => {
    if (isInitialized) {
      startSession();
    }
  }, [startSession, isInitialized]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Audio Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // Show congratulations when timer completes (meditation time is over)
  useEffect(() => {
    if (isTimerComplete && !hasShownCongrats.current) {
      hasShownCongrats.current = true;
      Alert.alert(
        '🎉 Congratulations!',
        'Well done on completing your meditation session. May you be happy, peaceful, and liberated.',
        [{ text: 'OK' }]
      );
    }
  }, [isTimerComplete]);

  // Handle session completion - navigate back to main screen
  useEffect(() => {
    if (
      sessionState.currentSegment === null &&
      sessionState.progress === 1 &&
      !sessionState.isPlaying
    ) {
      // Session completed, navigate back to main screen
      router.back();
    }
  }, [sessionState.currentSegment, sessionState.progress, sessionState.isPlaying]);

  // Calculate remaining time from session state
  const remainingTime = sessionState.remainingTime || 0;

  const handleBackPress = () => {
    mediumHaptic();
    Alert.alert('End Meditation', 'Are you sure you want to end this meditation session?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'End Session',
        style: 'destructive',
        onPress: () => {
          heavyHaptic();
          stopSession();
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex flex-1 bg-black">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Back arrow in top left */}
      <Pressable
        onPress={handleBackPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className="absolute left-4 top-12 z-10 rounded-full bg-white/10 p-3">
        <Ionicons name="arrow-back" size={24} color="white" />
      </Pressable>

      {/* Main timer display */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-8xl font-light text-white">{formatTime(remainingTime)}</Text>
      </View>

      {/* Single play/pause button - positioned at bottom center */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <Pressable
          onPress={() => {
            mediumHaptic();
            if (sessionState.isPlaying) {
              pauseSession();
            } else {
              resumeSession();
            }
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="rounded-full bg-white/20 p-6">
          <Ionicons name={sessionState.isPlaying ? 'pause' : 'play'} size={32} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
