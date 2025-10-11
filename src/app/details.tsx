import { Container } from '@/components/Container';
import { usePreferencesStore } from '@/store/preferencesStore';
import { Stack } from 'expo-router';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  const { preferences, setTimingPreference } = usePreferencesStore();

  const isTotalTiming = preferences.timingPreference === 'total';

  const handleTimingToggle = () => {
    setTimingPreference(isTotalTiming ? 'silent' : 'total');
  };

  return (
    <View className="flex flex-1 bg-white">
      <Stack.Screen options={{ title: 'Settings' }} />
      <Container>
        <View className="flex gap-6">
          <View>
            <Text className="mb-4 text-2xl font-bold text-gray-900">Settings</Text>
          </View>

          {/* Timing Preference Section */}
          <View className="rounded-lg bg-gray-50 p-6">
            <Text className="mb-2 text-lg font-semibold text-gray-900">Meditation Timing</Text>
            <Text className="mb-4 text-sm text-gray-600">
              Choose how your meditation duration is calculated
            </Text>

            <TouchableOpacity
              onPress={handleTimingToggle}
              className="flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {isTotalTiming ? 'Total Session Time' : 'Silent Meditation Time'}
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  {isTotalTiming
                    ? 'Selected duration includes all audio and silent meditation'
                    : 'Selected duration is pure silent meditation, audio adds to total time'}
                </Text>
              </View>
              <Switch
                value={isTotalTiming}
                onValueChange={handleTimingToggle}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={isTotalTiming ? '#ffffff' : '#ffffff'}
              />
            </TouchableOpacity>

            <View className="mt-4 rounded-lg bg-blue-50 p-4">
              <Text className="text-sm text-blue-800">
                <Text className="font-semibold">Example:</Text> With 5 minutes selected and 1 minute
                of chants:
                {'\n'}• <Text className="font-medium">Total Session:</Text> 5 minutes total (4 min
                silent + 1 min audio)
                {'\n'}• <Text className="font-medium">Silent Meditation:</Text> 5 minutes silent + 1
                minute audio = 6 minutes total
              </Text>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
}
