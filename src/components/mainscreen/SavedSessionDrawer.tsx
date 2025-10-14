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
      <View className="flex-1 bg-stone-50">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-6 py-4 pt-16">
          <Text className="text-xl font-bold text-stone-800">Saved Sessions</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8} className="p-2">
            <Ionicons name="close" size={24} color="#57534e" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-4">
          {saved.length === 0 ? (
            <View className="items-center py-12">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <Ionicons name="bookmark-outline" size={32} color="#A78BFA" />
              </View>
              <Text className="mb-2 text-lg font-semibold text-stone-800">No Saved Sessions</Text>
              <Text className="text-center text-stone-600">
                Save your meditation configurations to access them quickly
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {saved.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  onPress={() => loadSession(session.id)}
                  activeOpacity={0.8}
                  className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="mb-1 text-lg font-semibold text-stone-800">
                        {session.name}
                      </Text>
                      <View className="mb-2 flex-row items-center">
                        <Ionicons name="time-outline" size={16} color="#F59E0B" />
                        <Text className="ml-1 text-sm text-stone-600">
                          {formatSessionDuration(session.totalDuration)}
                        </Text>
                        {session.useCount > 0 && (
                          <>
                            <Text className="mx-2 text-stone-400">•</Text>
                            <Text className="text-sm text-stone-600">
                              {getSessionUsageText(session.useCount)}
                            </Text>
                          </>
                        )}
                      </View>
                      <Text className="text-xs text-stone-500">
                        Created {formatSessionDate(session.createdAt)}
                        {session.lastUsed && (
                          <Text> • Last used {formatSessionDate(session.lastUsed)}</Text>
                        )}
                      </Text>
                    </View>
                    <View className="ml-4 flex-row items-center">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        activeOpacity={0.8}
                        className="rounded-lg bg-red-50 p-2">
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
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
