/**
 * [INPUT]: LinkedInProfile fields
 * [OUTPUT]: ProfileTag[] — deterministic emoji + label chips derived from profile data
 * [POS]: Pure utility — no AI, no randomness, just field → tag mapping
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { LinkedInProfile } from "@/src/types";

export interface ProfileTag {
  emoji: string;
  label: string;
}

/**
 * Derive identity tags from LinkedInProfile fields.
 * Order: company → jobTitle → skills/character → location
 */
export function deriveProfileTags(profile: LinkedInProfile): ProfileTag[] {
  const tags: ProfileTag[] = [];

  if (profile.company) {
    tags.push({ emoji: "💻", label: profile.company });
  }

  if (profile.jobTitle) {
    tags.push({ emoji: "👨", label: profile.jobTitle });
  }

  // Character keywords from AI summary (e.g. "Visionary, Builder, Mentor")
  if (profile.character) {
    const keywords = profile.character.split(",").map((s) => s.trim());
    for (const kw of keywords.slice(0, 2)) {
      if (kw) tags.push({ emoji: "💡", label: kw });
    }
  }

  if (profile.location) {
    tags.push({ emoji: "📍", label: profile.location });
  }

  return tags;
}
