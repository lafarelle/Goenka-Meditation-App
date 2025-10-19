import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Notification Preferences Store
 * Manages user's notification settings and preferences
 */

export interface NotificationPreferences {
  /**
   * Whether notifications are enabled globally
   */
  enabled: boolean;

  /**
   * Whether daily reminder notifications are enabled
   */
  dailyReminderEnabled: boolean;

  /**
   * Hour of day for daily reminder (0-23)
   */
  dailyReminderHour: number;

  /**
   * Minute of hour for daily reminder (0-59)
   */
  dailyReminderMinute: number;

  /**
   * Whether to show notifications when app is in foreground
   */
  showWhenInForeground: boolean;

  /**
   * Whether sound is enabled for notifications
   */
  soundEnabled: boolean;

  /**
   * Whether badge is enabled for notifications
   */
  badgeEnabled: boolean;

  /**
   * The user's Expo Push Token (for sending notifications from backend)
   */
  expoPushToken: string | null;

  /**
   * IDs of scheduled notifications
   */
  scheduledNotificationIds: string[];

  /**
   * Whether permissions have been requested
   */
  permissionsRequested: boolean;

  /**
   * Whether permissions were granted
   */
  permissionsGranted: boolean;
}

export interface NotificationPreferencesStore extends NotificationPreferences {
  /**
   * Update notification preferences
   */
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;

  /**
   * Reset to default preferences
   */
  resetPreferences: () => void;

  /**
   * Add a scheduled notification ID
   */
  addScheduledNotificationId: (id: string) => void;

  /**
   * Remove a scheduled notification ID
   */
  removeScheduledNotificationId: (id: string) => void;

  /**
   * Clear all scheduled notification IDs
   */
  clearScheduledNotificationIds: () => void;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  dailyReminderEnabled: true,
  dailyReminderHour: 9, // Default to 9 AM
  dailyReminderMinute: 0,
  showWhenInForeground: true,
  soundEnabled: true,
  badgeEnabled: true,
  expoPushToken: null,
  scheduledNotificationIds: [],
  permissionsRequested: false,
  permissionsGranted: false,
};

export const useNotificationPreferencesStore = create<NotificationPreferencesStore>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,

      updatePreferences: (preferences) => {
        set((state) => ({
          ...state,
          ...preferences,
        }));
      },

      resetPreferences: () => {
        set(defaultPreferences);
      },

      addScheduledNotificationId: (id) => {
        set((state) => ({
          scheduledNotificationIds: [...state.scheduledNotificationIds, id],
        }));
      },

      removeScheduledNotificationId: (id) => {
        set((state) => ({
          scheduledNotificationIds: state.scheduledNotificationIds.filter((nId) => nId !== id),
        }));
      },

      clearScheduledNotificationIds: () => {
        set({
          scheduledNotificationIds: [],
        });
      },
    }),
    {
      name: 'notification-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
