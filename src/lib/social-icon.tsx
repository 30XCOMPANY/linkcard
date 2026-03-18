/**
 * [INPUT]: react-native-svg SvgXml, @/src/lib/social-platforms getSocialPlatform,
 *          @/src/types SocialPlatform
 * [OUTPUT]: SocialIcon component — Majesticons line icons for social platforms
 * [POS]: Renders platform icons via react-native-svg SvgXml — Fabric-safe, zero native registration
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { SvgXml } from "react-native-svg";

import { getSocialPlatform } from "@/src/lib/social-platforms";
import type { SocialPlatform } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Majesticons line SVGs — one per platform                           */
/*  Source: github.com/halfmage/majesticons (MIT)                      */
/*  All viewBox="0 0 24 24", stroke="currentColor", stroke-width="2"  */
/* ------------------------------------------------------------------ */

const ICON_SVGS: Record<SocialPlatform, string> = {
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 8V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2m6 0h4a2 2 0 0 1 2 2v3m-6-5H9m0 0H5a2 2 0 0 0-2 2v3m0 0v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M3 13h7m11 0h-7m0 0v-2h-4v2m4 0v2h-4v-2"/></svg>',
  x:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9h8m-8 3h8m-8 3h3m10-3a9 9 0 0 1-13.815 7.605L3 21l1.395-4.185A9 9 0 1 1 21 12z"/></svg>',
  github:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 7-5 5 5 5m8 0 5-5-5-5"/></svg>',
  instagram:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 18V9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  youtube:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 16V8l6 4-6 4z"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  threads:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8h8m-8 3h8m-8 3h3m11-3c0 4.418-4.477 8-10 8-1.3 0-2.54-.198-3.68-.559C6.528 20.021 5 21 2 21c1-1 2.27-2.35 2.801-4.447C3.067 15.114 2 13.157 2 11c0-4.418 4.477-8 10-8s10 3.582 10 8z"/></svg>',
  bluesky:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 13.5C2 17.9 5.667 19 7.5 19h10c1.5 0 4.5-.9 4.5-4.5S19 10 17.5 10c0-1.5-1.5-5-5-5-2.8 0-4.5 2-5 3C5.667 8 2 9.1 2 13.5z"/></svg>',
  mastodon:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6m0 0v-6.172a2 2 0 0 0-.586-1.414l-3-3a2 2 0 0 0-2.828 0l-3 3A2 2 0 0 0 3 13.828V18a2 2 0 0 0 2 2h3m5 0H8m0-4v4m9.001-12H17m-3.999 0H13m4.001 4H17m.001 4H17"/></svg>',
  reddit:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12h-.394a2 2 0 0 0-1.11.336L3 14V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2m-2 3h7a2 2 0 0 1 2 2v9l-2.496-1.664a2 2 0 0 0-1.11-.336H12a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/></svg>',
  discord:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 14v4a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H4zm0 0v-3c0-2.333 2.4-7 8-7s8 4.667 8 7v3m0 0v4a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3z"/></svg>',
  telegram:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 12-3 9 18-9L3 3l3 9zm0 0h6"/></svg>',
  tiktok:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17V8m0 9c0 1-.6 3-3 3s-3-2-3-3 .6-3 3-3 3 2 3 3zm0-9V4h4v4h-4z"/></svg>',
  facebook:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 19c0-3.314-3.134-6-7-6s-7 2.686-7 6m13-6a4 4 0 1 0-3-6.646"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 19c0-3.314-3.134-6-7-6-.807 0-2.103-.293-3-1.235"/></svg>',
  medium:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 8h2m-2 4h2m0 4H7m0-8v4h4V8H7zM5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>',
  substack:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3v4m4 0V3m4 0v4m-8 4h8m-8 4h4m-6 6h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>',
  "google-scholar":
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5c-1.6 0-2-1.333-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6m2 8c-.667 0-2-.4-2-2v-6m2 8c1.6 0 2-1.333 2-2v-6h-4"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16h6m-1-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>',
  "hugging-face":
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 20H5v-2m3 2v-4h4m-4 4h4m4 0h3v-2m-3 2v-4h-4m4 4h-4m0-4v4m0-11H9a4 4 0 0 0-4 4v0m7-4h3a4 4 0 0 1 4 4v0m-7-4V5m7 8h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1m0-5v5M5 14.5v2M5 13H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1m0-5v5m4-5h.001M15 13h.001"/><circle cx="12" cy="5" r="1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  kaggle:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m4 0V7m-8 4h.01M3 3h1m17 0h-1m0 0v12h-6m6-12H4m0 0v12h6m0 0-2 6m2-6h4m0 0 2 6"/></svg>',
  "stack-overflow":
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h5m3 0h2m0 4h-6m-3 0H7m0 4h5m3 0h2M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>',
  dribbble:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.292 6A8.967 8.967 0 0 0 3 12c0 .687.077 1.357.223 2m2.069-8a9.003 9.003 0 0 1 15.485 4M5.292 6H12m8.777 4a9 9 0 0 1-15.485 8m15.485-8H15M3.223 14H13m-9.777 0a8.975 8.975 0 0 0 2.069 4m0 0H11m1-8h-2m-3 0h0m9 4h0"/></svg>',
  behance:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8c-.5 0-1.5.3-1.5 1.5S6.5 11 7 11m-5 6v3a2 2 0 0 0 2 2v0h11M2 17V6a2 2 0 0 1 2-2h3M2 17c1.403-.234 3.637-.293 5.945.243M15 22h3a2 2 0 0 0 2-2v-6m-5 8c-1.704-2.768-4.427-4.148-7.055-4.757m0 0c1.095-1.268 2.73-2.45 5.096-3.243M10 10V5a1 1 0 0 1 1-1h1l2-2h4l2 2h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1z"/><circle cx="16" cy="7" r="1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  figma:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10v2c0 .667.4 2 2 2s2-1.333 2-2v-2m3 0 1.5 2m1.5 2-1.5-2m0 0 1.5-2m-1.5 2L14 14"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  "product-hunt":
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><g clip-path="url(#a)"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9.9 16.97 7.436-7.436a8 8 0 0 0 2.145-3.89l.318-1.401-1.402.317a8 8 0 0 0-3.89 2.146L9.192 12.02m.707 4.95 2.122 3.535c1.178-1.178 2.828-2.828 0-5.657L9.899 16.97zm0 0-2.828-2.829m0 0L3.536 12.02c1.178-1.179 2.828-2.829 5.656 0m-2.12 2.121 2.12-2.121M4.95 16.263s-1.703 2.54-.707 3.536c.995.996 3.535-.707 3.535-.707"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></svg>',
  website:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v2a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v0a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2v0a2 2 0 0 1 2-2h1m0 8h-3a2 2 0 0 0-2 2v2m-4 0v-2a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v0a2 2 0 0 0-2-2H3"/></svg>',
};

/* ------------------------------------------------------------------ */
/*  SocialIcon                                                         */
/* ------------------------------------------------------------------ */

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  color?: string;
}

export function SocialIcon({ platform, size = 18, color }: SocialIconProps) {
  const meta = getSocialPlatform(platform);
  const tint = color ?? meta.color;
  const xml = (ICON_SVGS[platform] ?? ICON_SVGS.website).replace(/currentColor/g, tint);

  return <SvgXml xml={xml} width={size} height={size} />;
}
