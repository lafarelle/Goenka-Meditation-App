# History & Saved Sessions - Feature Integration

## Overview

The Goenka meditation app now has two complementary features for managing meditation sessions:

1. **History** - Automatic tracking of all meditation sessions
2. **Saved Sessions** - User-created templates for quick session setup

These features work together seamlessly to provide a complete meditation tracking and management experience.

---

## Feature Comparison

| Feature | History | Saved Sessions |
|---------|---------|----------------|
| **Purpose** | Automatic tracking of completed sessions | User-created templates for reuse |
| **Creation** | Automatic (every session) | Manual (user saves) |
| **Data Stored** | Complete playback details, timing, completion status | Session configuration only |
| **Limit** | Last 100 sessions | Unlimited |
| **Analytics** | Yes (streaks, total time, completion rate) | Yes (use count, last used) |
| **Editing** | Read-only | Can delete |
| **Use Case** | Track progress, repeat past sessions | Quick setup of favorite configurations |

---

## How They Work Together

### 1. **History → Saved Sessions**

Users can convert any history session into a saved template:

```typescript
// In HistorySessionDrawer.tsx
const handleSaveAsTemplate = (sessionId: string) => {
  // 1. Load history session into current session store
  loadHistorySessionIntoStore(session, sessionStore);
  
  // 2. Convert to saved session format
  const savedSegments = createSegmentsCopy(currentSegments);
  
  // 3. Save as template with user-provided name
  saveSession(name, totalDuration, savedSegments);
};
```

**User Flow:**
1. User opens History drawer
2. Finds a session they liked
3. Taps "Save as Template" (bookmark icon)
4. Enters a name for the template
5. Template is saved to Saved Sessions

**Benefits:**
- Preserve successful session configurations
- Create templates from actual meditation experience
- Build a library of favorite sessions over time

### 2. **Saved Sessions → History**

When a user loads a saved session and meditates, it's automatically tracked in history:

```typescript
// In SavedSessionDrawer.tsx
const loadSession = (sessionId: string) => {
  // 1. Load saved session into session store
  loadSessionIntoStore(session, sessionStore);
  
  // 2. Update usage statistics
  updateSessionUsage(sessionId);
  
  // 3. When user starts meditation, it's automatically tracked in history
  // (via AudioSessionManager integration)
};
```

**User Flow:**
1. User opens Saved Sessions drawer
2. Selects a saved template
3. Session configuration is loaded
4. User starts meditation
5. Session is automatically tracked in History

**Benefits:**
- Track which templates are most effective
- See completion rates for different configurations
- Build streaks using favorite templates

---

## Data Structures

### History Session
```typescript
interface HistorySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
  completionPercentage: number;
  totalDurationMinutes: number;
  
  // Snapshot of configuration
  preferences: HistoryPreferences;
  segments: Partial<Record<SessionSegmentType, HistorySegmentConfig>>;
  
  // What actually happened
  playbackSequence: PlaybackEvent[];
  calculatedDurations: CalculatedDurations;
}
```

### Saved Session
```typescript
interface SavedSession {
  id: string;
  name: string;
  totalDuration: number;
  segments: Record<SessionSegmentType, SessionSegment>;
  
  // Usage tracking
  createdAt: string;
  lastUsed?: string;
  useCount: number;
}
```

---

## Key Differences

### 1. **Playback Tracking**

**History:**
- Tracks every audio file played
- Records exact timing and duration
- Captures completion status for each segment
- Stores silent meditation duration

**Saved Sessions:**
- Only stores configuration
- No playback tracking
- No timing information

### 2. **Analytics**

**History Analytics:**
- Current streak (consecutive days)
- Longest streak
- Total meditation time
- Completion rate
- Favorite audio files
- Preferred session length

**Saved Session Analytics:**
- Use count (how many times loaded)
- Last used date
- Recently used sessions
- Most used sessions

### 3. **User Control**

**History:**
- Automatic creation
- Cannot be edited or deleted
- Limited to 100 sessions (oldest removed)
- Can be converted to saved sessions

**Saved Sessions:**
- Manual creation
- Can be deleted
- Can be renamed (via save dialog)
- Unlimited storage

---

## UI Components

