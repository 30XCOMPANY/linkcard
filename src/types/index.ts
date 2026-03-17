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
  layout?: 'portrait' | 'landscape' | 'square';
  isDefault: boolean;
  // Field-level style overrides
  fieldStyles?: Record<string, FieldStyle>;
}

// The main business card
export interface BusinessCard {
  id: string;
  profile: LinkedInProfile;
  versions: CardVersion[];
  qrCodeData: string;
  createdAt: Date;
  updatedAt: Date;
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
  share: { cardId: string; versionId?: string };
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

