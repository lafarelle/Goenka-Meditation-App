import { AudioPlayer } from '@/audio/AudioPlayer';
import { AudioPreloader } from '@/audio/AudioPreloader';
import { usePreferencesStore } from '@/store/preferencesStore';
import { GongPreference } from '@/store/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface GongOption {
  id: GongPreference;
  name: string;
  description: string;
  audioPath?: string;
}

const GONG_OPTIONS: GongOption[] = [
  {
    id: 'none',
    name: 'No Gong',
    description: 'Start sessions without a gong',
  },
  {
    id: 'G1',
    name: 'Gong 1',
    description: 'Traditional meditation gong',
    audioPath: require('../../../assets/audio/gongs/G1.mp3'),
  },
  {
    id: 'G2',
    name: 'Gong 2',
    description: 'Alternative meditation gong',
    audioPath: require('../../../assets/audio/gongs/G2.mp3'),
  },
];

export function GongSelector() {
  const { preferences, setGongPreference } = usePreferencesStore();
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayer | null>(null);
  const [playingGong, setPlayingGong] = useState<GongPreference | null>(null);
  const [loadingGong, setLoadingGong] = useState<GongPreference | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const player = new AudioPlayer({
      onPlaybackFinished: () => {
        setPlayingGong(null);
        setLoadingGong(null);
      },
      onError: (error) => {
        console.error('Audio playback error:', error);
        setPlayingGong(null);
        setLoadingGong(null);
        setError(error);
      },
    });
    setAudioPlayer(player);

    // Preload gong audio files for better performance
    const preloadGongs = async () => {
      try {
        // Preload all audio files including gongs
        await AudioPreloader.preloadAllAudio();
      } catch (error) {
        console.warn('Failed to preload gong audio:', error);
      }
    };

    preloadGongs();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      player.cleanup();
    };
  }, []);

  const handleGongSelect = useCallback(
    (gongId: GongPreference) => {
      setGongPreference(gongId);
      setError(null);
    },
    [setGongPreference]
  );

  const handlePlayGong = useCallback(
    async (gongId: GongPreference, audioPath?: string) => {
      if (!audioPlayer || !audioPath) return;

      try {
        setError(null);
        setLoadingGong(gongId);

        // Stop any currently playing gong
        if (playingGong) {
          await audioPlayer.stop();
        }

        // Set a timeout for loading
        timeoutRef.current = setTimeout(() => {
          setLoadingGong(null);
          setError('Audio loading timed out. Please try again.');
        }, 5000);

        // Try to use preloaded audio first, then fallback to provided path
        const preloadedSource = AudioPreloader.getPreloadedSound(gongId);
        const audioSource = preloadedSource || audioPath;

        await audioPlayer.loadAudio(gongId, audioSource);

        // Clear timeout if loading succeeds
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setPlayingGong(gongId);
        setLoadingGong(null);
        await audioPlayer.play();
      } catch (error) {
        console.error('Failed to play gong:', error);
        setPlayingGong(null);
        setLoadingGong(null);
        setError('Failed to load audio. Please try again.');

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    },
    [audioPlayer, playingGong]
  );

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-4 text-lg font-medium text-gray-800">Gong</Text>

      {error && (
        <View className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2">
          <Text className="text-xs text-red-700">{error}</Text>
        </View>
      )}

      <View className="space-y-2">
        {GONG_OPTIONS.map((option) => {
          const isSelected = preferences.gongPreference === option.id;
          const isPlaying = playingGong === option.id;
          const isLoading = loadingGong === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleGongSelect(option.id)}
              className={`flex-row items-center justify-between rounded-lg border p-3 ${
                isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
              }`}>
              <Text
                className={`text-base font-medium ${
                  isSelected ? 'text-yellow-900' : 'text-gray-800'
                }`}>
                {option.name}
              </Text>

              <View className="flex-row items-center space-x-2">
                {option.audioPath && (
                  <TouchableOpacity
                    onPress={() => handlePlayGong(option.id, option.audioPath)}
                    disabled={isPlaying || isLoading}
                    className={`rounded-full px-2 py-1 ${
                      isPlaying
                        ? 'bg-yellow-200'
                        : isLoading
                          ? 'bg-yellow-100'
                          : isSelected
                            ? 'bg-yellow-100'
                            : 'bg-gray-100'
                    }`}>
                    <View className="flex-row items-center space-x-1">
                      {isLoading && (
                        <ActivityIndicator
                          size="small"
                          color={isSelected ? '#a16207' : '#6b7280'}
                        />
                      )}
                      <Text
                        className={`text-xs font-medium ${
                          isPlaying
                            ? 'text-yellow-800'
                            : isLoading
                              ? 'text-yellow-700'
                              : isSelected
                                ? 'text-yellow-700'
                                : 'text-gray-600'
                        }`}>
                        {isPlaying ? 'Playing' : isLoading ? 'Loading' : 'Play'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View
                  className={`h-4 w-4 rounded-full border-2 ${
                    isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                  }`}>
                  {isSelected && (
                    <View className="h-full w-full items-center justify-center">
                      <View className="h-1.5 w-1.5 rounded-full bg-white" />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
