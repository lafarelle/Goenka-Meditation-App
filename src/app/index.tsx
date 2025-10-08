import { Link, Stack } from 'expo-router';

import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';

export default function Home() {
  return (
    <View className="flex flex-1">
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home"></ScreenContent>
        <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Show Details" />
        </Link>
        <Link className="mt-4" href="/meditation" asChild>
          <Button title="Meditation" />
        </Link>
      </Container>
    </View>
  );
}
