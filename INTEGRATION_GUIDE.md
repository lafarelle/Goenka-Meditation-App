# Integration Guide: Adding History Drawer to Main Screen

## Quick Integration

To add the HistorySessionDrawer to your MainScreen, follow these steps:

### 1. Update MainScreen.tsx

```typescript
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AudioSelectionProvider } from './AudioSelectionProvider';
import { DurationSelector } from './DurationSelector';
import { HistorySessionDrawer } from './HistorySessionDrawer'; // ADD THIS
import { SavedSessionDrawer } from './SavedSessionDrawer';
import { SegmentSelector } from './SegmentSelector';
import { SessionPreview } from './SessionPreview';

export function MainScreen() {
  const [isSavedSessionsDrawerVisible, setIsSavedSessionsDrawerVisible] = useState(false);
  const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false); // ADD THIS

  return (
    <AudioSelectionProvider>
      <View className="flex-1 bg-stone-50">
        {/* Header with History, Saved Sessions, and Settings buttons */}
        <View className="flex-row items-center px-6 pb-4 pt-16">
          {/* ADD HISTORY BUTTON */}
          <TouchableOpacity
            onPress={() => setIsHistoryDrawerVisible(true)}
            activeOpacity={0.8}
            className="items-center p-2">
            <Ionicons name="time-outline" size={24} color="#57534e" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setIsSavedSessionsDrawerVisible(true)}
            activeOpacity={0.8}
            className="items-center p-2">
            <Ionicons name="bookmark-outline" size={24} color="#57534e" />
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
        
        {/* ADD HISTORY DRAWER */}
        <HistorySessionDrawer
          isVisible={isHistoryDrawerVisible}
          onClose={() => setIsHistoryDrawerVisible(false)}
        />
      </View>
    </AudioSelectionProvider>
  );
}
```

### 2. Icon Choices

You can use different icons for the history button:

- `time-outline` - Clock icon (recommended)
- `stats-chart-outline` - Chart icon
- `calendar-outline` - Calendar icon
- `list-outline` - List icon

### 3. Alternative Layout

If you want to show streak info in the header:

```typescript
import { useHistoryStore } from '@/store/historyStore';

export function MainScreen() {
  const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false);
  const currentStreak = useHistoryStore((state) => state.getCurrentStreak());

  return (
    <AudioSelectionProvider>
      <View className="flex-1 bg-stone-50">
        {/* Header with streak badge */}
        <View className="flex-row items-center px-6 pb-4 pt-16">
          <TouchableOpacity
            onPress={() => setIsHistoryDrawerVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center rounded-full bg-purple-50 px-3 py-2">
            <Ionicons name="flame" size={20} color="#A78BFA" />
            <Text className="ml-1 font-semibold text-purple-700">
              {currentStreak}
            </Text>
          </TouchableOpacity>
          
          {/* ... rest of header ... */}
        </View>
        
        {/* ... rest of component ... */}
      </View>
    </AudioSelectionProvider>
  );
}
```

## Testing the Integration

### 1. Test History Tracking

1. Start a meditation session
2. Complete it fully
3. Open History drawer
4. Verify the session appears with 100% completion

### 2. Test Repeat Session

1. Open History drawer
2. Find a completed session
3. Tap "Repeat Session"
4. Verify the configuration is loaded
5. Check that all segments match the original

### 3. Test Save as Template

1. Open History drawer
2. Find a session you want to save
3. Tap the bookmark icon
4. Enter a name
5. Tap "Save"
6. Open Saved Sessions drawer
7. Verify the template appears

### 4. Test Analytics

1. Complete multiple sessions over several days
2. Open History drawer
3. Verify:
   - Current streak is accurate
   - Total sessions count is correct
   - Total time is calculated properly
   - Completion rate is accurate

## Common Issues

### Issue: History drawer shows no sessions

**Solution:** Make sure you've completed at least one meditation session. History only tracks sessions that have been started through the AudioSessionManager.

### Issue: Streak not updating

**Solution:** Streaks are calculated based on consecutive days with completed sessions. Make sure:
- Sessions are marked as completed (not stopped early)
- Sessions are on consecutive days
- The date calculation is working correctly

### Issue: "Repeat Session" doesn't load configuration

**Solution:** Check that:
- `loadHistorySessionIntoStore` is imported correctly
- All session store methods are passed to the function
- The history session has valid segment data

### Issue: "Save as Template" creates empty template

**Solution:** Make sure:
- The history session is loaded into the session store first
- `createSegmentsCopy` is called on the current segments
- The segments are properly populated before saving

## Advanced Customization

### Custom Analytics Display

You can customize which analytics are shown:

```typescript
// In HistorySessionDrawer.tsx
const stats = getStats();

// Show only specific stats
<View className="flex-row gap-3">
  <StatCard
    icon="flame"
    label="Streak"
    value={currentStreak}
    color="purple"
  />
  <StatCard
    icon="time"
    label="Total Time"
    value={formatTotalMeditationTime(stats.totalMinutesMeditated)}
    color="green"
  />
</View>
```

### Filter History Sessions

Add filtering options:

```typescript
const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

const filteredSessions = recentSessions.filter((session) => {
  if (filter === 'completed') return session.completed;
  if (filter === 'incomplete') return !session.completed;
  return true;
});
```

### Custom Session Cards

Customize how sessions are displayed:

```typescript
<View className="rounded-xl bg-white p-4">
  {/* Add custom fields */}
  <Text>Duration: {session.totalDurationMinutes} min</Text>
  <Text>Completion: {session.completionPercentage}%</Text>
  
  {/* Show playback sequence */}
  {session.playbackSequence.map((event, index) => (
    <Text key={index}>
      {event.segmentType}: {event.duration}s
    </Text>
  ))}
</View>
```

## Performance Optimization

### Lazy Loading

If you have many sessions, consider lazy loading:

```typescript
const [visibleSessions, setVisibleSessions] = useState(10);

const loadMore = () => {
  setVisibleSessions((prev) => prev + 10);
};

// In render
{recentSessions.slice(0, visibleSessions).map((session) => (
  // ... session card
))}

<Button onPress={loadMore} title="Load More" />
```

### Memoization

Optimize expensive calculations:

```typescript
import { useMemo } from 'react';

const stats = useMemo(() => getStats(), [getStats]);
const currentStreak = useMemo(() => getCurrentStreak(), [getCurrentStreak]);
```

## Next Steps

1. **Add Filtering** - Let users filter history by date, completion, duration
2. **Add Sorting** - Sort by date, duration, completion rate
3. **Add Search** - Search sessions by date or configuration
4. **Add Export** - Export history as CSV or JSON
5. **Add Charts** - Visualize progress with charts and graphs

## Support

If you encounter issues:

1. Check the console for errors
2. Verify all imports are correct
3. Ensure stores are properly initialized
4. Check that AsyncStorage permissions are granted
5. Review the HISTORY_AND_SAVED_SESSIONS.md documentation

