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
    <View className="rounded-lg border-4 border-stone-800 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <View className="border-b-4 border-stone-800 bg-red-400 px-5 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded border-2 border-stone-800 bg-red-300">
            <Text className="text-xl">🛠️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
              Developer Tools
            </Text>
            <Text className="text-xs font-bold text-stone-800">For testing purposes only</Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        <TouchableOpacity
          onPress={handleReset}
          disabled={isResetting}
          activeOpacity={0.8}
          className={`border-3 rounded border-red-600 bg-red-100 p-5 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] ${
            isResetting ? 'opacity-50' : ''
          }`}>
          <View className="items-center">
            <View className="mb-2 h-14 w-14 items-center justify-center rounded border-2 border-stone-800 bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Text className="text-3xl">⚠️</Text>
            </View>
            <Text className="text-base font-black uppercase text-red-800">
              {isResetting ? 'Resetting...' : 'Reset All Data'}
            </Text>
            <Text className="mt-1 text-center text-xs font-bold text-red-700">
              Clear history, sessions, and preferences
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
