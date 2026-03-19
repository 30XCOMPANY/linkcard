/**
 * [INPUT]: @supabase/supabase-js, expo-secure-store, @/src/types, @/src/lib/card-presets
 * [OUTPUT]: supabase client, cardService, shareService, userPreferencesService, auth helpers
 * [POS]: Supabase client + CRUD — sole persistence layer for cards, settings, and share analytics
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {
  BusinessCard,
  CardTagState,
  LinkedInProfile,
  CardVersion,
  ShareSession,
  UserPreferences,
} from '@/src/types';
import { normalizeCardVersion } from '@/src/lib/card-presets';
import type { NameFontKey } from '@/src/lib/name-fonts';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

// Initialize Supabase client (only if URL is configured)
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const createSupabaseClient = (): SupabaseClient => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - running in offline mode');
    // Create a client with placeholder values - it won't work but won't crash
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const supabase: SupabaseClient = createSupabaseClient();
export const isSupabaseEnabled = SUPABASE_ENABLED;

// Database types
export interface DbCard {
  id: string;
  user_id: string;
  profile: LinkedInProfile;
  versions: CardVersion[];
  tag_state?: CardTagState;
  contact_action?: BusinessCard['contactAction'] | null;
  qr_code_data: string;
  created_at: string;
  updated_at: string;
}

export interface DbShareSession {
  id: string;
  card_id: string;
  version_id: string;
  shared_at: string;
  view_count: number;
  recipient_note?: string;
}

export interface DbUserPreferences {
  user_id: string;
  theme_mode: UserPreferences['themeMode'];
  name_font: string;
  auto_sync: boolean;
  include_qr_code: boolean;
  notif_profile_updates: boolean;
  notif_share_activity: boolean;
  notif_sync_reminders: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  themeMode: 'system',
  nameFont: 'classic',
  autoSync: true,
  includeQRCode: true,
  notifProfileUpdates: true,
  notifShareActivity: true,
  notifSyncReminders: false,
};

const toDbUserPreferences = (
  userId: string,
  preferences: UserPreferences
): Omit<DbUserPreferences, 'created_at' | 'updated_at'> => ({
  user_id: userId,
  theme_mode: preferences.themeMode,
  name_font: preferences.nameFont,
  auto_sync: preferences.autoSync,
  include_qr_code: preferences.includeQRCode,
  notif_profile_updates: preferences.notifProfileUpdates,
  notif_share_activity: preferences.notifShareActivity,
  notif_sync_reminders: preferences.notifSyncReminders,
});

const fromDbUserPreferences = (row?: Partial<DbUserPreferences> | null): UserPreferences => ({
  themeMode: row?.theme_mode ?? DEFAULT_USER_PREFERENCES.themeMode,
  nameFont: (row?.name_font ?? DEFAULT_USER_PREFERENCES.nameFont) as NameFontKey,
  autoSync: row?.auto_sync ?? DEFAULT_USER_PREFERENCES.autoSync,
  includeQRCode: row?.include_qr_code ?? DEFAULT_USER_PREFERENCES.includeQRCode,
  notifProfileUpdates:
    row?.notif_profile_updates ?? DEFAULT_USER_PREFERENCES.notifProfileUpdates,
  notifShareActivity:
    row?.notif_share_activity ?? DEFAULT_USER_PREFERENCES.notifShareActivity,
  notifSyncReminders:
    row?.notif_sync_reminders ?? DEFAULT_USER_PREFERENCES.notifSyncReminders,
});

const ensureAuthedUser = async () => {
  if (!SUPABASE_ENABLED) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous auth failed:', error);
    return null;
  }

  return data.user;
};

/**
 * Card operations
 */
