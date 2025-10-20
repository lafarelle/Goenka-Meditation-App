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
      <View className="flex-row items-center justify-between gap-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: '#F5F5EC' }}>
          <Ionicons
            name={permissionsGranted ? 'notifications-outline' : 'notifications-off-outline'}
            size={24}
            color="#E8B84B"
          />
        </View>
        <Text className="flex-1 text-lg font-semibold" style={{ color: '#333333' }}>
          Notification
        </Text>
        <Switch
          value={notificationsEnabled && permissionsGranted}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: '#E9E9E9', true: '#E8B84B' }}
          thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          disabled={!permissionsGranted}
        />
      </View>
    </View>
  );
};
