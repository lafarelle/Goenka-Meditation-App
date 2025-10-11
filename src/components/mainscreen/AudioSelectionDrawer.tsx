import { AudioItem } from '@/schemas/mainSchema';
import { SessionSegmentType, useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { Text, useColorScheme, View } from 'react-native';

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
  isDark: boolean;
}

const AudioOptionItem = React.memo<AudioOptionItemProps>(
  ({ option, selectionOrder, onToggle, isDark }) => {
    const isSelected = selectionOrder !== null;

    return (
      <TouchableOpacity
        onPress={onToggle}
        className={`mx-4 mb-2 rounded-xl p-4 ${
          isSelected
            ? 'border-2 border-amber-500 bg-amber-500/10'
            : isDark
              ? 'bg-white/5'
              : 'bg-black/5'
        }`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={option.name}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className={`text-base font-medium ${
                isSelected ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'
              }`}>
              {option.name}
            </Text>

            {/* Metadata row */}
            {option.duration !== '0:00' && (
              <View className="mt-2 flex-row flex-wrap items-center gap-3">
                {option.duration && option.duration !== '0:00' && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <Text className={isDark ? 'text-xs text-gray-400' : 'text-xs text-gray-600'}>
                      {option.duration}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Description for items without duration metadata */}
            {option.description && option.duration === '0:00' && (
              <Text className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {option.description}
              </Text>
            )}
          </View>

          {/* Selection indicator with order */}
          <View className="ml-3 flex-col items-center justify-center gap-1">
            {isSelected && selectionOrder !== null && (
              <>
                <View className="flex-row items-center justify-center rounded-full bg-amber-500 px-2 py-1">
                  <Text className="text-xs font-bold text-white">{selectionOrder}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
              </>
            )}
            {!isSelected && (
              <View className="h-8 w-8 rounded-full border-2 border-gray-400 opacity-30" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

AudioOptionItem.displayName = 'AudioOptionItem';

export const AudioSelectionDrawer = forwardRef<AudioSelectionDrawerRef, AudioSelectionDrawerProps>(
  ({ segmentType, title, audioOptions }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const selectedAudioIds = useSessionStore(
      (state) => state.segments[segmentType]?.selectedAudioIds || []
    );
    const toggleAudioInSegment = useSessionStore((state) => state.toggleAudioInSegment);
    const setSegmentEnabled = useSessionStore((state) => state.setSegmentEnabled);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.expand(),
      dismiss: () => bottomSheetRef.current?.close(),
    }));

    const snapPoints = useMemo(() => ['50%', '75%', '90%'], []);

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
          isDark={isDark}
        />
      ),
      [getSelectionOrder, handleToggleAudio, isDark]
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
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        style={{ zIndex: 9999 }}>
        {/* Header */}
        <View
          className={`border-b px-4 pb-3 pt-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </Text>
              {selectedAudioIds.length > 0 && (
                <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedAudioIds.length} selected • Order:{' '}
                  {selectedAudioIds.map((_, i) => i + 1).join(' → ')}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleDone}
              className="rounded-full p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Done">
              <Ionicons name="checkmark" size={24} color="#10B981" />
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
