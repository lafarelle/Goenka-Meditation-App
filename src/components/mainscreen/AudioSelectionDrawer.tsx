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
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className={`border-3 mx-4 mb-3 overflow-hidden rounded-lg p-4 ${
        isSelected
          ? 'border-amber-500 bg-amber-50 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]'
          : 'border-stone-800 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option.name}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            className={`text-base font-black ${isSelected ? 'text-amber-800' : 'text-stone-900'}`}>
            {option.name}
          </Text>

          {/* Metadata row */}
          {option.duration !== '0:00' && (
            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              {option.duration && option.duration !== '0:00' && (
                <View
                  className={`flex-row items-center gap-1 rounded border-2 px-2 py-1 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]'
                      : 'border-stone-700 bg-stone-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={isSelected ? '#F59E0B' : '#78716c'}
                  />
                  <Text
                    className={`text-xs font-black ${isSelected ? 'text-amber-700' : 'text-stone-600'}`}>
                    {option.duration}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description for items without duration metadata */}
          {option.description && option.duration === '0:00' && (
            <Text
              className={`mt-1 text-xs font-bold ${isSelected ? 'text-amber-600' : 'text-stone-600'}`}>
              {option.description}
            </Text>
          )}
        </View>

        {/* Selection indicator with order */}
        <View className="ml-3 flex-col items-center justify-center">
          {isSelected && selectionOrder !== null && (
            <View className="h-9 w-9 flex-row items-center justify-center rounded border-2 border-stone-800 bg-amber-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Text className="text-base font-black text-white">{selectionOrder}</Text>
            </View>
          )}
          {!isSelected && (
            <View className="h-9 w-9 rounded border-2 border-stone-800 bg-stone-50" />
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
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: '#FFFBEB',
        }}
        handleIndicatorStyle={{
          backgroundColor: '#F59E0B',
          width: 48,
          height: 5,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        style={{ zIndex: 9999 }}>
        {/* Header */}
        <View className="border-b-4 border-stone-800 bg-amber-400 px-6 pb-5 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
                  <Ionicons name="musical-notes" size={18} color="#292524" />
                </View>
                <Text className="text-xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
                  {title}
                </Text>
              </View>
              {selectedAudioIds.length > 0 && (
                <View className="ml-10 mt-2 flex-row items-center gap-1">
                  <View className="rounded border-2 border-stone-800 bg-amber-200 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Text className="text-xs font-black uppercase text-stone-900">
                      {selectedAudioIds.length} selected
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <Pressable
              onPress={handleDone}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="rounded border-2 border-stone-800 bg-stone-100 p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Done">
              <Ionicons name="checkmark" size={24} color="#292524" />
            </Pressable>
          </View>
        </View>

        {/* Options List */}
        <BottomSheetFlatList
          data={audioOptions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </BottomSheet>
    );
  }
);

AudioSelectionDrawer.displayName = 'AudioSelectionDrawer';
