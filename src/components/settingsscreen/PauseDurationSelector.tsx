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
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-4 text-lg font-medium text-gray-800">Pause Duration</Text>
      <Text className="mb-4 text-sm text-gray-600">
        Choose the pause duration between audio segments
      </Text>

      <View className="space-y-2">
        {PAUSE_OPTIONS.map((option) => {
          const isSelected = preferences.pauseDuration === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handlePauseSelect(option.value)}
              className={`flex-row items-center justify-between rounded-lg border p-3 ${
                isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
              }`}>
              <View className="flex-1">
                <Text
                  className={`text-base font-medium ${
                    isSelected ? 'text-yellow-900' : 'text-gray-800'
                  }`}>
                  {option.label}
                </Text>
                <Text className={`text-xs ${isSelected ? 'text-yellow-700' : 'text-gray-500'}`}>
                  {option.description}
                </Text>
              </View>

              <View
                className={`h-4 w-4 rounded-full border-2 ${
                  isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                }`}>
                {isSelected && (
                  <View className="h-full w-full items-center justify-center">
                    <View className="h-1.5 w-1.5 rounded-full bg-white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
