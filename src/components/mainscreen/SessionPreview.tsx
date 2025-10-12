import { segmentTypeToAudioMap } from '@/data/audioData';
import { SessionSegmentType } from '@/schemas/session';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSavedSessionsStore } from '@/store/savedSessionsStore';
import { useSessionStore } from '@/store/sessionStore';
import { getSegmentDisplayDuration } from '@/utils/audioDurationUtils';
import { formatDuration, getEffectiveDuration } from '@/utils/preferences';
import { createSegmentsCopy, isValidSessionName } from '@/utils/sessionUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

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

  // Color mapping for segment types
  const getSegmentColor = (type: SessionSegmentType): string => {
    if (type === 'openingChant' || type === 'closingChant') return 'bg-purple-500';
    if (type === 'openingGuidance') return 'bg-blue-500';
    if (type === 'techniqueReminder') return 'bg-green-500';
    if (type === 'metta') return 'bg-pink-500';
    if (type === 'silent') return 'bg-gray-600';
    return 'bg-gray-500';
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
    <View className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={20} color="#F59E0B" className="mr-2" />
          <Text className="ml-2 text-lg font-semibold text-stone-800">Session Preview</Text>
        </View>
        <TouchableOpacity
          onPress={handleSaveSession}
          className="flex-row items-center rounded-lg bg-amber-500 px-4 py-2">
          <Ionicons name="save-outline" size={16} color="#1F2937" />
          <Text className="ml-2 font-medium text-stone-800">Save Session</Text>
        </TouchableOpacity>
      </View>

      {isSilentOnlySession ? (
        // Silent-only session display
        <View className="items-center py-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <Ionicons name="leaf-outline" size={32} color="#F59E0B" />
          </View>
          <Text className="mb-2 text-xl font-semibold text-stone-800">Silent Meditation</Text>
          <Text className="text-center text-stone-600">Pure silent meditation session</Text>
        </View>
      ) : (
        <View className="mb-8">
          {/* Timeline Bar */}
          <View className="mb-4 h-3 flex-row overflow-hidden rounded-full bg-stone-200">
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

              return <View key={type} className={`${color} h-full`} style={{ flexGrow }} />;
            })}
          </View>

          {/* Segment Breakdown */}
          <View className="space-y-3">
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
                <View key={type} className="mb-4 flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <View className={`h-3 w-3 ${color} mr-3 rounded-full`} />
                    <View className="flex-1">
                      <Text className="font-medium text-stone-800">{segment.label}</Text>
                      {selectedAudioNames.length > 0 && selectedAudioNames[0] !== 'None' && (
                        <Text className="text-xs text-stone-600">
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
      <View className="mt-4 border-t border-stone-200 pt-4">
        {(() => {
          const effectiveDuration = getEffectiveDuration(
            totalDurationMinutes,
            segments,
            preferences.timingPreference
          );

          return (
            <View className="space-y-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-stone-800">
                  {preferences.timingPreference === 'total' ? 'Total Session' : 'Silent Meditation'}
                </Text>
                <Text className="text-lg font-semibold text-amber-600">
                  {preferences.timingPreference === 'total'
                    ? formatDuration(totalDurationMinutes)
                    : formatDuration(effectiveDuration.silentMinutes)}
                </Text>
              </View>

              {preferences.timingPreference === 'silent' && effectiveDuration.audioMinutes > 0 && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-stone-600">+ Audio Content</Text>
                  <Text className="text-sm text-stone-600">
                    {formatDuration(effectiveDuration.audioMinutes)}
                  </Text>
                </View>
              )}

              {preferences.timingPreference === 'silent' && (
                <View className="mt-4 flex-row items-center justify-between border-t border-stone-200 pt-2">
                  <Text className="mt-1 text-lg font-semibold text-stone-800">Total Session</Text>
                  <Text className="mt-1 text-lg font-semibold text-amber-600">
                    {formatDuration(effectiveDuration.totalMinutes)}
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
