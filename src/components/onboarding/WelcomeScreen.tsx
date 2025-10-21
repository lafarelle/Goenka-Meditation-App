import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { lightHaptic } from '@/utils/haptics';

interface WelcomeScreenProps {
  onContinue: (name: string) => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
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
      <View className="flex-1 justify-center px-8">
        {/* Greeting */}
        <View className="mb-12">
          <Text className="mb-4 text-center text-5xl font-bold text-stone-800">Hi!</Text>
          <Text className="text-center text-xl text-stone-600">
            Welcome to your meditation journey
          </Text>
        </View>

        {/* Name Input */}
        <View className="mb-8">
          <Text className="mb-4 text-center text-lg text-stone-700">What is your first name?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            className="rounded-2xl border-2 border-stone-300 bg-white px-6 py-4 text-center text-lg text-stone-800"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
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
