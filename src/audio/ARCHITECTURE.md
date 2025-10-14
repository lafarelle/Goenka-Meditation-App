# Audio System Architecture

## Overview

The Goenka meditation app audio system is designed to manage complex meditation sessions with multiple audio segments, silent periods, and precise timing control. The architecture follows a modular design with clear separation of concerns.

## Core Components

### 1. AudioSessionManager (Orchestrator)
**Location:** `src/audio/AudioSessionManager.ts`

**Responsibility:** High-level session orchestration and state management

**Key Features:**
- Manages overall session lifecycle (start, pause, resume, stop)
- Coordinates between AudioPlayer, MeditationTimer, and utility modules
- Handles state updates and callbacks to UI
- Implements dual transition mechanism (event-driven + time-based fallback)

**State Management:**
```typescript
interface AudioSessionState {
  isPlaying: boolean;
  currentSegment: string | null; // 'gong' | 'beforeSilent' | 'silent' | 'afterSilent'
  progress: number; // 0-1
  duration: number; // in seconds
  remainingTime: number; // in seconds
}
```

### 2. AudioPlayer (Low-level Playback)
**Location:** `src/audio/AudioPlayer.ts`

**Responsibility:** Direct audio playback using Expo Audio

**Key Features:**
- Loads and plays audio files
- Tracks playback progress
- Emits events for playback completion and progress updates
- Handles audio resource cleanup

### 3. MeditationTimer (Session Timer)
**Location:** `src/audio/MeditationTimer.ts`

**Responsibility:** Tracks total session time

**Key Features:**
- Counts down from total session duration
- Supports pause/resume
- Emits tick events every second
- Triggers completion callback when time expires

### 4. SegmentPlayer (Segment Playback)
**Location:** `src/audio/utils/SegmentPlayer.ts`

**Responsibility:** Manages playback of individual session segments

**Key Features:**
- Plays gong, beforeSilent, silent, and afterSilent segments
- Manages audio index for multi-file segments
- Handles silent pauses between audio files
- Tracks audio start times for history recording

### 5. SegmentTransitionManager (Timing & Transitions)
**Location:** `src/audio/utils/SegmentTransitionManager.ts`

**Responsibility:** Time-based fallback transitions between segments

**Key Features:**
- Calculates transition points based on elapsed time
- Provides fallback mechanism if event-driven transitions fail
- Prevents duplicate transitions
- Comprehensive logging for debugging timing issues

### 6. HistoryTracker (Session Recording)
**Location:** `src/audio/utils/HistoryTracker.ts`

**Responsibility:** Records session history for analytics

**Key Features:**
- Creates history entries for each session
- Records individual audio playback events
- Tracks completion status
- Stores data in AsyncStorage

## Session Flow

### Typical Session Sequence

```
1. User starts session
   ↓
2. AudioSessionManager.startSession()
   ↓
3. Build session from store (sessionBuilder)
   ↓
4. Calculate total duration
   ↓
5. Create history entry
   ↓
6. Start session timer
   ↓
7. Play initial segment (gong or beforeSilent)
   ↓
8. Event-driven transitions handle segment changes
   ↓
9. Time-based fallback monitors for missed transitions
   ↓
10. Session completes → play end gong
    ↓
11. Finalize session and update history
```

### Segment Transitions

The system uses a **dual transition mechanism**:

#### Primary: Event-Driven Transitions
- Triggered when audio playback finishes (`handleAudioFinished`)
- Most reliable and accurate
- Handles natural flow between segments
- Marks transitions as complete to disable fallback

#### Fallback: Time-Based Transitions
- Triggered by `SegmentTransitionManager.checkSegmentTransition()`
- Called every second from timer tick
- Only activates if event-driven transition didn't occur
- Logs warnings when activated (indicates timing issue)

**Why Both?**
- Event-driven is primary for accuracy
- Time-based ensures session never gets stuck
- Provides debugging information when timing drifts

## Transition States

```
Session Start
    ↓
[gong] (optional, 5s)
    ↓
[silent pause]
    ↓
[beforeSilent] (opening chants, guidance, technique reminders)
    ↓
[silent pause]
    ↓
[silent] (silent meditation period)
    ↓
[silent pause]
    ↓
[afterSilent] (metta practice, closing chants)
    ↓
[silent pause]
    ↓
[gong] (end gong, 5s)
    ↓
Session Complete
```

## Timing Calculations

### Total Session Duration

The system supports two timing preferences:

1. **Total Time Fixed** (`timingPreference: 'total'`)
   - User sets total session duration
   - Silent time = Total - (Audio + Gong + Pauses)
   - Example: 30min total, 5min audio → 25min silent

2. **Silent Time Fixed** (`timingPreference: 'silent'`)
   - User sets desired silent meditation time
   - Total time = Silent + Audio + Gong + Pauses
   - Example: 20min silent, 5min audio → 25min total

### Pause Duration Calculation

```typescript
// Total pause duration from preferences
const totalPauseDuration = timing.pauseDurationSec;

// Number of pauses in session
const pauseCount = calculatePauseCount();

// Individual pause duration
const individualPause = totalPauseDuration / pauseCount;
```

