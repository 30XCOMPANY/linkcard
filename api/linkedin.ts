import { VercelRequest, VercelResponse } from '@vercel/node';

// LinkedIn Profile Data Interface
interface LinkedInProfileData {
    name: string;
    headline: string;
    jobTitle?: string;
    company: string;
    location: string;
    city?: string;
    photoUrl: string | null;
    email?: string;
    phone?: string;
    website?: string;
    character?: string;
}

// Simple cache
const profileCache = new Map<string, { data: LinkedInProfileData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

        // Check environment variables
        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
        const RAPIDAPI_HOST = process.env.RAPIDAPI_LINKEDIN_HOST || 'fresh-linkedin-profile-data.p.rapidapi.com';
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        console.log(`[LinkedIn API] Environment check:`, {
            hasRapidApiKey: !!RAPIDAPI_KEY,
            hasOpenAiKey: !!OPENAI_API_KEY,
            rapidApiHost: RAPIDAPI_HOST
        });

        if (!RAPIDAPI_KEY) {
            console.error('[LinkedIn API] RAPIDAPI_KEY is not set');
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'RAPIDAPI_KEY environment variable is not configured'
            });
        }

        // Check cache first
        const cached = profileCache.get(username);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`[LinkedIn API] Returning cached profile for ${username}`);
            return res.status(200).json(cached.data);
        }

        // Fetch from RapidAPI
        const profileUrl = `https://www.linkedin.com/in/${username}`;
        const apiUrl = `https://${RAPIDAPI_HOST}/enrich-lead?linkedin_url=${encodeURIComponent(profileUrl)}&include_skills=true&include_certifications=true&include_publications=true`;

        console.log(`[LinkedIn API] Calling RapidAPI for ${username}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
        });

        console.log(`[LinkedIn API] RapidAPI response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LinkedIn API] RapidAPI error:`, errorText);
            return res.status(500).json({
                error: 'Failed to fetch LinkedIn profile',
                message: `RapidAPI returned status ${response.status}`
            });
        }

        const responseData = await response.json() as any;

        if (!responseData.data) {
            console.error('[LinkedIn API] Invalid API response format');
            return res.status(500).json({
                error: 'Invalid API response',
                message: 'Missing data field in response'
            });
        }

        const data = responseData.data;

        // Parse the profile
        const city = data.city || (data.location ? data.location.split(',')[0] : '');
        const location = city || data.location || '';
        const jobTitle = data.job_title || data.current_position?.title || data.positions?.[0]?.title;

        // Get character/bio
        let character = data.summary || data.about;

        // If character is too long, try to summarize with OpenAI
        if (character && character.length > 100 && OPENAI_API_KEY) {
            try {
                console.log(`[LinkedIn API] Attempting to summarize character with OpenAI`);
                const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                                content: 'You are a helpful assistant that extracts 3 key descriptive keywords from text. Return only the 3 keywords separated by commas, no explanations.',
                            },
                            {
                                role: 'user',
                                content: `Extract 3 key descriptive keywords from this text: ${character}`,
                            },
                        ],
                        temperature: 0.3,
                        max_tokens: 50,
                    }),
                });

                if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json() as any;
                    const keywords = summaryData.choices?.[0]?.message?.content?.trim();
                    if (keywords) {
                        character = keywords;
                        console.log(`[LinkedIn API] Summarized character: ${character}`);
                    }
                }
            } catch (error) {
                console.warn('[LinkedIn API] Failed to summarize with OpenAI:', error);
                // Fallback to truncation
                character = character.substring(0, 97) + '...';
            }
        } else if (character && character.length > 100) {
            character = character.substring(0, 97) + '...';
        }

        const profile: LinkedInProfileData = {
            name: data.full_name || data.first_name + ' ' + data.last_name || username,
            headline: data.headline || data.job_title || '',
            jobTitle: jobTitle,
            company: data.company || data.current_position?.company || '',
            location: location,
            city: city,
            photoUrl: data.profile_image_url || null,
            email: data.email,
            phone: data.phone,
            website: data.company_website,
            character: character,
        };

        // Cache the result
        profileCache.set(username, {
            data: profile,
            timestamp: Date.now(),
        });

        console.log(`[LinkedIn API] Successfully fetched and cached profile for: ${username}`);
        return res.status(200).json(profile);

    } catch (error) {
        console.error('[LinkedIn API] Unexpected error:', error);

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
