import { Container } from '@/components/Container';
import { lightHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import goenkaImage from '../../assets/images/goenka.png';

export default function GoenkaPage() {
  const handleVideoPress = async () => {
    lightHaptic();
    const url = 'https://www.youtube.com/watch?v=uVet3UwkC_0';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the video. Please try again later.');
      }
    } catch {
      Alert.alert('Error', 'Unable to open the video. Please try again later.');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
      <Stack.Screen
        options={{
          title: 'S.N. Goenka',
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

          {/* Portrait Image */}
          <View
            className="rounded-2xl bg-white px-6 py-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="flex-row items-center gap-2 p-4">
              <Text className="text-3xl font-bold tracking-wide" style={{ color: '#333333' }}>
                S.N. Goenka
              </Text>
              <Text className="mt-1 text-xl font-normal" style={{ color: '#666666' }}>
                (1924-2013)
              </Text>
            </View>

            <Image
              source={goenkaImage}
              style={{
                width: '100%',
                height: 300,
                borderRadius: 12,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Life Overview Section */}
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
                <Ionicons name="person-circle-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                Life Overview
              </Text>
            </View>
            <Text
              className="mb-3 text-base leading-relaxed"
              style={{ color: '#333333', lineHeight: 24 }}>
              Satya Narayan Goenka was a renowned lay teacher of Vipassanā meditation. Of Indian
              descent, he was born and raised in Burma (now Myanmar).
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              A successful businessman, he sought a remedy for debilitating migraines, which led him
              to the Vipassanā technique taught by Sayagyi U Ba Khin.
            </Text>
          </View>

          {/* Training & Teaching Section */}
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
                <Ionicons name="school-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                Training & Teaching
              </Text>
            </View>
            <Text
              className="mb-3 text-base leading-relaxed"
              style={{ color: '#333333', lineHeight: 24 }}>
              After 14 years of training, Goenka moved to India in 1969 and began teaching
              Vipassanā.
            </Text>
            <Text
              className="mb-3 text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              His teaching was notably <Text className="font-medium">non-sectarian</Text>,
              presenting the technique as a universal path to liberation, free from religious dogma.
              This approach attracted a diverse range of people from all backgrounds and beliefs.
            </Text>
          </View>

          {/* Life's Commitment Section */}
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
                <Ionicons name="heart-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                Life&apos;s Commitment
              </Text>
            </View>
            <Text
              className="mb-3 text-base leading-relaxed"
              style={{ color: '#333333', lineHeight: 24 }}>
              His life&apos;s commitment was to spread the practice of Vipassanā globally. Over
              nearly 45 years, he and his assistant teachers taught hundreds of thousands of people
              through 10-day residential courses.
            </Text>
            <Text
              className="mb-3 text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              These courses are offered <Text className="font-medium">free of charge</Text>,
              financed by donations from past students. Goenka established numerous meditation
              centers across the world, ensuring the technique would be accessible to all.
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              He emphasized that Vipassanā is not a religion but a method of self-observation to
              achieve mental purification.
            </Text>
          </View>

          {/* Legacy & Recognition Section */}
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
                <Ionicons name="medal-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                Legacy & Recognition
              </Text>
            </View>
            <Text
              className="text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              For his contributions, he was awarded the{' '}
              <Text className="font-medium">Padma Bhushan</Text>, one of India&apos;s highest
              civilian honors, in 2012. His work continues to inspire thousands of people worldwide
              in the practice of Vipassanā meditation.
            </Text>
          </View>

          {/* Video Section */}
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
                <Ionicons name="play-circle-outline" size={24} color="#E8B84B" />
              </View>
              <Text className="text-xl font-medium" style={{ color: '#333333' }}>
                Watch His Biography
              </Text>
            </View>
            <Text
              className="mb-6 text-base leading-relaxed"
              style={{ color: '#666666', lineHeight: 24 }}>
              Learn more about S.N. Goenka&apos;s life and teachings through this documentary.
            </Text>

            {/* Video Button */}
            <Pressable
              onPress={handleVideoPress}
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
              accessibilityLabel="Watch SN Goenka Biography"
              accessibilityRole="button">
              <View className="flex-row items-center justify-center gap-3">
                <Ionicons name="play-circle" size={24} color="#333333" />
                <Text className="text-lg font-bold" style={{ color: '#333333' }}>
                  SN Goenka Biography
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </Container>
    </View>
  );
}
