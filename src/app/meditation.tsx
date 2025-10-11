import { Stack, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Animated, Text, TouchableOpacity, View } from 'react-native';

import { useAudioSession } from '@/audio/useAudioSession';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/Button';

export default function Meditation() {
  const {
    sessionState,
    isLoading,
    error,
    isInitialized,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearError,
  } = useAudioSession();

  // Animated value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Auto-start session when component mounts and audio is initialized
  useEffect(() => {
    if (isInitialized) {
      startSession();
    }
  }, [startSession, isInitialized]);

  // Animate progress bar when progress changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: sessionState.progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [sessionState.progress, progressAnim]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Audio Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentSegmentLabel = (): string => {
    switch (sessionState.currentSegment) {
      case 'beforeSilent':
        return 'Preparing for meditation...';
      case 'silent':
        return 'Silent meditation';
      case 'afterSilent':
        return 'Closing meditation...';
      default:
        return 'Meditation session';
    }
  };

  const getProgressPercentage = (): number => {
    return Math.round(sessionState.progress * 100);
  };

  return (
    <View className="flex flex-1 bg-stone-900">
      <Stack.Screen
        options={{
          title: 'Meditation',
          headerStyle: { backgroundColor: '#1c1917' },
          headerTintColor: '#f5f5f4',
        }}
      />
      <Container>
        <View className="flex-1 items-center justify-center px-6">
          {/* Main meditation content */}
          <View className="mb-12 items-center">
            <Text className="mb-4 text-center text-2xl font-medium text-white">
              {!isInitialized ? 'Preparing your meditation...' : getCurrentSegmentLabel()}
            </Text>

            {/* Loading indicator during initialization */}
            {!isInitialized && (
              <View className="mb-6 items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="mt-2 text-sm text-stone-300">Loading audio files...</Text>
              </View>
            )}

            {sessionState.currentSegment === 'silent' && (
              <View className="items-center">
                <Text className="mb-4 text-6xl font-light text-white">
                  {formatTime(sessionState.remainingTime)}
                </Text>
                <View className="h-1 w-64 overflow-hidden rounded-full bg-stone-700">
                  <Animated.View
                    className="h-full rounded-full bg-white"
                    style={{
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }}
                  />
                </View>
              </View>
            )}

            {sessionState.currentSegment && sessionState.currentSegment !== 'silent' && (
              <View className="items-center">
                <View className="mb-4 h-1 w-64 overflow-hidden rounded-full bg-stone-700">
                  <Animated.View
                    className="h-full rounded-full bg-white"
                    style={{
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }}
                  />
                </View>
                <Text className="text-lg text-stone-300">{getProgressPercentage()}% complete</Text>
              </View>
            )}
          </View>

          {/* Control buttons */}
          <View className="w-full max-w-sm space-y-4">
            {/* Start button - show when session hasn't started yet */}
            {!sessionState.currentSegment && isInitialized && (
              <Button
                title={isLoading ? 'Starting...' : 'Start Session'}
                onPress={startSession}
                disabled={isLoading}
              />
            )}

            {/* Resume button - show when session is paused */}
            {!sessionState.isPlaying && sessionState.currentSegment && (
              <Button title="Resume" onPress={resumeSession} disabled={isLoading} />
            )}

            {/* Pause button - show when session is playing */}
            {sessionState.isPlaying && <Button title="Pause" onPress={pauseSession} />}

            {/* End session button */}
            {sessionState.currentSegment && (
              <TouchableOpacity onPress={stopSession} className="rounded-lg bg-stone-700 px-6 py-3">
                <Text className="text-center font-medium text-white">End Session</Text>
              </TouchableOpacity>
            )}

            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-lg bg-stone-600 px-6 py-3">
              <Text className="text-center font-medium text-white">Back to Setup</Text>
            </TouchableOpacity>
          </View>

          {/* Session info */}
          <View className="mt-8">
            <Text className="text-center text-sm text-stone-400">
              {!isInitialized
                ? 'Initializing audio system...'
                : sessionState.currentSegment
                  ? 'Session in progress'
                  : 'Session ready'}
            </Text>
          </View>
        </View>
      </Container>
    </View>
  );
}
