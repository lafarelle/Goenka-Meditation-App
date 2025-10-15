import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AudioSelectionProvider } from './AudioSelectionProvider';
import { DurationSelector } from './DurationSelector';
import { HistorySessionDrawer } from './HistorySessionDrawer';
import { SavedSessionDrawer } from './SavedSessionDrawer';
import { SegmentSelector } from './SegmentSelector';
import { SessionPreview } from './SessionPreview';

export function MainScreen() {
  const [isSavedSessionsDrawerVisible, setIsSavedSessionsDrawerVisible] = useState(false);
  const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false);

  return (
    <AudioSelectionProvider>
      <View className="flex-1 bg-stone-50">
        {/* Header with Saved Sessions and Settings buttons */}
        <View className="flex-row items-center justify-between px-6 pb-6 pt-16">
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setIsSavedSessionsDrawerVisible(true)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="border-3 rounded-lg border-stone-800 bg-amber-100 p-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Ionicons name="bookmark-outline" size={24} color="#F59E0B" />
            </Pressable>
            <Pressable
              onPress={() => setIsHistoryDrawerVisible(true)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="border-3 rounded-lg border-stone-800 bg-amber-100 p-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
            </Pressable>
          </View>
          <Link href="/settings" asChild>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="border-3 rounded-lg border-stone-800 bg-amber-100 p-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Ionicons name="settings-outline" size={24} color="#F59E0B" />
            </Pressable>
          </Link>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-6 py-6"
          showsVerticalScrollIndicator={false}>
          {/* Title with neobrutalism styling */}
          <View className="-mt-4 mb-1 items-center">
            <View className="rounded-xl border-4 border-stone-800 bg-gradient-to-r from-amber-300 to-amber-400 px-8 py-3">
              <Text className="text-center text-4xl font-black text-stone-900">GOENKA</Text>
            </View>
          </View>

          <DurationSelector />
          <SegmentSelector />

          <SessionPreview />

          <Link href="/meditation" asChild>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="rounded-xl border-4 border-stone-800 bg-amber-400 px-8 py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Text className="text-center text-xl font-black uppercase tracking-wide text-stone-900">
                Start Meditation
              </Text>
            </Pressable>
          </Link>
        </ScrollView>

        {/* Saved Sessions Drawer */}
        <SavedSessionDrawer
          isVisible={isSavedSessionsDrawerVisible}
          onClose={() => setIsSavedSessionsDrawerVisible(false)}
        />
        <HistorySessionDrawer
          isVisible={isHistoryDrawerVisible}
          onClose={() => setIsHistoryDrawerVisible(false)}
        />
      </View>
    </AudioSelectionProvider>
  );
}
