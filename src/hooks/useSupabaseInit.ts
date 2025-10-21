import { useEffect, useState } from 'react';
import { initializeUser } from '@/services/supabase';

/**
 * Hook to initialize Supabase user on app start
 * This creates or retrieves an anonymous user profile
 */
export function useSupabaseInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeUser();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Supabase user:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // Don't block app initialization on Supabase errors
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  return { isInitialized, error };
}
