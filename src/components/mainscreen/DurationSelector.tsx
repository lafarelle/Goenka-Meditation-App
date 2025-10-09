import { useSessionStore } from '@/store/sessionStore';
import Slider from '@react-native-community/slider';
import { Text, View } from 'react-native';

export function DurationSelector() {
  const totalDurationMinutes = useSessionStore((state) => state.totalDurationMinutes);
  const setTotalDurationMinutes = useSessionStore((state) => state.setTotalDurationMinutes);

  const handleValueChange = (value: number) => {
    setTotalDurationMinutes(value);
  };

  return (
    <View className="w-full rounded-2xl bg-white/10 p-6">
      <Text className="mb-2 text-center text-lg font-semibold text-white">Session Duration</Text>
      <Text className="mb-4 text-center text-4xl font-bold text-white">
        {totalDurationMinutes} min
      </Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={5}
        maximumValue={60}
        step={5}
        value={totalDurationMinutes}
        onValueChange={handleValueChange}
        minimumTrackTintColor="#6366f1"
        maximumTrackTintColor="#ffffff40"
        thumbTintColor="#6366f1"
      />
      <View className="mt-2 flex-row justify-between">
        <Text className="text-sm text-white/60">5 min</Text>
        <Text className="text-sm text-white/60">60 min</Text>
      </View>
    </View>
  );
}
