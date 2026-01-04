/**
 * LinkCard Editor - Canva-style Card Customization
 * Drag & Drop components from sidebar to editable card canvas
 */

import React, { useState, useRef, useMemo, useLayoutEffect, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Dimensions,
  TextInput,
  Modal,
  Text as RNText,
  PanResponder,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, Redirect } from 'expo-router';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Design System
import {
  colors,
  spacing,
  radii,
} from '@/src/design-system/tokens';
import { Text, VStack, HStack } from '@/src/design-system/primitives';
import { Button } from '@/src/design-system/patterns';
import { fontFamily, fontSize, letterSpacing, lineHeight } from '@/src/design-system/tokens/typography';

import { useCardStore } from '@/src/stores/cardStore';
import { CardVersion, CardTemplate, FieldStyle } from '@/src/types';
import { CardComponent, extractComponentsFromProfile } from '@/src/types/cardComponents';
import { QRCode } from '@/src/components/qr/QRCode';
import { Avatar } from '@/src/components/ui/Avatar';

// ============== Types ==============
interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'avatar' | 'divider' | 'shape';
  fieldKey: string; // Maps to profile field or special keys
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Auto or fixed
  style: FieldStyle;
  locked?: boolean;
  visible: boolean;
}

// ============== Constants ==============

// Available fonts for the dropdown
interface FontOption {
  id: string;
  name: string;
  stack: string;
  category?: string;
}

const AVAILABLE_FONTS: FontOption[] = [
  { id: 'System', name: 'System', stack: 'System', category: 'System' },
  { id: 'DMSans', name: 'DM Sans', stack: 'DMSans_400Regular', category: 'Sans Serif' },
  { id: 'CormorantGaramond', name: 'Garamond', stack: 'CormorantGaramond_400Regular', category: 'Serif' },
  { id: 'JetBrainsMono', name: 'Mono', stack: 'JetBrainsMono_400Regular', category: 'Monospace' },
];

const CARD_LAYOUTS = {
  portrait: { width: 320, height: 520, label: 'Portrait', icon: 'phone-portrait-outline' },
  landscape: { width: 520, height: 320, label: 'Landscape', icon: 'phone-landscape-outline' },
  square: { width: 400, height: 400, label: 'Square', icon: 'square-outline' },
};

const CARD_BASE_WIDTH = 320; // Fallback
const CARD_BASE_HEIGHT = 520; // Fallback
const getFontStack = (fontId: string): string => {
  const font = AVAILABLE_FONTS.find(f => f.id === fontId || f.name === fontId);
  return font?.stack || 'System';
};

// Template styles - each template has a unique visual identity
interface TemplateStyle {
  background: string;
  gradient?: string;
  borderRadius: number;
  shadowColor?: string;
  shadowBlur?: number;
  accentPosition?: 'top' | 'left' | 'bottom' | 'none';
  accentWidth?: number;
}

const TEMPLATE_STYLES: Record<string, any> = {

  bento: {
    // "Dopamine" - Playful, colorful, energetic - MULTI-COLOR design
    background: '#FFFFFF', // Base white, we'll add colorful elements on top
    borderRadius: 24,
    shadowColor: 'rgba(255, 154, 158, 0.3)',
    shadowBlur: 20,
    shadowOffset: { width: 0, height: 8 },
    accentPosition: 'none',
    borderWidth: 0, // No border, colorful blocks will provide visual separation
    borderColor: 'transparent',
    defaultTextColor: '#1A1A1A',
  },
  modern: {
    // "Swiss Clean" - Editorial, precise, timeless.
    background: '#FFFFFF', // Pure white background
    borderRadius: 24, // Rounded for a softer look
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowBlur: 20,
    shadowOffset: { width: 0, height: 4 },
    accentPosition: 'none', // EXPLICITLY REMOVE ACCENT
    borderWidth: 0,
    borderColor: 'transparent',
    defaultTextColor: '#1A1A1A',
  },
  minimal: {
    // "Frosted Ether" - Holographic, airy, premium.
    background: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)', // Cloudy Knoxville
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
    // "Neo-Brutalism" - High fashion, bold, distinct.
    background: '#FFF500', // Cyber Yellow
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

  // Aurora removed - not in final 4

  // ==========================================
  // SUNSET - Warm Gradient Paradise
  // ==========================================
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

  // ==========================================
  // MIDNIGHT - Deep Space Elegance
  // ==========================================
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

  // Cream removed - not in final 4

  // ==========================================
  // OCEAN - Apple Frosted Glass (Flagship)
  // ==========================================
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

  // ==========================================
  // SLEEK - Modern Minimal White
  // ==========================================
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


// ============== Helper Functions ==============
const getDefaultElements = (profile: any, visibleFields: string[]): CanvasElement[] => {
  const elements: CanvasElement[] = [];

  // Used for styles if needed, otherwise hardcoded for the "Final" layout
  const styles: any = {};

  // Header Cluster (FINAL VERTICAL STACK)
  // 1. Avatar
  if (visibleFields.includes('photoUrl') && profile.photoUrl) {
    elements.push({
      id: 'photo-element',
      type: 'avatar',
      fieldKey: 'photoUrl',
      x: 10,
      y: 8,
      width: 20,
      height: 0,
      style: { borderRadius: 100 },
      visible: true,
    });
  }

  // 2. Name
  if (visibleFields.includes('name')) {
    elements.push({
      id: 'name-element',
      type: 'text',
      fieldKey: 'name',
      x: 10,
      y: 30,
      width: 80,
      height: 0,
      style: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
      },
      visible: true,
    });
  }

  // 3. Job Title
  if (visibleFields.includes('jobTitle')) {
    elements.push({
      id: 'job-title-element',
      type: 'text',
      fieldKey: 'jobTitle',
      x: 10,
      y: 38,
      width: 80,
      height: 0,
      style: {
        fontSize: 13,
        fontWeight: 'medium',
        color: '#666666',
        textAlign: 'left',
      },
      visible: true,
    });
  }

  // 4. Headline (Pushed tight to name)
  if (visibleFields.includes('headline')) {
    elements.push({
      id: 'headline-element',
      type: 'text',
      fieldKey: 'headline',
      x: 10,
      y: 46,
      width: 80,
      height: 0,
      style: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: 'regular',
        color: '#1a1a1a',
        textAlign: 'left',
      },
      visible: true,
    });
  }

  // 5. Character
  if (visibleFields.includes('character') && profile.character) {
    elements.push({
      id: 'character-element',
      type: 'text',
      fieldKey: 'character',
      x: 10,
      y: 58,
      width: 80,
      height: 0,
      style: {
        fontSize: 12,
        fontWeight: 'regular',
        color: '#999999',
        textAlign: 'left',
      },
      visible: true,
    });
  }

  // Footer / Bottom Section
  if (visibleFields.includes('company')) {
    elements.push({
      id: 'company-element',
      type: 'text',
      fieldKey: 'company',
      x: 10,
      y: 76,
      width: 50,
      height: 0,
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'left',
      },
      visible: true,
    });
  }

  if (visibleFields.includes('location')) {
    elements.push({
      id: 'location-element',
      type: 'text',
      fieldKey: 'location',
      x: 10,
      y: 84,
      width: 50,
      height: 0,
      style: {
        fontSize: 12,
        fontWeight: 'regular',
        color: '#666666',
        textAlign: 'left',
      },
      visible: true,
    });
  }

  if (visibleFields.includes('qrCode')) {
    elements.push({
      id: 'qr-element',
      type: 'qr',
      fieldKey: 'qrCode',
      x: 74,
      y: 76,
      width: 16,
      height: 0,
      style: {},
      visible: true,
    });
  }

  return elements;
};

