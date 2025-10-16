import { useHistoryStore } from '@/store/historyStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  formatHistoryDate,
  formatHistoryDuration,
  formatHistoryTime,
  formatTotalMeditationTime,
  getCompletionIcon,
  getCompletionText,
  loadHistorySessionIntoStore,
} from '@/utils/historyUtils';
import { createSegmentsCopy } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';

interface HistorySessionDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function HistorySessionDrawer({ isVisible, onClose }: HistorySessionDrawerProps) {
  const { getRecentSessions, getStats, getCurrentStreak, getLongestStreak } = useHistoryStore();
  const { saveSession } = useSavedSessionsStore();
  const {
    setTotalDurationMinutes,
    setSegmentEnabled,
    setSegmentDuration,
    setSegmentAudioIds,
    setSegmentTechniqueType,
  } = useSessionStore();

  const recentSessions = getRecentSessions(20);
  const stats = getStats();
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();

  const loadSession = (sessionId: string) => {
    const session = useHistoryStore.getState().getSessionById(sessionId);
    if (!session) return;

    // Load session using utility function
    loadHistorySessionIntoStore(session, {
      setTotalDurationMinutes,
      setSegmentEnabled,
      setSegmentDuration,
      setSegmentAudioIds,
      setSegmentTechniqueType,
    });

    // Close the drawer
    onClose();
  };

