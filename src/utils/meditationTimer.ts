import { useSessionStore } from '@/store/sessionStore';
import { calculateTotalSessionDuration } from './timing';

/**
 * Gets the total session duration from the session store
 */
export function getSessionTotalDuration(): number {
  const sessionStore = useSessionStore.getState();
  return calculateTotalSessionDuration(sessionStore.totalDurationMinutes, sessionStore.segments);
}
