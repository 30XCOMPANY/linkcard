import { VercelRequest, VercelResponse } from '@vercel/node';

// Import the scraper service
// Note: In Vercel, we need to use relative paths carefully
const scraper = require('./src/services/scraper');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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
        console.log(`[LinkedIn API] Environment check:`, {
            hasRapidApiKey: !!process.env.RAPIDAPI_KEY,
            hasOpenAiKey: !!process.env.OPENAI_API_KEY,
            nodeEnv: process.env.NODE_ENV
        });

        const profile = await scraper.parseLinkedInProfile(username);

        console.log(`[LinkedIn API] Successfully fetched profile for: ${username}`);
        return res.status(200).json(profile);
    } catch (error) {
        console.error('[LinkedIn API] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('[LinkedIn API] Error details:', {
            message: errorMessage,
            stack: errorStack
        });

        return res.status(500).json({
            error: 'Failed to fetch profile',
            message: errorMessage,
        });
    }
}