**Pause Locations:**
- After gong (if present)
- Between beforeSilent audio files
- Before silent meditation
- Before afterSilent audio
- Between afterSilent audio files
- Before end gong

## State Synchronization

### State Update Flow

```
Audio Event → SegmentPlayer.onStateUpdate()
                    ↓
            AudioSessionManager.updateState()
                    ↓
            Update sessionState object
                    ↓
            Calculate remainingTime (if not provided)
                    ↓
            Trigger onStateChange callback
                    ↓
            UI updates via React hook
```

### Preventing Race Conditions

1. **Transition Guard:** `isTransitioning` flag prevents concurrent transitions
2. **Segment Check:** Methods check current segment before transitioning
3. **Transition Marking:** Event-driven transitions mark completion to disable fallback
4. **State Updates:** Immediate state updates prevent duplicate calls

## Error Handling

### Error Propagation

```
Low-level error (AudioPlayer)
        ↓
Caught in SegmentPlayer
        ↓
Logged and re-thrown
        ↓
Caught in AudioSessionManager
        ↓
Passed to error callback
        ↓
Displayed to user via UI
```

### Error Recovery

- Audio loading failures: Log error, attempt to continue
- Playback errors: Stop session gracefully
- Timer errors: Report via error callback
- Transition errors: Log and attempt fallback

## Memory Management

### Cleanup Process

```typescript
AudioSessionManager.cleanup()
    ↓
├─ Stop session timer
├─ Cleanup audio player
├─ Cleanup segment player
│   └─ Clear silent pause timer
│   └─ Reset state
├─ Reset transition manager
├─ Cleanup audio preloader
└─ Clear all references
```

### Preventing Memory Leaks

1. Clear all timers (session timer, silent pause timer)
2. Null out session references
3. Clear callbacks object
4. Reset flags and counters
5. Cleanup audio resources

## Logging Strategy

### Log Prefixes

- `[AudioSessionManager]` - High-level orchestration
- `[SegmentPlayer]` - Segment playback
- `[SegmentTransitionManager]` - Timing and transitions
- `[AudioPlayer]` - Low-level playback

### Log Levels

- **Info:** Normal flow (segment transitions, audio start/stop)
- **Warn:** Unusual but handled (fallback transitions, missing audio)
- **Error:** Failures requiring attention (audio load errors, playback failures)

### Debugging Timing Issues

When you see: `"TIME-BASED FALLBACK: beforeSilent -> silent"`

This indicates:
1. Event-driven transition didn't fire
2. Possible causes:
   - Audio duration mismatch
   - Timing calculation error
   - Audio playback interrupted
3. Check logs for:
   - Actual elapsed time vs expected
   - Audio playback completion events
   - State transitions

## Best Practices

### Adding New Segments

1. Update `MeditationSession` schema
2. Add segment to `sessionBuilder`
3. Implement playback method in `SegmentPlayer`
4. Add transition logic in `AudioSessionManager.handleAudioFinished()`
5. Update timing calculations in `SegmentTransitionManager`
6. Add tests for new segment flow

### Modifying Timing

1. Update `calculateSessionTiming()` in `timingUtils.ts`
2. Verify pause count calculation
3. Update transition point calculations
4. Test with various session configurations
5. Verify event-driven and time-based transitions align

### Testing Transitions

1. Enable verbose logging
2. Monitor console for transition events
3. Compare actual vs expected timing
4. Verify no duplicate transitions
5. Test pause/resume during transitions
6. Test stop during transitions

## Common Issues & Solutions

### Issue: "Transitioning from beforeSilent to silent" appears in logs

**Cause:** Time-based fallback is triggering

**Solutions:**
1. Check if event-driven transition is firing
2. Verify audio duration matches expected duration
3. Check for timing calculation errors
4. Ensure `markTransitionComplete()` is called

### Issue: Session gets stuck between segments

**Cause:** Both transition mechanisms failed

**Solutions:**
1. Check audio loading errors
2. Verify segment configuration
3. Check for exceptions in transition methods
4. Review error logs

### Issue: Audio plays twice or skips

**Cause:** Race condition in transitions

**Solutions:**
1. Verify `isTransitioning` flag is working
2. Check for duplicate event handlers
3. Ensure state updates are atomic
4. Review transition guard logic

## Performance Considerations

### Audio Preloading

- All audio files preloaded at initialization
- Reduces latency during playback
- Increases initial load time
- Trade-off: Memory vs responsiveness

### Timer Precision

- Session timer ticks every 1 second
- Sufficient for meditation timing
- Could be increased for more precision
- Balance: Precision vs battery usage

### State Updates

- Minimize state update frequency
- Batch updates when possible
- Only update changed properties
- Avoid unnecessary re-renders

## Future Improvements

1. **State Machine:** Implement formal state machine for transitions
2. **Metrics:** Add performance monitoring and analytics
3. **Offline Support:** Better handling of network issues
4. **Audio Streaming:** Support for larger audio files
5. **Background Playback:** Continue session when app backgrounded
6. **Notification Controls:** Play/pause from notifications

