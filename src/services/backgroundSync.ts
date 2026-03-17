import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { checkProfileChanges } from './linkedin';
import { notifyProfileUpdated } from './notifications';
import { cardService } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_SYNC_TASK = 'LINKCARD_BACKGROUND_SYNC';
const LAST_SYNC_KEY = 'linkcard_last_sync';
const PROFILE_KEY = 'linkcard_current_profile';

/**
 * Define the background task
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {

    // Get stored profile
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
    if (!profileJson) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const profile = JSON.parse(profileJson);

    // Check for changes
    const { hasChanges, newProfile } = await checkProfileChanges(profile);

    if (hasChanges && newProfile) {

      // Determine what changed
      const changedFields: string[] = [];
      if (profile.name !== newProfile.name) changedFields.push('Name');
      if (profile.headline !== newProfile.headline) changedFields.push('Headline');
      if (profile.company !== newProfile.company) changedFields.push('Company');
      if (profile.location !== newProfile.location) changedFields.push('Location');
      if (profile.photoUrl !== newProfile.photoUrl) changedFields.push('Photo');

      // Update stored profile
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      // Notify user
      if (changedFields.length > 0) {
        await notifyProfileUpdated(changedFields);
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    // Update last sync time even if no changes
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundSync] Error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background sync task
 */
export async function registerBackgroundSync(): Promise<boolean> {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    
    if (isRegistered) {
      return true;
    }

    // Register the task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 6 * 60 * 60, // 6 hours minimum
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return true;
  } catch (error) {
    console.error('[BackgroundSync] Failed to register:', error);
    return false;
  }
}

/**
 * Unregister the background sync task
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  } catch (error) {
    console.error('[BackgroundSync] Failed to unregister:', error);
  }
}

/**
 * Get background fetch status
 */
export async function getBackgroundSyncStatus(): Promise<{
  isAvailable: boolean;
  isRegistered: boolean;
  lastSync: Date | null;
}> {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);

  return {
    isAvailable: status === BackgroundFetch.BackgroundFetchStatus.Available,
    isRegistered,
    lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
  };
}

/**
 * Store the current profile for background sync
 */
export async function setProfileForSync(profile: any): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Trigger a manual sync (for testing or user-initiated)
 */
export async function triggerManualSync(): Promise<{
  hasChanges: boolean;
  changedFields?: string[];
}> {
  try {
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
    if (!profileJson) {
      return { hasChanges: false };
    }

    const profile = JSON.parse(profileJson);
    const { hasChanges, newProfile } = await checkProfileChanges(profile);

    if (hasChanges && newProfile) {
      const changedFields: string[] = [];
      if (profile.name !== newProfile.name) changedFields.push('Name');
      if (profile.headline !== newProfile.headline) changedFields.push('Headline');
      if (profile.company !== newProfile.company) changedFields.push('Company');
      if (profile.location !== newProfile.location) changedFields.push('Location');
      if (profile.photoUrl !== newProfile.photoUrl) changedFields.push('Photo');

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      return { hasChanges: true, changedFields };
    }

    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return { hasChanges: false };
  } catch (error) {
    console.error('[ManualSync] Error:', error);
    throw error;
  }
}


