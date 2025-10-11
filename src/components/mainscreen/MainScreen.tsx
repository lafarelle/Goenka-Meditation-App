import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AudioSelectionProvider } from './AudioSelectionProvider';
import { DurationSelector } from './DurationSelector';
import { SegmentSelector } from './SegmentSelector';
import { SessionPreview } from './SessionPreview';

export function MainScreen() {
  return (
    <AudioSelectionProvider>
      <View className="flex-1 bg-stone-50">
        {/* Header with Settings Button - icon at top right */}
        <View className="flex-row items-center px-6 pb-4 pt-16">
          <View className="flex-1" />
          <Link href="/settings" asChild>
            <TouchableOpacity className="items-center p-2">
              <Ionicons name="settings-outline" size={24} color="#57534e" />
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-6 py-6"
          showsVerticalScrollIndicator={false}>
          <Text className="-mt-4 mb-4 text-center text-4xl font-bold text-stone-800">GOENKA</Text>
          <DurationSelector />
          <SegmentSelector />

          <SessionPreview />

          <Link href="/meditation" asChild>
            <Button title="Start Meditation" className="py-4" />
          </Link>
        </ScrollView>
      </View>
    </AudioSelectionProvider>
  );
}
