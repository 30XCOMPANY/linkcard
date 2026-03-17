/**
 * [INPUT]: none (pure type definitions)
 * [OUTPUT]: LinkedInProfile, CardTemplate, CardBackground, FieldStyle, CardVersion, CardTag,
 *           CardTagState, BusinessCard, ContactActionType, ContactAction, SavedContact,
 *           DiscoverProfile, ShareSession, WalletPassData, RootStackParamList, ThemeMode, Theme
 * [POS]: Core domain types — consumed by stores, services, and components across the app
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

// LinkedIn Profile data structure
export interface LinkedInProfile {
  url: string;
  username: string;
  name: string;
  headline: string;
  jobTitle?: string;
  company: string;
  location: string;
  city?: string;
  bannerUrl?: string | null;
  photoUrl: string | null;
  email?: string;
  phone?: string;
  website?: string;
  character?: string;
  publications?: Array<{
    title: string;
    publisher?: string;
    date?: string;
    description?: string;
    url?: string;
  }>;
  lastSynced: Date;
  checksum: string; // For change detection
}

// Card template types
export type CardTemplate = 'classic' | 'modern' | 'minimal' | 'bento' | 'ocean' | 'midnight' | 'sunset' | 'sleek';
export type CardBackground = 'lightGlass' | 'freshBlue' | 'midnightInk' | 'sunsetGlow' | 'paper';

// Field-level typography styles
export interface FieldStyle {
  fontFamily?: 'System' | 'DMSans' | 'CormorantGaramond' | 'JetBrainsMono' | string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: 'regular' | 'medium' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  // Position and dimensions for draggable elements (relative to card, 0-100%)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  opacity?: number;
}

// Card version - different configurations for different contexts
export interface CardVersion {
  id: string;
  name: string; // "Professional", "Networking", "Personal"
  description?: string;
  visibleFields: (keyof LinkedInProfile | 'qrCode')[];
  template: CardTemplate;
  accentColor: string;
  background: CardBackground;
  layout?: 'portrait' | 'landscape' | 'square';
  isDefault: boolean;
  // Field-level style overrides
  fieldStyles?: Record<string, FieldStyle>;
}

export interface CardTag {
  id: string;
  emoji: string;
  label: string;
  source: 'derived' | 'custom';
}

export interface CardTagState {
  custom: CardTag[];
  hidden: string[];
  renamed: Record<string, string>;
}

// The main business card
export interface BusinessCard {
  id: string;
  profile: LinkedInProfile;
  versions: CardVersion[];
  tagState: CardTagState;
  qrCodeData: string;
  createdAt: Date;
  updatedAt: Date;
  contactAction?: ContactAction;
}

// ── Discover & Contact ─────────────────────────────────────────
// How others can contact this user — user-configurable
export type ContactActionType = 'email' | 'linkedin' | 'wechat' | 'url';

export interface ContactAction {
  type: ContactActionType;
  label: string;
  value: string;
}

// A saved contact in the user's card holder
export interface SavedContact {
  id: string;
  profile: LinkedInProfile;
  contactAction?: ContactAction;
  savedAt: string; // ISO 8601 — survives AsyncStorage JSON serialization
}

// Lightweight discovery profile — flat struct, no fieldStyles overhead
export interface DiscoverProfile {
  id: string;
  profile: LinkedInProfile;
  template: CardTemplate;
  accentColor: string;
  background: CardBackground;
  visibleFields: (keyof LinkedInProfile | 'qrCode')[];
  contactAction?: ContactAction;
  qrCodeData: string;
}

// Share session - tracking shared cards
export interface ShareSession {
  id: string;
  cardId: string;
  versionId: string;
  sharedAt: Date;
  viewCount: number;
  recipientNote?: string;
}

// Wallet pass data
export interface WalletPassData {
  serialNumber: string;
  passTypeIdentifier: string;
  downloadUrl: string;
  lastUpdated: Date;
}

// App navigation types
export type RootStackParamList = {
  index: undefined;
  onboarding: undefined;
  card: { cardId: string };
  discover: undefined;
  collection: undefined;
  settings: undefined;
};

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
    success: string;
    error: string;
  };
}
