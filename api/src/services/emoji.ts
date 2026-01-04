/**
 * Emoji Matching Service
 * Uses AI to match 3 emojis that best represent the user's profile
 */

import dotenv from 'dotenv';
dotenv.config();

// Profile interface for analysis
interface ProfileData {
  name: string;
  headline?: string;
  jobTitle?: string;
  company?: string;
  character?: string;
  location?: string;
}

/**
 * Match 3 emojis based on profile data using AI
 */
export async function matchEmojis(profile: ProfileData): Promise<string[] | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.warn('[Emoji] OpenAI API key not configured. Please set OPENAI_API_KEY in api/.env file');
    return null;
  }

  console.log('[Emoji] Matching emojis for profile:', profile.name);

  try {
    // Build a prompt for emoji matching
    const characteristics: string[] = [];

    if (profile.character) {
      if (profile.character.includes(',')) {
        characteristics.push(...profile.character.split(',').map(c => c.trim()));
      } else {
        characteristics.push(profile.character);
      }
    }

    if (profile.headline) {
      characteristics.push(profile.headline);
    }
    if (profile.jobTitle) {
      characteristics.push(profile.jobTitle);
    }
    if (profile.company) {
      characteristics.push(profile.company);
    }

    const profileSummary = characteristics.slice(0, 5).join(', ');

    const prompt = `Based on the following professional profile, select exactly 3 emojis that best represent this person's personality, work style, and vibe. 

Profile: ${profileSummary}

Requirements:
- Return exactly 3 emojis
- Choose emojis that reflect their professional identity, personality traits, and vibe
- Return ONLY the emojis, separated by commas, no explanations, no markdown, no code blocks
- Example format: 🚀, 💡, ⚡

Emojis:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at matching emojis to professional profiles. Return exactly 3 emojis that best represent the person.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Emoji] OpenAI API error:', response.status, errorText);
      return null;
    }

    const data = await response.json() as any;
    const emojiText = data.choices?.[0]?.message?.content?.trim();

    if (!emojiText) {
      console.error('[Emoji] No emoji text in response');
      return null;
    }

    // Parse emojis from response
    // Remove any markdown code blocks if present
    let cleanEmojis = emojiText
      .replace(/```/g, '')
      .replace(/emoji/gi, '')
      .trim();

    // Split by comma and clean up
    const emojis = cleanEmojis
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0)
      .slice(0, 3); // Take first 3

    if (emojis.length < 3) {
      console.warn('[Emoji] Received less than 3 emojis, using fallback');
      return getFallbackEmojis(profile);
    }

    console.log('[Emoji] Matched emojis:', emojis);
    return emojis;

  } catch (error) {
    console.error('[Emoji] Error matching emojis:', error);
    if (error instanceof Error) {
      console.error('[Emoji] Error details:', error.message, error.stack);
    }
    return getFallbackEmojis(profile);
  }
}

/**
 * Get fallback emojis based on profile
 */
function getFallbackEmojis(profile: ProfileData): string[] {
  // Simple fallback: return generic professional emojis
  return ['💼', '🚀', '✨'];
}

