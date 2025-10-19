# Push Notifications Setup Guide

## Overview

This guide explains the push notification system that has been set up for the Meditate with Goenka app. The system is designed to send daily meditation reminders to users.

## Architecture

The notification system is organized into the following modules:

```
src/notifications/
├── notificationService.ts          # Core service for notification operations
├── notificationPreferencesStore.ts # Zustand store for user preferences
├── dailyNotificationScheduler.ts   # Logic for scheduling daily reminders
├── useNotificationSetup.ts         # React hook for app initialization
├── index.ts                        # Main exports
└── SETUP_GUIDE.md                 # This file
```

## Components

### 1. Notification Service (`notificationService.ts`)

The core service that handles all notification operations:

- **Permission Management**: `requestNotificationPermissions()` - Requests user permission
- **Token Management**: `getExpoPushToken()` - Gets the device's Expo push token
- **Local Notifications**:
  - `sendLocalNotification()` - Send immediate notifications
  - `scheduleNotification()` - Schedule for a specific time
  - `scheduleRepeatingNotification()` - Schedule daily reminders
- **Cancellation**: `cancelNotification()`, `cancelAllNotifications()`
- **Query**: `getAllScheduledNotifications()` - Get currently scheduled notifications
- **Handlers**: `setDefaultNotificationHandler()` - Configure foreground behavior

### 2. Notification Preferences Store (`notificationPreferencesStore.ts`)

Zustand-based persistent store for user preferences:

```typescript
interface NotificationPreferences {
  enabled: boolean;                    // Global notifications on/off
  dailyReminderEnabled: boolean;       // Daily reminders enabled
  dailyReminderHour: number;           // Hour (0-23)
  dailyReminderMinute: number;         // Minute (0-59)
  showWhenInForeground: boolean;       // Show alerts when app is open
  soundEnabled: boolean;               // Sound notifications
  badgeEnabled: boolean;               // Badge app icon
  expoPushToken: string | null;        // Device push token
  scheduledNotificationIds: string[]; // IDs of scheduled notifications
  permissionsRequested: boolean;       // Has user been asked for permission
  permissionsGranted: boolean;         // Permission status
}
```

### 3. Daily Notification Scheduler (`dailyNotificationScheduler.ts`)

High-level API for managing daily reminders:

- `scheduleDailyReminder()` - Schedule the daily reminder
- `rescheduleDailyReminder()` - Reschedule with new time
- `enableDailyReminders()` - Enable reminders
- `disableDailyReminders()` - Disable reminders
- `updateDailyReminderTime(hour, minute)` - Change reminder time
- `initializeDailyReminders()` - Restore reminders on app launch
- `getFormattedReminderTime()` - Get time as "HH:MM" string
- `getFormattedReminderTime12Hour()` - Get time as "H:MM AM/PM" string

### 4. Notification Setup Hook (`useNotificationSetup.ts`)

React hook that initializes notifications on app startup:

- Requests permissions
- Gets push token
- Sets up notification handlers
- Subscribes to notification interactions
- Restores daily reminders if previously enabled

### 5. UI Component (`NotificationPreferencesCard.tsx`)

Beautiful settings UI component with:

- Toggle for enabling/disabling daily reminders
- Time picker for reminder time
- Visual feedback with Ionicons
- Consistent styling with app design
- Haptic feedback on interactions

## Usage

### In App Initialization

The notifications are automatically initialized in [_layout.tsx](../app/_layout.tsx):

```typescript
import { useNotificationSetup } from '@/notifications';

export default function Layout() {
  useNotificationSetup(); // Initializes notifications on startup
  // ... rest of component
}
```

### In Settings Screen

The notification preferences UI is added to [settings.tsx](../app/settings.tsx):

```typescript
import { NotificationPreferencesCard } from '@/components/settingsscreen';

export default function Settings() {
  return (
    // ...
    <NotificationPreferencesCard />
    // ...
  );
}
```

### Programmatic Usage

Send a manual notification:

```typescript
import { sendLocalNotification } from '@/notifications';

await sendLocalNotification(
  'Time to Meditate',
  'Take a moment to meditate today',
  { custom: 'data' }
);
```

Schedule a custom reminder:

```typescript
import { scheduleNotification } from '@/notifications';

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

await scheduleNotification(
  'Weekly Reminder',
  'Continue your meditation practice',
  nextWeek
);
```

Update reminder time:

