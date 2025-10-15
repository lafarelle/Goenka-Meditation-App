import { usePreferencesStore } from '@/store/preferencesStore';
import { Pressable, Switch, Text, View } from 'react-native';

export function TimingPreference() {
  const { preferences, setTimingPreference } = usePreferencesStore();
  const isTotalTiming = preferences.timingPreference === 'total';

  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
        Timing Mode
      </Text>
      <Pressable
        onPress={() => setTimingPreference(isTotalTiming ? 'silent' : 'total')}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className="border-3 flex-row items-center justify-between rounded border-amber-500 bg-amber-100 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
        <Text className="flex-1 text-sm font-black uppercase text-amber-900">
          {isTotalTiming ? 'Total Session' : 'Silent Only'}
        </Text>
        <View className="rounded border-2 border-stone-800 bg-amber-300 p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Switch
            value={isTotalTiming}
            onValueChange={() => setTimingPreference(isTotalTiming ? 'silent' : 'total')}
            trackColor={{ false: '#78716c', true: '#F59E0B' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#78716c"
          />
        </View>
      </Pressable>
    </View>
  );
}

