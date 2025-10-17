import { useHistoryStore } from '@/store/historyStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { lightHaptic } from '@/utils/haptics';
import {
  formatHistoryDate,
  formatTotalMeditationTime,
  loadHistorySessionIntoStore,
} from '@/utils/historyUtils';
import { createSegmentsCopy } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { HistorySessionCard } from './HistorySessionCard';
import { MeditationHeatmap } from './MeditationHeatmap';

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
              <Text className="text-2xl font-bold text-[#333333]">History</Text>
            </View>
            <Pressable
              onPress={() => {
                lightHaptic();
                onClose();
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="rounded-xl bg-stone-100 p-2.5 shadow-sm shadow-stone-300/50">
              <Ionicons name="close" size={24} color="#333333" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1">
          {/* Analytics Section */}
          <View className="border-b border-stone-200 bg-white px-8 pb-8 pt-8">
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

          {/* Meditation Heatmap */}
          <View className="px-8 pb-8 pt-8">
            <MeditationHeatmap months={3} />
          </View>

          {/* Recent Sessions */}
          <View className="px-8 pb-8 pt-8">
            <View className="mb-6 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-stone-100">
                <Ionicons name="list" size={20} color="#78716c" />
              </View>
              <Text className="text-xl font-semibold text-[#333333]">Recent Sessions</Text>
            </View>

            {recentSessions.length === 0 ? (
              <View className="items-center py-20">
                <View className="mb-6 h-28 w-28 items-center justify-center rounded-3xl bg-stone-100 shadow-md shadow-stone-300/50">
                  <Ionicons name="time-outline" size={56} color="#78716c" />
                </View>
                <Text className="mb-3 text-xl font-semibold text-[#333333]">No Sessions Yet</Text>
                <Text className="text-center text-base text-stone-500">
                  Your meditation history will{'\n'}appear here
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {recentSessions.map((session) => (
                  <HistorySessionCard
                    key={session.id}
                    session={session}
                    onLoad={loadSession}
                    onSaveAsTemplate={handleSaveAsTemplate}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
