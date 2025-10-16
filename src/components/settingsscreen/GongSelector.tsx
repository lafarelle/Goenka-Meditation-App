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
    <View>
      <Text className="mb-3 text-sm font-medium tracking-wide" style={{ color: '#333333' }}>
        Beginning Gong
      </Text>

      {/* Toggle Switch */}
      <Pressable
        onPress={() => {
          selectionHaptic();
          setGongEnabled(!preferences.gongEnabled);
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: '#F5F5EC',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
        className="mb-4 flex-row items-center justify-between rounded-xl px-6 py-4">
        <Text className="flex-1 text-base font-normal" style={{ color: '#333333' }}>
          {preferences.gongEnabled ? 'Gong Enabled' : 'No Gong'}
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
      </Pressable>

      {/* Gong Selection - Only shown when enabled */}
      {preferences.gongEnabled && (
        <>
          {/* Show/Hide Selector Button */}
          <Pressable
            onPress={() => {
              lightHaptic();
              setShowGongSelector(!showGongSelector);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#F5F5EC',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              },
            ]}
            className="mt-2 flex-row items-center justify-between rounded-xl px-6 py-4">
            <Text className="text-base font-normal" style={{ color: '#333333' }}>
              {GONG_OPTIONS.find((g) => g.id === preferences.gongPreference)?.name || 'Select Gong'}
            </Text>
            <Ionicons
              name={showGongSelector ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666666"
            />
          </Pressable>

          {/* Gong Selection Grid */}
          {showGongSelector && (
            <View className="mt-3 gap-3">
              {GONG_OPTIONS.map((gong) => {
                const isSelected = preferences.gongPreference === gong.id;

                return (
                  <View key={gong.id} className="flex-row gap-3">
                    {/* Selection Button */}
                    <Pressable
                      onPress={() => {
                        selectionHaptic();
                        setGongPreference(gong.id);
                      }}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor: isSelected ? '#F5C563' : '#F5F5EC',
                          borderWidth: 2,
                          borderColor: isSelected ? '#D4A444' : 'transparent',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.2 : 0.08,
                          shadowRadius: 8,
                          elevation: isSelected ? 4 : 2,
                        },
                      ]}
                      className="flex-1 rounded-xl px-6 py-4"
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={gong.name}>
                      <Text
                        className="text-center text-base font-semibold"
                        style={{ color: isSelected ? '#1A1A1A' : '#666666' }}>
                        {gong.name}
                      </Text>
                    </Pressable>

                    {/* Preview Button */}
                    <Pressable
                      onPress={() => {
                        lightHaptic();
                        handlePlayGong(gong.id, gong.audioPath);
                      }}
                      disabled={playingGong === gong.id || loadingGong === gong.id}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor: '#F5F5EC',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                          elevation: 2,
                        },
                      ]}
                      className="items-center justify-center rounded-xl px-6 py-4"
                      accessibilityRole="button"
                      accessibilityLabel={`Preview ${gong.name}`}>
                      {loadingGong === gong.id ? (
                        <ActivityIndicator size="small" color="#E8B84B" />
                      ) : (
                        <Ionicons
                          name={playingGong === gong.id ? 'pause' : 'play'}
                          size={20}
                          color="#666666"
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
