import { useHistoryStore } from '@/store/historyStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { useStore } from '@/store/store';
import { heavyHaptic, warningHaptic } from '@/utils/haptics';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export function ResetDataButton() {
  const [isResetting, setIsResetting] = useState(false);

  const resetPreferences = usePreferencesStore((state) => state.resetPreferences);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const clearAllSessions = useSavedSessionsStore((state) => state.clearAllSessions);
  const resetSession = useSessionStore((state) => state.resetSession);
  const removeAllBears = useStore((state) => state.removeAllBears);

  const handleReset = () => {
    warningHaptic();
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
            heavyHaptic();
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
    <View
      className="rounded-2xl bg-white"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}>
      <Pressable
        onPress={handleReset}
        disabled={isResetting}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : isResetting ? 0.5 : 1,
            backgroundColor: '#FEE2E2',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
        className="rounded-xl px-8 py-6">
        <View className="items-center">
          <Text className="text-lg font-medium" style={{ color: '#DC2626' }}>
            {isResetting ? 'Resetting...' : 'Reset All Data'}
          </Text>
          <Text className="mt-2 text-center text-sm font-normal" style={{ color: '#991B1B' }}>
            Clear history, sessions, and preferences
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
