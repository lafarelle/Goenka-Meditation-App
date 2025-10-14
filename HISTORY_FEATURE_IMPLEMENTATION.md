# History Feature Implementation

## Overview

The history feature has been fully implemented to track meditation sessions with complete detail, including:
- Session configuration (segments, preferences, duration)
- Playback sequence (what actually played and when)
- Completion tracking (completed vs stopped early)
- Analytics-ready data (streaks, total time, favorite audios)

## Files Modified/Created

### 1. **src/schemas/history.ts** (NEW)
Complete type definitions for history tracking:

- `HistorySession` - Complete session record with all metadata
- `PlaybackEvent` - Individual audio playback tracking
- `HistorySegmentConfig` - Segment configuration snapshot
- `HistoryPreferences` - Preferences snapshot
- `CalculatedDurations` - Analytics data
- `HistoryStats` - Derived statistics

Helper functions:
- `createPlaybackEvent()` - Create a playback event
- `calculateStreak()` - Calculate consecutive day streaks
- `calculateLongestStreak()` - Find longest streak
- `getTotalMeditationTime()` - Sum all meditation time
- `getCompletionRate()` - Calculate completion percentage

### 2. **src/store/historyStore.ts** (COMPLETELY REWRITTEN)
Zustand store with AsyncStorage persistence:

**Session Management:**
- `startSession()` - Creates new history entry when session starts
- `addPlaybackEvent()` - Tracks each audio/segment played
- `completeSession()` - Marks session as completed
- `stopSession()` - Marks session as stopped early with timing

**Analytics Methods:**
- `getStats()` - Get comprehensive statistics
- `getCurrentStreak()` - Get current consecutive day streak
- `getLongestStreak()` - Get longest streak ever
- `getTotalMeditationMinutes()` - Get total time meditated
- `getCompletionRate()` - Get percentage of completed sessions

**Query Methods:**
- `getRecentSessions()` - Get last N sessions
- `getFilteredSessions()` - Filter by date range and completion status

**Data Management:**
- Stores last 100 sessions
- Persists to AsyncStorage automatically
- Handles data migration gracefully

### 3. **src/audio/AudioSessionManager.ts** (MODIFIED)
Integrated history tracking throughout the session lifecycle:

**New Properties:**
- `currentHistorySessionId` - Tracks the current session's history ID
- `currentAudioStartTime` - Tracks when current audio/segment started

**New Helper Methods:**
- `createHistoryEntry()` - Creates history entry from session config
- `recordPlaybackEvent()` - Records individual playback events
- `recordCurrentAudioPlayback()` - Records current audio with completion status
- `getSegmentTypeForBeforeSilentAudio()` - Maps audio index to segment type
- `getSegmentTypeForAfterSilentAudio()` - Maps audio index to segment type
- `getElapsedSeconds()` - Gets elapsed time since session start

**Integration Points:**

1. **Session Start** (`startSession()`)
   - Creates history entry with full session configuration
   - Stores history session ID

2. **Audio Playback Start**
   - `playGong()` - Tracks gong start time
   - `playBeforeSilentAudio()` - Tracks each before-silent audio start
   - `playAfterSilentAudio()` - Tracks each after-silent audio start
   - `playEndGong()` - Tracks end gong start time

3. **Audio Playback Complete** (`handleAudioFinished()`)
   - Records completed playback event with actual duration
   - Tracks segment type, audio ID, timing, and completion status

4. **Silent Meditation**
   - `startSilentMeditation()` - Tracks when silent meditation starts
   - `transitionToAfterSilent()` - Records silent meditation as completed

5. **Session Complete** (`finalizeSession()`)
   - Records final playback event
   - Marks session as completed in history
   - Calculates actual duration

6. **Session Stopped** (`stop()`)
   - Records current audio as incomplete
   - Marks session as stopped with timing
   - Calculates completion percentage

### 4. **src/schemas/index.ts** (MODIFIED)
Added export for history schemas

