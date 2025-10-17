import type { SavedSession } from '@/schemas/savedSession';
import { heavyHaptic, mediumHaptic } from '@/utils/haptics';
import { formatSessionDuration, getSessionUsageText } from '@/utils/sessionUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface SavedSessionCardProps {
  session: SavedSession;
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function SavedSessionCard({ session, onLoad, onDelete }: SavedSessionCardProps) {
  return (
    <Pressable
      onPress={() => {
        mediumHaptic();
        onLoad(session.id);
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className="mb-4 overflow-hidden rounded-xl bg-white shadow-md">
      {/* Accent bar */}
      <View className="h-1 bg-gradient-to-r from-[#E8B84B] to-[#D4A73D]" />

      <View className="flex-row items-center justify-between p-4">
        {/* Left side: Icon + Name + Duration */}
        <View className="flex-1 flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="mb-1 text-base font-semibold text-[#333333]" numberOfLines={1}>
              {session.name}
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="time-outline" size={14} color="#E8B84B" />
                <Text className="text-xs font-medium text-[#E8B84B]">
                  {formatSessionDuration(session.totalDuration)}
                </Text>
              </View>
              {session.useCount > 0 && (
                <>
                  <Text className="text-xs text-stone-300">•</Text>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="repeat" size={12} color="#78716c" />
                    <Text className="text-xs font-medium text-stone-500">
                      {getSessionUsageText(session.useCount)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Right side: Delete button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            heavyHaptic();
            onDelete(session.id);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="ml-3 rounded-lg bg-red-50 p-2.5 shadow-sm shadow-red-200/50">
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>
    </Pressable>
  );
}
