/**
 * Emoji Service - Frontend
 * Matches emojis to user profiles for "My Vibe" component
 */

import { LinkedInProfile } from '@/src/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface EmojiResponse {
  success: boolean;
  emojis: string[];
}

/**
 * Match 3 emojis based on profile data
 * Returns an array of 3 emojis that best represent the user's vibe
 */
export const matchEmojis = async (
  profile: LinkedInProfile
): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emoji/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: profile.name,
        headline: profile.headline,
        jobTitle: profile.jobTitle,
        company: profile.company,
        character: profile.character,
        location: profile.location,
      }),
    });

    if (!response.ok) {
      console.error('[Emoji] Failed to match emojis:', response.status);
      return ['💼', '🚀', '✨']; // Fallback
    }

    const data: EmojiResponse = await response.json();
    return data.emojis || ['💼', '🚀', '✨'];
  } catch (error) {
    console.error('[Emoji] Error matching emojis:', error);
    return ['💼', '🚀', '✨']; // Fallback
  }
};

