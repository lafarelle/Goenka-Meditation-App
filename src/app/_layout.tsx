import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';
import { useNotificationSetup } from '@/notifications';
import { useSupabaseInit } from '@/hooks/useSupabaseInit';
import { useNetworkSync } from '@/hooks/useNetworkSync';

// Prevent the splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Initialize notifications on app startup
  useNotificationSetup();

  // Initialize Supabase user on app startup
  useSupabaseInit();

  // Enable automatic sync when network becomes available
  useNetworkSync();

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
