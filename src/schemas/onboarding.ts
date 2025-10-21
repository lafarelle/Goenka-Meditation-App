// Onboarding-related schemas and types

export interface OnboardingData {
  hasCompletedOnboarding: boolean;
  userName: string | null;
  hasAttendedRetreat: boolean | null; // true = yes, false = no, null = not answered
  userLocation: string | null; // Country or location
}

export const DEFAULT_ONBOARDING: OnboardingData = {
  hasCompletedOnboarding: false,
  userName: null,
  hasAttendedRetreat: null,
  userLocation: null,
};
