import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

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
  const [isSessionPreviewVisible, setIsSessionPreviewVisible] = useState(false);

  return (
    <AudioSelectionProvider>
      <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
        {/* Header with Saved Sessions and Settings buttons */}
        <View className="flex-row items-center justify-between px-8 pb-4 pt-20">
          <View className="flex-row gap-6">
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
          contentContainerClassName="gap-4 px-8"
          showsVerticalScrollIndicator={false}>
          {/* Title with serene styling - split into two lines */}
          <View className=" items-center">
            <Text
              className="text-center text-lg font-light tracking-wide"
              style={{ color: '#333333' }}>
              Meditate with
            </Text>
            <Text
              className=" text-center text-5xl font-semibold tracking-wide"
              style={{ color: '#333333' }}>
              GOENKA
            </Text>
          </View>

          <DurationSelector />
          <SegmentSelector />

          <View className="items-center">
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
                className="mb-6 mt-4 rounded-2xl border px-8 py-3">
                <Text
                  className=" text-center text-2xl font-bold tracking-wide"
                  style={{ color: '#333333' }}>
                  Start Meditation
                </Text>
              </Pressable>
            </Link>

            {/* Toggle Session Preview Button */}
            <Pressable
              onPress={() => {
                lightHaptic();
                setIsSessionPreviewVisible(true);
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              className="mb-16 py-2">
              <Text className="text-center text-sm underline" style={{ color: '#666666' }}>
                Show Session Preview
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Session Preview Drawer */}
        <Modal
          visible={isSessionPreviewVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsSessionPreviewVisible(false)}>
          <View className="flex-1 bg-[#F5F5EC]">
            {/* Header */}
            <View className="border-b border-stone-200 bg-white px-8 py-6 pt-16">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
                    <Ionicons name="eye-outline" size={24} color="#E8B84B" />
                  </View>
                  <Text className="text-2xl font-bold text-[#333333]">Session Preview</Text>
                </View>
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    setIsSessionPreviewVisible(false);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="rounded-xl bg-stone-100 p-2.5">
                  <Ionicons name="close" size={24} color="#333333" />
                </Pressable>
              </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-8 py-8">
              <SessionPreview />
            </ScrollView>
          </View>
        </Modal>

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
