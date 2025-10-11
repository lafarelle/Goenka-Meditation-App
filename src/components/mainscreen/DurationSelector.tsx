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
    <View className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <Text className="mb-2 text-center text-lg font-semibold text-stone-800">
        Session Duration
      </Text>
      <Text className="mb-4 text-center text-4xl font-bold text-amber-600">
        {totalDurationMinutes} min
      </Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={5}
        maximumValue={60}
        step={5}
        value={totalDurationMinutes}
        onValueChange={handleValueChange}
        minimumTrackTintColor="#F59E0B"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#F59E0B"
      />
      <View className="mt-2 flex-row justify-between">
        <Text className="text-sm text-stone-600">5 min</Text>
        <Text className="text-sm text-stone-600">60 min</Text>
      </View>
    </View>
  );
}
