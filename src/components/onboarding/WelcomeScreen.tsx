import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { lightHaptic } from '@/utils/haptics';

import { ProgressIndicator } from './ProgressIndicator';

interface WelcomeScreenProps {
  onContinue: (name: string) => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
}

export function WelcomeScreen({ onContinue, onBack, currentStep, totalSteps }: WelcomeScreenProps) {
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      lightHaptic();
      onContinue(name.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: '#F5F5EC' }}>
      {/* Progress Indicator */}
      <View className="pt-12">
        <ProgressIndicator totalSteps={totalSteps} currentStep={currentStep} />
      </View>

      {/* Back Button */}
      {onBack && (
        <View className="px-8">
          <Pressable
            onPress={() => {
              lightHaptic();
              onBack();
            }}
            className="w-10">
            <Ionicons name="arrow-back" size={24} color="#57534E" />
          </Pressable>
        </View>
      )}

      <View className="flex-1 justify-center px-8">
        {/* Greeting */}
        <View className="mb-12">
          <Text className="mb-4 text-center text-5xl font-bold text-stone-800">Hi!</Text>
          <Text className="text-center text-lg text-stone-600">What is your first name?</Text>
        </View>

        {/* Name Input */}
        <View className="mb-8">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#A8A29E"
            className="rounded-xl border border-stone-300 bg-white px-6 py-4 text-center text-lg text-stone-800"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={handleContinue}
          />
        </View>

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!name.trim()}
          className={name.trim() ? '' : 'opacity-50'}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
