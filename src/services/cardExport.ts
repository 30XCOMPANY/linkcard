/**
 * [INPUT]: react-native-view-shot, expo-file-system, expo-sharing, expo-media-library, react-native
 * [OUTPUT]: captureCardAsImage, saveCardToGallery, shareCardImage, ExportOptions
 * [POS]: Card image export — view-shot capture → file system → media library / share sheet
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number; // 0-1
  width?: number;
  height?: number;
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 1,
};

/**
 * Capture a card view as an image
 */
export async function captureCardAsImage(
  viewRef: React.RefObject<any>,
  options: Partial<ExportOptions> = {}
): Promise<string | null> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const uri = await captureRef(viewRef, {
      format: mergedOptions.format,
      quality: mergedOptions.quality,
      result: 'tmpfile',
      ...(mergedOptions.width && { width: mergedOptions.width }),
      ...(mergedOptions.height && { height: mergedOptions.height }),
    });

    return uri;
  } catch (error) {
    console.error('Failed to capture card:', error);
    return null;
  }
}

/**
 * Share the captured card image
 */
export async function shareCardImage(
  viewRef: React.RefObject<any>,
  cardName: string = 'My Business Card'
): Promise<boolean> {
  const uri = await captureCardAsImage(viewRef);

  if (!uri) {
    Alert.alert('Error', 'Failed to capture card image');
    return false;
  }

  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: `Share ${cardName}`,
      UTI: 'public.png',
    });

    return true;
  } catch (error) {
    console.error('Failed to share card:', error);
    return false;
  }
}

/**
 * Save the card image to the device gallery
 */
export async function saveCardToGallery(
  viewRef: React.RefObject<any>,
  albumName: string = 'LinkCard'
): Promise<boolean> {
  // Request permissions
  const { status } = await MediaLibrary.requestPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please grant photo library access to save your card'
    );
    return false;
  }

  const uri = await captureCardAsImage(viewRef);

  if (!uri) {
    Alert.alert('Error', 'Failed to capture card image');
    return false;
  }

  try {
    // Create asset
    const asset = await MediaLibrary.createAssetAsync(uri);

    // Try to add to album
    try {
      const album = await MediaLibrary.getAlbumAsync(albumName);
      
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      }
    } catch (albumError) {
      // Album creation might fail on some devices, but the photo is still saved
      console.warn('Failed to add to album:', albumError);
    }

    Alert.alert('Saved!', 'Your card has been saved to your photo library');
    return true;
  } catch (error) {
    console.error('Failed to save card:', error);
    Alert.alert('Error', 'Failed to save card to gallery');
    return false;
  }
}

/**
 * Export card as a file (for backup/transfer)
 */
export async function exportCardData(
  cardData: any,
  fileName: string = 'linkcard-export'
): Promise<boolean> {
  try {
    const jsonData = JSON.stringify(cardData, null, 2);
    const fileUri = `${FileSystem.documentDirectory}${fileName}.json`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Card Data',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to export card data:', error);
    return false;
  }
}

/**
 * Import card data from a file
 */
export async function importCardData(
  fileUri: string
): Promise<any | null> {
  try {
    const jsonData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to import card data:', error);
    return null;
  }
}


