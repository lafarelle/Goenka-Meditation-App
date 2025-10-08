import { Container } from '@/components/Container';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function Settings() {
  return (
    <View className="flex flex-1 bg-white">
      <Stack.Screen options={{ title: 'Settings' }} />
      <Container>
        <View className="flex gap-6">
          <View>
            <Text className="mb-4 text-2xl font-bold text-gray-900">Settings</Text>
          </View>

          <View className="rounded-lg bg-gray-50 p-4">
            <Text className="text-sm text-gray-600">Settings page placeholder</Text>
          </View>
        </View>
      </Container>
    </View>
  );
}
