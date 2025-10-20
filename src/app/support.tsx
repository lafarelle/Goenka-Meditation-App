import { Container } from '@/components/Container';
import { lightHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

export default function Support() {
  const handleDonate = async () => {
    lightHaptic();
    const url = 'https://buymeacoffee.com/rglafarelle';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the donation link. Please try again later.');
      }
    } catch {
      Alert.alert('Error', 'Unable to open the donation link. Please try again later.');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
      <Stack.Screen
        options={{
          title: 'Support Us',
          headerShown: false,
        }}
      />
      <Container>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-8 py-4"
          showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <View
            className="rounded-2xl px-2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Pressable
              onPress={() => {
                lightHaptic();
                router.back();
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="flex-row items-center gap-3">
              <View className="rounded-xl p-2" style={{ backgroundColor: '#E8B84B' }}>
                <Ionicons name="arrow-back" size={20} color="#333333" />
              </View>
            </Pressable>
          </View>

          {/* Header */}
          <View
            className="rounded-2xl bg-white px-8 py-8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="flex-row items-center gap-4">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: '#FEF3C7' }}>
                <Ionicons name="heart" size={28} color="#E8B84B" />
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-light tracking-wide" style={{ color: '#333333' }}>
                  Support Us
                </Text>
                <Text className="mt-1 text-sm font-normal" style={{ color: '#666666' }}>
                  Learn about the app
                </Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View
            className="rounded-2xl bg-white px-8 py-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#F5F5EC' }}>
                <Ionicons name="information-circle-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                About This App
              </Text>
            </View>
            <Text
              className="mb-3 text-base leading-relaxed"
              style={{ color: '#333333', lineHeight: 24 }}>
              This app is and will be <Text className="font-semibold">completely free</Text>.
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              The goal is to allow anybody to continue practicing Vipassana meditation with the
              support of S.N. Goenka&apos;s voice and chants.
            </Text>
          </View>

          {/* Support the Developers Section */}
          <View
            className="rounded-2xl bg-white px-8 py-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#F5F5EC' }}>
                <Ionicons name="code-slash-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                Support the Developers
              </Text>
            </View>
            <Text
              className="mb-6 text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              If you are willing to support us, the developers of this app, you can donate to help
              us continue maintaining the app and adding new audio content.
            </Text>

            {/* Donation Button */}
            <Pressable
              onPress={handleDonate}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: '#E8B84B',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
              className="rounded-xl px-6 py-5"
              accessibilityLabel="Donate on Buy Me a Coffee"
              accessibilityRole="button">
              <View className="flex-row items-center justify-center gap-3">
                <Ionicons name="cafe" size={24} color="#333333" />
                <Text className="text-lg font-bold" style={{ color: '#333333' }}>
                  Buy Me a Coffee
                </Text>
              </View>
            </Pressable>

            <Text className="mt-4 text-center text-sm italic" style={{ color: '#999999' }}>
              Your support helps us keep this app free for everyone
            </Text>
          </View>
        </ScrollView>
      </Container>
    </View>
  );
}
