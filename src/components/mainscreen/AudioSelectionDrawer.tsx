import { AudioItem } from '@/schemas/audio';
import { SessionSegmentType } from '@/schemas/session';
import { useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

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
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      className={`mx-4 mb-3 overflow-hidden rounded-2xl p-4 shadow-sm ${
        isSelected
          ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'
          : 'border border-stone-200 bg-white'
      }`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option.name}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${isSelected ? 'text-amber-800' : 'text-stone-900'}`}>
            {option.name}
          </Text>

          {/* Metadata row */}
          {option.duration !== '0:00' && (
            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              {option.duration && option.duration !== '0:00' && (
                <View
                  className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${
                    isSelected ? 'bg-amber-100' : 'bg-stone-100'
                  }`}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={isSelected ? '#F59E0B' : '#78716c'}
                  />
                  <Text
                    className={`text-xs font-medium ${isSelected ? 'text-amber-700' : 'text-stone-600'}`}>
                    {option.duration}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description for items without duration metadata */}
          {option.description && option.duration === '0:00' && (
            <Text className={`mt-1 text-xs ${isSelected ? 'text-amber-600' : 'text-stone-600'}`}>
              {option.description}
            </Text>
          )}
        </View>

        {/* Selection indicator with order */}
        <View className="ml-3 flex-col items-center justify-center">
          {isSelected && selectionOrder !== null && (
            <View className="h-9 w-9 flex-row items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md">
              <Text className="text-base font-bold text-white">{selectionOrder}</Text>
            </View>
          )}
          {!isSelected && (
            <View className="h-9 w-9 rounded-full border-2 border-stone-300 bg-stone-50" />
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        <View className="border-b border-amber-200 bg-gradient-to-r from-amber-500 to-yellow-500 px-6 pb-5 pt-4 shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Ionicons name="musical-notes" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">{title}</Text>
              </View>
              {selectedAudioIds.length > 0 && (
                <View className="ml-10 mt-2 flex-row items-center gap-1">
                  <View className="rounded-full bg-white/20 px-2 py-1">
                    <Text className="text-xs font-bold text-white">
                      {selectedAudioIds.length} selected
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handleDone}
              className="rounded-full bg-white/20 p-2.5"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Done">
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
