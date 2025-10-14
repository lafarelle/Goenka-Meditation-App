import { PauseDuration } from '@/schemas/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';
import { Text, TouchableOpacity, View } from 'react-native';

interface PauseOption {
  value: PauseDuration;
  label: string;
  description: string;
}

const PAUSE_OPTIONS: PauseOption[] = [
  {
    value: 0,
    label: 'No Pause',
    description: 'Immediate transition between audio',
  },
  {
    value: 1,
    label: '1 Second',
    description: 'Brief pause between segments',
  },
  {
    value: 2,
    label: '2 Seconds',
    description: 'Short pause for reflection',
  },
  {
    value: 3,
    label: '3 Seconds',
    description: 'Medium pause for settling',
  },
  {
    value: 5,
    label: '5 Seconds',
    description: 'Longer pause for deeper transition',
  },
  {
    value: 10,
    label: '10 Seconds',
    description: 'Extended pause for contemplation',
  },
];

export function PauseDurationSelector() {
  const { preferences, setPauseDuration } = usePreferencesStore();

  const handlePauseSelect = (duration: PauseDuration) => {
    setPauseDuration(duration);
  };

  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-md">
      <View className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Text className="text-lg">⏸️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-stone-800">Pause Duration</Text>
            <Text className="text-xs text-stone-600">Between audio segments</Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        <View className="space-y-3">
          {PAUSE_OPTIONS.map((option) => {
            const isSelected = preferences.pauseDuration === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => handlePauseSelect(option.value)}
                activeOpacity={0.8}
                className={`flex-row items-center justify-between rounded-xl border-2 p-4 ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50'
                    : 'border-stone-200 bg-stone-50'
                }`}>
                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? 'text-amber-800' : 'text-stone-800'
                    }`}>
                    {option.label}
                  </Text>
                  <Text
                    className={`mt-0.5 text-xs ${isSelected ? 'text-amber-600' : 'text-stone-600'}`}>
                    {option.description}
                  </Text>
                </View>

                <View
                  className={`h-6 w-6 rounded-full border-2 ${
                    isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300 bg-white'
                  }`}>
                  {isSelected && (
                    <View className="h-full w-full items-center justify-center">
                      <View className="h-2.5 w-2.5 rounded-full bg-white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
