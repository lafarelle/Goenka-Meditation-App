# Testing Setup for Audio System

## ✅ Jest Configuration Complete

The audio system now has a complete Jest testing setup with all tests passing!

## Setup Files

### 1. `package.json`
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "testMatch": [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1",
      "^@assets/(.*)$": "<rootDir>/assets/$1"
    },
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

### 2. `jest.setup.js`
Mocks for native modules:
- `expo-audio` - Audio playback
- `@react-native-async-storage/async-storage` - Storage
- `expo-constants` - App constants

### 3. Test File: `src/audio/__tests__/AudioSessionManager.test.ts`
Comprehensive tests for AudioSessionManager with mocks for:
- AudioPlayer
- MeditationTimer
- SegmentPlayer
- SegmentTransitionManager
- AudioPreloader
- Zustand stores

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Specific Test File
```bash
pnpm test src/audio/__tests__/AudioSessionManager.test.ts
```

### Watch Mode
```bash
pnpm test:watch
```

### With Coverage
```bash
pnpm test -- --coverage
```

## Test Results

```
PASS  src/audio/__tests__/AudioSessionManager.test.ts
  AudioSessionManager
    Initialization
      ✓ should initialize with correct default state (12 ms)
      ✓ should have cleanup method (1 ms)
    State Management
      ✓ should return current state (1 ms)
      ✓ should update state via updateState method (1 ms)
    Callbacks
      ✓ should set callbacks correctly (1 ms)
    Transition Guards
      ✓ should not transition to silent if already in silent segment (1 ms)
      ✓ should not transition if already transitioning (1 ms)
    Error Handling
      ✓ should handle errors in handleAudioFinished (1 ms)
      ✓ should handle errors in transitionToSilent (2 ms)
    Cleanup
      ✓ should clear all references on cleanup (2 ms)
      ✓ should call cleanup on all sub-components (1 ms)
    Session State
      ✓ should track current segment correctly (1 ms)
      ✓ should track playing state correctly
      ✓ should track progress correctly

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        1.206 s
```

## Test Coverage

### What's Tested ✅

1. **Initialization**
   - Default state values
   - Cleanup method existence

2. **State Management**
   - Getting current state
   - Updating state via internal methods
   - State callback triggering

3. **Callbacks**
   - Setting callbacks
   - Callback invocation on state changes

4. **Transition Guards**
   - Preventing duplicate transitions
   - Checking segment state before transitioning
   - Checking transition flag

5. **Error Handling**
   - Errors in audio playback
   - Errors in transitions
   - Error callback invocation

6. **Cleanup**
   - Clearing references
   - Calling cleanup on sub-components
   - Preventing memory leaks

7. **Session State**
   - Tracking current segment
   - Tracking playing state
   - Tracking progress

### What's Not Tested (Future Work)

- Integration tests with real audio files
- End-to-end session flow
- Timing accuracy
- Pause/resume functionality
- Complete session lifecycle
- SegmentPlayer tests
- SegmentTransitionManager tests
- AudioPlayer tests

## Adding More Tests

### Create a New Test File

```typescript
// src/audio/__tests__/SegmentPlayer.test.ts
import { SegmentPlayer } from '../utils/SegmentPlayer';

jest.mock('../AudioPlayer');

describe('SegmentPlayer', () => {
  let player: SegmentPlayer;

  beforeEach(() => {
    player = new SegmentPlayer(/* mocked dependencies */);
  });

  afterEach(() => {
    player.cleanup();
  });

  it('should play gong', async () => {
    // Test implementation
  });
});
```

### Run the New Test

```bash
pnpm test src/audio/__tests__/SegmentPlayer.test.ts
```

## Troubleshooting

### Issue: "Cannot use namespace 'jest' as a value"

**Solution:** Already fixed! The mock is now properly structured:
```typescript
jest.mock('../AudioPreloader', () => ({
  AudioPreloader: {
    preloadAllAudio: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn().mockResolvedValue(undefined),
  },
}));
```

### Issue: "Cannot read properties of undefined"

**Solution:** Make sure all native modules are mocked in `jest.setup.js`

### Issue: Tests not found

**Solution:** Check `testMatch` pattern in `package.json` jest config

### Issue: Module resolution errors

**Solution:** Check `moduleNameMapper` in `package.json` jest config

## Best Practices

1. **Mock External Dependencies**
   - Always mock native modules
   - Mock Zustand stores
   - Mock file system operations

2. **Clean Up After Tests**
   - Use `afterEach` to cleanup
   - Prevent memory leaks
   - Reset mocks

3. **Test Behavior, Not Implementation**
   - Test public API
   - Test state changes
   - Test error handling

4. **Use Descriptive Test Names**
   - "should do X when Y"
   - Clear expectations
   - Easy to debug

5. **Keep Tests Isolated**
   - Each test should be independent
   - No shared state between tests
   - Use `beforeEach` for setup

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9.15.2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Expo Preset](https://github.com/expo/expo/tree/main/packages/jest-expo)

## Summary

✅ **Jest is fully configured and working**
✅ **All 14 tests passing**
✅ **Native modules properly mocked**
✅ **Module path mapping working**
✅ **Ready for CI/CD integration**

You can now confidently add more tests and ensure the audio system remains reliable!

