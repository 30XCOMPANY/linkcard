/**
 * [INPUT]: react-native-svg, majesticons SVG path data
 * [OUTPUT]: Icon component — Majesticons SVG on all platforms
 * [POS]: Core utility — unified icon rendering via Majesticons line icons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

/* ------------------------------------------------------------------ */
/*  Majesticons SVG data — line style, 24x24, stroke="currentColor"    */
/* ------------------------------------------------------------------ */

interface SvgDef {
  paths: string[];
  circles?: { cx: number; cy: number; r: number }[];
}

const ICONS: Record<string, SvgDef> = {
  "edit-pen": {
    paths: ["m14 6 2.293-2.293a1 1 0 0 1 1.414 0l2.586 2.586a1 1 0 0 1 0 1.414L18 10m-4-4-9.707 9.707a1 1 0 0 0-.293.707V19a1 1 0 0 0 1 1h2.586a1 1 0 0 0 .707-.293L18 10m-4-4 4 4"],
  },
  send: {
    paths: ["m6 12-3 9 18-9L3 3l3 9zm0 0h6"],
  },
  settings: {
    paths: ["M14 21h-4l-.551-2.48a6.991 6.991 0 0 1-1.819-1.05l-2.424.763-2-3.464 1.872-1.718a7.055 7.055 0 0 1 0-2.1L3.206 9.232l2-3.464 2.424.763A6.992 6.992 0 0 1 9.45 5.48L10 3h4l.551 2.48a6.992 6.992 0 0 1 1.819 1.05l2.424-.763 2 3.464-1.872 1.718a7.05 7.05 0 0 1 0 2.1l1.872 1.718-2 3.464-2.424-.763a6.99 6.99 0 0 1-1.819 1.052L14 21z"],
    circles: [{ cx: 12, cy: 12, r: 3 }],
  },
  share: {
    paths: ["m20 12-6.4-7v3.5C10.4 8.5 4 10.6 4 19c0-1.167 1.92-3.5 9.6-3.5V19l6.4-7z"],
  },
  trash: {
    paths: ["M9 7v0a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v0M9 7h6M9 7H6m9 0h3m2 0h-2M4 7h2m0 0v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"],
  },
  "qr-code": {
    paths: ["M20 18v2h-2m2-6h-1l-2 2m-1 2h-2v2M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0v1h1v-1h-1zm3-7h.001M7 7h.001M7 17h.001"],
  },
  "chevron-right": {
    paths: ["m10 7 5 5-5 5"],
  },
  "chevron-left": {
    paths: ["m14 7-5 5 5 5"],
  },
  close: {
    paths: ["M12 12 7 7m5 5 5 5m-5-5 5-5m-5 5-5 5"],
  },
  plus: {
    paths: ["M5 12h7m7 0h-7m0 0V5m0 7v7"],
  },
  minus: {
    paths: ["M5 12h14"],
  },
  search: {
    paths: ["m20 20-4.05-4.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9z"],
  },
  user: {
    paths: ["M20 21a8 8 0 1 0-16 0m16 0a8 8 0 1 0-16 0"],
    circles: [{ cx: 12, cy: 8, r: 5 }],
  },
  home: {
    paths: ["M20 19v-8.5a1 1 0 0 0-.4-.8l-7-5.25a1 1 0 0 0-1.2 0l-7 5.25a1 1 0 0 0-.4.8V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1z"],
  },
  bell: {
    paths: ["M12 5c-2 0-6 1.2-6 6v4l-2 2h5m3-12c4.8 0 6 4 6 6v4l2 2h-5M12 5V3M9 17v1c0 1 .6 3 3 3s3-2 3-3v-1m-6 0h6"],
  },
  link: {
    paths: ["M15 8h2c1.333 0 4 .8 4 4s-2.667 4-4 4h-2M9 8H7c-1.333 0-4 .8-4 4s2.667 4 4 4h2m-1-4h8"],
  },
  mail: {
    paths: ["m7 9 3.75 3a2 2 0 0 0 2.5 0L17 9m4 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"],
  },
  "map-marker": {
    paths: ["M19 10c0 3.976-7 11-7 11s-7-7.024-7-11 3.134-7 7-7 7 3.024 7 7z"],
    circles: [{ cx: 12, cy: 10, r: 3 }],
  },
  phone: {
    paths: ["M13 18.675c1.93.83 4.242 1.325 7 1.325v-4l-4-1-3 3.675zm0 0C9.159 17.023 6.824 14.045 5.5 11m0 0C4.4 8.472 4 5.898 4 4h4l1 4-3.5 3z"],
  },
  globe: {
    paths: ["M8 4v2a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v0a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2v0a2 2 0 0 1 2-2h1m0 8h-3a2 2 0 0 0-2 2v2m-4 0v-2a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v0a2 2 0 0 0-2-2H3"],
    circles: [{ cx: 12, cy: 12, r: 9 }],
  },
  eye: {
    paths: ["M12 5c-6.307 0-9.367 5.683-9.91 6.808a.435.435 0 0 0 0 .384C2.632 13.317 5.692 19 12 19s9.367-5.683 9.91-6.808a.435.435 0 0 0 0-.384C21.368 10.683 18.308 5 12 5z"],
    circles: [{ cx: 12, cy: 12, r: 3 }],
  },
  heart: {
    paths: ["M17 4c-3.2 0-5 2.667-5 4 0-1.333-1.8-4-5-4S3 6.667 3 8c0 7 9 12 9 12s9-5 9-12c0-1.333-.8-4-4-4z"],
  },
  bookmark: {
    paths: ["M17 3H7a2 2 0 0 0-2 2v15.138a.5.5 0 0 0 .748.434l5.26-3.005a2 2 0 0 1 1.984 0l5.26 3.006a.5.5 0 0 0 .748-.435V5a2 2 0 0 0-2-2z"],
  },
  tag: {
    paths: ["M3 11.172V5a2 2 0 0 1 2-2h6.172a2 2 0 0 1 1.414.586l8 8a2 2 0 0 1 0 2.828l-6.172 6.172a2 2 0 0 1-2.828 0l-8-8A2 2 0 0 1 3 11.172zM7 7h.001"],
  },
  briefcase: {
    paths: ["M15 8V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2m6 0h4a2 2 0 0 1 2 2v3m-6-5H9m0 0H5a2 2 0 0 0-2 2v3m0 0v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M3 13h7m11 0h-7m0 0v-2h-4v2m4 0v2h-4v-2"],
  },
  bolt: {
    paths: ["M4 14 14 3v7h6L10 21v-7H4z"],
  },
  image: {
    paths: ["M21 12V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11m18-4v7a2 2 0 0 1-2 2h-3m5-9c-6.442 0-10.105 1.985-12.055 4.243M3 16v3a2 2 0 0 0 2 2v0h11M3 16c1.403-.234 3.637-.293 5.945.243M16 21c-1.704-2.768-4.427-4.148-7.055-4.757M8.5 7C8 7 7 7.3 7 8.5S8 10 8.5 10 10 9.7 10 8.5 9 7 8.5 7z"],
  },
  camera: {
    paths: ["M3 18V9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
    circles: [{ cx: 12, cy: 13, r: 3 }],
  },
  clock: {
    paths: ["M12 7v3.764a2 2 0 0 0 1.106 1.789L16 14"],
    circles: [{ cx: 12, cy: 12, r: 9 }],
  },
  reload: {
    paths: ["M19 13.5A7.5 7.5 0 1 1 11.5 6H20m0 0-3-3m3 3-3 3"],
  },
  "arrow-left": {
    paths: ["m5 12 6-6m-6 6 6 6m-6-6h14"],
  },
  "arrow-right": {
    paths: ["m19 12-6-6m6 6-6 6m6-6H5"],
  },
  creditcard: {
    paths: ["M22 10H2M6 14h3m5 0h2m-7 4h7"],
    circles: [],
  },
  document: {
    paths: ["M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm8 0v4a2 2 0 0 0 2 2h4"],
  },
  check: {
    paths: ["m5 12 5 5L20 7"],
  },
  "clipboard-check": {
    paths: ["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"],
  },
  star: {
    paths: ["M12 3l2.472 5.01L20 8.891l-4 3.898.944 5.504L12 15.467l-4.944 2.826.944-5.504-4-3.898 5.528-.88L12 3z"],
  },
  "note-text": {
    paths: ["M8 10h8M8 14h4m-4 4h1M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"],
  },
  wallet: {
    paths: ["M20 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3m0-4h-7a2 2 0 0 0 0 4h7m0-4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2"],
  },
};

/* ------------------------------------------------------------------ */
/*  Icon name alias — maps semantic names to Majesticons keys          */
/* ------------------------------------------------------------------ */

const ALIASES: Record<string, string> = {
  pencil: "edit-pen",
  create: "edit-pen",
  "create-outline": "edit-pen",
  "trash-outline": "trash",
  "share-outline": "share",
  "settings-outline": "settings",
  "chevron-forward": "chevron-right",
  "chevron-back": "chevron-left",
  "close-outline": "close",
  "add-outline": "plus",
  add: "plus",
  remove: "minus",
  "search-outline": "search",
  "person-outline": "user",
  "person": "user",
  "home-outline": "home",
  "notifications-outline": "bell",
  "link-outline": "link",
  "mail-outline": "mail",
  "location-outline": "map-marker",
  location: "map-marker",
  "call-outline": "phone",
  "globe-outline": "globe",
  "eye-outline": "eye",
  "eye-off-outline": "eye",
  "heart-outline": "heart",
  "bookmark-outline": "bookmark",
  "star-outline": "star",
  "tag-outline": "tag",
  "business-outline": "briefcase",
  "flash-outline": "bolt",
  "image-outline": "image",
  "camera-outline": "camera",
  "time-outline": "clock",
  "refresh-outline": "reload",
  refresh: "reload",
  "arrow-back": "arrow-left",
  "arrow-forward": "arrow-right",
  "card-outline": "creditcard",
  "document-text-outline": "document",
  "checkmark": "check",
  "checkmark-outline": "check",
  "checkmark-circle": "clipboard-check",
  "text-outline": "note-text",
  "wallet-outline": "wallet",
  "qr-code-outline": "qr-code",
  "radio-outline": "share",
  "paper-plane": "send",
  "paperplane": "send",
  envelope: "mail",
  "building.2": "briefcase",
  "text.quote": "note-text",
  "square.and.arrow.up": "share",
  "slider.horizontal.3": "settings",
  qrcode: "qr-code",
  "wallet.bifold": "wallet",
  "antenna.radiowaves.left.and.right": "share",
};

/* ------------------------------------------------------------------ */
/*  MajestIcon — renders a Majesticons SVG                             */
/* ------------------------------------------------------------------ */

function MajestIcon({
  name,
  size = 24,
  color = "#000000",
}: {
  name: string;
  size: number;
  color: string;
}) {
  const resolved = ALIASES[name] ?? name;
  const icon = ICONS[resolved];

  if (!icon) {
    // Fallback: render a simple circle for unknown icons
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {icon.paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {icon.circles?.map((c, i) => (
        <Circle
          key={`c${i}`}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Public Icon component                                              */
/* ------------------------------------------------------------------ */

interface IconProps {
  /** SF Symbol name — kept for NativeTabs (which only accepts sf/md) */
  ios?: string;
  /** Majesticons icon name (or Ionicons-style alias) */
  web: string;
  size?: number;
  color?: string;
}

/**
 * Renders Majesticons SVG icons on all platforms.
 * The `ios` prop is only used by NativeTabs.Trigger.Icon (sf prop),
 * not by this component.
 */
export function Icon({ web, size = 24, color = "#000000" }: IconProps) {
  return <MajestIcon name={web} size={size} color={color} />;
}
