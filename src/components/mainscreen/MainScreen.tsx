import { Button } from '@/components/ui/Button';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { DurationSelector } from './DurationSelector';

export function MainScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      <DurationSelector />

      <Link href="/meditation" asChild>
        <Button title="Start Meditation" />
      </Link>
    </View>
  );
}
