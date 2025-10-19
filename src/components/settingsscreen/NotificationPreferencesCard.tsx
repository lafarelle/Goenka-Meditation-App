import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useNotificationPreferencesStore,
  enableDailyReminders,
  disableDailyReminders,
  updateDailyReminderTime,
  getFormattedReminderTime12Hour,
} from '@/notifications';
import { lightHaptic } from '@/utils/haptics';

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  currentHour: number;
  currentMinute: number;
  onTimeChange: (hour: number, minute: number) => void;
}

/**
 * Simple Time Picker Component
 */
const TimePicker = ({ visible, onClose, currentHour, currentMinute, onTimeChange }: TimePickerProps) => {
  const [selectedHour, setSelectedHour] = useState(currentHour);
  const [selectedMinute, setSelectedMinute] = useState(currentMinute);

  if (!visible) return null;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}>
      <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
        <Text className="text-lg font-semibold" style={{ color: '#333333' }}>
          Select Time
        </Text>
        <Pressable onPress={onClose}>
          <Ionicons name="close" size={24} color="#333333" />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-center gap-4 py-8">
        {/* Hour Picker */}
        <View className="items-center">
          <Text className="mb-2 text-xs font-semibold" style={{ color: '#666666' }}>
            Hour
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            className="h-40 w-16 rounded-lg"
            style={{ backgroundColor: '#F5F5EC' }}>
            {hours.map((hour) => (
              <Pressable
                key={hour}
                onPress={() => {
                  lightHaptic();
                  setSelectedHour(hour);
                }}
                className="items-center justify-center py-2">
                <Text
                  className={`text-lg font-semibold ${hour === selectedHour ? 'text-xl' : ''}`}
                  style={{
                    color: hour === selectedHour ? '#E8B84B' : '#666666',
                  }}>
                  {String(hour).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Minute Picker */}
        <View className="items-center">
          <Text className="mb-2 text-xs font-semibold" style={{ color: '#666666' }}>
            Minute
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            className="h-40 w-16 rounded-lg"
            style={{ backgroundColor: '#F5F5EC' }}>
            {minutes.map((minute) => (
              <Pressable
                key={minute}
                onPress={() => {
                  lightHaptic();
                  setSelectedMinute(minute);
                }}
                className="items-center justify-center py-2">
                <Text
                  className={`text-lg font-semibold ${minute === selectedMinute ? 'text-xl' : ''}`}
                  style={{
                    color: minute === selectedMinute ? '#E8B84B' : '#666666',
                  }}>
                  {String(minute).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View className="flex-row gap-3 border-t border-gray-200 px-6 py-4">
        <Pressable
          onPress={onClose}
          className="flex-1 rounded-lg py-3"
          style={{ backgroundColor: '#F5F5EC' }}>
          <Text className="text-center font-semibold" style={{ color: '#666666' }}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            lightHaptic();
            onTimeChange(selectedHour, selectedMinute);
            onClose();
          }}
          className="flex-1 rounded-lg py-3"
          style={{ backgroundColor: '#E8B84B' }}>
          <Text className="text-center font-semibold" style={{ color: '#333333' }}>
            Confirm
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

/**
 * Notification Preferences Card Component
 * Allows users to enable/disable daily reminders and configure reminder time
 */
export const NotificationPreferencesCard = () => {
  const {
    dailyReminderEnabled,
    dailyReminderHour,
    dailyReminderMinute,
    permissionsGranted,
  } = useNotificationPreferencesStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    setFormattedTime(getFormattedReminderTime12Hour());
  }, [dailyReminderHour, dailyReminderMinute]);

  const handleToggleDailyReminders = async (enabled: boolean) => {
    lightHaptic();
    if (enabled) {
      await enableDailyReminders();
    } else {
      await disableDailyReminders();
    }
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    lightHaptic();
    await updateDailyReminderTime(hour, minute);
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
              Enable notifications in your system settings to receive daily meditation reminders.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
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
            <View>
              <Text className="text-lg font-semibold" style={{ color: '#333333' }}>
                Daily Reminders
              </Text>
              <Text className="mt-1 text-xs" style={{ color: '#666666' }}>
                Get reminded to meditate each day
              </Text>
            </View>
          </View>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={handleToggleDailyReminders}
            trackColor={{ false: '#E8E8E8', true: '#E8B84B' }}
            thumbColor={dailyReminderEnabled ? '#E8B84B' : '#C0C0C0'}
          />
        </View>

        {dailyReminderEnabled && (
          <Pressable
            onPress={() => {
              lightHaptic();
              setShowTimePicker(true);
            }}
            className="mt-6 flex-row items-center justify-between rounded-lg py-3"
            style={{ backgroundColor: '#F5F5EC' }}>
            <View className="flex-row items-center gap-3 px-4">
              <Ionicons name="time-outline" size={20} color="#E8B84B" />
              <View>
                <Text className="text-xs" style={{ color: '#666666' }}>
                  Reminder Time
                </Text>
                <Text className="text-sm font-semibold" style={{ color: '#333333' }}>
                  {formattedTime}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#E8B84B" style={{ marginRight: 16 }} />
          </Pressable>
        )}
      </View>

      <TimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        currentHour={dailyReminderHour}
        currentMinute={dailyReminderMinute}
        onTimeChange={handleTimeChange}
      />
    </>
  );
};
