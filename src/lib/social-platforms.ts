/**
 * [INPUT]: @/src/types SocialPlatform
 * [OUTPUT]: SOCIAL_PLATFORMS registry, getSocialPlatform(), detectPlatformFromUrl()
 * [POS]: Single source of truth for platform metadata — label, icon, color, URL prefix
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { SocialPlatform } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Platform metadata                                                  */
/* ------------------------------------------------------------------ */

export interface SocialPlatformMeta {
  label: string;
  /** SF Symbol name — used for SettingsIconTile in editor context */
  sfIcon: string;
  color: string;
  /** Brighter variant for glass tint — more vibrant on translucent surfaces */
  glassColor: string;
  urlPrefix: string;
  placeholder: string;
}

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformMeta> = {
  linkedin: {
    label: "LinkedIn",
    sfIcon: "briefcase",
    color: "#0A66C2",
    glassColor: "#2D8CFF",
    urlPrefix: "https://linkedin.com/in/",
    placeholder: "linkedin.com/in/username",
  },
  x: {
    label: "X",
    sfIcon: "at",
    color: "#000000",
    glassColor: "#3A3A3C",
    urlPrefix: "https://x.com/",
    placeholder: "x.com/username",
  },
  github: {
    label: "GitHub",
    sfIcon: "chevron.left.forwardslash.chevron.right",
    color: "#181717",
    glassColor: "#3A3A3C",
    urlPrefix: "https://github.com/",
    placeholder: "github.com/username",
  },
  instagram: {
    label: "Instagram",
    sfIcon: "camera",
    color: "#E4405F",
    glassColor: "#D8317A",
    urlPrefix: "https://instagram.com/",
    placeholder: "instagram.com/username",
  },
  youtube: {
    label: "YouTube",
    sfIcon: "play.rectangle",
    color: "#FF0000",
    glassColor: "#FF4444",
    urlPrefix: "https://youtube.com/@",
    placeholder: "youtube.com/@channel",
  },
  threads: {
    label: "Threads",
    sfIcon: "at.circle",
    color: "#000000",
    glassColor: "#3A3A3C",
    urlPrefix: "https://threads.net/@",
    placeholder: "threads.net/@username",
  },
  bluesky: {
    label: "Bluesky",
    sfIcon: "cloud",
    color: "#0085FF",
    glassColor: "#3DA5FF",
    urlPrefix: "https://bsky.app/profile/",
    placeholder: "bsky.app/profile/handle",
  },
  mastodon: {
    label: "Mastodon",
    sfIcon: "elephant",
    color: "#6364FF",
    glassColor: "#8B8CFF",
    urlPrefix: "https://mastodon.social/@",
    placeholder: "mastodon.social/@username",
  },
  reddit: {
    label: "Reddit",
    sfIcon: "bubble.left.and.bubble.right",
    color: "#FF4500",
    glassColor: "#FF6D3A",
    urlPrefix: "https://reddit.com/u/",
    placeholder: "reddit.com/u/username",
  },
  discord: {
    label: "Discord",
    sfIcon: "headphones",
    color: "#5865F2",
    glassColor: "#7B86FF",
    urlPrefix: "https://discord.gg/",
    placeholder: "discord.gg/invite",
  },
  telegram: {
    label: "Telegram",
    sfIcon: "paperplane",
    color: "#26A5E4",
    glassColor: "#5AC8FA",
    urlPrefix: "https://t.me/",
    placeholder: "t.me/username",
  },
  tiktok: {
    label: "TikTok",
    sfIcon: "music.note",
    color: "#000000",
    glassColor: "#3A3A3C",
    urlPrefix: "https://tiktok.com/@",
    placeholder: "tiktok.com/@username",
  },
  facebook: {
    label: "Facebook",
    sfIcon: "person.2",
    color: "#1877F2",
    glassColor: "#4A9AFF",
    urlPrefix: "https://facebook.com/",
    placeholder: "facebook.com/username",
  },
  medium: {
    label: "Medium",
    sfIcon: "text.book.closed",
    color: "#000000",
    glassColor: "#3A3A3C",
    urlPrefix: "https://medium.com/@",
    placeholder: "medium.com/@username",
  },
  substack: {
    label: "Substack",
    sfIcon: "newspaper",
    color: "#FF6719",
    glassColor: "#FF8A4C",
    urlPrefix: "https://substack.com/@",
    placeholder: "yourname.substack.com",
  },
  "google-scholar": {
    label: "Google Scholar",
    sfIcon: "graduationcap",
    color: "#4285F4",
    glassColor: "#6BA3FF",
    urlPrefix: "https://scholar.google.com/citations?user=",
    placeholder: "scholar.google.com/citations?user=ID",
  },
  "hugging-face": {
    label: "Hugging Face",
    sfIcon: "brain",
    color: "#FFD21E",
    glassColor: "#FFDF5A",
    urlPrefix: "https://huggingface.co/",
    placeholder: "huggingface.co/username",
  },
  kaggle: {
    label: "Kaggle",
    sfIcon: "chart.bar",
    color: "#20BEFF",
    glassColor: "#5AD4FF",
    urlPrefix: "https://kaggle.com/",
    placeholder: "kaggle.com/username",
  },
  "stack-overflow": {
    label: "Stack Overflow",
    sfIcon: "square.stack.3d.up",
    color: "#F58025",
    glassColor: "#FFA35C",
    urlPrefix: "https://stackoverflow.com/users/",
    placeholder: "stackoverflow.com/users/ID",
  },
  dribbble: {
    label: "Dribbble",
    sfIcon: "basketball",
    color: "#EA4C89",
    glassColor: "#FF72A8",
    urlPrefix: "https://dribbble.com/",
    placeholder: "dribbble.com/username",
  },
  behance: {
    label: "Behance",
    sfIcon: "paintbrush",
    color: "#1769FF",
    glassColor: "#4A8FFF",
    urlPrefix: "https://behance.net/",
    placeholder: "behance.net/username",
  },
  figma: {
    label: "Figma",
    sfIcon: "pencil.and.ruler",
    color: "#F24E1E",
    glassColor: "#FF7A52",
    urlPrefix: "https://figma.com/@",
    placeholder: "figma.com/@username",
  },
  "product-hunt": {
    label: "Product Hunt",
    sfIcon: "target",
    color: "#DA552F",
    glassColor: "#FF8A5C",
    urlPrefix: "https://producthunt.com/@",
    placeholder: "producthunt.com/@username",
  },
  website: {
    label: "Website",
    sfIcon: "globe",
    color: "#5AC8FA",
    glassColor: "#7DD8FF",
    urlPrefix: "https://",
    placeholder: "yourwebsite.com",
  },
};

