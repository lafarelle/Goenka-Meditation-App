import { Container } from '@/components/Container';
import { useThemeStore, type Theme } from '@/store/store';
import { Stack } from 'expo-router';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function Settings() {
  const systemColorScheme = useColorScheme();
  const { theme, setTheme } = useThemeStore();

  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <View className={isDark ? 'flex flex-1 bg-gray-900' : 'flex flex-1 bg-white'}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <Container>
        <View className="flex gap-6">
          <View>
            <Text
              className={
                isDark
                  ? 'mb-4 text-2xl font-bold text-white'
                  : 'mb-4 text-2xl font-bold text-gray-900'
              }>
              Settings
            </Text>
          </View>

          <View>
            <Text
              className={
                isDark
                  ? 'mb-3 text-lg font-semibold text-white'
                  : 'mb-3 text-lg font-semibold text-gray-900'
              }>
              Appearance
            </Text>
            <View className="flex gap-3">
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setTheme(option.value)}
                  className={`
                    flex flex-row items-center justify-between rounded-lg border-2 p-4
                    ${
                      theme === option.value
                        ? isDark
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-blue-500 bg-blue-50'
                        : isDark
                          ? 'border-gray-700 bg-gray-800'
                          : 'border-gray-200 bg-gray-50'
                    }
                  `}>
                  <View className="flex flex-row items-center gap-3">
                    <View
                      className={`
                        h-5 w-5 rounded-full border-2
                        ${
                          theme === option.value
                            ? 'border-blue-500 bg-blue-500'
                            : isDark
                              ? 'border-gray-600'
                              : 'border-gray-300'
                        }
                      `}>
                      {theme === option.value && (
                        <View className="flex-1 items-center justify-center">
                          <View className="h-2 w-2 rounded-full bg-white" />
                        </View>
                      )}
                    </View>
                    <Text className={isDark ? 'text-base text-white' : 'text-base text-gray-900'}>
                      {option.label}
                    </Text>
                  </View>
                  {option.value === 'system' && (
                    <Text className={isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-500'}>
                      ({systemColorScheme})
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className={isDark ? 'rounded-lg bg-gray-800 p-4' : 'rounded-lg bg-gray-50 p-4'}>
            <Text className={isDark ? 'text-sm text-gray-300' : 'text-sm text-gray-600'}>
              Current theme: <Text className="font-semibold">{theme}</Text>
            </Text>
            <Text className={isDark ? 'mt-1 text-sm text-gray-300' : 'mt-1 text-sm text-gray-600'}>
              Active appearance: <Text className="font-semibold">{activeTheme}</Text>
            </Text>
          </View>
        </View>
      </Container>
    </View>
  );
}
