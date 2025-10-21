// Onboarding-related schemas and types

export type GoenkaFamiliarity = 'goat' | 'heard' | 'not-really' | null;

export interface OnboardingData {
  hasCompletedOnboarding: boolean;
  userName: string | null;
  userCountry: string | null;
  hasAttendedRetreat: boolean | null;
  goenkaFamiliarity: GoenkaFamiliarity;
  wantsGong: boolean | null;
}

export const DEFAULT_ONBOARDING: OnboardingData = {
  hasCompletedOnboarding: false,
  userName: null,
  userCountry: null,
  hasAttendedRetreat: null,
  goenkaFamiliarity: null,
  wantsGong: null,
};
