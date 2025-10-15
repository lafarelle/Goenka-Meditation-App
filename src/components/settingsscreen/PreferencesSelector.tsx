import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { GongSelector } from './GongSelector';
import { PauseDurationSelector } from './PauseDurationSelector';
import { TimingPreference } from './TimingPreference';

export function PreferencesSelector() {
  return (
    <View className="rounded-lg border-4 border-stone-800 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <View className="border-b-4 border-stone-800 bg-amber-400 px-5 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
            <Ionicons name="options" size={20} color="#292524" />
          </View>
          <Text className="text-xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
            Preferences
          </Text>
        </View>
      </View>

      <View className="p-5">
        <TimingPreference />
        <GongSelector />
        <PauseDurationSelector />
      </View>
    </View>
  );
}
