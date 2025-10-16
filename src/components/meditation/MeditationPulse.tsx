import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

interface MeditationPulseProps {
  isPlaying?: boolean;
}

export function MeditationPulse({ isPlaying = true }: MeditationPulseProps) {
  // Simple wave animations with offset timing
  const wave1 = useRef(new Animated.Value(1)).current;
  const wave2 = useRef(new Animated.Value(1)).current;
  const wave3 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.4)).current;
  const opacity2 = useRef(new Animated.Value(0.4)).current;
  const opacity3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isPlaying) {
      wave1.stopAnimation();
      wave2.stopAnimation();
      wave3.stopAnimation();
      opacity1.stopAnimation();
      opacity2.stopAnimation();
      opacity3.stopAnimation();
      return;
    }

    // Create smooth wave effect with 4-second breathing cycle
    const createWave = (scaleAnim: Animated.Value, opacityAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(scaleAnim, {
              toValue: 1.6,
              duration: 4000,
              easing: Easing.bezier(0.42, 0, 0.58, 1),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 4000,
              easing: Easing.bezier(0.42, 0, 0.58, 1),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    // Start waves with offset timing for fluid ripple effect
    const animation1 = createWave(wave1, opacity1, 0);
    const animation2 = createWave(wave2, opacity2, 1000);
    const animation3 = createWave(wave3, opacity3, 2000);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [isPlaying, wave1, wave2, wave3, opacity1, opacity2, opacity3]);

  return (
    <View className="items-center justify-center">
      {/* Wave 3 - outermost */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(251, 191, 36, 0.3)',
          transform: [{ scale: wave3 }],
          opacity: opacity3,
        }}
      />

      {/* Wave 2 - middle */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(253, 224, 71, 0.35)',
          transform: [{ scale: wave2 }],
          opacity: opacity2,
        }}
      />

      {/* Wave 1 - innermost wave */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(254, 240, 138, 0.4)',
          transform: [{ scale: wave1 }],
          opacity: opacity1,
        }}
      />

      {/* Center core - white with yellow glow */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          shadowColor: '#fbbf24',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 25,
          elevation: 12,
        }}
      />

      {/* Inner glow */}
      <View
        style={{
          position: 'absolute',
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: 'rgba(251, 191, 36, 0.6)',
        }}
      />

      {/* Center bright spot */}
      <View
        style={{
          position: 'absolute',
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      />
    </View>
  );
}
