/**
 * [INPUT]: @/src/types LinkedInProfile
 * [OUTPUT]: getOnboardingProfile, setOnboardingProfile, clearOnboardingProfile
 * [POS]: lib onboarding data bridge passing LinkedInProfile between onboarding routes without search-param serialization
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import type { LinkedInProfile } from "@/src/types";

let profileRef: LinkedInProfile | null = null;

export function setOnboardingProfile(profile: LinkedInProfile): void {
  profileRef = profile;
}

export function getOnboardingProfile(): LinkedInProfile | null {
  return profileRef;
}

export function clearOnboardingProfile(): void {
  profileRef = null;
}
