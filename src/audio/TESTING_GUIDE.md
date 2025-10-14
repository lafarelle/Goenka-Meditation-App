# Audio System Testing Guide

Since this project doesn't have Jest configured, this guide provides manual testing procedures to verify the audio system improvements.

## Quick Verification Checklist

After the recent improvements, verify these key areas:

### ✅ 1. Basic Session Flow
- [ ] Session starts correctly
- [ ] Gong plays (if configured)
- [ ] BeforeSilent audio plays
- [ ] Silent meditation starts
- [ ] AfterSilent audio plays
- [ ] End gong plays
- [ ] Session completes

### ✅ 2. Transitions
- [ ] All transitions happen smoothly
- [ ] No duplicate audio playback
- [ ] No stuck segments
- [ ] Check console logs for transition messages

### ✅ 3. Controls
- [ ] Pause works during audio
- [ ] Pause works during silent meditation
- [ ] Resume works correctly
- [ ] Stop works at any point
- [ ] Progress updates correctly

### ✅ 4. Memory & Cleanup
- [ ] No memory warnings after multiple sessions
- [ ] Cleanup happens on screen exit
- [ ] No lingering timers

---

## Detailed Testing Procedures

### Test 1: Normal Session Flow

**Setup:**
1. Configure a simple session:
   - Total duration: 5 minutes
   - Gong: Enabled
   - BeforeSilent: 1 audio file
   - Silent: 2 minutes
   - AfterSilent: 1 audio file

**Steps:**
1. Start the session
2. Watch console logs
3. Let it run to completion

**Expected Logs:**
```
[AudioSessionManager] Audio finished for segment: gong
[AudioSessionManager] Start gong finished, transitioning to beforeSilent
[SegmentPlayer] Starting beforeSilent audio playback
[SegmentPlayer] Starting silent pause (3s)
[SegmentPlayer] Silent pause completed
[AudioSessionManager] Audio finished for segment: beforeSilent
[AudioSessionManager] All beforeSilent audio finished, transitioning to silent
[SegmentPlayer] Starting silent pause (3s)
... (silent meditation) ...
[SegmentTransitionManager] TIME-BASED FALLBACK: silent -> afterSilent (elapsed: X.Xs, expected: Y.Ys)
[AudioSessionManager] Transitioning to after-silent audio...
```

**Success Criteria:**
- ✅ All segments play in order
- ✅ No errors in console
- ✅ Session completes successfully
- ✅ If you see "TIME-BASED FALLBACK", check the timing difference is < 1 second

---

### Test 2: Event-Driven vs Time-Based Transitions

**Purpose:** Verify that event-driven transitions work and time-based is only fallback

**Setup:**
1. Configure session with multiple beforeSilent audio files
2. Enable verbose logging (already enabled)

**Steps:**
1. Start session
2. Watch for transition logs

**Expected Behavior:**

**✅ GOOD (Event-Driven):**
```
[AudioSessionManager] Audio finished for segment: beforeSilent
[AudioSessionManager] All beforeSilent audio finished, transitioning to silent
```

**⚠️ INVESTIGATE (Time-Based Fallback):**
```
[SegmentTransitionManager] TIME-BASED FALLBACK: beforeSilent -> silent (elapsed: 65.2s, expected: 65.0s)
```

**What to Check:**
- If timing difference < 1s: Normal variation ✅
- If timing difference > 1s: Check audio file durations ⚠️

---

### Test 3: Pause and Resume

**Test 3a: Pause During Audio**

**Steps:**
1. Start session
2. Wait for audio to start playing
3. Tap pause
4. Wait 5 seconds
5. Tap resume

**Expected Logs:**
```
[AudioSessionManager] Pausing session
[AudioSessionManager] Resuming session
```

**Success Criteria:**
- ✅ Audio pauses immediately
- ✅ Timer stops
- ✅ Audio resumes from same position
- ✅ No audio glitches

**Test 3b: Pause During Silent Meditation**

**Steps:**
1. Start session
2. Wait for silent meditation to start
3. Tap pause
4. Wait 5 seconds
5. Tap resume

**Expected Behavior:**
- ✅ Timer pauses
- ✅ No audio player pause (since no audio playing)
- ✅ Timer resumes correctly

---

### Test 4: Stop Session

**Test at Different Points:**

**4a: Stop During Audio**
1. Start session
2. Wait for audio
3. Tap stop

**4b: Stop During Silent Meditation**
1. Start session
2. Wait for silent meditation
3. Tap stop

**4c: Stop During Transition**
1. Start session
2. Tap stop immediately

**Expected for All:**
```
[AudioSessionManager] Stopping session
[AudioSessionManager] Cleaning up resources
```

**Success Criteria:**
- ✅ Session stops immediately
- ✅ All timers cleared
- ✅ Audio stops
- ✅ State resets
- ✅ No errors

---

### Test 5: Memory Leak Check

**Steps:**
1. Start session
2. Stop session
3. Repeat 10 times
4. Check for memory warnings

**Expected:**
- ✅ No memory warnings
- ✅ No "timer already running" errors
- ✅ Each session starts fresh

**Console Check:**
Look for cleanup logs:
```
[AudioSessionManager] Cleaning up resources
[SegmentPlayer] Clearing silent pause timer
```

