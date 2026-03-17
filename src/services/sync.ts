/**
 * [INPUT]: react-native AppState, ./linkedin (checkProfileChanges), @/src/types
 * [OUTPUT]: ProfileSyncService — foreground periodic sync with app state awareness
 * [POS]: Foreground sync scheduler — 6hr interval, 5min debounce, pauses in background
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { AppState, AppStateStatus } from 'react-native';
import { checkProfileChanges } from './linkedin';
import { LinkedInProfile } from '@/src/types';

// Sync interval in milliseconds (6 hours)
const SYNC_INTERVAL = 6 * 60 * 60 * 1000;

// Minimum time between syncs (5 minutes)
const MIN_SYNC_INTERVAL = 5 * 60 * 1000;

type SyncCallback = (newProfile: LinkedInProfile) => void;
type ErrorCallback = (error: Error) => void;

class ProfileSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private currentProfile: LinkedInProfile | null = null;
  private onProfileUpdate: SyncCallback | null = null;
  private onError: ErrorCallback | null = null;
  private appStateSubscription: any = null;

  /**
   * Start automatic sync for a profile
   */
  start(
    profile: LinkedInProfile,
    onUpdate: SyncCallback,
    onError?: ErrorCallback
  ) {
    this.currentProfile = profile;
    this.onProfileUpdate = onUpdate;
    this.onError = onError || null;

    // Initial sync check
    this.checkForUpdates();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.checkForUpdates();
    }, SYNC_INTERVAL);

    // Sync when app comes to foreground
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange
    );
  }

  /**
   * Stop automatic sync
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.currentProfile = null;
    this.onProfileUpdate = null;
    this.onError = null;
  }

  /**
   * Manually trigger a sync
   */
  async forceSync(): Promise<LinkedInProfile | null> {
    return this.checkForUpdates(true);
  }

  /**
   * Check for profile updates
   */
  private async checkForUpdates(
    force: boolean = false
  ): Promise<LinkedInProfile | null> {
    if (!this.currentProfile) {
      return null;
    }

    // Rate limiting
    const now = Date.now();
    if (!force && now - this.lastSyncTime < MIN_SYNC_INTERVAL) {
      return null;
    }

    this.lastSyncTime = now;

    try {
      const { hasChanges, newProfile } = await checkProfileChanges(
        this.currentProfile
      );

      if (hasChanges && newProfile) {
        this.currentProfile = newProfile;
        this.onProfileUpdate?.(newProfile);
        return newProfile;
      }

      return null;
    } catch (error) {
      this.onError?.(error as Error);
      return null;
    }
  }

  /**
   * Handle app state changes (background/foreground)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, check for updates
      this.checkForUpdates();
    }
  };

  /**
   * Update the profile being synced
   */
  updateProfile(profile: LinkedInProfile) {
    this.currentProfile = profile;
  }

  /**
   * Get the current sync status
   */
  getStatus(): {
    isRunning: boolean;
    lastSyncTime: number;
    profile: LinkedInProfile | null;
  } {
    return {
      isRunning: this.syncInterval !== null,
      lastSyncTime: this.lastSyncTime,
      profile: this.currentProfile,
    };
  }
}

// Export singleton instance
export const profileSyncService = new ProfileSyncService();

// Export convenience hooks (would be used with React Context in a full implementation)
export const useSyncService = () => {
  return {
    start: profileSyncService.start.bind(profileSyncService),
    stop: profileSyncService.stop.bind(profileSyncService),
    forceSync: profileSyncService.forceSync.bind(profileSyncService),
    getStatus: profileSyncService.getStatus.bind(profileSyncService),
  };
};