```typescript
import { updateDailyReminderTime } from '@/notifications';

// Change reminder to 9:30 AM
await updateDailyReminderTime(9, 30);
```

## Configuration

### App Configuration (app.json)

Permissions have been added for both platforms:

**Android:**
```json
"permissions": [
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.POST_NOTIFICATIONS"
]
```

**iOS:**
```json
"infoPlist": {
  "UIBackgroundModes": ["audio"]
}
```

### Default Settings

Default preferences in `notificationPreferencesStore.ts`:

- **Notifications enabled**: `true`
- **Daily reminders enabled**: `true`
- **Default reminder time**: `9:00 AM`
- **Show when in foreground**: `true`
- **Sound enabled**: `true`
- **Badge enabled**: `true`

## Notification Behavior

### Foreground Notifications

When app is open, notifications will:
- Show alert banner
- Play sound (if enabled)
- Update app badge
- Show in notification list

### Background Notifications

When app is closed, the system handles notifications normally through the OS.

### User Interaction

When a user taps a notification, the app can respond through the notification response handler (currently logs interaction, can be extended for navigation).

## Testing

### Physical Device Required

Notifications only work on physical devices, not emulators/simulators.

### Testing Steps

1. **Build and run on physical device**:
   ```bash
   npx expo run:ios    # or
   npx expo run:android
   ```

2. **Grant notification permissions** when prompted

3. **Go to Settings** and enable daily reminders

4. **Set reminder time** to a time in the next minute for testing

5. **Close and reopen app** - notification should be delivered at the scheduled time

### Manual Test

Send a test notification immediately:

```typescript
import { sendLocalNotification } from '@/notifications';

// In a component or screen
sendLocalNotification('Test', 'This is a test notification');
```

## Platform-Specific Notes

### iOS

- Uses `UNUserNotificationCenter` under the hood
- Requires user to grant notification permission
- Permission request shows system dialog
- Notifications are stored in Notification Center

### Android

- Uses Firebase Cloud Messaging (FCM) through Expo
- Requires `POST_NOTIFICATIONS` permission (Android 13+)
- Permissions handled automatically by Expo
- Notifications appear in system notification tray

## Push Notifications from Backend

To send push notifications from a backend service:

1. **Get the push token** from `useNotificationPreferencesStore.getState().expoPushToken`
2. **Send to backend** through your API
3. **Use Expo Push API** to send notifications:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
    "sound": "default",
    "title": "Hello!",
    "body": "This is a test notification",
    "data": { "withSome": "data" }
  }'
```

Refer to [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/sending-notifications/) for more details.

## Troubleshooting

### Notifications Not Appearing

1. **Check permissions**: Device notification settings may be disabled for the app
2. **Check device**: Notifications only work on physical devices
3. **Check store state**: Verify `dailyReminderEnabled` is `true`
4. **Check time**: Reminder might be scheduled in the past

### Permissions Not Requested

- Permissions are requested automatically on first app launch
- Can manually request: `requestNotificationPermissions()`

### Token Not Available

- Token is only available on physical devices
- May take a few seconds on first app launch
- Check: `useNotificationPreferencesStore.getState().expoPushToken`

## Future Enhancements

Possible improvements:

1. **Multiple reminders** - Allow scheduling multiple reminders per day
2. **Custom messages** - Rotate between different meditation messages
3. **Smart scheduling** - Learn user's meditation habits
4. **Notification analytics** - Track open rates and engagement
5. **Push notifications** - Send from backend server
6. **In-app deep linking** - Navigate to meditation screen on tap
7. **Quiet hours** - Allow users to set do-not-disturb times
8. **Meditation streak notifications** - Celebrate milestones

## Related Files

- [notificationPreferencesCard.tsx](../../components/settingsscreen/NotificationPreferencesCard.tsx) - Settings UI
- [app.json](../../app.json) - App configuration
- [_layout.tsx](../../app/_layout.tsx) - App initialization
- [settings.tsx](../../app/settings.tsx) - Settings screen

## Dependencies

- `expo-notifications` - ~0.32.12
- `expo-device` - ~8.0.9
- `expo-constants` - ~18.0.9
- `zustand` - ^4.5.1
- `@react-native-async-storage/async-storage` - ^2.2.0

## Support

For issues or questions about push notifications:

1. Check Expo documentation: https://docs.expo.dev/push-notifications/
2. Review the inline code comments in the notification modules
3. Check console logs for error messages
