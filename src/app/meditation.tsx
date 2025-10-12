import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { useAudioSession } from '@/audio/useAudioSession';
import { formatTime, getSessionTotalDuration } from '@/utils/meditationTimer';

export default function Meditation() {
  const {
    sessionState,
    error,
    isInitialized,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearError,
  } = useAudioSession();

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

  // Calculate remaining time from session state
  const remainingTime = sessionState.remainingTime || 0;

  const handleBackPress = () => {
    Alert.alert('End Meditation', 'Are you sure you want to end this meditation session?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'End Session',
        style: 'destructive',
        onPress: () => {
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
          title: 'Meditation',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#ffffff',
        }}
      />

      {/* Back arrow in top left */}
      <TouchableOpacity
        onPress={handleBackPress}
        className="absolute left-4 top-12 z-10 rounded-full bg-white/10 p-3">
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Main timer display */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-8xl font-light text-white">{formatTime(remainingTime)}</Text>
      </View>

      {/* Single play/pause button - positioned at bottom center */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={sessionState.isPlaying ? pauseSession : resumeSession}
          className="rounded-full bg-white/20 p-6">
          <Ionicons name={sessionState.isPlaying ? 'pause' : 'play'} size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
