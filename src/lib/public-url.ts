/**
 * [INPUT]: none (pure URL helpers)
 * [OUTPUT]: PUBLIC_SITE_URL, sanitizePublicSlug, buildPublicCardPath, buildPublicCardUrl
 * [POS]: Public URL single source — centralizes the reserved `/u/` namespace and production domain
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */

const DEFAULT_SITE_URL = "https://linkcard.ai";

export const PUBLIC_SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/+$/g, "") || DEFAULT_SITE_URL;

export const sanitizePublicSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildPublicCardPath = (slug: string): string =>
  `/u/${sanitizePublicSlug(slug)}`;

export const buildPublicCardUrl = (slug: string): string =>
  `${PUBLIC_SITE_URL}${buildPublicCardPath(slug)}`;
