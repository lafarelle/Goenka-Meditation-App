# History Feature - Quick Reference

## 🚀 Quick Start

### Add to MainScreen
```typescript
import { HistorySessionDrawer } from './HistorySessionDrawer';

const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false);

// In header
<TouchableOpacity onPress={() => setIsHistoryDrawerVisible(true)}>
  <Ionicons name="time-outline" size={24} color="#57534e" />
</TouchableOpacity>

// At bottom
<HistorySessionDrawer
  isVisible={isHistoryDrawerVisible}
  onClose={() => setIsHistoryDrawerVisible(false)}
/>
```

---

## 📦 Store Methods

### useHistoryStore

```typescript
// Session Management
startSession(totalDurationMinutes, preferences, segments, calculatedDurations) → sessionId
addPlaybackEvent(sessionId, event) → void
completeSession(sessionId, actualDurationSec) → void
stopSession(sessionId, stoppedAtSec, actualDurationSec) → void

// Queries
getSessionById(sessionId) → HistorySession | undefined
getRecentSessions(limit = 10) → HistorySession[]
getFilteredSessions(filter) → HistorySession[]

// Analytics
getStats() → HistoryStats
getCurrentStreak() → number
getLongestStreak() → number
getTotalMinutes() → number
getCompletedSessionsCount() → number
getCompletionRate() → number
```

### useSavedSessionsStore

```typescript
// Session Management
saveSession(name, totalDuration, segments) → void
deleteSession(id) → void
updateSessionUsage(id) → void

// Queries
getSessionById(id) → SavedSession | undefined
getRecentlyUsedSessions(limit = 5) → SavedSession[]
getMostUsedSessions(limit = 5) → SavedSession[]
```

---

## 🛠️ Utility Functions

### historyUtils.ts

```typescript
// Loading
loadHistorySessionIntoStore(historySession, sessionStore) → void

// Formatting
formatHistoryDuration(minutes) → string  // "30 min" or "1h 30m"
formatHistoryDate(dateString) → string   // "Today" or "2 days ago"
formatHistoryTime(dateString) → string   // "10:30 AM"
formatStreakText(streak) → string        // "5 day streak"
formatTotalMeditationTime(minutes) → string  // "2d 5h"

// Status
getCompletionText(session) → string      // "Completed" or "75% completed"
getCompletionColor(session) → string     // Tailwind color class
getCompletionIcon(session) → IconName    // "checkmark-circle" or "close-circle"
getEnabledSegments(session) → string[]   // ["Opening Chant", "Silent", "Metta"]
formatCompletionRate(rate) → string      // "85%"
```

### sessionUtils.ts

```typescript
// Loading
loadSessionIntoStore(session, sessionStore) → void

// Validation
isValidSessionName(name) → boolean

// Formatting
formatSessionDuration(minutes) → string
formatSessionDate(dateString) → string
getSessionUsageText(useCount) → string

// Data
createSegmentsCopy(segments) → Record<SessionSegmentType, SessionSegment>
```

---

## 📊 Data Types

### HistorySession
```typescript
{
  id: string
  startedAt: string
  endedAt?: string
  completed: boolean
  completionPercentage: number
  totalDurationMinutes: number
  preferences: HistoryPreferences
  segments: Partial<Record<SessionSegmentType, HistorySegmentConfig>>
  playbackSequence: PlaybackEvent[]
  calculatedDurations: CalculatedDurations
}
```

### PlaybackEvent
```typescript
{
  segmentType: SessionSegmentType | 'gong'
  audioId?: string
  startedAt: number  // Seconds from session start
  duration: number
  completed: boolean
}
```

### HistoryStats
```typescript
{
  totalSessions: number
  completedSessions: number
  totalMinutesMeditated: number
  currentStreak: number
  longestStreak: number
  averageSessionDuration: number
  completionRate: number
  favoriteAudioIds: string[]
  preferredSessionLength: number
}
```

### SavedSession
```typescript
{
  id: string
  name: string
  totalDuration: number
  segments: Record<SessionSegmentType, SessionSegment>
  createdAt: string
  lastUsed?: string
  useCount: number
}
```

---

## 🎨 UI Components

### HistorySessionDrawer Props
```typescript
{
  isVisible: boolean
  onClose: () => void
}
```

### SavedSessionDrawer Props
```typescript
{
  isVisible: boolean
  onClose: () => void
}
```

---

## 🔄 Common Workflows

### Load History Session
```typescript
const loadSession = (sessionId: string) => {
  const session = useHistoryStore.getState().getSessionById(sessionId);
  if (!session) return;

  loadHistorySessionIntoStore(session, {
    setTotalDurationMinutes,
    setSegmentEnabled,
    setSegmentDuration,
    setSegmentAudioIds,
    setSegmentTechniqueType,
  });
};
```

