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
    <View className="overflow-hidden rounded-2xl bg-white shadow-md">
      <View className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Text className="text-lg">🔔</Text>
          </View>
          <Text className="text-lg font-bold text-stone-800">Gong Selection</Text>
        </View>
      </View>

      <View className="p-5">
        {error && (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-base">⚠️</Text>
              <Text className="flex-1 text-sm font-medium text-red-700">{error}</Text>
            </View>
          </View>
        )}

        <View className="space-y-3">
          {GONG_OPTIONS.map((option) => {
            const isSelected = preferences.gongPreference === option.id;
            const isPlaying = playingGong === option.id;
            const isLoading = loadingGong === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleGongSelect(option.id)}
                activeOpacity={0.8}
                className={`flex-row items-center justify-between rounded-xl border-2 p-4 ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50'
                    : 'border-stone-200 bg-stone-50'
                }`}>
                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? 'text-amber-800' : 'text-stone-800'
                    }`}>
                    {option.name}
                  </Text>
                  <Text
                    className={`mt-0.5 text-xs ${
                      isSelected ? 'text-amber-600' : 'text-stone-600'
                    }`}>
                    {option.description}
                  </Text>
                </View>

                <View className="ml-3 flex-row items-center gap-2">
                  {option.audioPath && (
                    <TouchableOpacity
                      onPress={() => handlePlayGong(option.id, option.audioPath)}
                      disabled={isPlaying || isLoading}
                      activeOpacity={0.8}
                      className={`rounded-full px-3 py-1.5 ${
                        isPlaying
                          ? 'bg-amber-200'
                          : isLoading
                            ? 'bg-amber-100'
                            : isSelected
                              ? 'bg-amber-100'
                              : 'bg-stone-200'
                      }`}>
                      <View className="flex-row items-center gap-1">
                        {isLoading && (
                          <ActivityIndicator
                            size="small"
                            color={isSelected ? '#D97706' : '#78716c'}
                          />
                        )}
                        <Text
                          className={`text-xs font-bold ${
                            isPlaying
                              ? 'text-amber-800'
                              : isLoading
                                ? 'text-amber-700'
                                : isSelected
                                  ? 'text-amber-700'
                                  : 'text-stone-700'
                          }`}>
                          {isPlaying ? 'Playing' : isLoading ? 'Loading' : 'Play'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <View
                    className={`h-6 w-6 rounded-full border-2 ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300 bg-white'
                    }`}>
                    {isSelected && (
                      <View className="h-full w-full items-center justify-center">
                        <View className="h-2.5 w-2.5 rounded-full bg-white" />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
