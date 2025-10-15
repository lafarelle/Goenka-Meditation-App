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
      <View className="flex-1 bg-amber-50">
        {/* Header */}
        <View className="border-b-4 border-stone-800 bg-amber-400 px-6 py-4 pt-16">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
                <Ionicons name="bookmark" size={22} color="#292524" />
              </View>
              <Text className="text-2xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
                Saved Sessions
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="rounded border-2 border-stone-800 bg-stone-100 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Ionicons name="close" size={24} color="#292524" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          {saved.length === 0 ? (
            <View className="items-center py-16">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded border-4 border-stone-800 bg-amber-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Ionicons name="bookmark-outline" size={48} color="#F59E0B" />
              </View>
              <Text className="mb-3 text-xl font-black uppercase text-stone-800">
                No Saved Sessions
              </Text>
              <Text className="text-center text-base font-bold text-stone-600">
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
                  className="overflow-hidden rounded-lg border-4 border-stone-800 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {/* Accent bar */}
                  <View className="h-2 border-b-4 border-stone-800 bg-amber-400" />

                  <View className="p-5">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="mb-3 flex-row items-center gap-2">
                          <View className="rounded border-2 border-stone-800 bg-amber-100 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Ionicons name="bookmark" size={14} color="#F59E0B" />
                          </View>
                          <Text className="flex-1 text-lg font-black text-stone-800">
                            {session.name}
                          </Text>
                        </View>

                        <View className="mb-3 flex-row items-center">
                          <View className="flex-row items-center rounded border-2 border-amber-500 bg-amber-50 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]">
                            <Ionicons name="time-outline" size={16} color="#F59E0B" />
                            <Text className="ml-1.5 text-sm font-black text-amber-700">
                              {formatSessionDuration(session.totalDuration)}
                            </Text>
                          </View>
                          {session.useCount > 0 && (
                            <>
                              <Text className="mx-2 font-black text-stone-400">•</Text>
                              <View className="flex-row items-center rounded border-2 border-stone-700 bg-stone-100 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Ionicons name="repeat" size={14} color="#78716c" />
                                <Text className="ml-1 text-sm font-black text-stone-700">
                                  {getSessionUsageText(session.useCount)}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>

                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={12} color="#78716c" />
                          <Text className="ml-1 text-xs font-bold text-stone-600">
                            Created {formatSessionDate(session.createdAt)}
                          </Text>
                        </View>
                        {session.lastUsedAt && (
                          <View className="mt-1 flex-row items-center">
                            <Ionicons name="time-outline" size={12} color="#78716c" />
                            <Text className="ml-1 text-xs font-bold text-stone-600">
                              Last used {formatSessionDate(session.lastUsedAt)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="ml-3 rounded border-2 border-red-600 bg-red-50 p-3 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
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
