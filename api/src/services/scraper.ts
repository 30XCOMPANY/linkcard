/**
 * LinkedIn Profile Scraper using RapidAPI
 */

import fetch from 'node-fetch';
import { summarizeToKeywords } from './ai';

export interface LinkedInProfileData {
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
  publications?: Array<{
    title: string;
    publisher?: string;
    date?: string;
    description?: string;
    url?: string;
  }>;
  // Additional fields that API might provide
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  honors?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  volunteerExperience?: Array<{
    organization: string;
    role?: string;
    date?: string;
    description?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    date?: string;
    url?: string;
  }>;
  patents?: Array<{
    title: string;
    number?: string;
    date?: string;
    description?: string;
  }>;
  courses?: Array<{
    name: string;
    number?: string;
    provider?: string;
  }>;
  organizations?: Array<{
    name: string;
    role?: string;
    date?: string;
  }>;
  positions?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

// Cache to prevent excessive requests
const profileCache = new Map<string, { data: LinkedInProfileData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Temporary: Clear cache function for debugging
export function clearProfileCache() {
  profileCache.clear();
  console.log('[CACHE] Profile cache cleared');
}

// RapidAPI configuration - Fresh LinkedIn Profile Data API
// Based on the actual API configuration from RapidAPI test interface
// Host: fresh-linkedin-profile-data.p.rapidapi.com
// Endpoint: /enrich-lead
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_LINKEDIN_HOST || 'fresh-linkedin-profile-data.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  throw new Error('RAPIDAPI_KEY environment variable is required. Please set it in api/.env file.');
}

/**
 * Parse a LinkedIn profile using RapidAPI
 */
export async function parseLinkedInProfile(username: string): Promise<LinkedInProfileData> {
  // Check cache first
  const cached = profileCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE] Returning cached profile for ${username} (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
    return cached.data;
  }

  console.log(`[CACHE] Cache miss for ${username}, fetching fresh data...`);
  console.log(`[CACHE] Current time: ${new Date().toISOString()}`);

  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    const profileUrl = `https://www.linkedin.com/in/${username}`;

    // Use the correct API configuration based on RapidAPI test interface
    // Endpoint: /enrich-lead
    // Enable additional fields that might be useful:
    // - include_skills: Skills list
    // - include_certifications: Certifications
    // - include_publications: Publications/articles (already enabled)
    // - include_honors: Awards and honors
    // - include_volunteers: Volunteer experience
    // - include_projects: Projects
    // - include_patents: Patents
    // - include_courses: Courses
    // - include_organizations: Organizations
    const url = `https://${RAPIDAPI_HOST}/enrich-lead?linkedin_url=${encodeURIComponent(profileUrl)}&include_skills=true&include_certifications=true&include_publications=true&include_honors=true&include_volunteers=true&include_projects=true&include_patents=true&include_courses=true&include_organizations=true&include_profile_status=false&include_company_public_url=false`;

    console.log('Calling RapidAPI:', { host: RAPIDAPI_HOST, endpoint: '/enrich-lead' });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY as string,
        'X-RapidAPI-Host': RAPIDAPI_HOST as string,
      },
    });

    const responseText = await response.text();
    console.log('RapidAPI response status:', response.status);

    if (!response.ok) {
      let errorMessage = `Failed to fetch LinkedIn profile: ${response.status}`;

      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const responseData = JSON.parse(responseText);

    // API returns { data: {...} } structure
    if (!responseData.data) {
      throw new Error('Invalid API response format: missing data field');
    }

    // Log all available fields from API response for debugging
    console.log('=== API Response Available Fields ===');
    console.log('All keys in data:', Object.keys(responseData.data));
    console.log('Sample data structure:', JSON.stringify(responseData.data, null, 2).substring(0, 2000)); // First 2000 chars
    console.log('=====================================');

    return await parseRapidAPIResponse(responseData.data, username);
  } catch (error) {
    console.error(`Failed to parse profile for ${username}:`, error);
    throw error;
  }
}

/**
 * Extract keywords from text (fallback method when AI is unavailable)
 */
