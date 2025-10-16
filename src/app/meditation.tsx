import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { useAudioSession } from '@/audio/useAudioSession';
import { MeditationPulse } from '@/components/meditation';
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

      {/* Back button - top left with elegant styling */}
      <Pressable
        onPress={handleBackPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
        className="absolute left-6 top-14 z-10 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
        <Ionicons name="close" size={28} color="rgba(255, 255, 255, 0.9)" />
      </Pressable>

      {/* Main content - centered pulse animation and timer */}
      <View className="flex-1 items-center justify-center">
        {/* Beautiful meditation pulse animation */}
        <MeditationPulse isPlaying={sessionState.isPlaying} />

        {/* Timer display - smaller and positioned below pulse */}
        <View className="mt-24">
          <Text className="text-5xl font-extralight tracking-widest text-white/90">
            {formatTime(remainingTime)}
          </Text>
        </View>
      </View>

      {/* Play/Pause button - elegant bottom center */}
      <View className="absolute bottom-16 left-0 right-0 items-center">
        <Pressable
          onPress={() => {
            mediumHaptic();
            if (sessionState.isPlaying) {
              pauseSession();
            } else {
              resumeSession();
            }
          }}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          className="h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10">
          <Ionicons
            name={sessionState.isPlaying ? 'pause' : 'play'}
            size={36}
            color="rgba(255, 255, 255, 0.95)"
            style={{ marginLeft: sessionState.isPlaying ? 0 : 3 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
