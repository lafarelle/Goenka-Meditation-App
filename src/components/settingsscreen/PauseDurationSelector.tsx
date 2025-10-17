import { PauseDuration } from '@/schemas/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';
import { selectionHaptic } from '@/utils/haptics';
import { Pressable, Text, View } from 'react-native';

interface PauseOption {
  value: PauseDuration;
  label: string;
}

const PAUSE_OPTIONS: PauseOption[] = [
  { value: 1, label: '1s' },
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
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
                  backgroundColor: isSelected ? '#F5C563' : '#F5F5EC',
                  borderWidth: 2,
                  borderColor: isSelected ? '#D4A444' : 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isSelected ? 0.2 : 0.08,
                  shadowRadius: 8,
                  elevation: isSelected ? 4 : 2,
                },
              ]}
              className="flex-1 rounded-xl px-6 py-4"
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label} pause duration`}>
              <Text
                className="text-center text-base font-semibold"
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