function extractKeywordsFromText(text: string): string | null {
  if (!text || text.trim().length === 0) return null;

  // Simple keyword extraction: look for common patterns and extract meaningful words
  // This is a basic fallback - AI summarization is preferred
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3) // Filter short words
    .filter((word) => !['the', 'and', 'for', 'with', 'from', 'that', 'this', 'they', 'their', 'what', 'which'].includes(word)); // Remove common words

  // Return first 3 unique meaningful words
  const uniqueWords = [...new Set(words)].slice(0, 3);
  return uniqueWords.length > 0 ? uniqueWords.join(', ') : null;
}

/**
 * Parse RapidAPI response into our LinkedInProfileData format
 * Based on Fresh LinkedIn Profile Data API response structure
 * Documentation: https://fdocs.info/api-reference/endpoint/get-linkedin-profile
 */
async function parseRapidAPIResponse(data: any, username: string): Promise<LinkedInProfileData> {
  // API returns data in this format:
  // {
  //   full_name: "Anthony James",
  //   headline: "Technology Leader & Innovator",
  //   company: "Trinity Consulting Services",
  //   location: "Sydney, Australia",
  //   profile_image_url: "https://example.com/profile.jpg",
  //   email: "[email protected]",
  //   phone: "+61234567890",
  //   ...
  // }

  // Prefer city over full location for more precise location display
  const city = data.city || (data.location ? data.location.split(',')[0] : '');
  const location = city || data.location || '';

  // Extract job title (if separate from headline)
  const jobTitle = data.job_title || data.current_position?.title || data.positions?.[0]?.title || undefined;

  // Character/bio - can be from summary, about, or generated from other fields
  // If longer than 100 characters, summarize to 3 keywords using AI
  let character = data.summary || data.about || undefined;

  // If no character field exists, generate it from other available information
  if (!character) {
    console.log(`[SCRAPER] No character field found, generating from other profile data...`);
    const profileInfo: string[] = [];

    // Collect relevant information
    if (data.headline) profileInfo.push(data.headline);
    if (jobTitle) profileInfo.push(jobTitle);
    if (data.company) profileInfo.push(`at ${data.company}`);
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      // Take first 3-5 skills
      const topSkills = data.skills.slice(0, 5).join(', ');
      profileInfo.push(`Skills: ${topSkills}`);
    }

    if (profileInfo.length > 0) {
      const combinedText = profileInfo.join('. ');
      console.log(`[SCRAPER] Generated character text from profile info (length: ${combinedText.length})`);

      // Use AI to summarize into 3 keywords
      const startTime = Date.now();
      const summarized = await summarizeToKeywords(combinedText);
      const duration = Date.now() - startTime;
      if (summarized) {
        console.log(`[AI] Character generation successful (${duration}ms): "${summarized}"`);
        character = summarized;
      } else {
        // Fallback: extract keywords from headline/job title
        console.warn(`[AI] Character generation failed, using fallback extraction`);
        const keywords = extractKeywordsFromText(combinedText);
        character = keywords || undefined;
      }
    }
  }

  // If character exists and is longer than 100 characters, summarize it
  if (character && character.length > 100) {
    console.log(`[AI] Character text length: ${character.length}, attempting to summarize...`);
    const startTime = Date.now();
    const summarized = await summarizeToKeywords(character);
    const duration = Date.now() - startTime;
    if (summarized) {
      console.log(`[AI] Summarization successful (${duration}ms): "${summarized}"`);
      character = summarized;
    } else {
      console.warn(`[AI] Summarization failed after ${duration}ms, using fallback truncation`);
      character = character.substring(0, 97) + '...';
    }
  } else if (character) {
    console.log(`[SCRAPER] Character field: "${character}" (length: ${character.length})`);
  }

  const profile: LinkedInProfileData = {
    name: data.full_name || data.first_name + ' ' + data.last_name || username,
    headline: data.headline || data.job_title || '',
    jobTitle: jobTitle,
    company: data.company || data.current_position?.company || '',
    location: location,
    city: city,
    photoUrl: data.profile_image_url || null,
    email: data.email || undefined,
    phone: data.phone || undefined,
    website: data.company_website || undefined,
    character: character,
    publications: data.publications ? data.publications.map((pub: any) => ({
      title: pub.title || '',
      publisher: pub.publisher,
      date: pub.date,
      description: pub.description,
      url: pub.url,
    })) : undefined,
    // Additional fields
    skills: data.skills ? (Array.isArray(data.skills) ? data.skills : [data.skills]) : undefined,
    certifications: data.certifications ? data.certifications.map((cert: any) => ({
      name: cert.name || cert.title || '',
      issuer: cert.issuer || cert.issuing_organization,
      date: cert.issue_date || cert.date,
      url: cert.url,
    })) : undefined,
    honors: data.honors || data.awards ? (data.honors || data.awards).map((honor: any) => ({
      title: honor.title || honor.name || '',
      issuer: honor.issuer || honor.issuing_organization,
      date: honor.date || honor.issue_date,
      description: honor.description,
    })) : undefined,
    volunteerExperience: data.volunteer_experiences || data.volunteers ? (data.volunteer_experiences || data.volunteers).map((vol: any) => ({
      organization: vol.organization || vol.company || '',
      role: vol.role || vol.title,
      date: vol.date || `${vol.start_date || ''} - ${vol.end_date || 'Present'}`,
      description: vol.description,
    })) : undefined,
    projects: data.projects ? data.projects.map((proj: any) => ({
      name: proj.name || proj.title || '',
      description: proj.description,
      date: proj.date || `${proj.start_date || ''} - ${proj.end_date || ''}`,
      url: proj.url,
    })) : undefined,
    patents: data.patents ? data.patents.map((patent: any) => ({
      title: patent.title || patent.name || '',
      number: patent.patent_number || patent.number,
      date: patent.date || patent.issue_date,
      description: patent.description,
    })) : undefined,
    courses: data.courses ? data.courses.map((course: any) => ({
      name: course.name || course.title || '',
      number: course.course_number || course.number,
      provider: course.provider || course.school || course.organization,
    })) : undefined,
    organizations: data.organizations ? data.organizations.map((org: any) => ({
      name: org.name || org.organization || '',
      role: org.role || org.position,
      date: org.date || `${org.start_date || ''} - ${org.end_date || 'Present'}`,
    })) : undefined,
    positions: data.positions || data.experiences ? (data.positions || data.experiences).map((pos: any) => ({
      title: pos.title || pos.position || '',
      company: pos.company || pos.organization || '',
      startDate: pos.start_date || pos.start,
      endDate: pos.end_date || pos.end,
      description: pos.description,
    })) : undefined,
    education: data.education ? data.education.map((edu: any) => ({
      school: edu.school || edu.institution || edu.organization || '',
      degree: edu.degree || edu.degree_name,
      field: edu.field_of_study || edu.major,
      startDate: edu.start_date || edu.start,
      endDate: edu.end_date || edu.end,
    })) : undefined,
  };

  // Cache the result
  profileCache.set(username, {
    data: profile,
    timestamp: Date.now(),
  });

  return profile;
}

/**
 * Generate mock profile data for demo purposes
 * In production, replace this with actual scraping logic
 */
function generateMockProfile(username: string): LinkedInProfileData {
  // Create somewhat realistic mock data based on username
  const formattedName = username
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return {
    name: formattedName,
    headline: 'Software Engineer | Building the future',
    company: 'Tech Company',
    location: 'San Francisco Bay Area',
    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&size=200&background=6366F1&color=fff`,
  };
}

/**
 * Validate LinkedIn username format
 */
export function isValidUsername(username: string): boolean {
  // LinkedIn usernames can contain letters, numbers, and hyphens
  const usernameRegex = /^[a-zA-Z0-9-]{3,100}$/;
  return usernameRegex.test(username);
}

/**
 * Rate limiter for scraping requests
 */
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 10;

export function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Remove old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  requestTimestamps.push(now);
  return true;
}

