import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();

// Import the scraper service
import { parseLinkedInProfile } from './src/services/scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required' });
        }

        console.log(`[LinkedIn API] Fetching profile for: ${username}`);

        const profile = await parseLinkedInProfile(username);

        return res.status(200).json(profile);
    } catch (error) {
        console.error('LinkedIn profile fetch error:', error);
        return res.status(500).json({
            error: 'Failed to fetch profile',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
