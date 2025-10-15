import { PauseDuration } from '@/schemas/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';
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
    <View className="mb-4">
      <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
        Pause Between Segments
      </Text>
      <View className="flex-row gap-2">
        {PAUSE_OPTIONS.map((option) => {
          const isSelected = preferences.pauseDuration === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => setPauseDuration(option.value)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className={`border-3 flex-1 rounded px-4 py-3 ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
                  : 'border-stone-800 bg-stone-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label} pause duration`}>
              <Text
                className={`text-center text-sm font-black uppercase ${
                  isSelected ? 'text-amber-900' : 'text-stone-800'
                }`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
