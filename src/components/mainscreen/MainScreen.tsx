import { Button } from '@/components/ui/Button';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';
import { AudioSelectionProvider } from './AudioSelectionProvider';
import { DurationSelector } from './DurationSelector';
import { SegmentSelector } from './SegmentSelector';

export function MainScreen() {
  return (
    <AudioSelectionProvider>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 py-24"
        showsVerticalScrollIndicator={false}>
        <DurationSelector />
        <SegmentSelector />

        <Link href="/meditation" asChild>
          <Button title="Start Meditation" />
        </Link>
      </ScrollView>
    </AudioSelectionProvider>
  );
}
