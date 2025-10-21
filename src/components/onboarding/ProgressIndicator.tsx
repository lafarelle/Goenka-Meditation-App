import React from 'react';
import { View } from 'react-native';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressIndicator({ totalSteps, currentStep }: ProgressIndicatorProps) {
  return (
    <View className="flex-row justify-center gap-2 px-8 py-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className="h-1.5 flex-1 rounded-full"
          style={{
            backgroundColor: index < currentStep ? '#D97706' : '#D6D3D1',
            maxWidth: 40,
          }}
        />
      ))}
    </View>
  );
}
