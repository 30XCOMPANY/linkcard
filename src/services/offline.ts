import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { BusinessCard } from '@/src/types';

const OFFLINE_QUEUE_KEY = 'linkcard_offline_queue';
const CACHED_CARD_KEY = 'linkcard_cached_card';
const LAST_ONLINE_KEY = 'linkcard_last_online';

interface QueuedAction {
  id: string;
  type: 'update_card' | 'create_share' | 'sync_profile';
  payload: any;
  timestamp: number;
}

let isOnline = true;
let listeners: Array<(online: boolean) => void> = [];

/**
 * Initialize offline manager and start listening to network changes
 */
export function initializeOfflineManager(): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const wasOnline = isOnline;
    isOnline = state.isConnected ?? false;

    // Notify listeners
    if (wasOnline !== isOnline) {
      listeners.forEach((listener) => listener(isOnline));

      // Process queue when coming back online
      if (isOnline) {
        processOfflineQueue();
        AsyncStorage.setItem(LAST_ONLINE_KEY, new Date().toISOString());
      }
    }
  });

  return unsubscribe;
}

/**
 * Check if currently online
 */
export function getIsOnline(): boolean {
  return isOnline;
}

/**
 * Check network status
 */
export async function checkNetworkStatus(): Promise<boolean> {
  const state = await NetInfo.fetch();
  isOnline = state.isConnected ?? false;
  return isOnline;
}

/**
 * Add listener for online/offline changes
 */
export function addConnectionListener(
  callback: (online: boolean) => void
): () => void {
  listeners.push(callback);

  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

/**
 * Cache a card for offline access
 */
export async function cacheCard(card: BusinessCard): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHED_CARD_KEY, JSON.stringify(card));
  } catch (error) {
    console.error('Failed to cache card:', error);
  }
}

/**
 * Get cached card
 */
export async function getCachedCard(): Promise<BusinessCard | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHED_CARD_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached card:', error);
    return null;
  }
}

/**
 * Queue an action for when we're back online
 */
export async function queueOfflineAction(
  type: QueuedAction['type'],
  payload: any
): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: QueuedAction[] = queueJson ? JSON.parse(queueJson) : [];

    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
    });

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to queue offline action:', error);
  }
}

/**
 * Process queued actions when back online
 */
export async function processOfflineQueue(): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!queueJson) return;

    const queue: QueuedAction[] = JSON.parse(queueJson);
    if (queue.length === 0) return;


    const failedActions: QueuedAction[] = [];

    for (const action of queue) {
      try {
        await processAction(action);
      } catch (error) {
        console.error(`[Offline] Failed to process action ${action.id}:`, error);
        failedActions.push(action);
      }
    }

    // Keep only failed actions in queue
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedActions));

    if (failedActions.length > 0) {
    }
  } catch (error) {
    console.error('[Offline] Failed to process queue:', error);
  }
}

/**
 * Process a single queued action
 */
async function processAction(action: QueuedAction): Promise<void> {
  switch (action.type) {
    case 'update_card':
      // Import dynamically to avoid circular dependencies
      const { cardService } = await import('./supabase');
      await cardService.upsertCard(action.payload);
      break;

    case 'create_share':
      // Process share creation
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/share/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        }
      );
      if (!response.ok) throw new Error('Share creation failed');
      break;

    case 'sync_profile':
      // Trigger profile sync
      const { triggerManualSync } = await import('./backgroundSync');
      await triggerManualSync();
      break;

    default:
      console.warn(`[Offline] Unknown action type: ${action.type}`);
  }
}

/**
 * Get the offline queue
 */
export async function getOfflineQueue(): Promise<QueuedAction[]> {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Failed to get offline queue:', error);
    return [];
  }
}

/**
 * Clear the offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear offline queue:', error);
  }
}

/**
 * Get last online timestamp
 */
export async function getLastOnlineTime(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_ONLINE_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    return null;
  }
}


