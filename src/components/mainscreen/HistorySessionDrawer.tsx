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
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="rounded border-2 border-stone-800 bg-stone-100 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Ionicons name="close" size={24} color="#292524" />
              </TouchableOpacity>
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
                <Text className="text-xl font-black uppercase text-stone-800">Your Progress</Text>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {/* Current Streak */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-orange-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded border-2 border-stone-800 bg-orange-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Ionicons name="flame" size={18} color="#EA580C" />
                    </View>
                    <Text className="ml-2 text-xs font-black uppercase tracking-wide text-orange-700">
                      Current Streak
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-orange-900">{currentStreak}</Text>
                  <Text className="text-xs font-black text-orange-700">
                    {currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Longest Streak */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-amber-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded border-2 border-stone-800 bg-amber-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Ionicons name="trophy" size={18} color="#D97706" />
                    </View>
                    <Text className="ml-2 text-xs font-black uppercase tracking-wide text-amber-700">
                      Best Streak
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-amber-900">{longestStreak}</Text>
                  <Text className="text-xs font-black text-amber-700">
                    {longestStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                {/* Total Sessions */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-yellow-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded border-2 border-stone-800 bg-yellow-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Ionicons name="calendar" size={18} color="#CA8A04" />
                    </View>
                    <Text className="ml-2 text-xs font-black uppercase tracking-wide text-yellow-700">
                      Total Sessions
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-yellow-900">{stats.totalSessions}</Text>
                  <Text className="text-xs font-black text-yellow-700">
                    {stats.completedSessions} completed
                  </Text>
                </View>

                {/* Total Time */}
                <View className="min-w-[45%] flex-1 overflow-hidden rounded-lg border-4 border-stone-800 bg-lime-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-3 flex-row items-center">
                    <View className="rounded border-2 border-stone-800 bg-lime-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Ionicons name="time" size={18} color="#65A30D" />
                    </View>
                    <Text className="ml-2 text-xs font-black uppercase tracking-wide text-lime-700">
                      Total Time
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-lime-900">
                    {formatTotalMeditationTime(stats.totalMinutesMeditated)}
                  </Text>
                  <Text className="text-xs font-black text-lime-700">meditated</Text>
                </View>
              </View>

              {/* Completion Rate */}
              {stats.totalSessions > 0 && (
                <View className="mt-4 overflow-hidden rounded-lg border-4 border-stone-800 bg-amber-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={18} color="#F59E0B" />
                      <Text className="text-sm font-black uppercase text-stone-800">
                        Completion Rate
                      </Text>
                    </View>
                    <Text className="text-lg font-black text-amber-600">
                      {formatCompletionRate(stats.completionRate)}
                    </Text>
                  </View>
                  <View className="h-3 overflow-hidden rounded border-2 border-stone-800 bg-stone-200">
                    <View
                      className="h-full bg-amber-400"
                      style={{ width: `${stats.completionRate * 100}%` }}
                    />
                  </View>
                </View>
              )}
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
                <View className="space-y-4">
                  {recentSessions.map((session) => (
                    <View
                      key={session.id}
                      className="overflow-hidden rounded-lg border-4 border-stone-800 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      {/* Status bar */}
                      <View
                        className={`h-2 border-b-4 border-stone-800 ${
                          session.completed
                            ? 'bg-green-400'
                            : session.completionPercentage >= 50
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                        }`}
                      />

                      <View className="p-5">
                        <View className="mb-3 flex-row items-start justify-between">
                          <View className="flex-1">
                            <View className="mb-2 flex-row items-center">
                              <View
                                className={`rounded border-2 px-2 py-1 ${
                                  session.completed
                                    ? 'border-green-600 bg-green-50 shadow-[2px_2px_0px_0px_rgba(22,163,74,1)]'
                                    : session.completionPercentage >= 50
                                      ? 'border-amber-500 bg-amber-50 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]'
                                      : 'border-red-600 bg-red-50 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]'
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
                                    className={`text-xs font-black ${getCompletionColor(session)}`}>
                                    {getCompletionText(session)}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <View className="mb-2 flex-row items-center">
                              <View className="flex-row items-center rounded border-2 border-amber-500 bg-amber-50 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]">
                                <Ionicons name="time-outline" size={14} color="#F59E0B" />
                                <Text className="ml-1 text-sm font-black text-amber-700">
                                  {formatHistoryDuration(session.totalDurationMinutes)}
                                </Text>
                              </View>
                            </View>

                            <View className="flex-row items-center">
                              <Ionicons name="calendar-outline" size={12} color="#78716c" />
                              <Text className="ml-1 text-xs font-bold text-stone-600">
                                {formatHistoryDate(session.startedAt)} at{' '}
                                {formatHistoryTime(session.startedAt)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Segments */}
                        <View className="mb-4 flex-row flex-wrap gap-2">
                          {getEnabledSegments(session).map((segment, index) => (
                            <View
                              key={index}
                              className="rounded border-2 border-amber-500 bg-amber-50 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]">
                              <Text className="text-xs font-black text-amber-700">{segment}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => loadSession(session.id)}
                            activeOpacity={0.8}
                            className="flex-1 flex-row items-center justify-center rounded border-2 border-stone-800 bg-amber-400 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Ionicons name="play" size={18} color="#292524" />
                            <Text className="ml-2 text-sm font-black uppercase text-stone-900">
                              Repeat Session
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleSaveAsTemplate(session.id)}
                            activeOpacity={0.8}
                            className="rounded border-2 border-amber-500 bg-amber-50 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
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
          <View className="w-full max-w-sm overflow-hidden rounded-lg border-4 border-stone-800 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            {/* Header */}
            <View className="border-b-4 border-stone-800 bg-amber-400 px-6 py-5">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded border-2 border-stone-800 bg-amber-300">
                  <Ionicons name="bookmark" size={20} color="#292524" />
                </View>
                <Text className="text-xl font-black uppercase text-stone-900 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]">
                  Save as Template
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="mb-2 text-sm font-black uppercase text-stone-700">
                Template Name
              </Text>
              <TextInput
                value={sessionName}
                onChangeText={setSessionName}
                placeholder="Enter template name"
                className="mb-6 rounded border-2 border-stone-800 bg-amber-50 px-4 py-3 text-base font-bold text-stone-800"
                placeholderTextColor="#78716c"
                autoFocus
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowSaveDialog(false)}
                  activeOpacity={0.8}
                  className="flex-1 rounded border-2 border-stone-800 bg-stone-100 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <Text className="text-center text-base font-black uppercase text-stone-700">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmSaveTemplate}
                  activeOpacity={0.8}
                  className={`flex-1 rounded border-2 px-4 py-3 ${
                    sessionName.trim()
                      ? 'border-stone-800 bg-amber-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-stone-600 bg-stone-300'
                  }`}
                  disabled={!sessionName.trim()}>
                  <Text className="text-center text-base font-black uppercase text-stone-900">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
