import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from './userService';
import { HistorySession } from '@/schemas/history';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = 'session-sync-queue';

type SessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  started_at: string;
  ended_at: string | null;
  total_duration_minutes: number;
  actual_duration_minutes: number | null;
  completed: boolean;
  completion_percentage: number;
  audio_ids: string[];
  metadata: any;
};

type SimplifiedSession = {
  id: string;
  started_at: string;
  ended_at: string | null;
  total_duration_minutes: number;
  actual_duration_minutes: number | null;
  completed: boolean;
  completion_percentage: number;
  audio_ids: string[];
};

/**
 * Extract audio IDs from a session's playback sequence
 */
function extractAudioIds(session: HistorySession): string[] {
  const audioIds = new Set<string>();

  // Extract from playback sequence
  session.playbackSequence.forEach((event) => {
    if (event.audioId) {
      audioIds.add(event.audioId);
    }
  });

  // Extract from segments
  Object.values(session.segments).forEach((segment) => {
    if (segment?.selectedAudioIds) {
      segment.selectedAudioIds.forEach((id) => audioIds.add(id));
    }
  });

  return Array.from(audioIds);
}

/**
 * Convert HistorySession to simplified format for database
 */
function toSimplifiedSession(session: HistorySession): SimplifiedSession {
  // Convert actual duration from seconds to minutes
  const actualDurationMinutes = session.calculatedDurations.actualDurationSec
    ? session.calculatedDurations.actualDurationSec / 60
    : null;

  return {
    id: session.id,
    started_at: session.startedAt,
    ended_at: session.endedAt || null,
    total_duration_minutes: session.totalDurationMinutes,
    actual_duration_minutes: actualDurationMinutes,
    completed: session.completed,
    completion_percentage: session.completionPercentage,
    audio_ids: extractAudioIds(session),
  };
}

/**
 * Add session to sync queue for later syncing
 */
async function addToSyncQueue(session: SimplifiedSession): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SimplifiedSession[] = queueJson ? JSON.parse(queueJson) : [];

    // Remove existing session with same ID if present
    const filteredQueue = queue.filter(s => s.id !== session.id);

    // Add to queue
    filteredQueue.push(session);

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Failed to add session to sync queue:', error);
  }
}

/**
 * Remove session from sync queue after successful sync
 */
async function removeFromSyncQueue(sessionId: string): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return;

    const queue: SimplifiedSession[] = JSON.parse(queueJson);
    const filteredQueue = queue.filter(s => s.id !== sessionId);

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Failed to remove session from sync queue:', error);
  }
}

/**
 * Check if device is connected to internet
 */
async function isOnline(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected === true && netInfo.isInternetReachable === true;
}

/**
 * Sync a meditation session to Supabase (offline-first)
 * This will queue the session if offline and sync when online
 */
export async function syncSession(session: HistorySession): Promise<void> {
  const simplified = toSimplifiedSession(session);

  // Check if we're online
  const online = await isOnline();

  if (!online) {
    // Add to queue and return - will sync later
    await addToSyncQueue(simplified);
    console.log('Offline: Session queued for later sync');
    return;
  }

  // Try to sync immediately
  try {
    await syncSessionNow(simplified);
    console.log('Session synced successfully');
  } catch (error) {
    // If sync fails, add to queue
    console.warn('Failed to sync session, adding to queue:', error);
    await addToSyncQueue(simplified);
  }
}

/**
 * Sync a session immediately (internal function)
 */
async function syncSessionNow(session: SimplifiedSession): Promise<SessionRow> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('No user ID found. Please initialize user first.');
  }

  // Use upsert to handle both insert and update cases
  const { data, error } = await supabase
    .from('meditation_sessions')
    .upsert({
      id: session.id,
      user_id: userId,
      started_at: session.started_at,
      ended_at: session.ended_at,
      total_duration_minutes: session.total_duration_minutes,
      actual_duration_minutes: session.actual_duration_minutes,
      completed: session.completed,
      completion_percentage: session.completion_percentage,
      audio_ids: session.audio_ids,
      metadata: {}, // Empty for now
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to sync session: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to sync session: No data returned');
  }

  return data;
}

/**
 * Process the sync queue - sync all queued sessions
 * Call this when the app comes online or starts up
 */
export async function processSyncQueue(): Promise<void> {
  // Check if we're online
  const online = await isOnline();
  if (!online) {
    console.log('Still offline, skipping sync queue processing');
    return;
  }

  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return;

    const queue: SimplifiedSession[] = JSON.parse(queueJson);

    if (queue.length === 0) {
      console.log('Sync queue is empty');
      return;
    }

    console.log(`Processing ${queue.length} queued sessions...`);

    // Try to sync each session
    for (const session of queue) {
      try {
        await syncSessionNow(session);
        await removeFromSyncQueue(session.id);
        console.log(`Synced queued session: ${session.id}`);
      } catch (error) {
        console.error(`Failed to sync queued session ${session.id}:`, error);
        // Keep it in queue for next attempt
      }
    }

    console.log('Sync queue processing complete');
  } catch (error) {
    console.error('Failed to process sync queue:', error);
  }
}

/**
 * Fetch all sessions for the current user from Supabase
 */
export async function fetchUserSessions(): Promise<SessionRow[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('No user ID found. Please initialize user first.');
  }

  const { data, error } = await supabase
    .from('meditation_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single session by ID
 */
export async function fetchSessionById(sessionId: string): Promise<SessionRow | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('No user ID found. Please initialize user first.');
  }

  const { data, error } = await supabase
    .from('meditation_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch session:', error);
    return null;
  }

  return data;
}

/**
 * Delete a session from Supabase
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('No user ID found. Please initialize user first.');
  }

  const { error } = await supabase
    .from('meditation_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Get session statistics from Supabase
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
}> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { totalSessions: 0, completedSessions: 0, totalMinutes: 0 };
  }

  // Get all sessions
  const { data: allSessions, error: allError } = await supabase
    .from('meditation_sessions')
    .select('completed, actual_duration_sec')
    .eq('user_id', userId);

  if (allError) {
    console.error('Failed to fetch session stats:', allError);
    return { totalSessions: 0, completedSessions: 0, totalMinutes: 0 };
  }

  const totalSessions = allSessions?.length || 0;
  const completedSessions = allSessions?.filter(s => s.completed).length || 0;
  const totalMinutes = Math.round(
    (allSessions?.reduce((sum, s) => sum + (s.actual_duration_sec || 0), 0) || 0) / 60
  );

  return { totalSessions, completedSessions, totalMinutes };
}
