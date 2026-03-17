import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Avatar } from '@/src/components/ui/Avatar';
import { QRCode } from '@/src/components/qr/QRCode';
import { LinkedInProfile, CardVersion, CardTemplate } from '@/src/types';
import { radii, spacing, shadows, typography } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing['2xl'] * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

interface BusinessCardProps {
  profile: LinkedInProfile;
  version: CardVersion;
  qrCodeData: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  profile,
  version,
  qrCodeData,
  onPress,
  style,
}) => {
  const { template, accentColor, visibleFields } = version;

  const isVisible = (field: string) => visibleFields.includes(field as any);

  // Render the appropriate template
  switch (template) {
    case 'modern':
      return (
        <ModernCard
          profile={profile}
          accentColor={accentColor}
          qrCodeData={qrCodeData}
          isVisible={isVisible}
          style={style}
        />
      );
    case 'minimal':
      return (
        <MinimalCard
          profile={profile}
          accentColor={accentColor}
          qrCodeData={qrCodeData}
          isVisible={isVisible}
          style={style}
        />
      );
    case 'bento':
      return (
        <BentoCard
          profile={profile}
          accentColor={accentColor}
          qrCodeData={qrCodeData}
          isVisible={isVisible}
          style={style}
        />
      );
    case 'classic':
    default:
      return (
        <ClassicCard
          profile={profile}
          accentColor={accentColor}
          qrCodeData={qrCodeData}
          isVisible={isVisible}
          style={style}
        />
      );
  }
};

// Shared props for card templates
interface CardTemplateProps {
  profile: LinkedInProfile;
  accentColor: string;
  qrCodeData: string;
  isVisible: (field: string) => boolean;
  style?: ViewStyle;
}

