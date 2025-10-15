import { AudioPlayer } from '@/audio/AudioPlayer';
import { AudioPreloader } from '@/audio/AudioPreloader';
import { PauseDuration } from '@/schemas/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';
import { GongPreference } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Switch, Text, TouchableOpacity, View } from 'react-native';

interface GongOption {
  id: GongPreference;
  name: string;
  audioPath?: string;
}

interface PauseOption {
  value: PauseDuration;
  label: string;
}

const GONG_OPTIONS: GongOption[] = [
  { id: 'none', name: 'None' },
  { id: 'G1', name: 'Gong 1', audioPath: require('../../../assets/audio/gongs/G1.mp3') },
  { id: 'G2', name: 'Gong 2', audioPath: require('../../../assets/audio/gongs/G2.mp3') },
];

const PAUSE_OPTIONS: PauseOption[] = [
  { value: 0, label: 'None' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
];

export function PreferencesSelector() {
  const { preferences, setTimingPreference, setGongPreference, setPauseDuration } =
    usePreferencesStore();
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayer | null>(null);
  const [playingGong, setPlayingGong] = useState<GongPreference | null>(null);
  const [loadingGong, setLoadingGong] = useState<GongPreference | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTotalTiming = preferences.timingPreference === 'total';

  useEffect(() => {
    const player = new AudioPlayer({
      onPlaybackFinished: () => {
        setPlayingGong(null);
        setLoadingGong(null);
      },
      onError: () => {
        setPlayingGong(null);
        setLoadingGong(null);
      },
    });
    setAudioPlayer(player);

    AudioPreloader.preloadAllAudio().catch(() => {});

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      player.cleanup();
    };
  }, []);

  const handlePlayGong = useCallback(
    async (gongId: GongPreference, audioPath?: string) => {
      if (!audioPlayer || !audioPath) return;

      try {
        setLoadingGong(gongId);
        if (playingGong) await audioPlayer.stop();

        timeoutRef.current = setTimeout(() => {
          setLoadingGong(null);
        }, 5000);

        const preloadedSource = AudioPreloader.getPreloadedSound(gongId);
        const audioSource = preloadedSource || audioPath;
        await audioPlayer.loadAudio(gongId, audioSource);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setPlayingGong(gongId);
        setLoadingGong(null);
        await audioPlayer.play();
      } catch (error) {
        setPlayingGong(null);
        setLoadingGong(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    },
    [audioPlayer, playingGong]
  );

  return (
    <View className="rounded-lg border-4 border-stone-800 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <View className="border-b-4 border-stone-800 bg-amber-400 px-5 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
            <Ionicons name="options" size={20} color="#292524" />
          </View>
          <Text className="text-xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
            Preferences
          </Text>
        </View>
      </View>

      <View className="p-5">
        {/* Timing Preference */}
        <View className="mb-4">
          <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
            Timing Mode
          </Text>
          <TouchableOpacity
            onPress={() => setTimingPreference(isTotalTiming ? 'silent' : 'total')}
            activeOpacity={0.8}
            className="border-3 flex-row items-center justify-between rounded border-amber-500 bg-amber-100 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
            <Text className="flex-1 text-sm font-black uppercase text-amber-900">
              {isTotalTiming ? 'Total Session' : 'Silent Only'}
            </Text>
            <View className="rounded border-2 border-stone-800 bg-amber-300 p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Switch
                value={isTotalTiming}
                onValueChange={() => setTimingPreference(isTotalTiming ? 'silent' : 'total')}
                trackColor={{ false: '#78716c', true: '#F59E0B' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#78716c"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Gong Selection */}
        <View className="mb-4">
          <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
            Gong Sound
          </Text>
          <View className="flex-row gap-2">
            {GONG_OPTIONS.map((option) => {
              const isSelected = preferences.gongPreference === option.id;
              const isPlaying = playingGong === option.id;
              const isLoading = loadingGong === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setGongPreference(option.id)}
                  activeOpacity={0.8}
                  className={`flex-1 rounded border-2 px-3 py-2.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
                      : 'border-stone-800 bg-stone-100'
                  }`}>
                  <View className="items-center">
                    <Text
                      className={`text-sm font-black uppercase ${
                        isSelected ? 'text-amber-900' : 'text-stone-800'
                      }`}>
                      {option.name}
                    </Text>
                    {option.audioPath && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handlePlayGong(option.id, option.audioPath);
                        }}
                        disabled={isPlaying || isLoading}
                        className="mt-1">
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#F59E0B" />
                        ) : (
                          <View
                            className={`rounded-full border-2 ${
                              isSelected ? 'border-amber-600' : 'border-stone-700'
                            }`}>
                            <Ionicons
                              name={isPlaying ? 'pause-circle' : 'play-circle'}
                              size={20}
                              color={isSelected ? '#D97706' : '#44403c'}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pause Duration */}
        <View>
          <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
            Pause Between Segments
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PAUSE_OPTIONS.map((option) => {
              const isSelected = preferences.pauseDuration === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setPauseDuration(option.value)}
                  activeOpacity={0.8}
                  className={`rounded border-2 px-4 py-2.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
                      : 'border-stone-800 bg-stone-100'
                  }`}>
                  <Text
                    className={`text-sm font-black uppercase ${
                      isSelected ? 'text-amber-900' : 'text-stone-800'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
