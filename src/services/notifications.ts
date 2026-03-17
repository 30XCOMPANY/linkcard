/**
 * [INPUT]: expo-notifications, expo-device, expo-constants, react-native Platform
 * [OUTPUT]: registerForPushNotifications, notifyProfileUpdated, scheduleSyncReminder
 * [POS]: Push notification setup + scheduling — consumed by sync and backgroundSync
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Register for push notifications and get the token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  // Check if running on a physical device
  if (!Device.isDevice) {
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Get the token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });

    await Notifications.setNotificationChannelAsync('profile-updates', {
      name: 'Profile Updates',
      description: 'Notifications when your LinkedIn profile is updated',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250],
      lightColor: '#10B981',
    });
  }

  return token;
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  channelId: string = 'default'
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === 'android' && { channelId }),
    },
    trigger: null, // Immediate
  });
}

/**
 * Schedule a notification for profile sync reminder
 */
export async function scheduleProfileSyncReminder(): Promise<string> {
  // Schedule for 6 hours from now
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Profile Sync',
      body: 'Your LinkedIn profile is being checked for updates',
      data: { type: 'sync_reminder' },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 6 * 60 * 60, // 6 hours
      repeats: true,
    },
  });
}

/**
 * Send a notification when profile is updated
 */
export async function notifyProfileUpdated(
  changedFields: string[]
): Promise<string> {
  const fieldList = changedFields.join(', ');
  
  return await scheduleLocalNotification(
    '✨ Card Updated',
    `Your card has been updated: ${fieldList}`,
    { type: 'profile_updated', fields: changedFields },
    'profile-updates'
  );
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add notification listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification listeners
 */
export function removeNotificationListeners(
  subscriptions: Notifications.Subscription[]
): void {
  subscriptions.forEach((sub) => sub.remove());
}


