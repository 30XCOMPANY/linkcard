/**
 * Emoji API Routes
 * Matches emojis to user profiles
 */

import express from 'express';
import { matchEmojis } from '../services/emoji';

const router = express.Router();

/**
 * POST /api/emoji/match
 * Match 3 emojis based on profile data
 */
router.post('/match', async (req, res) => {
  try {
    const profile = req.body;
    
    if (!profile || !profile.name) {
      return res.status(400).json({ error: 'Profile data with name is required' });
    }

    console.log('[Emoji API] Matching emojis for:', profile.name);
    
    const emojis = await matchEmojis(profile);
    
    if (emojis && emojis.length === 3) {
      return res.json({ 
        success: true, 
        emojis: emojis
      });
    }
    
    // Fallback emojis
    return res.json({ 
      success: true, 
      emojis: ['💼', '🚀', '✨']
    });
    
  } catch (error) {
    console.error('[Emoji API] Error:', error);
    res.status(500).json({ error: 'Failed to match emojis' });
  }
});

export default router;

