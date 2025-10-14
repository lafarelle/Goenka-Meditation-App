# Audio System

This folder contains the audio logic for the Goenka meditation app, built with Expo Audio.

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive architecture documentation
- **[Tests](./__tests__)** - Unit tests for core functionality

## Quick Start

### Basic Usage

```typescript
import { useAudioSession } from '@/audio/useAudioSession';

function MeditationScreen() {
  const {
    sessionState,
    isLoading,
    error,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
  } = useAudioSession();

  return (
    <View>
      <Text>Current Segment: {sessionState.currentSegment}</Text>
      <Text>Progress: {(sessionState.progress * 100).toFixed(0)}%</Text>
      <Text>Remaining: {formatTime(sessionState.remainingTime)}</Text>

      <Button onPress={startSession} disabled={isLoading}>
        Start Session
      </Button>
      <Button onPress={pauseSession}>Pause</Button>
      <Button onPress={resumeSession}>Resume</Button>
      <Button onPress={stopSession}>Stop</Button>
    </View>
  );
}
```

## Architecture Overview

### Core Components

1. **AudioSessionManager** - High-level session orchestration
   - Manages session lifecycle
   - Coordinates all components
   - Handles state management
   - Implements dual transition mechanism

2. **AudioPlayer** - Low-level audio playback
   - Uses Expo Audio
   - Handles audio loading and playback
   - Emits progress and completion events

3. **MeditationTimer** - Session timing
   - Counts down total session time
   - Supports pause/resume
   - Triggers completion events

4. **SegmentPlayer** - Segment playback management
   - Plays individual segments
   - Manages audio sequences
   - Handles silent pauses

5. **SegmentTransitionManager** - Timing & fallback transitions
   - Calculates transition points
   - Provides time-based fallback
   - Prevents duplicate transitions

6. **HistoryTracker** - Session recording
   - Records session history
   - Tracks audio playback
   - Stores analytics data

### Session Flow

```
Start Session
    ↓
[Gong] (optional, 5s)
    ↓
[Silent Pause]
    ↓
[Before Silent] (opening chants, guidance, technique reminders)
    ↓
[Silent Pause]
    ↓
[Silent Meditation] (timer-based silent period)
    ↓
[Silent Pause]
    ↓
[After Silent] (metta practice, closing chants)
    ↓
[Silent Pause]
    ↓
[End Gong] (5s)
    ↓
Session Complete
```

## Transition Mechanism

The system uses a **dual transition mechanism** for reliability:

### 1. Event-Driven (Primary)

- Triggered when audio playback finishes
- Most accurate and reliable
- Handles natural segment flow
- Marks transitions complete to disable fallback

### 2. Time-Based (Fallback)

- Triggered by elapsed time
- Only activates if event-driven fails
- Logs warnings when activated
- Helps debug timing issues

**Why both?** Event-driven is primary for accuracy, time-based ensures the session never gets stuck.

## Session State

```typescript
interface AudioSessionState {
  isPlaying: boolean; // Whether audio is currently playing
  currentSegment: string | null; // 'gong' | 'beforeSilent' | 'silent' | 'afterSilent'
  progress: number; // Overall session progress (0-1)
  duration: number; // Total session duration (seconds)
  remainingTime: number; // Time remaining (seconds)
}
```

## Timing Preferences

### Total Time Fixed

```typescript
timingPreference: 'total';
```

- User sets total session duration
- Silent time = Total - (Audio + Gong + Pauses)
- Example: 30min total, 5min audio → 25min silent

### Silent Time Fixed

```typescript
timingPreference: 'silent';
```

- User sets desired silent meditation time
- Total time = Silent + Audio + Gong + Pauses
- Example: 20min silent, 5min audio → 25min total

## Debugging

### Enable Verbose Logging

All components use console logging with prefixes:

- `[AudioSessionManager]` - High-level orchestration
- `[SegmentPlayer]` - Segment playback
- `[SegmentTransitionManager]` - Timing and transitions

### Common Log Messages

**Normal Flow:**

```
[AudioSessionManager] Audio finished for segment: beforeSilent
[AudioSessionManager] All beforeSilent audio finished, transitioning to silent
[SegmentPlayer] Starting silent pause (3s)
```

**Fallback Triggered (investigate):**

```
[SegmentTransitionManager] TIME-BASED FALLBACK: beforeSilent -> silent
```

This indicates the event-driven transition didn't fire. Check for:

- Audio duration mismatches
- Timing calculation errors
- Interrupted playback

## Error Handling

Errors propagate from low-level to high-level:

```
AudioPlayer → SegmentPlayer → AudioSessionManager → UI
```

All errors are:

1. Logged with context
2. Passed to error callback
3. Displayed to user (if appropriate)

## Memory Management

The system properly cleans up resources:

```typescript
// Automatic cleanup on unmount
useEffect(() => {
  return () => {
    sessionManagerRef.current?.cleanup();
  };
}, []);
```

Cleanup includes:

- Stopping all timers
- Clearing audio resources
- Nulling references
- Resetting state

## Testing

Run tests:

```bash
# Run all tests
pnpm test

# Run audio tests specifically
pnpm test src/audio/__tests__

# Run tests in watch mode
pnpm test:watch
```

Tests cover:

- ✅ Initialization
- ✅ State management
- ✅ Callbacks
- ✅ Transition guards
- ✅ Error handling
- ✅ Cleanup
- ✅ Session state tracking

**All 14 tests passing!** ✅

## Audio Files

Audio files are organized in `/assets/audio/`:

- Opening chants
- Opening guidance
- Technique reminders (anapana/vipassana)
- Metta practice
- Closing chants
- Gongs

Files are preloaded at initialization for smooth playback.

## Performance

- **Audio Preloading:** All files loaded at init (trade-off: memory vs latency)
- **Timer Precision:** 1-second ticks (sufficient for meditation, battery-friendly)
- **State Updates:** Minimized and batched when possible

## Contributing

When modifying the audio system:

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) first
2. Add tests for new functionality
3. Update documentation
4. Test with various session configurations
5. Verify both transition mechanisms work
6. Check for memory leaks

## Troubleshooting

### Session doesn't start

- Check audio preloading completed
- Verify session configuration
- Check error logs

### Transitions don't work

- Enable verbose logging
- Check both event-driven and time-based logs
- Verify timing calculations
- Test with simple session first

### Audio doesn't play

- Check audio file exists
- Verify preloading succeeded
- Check device audio settings
- Review error logs

### Memory issues

- Verify cleanup is called
- Check for timer leaks
- Monitor audio resource usage

For detailed troubleshooting, see [ARCHITECTURE.md](./ARCHITECTURE.md).
