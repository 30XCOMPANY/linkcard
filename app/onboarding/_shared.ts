/**
 * [INPUT]: @/src/types LinkedInProfile
 * [OUTPUT]: getOnboardingProfile, setOnboardingProfile — module-level profile data shuttle
 * [POS]: Onboarding data bridge — passes LinkedInProfile from linkedin → preview without serialization
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { LinkedInProfile } from "@/src/types";

// Module-level state for passing profile between onboarding screens.
// Avoids JSON serialization overhead of search params for complex objects.
let _profile: LinkedInProfile | null = null;

export function setOnboardingProfile(profile: LinkedInProfile): void {
  _profile = profile;
}

export function getOnboardingProfile(): LinkedInProfile | null {
  return _profile;
}

export function clearOnboardingProfile(): void {
  _profile = null;
}
