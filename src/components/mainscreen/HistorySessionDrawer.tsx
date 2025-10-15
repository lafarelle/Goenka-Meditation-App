import { useHistoryStore } from '@/store/historyStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  formatHistoryDate,
  formatHistoryDuration,
  formatHistoryTime,
  formatTotalMeditationTime,
  getCompletionColor,
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
        <View className="flex-1 bg-amber-50">
          {/* Header */}
          <View className="border-b-4 border-stone-800 bg-amber-400 px-6 py-4 pt-16">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
                  <Ionicons name="time" size={22} color="#292524" />
                </View>
                <Text className="text-2xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
                  Meditation History
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
          <ScrollView className="flex-1">
            {/* Analytics Section */}
            <View className="border-b-4 border-stone-800 bg-white px-6 py-6">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded border-2 border-stone-800 bg-amber-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Ionicons name="stats-chart" size={18} color="#F59E0B" />
                </View>
                <Text className="text-xl font-black uppercase text-stone-800">
                  Your Meditations
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {/* Current Streak */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-orange-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="flame" size={20} color="#EA580C" />
                    <Text className="text-xs font-black uppercase tracking-wide text-orange-700">
                      Streak
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-orange-900">{currentStreak}</Text>
                  <Text className="text-xs font-black text-orange-700">
                    {currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Longest Streak */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-amber-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="trophy" size={20} color="#D97706" />
                    <Text className="text-xs font-black uppercase tracking-wide text-amber-700">
                      Best Streak
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-amber-900">{longestStreak}</Text>
                  <Text className="text-xs font-black text-amber-700">
                    {longestStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Total Time */}
                <View className="flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-lime-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="time" size={20} color="#65A30D" />
                    <Text className="text-xs font-black uppercase tracking-wide text-lime-700">
                      Total Time
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-lime-900">
                    {formatTotalMeditationTime(stats.totalMinutesMeditated)}
                  </Text>
                  <Text className="text-xs font-black text-lime-700">meditated</Text>
                </View>
              </View>
            </View>

            {/* Recent Sessions */}
            <View className="px-6 py-6">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded border-2 border-stone-800 bg-amber-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Ionicons name="list" size={18} color="#F59E0B" />
                </View>
                <Text className="text-xl font-black uppercase text-stone-800">Recent Sessions</Text>
              </View>

              {recentSessions.length === 0 ? (
                <View className="items-center py-16">
                  <View className="mb-6 h-24 w-24 items-center justify-center rounded border-4 border-stone-800 bg-amber-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <Ionicons name="time-outline" size={48} color="#F59E0B" />
                  </View>
                  <Text className="mb-3 text-xl font-black uppercase text-stone-800">
                    No Sessions Yet
                  </Text>
                  <Text className="text-center text-base font-bold text-stone-600">
                    Your meditation history will{'\n'}appear here
                  </Text>
                </View>
              ) : (
                <View className="gap-4">
                  {recentSessions.map((session) => (
                    <View
                      key={session.id}
                      className="overflow-hidden rounded-xl border-4 border-stone-800 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      {/* Status bar */}
                      <View
                        className={`h-3 border-b-4 border-stone-800 ${
                          session.completed
                            ? 'bg-green-400'
                            : session.completionPercentage >= 50
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                        }`}
                      />

                      <View className="p-5 pb-4">
                        <View className="mb-4 flex-row items-start justify-between">
                          <View className="flex-1">
                            <View className="mb-3 flex-row items-center gap-2">
                              <View
                                className={`rounded-md border-2 px-2.5 py-1 ${
                                  session.completed
                                    ? 'border-green-600 bg-green-100 shadow-[2px_2px_0px_0px_rgba(22,163,74,1)]'
                                    : session.completionPercentage >= 50
                                      ? 'border-amber-600 bg-amber-100 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]'
                                      : 'border-red-600 bg-red-100 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]'
                                }`}>
                                <View className="flex-row items-center gap-1.5">
                                  <Ionicons
                                    name={
                                      getCompletionIcon(session) as
                                        | 'checkmark-circle'
                                        | 'close-circle'
                                    }
                                    size={16}
                                    color={
                                      session.completed
                                        ? '#16A34A'
                                        : session.completionPercentage >= 50
                                          ? '#D97706'
                                          : '#DC2626'
                                    }
                                  />
                                  <Text
                                    className={`text-xs font-black uppercase ${getCompletionColor(session)}`}>
                                    {getCompletionText(session)}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-row items-center gap-1.5 rounded-md border-2 border-stone-800 bg-stone-100 px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Ionicons name="time-outline" size={16} color="#57534e" />
                                <Text className="text-sm font-black text-stone-700">
                                  {formatHistoryDuration(session.totalDurationMinutes)}
                                </Text>
                              </View>
                            </View>

                            <View className="flex-row items-center gap-1.5">
                              <Ionicons name="calendar-outline" size={14} color="#78716c" />
                              <Text className="text-sm font-bold text-stone-600">
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
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                            className="border-3 flex-1 flex-row items-center justify-center gap-2 rounded-lg border-stone-800 bg-amber-400 px-4 py-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Ionicons name="play" size={18} color="#292524" />
                            <Text className="text-sm font-black uppercase tracking-wide text-stone-900">
                              Repeat
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleSaveAsTemplate(session.id)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                            className="border-3 min-w-[60px] items-center justify-center rounded-lg border-stone-800 bg-green-400 px-4 py-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Ionicons name="bookmark" size={22} color="#292524" />
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
