import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  formatSessionDate,
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
        <View className="border-b border-stone-200 bg-white px-8 py-6 pt-16 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
                <Ionicons name="bookmark" size={24} color="#E8B84B" />
              </View>
              <Text className="text-2xl font-bold text-[#333333]">Saved Sessions</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="rounded-xl bg-stone-100 p-2.5 shadow-sm shadow-stone-300/50">
              <Ionicons name="close" size={24} color="#333333" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-8 py-8">
          {saved.length === 0 ? (
            <View className="items-center py-20">
              <View className="mb-6 h-28 w-28 items-center justify-center rounded-3xl bg-[#E8B84B]/10 shadow-md shadow-stone-300/50">
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
                  onPress={() => loadSession(session.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-300/50">
                  {/* Accent bar */}
                  <View className="h-1.5 bg-gradient-to-r from-[#E8B84B] to-[#D4A73D]" />

                  <View className="p-6">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="mb-4 flex-row items-center gap-3">
                          <View className="rounded-xl bg-[#E8B84B]/10 px-3 py-1.5">
                            <Ionicons name="bookmark" size={16} color="#E8B84B" />
                          </View>
                          <Text className="flex-1 text-lg font-semibold text-[#333333]">
                            {session.name}
                          </Text>
                        </View>

                        <View className="mb-4 flex-row items-center gap-3">
                          <View className="flex-row items-center gap-2 rounded-xl bg-[#E8B84B]/10 px-4 py-2">
                            <Ionicons name="time-outline" size={16} color="#E8B84B" />
                            <Text className="text-sm font-medium text-[#E8B84B]">
                              {formatSessionDuration(session.totalDuration)}
                            </Text>
                          </View>
                          {session.useCount > 0 && (
                            <View className="flex-row items-center gap-2 rounded-xl bg-stone-100 px-4 py-2">
                              <Ionicons name="repeat" size={14} color="#78716c" />
                              <Text className="text-sm font-medium text-stone-600">
                                {getSessionUsageText(session.useCount)}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View className="gap-2">
                          <View className="flex-row items-center gap-2">
                            <Ionicons name="calendar-outline" size={14} color="#999" />
                            <Text className="text-xs text-stone-500">
                              Created {formatSessionDate(session.createdAt)}
                            </Text>
                          </View>
                          {session.lastUsedAt && (
                            <View className="flex-row items-center gap-2">
                              <Ionicons name="time-outline" size={14} color="#999" />
                              <Text className="text-xs text-stone-500">
                                Last used {formatSessionDate(session.lastUsedAt)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="ml-4 rounded-xl bg-red-50 p-3 shadow-sm shadow-red-200/50">
                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                      </Pressable>
                    </View>
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
