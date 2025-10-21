import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device-id';
const USER_ID_KEY = 'user-id';

type UserRow = {
  id: string;
  created_at: string;
  updated_at: string;
  device_id: string;
  name: string | null;
  country: string | null;
  has_attended_retreat: boolean | null;
  goenka_familiarity: 'goat' | 'heard' | 'not-really' | null;
  wants_gong: boolean | null;
};

/**
 * Generate a unique device ID for anonymous user tracking
 */
async function getOrCreateDeviceId(): Promise<string> {
  // Check if we already have a device ID stored
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate a new device ID using device info + timestamp + random
    const deviceName = Device.deviceName || 'unknown';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    deviceId = `${deviceName}-${timestamp}-${random}`;

    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Get the current user ID from storage
 */
export async function getCurrentUserId(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_ID_KEY);
}

/**
 * Create or get existing anonymous user
 * This should be called during app initialization
 */
export async function initializeUser(): Promise<UserRow> {
  const deviceId = await getOrCreateDeviceId();

  // Check if user already exists with this device ID
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (existingUser && !fetchError) {
    // Store user ID for future use
    await AsyncStorage.setItem(USER_ID_KEY, existingUser.id);
    return existingUser;
  }

  // Create new user
  const { data, error } = await supabase
    .from('users')
    .insert({ device_id: deviceId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create user: No data returned');
  }

  // Store user ID for future use
  await AsyncStorage.setItem(USER_ID_KEY, data.id);

  return data;
}

/**
 * Update user profile with onboarding data
 */
export async function updateUserProfile(profile: {
  name?: string | null;
  country?: string | null;
  has_attended_retreat?: boolean | null;
  goenka_familiarity?: 'goat' | 'heard' | 'not-really' | null;
  wants_gong?: boolean | null;
}): Promise<UserRow> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('No user ID found. Please initialize user first.');
  }

  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update user profile: No data returned');
  }

  return data;
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<UserRow | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }

  return data;
}

/**
 * Check if user exists and is initialized
 */
export async function isUserInitialized(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return userId !== null;
}
