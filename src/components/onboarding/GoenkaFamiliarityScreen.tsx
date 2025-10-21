import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { GoenkaFamiliarity } from '@/schemas/onboarding';
import { lightHaptic } from '@/utils/haptics';

import { ProgressIndicator } from './ProgressIndicator';

interface GoenkaFamiliarityScreenProps {
  onContinue: (familiarity: GoenkaFamiliarity) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function GoenkaFamiliarityScreen({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: GoenkaFamiliarityScreenProps) {
  const handleSelection = (familiarity: GoenkaFamiliarity) => {
    lightHaptic();
    onContinue(familiarity);
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
            Do you know S.N. Goenka?
          </Text>
        </View>

        {/* Options */}
        <View className="gap-3">
          <Pressable
            onPress={() => handleSelection('goat')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#FFFFFF',
              },
            ]}
            className="rounded-xl border border-stone-300 p-5">
            <Text className="text-center text-base font-medium text-stone-800">
              Of course, he is the goat
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelection('heard')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#FFFFFF',
              },
            ]}
            className="rounded-xl border border-stone-300 p-5">
            <Text className="text-center text-base font-medium text-stone-800">
              I have heard of him
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelection('not-really')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#FFFFFF',
              },
            ]}
            className="rounded-xl border border-stone-300 p-5">
            <Text className="text-center text-base font-medium text-stone-800">Not really</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
