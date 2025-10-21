import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useOnboardingStore } from '@/store/onboardingStore';

import { AppExplanationScreen } from './AppExplanationScreen';
import { LocationScreen } from './LocationScreen';
import { RetreatExperienceScreen } from './RetreatExperienceScreen';
import { WelcomeScreen } from './WelcomeScreen';

type OnboardingStep = 'welcome' | 'retreat' | 'location' | 'explanation';

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userName, setUserName] = useState('');

  const { setUserName: saveUserName, setHasAttendedRetreat, setUserLocation, completeOnboarding } =
    useOnboardingStore();

  const handleWelcomeContinue = (name: string) => {
    setUserName(name);
    saveUserName(name);
    setCurrentStep('retreat');
  };

  const handleRetreatContinue = (hasAttended: boolean) => {
    setHasAttendedRetreat(hasAttended);
    setCurrentStep('location');
  };

  const handleLocationContinue = (location: string) => {
    setUserLocation(location);
    setCurrentStep('explanation');
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <View className="flex-1">
      {currentStep === 'welcome' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <WelcomeScreen onContinue={handleWelcomeContinue} />
        </Animated.View>
      )}

      {currentStep === 'retreat' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <RetreatExperienceScreen userName={userName} onContinue={handleRetreatContinue} />
        </Animated.View>
      )}

      {currentStep === 'location' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <LocationScreen userName={userName} onContinue={handleLocationContinue} />
        </Animated.View>
      )}

      {currentStep === 'explanation' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <AppExplanationScreen userName={userName} onComplete={handleComplete} />
        </Animated.View>
      )}
    </View>
  );
}
