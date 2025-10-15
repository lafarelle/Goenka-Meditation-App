import { AudioPlayer } from '@/audio/AudioPlayer';
import { AudioPreloader } from '@/audio/AudioPreloader';
import { usePreferencesStore } from '@/store/preferencesStore';
import { GongPreference } from '@/store/types';
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
  const [showGongSelector, setShowGongSelector] = useState(false);
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
    <View className="mb-4">
      <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
        Beginning Gong
      </Text>

      {/* Toggle Switch */}
      <Pressable
        onPress={() => setGongEnabled(!preferences.gongEnabled)}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className="border-3 flex-row items-center justify-between rounded border-amber-500 bg-amber-100 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
        <Text className="flex-1 text-sm font-black uppercase text-amber-900">
          {preferences.gongEnabled ? 'Gong Enabled' : 'No Gong'}
        </Text>
        <View className="rounded border-2 border-stone-800 bg-amber-300 p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Switch
            value={preferences.gongEnabled}
            onValueChange={setGongEnabled}
            trackColor={{ false: '#78716c', true: '#F59E0B' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#78716c"
          />
        </View>
      </Pressable>

      {/* Gong Selection - Only shown when enabled */}
      {preferences.gongEnabled && (
        <>
          {/* Show/Hide Selector Button */}
          <Pressable
            onPress={() => setShowGongSelector(!showGongSelector)}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="mt-3 flex-row items-center justify-between rounded border-2 border-stone-800 bg-stone-100 px-4 py-2">
            <Text className="text-sm font-black uppercase text-stone-800">
              {GONG_OPTIONS.find((g) => g.id === preferences.gongPreference)?.name || 'Select Gong'}
            </Text>
            <Ionicons
              name={showGongSelector ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#44403c"
            />
          </Pressable>

          {/* Gong Selection Grid */}
          {showGongSelector && (
            <View className="mt-3 gap-2">
              {GONG_OPTIONS.map((gong) => {
                const isSelected = preferences.gongPreference === gong.id;

                return (
                  <View key={gong.id} className="flex-row gap-2">
                    {/* Selection Button */}
                    <Pressable
                      onPress={() => setGongPreference(gong.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                      className={`border-3 flex-1 rounded px-3 py-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
                          : 'border-stone-800 bg-stone-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={gong.name}>
                      <Text
                        className={`text-center text-sm font-black uppercase ${
                          isSelected ? 'text-amber-900' : 'text-stone-800'
                        }`}>
                        {gong.name}
                      </Text>
                    </Pressable>

                    {/* Preview Button */}
                    <Pressable
                      onPress={() => handlePlayGong(gong.id, gong.audioPath)}
                      disabled={playingGong === gong.id || loadingGong === gong.id}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      className={`items-center justify-center rounded border-2 px-4 py-3 ${
                        isSelected ? 'border-amber-600 bg-amber-50' : 'border-stone-700 bg-stone-50'
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={`Preview ${gong.name}`}>
                      {loadingGong === gong.id ? (
                        <ActivityIndicator size="small" color="#F59E0B" />
                      ) : (
                        <Ionicons
                          name={playingGong === gong.id ? 'pause' : 'play'}
                          size={20}
                          color={isSelected ? '#D97706' : '#44403c'}
                        />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}
