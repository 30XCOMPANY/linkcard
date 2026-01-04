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

        // Get character/bio - ALWAYS generate 3 keywords
        let character = data.summary || data.about;

        // If no character exists, build from available info
        if (!character || character.trim().length === 0) {
            console.log(`[LinkedIn API] No summary/about found, generating from profile data`);
            const parts = [];
            if (data.headline) parts.push(data.headline);
            if (jobTitle) parts.push(jobTitle);
            if (data.company) parts.push(`at ${data.company}`);
            if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
                parts.push(data.skills.slice(0, 3).join(', '));
            }
            character = parts.join('. ');
        }

        // ALWAYS try to generate 3 keywords with OpenAI
        if (OPENAI_API_KEY && character && character.trim().length > 0) {
            try {
                console.log(`[LinkedIn API] Generating 3 keywords from: "${character.substring(0, 100)}..."`);
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
                                content: 'You are a helpful assistant that extracts 3 key descriptive keywords from professional profiles. Return ONLY 3 keywords separated by commas, nothing else. Examples: "Innovative, Strategic, Data-Driven" or "Creative, Collaborative, Detail-Oriented"',
                            },
                            {
                                role: 'user',
                                content: `Extract 3 key professional keywords from this profile: ${character}`,
                            },
                        ],
                        temperature: 0.3,
                        max_tokens: 50,
                    }),
                });

                if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json() as any;
                    const keywords = summaryData.choices?.[0]?.message?.content?.trim();
                    if (keywords && keywords.length > 0) {
                        character = keywords;
                        console.log(`[LinkedIn API] ✓ Generated keywords: "${character}"`);
                    } else {
                        console.warn('[LinkedIn API] OpenAI returned empty keywords, using fallback');
                        character = generateFallbackKeywords(data.headline, jobTitle);
                    }
                } else {
                    console.warn(`[LinkedIn API] OpenAI API error: ${summaryResponse.status}`);
                    character = generateFallbackKeywords(data.headline, jobTitle);
                }
            } catch (error) {
                console.error('[LinkedIn API] OpenAI error:', error);
                character = generateFallbackKeywords(data.headline, jobTitle);
            }
        } else {
            // No OpenAI key or no character data - use fallback
            console.warn('[LinkedIn API] No OpenAI key or character data, using fallback');
            character = generateFallbackKeywords(data.headline, jobTitle);
        }

        // Fallback function to extract keywords from headline/job title
        function generateFallbackKeywords(headline?: string, jobTitle?: string): string {
            const text = `${headline || ''} ${jobTitle || ''}`.toLowerCase();
            const keywords = [];

            // Common professional keywords
            if (text.match(/innovat|creative|design/)) keywords.push('Innovative');
            else if (text.match(/strateg|leader|executive/)) keywords.push('Strategic');
            else if (text.match(/analyt|data|research/)) keywords.push('Analytical');
            else keywords.push('Professional');

            if (text.match(/team|collab|social/)) keywords.push('Collaborative');
            else if (text.match(/tech|engineer|develop/)) keywords.push('Technical');
            else keywords.push('Experienced');

            if (text.match(/result|driven|focus/)) keywords.push('Results-Driven');
            else keywords.push('Dedicated');

            const result = keywords.slice(0, 3).join(', ');
            console.log(`[LinkedIn API] Fallback keywords: "${result}"`);
            return result;
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
