/**
 * [INPUT]: express Router, zod, uuid, services/passGenerator (generatePass, updatePass)
 * [OUTPUT]: Router — POST /generate, PUT /update, GET /pass/:serialNumber
 * [POS]: Apple Wallet pass generation + update routes
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { generatePass, updatePass } from '../services/passGenerator';

const router = Router();

// Validation schemas
const generatePassSchema = z.object({
  cardId: z.string(),
  versionId: z.string(),
  profile: z.object({
    name: z.string(),
    headline: z.string(),
    company: z.string(),
    location: z.string(),
    photoUrl: z.string().nullable(),
  }),
  qrCodeData: z.string(),
  accentColor: z.string(),
});

const updatePassSchema = generatePassSchema.extend({
  serialNumber: z.string(),
});

/**
 * POST /api/wallet/generate
 * Generate a new Apple Wallet pass
 */
router.post('/generate', async (req, res) => {
  try {
    const data = generatePassSchema.parse(req.body);
    
    const serialNumber = uuidv4();
    const passData = await generatePass({
      serialNumber,
      ...data,
    });

    res.json({
      serialNumber,
      passTypeIdentifier: passData.passTypeIdentifier,
      downloadUrl: passData.downloadUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Pass generation error:', error);
    res.status(500).json({
      error: 'Failed to generate wallet pass',
    });
  }
});

/**
 * PUT /api/wallet/update
 * Update an existing Apple Wallet pass
 */
router.put('/update', async (req, res) => {
  try {
    const data = updatePassSchema.parse(req.body);
    
    await updatePass(data);

    res.json({
      success: true,
      message: 'Pass updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Pass update error:', error);
    res.status(500).json({
      error: 'Failed to update wallet pass',
    });
  }
});

/**
 * GET /api/wallet/pass/:serialNumber
 * Download a generated pass file
 */
router.get('/pass/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    // In production, retrieve the pass from storage and serve it
    // The pass would be a .pkpass file
    
    res.status(404).json({
      error: 'Pass not found',
    });
  } catch (error) {
    console.error('Pass download error:', error);
    res.status(500).json({
      error: 'Failed to download pass',
    });
  }
});

export default router;


