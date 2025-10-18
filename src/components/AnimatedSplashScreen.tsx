import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { AudioPreloader } from '@/audio/AudioPreloader';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

/**
 * Calming breathing animation splash screen with audio preloading
 * Creates a gentle pulsing circle that encourages deep breathing
 * Preloads all meditation audio files during the splash duration
 */
export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
}: AnimatedSplashScreenProps) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const containerOpacityAnim = useRef(new Animated.Value(1)).current;

  // Minimum splash duration to ensure smooth transition and audio preloading
  const MIN_SPLASH_DURATION = 2000;

  useEffect(() => {
    // Start preloading audio in the background
    const preloadAudio = async () => {
      try {
        await AudioPreloader.preloadAllAudio();
      } catch (error) {
        console.error('[AnimatedSplashScreen] Audio preload failed:', error);
        // Don't block splash screen if preload fails
      }
    };

    preloadAudio();
  }, []);

  useEffect(() => {
    // Fade in the component
    Animated.timing(opacityAnim, {
      toValue: 0.8,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Create the breathing animation loop
    const breathingAnimation = () => {
      Animated.sequence([
        // Inhale phase - scale up
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // Hold phase
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Exhale phase - scale down
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(breathingAnimation);
    };

    breathingAnimation();

    // Hide splash screen after minimum duration
    const hideTimer = setTimeout(() => {
      Animated.timing(containerOpacityAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }, MIN_SPLASH_DURATION);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [onAnimationComplete, scaleAnim, opacityAnim, containerOpacityAnim]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor: '#FAFAF7',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: containerOpacityAnim,
        },
      ]}
      pointerEvents="none">
      <View style={{ alignItems: 'center', gap: 20 }}>
        {/* Animated breathing circle */}
        <Animated.View
          style={[
            {
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: '#E8B84B',
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />

        {/* Secondary circle for depth effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: 75,
              borderWidth: 2,
              borderColor: '#D4A73D',
              opacity: opacityAnim,
              transform: [
                {
                  scale: Animated.divide(scaleAnim, 1.2),
                },
              ],
            },
          ]}
        />

        {/* Breathing text hint */}
        <Animated.Text
          style={[
            {
              fontSize: 14,
              color: '#D4A73D',
              fontWeight: '500',
              marginTop: 40,
              opacity: opacityAnim,
            },
          ]}>
          Take a deep breath...
        </Animated.Text>
      </View>
    </Animated.View>
  );
};
