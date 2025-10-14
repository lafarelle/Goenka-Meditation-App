import { usePreferencesStore } from '@/store/preferencesStore';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

export function TimingPreferenceSelector() {
  const { preferences, setTimingPreference } = usePreferencesStore();

  const isTotalTiming = preferences.timingPreference === 'total';

  const handleTimingToggle = () => {
    setTimingPreference(isTotalTiming ? 'silent' : 'total');
  };

  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-md">
      <View className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Text className="text-lg">⏱️</Text>
          </View>
          <Text className="text-lg font-bold text-stone-800">Timing Preference</Text>
        </View>
      </View>

      <View className="p-5">
        <TouchableOpacity
          onPress={handleTimingToggle}
          activeOpacity={0.8}
          className={`flex-row items-center justify-between rounded-xl border-2 p-4 ${
            isTotalTiming
              ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50'
              : 'border-stone-200 bg-stone-50'
          }`}>
          <View className="flex-1">
            <Text
              className={`text-base font-bold ${
                isTotalTiming ? 'text-amber-800' : 'text-stone-800'
              }`}>
              {isTotalTiming ? 'Total Session Time' : 'Silent Meditation Time'}
            </Text>
            <Text
              className={`mt-0.5 text-xs ${isTotalTiming ? 'text-amber-600' : 'text-stone-600'}`}>
              {isTotalTiming
                ? 'Duration includes all audio segments'
                : 'Duration is silent meditation only'}
            </Text>
          </View>
          <Switch
            value={isTotalTiming}
            onValueChange={handleTimingToggle}
            trackColor={{ false: '#d6d3d1', true: '#F59E0B' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d6d3d1"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
