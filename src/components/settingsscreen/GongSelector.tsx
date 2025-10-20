import { AudioPlayer } from '@/audio/AudioPlayer';
import { AudioPreloader } from '@/audio/AudioPreloader';
import { usePreferencesStore } from '@/store/preferencesStore';
import { GongPreference } from '@/store/types';
import { lightHaptic, selectionHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';

interface GongOption {
  id: GongPreference;
  name: string;
  audioPath: any;
}

const GONG_OPTIONS: GongOption[] = [
  { id: 'G1', name: 'Gong 1', audioPath: require('../../../assets/audio/gongs/G1.mp3') },
  { id: 'G2', name: 'Gong 2', audioPath: require('../../../assets/audio/gongs/G2.mp3') },
];

export function GongSelector() {
  const { preferences, setGongEnabled, setGongPreference } = usePreferencesStore();
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayer | null>(null);
  const [playingGong, setPlayingGong] = useState<GongPreference | null>(null);
  const [loadingGong, setLoadingGong] = useState<GongPreference | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    async (gongId: GongPreference) => {
      if (!audioPlayer) return;

      try {
        // If this gong is already playing, stop it
        if (playingGong === gongId) {
          await audioPlayer.stop();
          setPlayingGong(null);
          setLoadingGong(null);
          return;
        }

        setLoadingGong(gongId);

        // Stop any currently playing audio
        if (playingGong) {
          await audioPlayer.stop();
        }

        // Set timeout for loading state
        timeoutRef.current = setTimeout(() => {
          setLoadingGong(null);
        }, 5000);

        // Use preloaded audio source, fallback to local path
        const preloadedSource = AudioPreloader.getPreloadedSound(gongId);
        const gongOption = GONG_OPTIONS.find((g) => g.id === gongId);
        const audioSource = preloadedSource || gongOption?.audioPath;
        await audioPlayer.loadAudio(gongId, audioSource);

        // Clear loading timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setPlayingGong(gongId);
        setLoadingGong(null);
        await audioPlayer.play();
      } catch {
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
    <View>
      {/* Section Title */}
      <Text className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
        Gong Sound
      </Text>

      {/* Toggle Switch */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base text-slate-700">
          {preferences.gongEnabled ? 'Enabled' : 'Disabled'}
        </Text>
        <Switch
          value={preferences.gongEnabled}
          onValueChange={(value) => {
            selectionHaptic();
            setGongEnabled(value);
          }}
          trackColor={{ false: '#E5E5E5', true: '#E8B84B' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E5E5E5"
        />
      </View>

      {/* Gong Selection - Only shown when enabled */}
      {preferences.gongEnabled && (
        <View className="gap-2">
          {GONG_OPTIONS.map((gong) => {
            const isSelected = preferences.gongPreference === gong.id;

            return (
              <View key={gong.id} className="flex-row gap-2">
                {/* Selection Button */}
                <Pressable
                  onPress={() => {
                    selectionHaptic();
                    setGongPreference(gong.id);
                  }}
                  className={`flex-1 rounded-lg px-4 py-3 ${isSelected ? 'bg-amber-400' : 'bg-gray-50'}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={gong.name}>
                  <Text
                    className={`text-center text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-gray-500'}`}>
                    {gong.name}
                  </Text>
                </Pressable>

                {/* Preview Button */}
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    handlePlayGong(gong.id);
                  }}
                  disabled={loadingGong === gong.id}
                  className="items-center justify-center rounded-lg bg-gray-50 px-4 py-3"
                  accessibilityRole="button"
                  accessibilityLabel={`${playingGong === gong.id ? 'Stop' : 'Preview'} ${gong.name}`}>
                  {loadingGong === gong.id ? (
                    <ActivityIndicator size="small" color="#E8B84B" />
                  ) : (
                    <Ionicons
                      name={playingGong === gong.id ? 'stop' : 'play'}
                      size={18}
                      color="#666666"
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
