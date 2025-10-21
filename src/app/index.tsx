import { MainScreen } from '@/components/mainscreen/MainScreen';
import { OnboardingFlow } from '@/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  const { onboarding } = useOnboardingStore();

  return (
    <View className="flex flex-1 bg-gray-900">
      <Stack.Screen options={{ title: 'Goenka Meditation', headerShown: false }} />
      {onboarding.hasCompletedOnboarding ? <MainScreen /> : <OnboardingFlow />}
    </View>
  );
}
