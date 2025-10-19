import { lightHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function SupportUsButton() {
  const handleNavigate = () => {
    lightHaptic();
    router.push('/support');
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
        onPress={handleNavigate}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        className="rounded-xl px-8 py-6"
        accessibilityLabel="Support Us"
        accessibilityHint="Navigate to support information page">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#FEF3C7' }}>
                <Ionicons name="heart-outline" size={20} color="#E8B84B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-medium" style={{ color: '#333333' }}>
                  Support Us
                </Text>
                <Text className="mt-1 text-sm font-normal" style={{ color: '#666666' }}>
                  Learn more about the app
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999999" />
        </View>
      </Pressable>
    </View>
  );
}
