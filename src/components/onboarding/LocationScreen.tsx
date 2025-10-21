import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { lightHaptic } from '@/utils/haptics';

interface LocationScreenProps {
  userName: string;
  onContinue: (location: string) => void;
}

export function LocationScreen({ userName, onContinue }: LocationScreenProps) {
  const [location, setLocation] = useState('');

  const handleContinue = () => {
    if (location.trim()) {
      lightHaptic();
      onContinue(location.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: '#F5F5EC' }}>
      <View className="flex-1 justify-center px-8">
        {/* Question */}
        <View className="mb-12">
          <Text className="mb-4 text-center text-3xl font-bold text-stone-800">
            Where are you from, {userName}?
          </Text>
          <Text className="text-center text-lg text-stone-600">
            This helps us understand our global meditation community
          </Text>
        </View>

        {/* Location Input */}
        <View className="mb-8">
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., France, India, USA..."
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
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!location.trim()}
          className={location.trim() ? '' : 'opacity-50'}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