export const cardService = {
  /**
   * Save or update a card
   */
  async upsertCard(card: BusinessCard): Promise<DbCard | null> {
    const user = await ensureAuthedUser();
    if (!user) {
      console.warn('No authenticated user, skipping cloud sync');
      return null;
    }

    const dbCard = {
      id: card.id,
      user_id: user.id,
      profile: card.profile,
      versions: card.versions,
      tag_state: card.tagState,
      contact_action: card.contactAction ?? null,
      qr_code_data: card.qrCodeData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cards')
      .upsert(dbCard, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting card:', error);
      return null;
    }

    return data;
  },

  /**
   * Get user's card
   */
  async getCard(): Promise<BusinessCard | null> {
    const user = await ensureAuthedUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      profile: data.profile,
      versions: data.versions.map(normalizeCardVersion),
      tagState: data.tag_state ?? { custom: [], hidden: [], renamed: {} },
      contactAction: data.contact_action ?? undefined,
      qrCodeData: data.qr_code_data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    return !error;
  },

  /**
   * Subscribe to card changes (real-time)
   */
  subscribeToCardChanges(
    cardId: string,
    onUpdate: (card: BusinessCard) => void
  ): RealtimeChannel {
    return supabase
      .channel(`card:${cardId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cards',
          filter: `id=eq.${cardId}`,
        },
        (payload) => {
          const data = payload.new as DbCard;
          onUpdate({
            id: data.id,
            profile: data.profile,
            versions: data.versions.map(normalizeCardVersion),
            tagState: data.tag_state ?? { custom: [], hidden: [], renamed: {} },
            contactAction: data.contact_action ?? undefined,
            qrCodeData: data.qr_code_data,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });
        }
      )
      .subscribe();
  },
};

/**
 * User preference operations
 */
export const userPreferencesService = {
  defaults: DEFAULT_USER_PREFERENCES,

  async getPreferences(): Promise<UserPreferences | null> {
    const user = await ensureAuthedUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return fromDbUserPreferences(data);
  },

  async upsertPreferences(preferences: UserPreferences): Promise<UserPreferences | null> {
    const user = await ensureAuthedUser();
    if (!user) return null;

    const payload = {
      ...toDbUserPreferences(user.id, preferences),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user preferences:', error);
      return null;
    }

    return fromDbUserPreferences(data);
  },

  async resetPreferences(): Promise<UserPreferences | null> {
    return this.upsertPreferences(DEFAULT_USER_PREFERENCES);
  },
};

/**
 * Share session operations
 */
export const shareService = {
  /**
   * Create a share session
   */
  async createSession(
    cardId: string,
    versionId: string,
    recipientNote?: string
  ): Promise<ShareSession | null> {
    const { data, error } = await supabase
      .from('share_sessions')
      .insert({
        card_id: cardId,
        version_id: versionId,
        recipient_note: recipientNote,
        view_count: 0,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating share session:', error);
      return null;
    }

    return {
      id: data.id,
      cardId: data.card_id,
      versionId: data.version_id,
      sharedAt: new Date(data.shared_at),
      viewCount: data.view_count,
      recipientNote: data.recipient_note,
    };
  },

  /**
   * Get share sessions for a card
   */
  async getSessions(cardId: string): Promise<ShareSession[]> {
    const { data, error } = await supabase
      .from('share_sessions')
      .select('*')
      .eq('card_id', cardId)
      .order('shared_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((session) => ({
      id: session.id,
      cardId: session.card_id,
      versionId: session.version_id,
      sharedAt: new Date(session.shared_at),
      viewCount: session.view_count,
      recipientNote: session.recipient_note,
    }));
  },

  /**
   * Increment view count
   */
  async incrementViewCount(sessionId: string): Promise<void> {
    await supabase.rpc('increment_view_count', { session_id: sessionId });
  },
};

/**
 * Auth operations
 */
export const authService = {
  /**
   * Sign in anonymously (for users who don't want to create an account)
   */
  async signInAnonymously(): Promise<boolean> {
    const user = await ensureAuthedUser();
    return Boolean(user);
  },

  /**
   * Sign in with email
   */
  async signInWithEmail(email: string, password: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return !error;
  },

  /**
   * Sign up with email
   */
  async signUpWithEmail(email: string, password: string): Promise<boolean> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return !error;
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    return ensureAuthedUser();
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  },
};
