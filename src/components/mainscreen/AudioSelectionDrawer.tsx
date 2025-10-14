import { AudioItem } from '@/schemas/mainSchema';
import { SessionSegmentType, useSessionStore } from '@/store/sessionStore';
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
      className={`mx-4 mb-2 rounded-lg p-4 ${
        isSelected ? 'border border-amber-500 bg-amber-50' : 'border border-gray-200 bg-white'
      }`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option.name}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            className={`text-base font-medium ${isSelected ? 'text-amber-700' : 'text-gray-900'}`}>
            {option.name}
          </Text>

          {/* Metadata row */}
          {option.duration !== '0:00' && (
            <View className="mt-2 flex-row flex-wrap items-center gap-3">
              {option.duration && option.duration !== '0:00' && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-600">{option.duration}</Text>
                </View>
              )}
            </View>
          )}

          {/* Description for items without duration metadata */}
          {option.description && option.duration === '0:00' && (
            <Text className="mt-1 text-xs text-gray-600">{option.description}</Text>
          )}
        </View>

        {/* Selection indicator with order */}
        <View className="ml-3 flex-col items-center justify-center">
          {isSelected && selectionOrder !== null && (
            <View className="h-8 w-8 flex-row items-center justify-center rounded-full bg-amber-500">
              <Text className="text-sm font-semibold text-white">{selectionOrder}</Text>
            </View>
          )}
          {!isSelected && <View className="h-8 w-8 rounded-full border-2 border-gray-300" />}
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
          ? selectedAudioIds.filter((id) => id !== audioId)
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
          backgroundColor: '#FFFFFF',
        }}
        handleIndicatorStyle={{
          backgroundColor: '#D1D5DB',
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        style={{ zIndex: 9999 }}>
        {/* Header */}
        <View className="border-b border-gray-100 px-4 pb-4 pt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-medium text-gray-900">{title}</Text>
              {selectedAudioIds.length > 0 && (
                <Text className="mt-1 text-sm text-gray-500">
                  {selectedAudioIds.length} selected
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleDone}
              className="rounded-lg bg-gray-100 p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Done">
              <Ionicons name="checkmark" size={20} color="#374151" />
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
