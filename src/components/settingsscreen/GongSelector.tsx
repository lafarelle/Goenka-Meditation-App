import { AudioPlayer } from '@/audio/AudioPlayer';
import { AudioPreloader } from '@/audio/AudioPreloader';
import { usePreferencesStore } from '@/store/preferencesStore';
import { GongPreference } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface GongOption {
  id: GongPreference;
  name: string;
  audioPath?: string;
}

const GONG_OPTIONS: GongOption[] = [
  { id: 'none', name: 'None' },
  { id: 'G1', name: 'Gong 1', audioPath: require('../../../assets/audio/gongs/G1.mp3') },
  { id: 'G2', name: 'Gong 2', audioPath: require('../../../assets/audio/gongs/G2.mp3') },
];

export function GongSelector() {
  const { preferences, setGongPreference } = usePreferencesStore();
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
    <View className="mb-4">
      <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
        Gong Sound
      </Text>

      {/* Selection Buttons */}
      <View className="mb-3 flex-row gap-2">
        <GongSelectionButton
          id="none"
          name="None"
          isSelected={preferences.gongPreference === 'none'}
          onPress={() => setGongPreference('none')}
        />
        <GongSelectionButton
          id="G1"
          name="Gong 1"
          isSelected={preferences.gongPreference === 'G1'}
          onPress={() => setGongPreference('G1')}
        />
        <GongSelectionButton
          id="G2"
          name="Gong 2"
          isSelected={preferences.gongPreference === 'G2'}
          onPress={() => setGongPreference('G2')}
        />
      </View>

      {/* Preview Buttons - Completely Separate */}
      <View className="flex-row gap-2">
        <View className="flex-1" />
        <GongPreviewButton
          id="G1"
          audioPath={require('../../../assets/audio/gongs/G1.mp3')}
          isSelected={preferences.gongPreference === 'G1'}
          isPlaying={playingGong === 'G1'}
          isLoading={loadingGong === 'G1'}
          onPress={handlePlayGong}
        />
        <GongPreviewButton
          id="G2"
          audioPath={require('../../../assets/audio/gongs/G2.mp3')}
          isSelected={preferences.gongPreference === 'G2'}
          isPlaying={playingGong === 'G2'}
          isLoading={loadingGong === 'G2'}
          onPress={handlePlayGong}
        />
      </View>
    </View>
  );
}

interface GongSelectionButtonProps {
  id: GongPreference;
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

function GongSelectionButton({ name, isSelected, onPress }: GongSelectionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className={`flex-1 rounded border-2 px-3 py-3 ${
        isSelected
          ? 'border-amber-500 bg-amber-100 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
          : 'border-stone-800 bg-stone-100'
      }`}>
      <Text
        className={`text-center text-sm font-black uppercase ${
          isSelected ? 'text-amber-900' : 'text-stone-800'
        }`}>
        {name}
      </Text>
    </Pressable>
  );
}

interface GongPreviewButtonProps {
  id: GongPreference;
  audioPath: any;
  isSelected: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onPress: (gongId: GongPreference, audioPath?: string) => void;
}

function GongPreviewButton({
  id,
  audioPath,
  isSelected,
  isPlaying,
  isLoading,
  onPress,
}: GongPreviewButtonProps) {
  return (
    <Pressable
      onPress={() => onPress(id, audioPath)}
      disabled={isPlaying || isLoading}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      className={`flex-1 items-center justify-center rounded border-2 py-2 ${
        isSelected ? 'border-amber-600 bg-amber-50' : 'border-stone-700 bg-stone-50'
      }`}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#F59E0B" />
      ) : (
        <View className="flex-row items-center gap-1">
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color={isSelected ? '#D97706' : '#44403c'}
          />
          <Text
            className={`text-xs font-black uppercase ${
              isSelected ? 'text-amber-700' : 'text-stone-700'
            }`}>
            {isPlaying ? 'Playing' : 'Preview'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

