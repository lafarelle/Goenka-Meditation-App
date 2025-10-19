import { PauseDuration } from '@/schemas/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';
import { selectionHaptic } from '@/utils/haptics';
import { Pressable, Text, View } from 'react-native';

interface PauseOption {
  value: PauseDuration;
  label: string;
}

const PAUSE_OPTIONS: PauseOption[] = [
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1min' },
];

export function PauseDurationSelector() {
  const { preferences, setPauseDuration } = usePreferencesStore();

  return (
    <View>
      <Text className="mb-2 mt-6 text-base font-medium tracking-wide" style={{ color: '#333333' }}>
        Time between each audio
      </Text>
      <View className="flex-row gap-3">
        {PAUSE_OPTIONS.map((option) => {
          const isSelected = preferences.pauseDuration === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                selectionHaptic();
                setPauseDuration(option.value);
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: isSelected ? '#E8B84B' : '#F5F5EC',
                  borderWidth: isSelected ? 3 : 2,
                  borderColor: isSelected ? '#C49A2F' : '#E0E0E0',
                  shadowColor: isSelected ? '#E8B84B' : '#000',
                  shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                  shadowOpacity: isSelected ? 0.3 : 0.08,
                  shadowRadius: isSelected ? 12 : 8,
                  elevation: isSelected ? 6 : 2,
                },
              ]}
              className="flex-1 rounded-xl px-6 py-4"
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label} pause duration`}>
              <Text
                className="text-center text-base font-bold"
                style={{ color: isSelected ? '#1A1A1A' : '#666666' }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
