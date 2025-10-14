import { Container } from '@/components/Container';
import { PreferencesSelector, ResetDataButton } from '@/components/settingsscreen';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function Settings() {
  return (
    <View className="flex-1 bg-amber-50">
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <Container>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 py-6"
          showsVerticalScrollIndicator={false}>
          {/* Retro Header with Back Button */}
          <View className="rounded-lg border-4 border-stone-800 bg-amber-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Pressable
              onPress={() => router.back()}
              className="mb-4 flex-row items-center gap-2 active:opacity-70">
              <View className="rounded border-2 border-stone-800 bg-stone-800 p-1">
                <Ionicons name="arrow-back" size={20} color="#fef3c7" />
              </View>
              <Text className="font-bold text-stone-800">Back</Text>
            </Pressable>

            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
                <Text className="text-2xl">⚙️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-black text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
                  SETTINGS
                </Text>
                <Text className="text-sm font-bold text-stone-700">
                  Customize your meditation experience
                </Text>
              </View>
            </View>
          </View>

          <PreferencesSelector />
          <ResetDataButton />
        </ScrollView>
      </Container>
    </View>
  );
}
