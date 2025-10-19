import {
  scheduleRepeatingNotification,
  cancelAllNotifications,
  getAllScheduledNotifications,
} from './notificationService';
import { useNotificationPreferencesStore } from './notificationPreferencesStore';

/**
 * Daily Notification Scheduler
 * Handles scheduling and rescheduling daily meditation reminders
 */

const DAILY_REMINDER_TITLE = 'Time to Meditate';
const DAILY_REMINDER_BODY = 'Take a moment to meditate with Goenka. Your mind and body will thank you.';

/**
 * Schedule the daily meditation reminder
 */
export const scheduleDailyReminder = async (): Promise<string | null> => {
  try {
    const { dailyReminderEnabled, dailyReminderHour, dailyReminderMinute } =
      useNotificationPreferencesStore.getState();

    if (!dailyReminderEnabled) {
      console.log('Daily reminders are disabled');
      return null;
    }

    const notificationId = await scheduleRepeatingNotification(
      DAILY_REMINDER_TITLE,
      DAILY_REMINDER_BODY,
      dailyReminderHour,
      dailyReminderMinute,
      {
        type: 'daily-reminder',
        timestamp: Date.now(),
      }
    );

    if (notificationId) {
      useNotificationPreferencesStore.getState().addScheduledNotificationId(notificationId);
      console.log('Daily reminder scheduled:', notificationId);
    }

    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return null;
  }
};

/**
 * Reschedule daily reminder (used when user changes the time)
 */
export const rescheduleDailyReminder = async (): Promise<string | null> => {
  try {
    // Cancel all scheduled notifications
    await cancelAllNotifications();
    useNotificationPreferencesStore.getState().clearScheduledNotificationIds();

    // Schedule the reminder again with new time
    return await scheduleDailyReminder();
  } catch (error) {
    console.error('Error rescheduling daily reminder:', error);
    return null;
  }
};

/**
 * Enable daily reminders
 */
export const enableDailyReminders = async (): Promise<void> => {
  try {
    useNotificationPreferencesStore.getState().updatePreferences({
      dailyReminderEnabled: true,
    });

    await scheduleDailyReminder();
  } catch (error) {
    console.error('Error enabling daily reminders:', error);
  }
};

/**
 * Disable daily reminders
 */
export const disableDailyReminders = async (): Promise<void> => {
  try {
    useNotificationPreferencesStore.getState().updatePreferences({
      dailyReminderEnabled: false,
    });

    // Cancel all scheduled notifications
    await cancelAllNotifications();
    useNotificationPreferencesStore.getState().clearScheduledNotificationIds();
  } catch (error) {
    console.error('Error disabling daily reminders:', error);
  }
};

/**
 * Update daily reminder time
 */
export const updateDailyReminderTime = async (hour: number, minute: number = 0): Promise<void> => {
  try {
    // Validate hour and minute
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }

    useNotificationPreferencesStore.getState().updatePreferences({
      dailyReminderHour: hour,
      dailyReminderMinute: minute,
    });

    // Reschedule with new time
    await rescheduleDailyReminder();
  } catch (error) {
    console.error('Error updating daily reminder time:', error);
  }
};

/**
 * Initialize daily reminders on app startup
 * Reschedules them if they were previously enabled
 */
export const initializeDailyReminders = async (): Promise<void> => {
  try {
    const { dailyReminderEnabled, permissionsGranted } =
      useNotificationPreferencesStore.getState();

    if (dailyReminderEnabled && permissionsGranted) {
      // Get currently scheduled notifications
      const scheduled = await getAllScheduledNotifications();

      // Only schedule if no daily reminders are already scheduled
      const hasDailyReminder = scheduled.some(
        (notif) => notif.content.data?.type === 'daily-reminder'
      );

      if (!hasDailyReminder) {
        await scheduleDailyReminder();
      }
    }
  } catch (error) {
    console.error('Error initializing daily reminders:', error);
  }
};

/**
 * Get formatted reminder time as human-readable string
 */
export const getFormattedReminderTime = (): string => {
  const { dailyReminderHour, dailyReminderMinute } = useNotificationPreferencesStore.getState();

  const hour = String(dailyReminderHour).padStart(2, '0');
  const minute = String(dailyReminderMinute).padStart(2, '0');

  return `${hour}:${minute}`;
};

/**
 * Get reminder time in 12-hour format
 */
export const getFormattedReminderTime12Hour = (): string => {
  const { dailyReminderHour, dailyReminderMinute } = useNotificationPreferencesStore.getState();

  const isPM = dailyReminderHour >= 12;
  const hour12 = dailyReminderHour % 12 || 12;
  const minute = String(dailyReminderMinute).padStart(2, '0');
  const period = isPM ? 'PM' : 'AM';

  return `${hour12}:${minute} ${period}`;
};
