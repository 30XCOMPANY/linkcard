import { Platform } from 'react-native';
import { BusinessCard, CardVersion, WalletPassData } from '@/src/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Check if Apple Wallet is available on this device
 */
export const isWalletAvailable = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Generate an Apple Wallet pass for the business card
 */
export const generateWalletPass = async (
  card: BusinessCard,
  version: CardVersion
): Promise<WalletPassData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: card.id,
        versionId: version.id,
        profile: {
          name: card.profile.name,
          headline: card.profile.headline,
          company: card.profile.company,
          location: card.profile.location,
          photoUrl: card.profile.photoUrl,
        },
        qrCodeData: card.qrCodeData,
        accentColor: version.accentColor,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate wallet pass');
    }

    const data = await response.json();

    return {
      serialNumber: data.serialNumber,
      passTypeIdentifier: data.passTypeIdentifier,
      downloadUrl: data.downloadUrl,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Wallet pass generation error:', error);
    throw error;
  }
};

/**
 * Download and open the wallet pass
 * This triggers the native "Add to Wallet" flow on iOS
 */
export const addToWallet = async (passData: WalletPassData): Promise<void> => {
  if (!isWalletAvailable()) {
    throw new Error('Apple Wallet is not available on this device');
  }

  try {
    // In a real implementation, this would:
    // 1. Download the .pkpass file from passData.downloadUrl
    // 2. Use PassKit native module to present the "Add to Wallet" sheet

    // For React Native, you'd use a library like react-native-passkit-wallet
    // or create a native module

    const { Linking } = require('react-native');

    // The .pkpass file URL scheme triggers iOS to handle it
    await Linking.openURL(passData.downloadUrl);
  } catch (error) {
    console.error('Add to wallet error:', error);
    throw error;
  }
};

/**
 * Update an existing wallet pass when profile changes
 */
export const updateWalletPass = async (
  card: BusinessCard,
  version: CardVersion,
  existingPassData: WalletPassData
): Promise<WalletPassData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serialNumber: existingPassData.serialNumber,
        cardId: card.id,
        versionId: version.id,
        profile: {
          name: card.profile.name,
          headline: card.profile.headline,
          company: card.profile.company,
          location: card.profile.location,
          photoUrl: card.profile.photoUrl,
        },
        qrCodeData: card.qrCodeData,
        accentColor: version.accentColor,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update wallet pass');
    }

    const data = await response.json();

    return {
      ...existingPassData,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Wallet pass update error:', error);
    throw error;
  }
};


