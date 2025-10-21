import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { lightHaptic } from '@/utils/haptics';

interface RetreatExperienceScreenProps {
  userName: string;
  onContinue: (hasAttended: boolean) => void;
}

export function RetreatExperienceScreen({ userName, onContinue }: RetreatExperienceScreenProps) {
  const handleSelection = (hasAttended: boolean) => {
    lightHaptic();
    onContinue(hasAttended);
  };

  return (
    <View className="flex-1 justify-center px-8" style={{ backgroundColor: '#F5F5EC' }}>
      {/* Question */}
      <View className="mb-12">
        <Text className="mb-6 text-center text-3xl font-bold text-stone-800">
          Nice to meet you, {userName}!
        </Text>
        <Text className="text-center text-xl text-stone-700">
          Have you attended an Anapana or Vipassana retreat with the Dhamma organisation?
        </Text>
      </View>

      {/* Options */}
      <View className="gap-4">
        <Pressable
          onPress={() => handleSelection(true)}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              backgroundColor: pressed ? '#E8B84B' : '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
          ]}
          className="rounded-2xl p-6">
          <Text className="text-center text-lg font-semibold text-stone-800">
            Yes, I have attended a retreat
          </Text>
          <Text className="mt-2 text-center text-sm text-stone-600">
            I've experienced Goenka's teachings firsthand
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleSelection(false)}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              backgroundColor: pressed ? '#E8B84B' : '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
          ]}
          className="rounded-2xl p-6">
          <Text className="text-center text-lg font-semibold text-stone-800">
            No, not yet
          </Text>
          <Text className="mt-2 text-center text-sm text-stone-600">
            I'm new to Vipassana meditation
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