## Data Structure

### HistorySession Example
```typescript
{
  id: "uuid-v4",
  startedAt: "2025-10-14T10:30:00.000Z",
  endedAt: "2025-10-14T11:00:00.000Z",
  completed: true,
  completionPercentage: 100,
  totalDurationMinutes: 30,
  
  preferences: {
    timingPreference: "total",
    gongPreference: "G1",
    pauseDuration: 5
  },
  
  segments: {
    openingChant: {
      isEnabled: true,
      durationSec: 180,
      selectedAudioIds: ["oc1"]
    },
    silent: {
      isEnabled: true,
      durationSec: 1200
    },
    metta: {
      isEnabled: true,
      durationSec: 300,
      selectedAudioIds: ["m1"]
    }
  },
  
  calculatedDurations: {
    totalSessionSec: 1800,
    silentMeditationSec: 1200,
    audioSegmentsSec: 600
  },
  
  playbackSequence: [
    {
      segmentType: "gong",
      audioId: "g1",
      startedAt: 0,
      duration: 5,
      completed: true
    },
    {
      segmentType: "openingChant",
      audioId: "oc1",
      startedAt: 10,
      duration: 180,
      completed: true
    },
    {
      segmentType: "silent",
      startedAt: 195,
      duration: 1200,
      completed: true
    },
    {
      segmentType: "metta",
      audioId: "m1",
      startedAt: 1400,
      duration: 300,
      completed: true
    },
    {
      segmentType: "gong",
      audioId: "g1",
      startedAt: 1705,
      duration: 5,
      completed: true
    }
  ]
}
```

## Features Enabled

### 1. **Complete Session Replay**
Every detail needed to recreate the exact session is stored:
- All segment configurations
- Audio selections in order
- Timing preferences
- Calculated durations

### 2. **Analytics**
- Current streak (consecutive days with completed sessions)
- Longest streak ever
- Total meditation time
- Completion rate
- Sessions per day/week/month

### 3. **User Features** (Ready to Implement)
- "Repeat Last Session" - Use last session config
- "Favorite Sessions" - Save and replay favorite configurations
- Session Templates - Create templates from history
- Progress Tracking - Visualize meditation journey

### 4. **Debugging**
- See exactly what played and when
- Track incomplete sessions
- Identify issues with specific audio or segments

## Audio ID System

The current audio ID system was **kept as-is** because it's well-designed:
- **Lowercase IDs** in data layer: `'oc1'`, `'ew1'`, `'a1'`, `'v1'`, `'m1'`, `'cc1'`, `'g1'`
- **Uppercase keys** for file references: `OC1`, `EW1`, `A1`, `V1`, `M1`, `CC1`, `G1`
- Semantic and debuggable
- Database-friendly
- Clear mapping between IDs and files

## Testing Recommendations

1. **Complete Session Test**
   - Start a session with all segments enabled
   - Let it complete fully
   - Verify history entry has all playback events
   - Check completion percentage is 100%

2. **Stopped Session Test**
   - Start a session
   - Stop it midway through
   - Verify history entry shows stopped status
   - Check completion percentage is accurate

3. **Streak Test**
   - Complete sessions on consecutive days
   - Verify streak calculation is correct
   - Skip a day and verify streak resets

4. **Analytics Test**
   - Complete multiple sessions
   - Verify total meditation time
   - Verify completion rate
   - Check stats are accurate

## Next Steps

1. **UI for History View**
   - Display recent sessions
   - Show analytics (streaks, total time)
   - Session detail view

2. **Repeat Session Feature**
   - Convert history entry back to session config
   - Load into sessionStore
   - Start session with same configuration

3. **Session Templates**
   - Save favorite configurations
   - Name and organize templates
   - Quick start from template

4. **Advanced Analytics**
   - Charts and graphs
   - Meditation patterns
   - Progress over time
   - Favorite audio combinations

