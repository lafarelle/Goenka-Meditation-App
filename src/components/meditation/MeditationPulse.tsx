import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface MeditationPulseProps {
  isPlaying?: boolean;
}

const RING_SIZE = 70;
const ANIMATION_DURATION = 10000; // 10 seconds for slow breathing cycle
const NUM_RINGS = 2;

function PulseRing({ delay, isPlaying }: { delay: number; isPlaying: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (isPlaying) {
      // Start the animation with delay for staggered effect
      scale.value = withDelay(
        delay,
        withRepeat(
          withTiming(2.5, {
            duration: ANIMATION_DURATION,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1), // Smooth ease in-out
          }),
          -1, // Infinite repeat
          false
        )
      );

      opacity.value = withDelay(
        delay,
        withRepeat(
          withTiming(0, {
            duration: ANIMATION_DURATION,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
          }),
          -1,
          false
        )
      );
    } else {
      // Cancel animations when paused
      cancelAnimation(scale);
      cancelAnimation(opacity);
      // Reset to initial state
      scale.value = 1;
      opacity.value = 0.6;
    }
  }, [isPlaying, delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        animatedStyle,
        {
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: RING_SIZE / 2,
        },
      ]}
    />
  );
}

export function MeditationPulse({ isPlaying = true }: MeditationPulseProps) {
  return (
    <View style={styles.container}>
      {/* Animated pulse rings */}
      {Array.from({ length: NUM_RINGS }).map((_, index) => (
        <PulseRing
          key={index}
          delay={index * (ANIMATION_DURATION / NUM_RINGS)}
          isPlaying={isPlaying}
        />
      ))}

      {/* Center core - solid white circle */}
      <View style={styles.core} />

      {/* Inner subtle ring for depth */}
      <View style={styles.innerRing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RING_SIZE * 2.5,
    height: RING_SIZE * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  core: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: 'black',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  innerRing: {
    position: 'absolute',
    width: RING_SIZE - 20,
    height: RING_SIZE - 20,
    borderRadius: (RING_SIZE - 20) / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
});
