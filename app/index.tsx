import { Link, Stack } from 'expo-router';

import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';

export default function Home() {
  return (
    <View className={styles.container}>
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

const styles = {
  container: 'flex flex-1 bg-white',
};
