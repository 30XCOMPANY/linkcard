/**
 * [INPUT]: ./types CanvasElement
 * [OUTPUT]: getDefaultElements, getComponentIcon
 * [POS]: Editor helpers — element generation & icon mapping
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { CanvasElement } from './types';

// ============================================================
// DEFAULT ELEMENT GENERATOR
// ============================================================

export const getDefaultElements = (profile: any, visibleFields: string[]): CanvasElement[] => {
  const elements: CanvasElement[] = [];

  if (visibleFields.includes('photoUrl') && profile.photoUrl) {
    elements.push({
      id: 'photo-element', type: 'avatar', fieldKey: 'photoUrl',
      x: 10, y: 8, width: 20, height: 0,
      style: { borderRadius: 100 }, visible: true,
    });
  }

  if (visibleFields.includes('name')) {
    elements.push({
      id: 'name-element', type: 'text', fieldKey: 'name',
      x: 10, y: 30, width: 80, height: 0,
      style: { fontSize: 28, fontWeight: 'bold', color: '#000000', textAlign: 'left' },
      visible: true,
    });
  }

  if (visibleFields.includes('jobTitle')) {
    elements.push({
      id: 'job-title-element', type: 'text', fieldKey: 'jobTitle',
      x: 10, y: 38, width: 80, height: 0,
      style: { fontSize: 13, fontWeight: 'medium', color: '#666666', textAlign: 'left' },
      visible: true,
    });
  }

  if (visibleFields.includes('headline')) {
    elements.push({
      id: 'headline-element', type: 'text', fieldKey: 'headline',
      x: 10, y: 46, width: 80, height: 0,
      style: { fontSize: 15, lineHeight: 22, fontWeight: 'regular', color: '#1a1a1a', textAlign: 'left' },
      visible: true,
    });
  }

  if (visibleFields.includes('character') && profile.character) {
    elements.push({
      id: 'character-element', type: 'text', fieldKey: 'character',
      x: 10, y: 58, width: 80, height: 0,
      style: { fontSize: 12, fontWeight: 'regular', color: '#999999', textAlign: 'left' },
      visible: true,
    });
  }

  if (visibleFields.includes('company')) {
    elements.push({
      id: 'company-element', type: 'text', fieldKey: 'company',
      x: 10, y: 76, width: 50, height: 0,
      style: { fontSize: 14, fontWeight: 'bold', color: '#000000', textAlign: 'left' },
      visible: true,
    });
  }

  if (visibleFields.includes('location')) {
    elements.push({
      id: 'location-element', type: 'text', fieldKey: 'location',
      x: 10, y: 84, width: 50, height: 0,
      style: { fontSize: 12, fontWeight: 'regular', color: '#666666', textAlign: 'left' },
      visible: true,
    });
  }

  if (visibleFields.includes('qrCode')) {
    elements.push({
      id: 'qr-element', type: 'qr', fieldKey: 'qrCode',
      x: 74, y: 76, width: 16, height: 0,
      style: {}, visible: true,
    });
  }

  return elements;
};

// ============================================================
// ICON MAPPING
// ============================================================

export function getComponentIcon(type: string): any {
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
