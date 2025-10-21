import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { lightHaptic } from '@/utils/haptics';

import { ProgressIndicator } from './ProgressIndicator';

interface GongPreferenceScreenProps {
  onContinue: (wantsGong: boolean) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function GongPreferenceScreen({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: GongPreferenceScreenProps) {
  const handleSelection = (wantsGong: boolean) => {
    lightHaptic();
    onContinue(wantsGong);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
      {/* Progress Indicator */}
      <View className="pt-12">
        <ProgressIndicator totalSteps={totalSteps} currentStep={currentStep} />
      </View>

      {/* Back Button */}
      <View className="px-8 pb-4">
        <Pressable
          onPress={() => {
            lightHaptic();
            onBack();
          }}
          className="w-10">
          <Ionicons name="arrow-back" size={24} color="#57534E" />
        </Pressable>
      </View>

      <View className="flex-1 justify-center px-8">
        {/* Question */}
        <View className="mb-8">
          <Text className="mb-4 text-center text-3xl font-bold text-stone-800">
            Do you want to hear a gong before each meditation?
          </Text>
          <Text className="text-center text-sm text-stone-500">
            You will be able to change this setting later
          </Text>
        </View>

        {/* Options */}
        <View className="gap-3">
          <Pressable
            onPress={() => handleSelection(true)}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#FFFFFF',
              },
            ]}
            className="rounded-xl border border-stone-300 p-5">
            <Text className="text-center text-base font-medium text-stone-800">Yes</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelection(false)}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#FFFFFF',
              },
            ]}
            className="rounded-xl border border-stone-300 p-5">
            <Text className="text-center text-base font-medium text-stone-800">No</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
