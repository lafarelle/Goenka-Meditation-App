import { useHistoryStore } from '@/store/historyStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  formatCompletionRate,
  formatHistoryDate,
  formatHistoryDuration,
  formatHistoryTime,
  formatTotalMeditationTime,
  getCompletionColor,
  getCompletionIcon,
  getCompletionText,
  getEnabledSegments,
  loadHistorySessionIntoStore,
} from '@/utils/historyUtils';
import { createSegmentsCopy } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sessionToSave, setSessionToSave] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState('');

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

    setSessionToSave(sessionId);
    setSessionName(`Session ${formatHistoryDate(session.startedAt)}`);
    setShowSaveDialog(true);
  };

  const confirmSaveTemplate = () => {
    if (!sessionToSave || !sessionName.trim()) return;

    const session = useHistoryStore.getState().getSessionById(sessionToSave);
    if (!session) return;

    // First load the history session into the current session store
    loadHistorySessionIntoStore(session, {
      setTotalDurationMinutes,
      setSegmentEnabled,
      setSegmentDuration,
      setSegmentAudioIds,
      setSegmentTechniqueType,
    });

    // Get the current segments from the store (now populated with history data)
    const currentSegments = useSessionStore.getState().segments;

    // Convert to saved session format
    const savedSegments = createSegmentsCopy(currentSegments);

    // Save the session
    saveSession(sessionName.trim(), session.totalDurationMinutes, savedSegments);

    // Reset state
    setShowSaveDialog(false);
    setSessionToSave(null);
    setSessionName('');

    Alert.alert('Success', 'Session saved as template!');
  };

  return (
    <>
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}>
        <View className="flex-1 bg-stone-50">
          {/* Header */}
          <View className="border-b border-stone-200 bg-white px-6 py-4 pt-16">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-stone-800">Meditation History</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.8} className="p-2">
                <Ionicons name="close" size={24} color="#57534e" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1">
            {/* Analytics Section */}
            <View className="border-b border-stone-200 bg-white px-6 py-4">
              <Text className="mb-3 text-lg font-semibold text-stone-800">Your Progress</Text>
              <View className="flex-row flex-wrap gap-3">
                {/* Current Streak */}
                <View className="min-w-[45%] flex-1 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="flame" size={20} color="#A78BFA" />
                    <Text className="ml-2 text-xs font-medium text-purple-700">Current Streak</Text>
                  </View>
                  <Text className="text-2xl font-bold text-purple-900">{currentStreak}</Text>
                  <Text className="text-xs text-purple-700">
                    {currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Longest Streak */}
                <View className="min-w-[45%] flex-1 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="trophy" size={20} color="#F59E0B" />
                    <Text className="ml-2 text-xs font-medium text-amber-700">Best Streak</Text>
                  </View>
                  <Text className="text-2xl font-bold text-amber-900">{longestStreak}</Text>
                  <Text className="text-xs text-amber-700">
                    {longestStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Total Sessions */}
                <View className="min-w-[45%] flex-1 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="calendar" size={20} color="#3B82F6" />
                    <Text className="ml-2 text-xs font-medium text-blue-700">Total Sessions</Text>
                  </View>
                  <Text className="text-2xl font-bold text-blue-900">{stats.totalSessions}</Text>
                  <Text className="text-xs text-blue-700">{stats.completedSessions} completed</Text>
                </View>

                {/* Total Time */}
                <View className="min-w-[45%] flex-1 rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="time" size={20} color="#10B981" />
                    <Text className="ml-2 text-xs font-medium text-green-700">Total Time</Text>
                  </View>
                  <Text className="text-2xl font-bold text-green-900">
                    {formatTotalMeditationTime(stats.totalMinutesMeditated)}
                  </Text>
                  <Text className="text-xs text-green-700">meditated</Text>
                </View>
              </View>

              {/* Completion Rate */}
              {stats.totalSessions > 0 && (
                <View className="mt-3 rounded-xl bg-stone-100 p-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-stone-700">Completion Rate</Text>
                    <Text className="text-sm font-bold text-stone-900">
                      {formatCompletionRate(stats.completionRate)}
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-stone-200">
                    <View
                      className="h-full bg-green-500"
                      style={{ width: `${stats.completionRate * 100}%` }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Recent Sessions */}
            <View className="px-6 py-4">
              <Text className="mb-3 text-lg font-semibold text-stone-800">Recent Sessions</Text>
              {recentSessions.length === 0 ? (
                <View className="items-center py-12">
                  <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                    <Ionicons name="time-outline" size={32} color="#A78BFA" />
                  </View>
                  <Text className="mb-2 text-lg font-semibold text-stone-800">No Sessions Yet</Text>
                  <Text className="text-center text-stone-600">
                    Your meditation history will appear here
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {recentSessions.map((session) => (
                    <View
                      key={session.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                      <View className="mb-3 flex-row items-start justify-between">
                        <View className="flex-1">
                          <View className="mb-1 flex-row items-center">
                            <Ionicons
                              name={
                                getCompletionIcon(session) as 'checkmark-circle' | 'close-circle'
                              }
                              size={18}
                              color={
                                session.completed
                                  ? '#10B981'
                                  : session.completionPercentage >= 50
                                    ? '#F59E0B'
                                    : '#EF4444'
                              }
                            />
                            <Text
                              className={`ml-2 text-sm font-semibold ${getCompletionColor(session)}`}>
                              {getCompletionText(session)}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#F59E0B" />
                            <Text className="ml-1 text-sm text-stone-600">
                              {formatHistoryDuration(session.totalDurationMinutes)}
                            </Text>
                            <Text className="mx-2 text-stone-400">•</Text>
                            <Text className="text-sm text-stone-600">
                              {formatHistoryDate(session.startedAt)} at{' '}
                              {formatHistoryTime(session.startedAt)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Segments */}
                      <View className="mb-3 flex-row flex-wrap gap-1">
                        {getEnabledSegments(session).map((segment, index) => (
                          <View key={index} className="rounded-full bg-purple-50 px-2 py-1">
                            <Text className="text-xs text-purple-700">{segment}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Actions */}
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => loadSession(session.id)}
                          activeOpacity={0.8}
                          className="flex-1 flex-row items-center justify-center rounded-lg bg-purple-500 px-4 py-2">
                          <Ionicons name="play" size={16} color="white" />
                          <Text className="ml-2 text-sm font-semibold text-white">
                            Repeat Session
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleSaveAsTemplate(session.id)}
                          activeOpacity={0.8}
                          className="rounded-lg bg-stone-100 px-3 py-2">
                          <Ionicons name="bookmark-outline" size={16} color="#57534e" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Save Template Dialog */}
      <Modal
        visible={showSaveDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveDialog(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6">
            <Text className="mb-4 text-lg font-bold text-stone-800">Save as Template</Text>
            <TextInput
              value={sessionName}
              onChangeText={setSessionName}
              placeholder="Enter template name"
              className="mb-4 rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-800"
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowSaveDialog(false)}
                activeOpacity={0.8}
                className="flex-1 rounded-lg bg-stone-100 px-4 py-3">
                <Text className="text-center font-semibold text-stone-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSaveTemplate}
                activeOpacity={0.8}
                className="flex-1 rounded-lg bg-purple-500 px-4 py-3"
                disabled={!sessionName.trim()}>
                <Text className="text-center font-semibold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
