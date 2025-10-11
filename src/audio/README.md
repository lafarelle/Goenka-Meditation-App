# Audio System

This folder contains the audio logic for the Goenka meditation app, built with Expo Audio.

## Architecture

### Core Components

1. **AudioPlayer** - Low-level audio playback using Expo Audio
2. **MeditationTimer** - Timer for silent meditation periods
3. **AudioSessionManager** - High-level session orchestration
4. **useAudioSession** - React hook for easy integration

### Session Flow

1. **Before Silent Meditation**: Plays selected opening chants, guidance, and technique reminders
2. **Silent Meditation**: Timer-based silent period with visual countdown
3. **After Silent Meditation**: Plays selected metta practice and closing chants

### Usage

```typescript
import { useAudioSession } from '@/audio/useAudioSession';

function MeditationScreen() {
  const { sessionState, startSession, pauseSession, resumeSession, stopSession } =
    useAudioSession();

  // Session automatically starts when component mounts
  // or call startSession() manually
}
```

### Session State

The `sessionState` object contains:

- `isPlaying`: Whether audio is currently playing
- `currentSegment`: Current phase ('beforeSilent', 'silent', 'afterSilent')
- `progress`: Progress through current segment (0-1)
- `remainingTime`: Time remaining in silent meditation (seconds)

### Audio Files

Audio files are organized by segment type in `/assets/audio/`:

- Opening chants
- Opening guidance
- Technique reminders (anapana/vipassana)
- Metta practice
- Closing chants
- Gongs

The system automatically selects and plays audio based on user selections in the session store.
