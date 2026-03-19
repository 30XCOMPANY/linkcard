/**
 * [INPUT]: react-native Share/Platform, expo-linking, @/src/types, @/src/lib/public-url
 * [OUTPUT]: generateShareLink, shareCard, getShareHistory, trackShareEvent
 * [POS]: Card sharing utilities — server share link creation + native share sheet with fixed `/u/` public URLs
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Share, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { BusinessCard, CardVersion, ShareSession } from '@/src/types';
import { buildPublicCardUrl, sanitizePublicSlug } from '@/src/lib/public-url';

const API_BASE_URL =
  (typeof window !== 'undefined' && window.location?.origin) ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3001';

/**
 * Generate a unique shareable link for a card
 */
export const generateShareLink = async (
  card: BusinessCard,
  version: CardVersion,
  selectedFields: string[]
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/share/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: card.id,
        versionId: version.id,
        fields: selectedFields,
        profile: card.profile,
        qrCodeData: card.qrCodeData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate share link');
    }

    const data = await response.json();
    return data.shareUrl;
  } catch (error) {
    // Fallback to local link generation
    console.warn('Server share failed, using local fallback');
    const fallbackSlug = sanitizePublicSlug(card.profile.username || card.profile.name || card.id) || card.id;
    const params = new URLSearchParams({
      name: card.profile.name,
      headline: card.profile.headline || '',
      company: card.profile.company || '',
      jobTitle: card.profile.jobTitle || '',
      location: card.profile.location || '',
      profileUrl: card.profile.url || '',
      website: card.profile.website || '',
      photoUrl: card.profile.photoUrl || '',
      qrCodeData: card.qrCodeData,
      v: version.id,
      f: selectedFields.join(','),
    });
    return `${buildPublicCardUrl(fallbackSlug)}?${params.toString()}`;
  }
};

/**
 * Share the card using native share sheet
 */
export const shareCard = async (
  card: BusinessCard,
  version: CardVersion,
  selectedFields: string[]
): Promise<boolean> => {
  try {
    const shareUrl = await generateShareLink(card, version, selectedFields);

    const shareContent = {
      title: `${card.profile.name}'s Business Card`,
      message: buildShareMessage(card, version, shareUrl),
      url: Platform.OS === 'ios' ? shareUrl : undefined,
    };

    const result = await Share.share(shareContent);

    if (result.action === Share.sharedAction) {
      // Track share event
      trackShareEvent(card.id, version.id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Share failed:', error);
    throw error;
  }
};

/**
 * Build a friendly share message
 */
const buildShareMessage = (
  card: BusinessCard,
  version: CardVersion,
  url: string
): string => {
  const { profile } = card;
  const lines = [`Connect with ${profile.name}`];

  if (profile.headline) {
    lines.push(profile.headline);
  }

  if (profile.company) {
    lines.push(`at ${profile.company}`);
  }

  lines.push('');
  lines.push(url);

  return lines.join('\n');
};

/**
 * Track share events for analytics
 */
const trackShareEvent = async (cardId: string, versionId: string) => {
  try {
    await fetch(`${API_BASE_URL}/api/share/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId,
        versionId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silent fail for analytics
    console.warn('Share tracking failed:', error);
  }
};

/**
 * Get share history for a card
 */
export const getShareHistory = async (
  cardId: string
): Promise<ShareSession[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/share/history?cardId=${cardId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch share history');
    }

    const data = await response.json();
    return data.sessions;
  } catch (error) {
    console.error('Failed to get share history:', error);
    return [];
  }
};

/**
 * Generate vCard data for contact import
 */
export const generateVCard = (card: BusinessCard): string => {
  const { profile } = card;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `TITLE:${profile.headline}`,
    `ORG:${profile.company}`,
  ];

  if (profile.email) {
    lines.push(`EMAIL:${profile.email}`);
  }

  if (profile.phone) {
    lines.push(`TEL:${profile.phone}`);
  }

  if (profile.website) {
    lines.push(`URL:${profile.website}`);
  }

  lines.push(`URL:${profile.url}`);
  lines.push(`NOTE:LinkedIn: ${profile.url}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
};

/**
 * Open LinkedIn profile
 */
export const openLinkedInProfile = async (profileUrl: string) => {
  try {
    // Try to open in LinkedIn app first
    const linkedInAppUrl = profileUrl.replace(
      'https://www.linkedin.com',
      'linkedin://'
    );

    const canOpen = await Linking.canOpenURL(linkedInAppUrl);

    if (canOpen) {
      await Linking.openURL(linkedInAppUrl);
    } else {
      await Linking.openURL(profileUrl);
    }
  } catch (error) {
    console.error('Failed to open LinkedIn profile:', error);
    // Fallback to web
    await Linking.openURL(profileUrl);
  }
};

