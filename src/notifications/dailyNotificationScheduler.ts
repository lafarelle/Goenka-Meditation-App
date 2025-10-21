import { scheduleNotification, cancelAllNotifications } from './notificationService';
import { useNotificationPreferencesStore } from './notificationPreferencesStore';

/**
 * Meditation-Based Notification Scheduler
 * Schedules notifications 16h and 22h after last meditation
 */

const FIRST_REMINDER_TITLE = 'Time to Meditate';
const FIRST_REMINDER_BODY =
  'It has been 16 hours since your last meditation. Take a moment to meditate with Goenka.';
const SECOND_REMINDER_TITLE = 'Meditation Reminder';
const SECOND_REMINDER_BODY = "Don't forget to meditate today. Your mind and body will thank you.";

const FIRST_REMINDER_HOURS = 16;
const SECOND_REMINDER_HOURS = 22;

/**
 * Schedule notifications after meditation completion
 * Called when a meditation session is completed
 */
export const scheduleMeditationReminders = async (): Promise<void> => {
  try {
    const { notificationsEnabled, permissionsGranted } = useNotificationPreferencesStore.getState();

    if (!notificationsEnabled || !permissionsGranted) {
      console.log('Notifications are disabled or permissions not granted');
      return;
    }

    // Cancel any existing scheduled notifications
    await cancelAllNotifications();
    useNotificationPreferencesStore.getState().clearScheduledNotificationIds();

    const now = Date.now();

    // Update last meditation timestamp
    useNotificationPreferencesStore.getState().updatePreferences({
      lastMeditationTimestamp: now,
    });

    // Schedule first reminder (16 hours from now)
    const firstReminderDate = new Date(now + FIRST_REMINDER_HOURS * 60 * 60 * 1000);
    const firstNotificationId = await scheduleNotification(
      FIRST_REMINDER_TITLE,
      FIRST_REMINDER_BODY,
      firstReminderDate,
      {
        type: 'first-reminder',
        scheduledAt: now,
      }
    );

    if (firstNotificationId) {
      useNotificationPreferencesStore.getState().addScheduledNotificationId(firstNotificationId);
      console.log('First reminder scheduled for:', firstReminderDate);
    }

    // Schedule second reminder (22 hours from now)
    const secondReminderDate = new Date(now + SECOND_REMINDER_HOURS * 60 * 60 * 1000);
    const secondNotificationId = await scheduleNotification(
      SECOND_REMINDER_TITLE,
      SECOND_REMINDER_BODY,
      secondReminderDate,
      {
        type: 'second-reminder',
        scheduledAt: now,
      }
    );

    if (secondNotificationId) {
      useNotificationPreferencesStore.getState().addScheduledNotificationId(secondNotificationId);
      console.log('Second reminder scheduled for:', secondReminderDate);
    }
  } catch (error) {
    console.error('Error scheduling meditation reminders:', error);
  }
};

/**
 * Enable notification reminders
 */
export const enableNotificationReminders = async (): Promise<void> => {
  try {
    useNotificationPreferencesStore.getState().updatePreferences({
      notificationsEnabled: true,
    });

    // Reschedule notifications based on last meditation if available
    const { lastMeditationTimestamp } = useNotificationPreferencesStore.getState();
    if (lastMeditationTimestamp) {
      await scheduleMeditationReminders();
    }
  } catch (error) {
    console.error('Error enabling notification reminders:', error);
  }
};

/**
 * Disable notification reminders
 */
export const disableNotificationReminders = async (): Promise<void> => {
  try {
    useNotificationPreferencesStore.getState().updatePreferences({
      notificationsEnabled: false,
    });

    // Cancel all scheduled notifications
    await cancelAllNotifications();
    useNotificationPreferencesStore.getState().clearScheduledNotificationIds();
  } catch (error) {
    console.error('Error disabling notification reminders:', error);
  }
};

/**
 * Initialize notification reminders on app startup
 * Reschedules them based on last meditation time if needed
 */
export const initializeNotificationReminders = async (): Promise<void> => {
  try {
    const { notificationsEnabled, permissionsGranted, lastMeditationTimestamp } =
      useNotificationPreferencesStore.getState();

    if (!notificationsEnabled || !permissionsGranted || !lastMeditationTimestamp) {
      return;
    }

    const now = Date.now();
    const hoursSinceLastMeditation = (now - lastMeditationTimestamp) / (1000 * 60 * 60);

    // If it's been less than 16 hours since last meditation, reschedule notifications
    if (hoursSinceLastMeditation < FIRST_REMINDER_HOURS) {
      await scheduleMeditationReminders();
    }
  } catch (error) {
    console.error('Error initializing notification reminders:', error);
  }
};
