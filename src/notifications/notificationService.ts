import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Notification Service - Handles all notification-related operations
 * Manages permissions, tokens, and notification lifecycle
 */

/**
 * Check if the app can send notifications (must be on physical device)
 */
export const canSendNotifications = (): boolean => {
  return Device.isDevice;
};

/**
 * Request user permission for notifications
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!canSendNotifications()) {
    console.warn('Notifications are only available on physical devices');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get the Expo Push Token for sending notifications to this device
 * Required for sending notifications from a backend or push service
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    if (!canSendNotifications()) {
      console.warn('Cannot get push token on emulator/simulator');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found in app configuration');
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
};

/**
 * Send a local notification immediately
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string | null> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Send immediately
    });
    return notificationId;
  } catch (error) {
    console.error('Error sending local notification:', error);
    return null;
  }
};

/**
 * Schedule a notification to be sent at a specific time
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, any>
): Promise<string | null> => {
  try {
    const secondsFromNow = Math.max(1, Math.floor((triggerDate.getTime() - Date.now()) / 1000));

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: 'timeInterval',
        seconds: secondsFromNow,
        repeats: false,
      } as any,
    });
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Schedule a repeating notification (e.g., daily reminder)
 * @param title Notification title
 * @param body Notification body
 * @param hour Hour of day (0-23)
 * @param minute Minute of hour (0-59)
 * @param data Optional data to include with notification
 */
export const scheduleRepeatingNotification = async (
  title: string,
  body: string,
  hour: number,
  minute: number = 0,
  data?: Record<string, any>
): Promise<string | null> => {
  try {
    // Calculate seconds until next occurrence
    const now = new Date();
    const nextTriggerDate = new Date();
    nextTriggerDate.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextTriggerDate <= now) {
      nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: 'daily',
        hour,
        minute,
      } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling repeating notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getAllScheduledNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Set the default notification handler behavior
 * Determines what happens when a notification arrives while app is in foreground
 */
export const setDefaultNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Subscribe to notification received events
 */
export const subscribeToNotificationReceived = (
  callback: (notification: Notifications.Notification) => void
): (() => void) => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    callback(response.notification);
  }).remove;
};

/**
 * Subscribe to notification response events (when user interacts with notification)
 */
export const subscribeToNotificationResponse = (
  callback: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  return Notifications.addNotificationResponseReceivedListener(callback).remove;
};
