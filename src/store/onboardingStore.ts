import { DEFAULT_ONBOARDING, GoenkaFamiliarity, OnboardingData } from '@/schemas/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingState = {
  onboarding: OnboardingData;
  setUserName: (name: string) => void;
  setUserCountry: (country: string) => void;
  setHasAttendedRetreat: (hasAttended: boolean) => void;
  setGoenkaFamiliarity: (familiarity: GoenkaFamiliarity) => void;
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

      setUserCountry: (country) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            userCountry: country,
          },
        })),

      setHasAttendedRetreat: (hasAttended) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasAttendedRetreat: hasAttended,
          },
        })),

      setGoenkaFamiliarity: (familiarity) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            goenkaFamiliarity: familiarity,
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
