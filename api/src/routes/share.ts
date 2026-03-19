/**
 * [INPUT]: express Router, zod, uuid
 * [OUTPUT]: Router — POST /create, GET /:shareId, POST /track, GET /history
 * [POS]: Share link CRUD + analytics, in-memory storage (demo) with `/u/` public URL namespace
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for demo (use a database in production)
const shareLinks = new Map<string, ShareLinkData>();
const shareEvents: ShareEvent[] = [];

interface ShareLinkData {
  id: string;
  cardId: string;
  versionId: string;
  fields: string[];
  profile: any;
  qrCodeData: string;
  createdAt: Date;
  viewCount: number;
}

interface ShareEvent {
  cardId: string;
  versionId: string;
  timestamp: Date;
}

// Validation schemas
const createShareSchema = z.object({
  cardId: z.string(),
  versionId: z.string(),
  fields: z.array(z.string()),
  profile: z.object({
    name: z.string(),
    headline: z.string(),
    company: z.string(),
    location: z.string(),
    photoUrl: z.string().nullable(),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
  }),
  qrCodeData: z.string(),
});

const BASE_URL = process.env.SHARE_BASE_URL || 'https://linkcard.ai';

/**
 * POST /api/share/create
 * Create a unique shareable link
 */
router.post('/create', async (req, res) => {
  try {
    const data = createShareSchema.parse(req.body);
    
    const shareId = uuidv4().slice(0, 8); // Short ID for cleaner URLs
    
    const shareLink: ShareLinkData = {
      id: shareId,
      ...data,
      createdAt: new Date(),
      viewCount: 0,
    };
    
    shareLinks.set(shareId, shareLink);
    
    res.json({
      shareId,
      shareUrl: `${BASE_URL}/u/${shareId}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    console.error('Share link creation error:', error);
    res.status(500).json({
      error: 'Failed to create share link',
    });
  }
});

/**
 * GET /api/share/:shareId
 * Get shared card data
 */
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const shareData = shareLinks.get(shareId);
    
    if (!shareData) {
      return res.status(404).json({
        error: 'Share link not found',
      });
    }
    
    // Increment view count
    shareData.viewCount++;
    
    // Filter profile to only include selected fields
    const filteredProfile: any = {};
    for (const field of shareData.fields) {
      if (field in shareData.profile) {
        filteredProfile[field] = (shareData.profile as any)[field];
      }
    }
    
    res.json({
      profile: filteredProfile,
      qrCodeData: shareData.fields.includes('qrCode') ? shareData.qrCodeData : undefined,
      viewCount: shareData.viewCount,
    });
  } catch (error) {
    console.error('Share link fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch share data',
    });
  }
});

/**
 * POST /api/share/track
 * Track a share event (analytics)
 */
router.post('/track', async (req, res) => {
  try {
    const { cardId, versionId, timestamp } = req.body;
    
    shareEvents.push({
      cardId,
      versionId,
      timestamp: new Date(timestamp),
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Share tracking error:', error);
    res.status(500).json({
      error: 'Failed to track share',
    });
  }
});

/**
 * GET /api/share/history
 * Get share history for a card
 */
router.get('/history', async (req, res) => {
  try {
    const { cardId } = req.query;
    
    if (!cardId || typeof cardId !== 'string') {
      return res.status(400).json({
        error: 'cardId is required',
      });
    }
    
    const cardEvents = shareEvents.filter((e) => e.cardId === cardId);
    const cardLinks = Array.from(shareLinks.values()).filter((l) => l.cardId === cardId);
    
    res.json({
      sessions: cardLinks.map((link) => ({
        id: link.id,
        cardId: link.cardId,
        versionId: link.versionId,
        sharedAt: link.createdAt,
        viewCount: link.viewCount,
      })),
      totalShares: cardEvents.length,
      totalViews: cardLinks.reduce((sum, link) => sum + link.viewCount, 0),
    });
  } catch (error) {
    console.error('Share history fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch share history',
    });
  }
});

export default router;

