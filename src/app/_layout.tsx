import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';

// Prevent the splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };

    if (isAnimationComplete) {
      hideSplashScreen();
    }
  }, [isAnimationComplete]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!isAnimationComplete ? (
          <AnimatedSplashScreen onAnimationComplete={() => setIsAnimationComplete(true)} />
        ) : (
          <Stack />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