### HistorySessionDrawer

**Location:** `src/components/mainscreen/HistorySessionDrawer.tsx`

**Features:**
- Analytics dashboard (streaks, total time, completion rate)
- Recent sessions list (last 20)
- Session details (duration, completion, segments)
- "Repeat Session" button - loads configuration
- "Save as Template" button - converts to saved session

**Design:**
- Purple theme (matches meditation/mindfulness)
- Card-based layout
- Color-coded completion status
- Gradient stat cards

### SavedSessionDrawer

**Location:** `src/components/mainscreen/SavedSessionDrawer.tsx`

**Features:**
- List of all saved templates
- Session details (duration, use count, dates)
- "Load Session" - applies configuration
- "Delete" button - removes template

**Design:**
- Clean, minimal layout
- Usage statistics
- Quick load functionality

---

## Utility Functions

### History Utils (`src/utils/historyUtils.ts`)

```typescript
// Loading
loadHistorySessionIntoStore() - Load history into session store

// Formatting
formatHistoryDuration() - Format duration (e.g., "30 min", "1h 30m")
formatHistoryDate() - Relative dates (e.g., "Today", "2 days ago")
formatHistoryTime() - Time of day (e.g., "10:30 AM")
formatStreakText() - Streak display (e.g., "5 day streak")
formatTotalMeditationTime() - Total time (e.g., "2d 5h")

// Status
getCompletionText() - Completion status text
getCompletionColor() - Color class for completion
getCompletionIcon() - Icon for completion status
getEnabledSegments() - List of enabled segment names
```

### Session Utils (`src/utils/sessionUtils.ts`)

```typescript
// Loading
loadSessionIntoStore() - Load saved session into session store

// Validation
isValidSessionName() - Check if session name is valid

// Formatting
formatSessionDuration() - Format duration
formatSessionDate() - Format date
getSessionUsageText() - Usage count text

// Data
createSegmentsCopy() - Deep copy segments
```

---

## Best Practices

### For Users

1. **Use Saved Sessions for:**
   - Favorite meditation configurations
   - Regular practice routines
   - Quick session setup

2. **Use History for:**
   - Tracking progress and streaks
   - Analyzing meditation patterns
   - Finding successful sessions to repeat
   - Converting good sessions to templates

3. **Workflow:**
   - Start with saved templates
   - Experiment with configurations
   - Check history for successful sessions
   - Save successful sessions as new templates
   - Build a library of effective practices

### For Developers

1. **Adding Features:**
   - History is read-only - don't allow editing
   - Saved sessions can be modified
   - Keep data structures separate
   - Use utility functions for conversions

2. **Data Management:**
   - History auto-prunes to 100 sessions
   - Saved sessions have no limit
   - Both use AsyncStorage persistence
   - Handle migration gracefully

3. **UI Consistency:**
   - Use similar layouts for both drawers
   - Maintain consistent terminology
   - Color-code by feature (purple for history, neutral for saved)

---

## Future Enhancements

### Potential Features

1. **History Filtering:**
   - Filter by date range
   - Filter by completion status
   - Filter by duration
   - Filter by segments used

2. **Advanced Analytics:**
   - Charts and graphs
   - Weekly/monthly summaries
   - Best meditation times
   - Completion trends

3. **Session Comparison:**
   - Compare two sessions
   - See what changed
   - Identify patterns

4. **Export/Import:**
   - Export history as CSV
   - Share saved sessions
   - Backup and restore

5. **Smart Suggestions:**
   - Suggest sessions based on history
   - Recommend optimal times
   - Identify successful patterns

---

## Technical Notes

### Storage

Both features use Zustand with AsyncStorage persistence:

```typescript
// History Store
{
  name: 'meditation-history',
  storage: createJSONStorage(() => AsyncStorage),
}

// Saved Sessions Store
{
  name: 'saved-sessions',
  storage: createJSONStorage(() => AsyncStorage),
}
```

### Performance

- History limited to 100 sessions for performance
- Saved sessions unlimited (user manages)
- Both stores use efficient filtering
- Analytics calculated on-demand

### Data Integrity

- History sessions are immutable
- Saved sessions can be deleted
- Both use deep copying for segments
- No shared references between stores

