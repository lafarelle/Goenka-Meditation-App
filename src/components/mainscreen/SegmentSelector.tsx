import { Button } from '@/components/ui/Button';
import { SessionSegmentType, useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AudioSelectionContext } from './AudioSelectionProvider';

interface SegmentButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isEnabled: boolean;
  selectedName?: string;
  onPress: () => void;
}

const SegmentButton = React.memo<SegmentButtonProps>(
  ({ title, icon, isEnabled, selectedName, onPress }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`rounded-xl p-4 ${
          isEnabled ? 'border border-amber-500/30 bg-amber-50' : 'border border-stone-200 bg-white'
        }`}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${selectedName || 'None selected'}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className={`rounded-full p-2 ${isEnabled ? 'bg-amber-100' : 'bg-stone-100'}`}>
              <Ionicons name={icon} size={20} color={isEnabled ? '#F59E0B' : '#6B7280'} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-sm font-medium ${isEnabled ? 'text-amber-700' : 'text-stone-800'}`}>
                {title}
              </Text>
              {selectedName && <Text className="text-xs text-stone-600">{selectedName}</Text>}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isEnabled ? '#F59E0B' : '#9CA3AF'} />
        </View>
      </TouchableOpacity>
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
  const getSelectedAudioSummary = (segmentType: SessionSegmentType): string | undefined => {
    const selectedIds = segments[segmentType]?.selectedAudioIds || [];
    if (selectedIds.length === 0) return undefined;

    if (selectedIds.length === 1) {
      // For now, just show the count. In a real app, you might want to store the audio names
      return '1 audio selected';
    }

    return `${selectedIds.length} audios selected`;
  };

  const segmentConfigs = [
    {
      type: 'openingChant' as SessionSegmentType,
      title: 'Opening Chant',
      icon: 'musical-notes' as keyof typeof Ionicons.glyphMap,
      drawerRef: openingChantDrawerRef,
    },
    {
      type: 'openingGuidance' as SessionSegmentType,
      title: 'Opening Guidance',
      icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
      drawerRef: openingGuidanceDrawerRef,
    },
    {
      type: 'techniqueReminder' as SessionSegmentType,
      title: 'Technique Reminder',
      icon: 'bulb-outline' as keyof typeof Ionicons.glyphMap,
      drawerRef: techniqueReminderDrawerRef,
    },
    {
      type: 'metta' as SessionSegmentType,
      title: 'Mettā Practice',
      icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      drawerRef: mettaDrawerRef,
    },
    {
      type: 'closingChant' as SessionSegmentType,
      title: 'Closing Chant',
      icon: 'musical-note' as keyof typeof Ionicons.glyphMap,
      drawerRef: closingChantDrawerRef,
    },
  ];

  return (
    <>
      <View className="w-full gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium uppercase tracking-wide text-stone-600">
            Session Segments
          </Text>
          <Button
            title="Clear"
            onPress={handleClear}
            className=" px-3 py-1"
            textClassName="text-xs text-white"
          />
        </View>

        {segmentConfigs.map((config) => (
          <SegmentButton
            key={config.type}
            title={config.title}
            icon={config.icon}
            isEnabled={segments[config.type]?.isEnabled || false}
            selectedName={getSelectedAudioSummary(config.type)}
            onPress={() => config.drawerRef.current?.present()}
          />
        ))}
      </View>
    </>
  );
}
