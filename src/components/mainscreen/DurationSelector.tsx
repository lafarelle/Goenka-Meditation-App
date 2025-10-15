import { useSessionStore } from '@/store/sessionStore';
import Slider from '@react-native-community/slider';
import { Alert, Pressable, Text, View } from 'react-native';

export function DurationSelector() {
  const totalDurationMinutes = useSessionStore((state) => state.totalDurationMinutes);
  const setTotalDurationMinutes = useSessionStore((state) => state.setTotalDurationMinutes);

  const handleValueChange = (value: number) => {
    setTotalDurationMinutes(value);
  };

  const handleTimePress = () => {
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

  return (
    <View className="border-3 w-full rounded-lg border-stone-800 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-black uppercase tracking-wider text-stone-600">Duration</Text>
        <Pressable
          onPress={handleTimePress}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
          <View className="border-3 rounded-lg border-amber-600 bg-amber-100 px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
            <Text className="text-center text-2xl font-black text-amber-700">
              {totalDurationMinutes} min
            </Text>
          </View>
        </Pressable>
      </View>
      <Slider
        style={{ width: '100%', height: 30 }}
        minimumValue={5}
        maximumValue={60}
        step={5}
        value={totalDurationMinutes}
        onValueChange={handleValueChange}
        minimumTrackTintColor="#F59E0B"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#F59E0B"
      />
      <View className="mt-1 flex-row justify-between px-1">
        <Text className="text-xs font-bold text-stone-500">5</Text>
        <Text className="text-xs font-bold text-stone-500">60</Text>
      </View>
    </View>
  );
}
