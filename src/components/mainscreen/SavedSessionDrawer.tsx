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
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
      <View className="flex-1 bg-gradient-to-b from-amber-50 to-stone-50">
        {/* Header */}
        <View className="border-b border-amber-200 bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 pt-16 shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="bookmark" size={22} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold text-white">Saved Sessions</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="rounded-full bg-white/20 p-2">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          {saved.length === 0 ? (
            <View className="items-center py-16">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 shadow-lg">
                <Ionicons name="bookmark-outline" size={48} color="#F59E0B" />
              </View>
              <Text className="mb-3 text-xl font-bold text-stone-800">No Saved Sessions</Text>
              <Text className="text-center text-base text-stone-600">
                Save your meditation configurations{'\n'}to access them quickly
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {saved.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  onPress={() => loadSession(session.id)}
                  activeOpacity={0.8}
                  className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-md">
                  {/* Accent bar */}
                  <View className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500" />

                  <View className="p-5">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="mb-3 flex-row items-center gap-2">
                          <View className="rounded-lg bg-amber-100 px-2 py-1">
                            <Ionicons name="bookmark" size={14} color="#F59E0B" />
                          </View>
                          <Text className="flex-1 text-lg font-bold text-stone-800">
                            {session.name}
                          </Text>
                        </View>

                        <View className="mb-3 flex-row items-center">
                          <View className="flex-row items-center rounded-full bg-amber-50 px-3 py-1.5">
                            <Ionicons name="time-outline" size={16} color="#F59E0B" />
                            <Text className="ml-1.5 text-sm font-semibold text-amber-700">
                              {formatSessionDuration(session.totalDuration)}
                            </Text>
                          </View>
                          {session.useCount > 0 && (
                            <>
                              <Text className="mx-2 text-stone-400">•</Text>
                              <View className="flex-row items-center rounded-full bg-stone-100 px-3 py-1.5">
                                <Ionicons name="repeat" size={14} color="#78716c" />
                                <Text className="ml-1 text-sm font-medium text-stone-700">
                                  {getSessionUsageText(session.useCount)}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>

                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={12} color="#a8a29e" />
                          <Text className="ml-1 text-xs text-stone-500">
                            Created {formatSessionDate(session.createdAt)}
                          </Text>
                        </View>
                        {session.lastUsed && (
                          <View className="mt-1 flex-row items-center">
                            <Ionicons name="time-outline" size={12} color="#a8a29e" />
                            <Text className="ml-1 text-xs text-stone-500">
                              Last used {formatSessionDate(session.lastUsed)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        activeOpacity={0.8}
                        className="ml-3 rounded-xl bg-red-50 p-3">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
