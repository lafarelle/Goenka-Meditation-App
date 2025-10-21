import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { lightHaptic } from '@/utils/haptics';

interface AppExplanationScreenProps {
  userName: string;
  onComplete: () => void;
}

export function AppExplanationScreen({ userName, onComplete }: AppExplanationScreenProps) {
  const handleGetStarted = () => {
    lightHaptic();
    onComplete();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
      <ScrollView className="flex-1" contentContainerClassName="px-8 py-16">
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-4 text-center text-4xl font-bold text-stone-800">
            Welcome, {userName}!
          </Text>
          <Text className="text-center text-xl text-stone-600">Here's what this app is about</Text>
        </View>

        {/* Feature Cards */}
        <View className="mb-8 gap-6">
          {/* Feature 1 */}
          <View
            className="rounded-2xl bg-white p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View
                className="mr-4 items-center justify-center rounded-full"
                style={{ backgroundColor: '#FCD34D', width: 48, height: 48 }}>
                <Ionicons name="musical-notes" size={24} color="#78350F" />
              </View>
              <Text className="flex-1 text-xl font-bold text-stone-800">
                Goenka's Audio Teachings
              </Text>
            </View>
            <Text className="text-base text-stone-600">
              Meditate with authentic audio instructions from S.N. Goenka, guiding you through
              Anapana and Vipassana meditation techniques.
            </Text>
          </View>

          {/* Feature 2 */}
          <View
            className="rounded-2xl bg-white p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View
                className="mr-4 items-center justify-center rounded-full"
                style={{ backgroundColor: '#FCD34D', width: 48, height: 48 }}>
                <Ionicons name="time-outline" size={24} color="#78350F" />
              </View>
              <Text className="flex-1 text-xl font-bold text-stone-800">
                Customize Your Sessions
              </Text>
            </View>
            <Text className="text-base text-stone-600">
              Choose your meditation duration, select opening and closing chants, add guidance, and
              personalize your practice to fit your needs.
            </Text>
          </View>

          {/* Feature 3 */}
          <View
            className="rounded-2xl bg-white p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View
                className="mr-4 items-center justify-center rounded-full"
                style={{ backgroundColor: '#FCD34D', width: 48, height: 48 }}>
                <Ionicons name="heart-outline" size={24} color="#78350F" />
              </View>
              <Text className="flex-1 text-xl font-bold text-stone-800">Practice Daily</Text>
            </View>
            <Text className="text-base text-stone-600">
              Build a consistent meditation practice with reminders, track your history, and save
              your favorite sessions for easy access.
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <Button title="Get Started" onPress={handleGetStarted} />
      </ScrollView>
    </View>
  );
}
