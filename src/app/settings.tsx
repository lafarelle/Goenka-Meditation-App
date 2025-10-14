import { Container } from '@/components/Container';
import {
  GongSelector,
  PauseDurationSelector,
  ResetDataButton,
  TimingPreferenceSelector,
} from '@/components/settingsscreen';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export default function Settings() {
  return (
    <View className="flex flex-1 bg-stone-50">
      <Stack.Screen options={{ title: 'Settings' }} />
      <Container>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 py-6"
          showsVerticalScrollIndicator={false}>
          <View>
            <Text className="mb-4 text-2xl font-bold text-stone-800">Settings</Text>
          </View>

          <TimingPreferenceSelector />
          <GongSelector />
          <PauseDurationSelector />
          <ResetDataButton />
        </ScrollView>
      </Container>
    </View>
  );
}
