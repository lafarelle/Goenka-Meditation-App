import { usePreferencesStore } from '@/store/preferencesStore';
import { selectionHaptic } from '@/utils/haptics';
import { Pressable, Switch, Text, View } from 'react-native';

export function TimingPreference() {
  const { preferences, setTimingPreference } = usePreferencesStore();
  const isTotalTiming = preferences.timingPreference === 'total';

  return (
    <View>
      <Text className="mb-3 text-sm font-medium tracking-wide" style={{ color: '#333333' }}>
        Timing Mode
      </Text>
      <Pressable
        onPress={() => {
          selectionHaptic();
          setTimingPreference(isTotalTiming ? 'silent' : 'total');
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: '#F5F5EC',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
        className="flex-row items-center justify-between rounded-xl px-6 py-4">
        <Text className="flex-1 text-base font-normal" style={{ color: '#333333' }}>
          {isTotalTiming ? 'Total Session' : 'Silent Only'}
        </Text>
        <Switch
          value={isTotalTiming}
          onValueChange={() => {
            selectionHaptic();
            setTimingPreference(isTotalTiming ? 'silent' : 'total');
          }}
          trackColor={{ false: '#E5E5E5', true: '#E8B84B' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E5E5E5"
        />
      </Pressable>
    </View>
  );
}
