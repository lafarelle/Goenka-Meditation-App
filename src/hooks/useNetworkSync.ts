import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processSyncQueue } from '@/services/supabase';

/**
 * Hook to automatically sync queued sessions when network becomes available
 * This enables offline-first functionality
 */
export function useNetworkSync() {
  useEffect(() => {
    // Process sync queue on mount (in case there are queued sessions)
    processSyncQueue().catch((error) => {
      console.error('Failed to process sync queue on mount:', error);
    });

    // Listen for network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      // When we come online, process the sync queue
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network connected, processing sync queue...');
        processSyncQueue().catch((error) => {
          console.error('Failed to process sync queue:', error);
        });
      }
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);
}
