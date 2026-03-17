import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { radii, shadows } from '@/src/design-system/tokens';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  logo?: string;
  logoSize?: number;
  showBorder?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 150,
  backgroundColor = '#FFFFFF',
  color = '#000000',
  logo,
  logoSize,
  showBorder = true,
  borderColor = '#E5E5E5',
  style,
}) => {
  const calculatedLogoSize = logoSize || size * 0.2;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          padding: size * 0.1,
        },
        showBorder && {
          borderWidth: 1,
          borderColor,
        },
        shadows.sm,
        style,
      ]}
    >
      <QRCodeSVG
        value={value}
        size={size}
        backgroundColor={backgroundColor}
        color={color}
        logo={logo ? { uri: logo } : undefined}
        logoSize={logo ? calculatedLogoSize : undefined}
        logoBackgroundColor={backgroundColor}
        logoBorderRadius={radii.sm}
      />
    </View>
  );
};

// LinkedIn-styled QR code with rounded frame
interface LinkedInQRProps {
  profileUrl: string;
  size?: number;
  accentColor?: string;
  style?: ViewStyle;
}

export const LinkedInQR: React.FC<LinkedInQRProps> = ({
  profileUrl,
  size = 180,
  accentColor = '#0A66C2', // LinkedIn blue
  style,
}) => {
  return (
    <View style={[styles.linkedInContainer, style]}>
      <View style={[styles.linkedInFrame, { borderColor: accentColor }]}>
        <QRCodeSVG
          value={profileUrl}
          size={size}
          backgroundColor="#FFFFFF"
          color="#000000"
        />
      </View>
      <View style={[styles.linkedInBadge, { backgroundColor: accentColor }]}>
        <View style={styles.linkedInLogo}>
          {/* LinkedIn "in" icon placeholder - would use actual icon */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    alignSelf: 'center',
  },
  linkedInContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  linkedInFrame: {
    borderWidth: 4,
    borderRadius: radii.xl,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  linkedInBadge: {
    position: 'absolute',
    bottom: -12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  linkedInLogo: {
    width: 20,
    height: 20,
  },
});


