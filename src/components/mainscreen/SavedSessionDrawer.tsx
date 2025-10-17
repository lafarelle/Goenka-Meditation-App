import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { heavyHaptic, lightHaptic, mediumHaptic } from '@/utils/haptics';
import {
  formatSessionDuration,
  getSessionUsageText,
  loadSessionIntoStore,
} from '@/utils/sessionUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

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
                <Pressable
                  key={session.id}
                  onPress={() => {
                    mediumHaptic();
                    loadSession(session.id);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="mb-4 overflow-hidden rounded-xl bg-white shadow-md ">
                  {/* Accent bar */}
                  <View className="h-1 bg-gradient-to-r from-[#E8B84B] to-[#D4A73D]" />

                  <View className="flex-row items-center justify-between p-4">
                    {/* Left side: Icon + Name + Duration */}
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="flex-1">
                        <Text
                          className="mb-1 text-base font-semibold text-[#333333]"
                          numberOfLines={1}>
                          {session.name}
                        </Text>
                        <View className="flex-row items-center gap-3">
                          <View className="flex-row items-center gap-1.5">
                            <Ionicons name="time-outline" size={14} color="#E8B84B" />
                            <Text className="text-xs font-medium text-[#E8B84B]">
                              {formatSessionDuration(session.totalDuration)}
                            </Text>
                          </View>
                          {session.useCount > 0 && (
                            <>
                              <Text className="text-xs text-stone-300">•</Text>
                              <View className="flex-row items-center gap-1.5">
                                <Ionicons name="repeat" size={12} color="#78716c" />
                                <Text className="text-xs font-medium text-stone-500">
                                  {getSessionUsageText(session.useCount)}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Right side: Delete button */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        heavyHaptic();
                        deleteSession(session.id);
                      }}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                      className="ml-3 rounded-lg bg-red-50 p-2.5 shadow-sm shadow-red-200/50">
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
