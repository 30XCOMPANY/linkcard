import { LinkedInProfile } from '@/src/types';

const API_BASE_URL = (typeof window !== 'undefined' && window.location?.hostname === 'localhost')
  ? 'http://localhost:3001'
  : '';

/**
 * Extract LinkedIn username from various URL formats
 */
export const extractLinkedInUsername = (input: string): string | null => {
  const cleanInput = input.trim().toLowerCase();

  // Patterns to match LinkedIn URLs
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/i,
    /^([a-zA-Z0-9_-]+)$/i, // Just the username
  ];

  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Fetch LinkedIn profile data from our backend API
 */
export const fetchLinkedInProfile = async (
  usernameOrUrl: string
): Promise<LinkedInProfile> => {
  const username = extractLinkedInUsername(usernameOrUrl);

  if (!username) {
    throw new Error('Invalid LinkedIn URL or username');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/linkedin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    const data = await response.json();

    return {
      url: `https://www.linkedin.com/in/${username}`,
      username,
      name: data.name,
      headline: data.headline,
      jobTitle: data.jobTitle || undefined,
      company: data.company,
      location: data.location,
      city: data.city || undefined,
      photoUrl: data.photoUrl,
      email: data.email,
      phone: data.phone,
      website: data.website,
      character: data.character || undefined,
      publications: (data as any).publications || undefined,
      lastSynced: new Date(),
      checksum: generateChecksum(data),
    };
  } catch (error) {
    console.error('LinkedIn fetch error:', error);
    throw error;
  }
};

/**
 * Check if the LinkedIn profile has changed
 */
export const checkProfileChanges = async (
  profile: LinkedInProfile
): Promise<{ hasChanges: boolean; newProfile?: LinkedInProfile }> => {
  try {
    const newProfile = await fetchLinkedInProfile(profile.username);
    const hasChanges = newProfile.checksum !== profile.checksum;

    return {
      hasChanges,
      newProfile: hasChanges ? newProfile : undefined,
    };
  } catch (error) {
    console.error('Profile change check failed:', error);
    return { hasChanges: false };
  }
};

/**
 * Generate a simple checksum for change detection
 */
const generateChecksum = (data: any): string => {
  const str = JSON.stringify({
    name: data.name,
    headline: data.headline,
    company: data.company,
    location: data.location,
    photoUrl: data.photoUrl,
  });

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16);
};

/**
 * Build LinkedIn profile URL
 */
export const getLinkedInUrl = (username: string): string => {
  return `https://www.linkedin.com/in/${username}`;
};

/**
 * Build LinkedIn QR code data URL
 * LinkedIn's QR codes simply link to the profile
 */
export const getLinkedInQRData = (username: string): string => {
  return `https://www.linkedin.com/in/${username}`;
};

