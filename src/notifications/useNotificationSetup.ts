import { useEffect } from 'react';
import {
  requestNotificationPermissions,
  getExpoPushToken,
  setDefaultNotificationHandler,
  subscribeToNotificationResponse,
} from './notificationService';
import { useNotificationPreferencesStore } from './notificationPreferencesStore';
import { initializeDailyReminders } from './dailyNotificationScheduler';

/**
 * Hook to set up notifications on app startup
 * Requests permissions, gets push token, and initializes notification handlers
 */
export const useNotificationSetup = (): void => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Set the default notification handler
        setDefaultNotificationHandler();

        // Request permissions
        const permissionsGranted = await requestNotificationPermissions();

        if (permissionsGranted) {
          // Get the push token
          const token = await getExpoPushToken();

          // Update store with permissions and token
          useNotificationPreferencesStore.getState().updatePreferences({
            permissionsGranted: true,
            permissionsRequested: true,
            expoPushToken: token,
          });

          // Initialize daily reminders if they were enabled
          await initializeDailyReminders();

          console.log('Push token:', token);
        } else {
          useNotificationPreferencesStore.getState().updatePreferences({
            permissionsGranted: false,
            permissionsRequested: true,
          });
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Subscribe to notification responses (when user taps a notification)
    const unsubscribe = subscribeToNotificationResponse((response) => {
      const { notification } = response;
      const data = notification.request.content.data;

      console.log('User interacted with notification:', data);

      // You can navigate to specific screens based on notification data here
      // For example:
      // if (data.type === 'daily-reminder') {
      //   // Navigate to meditation screen
      // }
    });

    return () => {
      unsubscribe();
    };
  }, []);
};
