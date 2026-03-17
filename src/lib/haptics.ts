/**
 * [INPUT]: expo-haptics, process.env.EXPO_OS
 * [OUTPUT]: haptic object with platform-guarded haptic feedback methods
 * [POS]: Core utility — conditionally fires haptics on iOS only
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import * as Haptics from "expo-haptics";

const isIOS = process.env.EXPO_OS === "ios";

export const haptic = {
  selection: () => isIOS && Haptics.selectionAsync(),
  light: () =>
    isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () =>
    isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () =>
    isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    isIOS &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    isIOS &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    isIOS &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