---

### Test 6: Error Handling

**Test 6a: Missing Audio File**

**Setup:**
1. Temporarily rename an audio file
2. Configure session to use that file
3. Start session

**Expected:**
```
[SegmentPlayer] Audio file not found: [audioId]
```

**Success Criteria:**
- ✅ Error logged clearly
- ✅ Session doesn't crash
- ✅ Error callback triggered

**Test 6b: Interrupted Playback**

**Steps:**
1. Start session
2. Quickly background the app
3. Return to app

**Expected:**
- ✅ Session handles interruption gracefully
- ✅ No crashes
- ✅ Clear error messages if any

---

### Test 7: Timing Accuracy

**Purpose:** Verify timing calculations are correct

**Setup:**
1. Configure session:
   - Total: 10 minutes
   - BeforeSilent: 2 minutes of audio
   - Silent: Should be 8 minutes
   - AfterSilent: 0 minutes

**Steps:**
1. Start session
2. Note when silent meditation starts
3. Note when session completes
4. Calculate actual silent duration

**Expected:**
- ✅ Silent duration matches expected (±5 seconds acceptable)
- ✅ Total duration matches expected

**Check Logs:**
Look for timing in transition logs:
```
[SegmentTransitionManager] TIME-BASED FALLBACK: beforeSilent -> silent (elapsed: 120.5s, expected: 120.0s)
```

---

### Test 8: Multiple Audio Files

**Setup:**
1. Configure session with:
   - 3 beforeSilent audio files
   - 2 afterSilent audio files

**Steps:**
1. Start session
2. Watch console for each audio file

**Expected Logs:**
```
[SegmentPlayer] Starting beforeSilent audio playback
[SegmentPlayer] Starting silent pause (3s)
[SegmentPlayer] Playing next beforeSilent audio (2/3)
[SegmentPlayer] Starting silent pause (3s)
[SegmentPlayer] Playing next beforeSilent audio (3/3)
[SegmentPlayer] No more beforeSilent audio to play
```

**Success Criteria:**
- ✅ All audio files play in order
- ✅ Pauses between files
- ✅ Smooth transitions
- ✅ Correct count in logs

---

## Debugging Common Issues

### Issue: "TIME-BASED FALLBACK" appears frequently

**Diagnosis:**
1. Check the timing difference in the log
2. If < 1s: Normal ✅
3. If > 1s: Investigate ⚠️

**Possible Causes:**
- Audio file duration doesn't match metadata
- Timing calculation error
- System performance issues

**How to Fix:**
1. Check actual audio file durations
2. Verify timing calculations in `SegmentTransitionManager`
3. Test on different device

---

### Issue: Session gets stuck

**Symptoms:**
- No audio plays
- Timer stops
- No transition logs

**Diagnosis:**
1. Check console for errors
2. Look for last successful log
3. Check current segment state

**Possible Causes:**
- Audio loading failed
- Exception in transition
- Timer stopped unexpectedly

**How to Fix:**
1. Check error logs
2. Verify audio files exist
3. Check network (if streaming)

---

### Issue: Audio plays twice

**Symptoms:**
- Same audio plays multiple times
- Overlapping audio

**Diagnosis:**
1. Check for duplicate transition logs
2. Look for "Already in [segment] or transitioning" logs

**Possible Causes:**
- Race condition (should be fixed)
- Multiple event handlers

**How to Fix:**
1. Verify latest code is deployed
2. Check for duplicate event listeners
3. Review transition guard logic

---

### Issue: Memory warnings

**Symptoms:**
- App slows down after multiple sessions
- Memory warnings in console

**Diagnosis:**
1. Check cleanup logs
2. Verify cleanup is called
3. Check for lingering timers

**Possible Causes:**
- Cleanup not called
- References not cleared
- Timers not stopped

**How to Fix:**
1. Ensure cleanup is called on unmount
2. Check all timers are cleared
3. Verify references are nulled

---

## Performance Benchmarks

### Expected Timing Accuracy
- **Transition timing:** ±0.5 seconds
- **Total session duration:** ±5 seconds
- **Audio playback:** Exact (no drift)

### Expected Resource Usage
- **Memory:** Stable across sessions
- **CPU:** Low during silent meditation
- **Battery:** Minimal impact

---

## Regression Testing

After any changes to the audio system, run through:

1. ✅ Test 1: Normal Session Flow
2. ✅ Test 3: Pause and Resume
3. ✅ Test 4: Stop Session
4. ✅ Test 5: Memory Leak Check
5. ✅ Test 7: Timing Accuracy

This covers the critical paths and ensures no regressions.

---

## Automated Testing (Future)

To add Jest testing in the future:

1. Install dependencies:
```bash
pnpm add -D jest @types/jest ts-jest @testing-library/react-native
```

2. Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

3. Add test script to `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

4. Then the test file can be recreated with proper mocking.

---

## Summary

The audio system improvements have added:
- ✅ Better error handling
- ✅ Comprehensive logging
- ✅ Memory leak prevention
- ✅ Dual transition mechanism
- ✅ Consistent state management

Use this guide to verify everything works correctly. The console logs are now your best debugging tool!

