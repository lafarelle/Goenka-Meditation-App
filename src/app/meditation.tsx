import { Text, View } from 'react-native';

import { Stack } from 'expo-router';

import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';

export default function Meditation() {
  return (
    <View className="flex flex-1">
      <Stack.Screen options={{ title: 'Meditation' }} />
      <Container>
        <ScreenContent path="screens/meditation.tsx" title={`Time for meditation`}>
          <Text>Time for meditation</Text>
        </ScreenContent>
      </Container>
    </View>
  );
}