// ============== Editor Screen ==============
export default function EditorScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { card, updateVersion, setDefaultVersion, updateProfile } = useCardStore();

  // Version selection
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    card?.versions.find(v => v.isDefault)?.id || card?.versions[0]?.id || ''
  );

  // Canvas elements state
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);

  // Undo/Redo history
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false); // Prevent adding to history during undo/redo

  // Selected element for editing
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Editing state
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Double-click detection
  const [lastClickedElement, setLastClickedElement] = useState<{ id: string; time: number } | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<CardComponent | null>(null);

  // Card scale
  const [cardScale, setCardScale] = useState(1.0);

  // Card background color - Default to white for modern template
  const [cardBgColor, setCardBgColor] = useState('#FFFFFF');

  // Sidebar active tab
  const [activeTab, setActiveTab] = useState<'components' | 'style' | 'settings'>('components');


  // Available components from profile
  const availableComponents = useMemo<CardComponent[]>(() => {
    if (!card) return [];
    return extractComponentsFromProfile(card.profile);
  }, [card?.profile]);

  // Selected version - computed directly without memoization to ensure updates are reflected
  const selectedVersion = (() => {
    if (!card?.versions || card.versions.length === 0) return null;
    const version = card.versions.find(v => v.id === selectedVersionId) || card.versions[0];
    return version;
  })();

  // Initialize canvas elements when version changes
  // Track if this is the first initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize card background color based on template
  useEffect(() => {
    if (selectedVersion) {
      const templateDefaults: Record<string, string> = {
        'minimal': 'linear-gradient(to top, #accbee 0%, #e2ebf0 100%)',
        'bento': '#FFFFFF', // White base for colorful blocks overlay
        'modern': '#FFFFFF',
        'classic': '#FFF500',
      };
      const defaultBg = templateDefaults[selectedVersion.template] || '#FFFFFF';
      setCardBgColor(defaultBg);
    }
  }, [selectedVersion?.template]);

  useEffect(() => {
    if (card && selectedVersion) {
      console.log('[Editor] useEffect triggered, visibleFields:', selectedVersion.visibleFields);
      const newElements = getDefaultElements(card.profile, selectedVersion.visibleFields as string[]);
      console.log('[Editor] Generated elements:', newElements.map(e => e.fieldKey));

      // Merge with saved fieldStyles if any
      if (selectedVersion.fieldStyles) {
        newElements.forEach(el => {
          const savedStyle = selectedVersion.fieldStyles?.[el.fieldKey];
          if (savedStyle) {
            el.style = { ...el.style, ...savedStyle };
            if (savedStyle.x !== undefined) el.x = savedStyle.x;
            if (savedStyle.y !== undefined) el.y = savedStyle.y;
          }
        });
      }

      // If already initialized, preserve custom elements AND standard optional elements
      if (isInitialized) {
        setCanvasElements(prev => {
          // Which elements should we KEEP even if the new theme doesn't have them by default?
          // We want to keep EVERYTHING the user added.
          // The issue is duplication: if we keep 'name' and the new theme adds 'name', we get two names.
          // Strategy: Keep unique functional elements (socials, location, dividers) 
          // that might NOT be in the target defaults, or just trust the merger below.

          const preservedElements = prev.filter(el =>
            el.fieldKey === 'divider' ||
            el.fieldKey.startsWith('custom-') ||
            el.type === 'divider' ||
            ['location', 'city', 'email', 'phone', 'website', 'qrCode', 'company', 'headline', 'photoUrl'].includes(el.fieldKey)
          );

          // We will MERGE these with newDefaults. 
          // But wait, newDefaults (newElements) has positions. We want the NEW positions for standard items.
          // So we should actually USE the newElements as the base, and ADD any 'custom' stuff that isn't standard.
          // BUT if the User added 'Location' and the new Theme doesn't have Location in defaults, we want to KEEP Location.

          // Let's filter 'newElements' (defaults) to see what's included.
          const defaultKeys = newElements.map(e => e.fieldKey);

          // Find elements in PREV that are NOT in the new defaults (e.g. user added Location manually)
          const extras = prev.filter(p => !defaultKeys.includes(p.fieldKey));

          // Now, for elements that ARE in both (e.g. Name), we want the NEW position/style from newElements.
          // So: Result = NewDefaults + Extras.
          const merged = [...newElements, ...extras];
          // Initialize history with the merged state (skip history for theme merges)
          isUndoRedoRef.current = true;
          setTimeout(() => {
            setHistory([JSON.parse(JSON.stringify(merged))]);
            setHistoryIndex(0);
            isUndoRedoRef.current = false;
          }, 0);
          return merged;
        });
      } else {
        // Initialize history with the initial state
        isUndoRedoRef.current = true;
        setCanvasElements(newElements);
        setIsInitialized(true);
        setTimeout(() => {
          setHistory([JSON.parse(JSON.stringify(newElements))]);
          setHistoryIndex(0);
          isUndoRedoRef.current = false;
        }, 0);
      }

      // Force deduplication safe-guard (checking visibleFields vs generated)
      // If we have both, remove 'location' from state immediately if 'city' exists
      if (newElements.some(e => e.fieldKey === 'city') && newElements.some(e => e.fieldKey === 'location')) {
        // This shouldn't happen with current getDefaultElements, but for safety:
        updateCanvasElements(prev => prev.filter(el => el.fieldKey !== 'location'));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersion?.id, selectedVersion?.template, isInitialized]); // Only re-init if template/version changes, NOT profile data or visibility toggles

  // Emergency Cleanup Effect to fix specific bug where both location and city appear
  useEffect(() => {
    let hasChanges = false;
    let newElements = [...canvasElements];

    // Fix 1: Deduplicate Location/City
    const hasCity = newElements.some(el => el.fieldKey === 'city');
    const hasLocation = newElements.some(el => el.fieldKey === 'location');

    if (hasCity && hasLocation) {
      newElements = newElements.filter(el => el.fieldKey !== 'location');
      hasChanges = true;
    }

    // Fix 2: Force PhotoUrl to be Avatar type (Aggressive)
    newElements = newElements.map(el => {
      let shouldBeAvatar = false;

      // Check 1: Key matches known photo keys
      if (el.fieldKey === 'photo' || el.fieldKey === 'photoUrl') shouldBeAvatar = true;

      // Check 2: ID matches known photo IDs
      if (el.id === 'photo-element' || el.id.includes('avatar')) shouldBeAvatar = true;

      // Check 3: Content looks like a URL but is being rendered as text
      if (el.type === 'text') {
        const content = card?.profile?.[el.fieldKey as keyof typeof card.profile] as string;
        if (typeof content === 'string' && content.startsWith('http') && (content.includes('/image/') || content.includes('licdn.com'))) {
          shouldBeAvatar = true;
        }
      }

      if (shouldBeAvatar && el.type !== 'avatar') {
        console.log('[Editor] Fixing corrupted Photo element type (text -> avatar)', el.id);
        hasChanges = true;
        // Force mapping to 'photoUrl' if we detected it's a photo
        const newFieldKey = 'photoUrl';

        return {
          ...el,
          fieldKey: newFieldKey,
          type: 'avatar' as const,
          width: 20,
          height: 0,
          style: { ...el.style, borderRadius: 100 }
        };
      }
      return el;
    });

    if (hasChanges) {
      console.log('[Editor] Applying auto-fixes to canvas elements');
      // Don't add auto-fixes to history, they're internal corrections
      isUndoRedoRef.current = true;
      setCanvasElements(newElements);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [canvasElements, selectedVersion?.id, card?.profile]);

  // ============== Handlers (must be before conditional return) ==============

  // Add state to history (called whenever canvasElements changes, except during undo/redo)
  const addToHistory = useCallback((newElements: CanvasElement[]) => {
    if (isUndoRedoRef.current) return; // Skip if we're in the middle of undo/redo

    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(JSON.parse(JSON.stringify(newElements))); // Deep clone
      // Limit history size to 50
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(prevIdx => prevIdx + 1);
      }
      return newHistory;
    });
  }, [historyIndex]);

  // Update canvasElements and add to history
  const updateCanvasElements = useCallback((newElements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
    setCanvasElements(prev => {
      const updated = typeof newElements === 'function' ? newElements(prev) : newElements;
      // Add to history after state update (in next tick)
      setTimeout(() => addToHistory(updated), 0);
      return updated;
    });
  }, [addToHistory]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && Platform.OS === 'web') {
      isUndoRedoRef.current = true;
      const prevState = history[historyIndex - 1];
      setCanvasElements(JSON.parse(JSON.stringify(prevState))); // Deep clone
      setHistoryIndex(prev => prev - 1);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1 && Platform.OS === 'web') {
      isUndoRedoRef.current = true;
      const nextState = history[historyIndex + 1];
      setCanvasElements(JSON.parse(JSON.stringify(nextState))); // Deep clone
      setHistoryIndex(prev => prev + 1);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts for undo/redo (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+Z (Mac) or Ctrl+Z (Windows/Linux) for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
      }
      // Command+Shift+Z (Mac) or Ctrl+Y (Windows/Linux) for redo
      if ((e.metaKey || e.ctrlKey) && ((e.shiftKey && e.key === 'z') || (!e.shiftKey && e.key === 'y'))) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const handleElementDrag = useCallback((elementId: string, dx: number, dy: number) => {
    updateCanvasElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      const newX = Math.max(0, Math.min(100 - (el.width || 0), el.x + dx));
      const newY = Math.max(0, Math.min(95, el.y + dy));
      return {
        ...el,
        x: newX,
        y: newY,
      };
    }));
  }, [updateCanvasElements]);

  const handleSave = () => {
    if (!selectedVersion) return;
    // Save element positions to fieldStyles
    const fieldStyles: Record<string, FieldStyle> = {};
    canvasElements.forEach(el => {
      fieldStyles[el.fieldKey] = {
        ...el.style,
        x: el.x,
        y: el.y,
      };
    });
    updateVersion(selectedVersionId, { fieldStyles });
    router.replace('/');
  };

  const handleElementSelect = async (elementId: string, isDoubleClick: boolean = false) => {
    const element = canvasElements.find(el => el.id === elementId);
    if (!element) return;

    if (isDoubleClick) {
      // Double-click to edit or change photo
      if (element.fieldKey === 'photoUrl') {
        // Double-click on photo to change it
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const imageUri = result.assets[0].uri;
          // Update profile photo
          updateProfile({ photoUrl: imageUri });
        }
        return;
      } else if (element && element.type === 'text') {
        // Double-click on text to edit
        setEditingElementId(elementId);
        setEditingValue(getElementContent(element.fieldKey) || '');
      }
    } else {
      // Single click - just select (allow dragging)
      setSelectedElementId(elementId);
    }
  };

  const handleCanvasClick = () => {
    setSelectedElementId(null);
    setEditingElementId(null);
  };

  // Redirect if no card (after all hooks)
  if (!card || !selectedVersion) {
    return <Redirect href="/onboarding" />;
  }

  // Layout calculations
  const sidebarWidth = Math.min(360, windowWidth * 0.35);
  const canvasAreaWidth = windowWidth - sidebarWidth;

  // Card dimensions based on layout
  const currentLayout = selectedVersion?.layout || 'portrait';
  const currentDims = CARD_LAYOUTS[currentLayout];

  // Card scale calculation
  const calculatedScale = Math.min(
    (canvasAreaWidth - 48) / currentDims.width,
    (windowHeight * 0.6) / currentDims.height
  );
  const cardDisplayScale = Math.min(1, calculatedScale);
  // Selected element
  const selectedElement = canvasElements.find(el => el.id === selectedElementId);

  const handleElementStyleChange = (property: keyof FieldStyle, value: any) => {
    if (!selectedElementId) return;
    updateCanvasElements(prev => prev.map(el => {
      if (el.id !== selectedElementId) return el;
      return {
        ...el,
        style: { ...el.style, [property]: value },
      };
    }));
  };

  const handleElementResize = (elementId: string, dWidth: number) => {
    updateCanvasElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      // dWidth is in percentage
      return {
        ...el,
        width: Math.max(10, Math.min(100, (el.width || 40) + dWidth)),
      };
    }));
  };

  const handleComponentDrop = (component: CardComponent, dropX: number, dropY: number) => {
    console.log('[Editor] handleComponentDrop called:', component.id, 'type:', component.type);

    // Check if already on canvas (Handle aliases)
    const existingElement = canvasElements.find(el => {
      if (component.id === 'location') {
        return el.fieldKey === 'location' || el.fieldKey === 'city';
      }
      return el.fieldKey === component.id;
    });

    if (existingElement) {
      console.log('[Editor] Element already exists, selecting it:', existingElement.id);
      setSelectedElementId(existingElement.id);
      return;
    }

    // Special handling for different types
    const isQRCode = component.id === 'qrCode' || component.type === 'qr';
    const isPhoto = component.id === 'photo' || component.id === 'photoUrl' || component.type === 'image';
    const isDivider = component.id === 'divider' || component.type === 'divider';

    // Check if the profile has this data (skip check for QR, Divider, or Photo with URL)
    if (!isQRCode && !isDivider) {
      const profileData = (card.profile as any)[component.id];
      if (!profileData && !isPhoto) {
        // Special case: Location mapped to City
        if (component.id === 'location' && (card.profile as any).city) {
          // Allow it
        } else {
          console.log('[Editor] No profile data for:', component.id);
          return;
        }
      }
    }

    console.log('[Editor] Adding new element for:', component.id);

    // Determine element type and position based on component type
    let elementType: CanvasElement['type'] = 'text';
    let x = 25, y = 40, width = 50, height = 0;

    // Resolve Field Key (Location -> City alias, Photo -> PhotoUrl alias)
    let finalFieldKey = component.id;
    if (component.id === 'location' && (card.profile as any).city) {
      finalFieldKey = 'city';
    } else if (component.id === 'photo') {
      finalFieldKey = 'photoUrl';
    }

    let style: any = {
      fontSize: 13,
      fontWeight: 'regular' as const,
      color: '#FFFFFF',
      textAlign: 'left' as const,
    };

    if (isQRCode) {
      elementType = 'qr';
      x = 75; y = 60; width = 20;
    } else if (isPhoto) {
      elementType = 'avatar';
      x = 5; y = 8; width = 20;
    } else if (isDivider) {
      elementType = 'divider';
      x = 5; y = 50; width = 90; height = 2;
    } else if (component.id === 'name') {
      style = { ...style, fontSize: 24, fontWeight: 'bold' as const };
    } else if (component.id === 'headline' || component.id === 'jobTitle') {
      style = { ...style, fontSize: 13, fontWeight: 'medium' as const };
    } else if (component.id === 'company') {
      style = { ...style, fontSize: 16, fontWeight: 'medium' as const };
    }

    // Create new element directly
    const newElement: CanvasElement = {
      id: `${finalFieldKey}-element`,
      type: elementType,
      fieldKey: finalFieldKey,
      x,
      y,
      width,
      height,
      style: {
        ...style,
        color: undefined, // Use smart default from template
      },
      visible: true,
    };

    updateCanvasElements(prev => {
      console.log('[Editor] Adding element to canvas, new count:', prev.length + 1);
      return [...prev, newElement];
    });

    // Remove auto-selection for ALL elements to prevent UI jumping/toolbar appearing
    // setSelectedElementId(newElement.id);

    // Also update visible fields in store for persistence
    const fieldKey = finalFieldKey;
    if (!selectedVersion.visibleFields.includes(fieldKey as any)) {
      updateVersion(selectedVersionId, {
        visibleFields: [...selectedVersion.visibleFields, fieldKey as any],
      });
    }
  };

  const handleElementDelete = (elementId: string) => {
    handleRemoveElement(elementId);
  };

  const handleRemoveElement = (elementId: string) => {
    // If elementId is actually a Component ID (from Sidebar), handle it by finding the element
    let idToRemove = elementId;
    let element = canvasElements.find(el => el.id === elementId);

    if (!element) {
      // Try finding by fieldKey (Sidebar passes 'location', not 'location-element')
      // If passing 'location', check for 'city' too
      if (elementId === 'location') {
        element = canvasElements.find(el => el.fieldKey === 'location' || el.fieldKey === 'city');
      } else {
        element = canvasElements.find(el => el.fieldKey === elementId);
      }
      if (element) idToRemove = element.id;
    }

    if (!element) return;

    // Special: If removing location, also remove city (and vice versa) to be safe
    const keysToRemove = [element.fieldKey];
    if (element.fieldKey === 'location') keysToRemove.push('city');
    if (element.fieldKey === 'city') keysToRemove.push('location');

    // Remove from visibleFields
    updateVersion(selectedVersionId, {
      visibleFields: selectedVersion.visibleFields.filter(f => !keysToRemove.includes(f)),
    });

    updateCanvasElements(prev => prev.filter(el => !keysToRemove.includes(el.fieldKey)));
    setSelectedElementId(null);
  };

  const handleComponentClick = (component: CardComponent) => {
    // Use center of screen default
    handleComponentDrop(component, 50, 50);
  };

  const handleSaveEdit = () => {
    if (editingElementId) {
      const element = canvasElements.find(el => el.id === editingElementId);
      if (element) {
        updateProfile({ [element.fieldKey]: editingValue } as any);
      }
      setEditingElementId(null);
      setEditingValue('');
    }
  };

  const getElementContent = (fieldKey: string): string => {
    if (fieldKey === 'qrCode') return '';
    return (card.profile as any)[fieldKey] || '';
  };

  const getElementType = (componentType: string): CanvasElement['type'] => {
    switch (componentType) {
      case 'image': return 'avatar';
      case 'qr': return 'qr';
      default: return 'text';
    }
  };

  // ============== Render ==============

  return (
    <View style={styles.container}>
      {/* Header Toolbar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/onboarding?step=linkedin')}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Card Editor</Text>

        <View style={styles.headerActions}>
          {/* Zoom controls removed */}
        </View>

        <Button
          onPress={handleSave}
          variant="primary"
          size="sm"
          style={{ backgroundColor: colors.dark }}
        >
          Save
        </Button>
      </View>

      {/* Element Toolbar (shown when element selected) */}
      {selectedElement && (
        <View style={styles.elementToolbar}>
          {/* Delete Button REMOVED as per user request */}
          {/* <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleElementDelete(selectedElement.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity> */}

          {/* Text editing controls - Only for text elements */}
          {selectedElement.type === 'text' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.toolbarInner}>
                {/* Font Size */}
                <View style={styles.toolbarGroup}>
                  <Text style={styles.toolbarLabel}>Size</Text>
                  <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={() => handleElementStyleChange('fontSize', Math.max(8, (selectedElement.style.fontSize || 16) - 1))}
                  >
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.toolbarValue}>{selectedElement.style.fontSize || 16}</Text>
                  <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={() => handleElementStyleChange('fontSize', Math.min(72, (selectedElement.style.fontSize || 16) + 1))}
                  >
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Font Weight */}
                <View style={styles.toolbarGroup}>
                  <Text style={styles.toolbarLabel}>Weight</Text>
                  {(['regular', 'medium', 'bold'] as const).map(weight => {
                    const isActive = selectedElement.style.fontWeight === weight ||
                      (!selectedElement.style.fontWeight && weight === 'regular');
                    return (
                      <TouchableOpacity
                        key={weight}
                        style={[
                          styles.toolbarPill,
                          isActive && styles.toolbarPillActive,
                        ]}
                        onPress={() => {
                          console.log('[Toolbar] Setting fontWeight to:', weight);
                          handleElementStyleChange('fontWeight', weight);
                        }}
                      >
                        <Text style={[
                          styles.toolbarPillText,
                          { fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '500' : '400' },
                          isActive && styles.toolbarPillTextActive,
                        ]}>{weight.charAt(0).toUpperCase() + weight.slice(1)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Font Family Selector - Horizontal */}
                <View style={styles.toolbarGroup}>
                  <Text style={styles.toolbarLabel}>Font</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontScrollView}>
                    <View style={styles.fontRow}>
                      {AVAILABLE_FONTS.map(font => {
                        const isSelected = selectedElement.style.fontFamily === font.id || (!selectedElement.style.fontFamily && font.id === 'System');
                        return (
                          <TouchableOpacity
                            key={font.id}
                            style={[
                              styles.fontOption,
                              isSelected && styles.fontOptionActive
                            ]}
                            onPress={() => handleElementStyleChange('fontFamily', font.id)}
                          >
                            <Text style={[styles.fontOptionText, { fontFamily: font.stack }, isSelected && styles.fontOptionTextActive]}>
                              {font.name}
                            </Text>
                          </TouchableOpacity>
                        )
                      }
                      )}
                    </View>
                  </ScrollView>
                </View>

                {/* Text Align - Unified Icons */}
                <View style={styles.toolbarGroup}>
                  <Text style={styles.toolbarLabel}>Align</Text>
                  <View style={styles.alignButtonsRow}>
                    {(['left', 'center', 'right'] as const).map(align => {
                      const isActive = selectedElement.style.textAlign === align || (!selectedElement.style.textAlign && align === 'left');
                      const iconColor = isActive ? '#FFFFFF' : colors.text;
                      return (
                        <TouchableOpacity
                          key={align}
                          style={[styles.alignBtn, isActive && styles.alignBtnActive]}
                          onPress={() => handleElementStyleChange('textAlign', align)}
                        >
                          <MaterialIcons
                            name={`format-align-${align}` as any}
                            size={18}
                            color={iconColor}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Color */}
                <View style={styles.toolbarGroup}>
                  <Text style={styles.toolbarLabel}>Color</Text>
                  {['#FFFFFF', '#1A1A1A', '#6366F1', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorDot,
                        { backgroundColor: color },
                        color === '#FFFFFF' && styles.colorDotWhite,
                        selectedElement.style.color === color && styles.colorDotActive,
                      ]}
                      onPress={() => handleElementStyleChange('color', color)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          )}

        </View>
      )}

      {/* Main Content */}
      <View style={styles.main}>
        {/* Canvas Area */}
        <View
          style={[styles.canvasArea, { width: canvasAreaWidth }]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleCanvasClick}
        >
          {/* Grid Background */}
          <View style={styles.gridBg} />

          {/* Card Canvas */}
          {(() => {
            const templateStyle = TEMPLATE_STYLES[selectedVersion.template] || TEMPLATE_STYLES.classic;
            const layout = selectedVersion.layout || 'portrait';
            const dims = CARD_LAYOUTS[layout];
            // Card style base - Apply template-specific styling
            const cardStyles: any = {
              width: dims.width * cardDisplayScale,
              height: dims.height * cardDisplayScale,
              backgroundColor: cardBgColor, // Always take state first
              borderRadius: templateStyle.borderRadius || 0,
              overflow: 'hidden',
              position: 'relative' as const,
              borderWidth: templateStyle.borderWidth !== undefined ? templateStyle.borderWidth : 0,
              borderColor: templateStyle.borderColor || 'transparent',
            };

            // Apply shadow styles for templates that have them
            if (templateStyle.shadowColor) {
              cardStyles.shadowColor = templateStyle.shadowColor;
              cardStyles.shadowOffset = templateStyle.shadowOffset || { width: 0, height: 8 };
              cardStyles.shadowOpacity = templateStyle.shadowOpacity !== undefined ? templateStyle.shadowOpacity : 1;
              cardStyles.shadowRadius = templateStyle.shadowBlur !== undefined ? templateStyle.shadowBlur : 20;
              cardStyles.elevation = templateStyle.shadowBlur ? Math.ceil(templateStyle.shadowBlur / 4) : 10;
            }

            // Web Gradient Support - Only apply gradient if explicitly set
            if (Platform.OS === 'web' && cardBgColor.includes('gradient')) {
              cardStyles.background = cardBgColor;
              cardStyles.backgroundColor = undefined;
            } else if (Platform.OS === 'web' && templateStyle.background && templateStyle.background.includes('gradient') && cardBgColor.includes('gradient')) {
              // Use template's gradient if cardBgColor also has a gradient
              cardStyles.background = templateStyle.background;
              cardStyles.backgroundColor = undefined;
            } else {
              // Force white background for modern template
              if (selectedVersion.template === 'modern') {
                cardStyles.backgroundColor = '#FFFFFF';
                if (Platform.OS === 'web') {
                  cardStyles.background = undefined;
                }
              }
            }

            // REMOVED: forced gradient logic override from templateStyle


            return (
              <View
                style={[styles.cardCanvas, cardStyles]}
                {...(Platform.OS === 'web' ? {
                  onDragOver: (e: any) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  },
                  onDrop: (e: any) => {
                    e.preventDefault();
                    if (draggedComponent) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      handleComponentDrop(draggedComponent, x, y);
                      setDraggedComponent(null);
                      setIsDragging(false);
                    }
                  },
                } : {})}
              >
                {/* Template Accent Decoration */}
                {templateStyle.accentPosition === 'left' && (
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: templateStyle.accentWidth || 4,
                    backgroundColor: selectedVersion.accentColor,
                  }} />
                )}
                {templateStyle.accentPosition === 'top' && (
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: templateStyle.accentWidth || 4,
                    backgroundColor: selectedVersion.accentColor,
                  }} />
                )}
                {templateStyle.accentPosition === 'border' && (
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderWidth: templateStyle.accentWidth || 4,
                    borderColor: selectedVersion.accentColor,
                    borderRadius: templateStyle.borderRadius,
                    pointerEvents: 'none' as const,
                  }} />
                )}
                {templateStyle.accentPosition === 'bottom' && (
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: templateStyle.accentWidth || 4,
                    backgroundColor: selectedVersion.accentColor,
                  }} />
                )}

                {/* Bento special: corner glow effect */}
                {/* Dopamine Colorful Blocks for Bento Theme */}
                {selectedVersion.template === 'bento' && Platform.OS === 'web' && (
                  <>
                    {/* Top-right colorful block */}
                    <View style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '35%',
                      height: '25%',
                      backgroundColor: '#FF6B9D',
                      borderTopRightRadius: 24,
                      opacity: 0.9,
                    }} />
                    {/* Bottom-left colorful block */}
                    <View style={{
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      width: '30%',
                      height: '20%',
                      backgroundColor: '#C44569',
                      borderBottomLeftRadius: 24,
                      opacity: 0.85,
                    }} />
                    {/* Middle-right accent */}
                    <View style={{
                      position: 'absolute',
                      right: '10%',
                      top: '40%',
                      width: '15%',
                      height: '25%',
                      backgroundColor: '#F8B500',
                      borderRadius: 12,
                      opacity: 0.7,
                    }} />
                    {/* Top-left small accent */}
                    <View style={{
                      position: 'absolute',
                      left: '8%',
                      top: '8%',
                      width: '12%',
                      height: '12%',
                      backgroundColor: '#00D4AA',
                      borderRadius: 8,
                      opacity: 0.8,
                    }} />
                  </>
                )}

                {/* ===== FROSTED GLASS OVERLAY FOR TECH THEMES ===== */}
                {Platform.OS === 'web' && templateStyle.hasGlassOverlay && (
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: templateStyle.borderRadius,
                    backgroundColor: `rgba(255, 255, 255, ${templateStyle.glassOpacity || 0.05})`,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    // @ts-ignore - web only
                    backdropFilter: `blur(${templateStyle.glassBlur || 10}px)`,
                    WebkitBackdropFilter: `blur(${templateStyle.glassBlur || 10}px)`,
                    pointerEvents: 'none' as const,
                  }} />
                )}

                {/* Render Canvas Elements */}
                {canvasElements.map(element => (
                  <CanvasElementRenderer
                    key={element.id}
                    element={element}
                    profile={card.profile}
                    qrCodeData={card.qrCodeData}
                    accentColor={selectedVersion.accentColor}
                    scale={cardDisplayScale}
                    isSelected={selectedElementId === element.id}
                    isEditing={editingElementId === element.id}
                    editingValue={editingValue}
                    onEditingValueChange={setEditingValue}
                    onSaveEdit={handleSaveEdit}
                    onSelect={(isDoubleClick) => handleElementSelect(element.id, isDoubleClick)}
                    onDrag={(dx, dy) => handleElementDrag(element.id, dx, dy)}
                    onResize={(dWidth) => handleElementResize(element.id, dWidth)}
                    templateStyle={templateStyle}
                    cardBgColor={cardBgColor}
                  />
                ))}
              </View>
            );
          })()}

          {/* Drop indicator */}
          {isDragging && (
            <View style={styles.dropIndicator}>
              <Ionicons name="add-circle" size={32} color={colors.dark} />
              <Text style={styles.dropIndicatorText}>Drop here to add</Text>
            </View>
          )}
        </View>

        {/* Sidebar */}
        <View style={[styles.sidebar, { width: sidebarWidth }]}>
          {/* Tabs */}
          <View style={styles.tabBar}>
            {(['components', 'style'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Ionicons
                  name={tab === 'components' ? 'layers-outline' : 'color-palette-outline'}
                  size={18}
                  color={activeTab === tab ? colors.dark : colors.textMuted}
                />
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'components' && (
              <ComponentsPanel
                components={availableComponents}
                canvasElements={canvasElements}
                onDragStart={(component) => {
                  setDraggedComponent(component);
                  setIsDragging(true);
                }}
                onDragEnd={() => {
                  setIsDragging(false);
                }}
                onComponentClick={(component) => {
                  // Add at center position logic (handled by handleComponentDrop defaults actually)
                  handleComponentDrop(component, 50, 50);
                }}
                onRemoveComponent={(componentId) => {
                  // Find the element and remove it
                  let element = canvasElements.find(el => el.fieldKey === componentId);

                  // Handle alias: if trying to remove location but we have city
                  if (!element && componentId === 'location') {
                    element = canvasElements.find(el => el.fieldKey === 'city');
                  }

                  if (element) {
                    // handleRemoveElement also handles the alias cleanup, but we need the ID here
                    handleRemoveElement(element.id);
                  } else if (componentId === 'location') {
                    // Fallback: just call remove with 'location' so the cleaner logic inside can try
                    handleRemoveElement('location');
                  }
                }}
                onAddCustom={(type, label) => {
                  // Create a unique ID for custom elements
                  const customId = `custom-${type}-${Date.now()}`;
                  const newElement: CanvasElement = {
                    id: customId,
                    type: type === 'image' ? 'avatar' : 'text',
                    fieldKey: customId,
                    x: 25,
                    y: 40,
                    width: type === 'image' ? 20 : 50,
                    height: 0,
                    style: {
                      fontSize: 14,
                      fontWeight: 'regular',
                      color: '#FFFFFF',
                      textAlign: 'left',
                    },
                    visible: true,
                  };
                  // For custom text, set a default content
                  if (type === 'text') {
                    updateProfile({ [customId]: 'Custom Text' } as any);
                  } else if (type === 'link') {
                    updateProfile({ [customId]: label === 'Link' ? 'https://example.com' : `https://${label?.toLowerCase()}.com/username` } as any);
                  } else if (type === 'social') {
                    updateProfile({ [customId]: `@${label?.toLowerCase() || 'username'}` } as any);
                  }
                  updateCanvasElements(prev => [...prev, newElement]);
                  setSelectedElementId(customId);
                }}
              />
            )}

            {activeTab === 'style' && (
              <StylePanel
                cardBgColor={cardBgColor}
                onCardBgColorChange={setCardBgColor}
                accentColor={selectedVersion.accentColor}
                onAccentColorChange={(color) => {
                  console.log('Changing accent color to:', color);
                  updateVersion(selectedVersionId, { accentColor: color });
                }}
                template={selectedVersion.template}
                currentLayout={selectedVersion.layout || 'portrait'}
                onLayoutChange={(layout) => updateVersion(selectedVersionId, { layout })}
                onTemplateChange={(template) => {
                  console.log('Changing template to:', template);
                  // Auto-update background color based on template defaults
                  const templateDefaults: Record<string, string> = {
                    'minimal': 'linear-gradient(to top, #accbee 0%, #e2ebf0 100%)',
                    'bento': 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
                    'modern': '#FFFFFF',
                    'classic': '#FFF500',
                    'ocean': 'rgba(255, 255, 255, 0.65)',
                  };
                  setCardBgColor(templateDefaults[template] || '#FFFFFF');

                  // Premium Auto-Layout Engine (Strict Stacking & Dynamic Flow)
                  if (['modern', 'minimal', 'classic', 'bento', 'ocean'].includes(template)) {
                    // Reset Stack Cursors for Dynamic Elements (Safe Zones)
                    let modernStackY = 65;
                    let minimalStackY = 70;
                    let classicStackY = 66;
                    let bentoStackY = 68;

                    const newElements = canvasElements.map(el => {
                      const t = template;

                      // ---------- Styles Base ----------
                      let baseColor = '#000000';
                      if (t === 'bento') baseColor = '#4A235A';
                      if (t === 'minimal') baseColor = '#2C3E50';
                      if (t === 'classic') baseColor = '#1A1A1A';

                      let baseStyle: any = { ...el.style, color: baseColor, textAlign: 'left' as const, fontFamily: undefined };

                      // Classic: Monospace clean
                      if (t === 'classic') {
                        baseStyle.fontFamily = Platform.OS === 'web' ? 'monospace' : 'Courier';
                        baseStyle.textTransform = 'uppercase';
                        baseStyle.letterSpacing = 1;
                      } else {
                        baseStyle.textTransform = 'none';
                        baseStyle.letterSpacing = 0;
                      }

                      // ---------- Layout Logic ----------

                      // ==============================================
                      // APPLE-STYLE PREMIUM DEFAULTS (REFINED V2)
                      // Philosophy: Radical Whitespace, Safe Zones, No Overlaps
                      // ==============================================

                      const appleBase = { ...baseStyle, fontFamily: 'System', color: '#1d1d1f' };

                      // 1. Bento (Default) - Clean, Spacious Grid
                      if (t === 'bento') {
                        // Header: Avatar Left, Meta Right
                        if (el.fieldKey === 'photoUrl') return { ...el, x: 8, y: 8, width: 22, style: { ...appleBase, borderRadius: 100 } };
                        if (el.fieldKey === 'company') return { ...el, x: 50, y: 10, width: 42, style: { ...appleBase, fontSize: 10, fontWeight: '700', textAlign: 'right', color: '#86868b', textTransform: 'uppercase', letterSpacing: 1 } };
                        if (el.fieldKey === 'location' || el.fieldKey === 'city') return { ...el, x: 50, y: 16, width: 42, style: { ...appleBase, fontSize: 10, textAlign: 'right', color: '#86868b' } };

                        // Core Identity (SAFE ZONE: y=30 to y=60)
                        if (el.fieldKey === 'name') return { ...el, x: 8, y: 32, width: 90, style: { ...appleBase, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 } };
                        // Job Title: Moved UP slightly to group with Name, but huge gap below
                        if (el.fieldKey === 'jobTitle') return { ...el, x: 8, y: 44, width: 85, style: { ...appleBase, fontSize: 14, fontWeight: '400', color: '#424245', lineHeight: 20 } };

                        // Separator
                        if (el.fieldKey === 'divider' || el.type === 'divider') return { ...el, x: 8, y: 62, width: 84, style: { ...el.style, height: 1, backgroundColor: 'rgba(0,0,0,0.05)' } };

                        // Narrative / Quote (SAFE ZONE: y=68+)
                        // Pushed down to ensure it never touches multi-line job titles
                        if (el.fieldKey === 'headline') return { ...el, x: 8, y: 68, width: 65, style: { ...appleBase, fontSize: 12, lineHeight: 18, fontStyle: 'normal', color: '#6e6e73' } };

                        // Footer Anchors
                        if (el.fieldKey === 'qrCode') return { ...el, x: 78, y: 74, width: 14 };

                        // Contact Stack (Bottom Left)
                        const y = bentoStackY;
                        bentoStackY += 5;
                        return { ...el, x: 8, y: 82 + (bentoStackY - 5), width: 65, style: { ...appleBase, fontSize: 10, color: '#424245' } };
                      }

                      // 2. Modern - Bold, Left-Aligned Magazine
                      if (t === 'modern') {
                        // Top Anchors
                        if (el.fieldKey === 'company') return { ...el, x: 8, y: 8, width: 60, style: { ...appleBase, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' } };
                        if (el.fieldKey === 'location' || el.fieldKey === 'city') return { ...el, x: 8, y: 14, width: 60, style: { ...appleBase, fontSize: 10, color: '#6e6e73' } };

                        // Avatar Floating Right
                        if (el.fieldKey === 'photoUrl') return { ...el, x: 75, y: 8, width: 17, style: { ...appleBase, borderRadius: 12 } };

                        // Hero Section (Vertical Center-ish)
                        if (el.fieldKey === 'name') return { ...el, x: 8, y: 28, width: 80, style: { ...appleBase, fontSize: 30, fontWeight: '800', letterSpacing: -1 } };
                        if (el.fieldKey === 'jobTitle') return { ...el, x: 8, y: 42, width: 80, style: { ...appleBase, fontSize: 15, fontWeight: '500', color: '#1d1d1f' } };

                        // Story Section (Pushed way down)
                        if (el.fieldKey === 'headline') return { ...el, x: 8, y: 65, width: 60, style: { ...appleBase, fontSize: 11, lineHeight: 16, color: '#6e6e73' } };

                        // Footer
                        if (el.fieldKey === 'qrCode') return { ...el, x: 75, y: 75, width: 17 };

                        const y = modernStackY;
                        modernStackY += 6; // Compact stack
                        return { ...el, x: 8, y: 78 + (modernStackY - 6), width: 60, style: { ...appleBase, fontSize: 11, fontWeight: '500' } };
                      }

                      // 3. Minimal - Zen, Centered
                      if (t === 'minimal') {
                        const centerStyle = { ...appleBase, textAlign: 'center' as const };

                        // Top: Avatar
                        if (el.fieldKey === 'photoUrl') return { ...el, x: 39, y: 12, width: 22, style: { ...centerStyle, borderRadius: 100 } };

                        // Center: Identity
                        if (el.fieldKey === 'name') return { ...el, x: 5, y: 38, width: 90, style: { ...centerStyle, fontSize: 24, fontWeight: '600', letterSpacing: -0.5 } };
                        if (el.fieldKey === 'jobTitle') return { ...el, x: 10, y: 50, width: 80, style: { ...centerStyle, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: '#6e6e73' } };

                        // Meta - Tucked under job? No, maybe top corners?
                        // Let's keep it centered stack for purity
                        if (el.fieldKey === 'company') return { ...el, x: 10, y: 56, width: 80, style: { ...centerStyle, fontSize: 10, fontWeight: '600' } };
                        if (el.fieldKey === 'location' || el.fieldKey === 'city') return { ...el, x: 10, y: 60, width: 80, style: { ...centerStyle, fontSize: 10, color: '#86868b' } };

                        if (el.fieldKey === 'divider' || el.type === 'divider') return { ...el, x: 45, y: 66, width: 10, style: { ...el.style, height: 1 } };

                        // Headline - Bottom
                        if (el.fieldKey === 'headline') return { ...el, x: 10, y: 70, width: 80, style: { ...centerStyle, fontSize: 11, fontStyle: 'italic', color: '#86868b' } };

                        // QR - Very subtle bottom
                        if (el.fieldKey === 'qrCode') return { ...el, x: 44, y: 82, width: 12 };

                        const y = minimalStackY;
                        minimalStackY += 4;
                        return { ...el, x: 5, y: 90 + (minimalStackY - 4), width: 90, ...centerStyle, style: { ...centerStyle, fontSize: 9, opacity: 0 } };
                      }

                      // 4. Classic - Split Card
                      if (t === 'classic') {
                        // Right: Visuals
                        if (el.fieldKey === 'photoUrl') return { ...el, x: 72, y: 12, width: 20, style: { ...appleBase, borderRadius: 8 } };
                        if (el.fieldKey === 'qrCode') return { ...el, x: 74, y: 72, width: 16 };

                        // Left: Identity
                        if (el.fieldKey === 'name') return { ...el, x: 8, y: 15, width: 60, style: { ...appleBase, fontSize: 24, fontWeight: '700' } };
                        if (el.fieldKey === 'jobTitle') return { ...el, x: 8, y: 28, width: 60, style: { ...appleBase, fontSize: 13, color: '#424245' } };
                        if (el.fieldKey === 'company') return { ...el, x: 8, y: 34, width: 60, style: { ...appleBase, fontSize: 11, fontWeight: '600', color: '#6e6e73' } };

                        if (el.fieldKey === 'divider' || el.type === 'divider') return { ...el, x: 8, y: 42, width: 60 };

                        // Meta Stack
                        if (el.fieldKey === 'location' || el.fieldKey === 'city') return { ...el, x: 8, y: 46, width: 60, style: { ...appleBase, fontSize: 11 } };

                        // Headline
                        if (el.fieldKey === 'headline') return { ...el, x: 8, y: 55, width: 60, style: { ...appleBase, fontSize: 11, lineHeight: 16, color: '#6e6e73' } };

                        const y = classicStackY;
                        classicStackY += 6;
                        return { ...el, x: 8, y: 72 + (classicStackY - 6), width: 60, style: { ...appleBase, fontSize: 10 } };
                      }

                      // 5. Ocean - FINAL LOCKED LAYOUT
                      if (t === 'ocean') {
                        const finalBase = {
                          fontFamily: 'System',
                          color: '#1a1a1a',
                          fontWeight: '400',
                          textAlign: 'left'
                        };

                        // Vertical Stack (x: 10 Strict)
                        if (el.fieldKey === 'photoUrl') return { ...el, x: 10, y: 8, width: 20, style: { borderRadius: 100 } };
                        if (el.fieldKey === 'name') return { ...el, x: 10, y: 30, width: 80, style: { ...finalBase, fontWeight: '700', fontSize: 28, color: '#000000' } };
                        if (el.fieldKey === 'jobTitle') return { ...el, x: 10, y: 38, width: 80, style: { ...finalBase, fontWeight: '500', fontSize: 13, color: '#666666' } };
                        if (el.fieldKey === 'headline') return { ...el, x: 10, y: 46, width: 80, style: { ...finalBase, fontSize: 15, lineHeight: 22, color: '#1a1a1a' } };
                        if (el.fieldKey === 'character') return { ...el, x: 10, y: 58, width: 80, style: { ...finalBase, fontSize: 12, color: '#999999' } };
                        if (el.fieldKey === 'company') return { ...el, x: 10, y: 76, width: 50, style: { ...finalBase, fontWeight: '700', fontSize: 14, color: '#000000' } };
                        if (el.fieldKey === 'location') return { ...el, x: 10, y: 84, width: 50, style: { ...finalBase, fontSize: 12, color: '#666666' } };
                        if (el.fieldKey === 'qrCode') return { ...el, x: 74, y: 76, width: 16 };

                        // Fallback for others
                        return { ...el, x: 10, y: 90, width: 80, style: { ...finalBase, fontSize: 12 } };
                      }

                      return { ...el, style: baseStyle };
                    });

                    // Template change - reset history
                    isUndoRedoRef.current = true;
                    setCanvasElements(newElements);
                    setTimeout(() => {
                      setHistory([JSON.parse(JSON.stringify(newElements))]);
                      setHistoryIndex(0);
                      isUndoRedoRef.current = false;
                    }, 0);

                    const newFieldStyles: Record<string, any> = {};
                    newElements.forEach(el => {
                      newFieldStyles[el.fieldKey] = {
                        x: el.x,
                        y: el.y,
                        ...el.style
                      };
                    });

                    updateVersion(selectedVersionId, { template, fieldStyles: newFieldStyles });
                  } else {
                    updateVersion(selectedVersionId, { template });
                  }
                }}
              />
            )}


          </ScrollView>
        </View>
      </View>

    </View>
  );
}

// ============== Canvas Element Renderer ==============
interface CanvasElementRendererProps {
  element: CanvasElement;
  profile: any;
  qrCodeData: string;
  accentColor: string;
  scale: number;
  isSelected: boolean;
  isEditing: boolean;
  editingValue: string;
  onEditingValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onSelect: (isDoubleClick?: boolean) => void;
  onDrag: (dx: number, dy: number) => void;
  onResize: (dWidth: number) => void;
  templateStyle?: any;
  cardBgColor?: string;
}

const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  profile,
  qrCodeData,
  accentColor,
  scale,
  isSelected,
  isEditing,
  editingValue,
  onEditingValueChange,
  onSaveEdit,
  onSelect,
  onDrag,
  onResize,
  templateStyle,
  cardBgColor,
}) => {
  // Use ref for start position to avoid re-renders during drag
  const startPosRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const elementRef = useRef<any>(null);

  // Determine content - special handling for avatar
  let content: any;
  if (element.type === 'avatar' || element.fieldKey === 'photoUrl') {
    // For avatar, always use photoUrl from profile
    content = profile.photoUrl || '';
    console.log('[Avatar] Loading photo:', content, 'for element:', element.id);
  } else if (element.fieldKey === 'qrCode') {
    content = '';
  } else {
    content = (profile as any)[element.fieldKey] || '';
  }

  // Placeholder for empty content so it's selectable/visible
  if (!content && element.type !== 'divider' && element.type !== 'image' && element.type !== 'avatar' && element.fieldKey !== 'qrCode') {
    content = `[${element.fieldKey}]`;
  }

  const elementStyle: any = {
    position: 'absolute' as const,
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: element.width ? `${element.width}%` : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isSelected ? 100 : 1,
    userSelect: 'none',
  };

  // Helper function to determine if a color is dark
  const isColorDark = (color: string): boolean => {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Calculate luminance (relative brightness)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5; // Dark if luminance < 0.5
    }
    // Handle rgb/rgba
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
      }
    }
    // Default: assume light background
    return false;
  };

  // Determine text color based on background
  const getTextColor = (): string => {
    // If user has explicitly set a color, use it
    if (element.style.color) {
      return element.style.color;
    }

    // Otherwise, determine based on background color
    const bgColor = cardBgColor || templateStyle?.background || '#FFFFFF';

    // Check if background is dark
    if (isColorDark(bgColor)) {
      return '#FFFFFF'; // White text on dark background
    } else {
      return '#000000'; // Black text on light background
    }
  };

  const textStyle: any = {
    fontSize: (element.style.fontSize || 16) * scale,
    lineHeight: element.style.lineHeight ? element.style.lineHeight * scale : undefined,
    fontWeight: ['bold', 'medium', 'regular'].includes(element.style.fontWeight as string)
      ? (element.style.fontWeight === 'bold' ? '700' : element.style.fontWeight === 'medium' ? '500' : '400')
      : element.style.fontWeight || '400',
    color: getTextColor(),
    textAlign: element.style.textAlign || 'left',
    fontFamily: getFontStack(element.style.fontFamily || 'System'),
  };

  // VisionOS / Liquid Glass Selection Style
  const selectionStyle = isSelected ? {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Subtle dark boundary for contrast
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glass fill
    borderRadius: element.type === 'avatar' ? 1000 : 12, // Smooth liquid corners, circular for avatars
    padding: 6,
    margin: -6,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.4), 0 8px 20px rgba(0, 0, 0, 0.08)', // Inner glow + Soft shadow
    } : {})
  } : {};

  // Setup DOM event listeners for proper double-click handling on web
  useEffect(() => {
    if (Platform.OS !== 'web' || !elementRef.current) return;

    const el = elementRef.current;

    const handleDblClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[CanvasElement] Double-click detected for:', element.fieldKey);
      onSelect(true);
    };

    el.addEventListener('dblclick', handleDblClick);

    return () => {
      el.removeEventListener('dblclick', handleDblClick);
    };
  }, [onSelect, element.fieldKey]);

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    onSelect(false);
  };

  // Use global event listeners for smoother dragging
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const startPos = startPosRef.current;
        const dx = ((e.clientX - startPos.x) / (CARD_BASE_WIDTH * scale)) * 100;
        onResize(dx);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      if (!isDragging) return;

      const startPos = startPosRef.current;
      const dx = ((e.clientX - startPos.x) / (CARD_BASE_WIDTH * scale)) * 100;
      const dy = ((e.clientY - startPos.y) / (CARD_BASE_HEIGHT * scale)) * 100;

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        onDrag(dx, dy);
      });

      startPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, scale, onDrag, onResize]);

  const handleResizeMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    e.stopPropagation();
    setIsResizing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    onSelect(false); // keep selection but stop drag logic conflicts?
  };

  // Web event handlers - only for mousedown, global listeners handle move/up
  const webHandlers = Platform.OS === 'web' ? {
    onMouseDown: handleMouseDown,
  } : {};

  // Render different element types
  if (element.type === 'avatar') {
    const photoUrl = content;
    const hasPhoto = photoUrl && photoUrl.startsWith('http');

    return (
      <View ref={elementRef} style={[elementStyle, selectionStyle as any]} {...webHandlers}>
        <View style={{
          width: '100%',
          height: '100%',
          borderRadius: 1000,
          overflow: 'hidden',
          backgroundColor: hasPhoto ? 'transparent' : '#F5F5F5'
        }}>
          {hasPhoto ? (
            <Image
              source={{ uri: photoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: '100%',
              height: '100%',
              backgroundColor: accentColor || '#6366F1',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RNText style={{
                color: '#FFFFFF',
                fontSize: Math.max(12, (elementStyle.width as number || 60) * scale * 0.3),
                fontWeight: '700'
              }}>
                {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'NH'}
              </RNText>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (element.type === 'qr') {
    const qrColor = accentColor === 'transparent' ? '#000000' : accentColor;
    return (
      <View ref={elementRef} style={[elementStyle, selectionStyle as any]} {...webHandlers}>
        <QRCode
          value={qrCodeData}
          size={60 * scale}
          color={qrColor}
          backgroundColor="transparent"
        />
      </View>
    );
  }

  if (element.type === 'divider' || element.fieldKey === 'divider') {
    return (
      <View ref={elementRef} style={[elementStyle, selectionStyle as any, { height: 10 * scale, justifyContent: 'center' }]} {...webHandlers}>
        <View style={{
          height: 2 * scale,
          backgroundColor: element.style.color || 'rgba(0,0,0,0.1)',
          width: '100%',
          borderRadius: 1
        }} />
      </View>
    );
  }

  if (element.type === 'image') {
    return (
      <View ref={elementRef} style={[elementStyle, selectionStyle as any]} {...webHandlers}>
        <View style={{ width: '100%', height: '100%', backgroundColor: '#eee', borderRadius: element.style.borderRadius ? element.style.borderRadius * scale : 0 }} />
      </View>
    );
  }

  // TEXT RENDERER (Default)
  return (
    <View ref={elementRef} style={[elementStyle, selectionStyle as any]} {...webHandlers}>
      {isEditing ? (
        <TextInput
          value={editingValue}
          onChangeText={onEditingValueChange}
          onBlur={onSaveEdit}
          onSubmitEditing={onSaveEdit}
          autoFocus
          multiline
          // Function to move cursor to end on focus
          onFocus={(e: any) => {
            if (Platform.OS === 'web') {
              const val = e.target.value;
              e.target.setSelectionRange(val.length, val.length);
            }
          }}
          style={[textStyle, {
            minWidth: 50,
            width: '100%', // Ensure full width usage
            padding: 8, // More breathing room
            margin: -8, // Compensate for padding to stay aligned
            // VisionOS Editing State
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: 12,
            outline: 'none',
            border: 'none',
            overflow: 'hidden',
            ...(Platform.OS === 'web' ? {
              backdropFilter: 'blur(12px)',
              webkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
              resize: 'none', // Prevent manual resize handle on web
            } : {}),
          } as any]}
          {...(Platform.OS === 'web' ? {
            onKeyDown: (e: any) => {
              if (e.key === 'Escape') {
                onSaveEdit();
              }
            }
          } : {})}
        />
      ) : (
        <Text style={[textStyle, Platform.OS === 'web' ? { whiteSpace: 'pre-wrap' as any } : {}]}>
          {(element.fieldKey === 'location' || element.fieldKey === 'city') && !templateStyle?.hideIcons && '📍 '}
          {(element.fieldKey === 'email') && !templateStyle?.hideIcons && '✉️ '}
          {content}
        </Text>
      )}

      {/* Resize Handle (Right Side - Width Control Only) */}
      {isSelected && element.type === 'text' && Platform.OS === 'web' && (
        <View
          style={[styles.resizeHandle, {
            right: -10,
            top: '50%',
            marginTop: -7, // Centered (half of 14px height)
            cursor: 'e-resize' as any
          }]}
          // @ts-ignore - Web-only event
          onMouseDown={(e: any) => {
            e.stopPropagation();
            handleResizeMouseDown(e);
          }}
        />
      )}
    </View>
  );
};

// ============== Components Panel ==============
interface ComponentsPanelProps {
  components: CardComponent[];
  canvasElements: CanvasElement[];
  onDragStart: (component: CardComponent) => void;
  onDragEnd: () => void;
  onComponentClick: (component: CardComponent) => void;
  onRemoveComponent: (componentId: string) => void;
  onAddCustom: (type: 'text' | 'image' | 'link' | 'social', label?: string) => void;
}

const ComponentsPanel: React.FC<ComponentsPanelProps> = ({
  components,
  canvasElements,
  onDragStart,
  onDragEnd,
  onComponentClick,
  onRemoveComponent,
  onAddCustom,
}) => {
  const isOnCanvas = (componentId: string) => {
    // Handle aliases (e.g. location -> city, photo -> photoUrl)
    if (componentId === 'location') {
      return canvasElements.some(el => el.fieldKey === 'location' || el.fieldKey === 'city');
    }
    if (componentId === 'photo' || componentId === 'avatar') {
      return canvasElements.some(el => el.fieldKey === 'photoUrl');
    }
    return canvasElements.some(el => el.fieldKey === componentId);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Card Elements</Text>
      <Text style={styles.panelSubtitle}>Click to add or remove elements from your card</Text>

      <VStack gap="sm" style={{ marginTop: spacing.lg }}>
        {components.map(component => {
          const onCard = isOnCanvas(component.id);
          return (
            <View
              key={component.id}
              style={[styles.componentItem, onCard && styles.componentItemOnCard]}
              {...(Platform.OS === 'web' ? {
                draggable: !onCard,
                onDragStart: () => !onCard && onDragStart(component),
                onDragEnd: onDragEnd,
              } : {})}
            >
              <TouchableOpacity
                style={styles.componentInner}
                onPress={() => onCard ? onRemoveComponent(component.id) : onComponentClick(component)}
              >
                <View style={[styles.componentIcon, onCard && { opacity: 0.5 }]}>
                  <Ionicons
                    name={getComponentIcon(component.type)}
                    size={18}
                    color={onCard ? colors.textMuted : colors.text}
                  />
                </View>
                <View style={styles.componentInfo}>
                  <Text style={[styles.componentLabel, onCard && { color: colors.textMuted }]}>
                    {component.content.label || component.id.toUpperCase()}
                  </Text>
                  {(component.content.text || component.content.value) && (
                    <Text style={styles.componentPreview} numberOfLines={1}>
                      {component.content.text || component.content.value}
                    </Text>
                  )}
                </View>
                {onCard ? (
                  <TouchableOpacity onPress={() => onRemoveComponent(component.id)}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </VStack>

      {/* Custom blocks */}
      {/* Custom blocks - Horizontal Toolbar Style */}
      <Text style={[styles.panelTitle, { marginTop: spacing.xl }]}>Extras & Socials</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
        <View style={styles.customToolbar}>
          {[
            { icon: 'text-outline', label: 'Text', type: 'text' as const },
            { icon: 'image-outline', label: 'Image', type: 'image' as const },
            { icon: 'link-outline', label: 'Link', type: 'link' as const },
            { type: 'divider' }, // Visual separator
            { icon: 'logo-github', label: 'GitHub', type: 'social' as const },
            { icon: 'logo-twitter', label: 'X', type: 'social' as const },
            { icon: 'logo-instagram', label: 'Instagram', type: 'social' as const },
          ].map((item, idx) => {
            if ('type' in item && item.type === 'divider') {
              return <View key={idx} style={{ width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: 4 }} />;
            }
            // @ts-ignore
            const { icon, label, type } = item;
            return (
              <TouchableOpacity
                key={label}
                style={styles.customToolItem}
                onPress={() => onAddCustom(type as any, label)}
              >
                <Ionicons name={icon as any} size={18} color={colors.text} />
                <Text style={styles.customToolLabel}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View >
  );
};

// ============== Style Panel ==============
interface StylePanelProps {
  cardBgColor: string;
  onCardBgColorChange: (color: string) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  template: CardTemplate;
  onTemplateChange: (template: CardTemplate) => void;
  currentLayout: 'portrait' | 'landscape' | 'square';
  onLayoutChange: (layout: 'portrait' | 'landscape' | 'square') => void;
}

const StylePanel: React.FC<StylePanelProps> = ({
  cardBgColor,
  onCardBgColorChange,
  accentColor,
  onAccentColorChange,
  template,
  onTemplateChange,
  currentLayout,
  onLayoutChange,
}) => {
  const bgColors = [
    '#FFFFFF', '#000000', '#F3F4F6',
    '#FFF500', '#FF3B30', '#007AFF',
    'linear-gradient(to top, #accbee 0%, #e2ebf0 100%)', // Frosted Ether
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', // Aura
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', // Blue Peach
    'linear-gradient(to right, #fa709a 0%, #fee140 100%)', // Warm
  ];
  const accentColors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Card Layout</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        {(Object.keys(CARD_LAYOUTS) as Array<keyof typeof CARD_LAYOUTS>).map((layoutKey) => (
          <TouchableOpacity
            key={layoutKey}
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              },
              currentLayout === layoutKey && {
                backgroundColor: colors.info + '10',
                borderColor: colors.info,
              }
            ]}
            onPress={() => onLayoutChange(layoutKey)}
          >
            <Ionicons
              name={CARD_LAYOUTS[layoutKey].icon as any}
              size={24}
              color={currentLayout === layoutKey ? colors.info : colors.textMuted}
            />
            <Text style={[
              { fontSize: 12, marginTop: 4, color: colors.textMuted },
              currentLayout === layoutKey && { color: colors.info, fontWeight: '600' }
            ]}>
              {CARD_LAYOUTS[layoutKey].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.panelTitle}>Card Background</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        <View style={[styles.colorRow, { flexWrap: 'nowrap' }]}>
          {bgColors.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                Platform.OS === 'web' && color.includes('gradient') ? { backgroundImage: color } as any : { backgroundColor: color },
                color === '#FFFFFF' && { borderWidth: 1, borderColor: '#E5E7EB' }, // Visible border for white
                cardBgColor === color && styles.colorSwatchActive,
              ]}
              onPress={() => onCardBgColorChange(color)}
            />
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.panelTitle, { marginTop: spacing.xl }]}>Accent Color</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        <View style={[styles.colorRow, { flexWrap: 'nowrap' }]}>
          {['transparent', ...accentColors].map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color === 'transparent' ? 'transparent' : color },
                color === 'transparent' && { borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
                accentColor === color && styles.colorSwatchActive,
              ]}
              onPress={() => onAccentColorChange(color)}
            >
              {color === 'transparent' && (
                <Ionicons name="ban-outline" size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.panelTitle, { marginTop: spacing.xl }]}>Template</Text>
      <View style={styles.templateGrid}>
        {(['ocean', 'midnight', 'sunset', 'sleek'] as any[]).map(t => {
          const isActive = template === t;
          let label = '';
          switch (t) {
            case 'ocean': label = 'Ocean'; break;
            case 'midnight': label = 'Midnight'; break;
            case 'sunset': label = 'Sunset'; break;
            case 'sleek': label = 'Sleek'; break;
            default: label = (t as string).charAt(0).toUpperCase() + (t as string).slice(1);
          }

          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.templateCard,
                isActive && styles.templateCardActive,
              ]}
              onPress={() => onTemplateChange(t)}
            >
              <Text style={[
                styles.templateText,
                isActive && styles.templateTextActive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ============== Settings Panel ==============
interface SettingsPanelProps {
  versions: CardVersion[];
  selectedVersionId: string;
  onVersionSelect: (id: string) => void;
  currentLayout: 'portrait' | 'landscape' | 'square';
  onLayoutChange: (layout: 'portrait' | 'landscape' | 'square') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  versions,
  selectedVersionId,
  onVersionSelect,
  currentLayout,
  onLayoutChange,
}) => {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Card Layout</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        {(Object.keys(CARD_LAYOUTS) as Array<keyof typeof CARD_LAYOUTS>).map((layoutKey) => (
          <TouchableOpacity
            key={layoutKey}
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              },
              currentLayout === layoutKey && {
                backgroundColor: colors.info + '10',
                borderColor: colors.info,
              }
            ]}
            onPress={() => onLayoutChange(layoutKey)}
          >
            <Ionicons
              name={CARD_LAYOUTS[layoutKey].icon as any}
              size={24}
              color={currentLayout === layoutKey ? colors.info : colors.textMuted}
            />
            <Text style={[
              { fontSize: 12, marginTop: 4, color: colors.textMuted },
              currentLayout === layoutKey && { color: colors.info, fontWeight: '600' }
            ]}>
              {CARD_LAYOUTS[layoutKey].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.panelTitle}>Versions</Text>
      <Text style={styles.panelSubtitle}>Switch between different card layouts</Text>

      <VStack gap="md" style={{ marginTop: spacing.lg }}>
        {versions.map(version => (
          <TouchableOpacity
            key={version.id}
            style={[
              styles.versionItem,
              selectedVersionId === version.id && styles.versionItemActive,
            ]}
            onPress={() => onVersionSelect(version.id)}
          >
            <View style={[styles.versionDot, { backgroundColor: version.accentColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.versionName}>{version.name}</Text>
              {version.description && (
                <Text style={styles.versionDesc}>{version.description}</Text>
              )}
            </View>
            {selectedVersionId === version.id && (
              <Ionicons name="checkmark-circle" size={20} color={colors.dark} />
            )}
          </TouchableOpacity>
        ))}
      </VStack>
    </View>
  );
};

// ============== Helper Functions ==============
function getComponentIcon(type: string): any {
  const iconMap: Record<string, any> = {
    heading: 'text',
    text: 'document-text-outline',
    image: 'image-outline',
    contact: 'person-outline',
    social: 'share-social-outline',
    qr: 'qr-code-outline',
    divider: 'remove-outline',
  };
  return iconMap[type] || 'square-outline';
}

// ============== Styles ==============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.card,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  zoomButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.card,
  },
  zoomText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    minWidth: 40,
    textAlign: 'center',
  },

  // Element Toolbar
  elementToolbar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  toolbarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toolbarLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginRight: spacing.xs,
  },
  toolbarBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolbarBtnActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  toolbarValue: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  toolbarPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolbarPillActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  toolbarPillText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.text,
    textTransform: 'capitalize',
  },
  toolbarPillTextActive: {
    color: colors.white,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorDotWhite: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  colorDotActive: {
    borderColor: colors.dark,
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginLeft: spacing.lg,
  },

  // Main
  main: {
    flex: 1,
    flexDirection: 'row',
  },

  // Canvas Area
  canvasArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    ...(Platform.OS === 'web' ? {
      backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
      opacity: 0.5,
    } as any : {}),
  },
  cardCanvas: {
    overflow: 'hidden',
    position: 'relative',
  },
  dropIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    zIndex: 1000,
  },
  dropIndicatorText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: '#6366F1',
    marginTop: spacing.sm,
  },

  // Sidebar
  sidebar: {
    backgroundColor: colors.white,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.dark,
  },
  tabText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  tabTextActive: {
    fontFamily: fontFamily.bodyMedium,
    color: colors.dark,
  },
  sidebarScroll: {
    flex: 1,
  },

  // Panel
  panel: {
    padding: spacing.xl,
  },
  panelTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  panelSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Component Item
  componentItem: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    cursor: 'pointer' as const,
  },
  componentItemOnCard: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  componentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 12,
    height: 50,
  },
  componentIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  componentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  componentLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: colors.text,
  },
  componentPreview: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Custom Grid
  // Custom Toolbar (New)
  customToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  customToolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // elevation: 1,
  },
  customToolLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12, // Compact
    color: colors.text,
  },

  // Color Row
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: colors.dark,
    borderWidth: 3,
  },

  // Template Grid
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  templateCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.card, // Ensure background is set
    // borderWidth: 1, // Removed
    // borderColor: colors.border, // Removed
    minHeight: 60,
  },
  templateCardActive: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  templateText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  templateTextActive: {
    fontFamily: fontFamily.bodyBold,
    fontWeight: '700',
  },

  // Version Item
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  versionItemActive: {
    borderColor: colors.dark,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  versionDot: {
    width: 8,
    height: 40,
    borderRadius: radii.sm,
  },
  versionName: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: colors.text,
  },
  versionDesc: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
  },
  modalBtnCancel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnSave: {
    backgroundColor: colors.dark,
  },
  modalBtnText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: colors.text,
  },

  // Font Selector Styles - Horizontal
  fontScrollView: {
    marginLeft: spacing.sm,
  },
  fontRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fontOption: {
    paddingHorizontal: 8, // Compact padding
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    minWidth: 50, // Smaller min width
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontOptionActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  fontOptionText: {
    fontFamily: fontFamily.body,
    fontSize: 11, // Smaller font
    color: colors.text,
  },
  fontOptionTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // Align Button Styles
  alignButtonsRow: {
    flexDirection: 'row' as const,
    gap: 2, // Tighter gap
  },
  alignBtn: {
    width: 28,
    height: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: radii.sm,
    // borderWidth: 1, // Removed border for cleaner look
    // borderColor: colors.border,
    backgroundColor: 'transparent', // Transparent by default
  },
  alignBtnActive: {
    backgroundColor: colors.dark,
    // borderColor: colors.dark,
  },
  // alignIconContainer & alignBar removed as they are replaced by MaterialIcons

  // Resize Handle
  resizeHandle: {
    position: 'absolute' as const,
    bottom: -6,
    right: -6,
    width: 14,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glassy white
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)', // Barely visible border
    borderRadius: 7,
    cursor: 'nwse-resize' as any,
    zIndex: 200,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(4px)',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Soft ambient shadow
    } : {}),
  },

  // Delete Button
  deleteButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteButtonText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.error,
  },
});
