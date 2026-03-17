/**
 * [INPUT]: clsx, tailwind-merge
 * [OUTPUT]: cn() utility for merging Tailwind class names
 * [POS]: Core utility — used by all components for conditional className merging
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
