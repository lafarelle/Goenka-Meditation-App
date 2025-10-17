import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { lightHaptic } from '@/utils/haptics';
import { loadSessionIntoStore } from '@/utils/sessionUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SavedSessionCard } from './SavedSessionCard';

interface SavedSessionDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SavedSessionDrawer({ isVisible, onClose }: SavedSessionDrawerProps) {
  const { saved, deleteSession, updateSessionUsage } = useSavedSessionsStore();
  const {
    setTotalDurationMinutes,
    setSegmentEnabled,
    setSegmentDuration,
    setSegmentAudioIds,
    setSegmentTechniqueType,
  } = useSessionStore();

  const loadSession = (sessionId: string) => {
    const session = saved.find((s) => s.id === sessionId);
    if (!session) return;

    // Update session usage
    updateSessionUsage(sessionId);

    // Load session using utility function
    loadSessionIntoStore(session, {
      setTotalDurationMinutes,
      setSegmentEnabled,
      setSegmentDuration,
      setSegmentAudioIds,
      setSegmentTechniqueType,
    });

    // Close the drawer
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="flex-1 bg-[#F5F5EC]">
        {/* Header */}
        <View className="border-b border-stone-200 bg-white px-8 py-6 pt-16 ">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
                <Ionicons name="bookmark" size={24} color="#E8B84B" />
              </View>
              <Text className="text-2xl font-bold text-[#333333]">Saved Sessions</Text>
            </View>
            <Pressable
              onPress={() => {
                lightHaptic();
                onClose();
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="rounded-xl bg-stone-100 p-2.5 ">
              <Ionicons name="close" size={24} color="#333333" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-8 py-8">
          {saved.length === 0 ? (
            <View className="items-center py-20">
              <View className="0 mb-6 h-28 w-28 items-center justify-center rounded-3xl ">
                <Ionicons name="bookmark-outline" size={56} color="#E8B84B" />
              </View>
              <Text className="mb-3 text-xl font-semibold text-[#333333]">No Saved Sessions</Text>
              <Text className="text-center text-base text-stone-500">
                Save your meditation configurations{'\n'}to access them quickly
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {saved.map((session) => (
                <SavedSessionCard
                  key={session.id}
                  session={session}
                  onLoad={loadSession}
                  onDelete={deleteSession}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