/** Ordered list of all platforms for picker UI */
export const PLATFORM_ORDER: SocialPlatform[] = [
  "linkedin", "x", "github", "instagram", "youtube",
  "threads", "bluesky", "mastodon", "reddit", "discord",
  "telegram", "tiktok", "facebook", "medium", "substack",
  "google-scholar", "hugging-face", "kaggle", "stack-overflow",
  "dribbble", "behance", "figma", "product-hunt", "website",
];

export function getSocialPlatform(platform: SocialPlatform): SocialPlatformMeta {
  return SOCIAL_PLATFORMS[platform];
}

/* ------------------------------------------------------------------ */
/*  URL → Platform auto-detection                                      */
/*  Matches domain patterns to identify which platform a URL belongs to */
/* ------------------------------------------------------------------ */

const URL_PATTERNS: [RegExp, SocialPlatform][] = [
  [/linkedin\.com/i, "linkedin"],
  [/(?:twitter\.com|x\.com)/i, "x"],
  [/github\.com/i, "github"],
  [/instagram\.com/i, "instagram"],
  [/youtube\.com|youtu\.be/i, "youtube"],
  [/threads\.net/i, "threads"],
  [/bsky\.app|bluesky\.social/i, "bluesky"],
  [/mastodon\.\w+|mstdn\.\w+/i, "mastodon"],
  [/reddit\.com/i, "reddit"],
  [/discord\.(?:gg|com)/i, "discord"],
  [/t\.me|telegram\.(?:org|me)/i, "telegram"],
  [/tiktok\.com/i, "tiktok"],
  [/facebook\.com|fb\.com/i, "facebook"],
  [/medium\.com/i, "medium"],
  [/substack\.com/i, "substack"],
  [/scholar\.google/i, "google-scholar"],
  [/huggingface\.co/i, "hugging-face"],
  [/kaggle\.com/i, "kaggle"],
  [/stackoverflow\.com/i, "stack-overflow"],
  [/dribbble\.com/i, "dribbble"],
  [/behance\.net/i, "behance"],
  [/figma\.com/i, "figma"],
  [/producthunt\.com/i, "product-hunt"],
];

/**
 * Detect platform from a URL string.
 * Returns the matched SocialPlatform, or "website" if no match.
 */
export function detectPlatformFromUrl(url: string): SocialPlatform {
  const normalized = url.trim().toLowerCase();
  for (const [pattern, platform] of URL_PATTERNS) {
    if (pattern.test(normalized)) return platform;
  }
  return "website";
}
