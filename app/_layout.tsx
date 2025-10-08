import '../global.css';

import { useThemeStore } from '@/store/store';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();

  const activeTheme = theme === 'system' ? systemColorScheme : theme;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: activeTheme === 'dark' ? '#1f2937' : '#ffffff',
          },
          headerTintColor: activeTheme === 'dark' ? '#ffffff' : '#000000',
          contentStyle: {
            backgroundColor: activeTheme === 'dark' ? '#111827' : '#ffffff',
          },
        }}
      />
    </SafeAreaProvider>
  );
}
