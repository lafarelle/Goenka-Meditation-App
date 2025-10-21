import { AudioPreloader } from '@/audio/AudioPreloader';
import { AudioSessionConfig } from '@/audio/AudioSessionConfig';
import { AudioItem } from '@/schemas/audio';
import { SessionSegmentType } from '@/schemas/session';
import { useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, Text, View } from 'react-native';

interface AudioSelectionDrawerProps {
  segmentType: SessionSegmentType;
  title: string;
  description: string;
  audioOptions: AudioItem[];
}

export interface AudioSelectionDrawerRef {
  present: () => void;
  dismiss: () => void;
}

interface AudioOptionItemProps {
  option: AudioItem;
  selectionOrder: number | null; // null if not selected, otherwise 1, 2, 3...
  onToggle: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

const AudioOptionItem = React.memo<AudioOptionItemProps>(
  ({ option, selectionOrder, onToggle, isPlaying, onPlayToggle }) => {
    const isSelected = selectionOrder !== null;

    return (
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: isSelected ? '#FFF9E6' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.1 : 0.06,
            shadowRadius: 8,
            elevation: isSelected ? 3 : 2,
          },
        ]}
        className="mx-4 mb-3 overflow-hidden rounded-2xl px-4 py-3"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={option.name}>
        <View className="flex-row items-center justify-between">
          {/* Play button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Stop audio' : 'Play audio'}>
            <Ionicons
              name={isPlaying ? 'stop-circle' : 'play-circle-outline'}
              size={28}
              color={isPlaying ? '#E8B84B' : '#999999'}
            />
          </Pressable>

          <View className="flex-1">
            <Text
              className="text-base font-medium"
              style={{ color: isSelected ? '#333333' : '#666666' }}>
              {option.name}
            </Text>

            {/* Description */}
            {option.description && (
              <Text className="mt-1 text-xs font-normal" style={{ color: '#999999' }}>
                {option.description}
              </Text>
            )}
          </View>

