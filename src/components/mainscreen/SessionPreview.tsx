import { segmentTypeToAudioMap } from '@/data/audioData';
import { SessionSegmentType } from '@/schemas/session';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';
import {
  formatDuration,
  formatDurationWithSeconds,
  getEffectiveDuration,
} from '@/utils/preferences';
import { createSegmentsCopy, isValidSessionName } from '@/utils/sessionUtils';
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

  const orderedSegmentTypes: SessionSegmentType[] = [
    'openingChant',
    'openingGuidance',
    'techniqueReminder',
    'silent',
    'metta',
    'closingChant',
  ];

  // Get enabled segments only
  const enabledSegments = orderedSegmentTypes.filter((type) => {
    const segment = segments[type];
    if (!segment) return false;
    if (type === 'silent') {
      // Include silent if there's any silent duration or if it's the only thing enabled
      return (
        getSilentDurationSec() > 0 ||
        Object.values(segments).every((s) => s.type === 'silent' || !s.isEnabled)
      );
    }
    return segment.isEnabled;
  });

  // Show a message if no segments are enabled (silent-only session)
  const isSilentOnlySession = enabledSegments.length === 1 && enabledSegments[0] === 'silent';

  // Color mapping for segment types - using warm theme colors
  const getSegmentColor = (type: SessionSegmentType): string => {
    if (type === 'openingChant' || type === 'closingChant') return '#D4A73D'; // darker gold
    if (type === 'openingGuidance') return '#E8B84B'; // main gold
    if (type === 'techniqueReminder') return '#F0C86E'; // lighter gold
    if (type === 'metta') return '#C89635'; // bronze/amber
    if (type === 'silent') return '#A8A8A8'; // neutral gray
    return '#D4A73D'; // default gold
  };

  // Get selected audio names for display
  const getSelectedAudioNames = (type: SessionSegmentType): string[] => {
    const segment = segments[type];
    if (!segment || segment.selectedAudioIds.length === 0) return ['None'];

    const audioOptions = segmentTypeToAudioMap[type];
    if (!audioOptions) return ['None'];

    return segment.selectedAudioIds
      .map((id: string) => audioOptions.find((audio) => audio.id === id)?.name)
      .filter(Boolean) as string[];
  };

  // Calculate total duration for timeline
  const getTotalDurationSec = () => {
    return totalDurationMinutes * 60;
  };

  const handleSaveSession = () => {
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
    <View className="mb-8 rounded-2xl bg-white p-8 shadow-lg shadow-stone-300/50">
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="rounded-xl bg-[#E8B84B]/10 p-3">
            <Ionicons name="time-outline" size={24} color="#E8B84B" />
          </View>
          <Text className="text-xl font-bold text-[#333333]">Session Preview</Text>
        </View>
        <Pressable
          onPress={handleSaveSession}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="flex-row items-center gap-2 rounded-xl bg-[#E8B84B] px-5 py-3 shadow-md shadow-[#E8B84B]/30">
          <Ionicons name="save-outline" size={18} color="#333333" />
          <Text className="text-sm font-semibold text-[#333333]">Save</Text>
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
            {enabledSegments.map((type) => {
              const segment = segments[type];
              if (!segment) return null;

              const duration =
                type === 'silent'
                  ? getSilentDurationSec()
                  : getSegmentDisplayDuration(type, segment.selectedAudioIds, segment.durationSec);
              if (duration === 0) return null;

              const color = getSegmentColor(type);
              const totalDurationSec = getTotalDurationSec();
              const flexGrow = totalDurationSec > 0 ? duration / totalDurationSec : 0;

              return (
                <View key={type} className="h-full" style={{ flexGrow, backgroundColor: color }} />
              );
            })}
          </View>

          {/* Segment Breakdown */}
          <View className="space-y-4">
            {enabledSegments.map((type) => {
              const segment = segments[type];
              if (!segment) return null;

              const displayDurationSec =
                type === 'silent'
                  ? getSilentDurationSec()
                  : getSegmentDisplayDuration(type, segment.selectedAudioIds, segment.durationSec);

              if (displayDurationSec === 0) return null;

              const displayDurationMin = Math.floor(displayDurationSec / 60);
              const displayRemainderSec = displayDurationSec % 60;
              const color = getSegmentColor(type);
              const selectedAudioNames = getSelectedAudioNames(type);

              return (
                <View key={type} className="flex-row items-center justify-between py-2">
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
                      <Text className="font-semibold text-[#333333]">{segment.label}</Text>
                      {selectedAudioNames.length > 0 && selectedAudioNames[0] !== 'None' && (
                        <Text className="mt-1 text-xs text-stone-500">
                          {selectedAudioNames.join(', ')}
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

      {/* Total Duration */}
      <View className="mt-6 space-y-3 rounded-xl bg-stone-50 p-6">
        {(() => {
          const effectiveDuration = getEffectiveDuration(
            totalDurationMinutes,
            segments,
            preferences.timingPreference,
            preferences.pauseDuration,
            preferences.gongEnabled,
            preferences.gongPreference
          );

          // Calculate exact seconds for all components
          const audioDurationSec = effectiveDuration.audioDurationSec || 0;
          const gongDurationSec = effectiveDuration.gongDurationSec || 0;
          const pauseDurationSec = effectiveDuration.pauseDurationSec || 0;

          // Check for warning condition first
          const nonSilentDurationSec = audioDurationSec + gongDurationSec + pauseDurationSec;
          const selectedDurationSec = totalDurationMinutes * 60;
          const showWarning =
            preferences.timingPreference === 'total' && nonSilentDurationSec >= selectedDurationSec;

          // Calculate total duration based on timing preference and warning condition
          const silentDurationSec = effectiveDuration.silentMinutes * 60;
          const totalDurationSec =
            preferences.timingPreference === 'total'
              ? showWarning
                ? nonSilentDurationSec // Use full audio + gong + pause duration when warning
                : totalDurationMinutes * 60 // Use selected duration when no warning
              : audioDurationSec + gongDurationSec + pauseDurationSec + silentDurationSec; // Calculate total for silent preference

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
                <Text className="text-base font-semibold text-[#333333]">
                  {preferences.timingPreference === 'total' ? 'Total Session' : 'Silent Meditation'}
                </Text>
                <Text className="text-base font-bold text-[#E8B84B]">
                  {preferences.timingPreference === 'total'
                    ? formatDuration(totalDurationMinutes)
                    : formatDuration(effectiveDuration.silentMinutes)}
                </Text>
              </View>

              {effectiveDuration.audioMinutes > 0 && (
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-sm text-stone-500">+ Audio Content</Text>
                  <Text className="text-sm font-medium text-stone-600">
                    {formatDurationWithSeconds(audioDurationSec)}
                  </Text>
                </View>
              )}

              {gongDurationSec > 0 && (
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-sm text-stone-500">+ Gong</Text>
                  <Text className="text-sm font-medium text-stone-600">
                    {formatDurationWithSeconds(gongDurationSec)}
                  </Text>
                </View>
              )}

              {preferences.pauseDuration > 0 && pauseDurationSec > 0 && (
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-sm text-stone-500">+ Pause Duration</Text>
                  <Text className="text-sm font-medium text-stone-600">
                    {formatDurationWithSeconds(pauseDurationSec)}
                  </Text>
                </View>
              )}

              {(effectiveDuration.audioMinutes > 0 ||
                gongDurationSec > 0 ||
                (preferences.pauseDuration > 0 && pauseDurationSec > 0)) && (
                <View className="mt-4 flex-row items-center justify-between border-t border-stone-200 pt-4">
                  <Text className="text-base font-semibold text-[#333333]">
                    {preferences.timingPreference === 'total' ? 'Actual Duration' : 'Total Session'}
                  </Text>
                  <Text className="text-base font-bold text-[#E8B84B]">
                    {formatDurationWithSeconds(totalDurationSec)}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}
      </View>
    </View>
  );
}
