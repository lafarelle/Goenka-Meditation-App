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
        <View className="flex-1 bg-gradient-to-b from-amber-50 to-stone-50">
          {/* Header */}
          <View className="border-b border-amber-200 bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 pt-16 shadow-md">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Ionicons name="time" size={22} color="#000000" />
                </View>
                <Text className="text-2xl font-bold text-black">Meditation History</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="rounded-full bg-white/20 p-2">
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1">
            {/* Analytics Section */}
            <View className="border-b border-amber-100 bg-white px-6 py-6">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Ionicons name="stats-chart" size={18} color="#F59E0B" />
                </View>
                <Text className="text-xl font-bold text-stone-800">Your Progress</Text>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {/* Current Streak */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 shadow-sm">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded-full bg-orange-200 p-1.5">
                      <Ionicons name="flame" size={18} color="#EA580C" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-orange-700">
                      Current Streak
                    </Text>
                  </View>
                  <Text className="text-3xl font-extrabold text-orange-900">{currentStreak}</Text>
                  <Text className="text-xs font-medium text-orange-700">
                    {currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Longest Streak */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 p-4 shadow-sm">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded-full bg-amber-200 p-1.5">
                      <Ionicons name="trophy" size={18} color="#D97706" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                      Best Streak
                    </Text>
                  </View>
                  <Text className="text-3xl font-extrabold text-amber-900">{longestStreak}</Text>
                  <Text className="text-xs font-medium text-amber-700">
                    {longestStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Total Sessions */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 shadow-sm">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded-full bg-yellow-200 p-1.5">
                      <Ionicons name="calendar" size={18} color="#CA8A04" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-yellow-700">
                      Total Sessions
                    </Text>
                  </View>
                  <Text className="text-3xl font-extrabold text-yellow-900">
                    {stats.totalSessions}
                  </Text>
                  <Text className="text-xs font-medium text-yellow-700">
                    {stats.completedSessions} completed
                  </Text>
                </View>

                {/* Total Time */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-lime-50 to-lime-100 p-4 shadow-sm">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded-full bg-lime-200 p-1.5">
                      <Ionicons name="time" size={18} color="#65A30D" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-lime-700">
                      Total Time
                    </Text>
                  </View>
                  <Text className="text-3xl font-extrabold text-lime-900">
                    {formatTotalMeditationTime(stats.totalMinutesMeditated)}
                  </Text>
                  <Text className="text-xs font-medium text-lime-700">meditated</Text>
                </View>
              </View>

              {/* Completion Rate */}
              {stats.totalSessions > 0 && (
                <View className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={18} color="#F59E0B" />
                      <Text className="text-sm font-bold text-stone-800">Completion Rate</Text>
                    </View>
                    <Text className="text-lg font-extrabold text-amber-600">
                      {formatCompletionRate(stats.completionRate)}
                    </Text>
                  </View>
                  <View className="h-3 overflow-hidden rounded-full bg-stone-200">
                    <View
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                      style={{ width: `${stats.completionRate * 100}%` }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Recent Sessions */}
            <View className="px-6 py-6">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Ionicons name="list" size={18} color="#F59E0B" />
                </View>
                <Text className="text-xl font-bold text-stone-800">Recent Sessions</Text>
              </View>

              {recentSessions.length === 0 ? (
                <View className="items-center py-16">
                  <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 shadow-lg">
                    <Ionicons name="time-outline" size={48} color="#F59E0B" />
                  </View>
                  <Text className="mb-3 text-xl font-bold text-stone-800">No Sessions Yet</Text>
                  <Text className="text-center text-base text-stone-600">
                    Your meditation history will{'\n'}appear here
                  </Text>
                </View>
              ) : (
                <View className="space-y-4">
                  {recentSessions.map((session) => (
                    <View
                      key={session.id}
                      className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-md">
                      {/* Status bar */}
                      <View
                        className={`h-1.5 ${
                          session.completed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : session.completionPercentage >= 50
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                              : 'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                      />

                      <View className="p-5">
                        <View className="mb-3 flex-row items-start justify-between">
                          <View className="flex-1">
                            <View className="mb-2 flex-row items-center">
                              <View
                                className={`rounded-lg px-2 py-1 ${
                                  session.completed
                                    ? 'bg-green-50'
                                    : session.completionPercentage >= 50
                                      ? 'bg-amber-50'
                                      : 'bg-red-50'
                                }`}>
                                <View className="flex-row items-center gap-1">
                                  <Ionicons
                                    name={
                                      getCompletionIcon(session) as
                                        | 'checkmark-circle'
                                        | 'close-circle'
                                    }
                                    size={16}
                                    color={
                                      session.completed
                                        ? '#10B981'
                                        : session.completionPercentage >= 50
                                          ? '#F59E0B'
                                          : '#EF4444'
                                    }
                                  />
                                  <Text
                                    className={`text-xs font-bold ${getCompletionColor(session)}`}>
                                    {getCompletionText(session)}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <View className="mb-2 flex-row items-center">
                              <View className="flex-row items-center rounded-full bg-amber-50 px-3 py-1.5">
                                <Ionicons name="time-outline" size={14} color="#F59E0B" />
                                <Text className="ml-1 text-sm font-semibold text-amber-700">
                                  {formatHistoryDuration(session.totalDurationMinutes)}
                                </Text>
                              </View>
                            </View>

                            <View className="flex-row items-center">
                              <Ionicons name="calendar-outline" size={12} color="#a8a29e" />
                              <Text className="ml-1 text-xs text-stone-500">
                                {formatHistoryDate(session.startedAt)} at{' '}
                                {formatHistoryTime(session.startedAt)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Segments */}
                        <View className="mb-4 flex-row flex-wrap gap-2">
                          {getEnabledSegments(session).map((segment, index) => (
                            <View key={index} className="rounded-full bg-amber-50 px-3 py-1.5">
                              <Text className="text-xs font-medium text-amber-700">{segment}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => loadSession(session.id)}
                            activeOpacity={0.8}
                            className="flex-1 flex-row items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 shadow-sm">
                            <Ionicons name="play" size={18} color="white" />
                            <Text className="ml-2 text-sm font-bold text-white">
                              Repeat Session
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleSaveAsTemplate(session.id)}
                            activeOpacity={0.8}
                            className="rounded-xl bg-amber-50 px-4 py-3">
                            <Ionicons name="bookmark-outline" size={18} color="#F59E0B" />
                          </TouchableOpacity>
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

      {/* Save Template Dialog */}
      <Modal
        visible={showSaveDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveDialog(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <View className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-5">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Ionicons name="bookmark" size={20} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">Save as Template</Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="mb-2 text-sm font-medium text-stone-700">Template Name</Text>
              <TextInput
                value={sessionName}
                onChangeText={setSessionName}
                placeholder="Enter template name"
                className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-base text-stone-800"
                placeholderTextColor="#a8a29e"
                autoFocus
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowSaveDialog(false)}
                  activeOpacity={0.8}
                  className="flex-1 rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3">
                  <Text className="text-center text-base font-bold text-stone-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmSaveTemplate}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-xl px-4 py-3 shadow-md ${
                    sessionName.trim()
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                      : 'bg-stone-300'
                  }`}
                  disabled={!sessionName.trim()}>
                  <Text className="text-center text-base font-bold text-white">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
