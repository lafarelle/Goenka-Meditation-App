import { useSessionStore } from '@/store/sessionStore';
import Slider from '@react-native-community/slider';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

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
    <View className="w-full">
      <TouchableOpacity onPress={handleTimePress} className="mb-2">
        <Text className="text-center text-4xl font-bold text-amber-600">
          {totalDurationMinutes} min
        </Text>
      </TouchableOpacity>
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
