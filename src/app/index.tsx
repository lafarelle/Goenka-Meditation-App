import { MainScreen } from '@/components/mainscreen/MainScreen';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  return (
    <View className="flex flex-1 bg-gray-900">
      <Stack.Screen options={{ title: 'Goenka Meditation', headerShown: false }} />
      <MainScreen />
    </View>
  );
}
