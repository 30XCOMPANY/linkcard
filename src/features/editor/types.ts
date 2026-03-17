/**
 * [INPUT]: @/src/types FieldStyle
 * [OUTPUT]: CanvasElement, FontOption, TemplateStyle
 * [POS]: Editor module type definitions
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { FieldStyle } from '@/src/types';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'avatar' | 'divider' | 'shape';
  fieldKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: FieldStyle;
  locked?: boolean;
  visible: boolean;
}

export interface FontOption {
  id: string;
  name: string;
  stack: string;
  category?: string;
}
