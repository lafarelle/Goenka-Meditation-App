import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { GongSelector } from './GongSelector';
import { PauseDurationSelector } from './PauseDurationSelector';

export function PreferencesSelector() {
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
      {/* Header */}
      <View className="px-8 py-6">
        <View className="mb-8 flex-row items-center gap-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#F5F5EC' }}>
            <Ionicons name="options" size={24} color="#E8B84B" />
          </View>
          <Text className="text-2xl font-light tracking-wide" style={{ color: '#333333' }}>
            Preferences
          </Text>
        </View>

        <View className="gap-2">
          <GongSelector />
          <PauseDurationSelector />
        </View>
      </View>
    </View>
  );
}
