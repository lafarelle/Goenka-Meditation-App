import type { HistorySession } from '@/schemas/history';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { mediumHaptic } from '@/utils/haptics';
import { formatHistoryDate, formatHistoryDuration } from '@/utils/historyUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface HistorySessionCardProps {
  session: HistorySession;
  onLoad: (sessionId: string) => void;
  onSaveAsTemplate: (sessionId: string) => void;
}

export function HistorySessionCard({ session, onLoad, onSaveAsTemplate }: HistorySessionCardProps) {
  const isSaved = useSavedSessionsStore
    .getState()
    .saved.some((saved) => saved.name.includes(formatHistoryDate(session.startedAt)));

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return '#78716c'; // stone-500 - completed
    if (percentage >= 50) return '#a8a29e'; // stone-400 - partially completed
    return '#d6d3d1'; // stone-300 - early termination
  };

  const getCompletionIcon = (percentage: number) => {
    if (percentage >= 90) return 'checkmark-circle';
    if (percentage >= 50) return 'ellipse-outline';
    return 'close-circle';
  };

  return (
    <View className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm shadow-stone-300/50">
      {/* Left side: Info */}
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <Ionicons
            name={getCompletionIcon(session.completionPercentage)}
            size={16}
            color={getCompletionColor(session.completionPercentage)}
          />
          <Text className="text-sm font-medium text-stone-700">
            {formatHistoryDuration(session.totalDurationMinutes)}
          </Text>
          <Text className="text-xs text-stone-400">•</Text>
          <Text className="text-xs text-stone-500">{formatHistoryDate(session.startedAt)}</Text>
        </View>

        {/* Completion Percentage */}
        <View className="mt-2 flex-row items-center gap-2">
          <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
            <View
              className="h-full rounded-full"
              style={{
                width: `${session.completionPercentage}%`,
                backgroundColor: getCompletionColor(session.completionPercentage),
              }}
            />
          </View>
          <Text
            className="text-xs font-medium"
            style={{ color: getCompletionColor(session.completionPercentage) }}>
            {Math.round(session.completionPercentage)}%
          </Text>
        </View>
      </View>

      {/* Right side: Actions */}
      <View className="ml-3 flex-row gap-2">
        <Pressable
          onPress={() => {
            mediumHaptic();
            onLoad(session.id);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          className="h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
          <Ionicons name="play" size={16} color="#57534e" />
        </Pressable>
        <Pressable
          onPress={() => {
            mediumHaptic();
            onSaveAsTemplate(session.id);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          className="h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={16} color="#57534e" />
        </Pressable>
      </View>
    </View>
  );
}
