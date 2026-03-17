/**
 * [INPUT]: dotenv, OpenAI Chat Completions API (gpt-4o-mini)
 * [OUTPUT]: summarizeToKeywords — extracts 3 descriptive keywords from text
 * [POS]: AI text processing service — consumed by scraper for character field generation
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Summarize character text into 3 keywords using AI
 */
export async function summarizeToKeywords(text: string): Promise<string | null> {
  // If no API key, return null (will fall back to truncation)
  if (!OPENAI_API_KEY) {
    console.warn('[AI] OpenAI API key not configured, skipping AI summarization');
    console.warn('[AI] OPENAI_API_KEY env var:', OPENAI_API_KEY ? 'SET (hidden)' : 'NOT SET');
    return null;
  }

  console.log('[AI] Starting summarization, text length:', text.length);

  if (!text || text.trim().length === 0) {
    return null;
  }

  // If text is already short (under 100 chars), return as is
  if (text.length <= 100) {
    return text;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts 3 key descriptive keywords from text. Return only the 3 keywords separated by commas, no explanations, no quotes, just the keywords themselves.',
          },
          {
            role: 'user',
            content: `Extract 3 key descriptive keywords from this text: ${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[AI] OpenAI API error:', response.status, error);
      return null;
    }

    const data = await response.json() as any;
    const keywords = data.choices?.[0]?.message?.content?.trim();

    if (!keywords) {
      console.warn('[AI] No keywords returned from OpenAI, response:', JSON.stringify(data).substring(0, 200));
      return null;
    }

    console.log('[AI] Raw keywords from OpenAI:', keywords);

    // Clean up the response (remove quotes, extra spaces, etc.)
    const cleanKeywords = keywords
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\n/g, ',') // Replace newlines with commas
      .split(',')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0)
      .slice(0, 3) // Take only first 3
      .join(', ');

    console.log('[AI] Cleaned keywords:', cleanKeywords);
    return cleanKeywords || null;
  } catch (error) {
    console.error('[AI] Error calling OpenAI API:', error);
    if (error instanceof Error) {
      console.error('[AI] Error details:', error.message, error.stack);
    }
    return null;
  }
}