  const handleSaveAsTemplate = (sessionId: string) => {
    const session = useHistoryStore.getState().getSessionById(sessionId);
    if (!session) return;

    const defaultName = `Session ${formatHistoryDate(session.startedAt)}`;

    // Use Alert.prompt on iOS, or a simple Alert on Android/Web
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Save as Template',
        'Enter a name for this session template:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: (name?: string) => {
              const templateName = name?.trim() || defaultName;
              saveTemplate(sessionId, templateName);
            },
          },
        ],
        'plain-text',
        defaultName
      );
    } else {
      // On Android/Web, use the default name directly
      saveTemplate(sessionId, defaultName);
    }
  };

  const saveTemplate = (sessionId: string, name: string) => {
    const session = useHistoryStore.getState().getSessionById(sessionId);
    if (!session) {
      Alert.alert('Error', 'Session not found');
      return;
    }

    try {
      // Load the history session into the current session store
      loadHistorySessionIntoStore(session, {
        setTotalDurationMinutes,
        setSegmentEnabled,
        setSegmentDuration,
        setSegmentAudioIds,
        setSegmentTechniqueType,
      });

      // Get the current segments from the store
      const currentSegments = useSessionStore.getState().segments;

      // Convert to saved session format
      const savedSegments = createSegmentsCopy(currentSegments);

      // Save the session
      saveSession(name.trim(), session.totalDurationMinutes, savedSegments);

      Alert.alert('Success', 'Session saved as template!');
    } catch {
      Alert.alert('Error', 'Failed to save session template');
    }
  };

  return (
    <>
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
                  <Ionicons name="time" size={24} color="#E8B84B" />
                </View>
                <Text className="text-2xl font-bold text-[#333333]">Meditation History</Text>
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
          <ScrollView className="flex-1">
            {/* Analytics Section */}
            <View className="border-b border-stone-200 bg-white px-8 py-8">
              <View className="mb-6 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
                  <Ionicons name="stats-chart" size={20} color="#E8B84B" />
                </View>
                <Text className="text-xl font-semibold text-[#333333]">Your Meditations</Text>
              </View>

              <View className="flex-row flex-wrap gap-4">
                {/* Current Streak */}
                <View
                  className="min-w-[45%] flex-1 overflow-hidden rounded-2xl p-5"
                  style={{
                    backgroundColor: '#FFF3D6',
                    shadowColor: '#E8B84B',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons name="flame" size={22} color="#C89635" />
                    <Text className="text-xs font-medium uppercase tracking-wider text-[#C89635]">
                      Streak
                    </Text>
                  </View>
                  <Text className="text-4xl font-bold text-[#C89635]">{currentStreak}</Text>
                  <Text className="mt-1 text-xs font-medium text-[#D4A73D]">
                    {currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Longest Streak */}
                <View
                  className="min-w-[45%] flex-1 overflow-hidden rounded-2xl p-5"
                  style={{
                    backgroundColor: '#FFF9E6',
                    shadowColor: '#E8B84B',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons name="trophy" size={22} color="#E8B84B" />
                    <Text className="text-xs font-medium uppercase tracking-wider text-[#D4A73D]">
                      Best Streak
                    </Text>
                  </View>
                  <Text className="text-4xl font-bold text-[#E8B84B]">{longestStreak}</Text>
                  <Text className="mt-1 text-xs font-medium text-[#D4A73D]">
                    {longestStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Total Time */}
                <View
                  className="flex-1 overflow-hidden rounded-2xl p-5"
                  style={{
                    backgroundColor: '#FFFBF0',
                    shadowColor: '#E8B84B',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons name="time" size={22} color="#D4A73D" />
                    <Text className="text-xs font-medium uppercase tracking-wider text-[#C89635]">
                      Total Time
                    </Text>
                  </View>
                  <Text className="text-4xl font-bold text-[#C89635]">
                    {formatTotalMeditationTime(stats.totalMinutesMeditated)}
                  </Text>
                  <Text className="mt-1 text-xs font-medium text-[#D4A73D]">meditated</Text>
                </View>
              </View>
            </View>

            {/* Recent Sessions */}
            <View className="px-8 py-8">
              <View className="mb-6 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
                  <Ionicons name="list" size={20} color="#E8B84B" />
                </View>
                <Text className="text-xl font-semibold text-[#333333]">Recent Sessions</Text>
              </View>

              {recentSessions.length === 0 ? (
                <View className="items-center py-20">
                  <View className="mb-6 h-28 w-28 items-center justify-center rounded-3xl bg-[#E8B84B]/10 shadow-md shadow-stone-300/50">
                    <Ionicons name="time-outline" size={56} color="#E8B84B" />
                  </View>
                  <Text className="mb-3 text-xl font-semibold text-[#333333]">No Sessions Yet</Text>
                  <Text className="text-center text-base text-stone-500">
                    Your meditation history will{'\n'}appear here
                  </Text>
                </View>
              ) : (
                <View className="gap-5">
                  {recentSessions.map((session) => (
                    <View
                      key={session.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-300/50">
                      {/* Status bar */}
                      <View
                        className="h-1.5"
                        style={{
                          backgroundColor: session.completed
                            ? '#E8B84B'
                            : session.completionPercentage >= 50
                              ? '#F0C86E'
                              : '#D4A73D',
                        }}
                      />

                      <View className="p-6">
                        <View className="mb-5 flex-row items-start justify-between">
                          <View className="flex-1">
                            <View className="mb-4 flex-row items-center gap-3">
                              <View
                                className="rounded-xl px-3 py-2"
                                style={{
                                  backgroundColor: session.completed
                                    ? '#FFF9E6'
                                    : session.completionPercentage >= 50
                                      ? '#FFFBF0'
                                      : '#FFF3D6',
                                }}>
                                <View className="flex-row items-center gap-2">
                                  <Ionicons
                                    name={
                                      getCompletionIcon(session) as
                                        | 'checkmark-circle'
                                        | 'close-circle'
                                    }
                                    size={16}
                                    color={
                                      session.completed
                                        ? '#E8B84B'
                                        : session.completionPercentage >= 50
                                          ? '#D4A73D'
                                          : '#C89635'
                                    }
                                  />
                                  <Text
                                    className="text-xs font-medium uppercase"
                                    style={{
                                      color: session.completed
                                        ? '#E8B84B'
                                        : session.completionPercentage >= 50
                                          ? '#D4A73D'
                                          : '#C89635',
                                    }}>
                                    {getCompletionText(session)}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-row items-center gap-2 rounded-xl bg-stone-100 px-3 py-2">
                                <Ionicons name="time-outline" size={16} color="#78716c" />
                                <Text className="text-sm font-medium text-stone-600">
                                  {formatHistoryDuration(session.totalDurationMinutes)}
                                </Text>
                              </View>
                            </View>

                            <View className="flex-row items-center gap-2">
                              <Ionicons name="calendar-outline" size={14} color="#999" />
                              <Text className="text-sm text-stone-500">
                                {formatHistoryDate(session.startedAt)} at{' '}
                                {formatHistoryTime(session.startedAt)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-3">
                          <Pressable
                            onPress={() => loadSession(session.id)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#E8B84B] px-5 py-4 shadow-md shadow-[#E8B84B]/30">
                            <Ionicons name="play" size={18} color="#333333" />
                            <Text className="text-sm font-semibold text-[#333333]">Repeat</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleSaveAsTemplate(session.id)}
                            style={({ pressed }) => [
                              {
                                opacity: pressed ? 0.8 : 1,
                                backgroundColor: '#FFF9E6',
                                shadowColor: '#E8B84B',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.15,
                                shadowRadius: 4,
                                elevation: 2,
                              },
                            ]}
                            className="items-center justify-center rounded-xl px-5 py-4">
                            <Ionicons name="bookmark" size={22} color="#E8B84B" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
