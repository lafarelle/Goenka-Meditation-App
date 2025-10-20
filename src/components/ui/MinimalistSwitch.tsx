import { selectionHaptic } from '@/utils/haptics';
import { Pressable, Text, View } from 'react-native';

interface MinimalistSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  leftLabel: string;
  rightLabel: string;
}

export function MinimalistSwitch({ value, onValueChange, leftLabel, rightLabel }: MinimalistSwitchProps) {
  const handlePress = () => {
    selectionHaptic();
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}>
      <View
        className="flex-row items-center rounded-full p-1"
        style={{
          backgroundColor: '#F5F5F5',
          gap: 4,
        }}>
        <View
          className="rounded-full px-3 py-1.5"
          style={{
            backgroundColor: !value ? '#E8B84B' : 'transparent',
          }}>
          <Text
            className="text-xs font-medium"
            style={{
              color: !value ? '#FFFFFF' : '#999999',
            }}>
            {leftLabel}
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5"
          style={{
            backgroundColor: value ? '#E8B84B' : 'transparent',
          }}>
          <Text
            className="text-xs font-medium"
            style={{
              color: value ? '#FFFFFF' : '#999999',
            }}>
            {rightLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
