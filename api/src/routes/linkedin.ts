import { Router } from 'express';
import { z } from 'zod';
import { parseLinkedInProfile, clearProfileCache } from '../services/scraper';

const router = Router();

// Validation schema
const profileRequestSchema = z.object({
  username: z.string().min(1).max(100),
});

/**
 * POST /api/linkedin/profile
 * Fetch and parse a LinkedIn profile
 */
router.post('/profile', async (req, res) => {
  try {
    const { username } = profileRequestSchema.parse(req.body);
    
    const profile = await parseLinkedInProfile(username);
    
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    console.error('LinkedIn profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/linkedin/check
 * Check if a profile has changed
 */
router.post('/check', async (req, res) => {
  try {
    const { username, checksum } = req.body;
    
    const profile = await parseLinkedInProfile(username);
    const newChecksum = generateChecksum(profile);
    
    res.json({
      hasChanges: newChecksum !== checksum,
      profile: newChecksum !== checksum ? profile : undefined,
      checksum: newChecksum,
    });
  } catch (error) {
    console.error('Profile check error:', error);
    res.status(500).json({
      error: 'Failed to check profile',
    });
  }
});

// Simple checksum generator
function generateChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * POST /api/linkedin/clear-cache (temporary debug endpoint)
 * Clear the profile cache to force fresh fetches
 */
router.post('/clear-cache', (req, res) => {
  clearProfileCache();
  res.json({ message: 'Cache cleared successfully' });
});

export default router;

