import {
  disableNotificationReminders,
  enableNotificationReminders,
  useNotificationPreferencesStore,
} from '@/notifications';
import { lightHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { Switch, Text, View } from 'react-native';

/**
 * Notification Preferences Card Component
 * Allows users to enable/disable meditation reminders
 */
export const NotificationPreferencesCard = () => {
  const { notificationsEnabled, permissionsGranted } = useNotificationPreferencesStore();

  const handleToggleNotifications = async (enabled: boolean) => {
    lightHaptic();
    if (enabled) {
      await enableNotificationReminders();
    } else {
      await disableNotificationReminders();
    }
  };

  if (!permissionsGranted) {
    return (
      <View
        className="rounded-2xl bg-white px-8 py-8"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <View className="flex-row items-start gap-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#F5F5EC' }}>
            <Ionicons name="notifications-off-outline" size={24} color="#E8B84B" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: '#333333' }}>
              Notifications
            </Text>
            <Text className="mt-2 text-sm" style={{ color: '#666666' }}>
              Enable notifications in your system settings to receive meditation reminders.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl bg-white px-8 py-8"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#F5F5EC' }}>
            <Ionicons name="notifications-outline" size={24} color="#E8B84B" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-lg font-semibold" style={{ color: '#333333' }}>
              Meditation Reminders
            </Text>
            <Text className="mt-1 text-xs" style={{ color: '#666666' }}>
              Get reminded 16h after your last meditation
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: '#E8E8E8', true: '#E8B84B' }}
          thumbColor={notificationsEnabled ? '#E8B84B' : '#C0C0C0'}
        />
      </View>
    </View>
  );
};
