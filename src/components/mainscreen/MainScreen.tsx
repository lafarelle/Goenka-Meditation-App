import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { lightHaptic, mediumHaptic } from '@/utils/haptics';

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
      <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
        {/* Header with Saved Sessions and Settings buttons */}
        <View className="flex-row items-center justify-between px-8 pb-8 pt-16">
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => {
                lightHaptic();
                setIsSavedSessionsDrawerVisible(true);
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: pressed ? '#E8B84B' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                },
              ]}
              className="rounded-2xl p-3">
              <Ionicons name="bookmark-outline" size={24} color="#333333" />
            </Pressable>
            <Pressable
              onPress={() => {
                lightHaptic();
                setIsHistoryDrawerVisible(true);
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: pressed ? '#E8B84B' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                },
              ]}
              className="rounded-2xl p-3">
              <Ionicons name="time-outline" size={24} color="#333333" />
            </Pressable>
          </View>
          <Link href="/settings" asChild>
            <Pressable
              onPress={() => lightHaptic()}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: pressed ? '#E8B84B' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                },
              ]}
              className="rounded-2xl p-3">
              <Ionicons name="settings-outline" size={24} color="#333333" />
            </Pressable>
          </Link>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-8 px-8 py-6"
          showsVerticalScrollIndicator={false}>
          {/* Title with serene styling */}
          <View className="mb-4 items-center">
            <Text
              className="text-center text-5xl font-light tracking-wide"
              style={{ color: '#333333' }}>
              Goenka
            </Text>
          </View>

          <DurationSelector />
          <SegmentSelector />

          <SessionPreview />

          <Link href="/meditation" asChild>
            <Pressable
              onPress={() => mediumHaptic()}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.85 : 1,
                  backgroundColor: '#E8B84B',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 4,
                },
              ]}
              className="rounded-2xl px-8 py-6">
              <Text
                className="text-center text-lg font-medium tracking-wide"
                style={{ color: '#333333' }}>
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
