/**
 * Haptics Utility
 *
 * Provides consistent haptic feedback throughout the application.
 * Uses Expo Haptics to provide tactile feedback for user interactions.
 *
 * Haptic Types:
 * - Light: For subtle interactions (toggle switches, selections)
 * - Medium: For standard button presses
 * - Heavy: For important actions (save, delete, confirm)
 * - Success: For successful operations
 * - Warning: For warning actions
 * - Error: For error states
 * - Selection: For changing selections (sliders, pickers)
 */

import * as Haptics from 'expo-haptics';

/**
 * Light impact - for subtle interactions
 * Use for: Toggle switches, small selections, dismissing modals
 */
export const lightHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Medium impact - for standard interactions
 * Use for: Standard button presses, navigation buttons
 */
export const mediumHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Heavy impact - for important actions
 * Use for: Save actions, delete actions, confirm dialogs
 */
export const heavyHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};


/**
 * Success notification
 * Use for: Successful operations, completed actions, saved data
 */
export const successHaptic = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Warning notification
 * Use for: Warning messages, potentially destructive actions
 */
export const warningHaptic = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Selection feedback
 * Use for: Changing selections, scrolling through options, slider changes
 */
export const selectionHaptic = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Silently fail if haptics are not available
  }
};
