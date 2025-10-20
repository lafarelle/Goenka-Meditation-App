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
      {/* Section Title */}
      <Text className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
        Pause Duration
      </Text>

      {/* Duration Options */}
      <View className="flex-row gap-2">
        {PAUSE_OPTIONS.map((option) => {
          const isSelected = preferences.pauseDuration === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                selectionHaptic();
                setPauseDuration(option.value);
              }}
              className={`flex-1 rounded-lg px-4 py-3 ${isSelected ? 'bg-amber-400' : 'bg-gray-50'}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label} pause duration`}>
              <Text
                className={`text-center text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-gray-500'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
