import { Container } from '@/components/Container';
import { PreferencesSelector, ResetDataButton, SupportUsButton } from '@/components/settingsscreen';
import { lightHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function Settings() {
  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <Container>
        <ScrollView
          className="flex-1 "
          contentContainerClassName="gap-8 py-4"
          showsVerticalScrollIndicator={false}>
          {/* Back button in its own card */}
          <View
            className="rounded-2xl px-2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Pressable
              onPress={() => {
                lightHaptic();
                router.back();
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="flex-row items-center gap-3">
              <View className="rounded-xl p-2" style={{ backgroundColor: '#E8B84B' }}>
                <Ionicons name="arrow-back" size={20} color="#333333" />
              </View>
            </Pressable>
          </View>

          {/* Settings header in its own card */}
          <View
            className="rounded-2xl bg-white px-8 py-8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="flex-row items-center gap-4">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: '#F5F5EC' }}>
                <Ionicons name="settings-outline" size={28} color="#E8B84B" />
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-light tracking-wide" style={{ color: '#333333' }}>
                  Settings
                </Text>
                <Text className="mt-1 text-sm font-normal" style={{ color: '#666666' }}>
                  Customize your meditation experience
                </Text>
              </View>
            </View>
          </View>

          <PreferencesSelector />
          <SupportUsButton />
          <ResetDataButton />
        </ScrollView>
      </Container>
    </View>
  );
}
