import { MinimalistSwitch } from '@/components/ui/MinimalistSwitch';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { lightHaptic, selectionHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Alert, Pressable, Text, View } from 'react-native';

export function DurationSelector() {
  const totalDurationMinutes = useSessionStore((state) => state.totalDurationMinutes);
  const setTotalDurationMinutes = useSessionStore((state) => state.setTotalDurationMinutes);

  const { preferences, setTimingPreference } = usePreferencesStore();
  const isTotalTiming = preferences.timingPreference === 'total';

  const handleValueChange = (value: number) => {
    selectionHaptic();
    setTotalDurationMinutes(value);
  };

  const handleTimePress = () => {
    lightHaptic();
    Alert.prompt(
      'Custom Duration',
      'Enter duration in minutes (1-180):',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Set',
          onPress: (text: string | undefined) => {
            if (text) {
              const duration = parseInt(text, 10);
              if (!isNaN(duration) && duration >= 1 && duration <= 180) {
                setTotalDurationMinutes(duration);
              } else {
                Alert.alert('Invalid Duration', 'Please enter a number between 1 and 180 minutes.');
              }
            }
          },
        },
      ],
      'plain-text',
      totalDurationMinutes.toString()
    );
  };

  const handleInfoPress = () => {
    lightHaptic();
    Alert.alert(
      'Timing Preference',
      isTotalTiming
        ? '"Total" means that your entire session will last the selected time.'
        : '"Silent" means that audio segments are added on top of this time.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <View
      className="w-full rounded-2xl bg-white p-6"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}>
      {/* Top Section: Duration and Switch */}
      <View className="mb-4">
        <View className="mb-3 flex-row items-center justify-between px-6">
          <Pressable
            onPress={handleTimePress}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}>
            <Text className="text-3xl font-light tracking-wide" style={{ color: '#333333' }}>
              {totalDurationMinutes} min
            </Text>
          </Pressable>

          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Pressable onPress={handleInfoPress} hitSlop={8}>
              <Ionicons name="information-circle-outline" size={18} color="#E8B84B" />
            </Pressable>
            <MinimalistSwitch
              value={isTotalTiming}
              onValueChange={(value) => setTimingPreference(value ? 'total' : 'silent')}
              leftLabel="Silent"
              rightLabel="Total"
            />
          </View>
        </View>
      </View>

      {/* Slider Section */}
      <Slider
        style={{ width: '100%', height: 30 }}
        minimumValue={5}
        maximumValue={60}
        step={5}
        value={totalDurationMinutes}
        onValueChange={handleValueChange}
        minimumTrackTintColor="#E8B84B"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#E8B84B"
      />
      <View className="mt-2 flex-row justify-between px-1">
        <Text className="text-xs font-medium" style={{ color: '#999999' }}>
          5
        </Text>
        <Text className="text-xs font-medium" style={{ color: '#999999' }}>
          60
        </Text>
      </View>
    </View>
  );
}
