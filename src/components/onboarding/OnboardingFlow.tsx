import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GoenkaFamiliarity } from '@/schemas/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';

import { AppExplanationScreen } from './AppExplanationScreen';
import { CountrySelector } from './CountrySelector';
import { GoenkaFamiliarityScreen } from './GoenkaFamiliarityScreen';
import { RetreatExperienceScreen } from './RetreatExperienceScreen';
import { WelcomeScreen } from './WelcomeScreen';

type OnboardingStep = 'welcome' | 'country' | 'retreat' | 'familiarity' | 'explanation';

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userName, setUserName] = useState('');

  const {
    setUserName: saveUserName,
    setUserCountry,
    setHasAttendedRetreat,
    setGoenkaFamiliarity,
    completeOnboarding,
  } = useOnboardingStore();

  const getCurrentStepNumber = (): number => {
    const stepMap: Record<OnboardingStep, number> = {
      welcome: 1,
      country: 2,
      retreat: 3,
      familiarity: 4,
      explanation: 5,
    };
    return stepMap[currentStep];
  };

  const handleWelcomeContinue = (name: string) => {
    setUserName(name);
    saveUserName(name);
    setCurrentStep('country');
  };

  const handleCountryContinue = (country: string) => {
    setUserCountry(country);
    setCurrentStep('retreat');
  };

  const handleRetreatContinue = (hasAttended: boolean) => {
    setHasAttendedRetreat(hasAttended);
    setCurrentStep('familiarity');
  };

  const handleFamiliarityContinue = (familiarity: GoenkaFamiliarity) => {
    setGoenkaFamiliarity(familiarity);
    setCurrentStep('explanation');
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <View className="flex-1">
      {currentStep === 'welcome' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <WelcomeScreen
            onContinue={handleWelcomeContinue}
            currentStep={getCurrentStepNumber()}
            totalSteps={TOTAL_STEPS}
          />
        </Animated.View>
      )}

      {currentStep === 'country' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <CountrySelector
            onContinue={handleCountryContinue}
            onBack={() => setCurrentStep('welcome')}
            currentStep={getCurrentStepNumber()}
            totalSteps={TOTAL_STEPS}
          />
        </Animated.View>
      )}

      {currentStep === 'retreat' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <RetreatExperienceScreen
            onContinue={handleRetreatContinue}
            onBack={() => setCurrentStep('country')}
            currentStep={getCurrentStepNumber()}
            totalSteps={TOTAL_STEPS}
          />
        </Animated.View>
      )}

      {currentStep === 'familiarity' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <GoenkaFamiliarityScreen
            onContinue={handleFamiliarityContinue}
            onBack={() => setCurrentStep('retreat')}
            currentStep={getCurrentStepNumber()}
            totalSteps={TOTAL_STEPS}
          />
        </Animated.View>
      )}

      {currentStep === 'explanation' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <AppExplanationScreen
            userName={userName}
            onComplete={handleComplete}
            onBack={() => setCurrentStep('familiarity')}
            currentStep={getCurrentStepNumber()}
            totalSteps={TOTAL_STEPS}
          />
        </Animated.View>
      )}
    </View>
  );
}
