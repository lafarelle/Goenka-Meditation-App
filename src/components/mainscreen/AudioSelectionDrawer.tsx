import { AudioItem } from '@/schemas/audio';
import { SessionSegmentType } from '@/schemas/session';
import { useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

interface AudioSelectionDrawerProps {
  segmentType: SessionSegmentType;
  title: string;
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
}

const AudioOptionItem = React.memo<AudioOptionItemProps>(({ option, selectionOrder, onToggle }) => {
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
});

AudioOptionItem.displayName = 'AudioOptionItem';

export const AudioSelectionDrawer = forwardRef<AudioSelectionDrawerRef, AudioSelectionDrawerProps>(
  ({ segmentType, title, audioOptions }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const selectedAudioIds = useSessionStore(
      (state) => state.segments[segmentType]?.selectedAudioIds || []
    );
    const toggleAudioInSegment = useSessionStore((state) => state.toggleAudioInSegment);
    const setSegmentEnabled = useSessionStore((state) => state.setSegmentEnabled);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.expand(),
      dismiss: () => bottomSheetRef.current?.close(),
    }));

    const snapPoints = useMemo(() => ['40%', '60%', '75%'], []);

    const handleToggleAudio = useCallback(
      (audioId: string) => {
        toggleAudioInSegment(segmentType, audioId);

        // Auto-enable segment when at least one audio is selected
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
      ({ item }: { item: AudioItem }) => (
        <AudioOptionItem
          option={item}
          selectionOrder={getSelectionOrder(item.id)}
          onToggle={() => handleToggleAudio(item.id)}
        />
      ),
      [getSelectionOrder, handleToggleAudio]
    );

    const keyExtractor = useCallback((item: AudioItem) => item.id, []);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        enableOverDrag={false}
        enableContentPanningGesture={false}
        backdropComponent={renderBackdrop}
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
              <View className="flex-row items-center gap-3">
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#E8B84B' }}>
                  <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-medium tracking-wide" style={{ color: '#333333' }}>
                  {title}
                </Text>
              </View>
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

        {/* Options List */}
        <BottomSheetFlatList
          data={audioOptions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </BottomSheet>
    );
  }
);

AudioSelectionDrawer.displayName = 'AudioSelectionDrawer';
