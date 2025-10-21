import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GoenkaFamiliarity } from '@/schemas/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { usePreferencesStore } from '@/store/preferencesStore';

import { AppExplanationScreen } from './AppExplanationScreen';
import { CountrySelector } from './CountrySelector';
import { GoenkaFamiliarityScreen } from './GoenkaFamiliarityScreen';
import { GongPreferenceScreen } from './GongPreferenceScreen';
import { RetreatExperienceScreen } from './RetreatExperienceScreen';
import { WelcomeScreen } from './WelcomeScreen';

type OnboardingStep = 'welcome' | 'country' | 'retreat' | 'familiarity' | 'gong' | 'explanation';

const TOTAL_STEPS = 6;

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userName, setUserName] = useState('');

  const {
    onboarding,
    setUserName: saveUserName,
    setUserCountry,
    setHasAttendedRetreat,
    setGoenkaFamiliarity,
    setWantsGong,
    completeOnboarding,
  } = useOnboardingStore();

  const setGongEnabled = usePreferencesStore((state) => state.setGongEnabled);

  const getCurrentStepNumber = (): number => {
    const stepMap: Record<OnboardingStep, number> = {
      welcome: 1,
      country: 2,
      retreat: 3,
      familiarity: 4,
      gong: 5,
      explanation: 6,
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
    setCurrentStep('gong');
  };

  const handleGongContinue = (wantsGong: boolean) => {
    setWantsGong(wantsGong);
    setCurrentStep('explanation');
  };

  const handleComplete = () => {
    // Apply gong preference to settings
    if (onboarding.wantsGong !== null) {
      setGongEnabled(onboarding.wantsGong);
    }

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

      {currentStep === 'gong' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
          <GongPreferenceScreen
            onContinue={handleGongContinue}
            onBack={() => setCurrentStep('familiarity')}
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
            onBack={() => setCurrentStep('gong')}
            currentStep={getCurrentStepNumber()}
            totalSteps={TOTAL_STEPS}
          />
        </Animated.View>
      )}
    </View>
  );
}
