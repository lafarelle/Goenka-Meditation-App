import { usePreferencesStore } from '@/store/preferencesStore';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

export function TimingPreferenceSelector() {
  const { preferences, setTimingPreference } = usePreferencesStore();

  const isTotalTiming = preferences.timingPreference === 'total';

  const handleTimingToggle = () => {
    setTimingPreference(isTotalTiming ? 'silent' : 'total');
  };

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-4 text-lg font-medium text-gray-800">Timing</Text>

      <TouchableOpacity
        onPress={handleTimingToggle}
        className={`flex-row items-center justify-between rounded-lg border p-3 ${
          isTotalTiming ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
        }`}>
        <Text
          className={`text-base font-medium ${
            isTotalTiming ? 'text-yellow-900' : 'text-gray-800'
          }`}>
          {isTotalTiming ? 'Total Session Time' : 'Silent Meditation Time'}
        </Text>
        <Switch
          value={isTotalTiming}
          onValueChange={handleTimingToggle}
          trackColor={{ false: '#d1d5db', true: '#eab308' }}
          thumbColor={isTotalTiming ? '#ffffff' : '#ffffff'}
        />
      </TouchableOpacity>
    </View>
  );
}
