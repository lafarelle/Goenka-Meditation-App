import { PauseDuration } from '@/schemas/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';
import { Pressable, Text, View } from 'react-native';

interface PauseOption {
  value: PauseDuration;
  label: string;
}

const PAUSE_OPTIONS: PauseOption[] = [
  { value: 0, label: 'None' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
];

export function PauseDurationSelector() {
  const { preferences, setPauseDuration } = usePreferencesStore();

  return (
    <View>
      <Text className="mb-2 text-xs font-black uppercase tracking-wider text-stone-800">
        Pause Between Segments
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <PauseOption value={0} label="None" isSelected={preferences.pauseDuration === 0} onPress={() => setPauseDuration(0)} />
        <PauseOption value={1} label="1s" isSelected={preferences.pauseDuration === 1} onPress={() => setPauseDuration(1)} />
        <PauseOption value={2} label="2s" isSelected={preferences.pauseDuration === 2} onPress={() => setPauseDuration(2)} />
        <PauseOption value={3} label="3s" isSelected={preferences.pauseDuration === 3} onPress={() => setPauseDuration(3)} />
        <PauseOption value={5} label="5s" isSelected={preferences.pauseDuration === 5} onPress={() => setPauseDuration(5)} />
        <PauseOption value={10} label="10s" isSelected={preferences.pauseDuration === 10} onPress={() => setPauseDuration(10)} />
      </View>
    </View>
  );
}

interface PauseOptionProps {
  value: PauseDuration;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function PauseOption({ label, isSelected, onPress }: PauseOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className={`rounded border-2 px-4 py-2.5 ${
        isSelected
          ? 'border-amber-500 bg-amber-100 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
          : 'border-stone-800 bg-stone-100'
      }`}>
      <Text
        className={`text-sm font-black uppercase ${
          isSelected ? 'text-amber-900' : 'text-stone-800'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