          {/* Duration and Selection indicator */}
          <View className="ml-3 flex-row items-center gap-3">
            {/* Duration */}
            {option.duration !== '0:00' && (
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={isSelected ? '#E8B84B' : '#999999'}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: isSelected ? '#E8B84B' : '#999999' }}>
                  {option.duration}
                </Text>
              </View>
            )}

            {/* Selection indicator with order */}
            {isSelected && selectionOrder !== null && (
              <View
                className="h-8 w-8 flex-row items-center justify-center rounded-lg"
                style={{
                  backgroundColor: '#E8B84B',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <Text className="text-sm font-medium text-white">{selectionOrder}</Text>
              </View>
            )}
            {!isSelected && (
              <View
                className="h-8 w-8 rounded-lg"
                style={{ backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E5E5E5' }}
              />
            )}
          </View>
        </View>
      </Pressable>
    );
  }
);

AudioOptionItem.displayName = 'AudioOptionItem';

export const AudioSelectionDrawer = forwardRef<AudioSelectionDrawerRef, AudioSelectionDrawerProps>(
  ({ segmentType, title, description, audioOptions }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const playerRef = useRef<AudioPlayer | null>(null);

    const selectedAudioIds = useSessionStore(
      (state) => state.segments[segmentType]?.selectedAudioIds || []
    );
    const isRandom = useSessionStore((state) => state.segments[segmentType]?.isRandom || false);
    const toggleAudioInSegment = useSessionStore((state) => state.toggleAudioInSegment);
    const setSegmentEnabled = useSessionStore((state) => state.setSegmentEnabled);
    const setSegmentAudioToRandom = useSessionStore((state) => state.setSegmentAudioToRandom);
    const setSegmentIsRandom = useSessionStore((state) => state.setSegmentIsRandom);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.expand(),
      dismiss: () => bottomSheetRef.current?.close(),
    }));

    const snapPoints = useMemo(() => ['40%', '60%', '75%'], []);

    // Cleanup audio on unmount
    React.useEffect(() => {
      return () => {
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current = null;
        }
      };
    }, []);

    const handlePlayToggle = useCallback(
      async (audioId: string) => {
        try {
          // If already playing this audio, stop it
          if (playingAudioId === audioId && playerRef.current) {
            await playerRef.current.pause();
            await playerRef.current.seekTo(0);
            playerRef.current = null;
            setPlayingAudioId(null);
            return;
          }

          // Stop current audio if any
          if (playerRef.current) {
            await playerRef.current.pause();
            playerRef.current = null;
          }

          // Ensure audio session is configured before loading audio
          if (!AudioSessionConfig.isAudioSessionInitialized()) {
            console.log('[AudioSelectionDrawer] Initializing audio session before loading audio');
            await AudioSessionConfig.initializeAudioSession();
          }

          // Get preloaded audio source
          const audioSource = AudioPreloader.getPreloadedSound(audioId);
          if (!audioSource) {
            console.warn(`[AudioSelectionDrawer] Audio ${audioId} not preloaded`);
            return;
          }

          // Play new audio
          const player = createAudioPlayer(audioSource);

          // Set up listener for playback finished
          player.addListener('playbackStatusUpdate', (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlayingAudioId(null);
              playerRef.current = null;
            }
          });

          await player.play();
          playerRef.current = player;
          setPlayingAudioId(audioId);
        } catch (error) {
          console.error('Error playing audio:', error);
          setPlayingAudioId(null);
        }
      },
      [playingAudioId]
    );

    const handleToggleAudio = useCallback(
      (audioId: string) => {
        toggleAudioInSegment(segmentType, audioId);

        // Auto-enable segment when at least one audio is selected
        // Note: toggleAudioInSegment will clear isRandom flag
        const currentIds = selectedAudioIds.includes(audioId)
          ? selectedAudioIds.filter((id: string) => id !== audioId)
          : [...selectedAudioIds, audioId];

        setSegmentEnabled(segmentType, currentIds.length > 0);
      },
      [segmentType, toggleAudioInSegment, setSegmentEnabled, selectedAudioIds]
    );

    const handleDone = useCallback(() => {
      bottomSheetRef.current?.close();
    }, []);

    const handleToggleRandom = useCallback(() => {
      if (isRandom) {
        // Deselect random
        setSegmentIsRandom(segmentType, false);
        setSegmentEnabled(segmentType, false);
      } else {
        // Select random
        setSegmentAudioToRandom(segmentType, audioOptions);
        setSegmentEnabled(segmentType, true);
      }
    }, [
      isRandom,
      segmentType,
      audioOptions,
      setSegmentAudioToRandom,
      setSegmentEnabled,
      setSegmentIsRandom,
    ]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
      ),
      []
    );

    const getSelectionOrder = useCallback(
      (audioId: string): number | null => {
        const index = selectedAudioIds.indexOf(audioId);
        return index >= 0 ? index + 1 : null;
      },
      [selectedAudioIds]
    );

    const renderItem = useCallback(
      ({ item }: { item: AudioItem }) => {
        // Don't show selection order or allow selection if random is enabled
        const selectionOrder = isRandom ? null : getSelectionOrder(item.id);
        const onToggle = isRandom ? () => {} : () => handleToggleAudio(item.id);
        const isPlaying = playingAudioId === item.id;

        return (
          <View style={{ opacity: isRandom ? 0.4 : 1 }}>
            <AudioOptionItem
              option={item}
              selectionOrder={selectionOrder}
              onToggle={onToggle}
              isPlaying={isPlaying}
              onPlayToggle={() => handlePlayToggle(item.id)}
            />
          </View>
        );
      },
      [isRandom, getSelectionOrder, handleToggleAudio, playingAudioId, handlePlayToggle]
    );

    const keyExtractor = useCallback((item: AudioItem) => item.id, []);

    const handleSheetChanges = useCallback((index: number) => {
      // Stop audio when drawer closes
      if (index === -1 && playerRef.current) {
        playerRef.current.pause();
        playerRef.current = null;
        setPlayingAudioId(null);
      }
    }, []);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        enableOverDrag={false}
        enableContentPanningGesture={false}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={{
          backgroundColor: '#F5F5EC',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: '#E8B84B',
          width: 48,
          height: 4,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        style={{ zIndex: 9999 }}>
        {/* Header */}
        <View
          className="px-8 pb-6 pt-5"
          style={{ borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-medium tracking-wide" style={{ color: '#333333' }}>
                {title}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: '#999999' }}>
                {description}
              </Text>
            </View>
            <Pressable
              onPress={handleDone}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              className="rounded-xl p-2.5"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Done">
              <Ionicons name="checkmark" size={24} color="#333333" />
            </Pressable>
          </View>
        </View>

        {/* Random Option */}
        <View className="px-4 pt-4">
          <Pressable
            onPress={handleToggleRandom}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: isRandom ? '#FFF9E6' : '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isRandom ? 0.1 : 0.06,
                shadowRadius: 8,
                elevation: isRandom ? 3 : 2,
              },
            ]}
            className="mb-3 overflow-hidden rounded-2xl px-4 py-3"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isRandom }}
            accessibilityLabel="Random">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-medium"
                  style={{ color: isRandom ? '#333333' : '#666666' }}>
                  Random
                </Text>
                <Text className="mt-1 text-xs font-normal" style={{ color: '#999999' }}>
                  Pick a random audio when session starts
                </Text>
              </View>

              <View className="ml-3 flex-row items-center gap-3">
                <Ionicons name="shuffle" size={20} color={isRandom ? '#E8B84B' : '#999999'} />
                {isRandom && (
                  <View
                    className="h-8 w-8 flex-row items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: '#E8B84B',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
                {!isRandom && (
                  <View
                    className="h-8 w-8 rounded-lg"
                    style={{ backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E5E5E5' }}
                  />
                )}
              </View>
            </View>
          </Pressable>
        </View>

        {/* Options List */}
        <BottomSheetFlatList
          data={audioOptions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingVertical: 0, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </BottomSheet>
    );
  }
);

AudioSelectionDrawer.displayName = 'AudioSelectionDrawer';
