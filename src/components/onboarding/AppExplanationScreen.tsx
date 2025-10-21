import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { lightHaptic } from '@/utils/haptics';

import { ProgressIndicator } from './ProgressIndicator';

interface AppExplanationScreenProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function AppExplanationScreen({
  userName,
  onComplete,
  onBack,
  currentStep,
  totalSteps,
}: AppExplanationScreenProps) {
  const handleGetStarted = () => {
    lightHaptic();
    onComplete();
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
        {/* Header */}
        <View className="mb-12">
          <Text className="mb-4 text-center text-4xl font-bold text-stone-800">
            Welcome, {userName}!
          </Text>
        </View>

        {/* Simple Explanation */}
        <View className="mb-12">
          <Text className="mb-6 text-center text-lg leading-7 text-stone-700">
            This app helps you meditate with the authentic audio teachings of S.N. Goenka.
          </Text>
          <Text className="text-center text-lg leading-7 text-stone-700">
            Practice consistently and deepen your Vipassana meditation journey.
          </Text>
        </View>

        {/* Get Started Button */}
        <Button title="Get Started" onPress={handleGetStarted} />
      </View>
    </View>
  );
}
