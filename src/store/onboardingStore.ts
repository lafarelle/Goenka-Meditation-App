import { DEFAULT_ONBOARDING, OnboardingData } from '@/schemas/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingState = {
  onboarding: OnboardingData;
  setUserName: (name: string) => void;
  setHasAttendedRetreat: (hasAttended: boolean) => void;
  setUserLocation: (location: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      onboarding: DEFAULT_ONBOARDING,

      setUserName: (name) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            userName: name,
          },
        })),

      setHasAttendedRetreat: (hasAttended) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasAttendedRetreat: hasAttended,
          },
        })),

      setUserLocation: (location) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            userLocation: location,
          },
        })),

      completeOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasCompletedOnboarding: true,
          },
        })),

      resetOnboarding: () =>
        set({
          onboarding: DEFAULT_ONBOARDING,
        }),
    }),
    {
      name: 'onboarding-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
