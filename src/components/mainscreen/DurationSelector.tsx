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
    <View
      className="w-full rounded-2xl bg-white p-6"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}>
      <View className="mb-5 flex-row items-center justify-center">
        <Pressable
          onPress={handleTimePress}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              backgroundColor: pressed ? '#E8B84B' : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            },
          ]}>
          <Text
            className="text-center text-3xl font-light tracking-wide"
            style={{ color: '#333333' }}>
            {totalDurationMinutes} min
          </Text>
        </Pressable>
      </View>
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