### Save History as Template
```typescript
const saveAsTemplate = (sessionId: string, name: string) => {
  const session = useHistoryStore.getState().getSessionById(sessionId);
  if (!session) return;

  // Load into session store
  loadHistorySessionIntoStore(session, sessionStore);

  // Get current segments
  const currentSegments = useSessionStore.getState().segments;

  // Save as template
  saveSession(name, session.totalDurationMinutes, createSegmentsCopy(currentSegments));
};
```

### Get Analytics
```typescript
const stats = useHistoryStore.getState().getStats();
const currentStreak = useHistoryStore.getState().getCurrentStreak();
const longestStreak = useHistoryStore.getState().getLongestStreak();

console.log(`Current streak: ${currentStreak} days`);
console.log(`Total time: ${stats.totalMinutesMeditated} minutes`);
console.log(`Completion rate: ${stats.completionRate}%`);
```

---

## 🎯 Integration Points

### AudioSessionManager

```typescript
// Session start
this.currentHistorySessionId = this.createHistoryEntry(sessionStore, preferencesStore);

// Audio playback start
this.currentAudioStartTime = this.getElapsedSeconds();

// Audio playback complete
this.recordCurrentAudioPlayback(true);

// Session complete
historyStore.completeSession(this.currentHistorySessionId, actualDurationSec);

// Session stopped
historyStore.stopSession(this.currentHistorySessionId, stoppedAtSec, actualDurationSec);
```

---

## 🐛 Debugging

### Check History Store
```typescript
const history = useHistoryStore.getState().history;
console.log('Total sessions:', history.length);
console.log('Latest session:', history[0]);
```

### Check Session Tracking
```typescript
const currentSessionId = useHistoryStore.getState().currentSessionId;
console.log('Current session ID:', currentSessionId);

if (currentSessionId) {
  const session = useHistoryStore.getState().getSessionById(currentSessionId);
  console.log('Current session:', session);
  console.log('Playback events:', session?.playbackSequence);
}
```

### Verify Analytics
```typescript
const stats = useHistoryStore.getState().getStats();
console.log('Stats:', JSON.stringify(stats, null, 2));
```

---

## 📝 Common Patterns

### Display Streak in Header
```typescript
const currentStreak = useHistoryStore((state) => state.getCurrentStreak());

<View className="flex-row items-center rounded-full bg-purple-50 px-3 py-2">
  <Ionicons name="flame" size={20} color="#A78BFA" />
  <Text className="ml-1 font-semibold text-purple-700">{currentStreak}</Text>
</View>
```

### Show Recent Sessions
```typescript
const recentSessions = useHistoryStore((state) => state.getRecentSessions(5));

{recentSessions.map((session) => (
  <View key={session.id}>
    <Text>{formatHistoryDate(session.startedAt)}</Text>
    <Text>{formatHistoryDuration(session.totalDurationMinutes)}</Text>
    <Text>{getCompletionText(session)}</Text>
  </View>
))}
```

### Filter Completed Sessions
```typescript
const completedSessions = useHistoryStore((state) =>
  state.getFilteredSessions({ completedOnly: true })
);
```

---

## ⚡ Performance Tips

### Use Selectors
```typescript
// Good - only re-renders when streak changes
const currentStreak = useHistoryStore((state) => state.getCurrentStreak());

// Bad - re-renders on any store change
const { getCurrentStreak } = useHistoryStore();
const currentStreak = getCurrentStreak();
```

### Memoize Expensive Calculations
```typescript
const stats = useMemo(() => getStats(), [getStats]);
```

### Limit Session Display
```typescript
const recentSessions = getRecentSessions(20); // Limit to 20
```

---

## 🔒 Data Limits

- **History**: 100 sessions (auto-pruned)
- **Saved Sessions**: Unlimited
- **Playback Events**: Unlimited per session
- **Analytics**: Calculated on-demand

---

## 📚 Documentation Files

1. **HISTORY_FEATURE_IMPLEMENTATION.md** - Technical details
2. **HISTORY_AND_SAVED_SESSIONS.md** - Feature comparison
3. **INTEGRATION_GUIDE.md** - Step-by-step setup
4. **HISTORY_FEATURE_SUMMARY.md** - Complete overview
5. **QUICK_REFERENCE.md** - This file

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| No sessions in history | Complete a meditation session first |
| Streak not updating | Sessions must be completed (not stopped) |
| Repeat session doesn't work | Check `loadHistorySessionIntoStore` import |
| Save as template fails | Ensure session is loaded into store first |
| Analytics incorrect | Clear AsyncStorage and restart |

---

## 🎓 Best Practices

1. **Always use utility functions** for loading sessions
2. **Use selectors** for better performance
3. **Memoize** expensive calculations
4. **Limit** displayed sessions for performance
5. **Deep copy** segments when saving
6. **Validate** session data before using
7. **Handle** missing sessions gracefully
8. **Test** with multiple sessions
9. **Document** custom modifications
10. **Follow** existing patterns

---

**Need more help?** Check the full documentation files or the source code comments.

