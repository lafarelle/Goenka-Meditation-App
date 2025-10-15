import { useSessionStore } from '@/store/sessionStore';
import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AudioSelectionContext } from './AudioSelectionProvider';

interface SegmentButtonProps {
  title: string;
  number: number;
  isEnabled: boolean;
  selectedName?: string;
  onPress: () => void;
}

const SegmentButton = React.memo<SegmentButtonProps>(
  ({ title, number, isEnabled, selectedName, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className={`border-3 rounded-xl p-5 px-7 ${
          isEnabled
            ? 'border-amber-500 bg-amber-50 shadow-[5px_5px_0px_0px_rgba(245,158,11,1)]'
            : 'border-stone-800 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${selectedName || 'None selected'}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View
              className={`border-3 rounded-lg p-2.5 ${
                isEnabled
                  ? 'border-amber-600 bg-amber-200 shadow-[3px_3px_0px_0px_rgba(217,119,6,1)]'
                  : 'border-stone-700 bg-stone-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}>
              <Text
                className={`text-sm font-black ${isEnabled ? 'text-amber-700' : 'text-stone-500'}`}>
                {number}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-black ${isEnabled ? 'text-amber-700' : 'text-stone-800'}`}>
                {title}
              </Text>
              {selectedName && (
                <Text className="mt-1 text-sm font-bold text-stone-600">{selectedName}</Text>
              )}
            </View>
          </View>
          <Text
            className={`text-2xl font-black ${isEnabled ? 'text-amber-600' : 'text-stone-400'}`}>
            ›
          </Text>
        </View>
      </Pressable>
    );
  }
);

SegmentButton.displayName = 'SegmentButton';

export function SegmentSelector() {
  const segments = useSessionStore((state) => state.segments);
  const resetSession = useSessionStore((state) => state.resetSession);
  const audioSelectionContext = useContext(AudioSelectionContext);

  const handleClear = () => {
    resetSession();
  };

  if (!audioSelectionContext) {
    throw new Error('SegmentSelector must be used within AudioSelectionProvider');
  }

  const {
    openingChantDrawerRef,
    openingGuidanceDrawerRef,
    techniqueReminderDrawerRef,
    mettaDrawerRef,
    closingChantDrawerRef,
  } = audioSelectionContext;

  // Helper to get selected audio summary
  const getSelectedAudioSummary = (segmentType: any): string | undefined => {
    const selectedIds = (segments as any)[segmentType]?.selectedAudioIds || [];
    if (selectedIds.length === 0) return undefined;

    if (selectedIds.length === 1) {
      // For now, just show the count. In a real app, you might want to store the audio names
      return '1 audio selected';
    }

    return `${selectedIds.length} audios selected`;
  };

  const segmentConfigs = [
    { type: 'openingChant', title: 'Opening Chant', number: 1, drawerRef: openingChantDrawerRef },
    {
      type: 'openingGuidance',
      title: 'Opening Guidance',
      number: 2,
      drawerRef: openingGuidanceDrawerRef,
    },
    {
      type: 'techniqueReminder',
      title: 'Technique Reminder',
      number: 3,
      drawerRef: techniqueReminderDrawerRef,
    },
    { type: 'metta', title: 'Mettā Practice', number: 4, drawerRef: mettaDrawerRef },
    { type: 'closingChant', title: 'Closing Chant', number: 5, drawerRef: closingChantDrawerRef },
  ];

  return (
    <>
      <View className="w-full gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-black uppercase tracking-wider text-stone-800">
            Session Segments
          </Text>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="border-3 rounded-lg border-stone-800 bg-amber-400 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Text className="text-sm font-black uppercase text-stone-900">Clear</Text>
          </Pressable>
        </View>

        {segmentConfigs.map((config) => (
          <SegmentButton
            key={config.type}
            title={config.title}
            number={config.number}
            isEnabled={(segments as any)[config.type]?.isEnabled || false}
            selectedName={getSelectedAudioSummary(config.type)}
            onPress={() => config.drawerRef.current?.present()}
          />
        ))}
      </View>
    </>
  );
}
