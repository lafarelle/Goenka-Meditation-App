/**
 * Notifications Module
 * Centralized exports for all notification-related functionality
 */

export * from './notificationService';
export * from './notificationPreferencesStore';
export * from './dailyNotificationScheduler';
export * from './useNotificationSetup';

// Explicitly export key functions for clarity
export {
  scheduleMeditationReminders,
  enableNotificationReminders,
  disableNotificationReminders,
  initializeNotificationReminders,
} from './dailyNotificationScheduler';
