/**
 * [INPUT]: path, env vars (PASS_TYPE_ID, APPLE_TEAM_ID, API_BASE_URL)
 * [OUTPUT]: generatePass, updatePass — Apple Wallet .pkpass generation (stub)
 * [POS]: Wallet pass service — consumed by routes/wallet. Requires Apple Developer certs for production.
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import path from 'path';

// In production, these would come from environment variables and secure storage
const PASS_TYPE_IDENTIFIER = process.env.PASS_TYPE_ID || 'pass.com.linkcard.businesscard';
const TEAM_IDENTIFIER = process.env.APPLE_TEAM_ID || 'XXXXXXXXXX';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

interface PassGenerationInput {
  serialNumber: string;
  cardId: string;
  versionId: string;
  profile: {
    name: string;
    headline: string;
    company: string;
    location: string;
    photoUrl: string | null;
  };
  qrCodeData: string;
  accentColor: string;
}

interface GeneratedPass {
  passTypeIdentifier: string;
  downloadUrl: string;
  buffer?: Buffer;
}

/**
 * Generate an Apple Wallet pass
 */
export async function generatePass(input: PassGenerationInput): Promise<GeneratedPass> {
  const { serialNumber, profile, qrCodeData, accentColor } = input;

  // Pass.json structure for Apple Wallet
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_IDENTIFIER,
    serialNumber,
    teamIdentifier: TEAM_IDENTIFIER,
    organizationName: 'LinkCard',
    description: `${profile.name}'s Business Card`,
    
    // Colors
    backgroundColor: hexToRgb(accentColor),
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(255, 255, 255)',
    
    // Generic pass type (best for business cards)
    generic: {
      primaryFields: [
        {
          key: 'name',
          label: 'NAME',
          value: profile.name,
        },
      ],
      secondaryFields: [
        {
          key: 'title',
          label: 'TITLE',
          value: profile.headline,
        },
      ],
      auxiliaryFields: [
        {
          key: 'company',
          label: 'COMPANY',
          value: profile.company,
        },
        {
          key: 'location',
          label: 'LOCATION',
          value: profile.location,
        },
      ],
      backFields: [
        {
          key: 'linkedin',
          label: 'LinkedIn Profile',
          value: qrCodeData,
        },
      ],
    },
    
    // QR code barcode
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: qrCodeData,
        messageEncoding: 'iso-8859-1',
        altText: 'Scan to connect on LinkedIn',
      },
    ],
    
    // Web service for updates
    webServiceURL: `${API_BASE_URL}/api/wallet`,
    authenticationToken: generateAuthToken(serialNumber),
  };

  // In production, you would:
  // 1. Use passkit-generator to create the .pkpass file
  // 2. Sign it with your Apple certificate
  // 3. Store it and return a download URL

  /*
  import { PKPass } from 'passkit-generator';
  
  const pass = new PKPass(passJson, {
    wwdr: fs.readFileSync(path.join(__dirname, '../../certs/wwdr.pem')),
    signerCert: fs.readFileSync(path.join(__dirname, '../../certs/signerCert.pem')),
    signerKey: fs.readFileSync(path.join(__dirname, '../../certs/signerKey.pem')),
    signerKeyPassphrase: process.env.SIGNER_KEY_PASSPHRASE,
  });

  // Add images
  if (profile.photoUrl) {
    const photoBuffer = await fetchImage(profile.photoUrl);
    pass.addBuffer('thumbnail.png', photoBuffer);
    pass.addBuffer('thumbnail@2x.png', photoBuffer);
  }

  const buffer = pass.getAsBuffer();
  */

  // For demo purposes, return a mock response
  return {
    passTypeIdentifier: PASS_TYPE_IDENTIFIER,
    downloadUrl: `${API_BASE_URL}/api/wallet/pass/${serialNumber}`,
  };
}

/**
 * Update an existing pass (triggers push notification to devices)
 */
export async function updatePass(input: PassGenerationInput): Promise<void> {
  const { serialNumber } = input;

  // In production, you would:
  // 1. Regenerate the pass with new data
  // 2. Store the updated pass
  // 3. Send push notification via APNs to devices that have the pass

  /*
  import apn from 'apn';
  
  const apnProvider = new apn.Provider({
    token: {
      key: fs.readFileSync(path.join(__dirname, '../../certs/apns.p8')),
      keyId: process.env.APNS_KEY_ID,
      teamId: TEAM_IDENTIFIER,
    },
    production: process.env.NODE_ENV === 'production',
  });

  // Get device tokens for this pass from your database
  const deviceTokens = await getDeviceTokensForPass(serialNumber);

  // Send push notification (empty payload triggers pass refresh)
  const notification = new apn.Notification();
  notification.topic = PASS_TYPE_IDENTIFIER;

  await apnProvider.send(notification, deviceTokens);
  */

  console.log(`Pass ${serialNumber} updated`);
}

/**
 * Convert hex color to RGB string for PassKit
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return 'rgb(99, 102, 241)'; // Default indigo
  }
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

/**
 * Generate authentication token for pass web service
 */
function generateAuthToken(serialNumber: string): string {
  // In production, use a proper JWT or secure token
  return Buffer.from(`${serialNumber}:${Date.now()}`).toString('base64');
}


