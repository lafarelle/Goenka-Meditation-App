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
      <Text className="mb-2 mt-6 text-base font-medium tracking-wide text-slate-800">
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
              className={`flex-1 rounded-xl px-6 py-4 ${isSelected ? 'bg-amber-400' : 'bg-stone-100'}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label} pause duration`}>
              <Text className={`text-center text-base font-bold ${isSelected ? 'text-slate-900' : 'text-gray-500'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
