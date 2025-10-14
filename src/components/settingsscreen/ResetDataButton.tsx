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
              Alert.alert('Success', 'All data has been reset successfully.', [{ text: 'OK' }]);
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset some data. Please try again.', [
                { text: 'OK' },
              ]);
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-md">
      <View className="border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <Text className="text-lg">🛠️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-stone-800">Developer Tools</Text>
            <Text className="text-xs text-stone-600">For testing purposes only</Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        <TouchableOpacity
          onPress={handleReset}
          disabled={isResetting}
          activeOpacity={0.8}
          className={`overflow-hidden rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm ${
            isResetting ? 'opacity-50' : ''
          }`}>
          <View className="items-center">
            <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Text className="text-2xl">⚠️</Text>
            </View>
            <Text className="text-base font-bold text-red-700">
              {isResetting ? 'Resetting...' : 'Reset All Data'}
            </Text>
            <Text className="mt-1 text-center text-xs text-red-600">
              Clear history, sessions, and preferences
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
