/**
 * [INPUT]: ./types FontOption
 * [OUTPUT]: AVAILABLE_FONTS, CARD_LAYOUTS, TEMPLATE_STYLES, getFontStack
 * [POS]: Editor constants — template visual identities & layout presets
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { FontOption } from './types';

// ============================================================
// FONTS
// ============================================================

export const AVAILABLE_FONTS: FontOption[] = [
  { id: 'System', name: 'System', stack: 'System', category: 'System' },
  { id: 'DMSans', name: 'DM Sans', stack: 'DMSans_400Regular', category: 'Sans Serif' },
  { id: 'CormorantGaramond', name: 'Garamond', stack: 'CormorantGaramond_400Regular', category: 'Serif' },
  { id: 'JetBrainsMono', name: 'Mono', stack: 'JetBrainsMono_400Regular', category: 'Monospace' },
];

export const getFontStack = (fontId: string): string => {
  const font = AVAILABLE_FONTS.find(f => f.id === fontId || f.name === fontId);
  return font?.stack || 'System';
};

// ============================================================
// CARD LAYOUTS
// ============================================================

export const CARD_LAYOUTS = {
  portrait:  { width: 320, height: 520, label: 'Portrait',   icon: 'phone-portrait-outline' },
  landscape: { width: 520, height: 320, label: 'Landscape',  icon: 'phone-landscape-outline' },
  square:    { width: 400, height: 400, label: 'Square',     icon: 'square-outline' },
} as const;

// ============================================================
// TEMPLATE STYLES — visual identity per template
// ============================================================

export const TEMPLATE_STYLES: Record<string, any> = {
  bento: {
    background: '#FFFFFF',
    borderRadius: 24,
    shadowColor: 'rgba(255, 154, 158, 0.3)',
    shadowBlur: 20,
    shadowOffset: { width: 0, height: 8 },
    accentPosition: 'none',
    borderWidth: 0,
    borderColor: 'transparent',
    defaultTextColor: '#1A1A1A',
  },
  modern: {
    background: '#FFFFFF',
    borderRadius: 24,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowBlur: 20,
    shadowOffset: { width: 0, height: 4 },
    accentPosition: 'none',
    borderWidth: 0,
    borderColor: 'transparent',
    defaultTextColor: '#1A1A1A',
  },
  minimal: {
    background: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)',
    borderRadius: 24,
    shadowColor: 'rgba(172, 203, 238, 0.5)',
    shadowBlur: 30,
    shadowOffset: { width: 0, height: 8 },
    accentPosition: 'none',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    defaultTextColor: '#2C3E50',
  },
  classic: {
    background: '#FFF500',
    borderRadius: 12,
    shadowColor: '#1A1A1A',
    shadowOpacity: 1,
    shadowBlur: 0,
    shadowOffset: { width: 6, height: 6 },
    accentPosition: 'none',
    borderWidth: 4,
    borderColor: '#000000',
    defaultTextColor: '#1A1A1A',
  },
  sunset: {
    background: 'linear-gradient(135deg, #ff6b9d 0%, #ffa06b 40%, #ff9a76 70%, #c471ed 100%)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: 'rgba(255, 107, 157, 0.4)',
    shadowBlur: 40,
    shadowOffset: { width: 0, height: 16 },
    hasGlassOverlay: true,
    glassOpacity: 0.12,
    glassBlur: 30,
    defaultTextColor: '#FFFFFF',
    secondaryTextColor: 'rgba(255, 255, 255, 0.85)',
    accentColor: '#ff6b9d',
    accentPosition: 'none',
    layout: 'sunset',
  },
  midnight: {
    background: 'linear-gradient(160deg, #0a0a14 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    shadowColor: 'rgba(99, 102, 241, 0.3)',
    shadowBlur: 50,
    shadowOffset: { width: 0, height: 20 },
    hasGlassOverlay: true,
    glassOpacity: 0.08,
    glassBlur: 40,
    innerGlow: 'rgba(99, 102, 241, 0.1)',
    defaultTextColor: '#FFFFFF',
    secondaryTextColor: 'rgba(255, 255, 255, 0.7)',
    accentColor: '#6366f1',
    accentPosition: 'none',
    layout: 'midnight',
  },
  ocean: {
    background: 'rgba(255, 255, 255, 0.40)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowBlur: 35,
    shadowOffset: { width: 0, height: 12 },
    hasGlassOverlay: true,
    glassOpacity: 0.12,
    glassBlur: 45,
    defaultTextColor: '#1a1a1a',
    secondaryTextColor: '#6b7280',
    accentTextColor: '#0066CC',
    accentPosition: 'none',
    layout: 'ocean',
  },
  sleek: {
    background: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowBlur: 25,
    shadowOffset: { width: 0, height: 8 },
    hasGlassOverlay: false,
    defaultTextColor: '#111827',
    secondaryTextColor: '#6b7280',
    accentColor: '#6366f1',
    accentPosition: 'none',
    layout: 'modern',
  },
};
