/**
 * Supabase service exports
 * Provides user management and session tracking functionality
 */

export {
  initializeUser,
  updateUserProfile,
  getUserProfile,
  getCurrentUserId,
  isUserInitialized,
} from './userService';

export {
  syncSession,
  processSyncQueue,
  fetchUserSessions,
  fetchSessionById,
  deleteSession,
  getSessionStats,
} from './sessionService';
