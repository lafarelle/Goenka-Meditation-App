import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { GongSelector } from './GongSelector';
import { PauseDurationSelector } from './PauseDurationSelector';

export function PreferencesSelector() {
  return (
    <View className="rounded-2xl bg-white px-6 py-6">
      {/* Header */}
      <View className="mb-6 flex-row items-center gap-3">
        <Ionicons name="options-outline" size={22} color="#666666" />
        <Text className="text-xl font-medium text-slate-700">Preferences</Text>
      </View>

      <View className="gap-6">
        <GongSelector />
        <PauseDurationSelector />
      </View>
    </View>
  );
}
