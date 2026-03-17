/**
 * [INPUT]: LinkedInProfile fields, CardTagState overrides
 * [OUTPUT]: deriveProfileTags/resolveProfileTags/parseCustomTagInput — deterministic tag derivation plus editable merging
 * [POS]: Pure utility — no AI, no randomness, just field → tag mapping + tag-state normalization
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { CardTag, CardTagState, LinkedInProfile } from "@/src/types";

const DEFAULT_CUSTOM_TAG_EMOJI = "✨";

/**
 * Derive identity tags from LinkedInProfile fields.
 * Order: company → jobTitle → skills/character → location
 */
export function deriveProfileTags(profile: LinkedInProfile): CardTag[] {
  const tags: CardTag[] = [];

  if (profile.company) {
    tags.push({
      id: "company",
      emoji: "💻",
      label: profile.company,
      source: "derived",
    });
  }

  if (profile.jobTitle) {
    tags.push({
      id: "jobTitle",
      emoji: "👨",
      label: profile.jobTitle,
      source: "derived",
    });
  }

  // Character keywords from AI summary (e.g. "Visionary, Builder, Mentor")
  if (profile.character) {
    const keywords = profile.character.split(",").map((s) => s.trim());
    for (const [index, keyword] of keywords.slice(0, 2).entries()) {
      if (keyword) {
        tags.push({
          id: `character:${index}`,
          emoji: "💡",
          label: keyword,
          source: "derived",
        });
      }
    }
  }

  if (profile.location) {
    tags.push({
      id: "location",
      emoji: "📍",
      label: profile.location,
      source: "derived",
    });
  }

  return tags;
}

export function resolveProfileTags(
  profile: LinkedInProfile,
  tagState?: CardTagState
): CardTag[] {
  const derivedTags = deriveProfileTags(profile);

  if (!tagState) {
    return derivedTags;
  }

  const visibleDerivedTags = derivedTags
    .filter((tag) => !tagState.hidden.includes(tag.id))
    .map((tag) => ({
      ...tag,
      label: tagState.renamed[tag.id] ?? tag.label,
    }));

  return [...visibleDerivedTags, ...tagState.custom];
}

export function parseCustomTagInput(
  input: string
): Pick<CardTag, "emoji" | "label"> | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const [firstToken, ...restTokens] = trimmed.split(/\s+/);
  const hasEmojiPrefix = /[^\p{Letter}\p{Number}]/u.test(firstToken);
  const label = hasEmojiPrefix ? restTokens.join(" ").trim() : trimmed;

  if (!label) {
    return null;
  }

  return {
    emoji: hasEmojiPrefix ? firstToken : DEFAULT_CUSTOM_TAG_EMOJI,
    label,
  };
}
