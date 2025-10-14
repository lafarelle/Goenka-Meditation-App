import { Container } from '@/components/Container';
import { PreferencesSelector, ResetDataButton } from '@/components/settingsscreen';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export default function Settings() {
  return (
    <View className="flex flex-1 bg-gradient-to-b from-amber-50 to-stone-50">
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: '#F59E0B',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Container>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 py-6"
          showsVerticalScrollIndicator={false}>
          <View className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 p-6 shadow-lg">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Text className="text-2xl">⚙️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">Settings</Text>
                <Text className="text-sm text-white/90">Customize your meditation experience</Text>
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
