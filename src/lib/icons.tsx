/**
 * [INPUT]: expo-image (SF Symbols)
 * [OUTPUT]: Icon component — SF Symbols on all platforms via expo-image
 * [POS]: Core utility — renders SF Symbols using expo-image sf: source
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Image } from "expo-image";

/* ------------------------------------------------------------------ */
/*  SF Symbol name aliases                                             */
/*  Maps short names / Ionicons-style names → SF Symbol names          */
/* ------------------------------------------------------------------ */

const SF_ALIASES: Record<string, string> = {
  // Navigation
  "chevron-right": "chevron.right",
  "chevron-forward": "chevron.right",
  "chevron-left": "chevron.left",
  "chevron-back": "chevron.left",
  "arrow-left": "arrow.left",
  "arrow-right": "arrow.right",

  // Actions
  "edit-pen": "pencil",
  pencil: "pencil",
  "create-outline": "pencil",
  share: "square.and.arrow.up",
  "share-outline": "square.and.arrow.up",
  send: "paperplane",
  "paper-plane": "paperplane",
  link: "link",
  "link-outline": "link",
  close: "xmark",
  "close-outline": "xmark",
  check: "checkmark",
  checkmark: "checkmark",
  "checkmark-outline": "checkmark",
  "clipboard-check": "checkmark.circle",
  plus: "plus",
  add: "plus",
  minus: "minus",
  remove: "minus",
  reload: "arrow.clockwise",
  refresh: "arrow.clockwise",
  search: "magnifyingglass",
  "search-outline": "magnifyingglass",

  // Objects
  trash: "trash",
  "trash-outline": "trash",
  settings: "gearshape",
  "settings-outline": "gearshape",
  home: "house",
  "home-outline": "house",
  user: "person",
  "person-outline": "person",
  person: "person",
  people: "person.2",
  "people-outline": "person.2",
  bell: "bell",
  "notifications-outline": "bell",
  mail: "envelope",
  "mail-outline": "envelope",
  envelope: "envelope",
  phone: "phone",
  "call-outline": "phone",
  camera: "camera",
  "camera-outline": "camera",
  image: "photo",
  "image-outline": "photo",
  globe: "globe",
  "globe-outline": "globe",
  "map-marker": "mappin.and.ellipse",
  location: "mappin.and.ellipse",
  "location-outline": "mappin.and.ellipse",
  briefcase: "briefcase",
  "business-outline": "briefcase",
  tag: "tag",
  "tag-outline": "tag",
  bookmark: "bookmark",
  "bookmark-outline": "bookmark",
  heart: "heart",
  "heart-outline": "heart",
  star: "star",
  "star-outline": "star",
  eye: "eye",
  "eye-outline": "eye",
  bolt: "bolt",
  "flash-outline": "bolt",
  clock: "clock",
  "time-outline": "clock",
  creditcard: "creditcard",
  "card-outline": "creditcard",
  document: "doc.text",
  "document-text-outline": "doc.text",
  "note-text": "text.quote",
  "text-outline": "text.quote",
  wallet: "wallet.bifold",
  "wallet-outline": "wallet.bifold",
  "qr-code": "qrcode",
  "qr-code-outline": "qrcode",
  qrcode: "qrcode",
  "radio-outline": "antenna.radiowaves.left.and.right",
};

/* ------------------------------------------------------------------ */
/*  Icon component                                                     */
/* ------------------------------------------------------------------ */

interface IconProps {
  /** SF Symbol name or alias */
  web: string;
  /** Ignored — kept for API compatibility, tab bar uses sf prop directly */
  ios?: string;
  size?: number;
  color?: string;
}

export function Icon({ web, ios, size = 24, color = "#000000" }: IconProps) {
  const sfName = SF_ALIASES[web] ?? SF_ALIASES[ios ?? ""] ?? ios ?? web;

  return (
    <Image
      source={`sf:${sfName}`}
      style={{ width: size, height: size, tintColor: color }}
    />
  );
}
