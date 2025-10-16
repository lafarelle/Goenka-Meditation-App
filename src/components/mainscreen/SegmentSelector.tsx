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
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: isEnabled ? '#FFF9E6' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isEnabled ? 0.1 : 0.06,
            shadowRadius: isEnabled ? 10 : 8,
            elevation: isEnabled ? 4 : 2,
          },
        ]}
        className="rounded-2xl p-6"
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${selectedName || 'None selected'}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isEnabled ? '#E8B84B' : '#F5F5F5',
              }}>
              <Text
                className="text-sm font-medium"
                style={{ color: isEnabled ? '#FFFFFF' : '#999999' }}>
                {number}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-medium"
                style={{ color: isEnabled ? '#333333' : '#666666' }}>
                {title}
              </Text>
              {selectedName && (
                <Text className="mt-1 text-xs font-normal" style={{ color: '#999999' }}>
                  {selectedName}
                </Text>
              )}
            </View>
          </View>
          <Text
            className="text-2xl font-light"
            style={{ color: isEnabled ? '#E8B84B' : '#CCCCCC' }}>
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
      <View className="w-full gap-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium tracking-wide" style={{ color: '#666666' }}>
            Session Segments
          </Text>
          <Pressable
            onPress={handleClear}
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
            className="rounded-xl px-4 py-2">
            <Text className="text-sm font-medium" style={{ color: '#666666' }}>
              Clear
            </Text>
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
