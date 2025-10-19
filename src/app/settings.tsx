import { Container } from '@/components/Container';
import {
  GoenkaButton,
  NotificationPreferencesCard,
  PreferencesSelector,
  ResetDataButton,
  SupportUsButton,
} from '@/components/settingsscreen';
import { lightHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

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

          <PreferencesSelector />
          <NotificationPreferencesCard />
          <GoenkaButton />
          <SupportUsButton />
          <ResetDataButton />
        </ScrollView>
      </Container>
    </View>
  );
}
