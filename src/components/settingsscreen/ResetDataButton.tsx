import { useHistoryStore } from '@/store/historyStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { useStore } from '@/store/store';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export function ResetDataButton() {
  const [isResetting, setIsResetting] = useState(false);

  const resetPreferences = usePreferencesStore((state) => state.resetPreferences);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const clearAllSessions = useSavedSessionsStore((state) => state.clearAllSessions);
  const resetSession = useSessionStore((state) => state.resetSession);
  const removeAllBears = useStore((state) => state.removeAllBears);

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your meditation history, saved sessions, and reset all preferences. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              // Reset all stores
              resetPreferences();
              clearHistory();
              clearAllSessions();
              resetSession();
              removeAllBears();

              // Show success message
              Alert.alert(
                'Success',
                'All data has been reset successfully.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert(
                'Error',
                'Failed to reset some data. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-2 text-lg font-medium text-gray-800">Developer Tools</Text>
      <Text className="mb-4 text-sm text-gray-600">
        For testing purposes only
      </Text>

      <TouchableOpacity
        onPress={handleReset}
        disabled={isResetting}
        activeOpacity={0.8}
        className={`rounded-lg border border-red-300 bg-red-50 p-4 ${
          isResetting ? 'opacity-50' : ''
        }`}>
        <View className="items-center">
          <Text className="text-base font-semibold text-red-700">
            {isResetting ? 'Resetting...' : 'Reset All Data'}
          </Text>
          <Text className="mt-1 text-xs text-red-600">
            Clear history, sessions, and preferences
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