// Classic Card - Traditional business card layout
const ClassicCard: React.FC<CardTemplateProps> = ({
  profile,
  accentColor,
  qrCodeData,
  isVisible,
  style,
}) => {
  return (
    <View style={[styles.card, shadows.lg, style]}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        style={styles.cardInner}
      >
        <View style={styles.classicHeader}>
          {isVisible('photoUrl') && (
            <Avatar
              source={profile.photoUrl}
              name={profile.name}
              size="lg"
              accentColor={accentColor}
            />
          )}
          <View style={styles.classicInfo}>
            {isVisible('name') && (
              <Text style={styles.name}>{profile.name}</Text>
            )}
            {isVisible('headline') && (
              <Text style={styles.headline} numberOfLines={2}>
                {profile.headline}
              </Text>
            )}
            {isVisible('company') && (
              <Text style={[styles.company, { color: accentColor }]}>
                {profile.company}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.classicFooter}>
          <View style={styles.contactInfo}>
            {isVisible('location') && profile.location && (
              <Text style={styles.contactText}>📍 {profile.location}</Text>
            )}
            {isVisible('email') && profile.email && (
              <Text style={styles.contactText}>✉️ {profile.email}</Text>
            )}
            {isVisible('phone') && profile.phone && (
              <Text style={styles.contactText}>📱 {profile.phone}</Text>
            )}
          </View>

          {isVisible('qrCode') && (
            <QRCode
              value={qrCodeData}
              size={70}
              color={accentColor}
              showBorder={false}
            />
          )}
        </View>

        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      </LinearGradient>
    </View>
  );
};

// Modern Card - Bold, gradient-heavy design
const ModernCard: React.FC<CardTemplateProps> = ({
  profile,
  accentColor,
  qrCodeData,
  isVisible,
  style,
}) => {
  // Create gradient colors from accent
  const gradientColors = [accentColor, adjustColor(accentColor, -40)];

  return (
    <View style={[styles.card, shadows.lg, style]}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardInner}
      >
        <View style={styles.modernContent}>
          <View style={styles.modernLeft}>
            {isVisible('name') && (
              <Text style={styles.modernName}>{profile.name}</Text>
            )}
            {isVisible('headline') && (
              <Text style={styles.modernHeadline} numberOfLines={2}>
                {profile.headline}
              </Text>
            )}
            {isVisible('company') && (
              <Text style={styles.modernCompany}>{profile.company}</Text>
            )}
            {isVisible('location') && (
              <Text style={styles.modernLocation}>{profile.location}</Text>
            )}
          </View>

          <View style={styles.modernRight}>
            {isVisible('photoUrl') && (
              <Avatar
                source={profile.photoUrl}
                name={profile.name}
                size="xl"
                accentColor="#FFFFFF"
                showBorder
              />
            )}
            {isVisible('qrCode') && (
              <QRCode
                value={qrCodeData}
                size={60}
                backgroundColor="#FFFFFF"
                color={accentColor}
                showBorder={false}
                style={{ marginTop: spacing.md }}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Minimal Card - Clean, typography-focused
const MinimalCard: React.FC<CardTemplateProps> = ({
  profile,
  accentColor,
  qrCodeData,
  isVisible,
  style,
}) => {
  return (
    <View style={[styles.card, styles.minimalCard, shadows.md, style]}>
      <View style={styles.minimalContent}>
        {isVisible('name') && (
          <Text style={styles.minimalName}>{profile.name}</Text>
        )}
        {isVisible('headline') && (
          <Text style={[styles.minimalHeadline, { color: accentColor }]}>
            {profile.headline}
          </Text>
        )}

        <View style={styles.minimalDivider} />

        {isVisible('company') && (
          <Text style={styles.minimalDetail}>{profile.company}</Text>
        )}

        {isVisible('qrCode') && (
          <View style={styles.minimalQR}>
            <QRCode
              value={qrCodeData}
              size={80}
              color="#171717"
              showBorder={false}
            />
          </View>
        )}
      </View>
    </View>
  );
};

// Bento Card - Grid-based, playful layout
const BentoCard: React.FC<CardTemplateProps> = ({
  profile,
  accentColor,
  qrCodeData,
  isVisible,
  style,
}) => {
  return (
    <View style={[styles.bentoContainer, style]}>
      {/* Main info card */}
      <View style={[styles.bentoCard, styles.bentoMain, shadows.md]}>
        <LinearGradient
          colors={[accentColor, adjustColor(accentColor, -30)]}
          style={styles.bentoGradient}
        >
          {isVisible('name') && (
            <Text style={styles.bentoName}>{profile.name}</Text>
          )}
          {isVisible('headline') && (
            <Text style={styles.bentoHeadline} numberOfLines={2}>
              {profile.headline}
            </Text>
          )}
        </LinearGradient>
      </View>

      <View style={styles.bentoRow}>
        {/* Avatar card */}
        {isVisible('photoUrl') && (
          <View style={[styles.bentoCard, styles.bentoAvatar, shadows.md]}>
            <Avatar
              source={profile.photoUrl}
              name={profile.name}
              size="xl"
              accentColor={accentColor}
            />
          </View>
        )}

        {/* QR card */}
        {isVisible('qrCode') && (
          <View style={[styles.bentoCard, styles.bentoQR, shadows.md]}>
            <QRCode
              value={qrCodeData}
              size={70}
              color={accentColor}
              showBorder={false}
            />
            <Text style={styles.bentoScanText}>Scan me</Text>
          </View>
        )}
      </View>

      {/* Company card */}
      {isVisible('company') && (
        <View style={[styles.bentoCard, styles.bentoCompany, shadows.md]}>
          <Text style={styles.bentoCompanyText}>{profile.company}</Text>
          {isVisible('location') && (
            <Text style={styles.bentoLocationText}>{profile.location}</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Helper to darken/lighten a color
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const styles = StyleSheet.create({
  // Base card styles
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: radii.xl,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardInner: {
    flex: 1,
    padding: spacing.xl,
  },

  // Classic styles
  classicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  classicInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: '#171717',
  },
  headline: {
    fontSize: typography.fontSize.sm,
    color: '#737373',
    marginTop: spacing.xs,
  },
  company: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  classicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactText: {
    fontSize: typography.fontSize.sm,
    color: '#525252',
    marginBottom: spacing.xs,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  // Modern styles
  modernContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modernLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  modernRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modernHeadline: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.sm,
  },
  modernCompany: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: spacing.md,
  },
  modernLocation: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },

  // Minimal styles
  minimalCard: {
    backgroundColor: '#FFFFFF',
  },
  minimalContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '300',
    color: '#171717',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  minimalHeadline: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  minimalDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginVertical: spacing.lg,
  },
  minimalDetail: {
    fontSize: typography.fontSize.sm,
    color: '#737373',
  },
  minimalQR: {
    marginTop: spacing.lg,
  },

  // Bento styles
  bentoContainer: {
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  bentoCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  bentoMain: {
    marginBottom: spacing.md,
  },
  bentoGradient: {
    padding: spacing.xl,
  },
  bentoName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bentoHeadline: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.sm,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bentoAvatar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoQR: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoScanText: {
    fontSize: typography.fontSize.xs,
    color: '#737373',
    marginTop: spacing.sm,
  },
  bentoCompany: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
  },
  bentoCompanyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#171717',
  },
  bentoLocationText: {
    fontSize: typography.fontSize.sm,
    color: '#737373',
    marginTop: spacing.xs,
  },
});


