import { usePreferencesStore } from '@/store/preferencesStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { mediumHaptic } from '@/utils/haptics';
import { formatDuration, formatDurationWithSeconds } from '@/utils/preferences';
import { createSegmentsCopy, isValidSessionName } from '@/utils/sessionUtils';
import {
  buildSessionTimeline,
  calculateTimelineTotalDuration,
  calculateTimelineAudioDuration,
  calculateTimelineGongDuration,
  calculateTimelinePauseDuration,
  getTimelineItemColor,
} from '@/utils/sessionTimelineBuilder';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

interface SessionPreviewProps {
  onSaveSession?: () => void;
}

export function SessionPreview({ onSaveSession }: SessionPreviewProps) {
  const { segments, totalDurationMinutes, getSilentDurationSec } = useSessionStore();
  const { preferences } = usePreferencesStore();
  const { saveSession } = useSavedSessionsStore();

  // Build the session timeline using the utility function
  const timeline = buildSessionTimeline(
    segments,
    preferences.pauseDuration,
    preferences.gongEnabled,
    preferences.gongPreference,
    getSilentDurationSec
  );

  // Show a message if no segments are enabled (silent-only session)
  const isSilentOnlySession = timeline.length === 1 && timeline[0].type === 'silent';

  // Calculate total duration based on timing preference
  const getTotalDurationSec = () => {
    if (preferences.timingPreference === 'total') {
      // For 'total' mode, the total is fixed at the selected duration
      // UNLESS audio/gong/pauses exceed it (warning case)
      const timelineTotal = calculateTimelineTotalDuration(timeline);
      const selectedTotal = totalDurationMinutes * 60;

      // If timeline exceeds selected duration, use timeline total (warning case)
      return Math.max(timelineTotal, selectedTotal);
    } else {
      // For 'silent' mode, sum up all timeline items (audio + silent + pauses + gong)
      return calculateTimelineTotalDuration(timeline);
    }
  };

  const handleSaveSession = () => {
    mediumHaptic();
    // Show input dialog
    Alert.prompt(
      'Save Session',
      'Enter a name for this meditation session:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (name?: string) => {
            if (isValidSessionName(name)) {
              const segmentsCopy = createSegmentsCopy(segments);
              saveSession(name!.trim(), totalDurationMinutes, segmentsCopy);
              Alert.alert('Success', 'Session saved successfully!');
            } else {
              Alert.alert('Error', 'Please enter a valid session name.');
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  return (
    <View className="mb-8 rounded-2xl  p-6">
      <View className="mb-6 flex-row items-center justify-between gap-16">
        <View className="flex-row items-center gap-3">
          <Text className="text-xl font-bold ">Session Preview</Text>
        </View>
        <Pressable
          onPress={handleSaveSession}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          className="flex-row items-center gap-2 rounded-2xl p-2 shadow-lg">
          <Ionicons name="bookmark-outline" size={20} color="#333333" />
          <Text className="text-base font-bold ">Save</Text>
        </Pressable>
      </View>

      {isSilentOnlySession ? (
        // Silent-only session display
        <View className="items-center py-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
            <Ionicons name="leaf-outline" size={32} color="#E8B84B" />
          </View>
          <Text className="text-base font-semibold text-[#333333]">Silent Meditation</Text>
          <Text className="mt-2 text-sm text-stone-500">Pure silent session</Text>
        </View>
      ) : (
        <View className="mb-6">
          {/* Timeline Bar */}
          <View className="mb-6 h-4 flex-row overflow-hidden rounded-full bg-stone-100">
            {timeline.map((item, index) => {
              if (item.durationSec === 0) return null;

              const color = getTimelineItemColor(item.type);
              const totalDurationSec = getTotalDurationSec();
              const flexGrow = totalDurationSec > 0 ? item.durationSec / totalDurationSec : 0;

              return (
                <View
                  key={`${item.type}-${index}`}
                  className="h-full"
                  style={{ flexGrow, backgroundColor: color }}
                />
              );
            })}
          </View>

          {/* Segment Breakdown */}
          <View className="space-y-4">
            {timeline.map((item, index) => {
              if (item.durationSec === 0) return null;

              const displayDurationMin = Math.floor(item.durationSec / 60);
              const displayRemainderSec = item.durationSec % 60;
              const color = getTimelineItemColor(item.type);

              return (
                <View
                  key={`${item.type}-${index}`}
                  className="flex-row items-center justify-between py-2">
                  <View className="flex-1 flex-row items-center gap-4">
                    <View
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: color,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-[#333333]">{item.label}</Text>
                      {item.audioName && (
                        <Text className="mt-1 text-xs text-stone-500">
                          {item.isRandom && '🎲 '}
                          {item.audioName}
                          {item.isRandom && ' (Random)'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text className="font-medium text-stone-600">
                    {displayDurationMin > 0 ? `${displayDurationMin} min` : ''}
                    {displayDurationMin > 0 && displayRemainderSec > 0 ? ' ' : ''}
                    {displayRemainderSec > 0 ? `${displayRemainderSec} sec` : ''}
                    {displayDurationMin === 0 && displayRemainderSec === 0 ? '0 sec' : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Total Duration Summary */}
      <View className="mt-6 space-y-3 rounded-xl bg-stone-50 p-6">
        {(() => {
          // Calculate durations from the actual timeline
          const audioDurationSec = calculateTimelineAudioDuration(timeline);
          const gongDurationSec = calculateTimelineGongDuration(timeline);
          const pauseDurationSec = calculateTimelinePauseDuration(timeline);

          // Check for warning condition first
          const nonSilentDurationSec = audioDurationSec + gongDurationSec + pauseDurationSec;
          const selectedDurationSec = totalDurationMinutes * 60;
          const showWarning =
            preferences.timingPreference === 'total' && nonSilentDurationSec >= selectedDurationSec;

          // Calculate total duration based on timing preference
          const totalDurationSec = getTotalDurationSec();

          return (
            <View className="space-y-3">
              {/* Warning message */}
              {showWarning && (
                <View className="mb-4 rounded-xl bg-red-50 p-4 shadow-sm shadow-red-200/50">
                  <Text className="text-sm font-medium leading-5 text-red-700">
                    ⚠️ Warning: Audio content, gong, and pauses (
                    {formatDurationWithSeconds(nonSilentDurationSec)}) exceed or equal the selected
                    duration ({formatDuration(totalDurationMinutes)}). There will be no silent
                    meditation time.
                  </Text>
                </View>
              )}

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base font-semibold text-[#333333]">Total Session</Text>
                <Text className="text-base font-bold text-[#E8B84B]">
                  {formatDurationWithSeconds(totalDurationSec)}
                </Text>
              </View>
            </View>
          );
        })()}
      </View>
    </View>
  );
}
