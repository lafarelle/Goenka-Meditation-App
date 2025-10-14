import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
        <View className="flex-row items-center px-6 pb-4 pt-16">
          <TouchableOpacity
            onPress={() => setIsSavedSessionsDrawerVisible(true)}
            activeOpacity={0.8}
            className="items-center p-2">
            <Ionicons name="bookmark-outline" size={24} color="#57534e" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsHistoryDrawerVisible(true)}
            activeOpacity={0.8}
            className="items-center p-2">
            <Ionicons name="time-outline" size={24} color="#57534e" />
          </TouchableOpacity>
          <View className="flex-1" />
          <Link href="/settings" asChild>
            <TouchableOpacity activeOpacity={0.8} className="items-center p-2">
              <Ionicons name="settings-outline" size={24} color="#57534e" />
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-6 py-6"
          showsVerticalScrollIndicator={false}>
          <Text className="-mt-4 mb-4 text-center text-4xl font-bold text-stone-800">GOENKA</Text>
          <DurationSelector />
          <SegmentSelector />

          <SessionPreview />

          <Link href="/meditation" asChild>
            <Button title="Start Meditation" className="py-4" />
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
